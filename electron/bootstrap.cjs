'use strict';

/**
 * Desktop entry bootstrap.
 * The web build keeps its marketing root, while installed Electron builds open
 * directly into the product at #/app. Security policy remains owned by
 * electron/main.cjs.
 */
const { BrowserWindow } = require('electron');

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

require('./main.cjs');
