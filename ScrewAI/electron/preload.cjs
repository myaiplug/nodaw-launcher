const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  backToLauncher: () => ipcRenderer.send('back-to-launcher'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isElectron: true
});
