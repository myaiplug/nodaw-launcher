const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const pngToIco = require('png-to-ico');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(__dirname, '../image_to_icon_converter.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this tool
      webSecurity: false
    },
    titleBarStyle: 'hidden', // Keep hidden to handle transparency correctly on some systems, but with frame: false it's cleaner
    frame: false, // Frameless
    transparent: true, // Transparent background
    hasShadow: false, // Remove default OS shadow to prevent artifacts
    resizable: false,
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

  // Window Controls
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-close', () => win.close());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-icon', async (event, pngBuffer) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save Icon',
        defaultPath: 'icon.ico',
        filters: [{ name: 'Icon', extensions: ['ico'] }]
    });

    if (filePath) {
        try {
            // pngToIco typical usage expects file path. Let's write a temp file.
            const tempPng = path.join(app.getPath('temp'), 'temp_icon_genius.png');
            const buf = Buffer.from(pngBuffer);
            fs.writeFileSync(tempPng, buf);

            const icoBuf = await pngToIco(tempPng);
            fs.writeFileSync(filePath, icoBuf);
            
            // Cleanup
            fs.unlinkSync(tempPng);
            
            return { success: true, path: filePath };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Cancelled' };
});
