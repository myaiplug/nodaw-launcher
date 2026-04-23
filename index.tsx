
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import SalesLandingPage from './components/landing/SalesLandingPage';
import TimeStretchXPage from './src/pages/vst/TimeStretchXPage';
import RepairITPage from './src/pages/vst/RepairITPage';
import ClipITPage from './src/pages/vst/ClipITPage';
import ChronosDynamicEQPage from './src/pages/vst/ChronosDynamicEQPage';
import SaturateITPage from './src/pages/vst/SaturateITPage';

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

  return (
    <HashRouter>
      <Routes>
        {/* Main landing page */}
        <Route path="/" element={<SalesLandingPage />} />
        
        {/* VST Product Pages */}
        <Route path="/vst/timestretchx" element={<TimeStretchXPage />} />
        <Route path="/vst/repairait" element={<RepairITPage />} />
        <Route path="/vst/clipit" element={<ClipITPage />} />
        <Route path="/vst/chronos-dynamic-eq" element={<ChronosDynamicEQPage />} />
        <Route path="/vst/saturateit" element={<SaturateITPage />} />
        
        {/* Fallback - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
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
