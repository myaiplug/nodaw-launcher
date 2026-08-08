'use strict';

/**
 * NoDAW desktop bootstrap.
 *
 * Keeps electron/main.cjs as the implementation source while applying the two
 * production concerns that must exist before it initializes:
 * 1. desktop windows open the actual Launcher route (#/app)
 * 2. packaged CSP permits HTTPS calls only to the configured entitlement API
 */
const electron = require('electron');
const { app, BrowserWindow, session } = electron;

const DEFAULT_ENTITLEMENTS_ORIGIN = 'https://entitlements.nodawlabs.com';

function entitlementOrigin() {
  const raw = process.env.NODAW_ENTITLEMENTS_URL || process.env.VITE_NODAW_ENTITLEMENTS_URL || DEFAULT_ENTITLEMENTS_ORIGIN;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') return DEFAULT_ENTITLEMENTS_ORIGIN;
    return parsed.origin;
  } catch {
    return DEFAULT_ENTITLEMENTS_ORIGIN;
  }
}

// Route every desktop boot into the application rather than the web sales page.
const originalLoadURL = BrowserWindow.prototype.loadURL;
BrowserWindow.prototype.loadURL = function patchedLoadURL(url, options) {
  try {
    const parsed = new URL(url);
    if (!parsed.hash) parsed.hash = '/app';
    return originalLoadURL.call(this, parsed.toString(), options);
  } catch {
    return originalLoadURL.call(this, url, options);
  }
};

const originalLoadFile = BrowserWindow.prototype.loadFile;
BrowserWindow.prototype.loadFile = function patchedLoadFile(filePath, options = {}) {
  return originalLoadFile.call(this, filePath, { ...options, hash: '/app' });
};

// Register first so the existing main process CSP listener is transparently
// wrapped when it registers during app.whenReady().
app.whenReady().then(() => {
  if (!app.isPackaged) return;

  const webRequest = session.defaultSession.webRequest;
  const originalOnHeadersReceived = webRequest.onHeadersReceived.bind(webRequest);
  const allowedOrigin = entitlementOrigin();

  webRequest.onHeadersReceived = (listener) => {
    return originalOnHeadersReceived((details, finalCallback) => {
      listener(details, (response = {}) => {
        const headers = { ...(response.responseHeaders || {}) };
        const key = Object.keys(headers).find(name => name.toLowerCase() === 'content-security-policy');
        if (key && Array.isArray(headers[key])) {
          headers[key] = headers[key].map(value => {
            if (/connect-src\s+/i.test(value)) {
              return value.replace(/connect-src\s+([^;]*)/i, (_match, sources) => {
                const current = String(sources || '').trim();
                return `connect-src ${current} ${allowedOrigin}`;
              });
            }
            return value;
          });
        }
        finalCallback({ ...response, responseHeaders: headers });
      });
    });
  };
});

require('./main.cjs');
