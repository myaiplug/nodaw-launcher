/**
 * ElectronAPI Type Definitions and Hook
 * Provides type-safe access to Electron IPC from renderer
 */

// === Type Definitions ===

interface AppInfo {
  name: string;
  version: string;
  platform: NodeJS.Platform;
  arch: string;
  electronVersion: string;
  nodeVersion: string;
}

interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: string[];
}

interface OpenDialogResult {
  canceled: boolean;
  filePath?: string;
  filePaths?: string[];
}

interface SaveDialogResult {
  canceled: boolean;
  filePath?: string;
}

interface FileReadResult {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
}

interface FileWriteResult {
  success: boolean;
  error?: string;
}

interface ExportAudioOptions {
  data: ArrayBuffer;
  format: 'wav' | 'mp3' | 'ogg' | 'flac';
  defaultName?: string;
}

interface ExportAudioResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  error?: string;
}

export interface ElectronAPI {
  // App info
  getAppInfo: () => Promise<AppInfo>;
  getPlatform: () => NodeJS.Platform;
  
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // File dialogs
  openFile: (options?: FileDialogOptions) => Promise<OpenDialogResult>;
  saveFile: (options?: FileDialogOptions) => Promise<SaveDialogResult>;
  
  // File operations
  readFile: (path: string) => Promise<FileReadResult>;
  writeFile: (path: string, data: ArrayBuffer) => Promise<FileWriteResult>;
  
  // Audio export
  exportAudio: (options: ExportAudioOptions) => Promise<ExportAudioResult>;
  onExportProgress: (callback: (progress: number) => void) => () => void;
  
  // Sub-app launching
  launchSubApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
  
  // Sub-app existence check
  checkSubAppExists: (appName: string) => Promise<{ exists: boolean; path?: string; error?: string }>;
  
  // Environment flag
  isElectron: boolean;
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// === Hook ===

/**
 * Hook to access Electron API with fallbacks for browser environment
 */
export function useElectron() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
  const api = window.electronAPI;
  
  return {
    isElectron,
    
    // App info
    getAppInfo: async (): Promise<AppInfo | null> => {
      if (!api) return null;
      return api.getAppInfo();
    },
    
    getPlatform: (): NodeJS.Platform | 'browser' => {
      return api?.getPlatform() ?? 'browser';
    },
    
    // Window controls (no-op in browser)
    minimizeWindow: () => api?.minimizeWindow(),
    maximizeWindow: () => api?.maximizeWindow(),
    closeWindow: () => api?.closeWindow(),
    
    // File operations with browser fallbacks
    openFile: async (options?: FileDialogOptions): Promise<OpenDialogResult> => {
      if (api) {
        return api.openFile(options);
      }
      
      // Browser fallback using input element
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            resolve({ canceled: false, filePath: file.name });
          } else {
            resolve({ canceled: true });
          }
        };
        
        input.oncancel = () => resolve({ canceled: true });
        input.click();
      });
    },
    
    saveFile: async (options?: FileDialogOptions): Promise<SaveDialogResult> => {
      if (api) {
        return api.saveFile(options);
      }
      // Browser can't save to arbitrary paths
      return { canceled: true };
    },
    
    readFile: async (path: string): Promise<FileReadResult> => {
      if (api) {
        return api.readFile(path);
      }
      return { success: false, error: 'Not available in browser' };
    },
    
    writeFile: async (path: string, data: ArrayBuffer): Promise<FileWriteResult> => {
      if (api) {
        return api.writeFile(path, data);
      }
      return { success: false, error: 'Not available in browser' };
    },
    
    // Export audio (uses download in browser)
    exportAudio: async (options: ExportAudioOptions): Promise<ExportAudioResult> => {
      if (api) {
        return api.exportAudio(options);
      }
      
      // Browser fallback: trigger download
      try {
        const blob = new Blob([options.data], { 
          type: `audio/${options.format}` 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = options.defaultName || `export.${options.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    
    // Sub-app launching (not available in browser)
    launchSubApp: async (appName: string) => {
      if (api) {
        return api.launchSubApp(appName);
      }
      return { success: false, error: 'Not available in browser' };
    },
    
    // Check if sub-app exists
    checkSubAppExists: async (appName: string) => {
      if (api?.checkSubAppExists) {
        return api.checkSubAppExists(appName);
      }
      return { exists: false, error: 'Not available in browser' };
    },
  };
}

export default useElectron;
