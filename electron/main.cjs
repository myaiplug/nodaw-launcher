const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const http = require('http');
const os = require('os');

let viteProcess = null;
const DEV_PORT = 3001;
const DEV_URL = `http://localhost:${DEV_PORT}`;

function isSafeExternalUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isAllowedNavigationUrl(rawUrl, isDev) {
  try {
    const parsed = new URL(rawUrl);
    if (isDev) {
      const devOrigin = new URL(DEV_URL).origin;
      return parsed.origin === devOrigin;
    }
    return parsed.protocol === 'file:';
  } catch {
    return false;
  }
}

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
  // Check if server is already running (give it more attempts)
  const ready = await checkServerReady(DEV_URL, 10);
  if (ready) {
    console.log('[NoDAW] Dev server already running on', DEV_URL);
    return true;
  }

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
  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '../nodaw.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev,
      preload: path.join(__dirname, 'preload.cjs')
    },
    title: "NoDAW Studio Suite",
    frame: true,
    titleBarStyle: 'default'
  });

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

  // Block untrusted window creation and route trusted links through the OS browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigationUrl(url, isDev)) {
      event.preventDefault();
      if (isSafeExternalUrl(url)) {
        shell.openExternal(url);
      }
    }
  });
  
  win.setMenuBarVisibility(false); // Clean look
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  if (app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; worker-src 'self' blob:; child-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests; block-all-mixed-content"
        ],
      };

      callback({ cancel: false, responseHeaders });
    });
  }

  createWindow();

  // === Get Sub-app Version ===
  ipcMain.handle('get-subapp-version', async (_event, appName) => {
    if (appName === 'StemSplit') {
      const candidates = [
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'StemSplit', 'version.txt'),
        path.join(os.homedir(), 'AppData', 'Local', 'StemSplit', 'version.txt'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'version.txt'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            const version = fs.readFileSync(candidate, 'utf-8').trim();
            if (version) return { version };
          } catch {
            // Keep scanning candidates.
          }
        }
      }

      const exeCandidates = [
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'StemSplit', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'StemSplit', 'StemSplit.exe'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'StemSplit.exe'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'stemsplit.exe'),
      ];

      for (const exe of exeCandidates) {
        if (fs.existsSync(exe)) {
          try {
            const out = spawnSync(exe, ['--version'], { encoding: 'utf-8', timeout: 3000 });
            if (out.stdout) {
              const version = out.stdout.trim().split(/\s+/).pop();
              if (version) return { version };
            }
          } catch {
            // Keep scanning candidates.
          }
        }
      }
    }

    return { version: null };
  });
  
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
  ipcMain.handle('launch-subapp', async (event, appPath, launchOptions = {}) => {
    const isDev = !app.isPackaged;

    const getStemSplitDesktopExePath = () => {
      const candidates = [
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'StemSplit.exe'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'stemsplit.exe'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'bundle', 'msi', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'NoDAW Studio', 'StemSplit', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'StemSplit', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'StemSplit', 'StemSplit.exe'),
        path.join('C:', 'Program Files', 'StemSplit0.3.0', 'StemSplit.exe'),
        path.join('C:', 'Program Files', 'StemSplit11', 'StemSplit.exe'),
        path.join('C:', 'Program Files', 'StemSplit', 'StemSplit.exe'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      return null;
    };

    const getScrewAIDesktopExePath = () => {
      const candidates = [
        path.join(__dirname, '..', 'ScrewAI', 'dist_electron', 'win-unpacked', 'ScrewAI.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'NoDAW Studio', 'ScrewAI', 'ScrewAI.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'ScrewAI', 'ScrewAI.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'ScrewAI', 'ScrewAI.exe'),
        path.join('C:', 'Program Files', 'ScrewAI', 'ScrewAI.exe'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      return null;
    };
    
    // Get the correct paths based on environment
    const getSubAppPaths = (appName) => {
      if (isDev) {
        // Development: apps are in project root
        return {
          dir: path.join(__dirname, '..', appName),
          exe: null, // Will use npm commands in dev
          type: 'dev'
        };
      } else {
        // Production: apps are bundled in resources/apps
        const resourcesPath = process.resourcesPath;
        const appDir = path.join(resourcesPath, 'apps', appName);
        
        const exeNames = {
          'TrimIt': 'TrimIt.exe',
          'IconGenius': 'Icon Genius.exe',
          'StemSplit': 'StemSplit.exe',
          'ScrewAI': 'ScrewAI.exe'
        };
        
        return {
          dir: appDir,
          exe: path.join(appDir, exeNames[appName] || `${appName}.exe`),
          type: 'bundled'
        };
      }
    };
    
    const appInfo = getSubAppPaths(appPath);
    
    if (!appInfo) {
      return { success: false, error: 'Unknown app' };
    }
    
    try {
      if (appPath === 'StemSplit') {
        const desktopExe = getStemSplitDesktopExePath();
        if (desktopExe) {
          spawn(desktopExe, [], {
            cwd: path.dirname(desktopExe),
            detached: true,
            stdio: 'ignore'
          }).unref();
          return { success: true };
        }
      }

      if (appPath === 'ScrewAI') {
        const desktopExe = getScrewAIDesktopExePath();
        if (desktopExe) {
          spawn(desktopExe, [], {
            cwd: path.dirname(desktopExe),
            detached: true,
            stdio: 'ignore'
          }).unref();
          return { success: true };
        }
      }

      if (appInfo.type === 'dev') {
        // Development mode - use npm commands
        if (appPath === 'StemSplit') {
          // StemSplit is Tauri
          const subProcess = spawn('npm', ['run', 'tauri', 'dev'], {
            cwd: appInfo.dir,
            shell: true,
            detached: true,
            stdio: 'ignore'
          });
          subProcess.unref();
        } else {
          // Standard Electron apps
          const subProcess = spawn('npm', ['run', 'electron:dev'], {
            cwd: appInfo.dir,
            shell: true,
            detached: true,
            stdio: 'ignore'
          });
          subProcess.unref();
        }
      } else {
        // Production mode - launch bundled executable
        if (!fs.existsSync(appInfo.exe)) {
          return { success: false, error: `App not found: ${appInfo.exe}` };
        }
        
        spawn(appInfo.exe, [], { 
          cwd: appInfo.dir,
          detached: true, 
          stdio: 'ignore' 
        }).unref();
      }
      
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // === Check Sub-app Exists ===
  ipcMain.handle('check-subapp-exists', async (event, appName) => {
    const isDev = !app.isPackaged;

    const getStemSplitDesktopExePath = () => {
      const candidates = [
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'StemSplit.exe'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'stemsplit.exe'),
        path.join(__dirname, '..', 'StemSplit', 'src-tauri', 'target', 'release', 'bundle', 'msi', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'NoDAW Studio', 'StemSplit', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'StemSplit', 'StemSplit.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'StemSplit', 'StemSplit.exe'),
        path.join('C:', 'Program Files', 'StemSplit0.3.0', 'StemSplit.exe'),
        path.join('C:', 'Program Files', 'StemSplit11', 'StemSplit.exe'),
        path.join('C:', 'Program Files', 'StemSplit', 'StemSplit.exe'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      return null;
    };

    const getScrewAIDesktopExePath = () => {
      const candidates = [
        path.join(__dirname, '..', 'ScrewAI', 'dist_electron', 'win-unpacked', 'ScrewAI.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'NoDAW Studio', 'ScrewAI', 'ScrewAI.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'ScrewAI', 'ScrewAI.exe'),
        path.join(os.homedir(), 'AppData', 'Local', 'ScrewAI', 'ScrewAI.exe'),
        path.join('C:', 'Program Files', 'ScrewAI', 'ScrewAI.exe'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      return null;
    };

    if (appName === 'StemSplit') {
      const desktopExe = getStemSplitDesktopExePath();
      if (desktopExe) {
        return { exists: true, path: desktopExe, mode: 'desktop-instance' };
      }
    }

    if (appName === 'ScrewAI') {
      const desktopExe = getScrewAIDesktopExePath();
      if (desktopExe) {
        return { exists: true, path: desktopExe, mode: 'desktop-instance' };
      }
    }
    
    if (isDev) {
      // Dev mode: check if directory exists
      const devPath = path.join(__dirname, '..', appName);
      const exists = fs.existsSync(devPath);
      return { exists, path: devPath, mode: 'development' };
    } else {
      // Production: check bundled app
      const resourcesPath = process.resourcesPath;
      const appDir = path.join(resourcesPath, 'apps', appName);
      
      const exeNames = {
        'TrimIt': 'TrimIt.exe',
        'IconGenius': 'Icon Genius.exe',
        'StemSplit': 'StemSplit.exe',
        'ScrewAI': 'ScrewAI.exe'
      };
      
      const exePath = path.join(appDir, exeNames[appName] || `${appName}.exe`);
      const exists = fs.existsSync(exePath);
      
      return { exists, path: exePath, mode: 'bundled' };
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
