// NoDAW Launcher Hub - Launch sub-applications (Cyber-HUD themed)
import React, { useState } from 'react';

interface SubApp {
  id: string;
  name: string;
  description: string;rest
  icon: React.ReactNode;
  path: string;
  accentColor: string;
}

const SUB_APPS: SubApp[] = [
  {
    id: 'stemsplit',
    name: 'StemSplit',
    description: 'AI-powered stem separation for music tracks',
    path: 'StemSplit',
    accentColor: 'lime',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
    )
  },
  {
    id: 'screwai',
    name: 'ScrewAI',
    description: 'Creative AI audio manipulation and effects',
    path: 'ScrewAI',
    accentColor: 'orange',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8l8 8" /></svg>
    )
  },
  {
    id: 'retune432',
    name: 'reTUNE432',
    description: 'Pitch and tuning correction to 432Hz',
    path: 'reTUNE432',
    accentColor: 'blue',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    )
  },
  {
    id: 'nodawstudio',
    name: 'NoDAW Studio',
    description: 'Full-featured DAW for music production',
    path: 'NoDAWStudio',
    accentColor: 'cyan',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="7" width="18" height="10" rx="2" strokeWidth={2} /><circle cx="12" cy="12" r="2" strokeWidth={2} /></svg>
    )
  },
  {
    id: 'editpix',
    name: 'EditPix',
    description: 'Quick image editing and conversion',
    path: 'EditPix',
    accentColor: 'pink',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="5" width="14" height="14" rx="3" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6" /></svg>
    )
  },
  {
    id: 'trimit',
    name: 'TrimIt',
    description: 'Precision audio trimming with waveform editing',
    path: 'TrimIt',
    accentColor: 'cyan',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    )
  },
  {
    id: 'icongenius',
    name: 'Icon Genius',
    description: 'Convert images to .ico with smart cropping',
    path: 'IconGenius',
    accentColor: 'purple',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
];

// Check if running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
};

interface LauncherHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LauncherHub: React.FC<LauncherHubProps> = ({ isOpen, onClose }) => {
  const [launching, setLaunching] = useState<string | null>(null);

  const launchApp = async (app: SubApp) => {
    setLaunching(app.id);
    
    // In Electron, use IPC to launch sub-app
    if (isElectron()) {
      try {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('launch-subapp', app.path);
      } catch (e) {
        console.error('Failed to launch app:', e);
        // Fallback: open in new window if dev server is running
        window.open(`http://localhost:5173`, '_blank');
      }
    } else {
      // In browser, we can't launch sub-apps - show message
      alert(`${app.name} can only be launched from the desktop app.`);
    }
    
    setTimeout(() => setLaunching(null), 1000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl shadow-cyan-900/20 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-tech font-bold text-slate-200 tracking-wide">NODAW APPS</h2>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-mono">Launch companion tools</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 gap-3">
          {SUB_APPS.map(app => (
            <button
              key={app.id}
              onClick={() => launchApp(app)}
              disabled={launching === app.id}
              className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-cyan-500/30 transition-all group text-left disabled:opacity-50"
            >
              <div className={`w-12 h-12 rounded-lg gradient-bg flex items-center justify-center text-white shadow-lg shadow-cyan-900/20 group-hover:shadow-cyan-500/20 group-hover:scale-105 transition-all`}>
                {launching === app.id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  app.icon
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-tech font-bold text-slate-200 group-hover:text-cyan-400 tracking-wide transition-colors">{app.name}</h3>
                <p className="text-[10px] text-slate-500 font-mono">{app.description}</p>
              </div>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-700/50">
          <p className="text-center text-[9px] text-slate-600 uppercase tracking-[0.3em] font-mono">
            NoDAW Studio Suite
          </p>
        </div>
      </div>
    </div>
  );
};

// Compact launcher button for header (theme-aware)
export const LauncherButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
    title="NoDAW Apps"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  </button>
);

export default LauncherHub;
