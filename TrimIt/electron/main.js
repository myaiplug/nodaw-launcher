const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
      webSecurity: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#2a2a2a',
        symbolColor: '#eeeeee'
    },
    backgroundColor: '#111111',
    show: false
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
