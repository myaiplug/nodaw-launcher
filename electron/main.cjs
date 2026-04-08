const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

let viteProcess = null;
const DEV_PORT = 3001;
const DEV_URL = `http://localhost:${DEV_PORT}`;

function checkServerReady(url, maxAttempts = 30) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode === 200) resolve(true);
        else retry();
      });
      req.on('error', retry);
      req.setTimeout(1000, retry);
    };
    const retry = () => {
      attempts++;
      if (attempts >= maxAttempts) resolve(false);
      else setTimeout(check, 500);
    };
    check();
  });
}

async function ensureDevServer() {
  // Check if server is already running
  const ready = await checkServerReady(DEV_URL, 2);
  if (ready) return true;

  console.log('[NoDAW] Starting Vite dev server...');
  viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    stdio: 'inherit'
  });

  viteProcess.on('error', (err) => {
    console.error('[NoDAW] Failed to start dev server:', err);
  });

  // Wait for server to be ready
  const serverReady = await checkServerReady(DEV_URL, 60);
  if (!serverReady) {
    console.error('[NoDAW] Dev server failed to start within timeout');
    return false;
  }
  console.log('[NoDAW] Dev server ready');
  return true;
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '../nodaw.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    title: "NoDAW Studio Suite",
    frame: true,
    titleBarStyle: 'default'
  });

  // Check if we are in development mode based on execution argument or environment
  const isDev = !app.isPackaged;

  if (isDev) {
    // Auto-start dev server if needed
    const serverOk = await ensureDevServer();
    if (!serverOk) {
      console.error('[NoDAW] Cannot start without dev server');
      app.quit();
      return;
    }
    win.loadURL(DEV_URL);
    // DevTools: Press F12 or Ctrl+Shift+I to open manually
  } else {
    // Load the built index.html in production
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  win.setMenuBarVisibility(false); // Clean look
}

app.whenReady().then(() => {
  createWindow();
  
  // === App Info ===
  ipcMain.handle('get-app-info', () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node
  }));

  // === Window Controls ===
  ipcMain.on('window-minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  
  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });
  
  ipcMain.on('window-close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  // === File Dialogs ===
  ipcMain.handle('dialog-open-file', async (event, options = {}) => {
    const defaults = {
      title: 'Open Audio File',
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    };
    
    const result = await dialog.showOpenDialog({
      ...defaults,
      ...options
    });
    
    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }
    
    return { 
      canceled: false, 
      filePath: result.filePaths[0],
      filePaths: result.filePaths
    };
  });
  
  ipcMain.handle('dialog-save-file', async (event, options = {}) => {
    const defaults = {
      title: 'Save Audio File',
      filters: [
        { name: 'WAV Audio', extensions: ['wav'] },
        { name: 'MP3 Audio', extensions: ['mp3'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    };
    
    const result = await dialog.showSaveDialog({
      ...defaults,
      ...options
    });
    
    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }
    
    return { 
      canceled: false, 
      filePath: result.filePath 
    };
  });

  // === File Operations ===
  ipcMain.handle('file-read', async (event, filePath) => {
    try {
      const data = await fs.promises.readFile(filePath);
      return { success: true, data: data.buffer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('file-write', async (event, filePath, data) => {
    try {
      await fs.promises.writeFile(filePath, Buffer.from(data));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // === Audio Export ===
  ipcMain.handle('export-audio', async (event, options) => {
    const { data, format, defaultName } = options;
    
    const filterMap = {
      wav: { name: 'WAV Audio', extensions: ['wav'] },
      mp3: { name: 'MP3 Audio', extensions: ['mp3'] },
      ogg: { name: 'OGG Audio', extensions: ['ogg'] },
      flac: { name: 'FLAC Audio', extensions: ['flac'] }
    };
    
    const result = await dialog.showSaveDialog({
      title: 'Export Audio',
      defaultPath: defaultName || `export.${format}`,
      filters: [filterMap[format] || { name: 'Audio', extensions: [format] }]
    });
    
    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }
    
    try {
      await fs.promises.writeFile(result.filePath, Buffer.from(data));
      // Open the folder containing the file
      shell.showItemInFolder(result.filePath);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // === Sub-app Launching ===
  ipcMain.handle('launch-subapp', async (event, appPath) => {
    const subAppPaths = {
      'TrimIt': path.join(__dirname, '..', 'TrimIt'),
      'IconGenius': path.join(__dirname, '..', 'IconGenius')
    };
    
    const appDir = subAppPaths[appPath];
    if (!appDir) {
      return { success: false, error: 'Unknown app' };
    }
    
    try {
      // Try to launch the sub-app's electron build or dev server
      const isDev = !app.isPackaged;
      if (isDev) {
        // In dev, run npm run dev in sub-app directory and open browser
        const subProcess = spawn('npm', ['run', 'electron:dev'], {
          cwd: appDir,
          shell: true,
          detached: true,
          stdio: 'ignore'
        });
        subProcess.unref();
      } else {
        // In production, launch the built executable
        const exeName = appPath === 'TrimIt' ? 'TrimIt.exe' : 'Icon Genius.exe';
        const exePath = path.join(appDir, 'dist_electron', 'win-unpacked', exeName);
        spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  // Clean up dev server if we spawned it
  if (viteProcess) {
    viteProcess.kill();
  }
});
