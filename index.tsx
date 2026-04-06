
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import LauncherApp from './components/launcher/LauncherApp';

// Track when page started loading
const loadStart = Date.now();
const MIN_LOADER_TIME = 2000; // Show logo for at least 2 seconds

// Hide loading screen when React mounts (with minimum display time)
const hideLoader = () => {
  const loader = document.getElementById('nodaw-loader');
  if (loader) {
    const elapsed = Date.now() - loadStart;
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
    setTimeout(() => {
      loader.classList.add('hidden');
      // Also remove from DOM after animation
      setTimeout(() => loader.remove(), 1000);
    }, remaining);
  }
};

// Wrapper component that triggers loader hide on mount
const AppWithLoaderHide: React.FC = () => {
  useEffect(() => {
    hideLoader();
  }, []);
  
  return <LauncherApp />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWithLoaderHide />
  </React.StrictMode>
);
