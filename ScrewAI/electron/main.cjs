const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let shouldLaunchLauncher = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a2e',
      symbolColor: '#c084fc'
    },
    backgroundColor: '#0f0f1a',
    show: false
  });

  // Handle back to launcher
  ipcMain.on('back-to-launcher', () => {
    // In dev mode, spawn the launcher dev process
    if (process.env.VITE_DEV_SERVER_URL || !app.isPackaged) {
      const launcherDir = path.join(__dirname, '..', '..');
      spawn('npm', ['run', 'electron'], {
        cwd: launcherDir,
        shell: true,
        detached: true,
        stdio: 'ignore'
      }).unref();
      win.close();
    } else {
      shouldLaunchLauncher = true;
      win.close();
    }
  });

  ipcMain.on('window-close', () => {
    win.close();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL('http://localhost:5174');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    // Open DevTools for debugging
    win.webContents.openDevTools({ mode: 'detach' });
  });

  win.on('closed', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (shouldLaunchLauncher) {
    const fs = require('fs');
    const exePath = process.execPath;
    const exeDir = path.dirname(exePath);
    
    // Log for debugging
    const logPath = path.join(exeDir, 'back-debug.log');
    let log = `exePath: ${exePath}\nexeDir: ${exeDir}\n`;
    
    // Try multiple possible launcher locations
    const possiblePaths = [
      path.join(exeDir, '..', '..', '..', 'NoDAW Studio Suite.exe'),
      path.join(exeDir, '..', '..', 'NoDAW Studio Suite.exe'),
      path.join(exeDir, '..', 'NoDAW Studio Suite.exe'),
      path.join(exeDir, 'NoDAW Studio Suite.exe'),
    ];
    
    let found = false;
    for (const launcherPath of possiblePaths) {
      const normalizedPath = path.normalize(launcherPath);
      log += `Trying: ${normalizedPath} - `;
      if (fs.existsSync(normalizedPath)) {
        log += 'FOUND! Spawning...\n';
        fs.writeFileSync(logPath, log);
        spawn(normalizedPath, [], { 
          detached: true, 
          stdio: 'ignore' 
        }).unref();
        found = true;
        break;
      } else {
        log += 'not found\n';
      }
    }
    
    if (!found) {
      log += 'ERROR: No launcher found!\n';
      fs.writeFileSync(logPath, log);
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
