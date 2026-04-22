/**
 * preload.cjs
 * Electron preload script - exposes safe IPC functions to renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, typed API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Get sub-app version
    getSubAppVersion: (appName) => ipcRenderer.invoke('get-subapp-version', appName),
  // App Info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  getPlatform: () => process.platform,
  
  // Window Controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // File Operations
  openFile: (options) => ipcRenderer.invoke('dialog-open-file', options),
  saveFile: (options) => ipcRenderer.invoke('dialog-save-file', options),
  readFile: (filePath) => ipcRenderer.invoke('file-read', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('file-write', filePath, data),
  
  // Audio Export
  exportAudio: (options) => ipcRenderer.invoke('export-audio', options),
  
  // Sub-app Launching
  launchSubApp: (appName, options) => ipcRenderer.invoke('launch-subapp', appName, options),
  
  // Check Sub-app Existence
  checkSubAppExists: (appName) => ipcRenderer.invoke('check-subapp-exists', appName),
  
  // Listeners
  onExportProgress: (callback) => {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on('export-progress', listener);
    return () => ipcRenderer.removeListener('export-progress', listener);
  },
  
  // Check if running in Electron
  isElectron: true
});
