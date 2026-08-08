import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import SalesLandingPage from './components/landing/SalesLandingPage';
import LauncherApp from './components/launcher/LauncherApp';
import { useLicenseStore } from './components/launcher/licenseStore';
import TimeStretchXPage from './src/pages/vst/TimeStretchXPage';
import RepairITPage from './src/pages/vst/RepairITPage';
import ClipITPage from './src/pages/vst/ClipITPage';
import ChronosDynamicEQPage from './src/pages/vst/ChronosDynamicEQPage';
import SaturateITPage from './src/pages/vst/SaturateITPage';

const loadStart = Date.now();
const MIN_LOADER_TIME = 2000;

const hideLoader = () => {
  const loader = document.getElementById('nodaw-loader');
  if (!loader) return;
  const elapsed = Date.now() - loadStart;
  const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 1000);
  }, remaining);
};

const normalizeHashPath = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return path.split('?')[0].replace(/\/+$/, '') || '/';
};

const renderRoute = (path: string) => {
  switch (path) {
    case '/': return <SalesLandingPage />;
    case '/app': return <LauncherApp />;
    case '/vst/timestretchx': return <TimeStretchXPage />;
    case '/vst/repairait': return <RepairITPage />;
    case '/vst/clipit': return <ClipITPage />;
    case '/vst/chronos-dynamic-eq': return <ChronosDynamicEQPage />;
    case '/vst/saturateit': return <SaturateITPage />;
    default:
      if (window.location.hash !== '#/') window.location.replace('#/');
      return <SalesLandingPage />;
  }
};

const AppWithLoaderHide: React.FC = () => {
  const [path, setPath] = useState(normalizeHashPath);

  useEffect(() => {
    hideLoader();
    const onHashChange = () => setPath(normalizeHashPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const state = useLicenseStore.getState();
    if (!state.pendingUpgrade) return;

    // A checkout can outlive the app process. Resume verification on startup so
    // a completed purchase unlocks without requiring the customer to repeat it.
    void state.waitForPendingUpgrade(90_000);
  }, []);

  return renderRoute(path);
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppWithLoaderHide />
  </React.StrictMode>
);
