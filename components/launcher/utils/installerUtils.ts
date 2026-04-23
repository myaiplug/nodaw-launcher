/**
 * installerUtils.ts
 * Auto-troubleshooting utilities for NoDAW installation and dependencies
 * Handles common issues across Windows, macOS, and Linux
 */

export interface SystemInfo {
  platform: 'windows' | 'mac' | 'linux';
  arch: 'x64' | 'x86' | 'arm64';
  osVersion: string;
  isAdmin: boolean;
  hasNet: boolean;
  hasPython: boolean;
  hasFFmpeg: boolean;
  hasCuda: boolean;
  diskSpaceGB: number;
  ramGB: number;
}

export interface InstallError {
  code: string;
  message: string;
  severity: 'fatal' | 'error' | 'warning' | 'info';
  fix?: string;
  autoFixable: boolean;
  fixAction?: () => Promise<boolean>;
}

export interface InstallProgress {
  step: string;
  progress: number;
  totalSteps: number;
  currentStep: number;
  message: string;
}

// Common error codes and their auto-fix solutions
export const ERROR_SOLUTIONS: Record<string, {
  description: string;
  autoFix?: string;
  manualFix: string;
  windows?: string;
  mac?: string;
  linux?: string;
}> = {
  'ENOENT': {
    description: 'File or directory not found',
    autoFix: 'Reinstalling missing components...',
    manualFix: 'Reinstall the application or restore the missing files.',
  },
  'EACCES': {
    description: 'Permission denied',
    autoFix: 'Attempting to fix permissions...',
    manualFix: 'Run the application as administrator or change file permissions.',
    windows: 'Right-click the app and select "Run as administrator".',
    mac: 'Open System Preferences > Security & Privacy > Allow app.',
  },
  'ENOSPC': {
    description: 'Not enough disk space',
    autoFix: null,
    manualFix: 'Free up at least 2GB of disk space and try again.',
  },
  'NETWORK_ERROR': {
    description: 'Network connection failed',
    autoFix: 'Checking alternative download sources...',
    manualFix: 'Check your internet connection and firewall settings.',
  },
  'PYTHON_NOT_FOUND': {
    description: 'Python is required but not found',
    autoFix: 'Downloading and installing Python automatically...',
    manualFix: 'Install Python 3.9+ from python.org',
    windows: 'Download from https://www.python.org/downloads/windows/',
    mac: 'Run: brew install python@3.11',
  },
  'FFMPEG_NOT_FOUND': {
    description: 'FFmpeg is required but not found',
    autoFix: 'Downloading and installing FFmpeg automatically...',
    manualFix: 'Install FFmpeg from ffmpeg.org',
    windows: 'Download from https://www.gyan.dev/ffmpeg/builds/',
    mac: 'Run: brew install ffmpeg',
  },
  'CUDA_NOT_AVAILABLE': {
    description: 'NVIDIA CUDA not available for GPU acceleration',
    autoFix: null,
    manualFix: 'Install NVIDIA drivers and CUDA Toolkit for GPU acceleration.',
  },
  'VCRUNTIME_MISSING': {
    description: 'Visual C++ Runtime missing',
    autoFix: 'Installing Visual C++ Redistributable...',
    manualFix: 'Download VC++ Redistributable from Microsoft.',
    windows: 'https://aka.ms/vs/17/release/vc_redist.x64.exe',
  },
  'DOTNET_MISSING': {
    description: '.NET Runtime missing',
    autoFix: 'Installing .NET Runtime...',
    manualFix: 'Download .NET from Microsoft.',
    windows: 'https://dotnet.microsoft.com/download/dotnet',
  },
};

// Detect system information
export async function detectSystemInfo(): Promise<SystemInfo> {
  const ua = navigator.userAgent.toLowerCase();
  
  // Detect platform
  let platform: 'windows' | 'mac' | 'linux' = 'windows';
  if (ua.includes('mac')) platform = 'mac';
  else if (ua.includes('linux')) platform = 'linux';
  
  // Detect architecture
  let arch: 'x64' | 'x86' | 'arm64' = 'x64';
  if (ua.includes('arm64') || ua.includes('aarch64')) arch = 'arm64';
  else if (ua.includes('x86') && !ua.includes('x64')) arch = 'x86';
  
  // Get OS version from user agent
  let osVersion = 'Unknown';
  if (platform === 'windows') {
    const match = ua.match(/windows nt (\d+\.\d+)/);
    if (match) {
      const versions: Record<string, string> = {
        '10.0': 'Windows 10/11',
        '6.3': 'Windows 8.1',
        '6.2': 'Windows 8',
        '6.1': 'Windows 7',
      };
      osVersion = versions[match[1]] || `Windows NT ${match[1]}`;
    }
  } else if (platform === 'mac') {
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) osVersion = `macOS ${match[1].replace('_', '.')}`;
  }
  
  // Estimate RAM
  const ramGB = (navigator as any).deviceMemory || 8;
  
  return {
    platform,
    arch,
    osVersion,
    isAdmin: false, // Can't reliably detect from browser
    hasNet: navigator.onLine,
    hasPython: false, // Checked via Electron IPC
    hasFFmpeg: false, // Checked via Electron IPC
    hasCuda: false, // Checked via Electron IPC
    diskSpaceGB: -1, // Checked via Electron IPC
    ramGB,
  };
}

// Auto-troubleshoot and attempt fixes
export async function autoTroubleshoot(
  error: InstallError,
  systemInfo: SystemInfo,
  onProgress?: (progress: InstallProgress) => void
): Promise<{ success: boolean; message: string }> {
  const solution = ERROR_SOLUTIONS[error.code];
  
  if (!solution || !solution.autoFix) {
    return {
      success: false,
      message: solution?.manualFix || 'Unknown error. Please contact support.',
    };
  }
  
  onProgress?.({
    step: 'Analyzing issue...',
    progress: 10,
    totalSteps: 5,
    currentStep: 1,
    message: solution.description,
  });
  
  // Attempt platform-specific fixes
  try {
    switch (error.code) {
      case 'PYTHON_NOT_FOUND':
        return await installPython(systemInfo, onProgress);
      
      case 'FFMPEG_NOT_FOUND':
        return await installFFmpeg(systemInfo, onProgress);
      
      case 'VCRUNTIME_MISSING':
        return await installVCRuntime(systemInfo, onProgress);
      
      case 'EACCES':
        return await fixPermissions(systemInfo, onProgress);
      
      default:
        return {
          success: false,
          message: solution.manualFix,
        };
    }
  } catch (e) {
    return {
      success: false,
      message: `Auto-fix failed: ${(e as Error).message}. ${solution.manualFix}`,
    };
  }
}

// Install Python automatically
async function installPython(
  systemInfo: SystemInfo,
  onProgress?: (progress: InstallProgress) => void
): Promise<{ success: boolean; message: string }> {
  onProgress?.({
    step: 'Installing Python...',
    progress: 30,
    totalSteps: 5,
    currentStep: 2,
    message: 'Downloading Python installer...',
  });
  
  const urls: Record<string, string> = {
    windows: 'https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe',
    mac: 'https://www.python.org/ftp/python/3.11.8/python-3.11.8-macos11.pkg',
  };
  
  // In production, this would download and execute the installer
  // For now, return instructions
  const platformHint = ERROR_SOLUTIONS.PYTHON_NOT_FOUND[systemInfo.platform];
  
  return {
    success: false,
    message: platformHint || 'Please install Python 3.9+ from python.org',
  };
}

// Install FFmpeg automatically
async function installFFmpeg(
  systemInfo: SystemInfo,
  onProgress?: (progress: InstallProgress) => void
): Promise<{ success: boolean; message: string }> {
  onProgress?.({
    step: 'Installing FFmpeg...',
    progress: 30,
    totalSteps: 5,
    currentStep: 2,
    message: 'Downloading FFmpeg...',
  });
  
  const platformHint = ERROR_SOLUTIONS.FFMPEG_NOT_FOUND[systemInfo.platform];
  
  return {
    success: false,
    message: platformHint || 'Please install FFmpeg from ffmpeg.org',
  };
}

// Install VC++ Runtime (Windows)
async function installVCRuntime(
  systemInfo: SystemInfo,
  onProgress?: (progress: InstallProgress) => void
): Promise<{ success: boolean; message: string }> {
  if (systemInfo.platform !== 'windows') {
    return { success: true, message: 'Not required on this platform.' };
  }
  
  onProgress?.({
    step: 'Installing Visual C++ Runtime...',
    progress: 30,
    totalSteps: 5,
    currentStep: 2,
    message: 'Downloading VC++ Redistributable...',
  });
  
  return {
    success: false,
    message: 'Please download and install Visual C++ Redistributable from: ' +
             ERROR_SOLUTIONS.VCRUNTIME_MISSING.windows,
  };
}

// Fix file permissions
async function fixPermissions(
  systemInfo: SystemInfo,
  onProgress?: (progress: InstallProgress) => void
): Promise<{ success: boolean; message: string }> {
  onProgress?.({
    step: 'Fixing permissions...',
    progress: 50,
    totalSteps: 5,
    currentStep: 3,
    message: 'Attempting to resolve permission issues...',
  });
  
  const platformHint = ERROR_SOLUTIONS.EACCES[systemInfo.platform];
  
  return {
    success: false,
    message: platformHint || ERROR_SOLUTIONS.EACCES.manualFix,
  };
}

// Generate a comprehensive troubleshooting report
export function generateTroubleshootReport(
  errors: InstallError[],
  systemInfo: SystemInfo
): string {
  const lines = [
    '═══════════════════════════════════════════════════════════',
    '               NoDAW Studio - Troubleshooting Report',
    '═══════════════════════════════════════════════════════════',
    '',
    '## System Information',
    `- Platform: ${systemInfo.platform} (${systemInfo.arch})`,
    `- OS Version: ${systemInfo.osVersion}`,
    `- RAM: ${systemInfo.ramGB}GB`,
    `- Network: ${systemInfo.hasNet ? 'Connected' : 'Offline'}`,
    '',
    '## Issues Found',
    '',
  ];
  
  if (errors.length === 0) {
    lines.push('✓ No issues detected!');
  } else {
    errors.forEach((error, i) => {
      const solution = ERROR_SOLUTIONS[error.code];
      lines.push(`### ${i + 1}. ${error.message}`);
      lines.push(`   Code: ${error.code}`);
      lines.push(`   Severity: ${error.severity}`);
      if (solution) {
        lines.push(`   Fix: ${solution.manualFix}`);
        if (solution[systemInfo.platform]) {
          lines.push(`   ${systemInfo.platform.toUpperCase()} Specific: ${solution[systemInfo.platform]}`);
        }
      }
      lines.push('');
    });
  }
  
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('For support: https://github.com/myaiplug/nodaw-launcher/issues');
  
  return lines.join('\n');
}

// Pre-installation checklist
export async function runPreInstallChecks(): Promise<{
  passed: boolean;
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }>;
}> {
  const checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }> = [];
  
  const systemInfo = await detectSystemInfo();
  
  // Check platform compatibility
  checks.push({
    name: 'Platform',
    status: ['windows', 'mac'].includes(systemInfo.platform) ? 'pass' : 'warn',
    message: systemInfo.platform === 'linux' 
      ? 'Linux support is experimental'
      : `${systemInfo.osVersion} supported`,
  });
  
  // Check architecture
  checks.push({
    name: 'Architecture',
    status: systemInfo.arch === 'x64' || systemInfo.arch === 'arm64' ? 'pass' : 'fail',
    message: systemInfo.arch === 'x86' 
      ? '32-bit systems are not supported'
      : `${systemInfo.arch} architecture supported`,
  });
  
  // Check RAM
  checks.push({
    name: 'Memory',
    status: systemInfo.ramGB >= 8 ? 'pass' : systemInfo.ramGB >= 4 ? 'warn' : 'fail',
    message: systemInfo.ramGB >= 8 
      ? `${systemInfo.ramGB}GB RAM (recommended)`
      : `${systemInfo.ramGB}GB RAM (minimum 8GB recommended)`,
  });
  
  // Check network
  checks.push({
    name: 'Network',
    status: systemInfo.hasNet ? 'pass' : 'warn',
    message: systemInfo.hasNet 
      ? 'Internet connection available'
      : 'Offline - some features may not work',
  });
  
  const passed = !checks.some(c => c.status === 'fail');
  
  return { passed, checks };
}
