/**
 * preload.cjs
 * Electron preload script - exposes safe IPC functions to renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, typed API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
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
  launchSubApp: (appName) => ipcRenderer.invoke('launch-subapp', appName),
  
  // Listeners
  onExportProgress: (callback) => {
    ipcRenderer.on('export-progress', (event, progress) => callback(progress));
    return () => ipcRenderer.removeAllListeners('export-progress');
  },
  
  // Check if running in Electron
  isElectron: true
});
