/**
 * SplitItPanel.tsx
 * Launcher panel for StemSplit - AI Stem Separation
 * With self-troubleshooting and hardware detection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { useElectron } from '../hooks';

// GitHub release download URLs
const GITHUB_RELEASES = 'https://github.com/myaiplug/StemSplit1/releases/latest';
const WINDOWS_INSTALLER = 'https://github.com/myaiplug/StemSplit1/releases/download/v0.1.0/StemSplit_Setup_v0.1.0_x64_Online.exe';
const MACOS_INSTALLER = 'https://github.com/myaiplug/StemSplit1/releases/download/v0.1.0/StemSplit_Online_Setup.dmg';

// System requirements
const MIN_RAM_GB = 8;
const RECOMMENDED_RAM_GB = 16;
const MIN_DISK_SPACE_GB = 10;

// Diagnostic status types
interface SystemDiagnostics {
  platform: 'windows' | 'mac' | 'linux' | 'unknown';
  arch: string;
  cpuCores: number;
  ramGB: number;
  gpuInfo: GPUInfo | null;
  diskSpaceGB: number | null;
  isRunningAsAdmin: boolean;
  pythonInstalled: boolean;
  stemSplitInstalled: boolean;
  stemSplitPath: string | null;
  recommendations: string[];
  issues: DiagnosticIssue[];
}

interface GPUInfo {
  brand: 'nvidia' | 'amd' | 'intel' | 'apple' | 'unknown';
  name: string;
  vramMB: number | null;
  cudaCapable: boolean;
}

interface DiagnosticIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  fix?: string;
}

export const SplitItPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const { isElectron, launchSubApp } = useElectron();
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Hardware detection functions
  const detectPlatform = (): 'windows' | 'mac' | 'linux' | 'unknown' => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'windows';
    if (ua.includes('mac')) return 'mac';
    if (ua.includes('linux')) return 'linux';
    return 'unknown';
  };

  const detectArch = (): string => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('arm64') || ua.includes('aarch64')) return 'arm64';
    if (ua.includes('x64') || ua.includes('x86_64') || ua.includes('win64')) return 'x64';
    if (ua.includes('x86') || ua.includes('i686')) return 'x86';
    return 'unknown';
  };

  const runSystemDiagnostics = useCallback(async (): Promise<SystemDiagnostics> => {
    const platform = detectPlatform();
    const arch = detectArch();
    const issues: DiagnosticIssue[] = [];
    const recommendations: string[] = [];

    // Get hardware cores (navigator.hardwareConcurrency)
    const cpuCores = navigator.hardwareConcurrency || 4;

    // Estimate RAM via deviceMemory API (Chrome only, returns GB)
    const ramGB = (navigator as any).deviceMemory || 8;

    // Detect GPU info via WebGL
    let gpuInfo: GPUInfo | null = null;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const rendererLower = renderer.toLowerCase();
          
          let brand: GPUInfo['brand'] = 'unknown';
          let cudaCapable = false;
          
          if (rendererLower.includes('nvidia') || rendererLower.includes('geforce') || rendererLower.includes('rtx') || rendererLower.includes('gtx')) {
            brand = 'nvidia';
            cudaCapable = true;
          } else if (rendererLower.includes('amd') || rendererLower.includes('radeon')) {
            brand = 'amd';
          } else if (rendererLower.includes('intel')) {
            brand = 'intel';
          } else if (rendererLower.includes('apple') || rendererLower.includes('m1') || rendererLower.includes('m2') || rendererLower.includes('m3')) {
            brand = 'apple';
          }

          gpuInfo = {
            brand,
            name: renderer,
            vramMB: null, // Can't detect via WebGL
            cudaCapable
          };
        }
      }
    } catch (e) {
      console.warn('GPU detection failed:', e);
    }

    // Check for StemSplit installation via Electron IPC
    let stemSplitInstalled = false;
    let stemSplitPath: string | null = null;
    let pythonInstalled = false;

    if (isElectron && window.electronAPI) {
      try {
        // Try to check if StemSplit exists
        const checkResult = await window.electronAPI.checkSubAppExists?.('StemSplit');
        if (checkResult) {
          stemSplitInstalled = checkResult.exists;
          stemSplitPath = checkResult.path || null;
        }
      } catch (e) {
        console.warn('StemSplit check failed:', e);
      }
    }

    // Build recommendations based on hardware
    if (gpuInfo?.cudaCapable) {
      recommendations.push('Your NVIDIA GPU supports CUDA acceleration. StemSplit will automatically use GPU processing for faster stem separation.');
    } else if (gpuInfo?.brand === 'apple') {
      recommendations.push('Your Apple Silicon GPU will be used for Metal acceleration on macOS.');
    } else if (gpuInfo?.brand === 'amd') {
      recommendations.push('AMD GPU detected. StemSplit will use CPU processing (AMD ROCm support coming soon).');
    } else {
      recommendations.push('No dedicated GPU detected. StemSplit will use CPU-only processing, which may be slower.');
    }

    if (cpuCores >= 8) {
      recommendations.push(`${cpuCores} CPU cores detected. Excellent for parallel audio processing.`);
    } else if (cpuCores >= 4) {
      recommendations.push(`${cpuCores} CPU cores detected. Good for audio processing.`);
    }

    // Check system requirements
    if (ramGB < MIN_RAM_GB) {
      issues.push({
        severity: 'error',
        code: 'LOW_RAM',
        message: `Only ${ramGB}GB RAM detected. Minimum ${MIN_RAM_GB}GB required.`,
        fix: 'Close other applications before running StemSplit, or upgrade RAM.'
      });
    } else if (ramGB < RECOMMENDED_RAM_GB) {
      issues.push({
        severity: 'warning',
        code: 'MODERATE_RAM',
        message: `${ramGB}GB RAM detected. ${RECOMMENDED_RAM_GB}GB recommended for best performance.`,
        fix: 'Processing large files may be slower. Consider closing other applications.'
      });
    }

    if (!stemSplitInstalled) {
      issues.push({
        severity: 'error',
        code: 'NOT_INSTALLED',
        message: 'StemSplit is not installed.',
        fix: 'Download and install StemSplit from the link below.'
      });
    }

    if (platform === 'unknown') {
      issues.push({
        severity: 'warning',
        code: 'UNKNOWN_PLATFORM',
        message: 'Unable to detect your operating system.',
        fix: 'Manually select your platform to download the correct installer.'
      });
    }

    return {
      platform,
      arch,
      cpuCores,
      ramGB,
      gpuInfo,
      diskSpaceGB: null, // Can't detect via browser
      isRunningAsAdmin: false, // Can't detect via browser
      pythonInstalled,
      stemSplitInstalled,
      stemSplitPath,
      recommendations,
      issues
    };
  }, [isElectron]);

  const handleRunDiagnostics = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setScanProgress(prev => Math.min(prev + 15, 90));
    }, 200);

    try {
      const result = await runSystemDiagnostics();
      setDiagnostics(result);
      setScanProgress(100);
    } catch (e) {
      console.error('Diagnostics failed:', e);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setIsScanning(false), 500);
    }
  };

  const handleLaunch = async () => {
    if (!isElectron) {
      setShowInstallPrompt(true);
      return;
    }

    setIsLaunching(true);
    setError(null);

    try {
      const result = await launchSubApp('StemSplit');
      if (!result.success) {
        // If launch fails, show troubleshooter
        if (result.error?.includes('not found') || result.error?.includes('ENOENT')) {
          setShowTroubleshooter(true);
          handleRunDiagnostics();
        } else {
          setError(result.error || 'Failed to launch StemSplit');
        }
      }
    } catch (e) {
      setShowTroubleshooter(true);
      handleRunDiagnostics();
    } finally {
      setIsLaunching(false);
    }
  };

  const openDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const getGPUBadge = (gpu: GPUInfo | null) => {
    if (!gpu) return { icon: '❓', label: 'Unknown GPU', color: 'text-slate-400' };
    switch (gpu.brand) {
      case 'nvidia':
        return { icon: '🟢', label: `NVIDIA ${gpu.name.split('NVIDIA ')[1] || gpu.name}`, color: 'text-green-400' };
      case 'amd':
        return { icon: '🔴', label: `AMD ${gpu.name.split('AMD ')[1] || gpu.name}`, color: 'text-red-400' };
      case 'intel':
        return { icon: '🔵', label: `Intel ${gpu.name.split('Intel ')[1] || gpu.name}`, color: 'text-blue-400' };
      case 'apple':
        return { icon: '⚪', label: `Apple ${gpu.name.split('Apple ')[1] || gpu.name}`, color: 'text-slate-300' };
      default:
        return { icon: '❓', label: gpu.name, color: 'text-slate-400' };
    }
  };

  const getSeverityIcon = (severity: DiagnosticIssue['severity']) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  const features = [
    { icon: '🎤', title: 'Vocals', desc: 'Isolate clean vocals from any track' },
    { icon: '🥁', title: 'Drums', desc: 'Extract drum stems perfectly' },
    { icon: '🎸', title: 'Bass', desc: 'Separate bass lines with precision' },
    { icon: '🎹', title: 'Other', desc: 'Get remaining instruments' },
    { icon: '🎧', title: 'High Quality', desc: 'AI-powered separation using Demucs' },
    { icon: '📦', title: 'Batch Mode', desc: 'Process multiple files at once' },
  ];

  // Render Troubleshooter Panel
  const renderTroubleshooter = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 p-6 rounded-xl border ${
        isDark
          ? 'bg-slate-800/80 border-slate-700'
          : 'bg-white border-slate-200 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>🔧</span>
          System Diagnostics
        </h3>
        <button
          onClick={() => setShowTroubleshooter(false)}
          className={`text-sm ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}
        >
          ✕
        </button>
      </div>

      {isScanning ? (
        <div className="py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >
              ⚙️
            </motion.div>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Scanning system...
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      ) : diagnostics ? (
        <div className="space-y-4">
          {/* Hardware Summary */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
            <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              Hardware Detected
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span>💻</span>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {diagnostics.platform.charAt(0).toUpperCase() + diagnostics.platform.slice(1)} ({diagnostics.arch})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🧠</span>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {diagnostics.cpuCores} CPU Cores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>💾</span>
                <span className={diagnostics.ramGB >= MIN_RAM_GB 
                  ? (isDark ? 'text-green-400' : 'text-green-600')
                  : (isDark ? 'text-red-400' : 'text-red-600')
                }>
                  {diagnostics.ramGB}GB RAM
                </span>
              </div>
              <div className="flex items-center gap-2">
                {diagnostics.gpuInfo ? (
                  <>
                    <span>{getGPUBadge(diagnostics.gpuInfo).icon}</span>
                    <span className={`truncate ${getGPUBadge(diagnostics.gpuInfo).color}`}>
                      {diagnostics.gpuInfo.brand.toUpperCase()}
                      {diagnostics.gpuInfo.cudaCapable && ' (CUDA)'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>❓</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>No GPU detected</span>
                  </>
                )}
              </div>
            </div>

            {/* GPU Details */}
            {diagnostics.gpuInfo && (
              <div className={`mt-3 pt-3 border-t text-xs ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                Full GPU: {diagnostics.gpuInfo.name}
              </div>
            )}
          </div>

          {/* Issues */}
          {diagnostics.issues.length > 0 && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Issues Found ({diagnostics.issues.length})
              </h4>
              <div className="space-y-3">
                {diagnostics.issues.map((issue, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-start gap-2">
                      <span>{getSeverityIcon(issue.severity)}</span>
                      <div>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{issue.message}</span>
                        {issue.fix && (
                          <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            💡 {issue.fix}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {diagnostics.recommendations.length > 0 && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                System Recommendations
              </h4>
              <ul className="space-y-2 text-sm">
                {diagnostics.recommendations.map((rec, i) => (
                  <li key={i} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Installation Status */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
            <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              StemSplit Status
            </h4>
            <div className="flex items-center gap-2">
              {diagnostics.stemSplitInstalled ? (
                <>
                  <span className="text-green-500">✓</span>
                  <span className={isDark ? 'text-green-400' : 'text-green-600'}>
                    Installed at: {diagnostics.stemSplitPath}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-red-500">✗</span>
                  <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                    Not installed
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {!diagnostics.stemSplitInstalled && (
              <motion.button
                onClick={() => openDownload(diagnostics.platform === 'mac' ? MACOS_INSTALLER : WINDOWS_INSTALLER)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                ⬇️ Download StemSplit
              </motion.button>
            )}
            <button
              onClick={handleRunDiagnostics}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              🔄 Re-scan
            </button>
            <button
              onClick={() => openDownload(GITHUB_RELEASES)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                isDark
                  ? 'text-cyan-400 hover:text-cyan-300'
                  : 'text-cyan-600 hover:text-cyan-700'
              }`}
            >
              View GitHub Releases
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Run diagnostics to check system compatibility and StemSplit installation status.
          </p>
          <motion.button
            onClick={handleRunDiagnostics}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isDark
                ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            🔍 Start System Scan
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-7xl mb-4"
        >
          🎵
        </motion.div>
        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          StemSplit
        </h2>
        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          AI-Powered Stem Separation
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {feature.title}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {feature.desc}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Launch Button */}
      <div className="text-center">
        <motion.button
          onClick={handleLaunch}
          disabled={isLaunching}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            px-8 py-4 rounded-xl font-bold text-lg
            transition-all shadow-lg
            ${isLaunching
              ? isDark
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : 'bg-slate-200 text-slate-400 cursor-wait'
              : isDark
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }
          `}
        >
          {isLaunching ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⏳
              </motion.span>
              Launching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🚀</span>
              Open StemSplit
            </span>
          )}
        </motion.button>

        {/* Troubleshoot Button */}
        <motion.button
          onClick={() => {
            setShowTroubleshooter(true);
            if (!diagnostics) handleRunDiagnostics();
          }}
          whileHover={{ scale: 1.02 }}
          className={`mt-3 px-4 py-2 rounded-lg text-sm transition-all ${
            isDark
              ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔧 Troubleshoot / System Check
        </motion.button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-500 text-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Troubleshooter Panel */}
        <AnimatePresence>
          {showTroubleshooter && renderTroubleshooter()}
        </AnimatePresence>

        {/* Install Prompt Modal */}
        <AnimatePresence>
        {showInstallPrompt && !showTroubleshooter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-6 rounded-xl border ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200 shadow-lg'
            }`}
          >
            <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📦 Install StemSplit
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              StemSplit is a standalone AI audio separation app. Download and install it to use stem separation features.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {detectPlatform() === 'windows' ? (
                <motion.button
                  onClick={() => openDownload(WINDOWS_INSTALLER)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>⬇️</span>
                    Download for Windows
                  </span>
                </motion.button>
              ) : detectPlatform() === 'mac' ? (
                <motion.button
                  onClick={() => openDownload(MACOS_INSTALLER)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>⬇️</span>
                    Download for macOS
                  </span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => openDownload(WINDOWS_INSTALLER)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Windows
                  </motion.button>
                  <motion.button
                    onClick={() => openDownload(MACOS_INSTALLER)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isDark
                        ? 'bg-slate-600 hover:bg-slate-500 text-white'
                        : 'bg-slate-500 hover:bg-slate-600 text-white'
                    }`}
                  >
                    macOS
                  </motion.button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => openDownload(GITHUB_RELEASES)}
                className={`text-sm underline ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
              >
                View all releases on GitHub
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className={`text-sm ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {!showInstallPrompt && !showTroubleshooter && (
          <p className={`mt-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Opens in a separate window
          </p>
        )}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-8 p-6 rounded-xl border ${
          isDark
            ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30'
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
        }`}
      >
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          How it works
        </h3>
        <ol className={`list-decimal list-inside space-y-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <li>Drop your audio file into StemSplit</li>
          <li>Select which stems you want to extract (vocals, drums, bass, other)</li>
          <li>Click process and wait for AI magic</li>
          <li>Download individual stems or the full package</li>
        </ol>
      </motion.div>
    </div>
  );
};

export default SplitItPanel;
