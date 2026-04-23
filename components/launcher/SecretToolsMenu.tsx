/**
 * SecretToolsMenu.tsx
 * Hidden tools panel accessible via Ctrl+Alt+Insert×3
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecretToolsStore, SECRET_TOOLS, SecretTool, initSecretToolsListener } from './secretToolsStore';
import { useLicenseStore, LicenseTier } from './licenseStore';
import SmartPromptItModal from './SmartPromptItModal';
import SmartPromptItDemo from './SmartPromptItDemo';
import TimeStretchX from './tools/TimeStretchX';
import AudioRepair from './tools/AudioRepair';
import DevConsole from './tools/DevConsole';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const SecretToolsMenu: React.FC = () => {
  const { 
    isMenuOpen, 
    closeMenu, 
    selectTool, 
    selectedTool,
    showInstallModal,
    isToolInstalled,
    getToolInstallProgress
  } = useSecretToolsStore();
  
  const { getCurrentTier, isDevMode } = useLicenseStore();
  const tier = getCurrentTier();
  
  const [filter, setFilter] = useState<'all' | 'ai' | 'audio' | 'developer' | 'experimental'>('all');
  const [showDemo, setShowDemo] = useState(false);
  const [showTimeStretch, setShowTimeStretch] = useState(false);
  const [showAudioRepair, setShowAudioRepair] = useState(false);
  const [showDevConsole, setShowDevConsole] = useState(false);
  
  // Initialize keyboard listener
  useEffect(() => {
    const cleanup = initSecretToolsListener();
    return cleanup;
  }, []);
  
  // Filter tools
  const filteredTools = filter === 'all' 
    ? SECRET_TOOLS 
    : SECRET_TOOLS.filter(t => t.category === filter);
  
  // Check if user can access tool
  const canAccessTool = (tool: SecretTool): boolean => {
    if (isDevMode) return true;
    if (tool.tier === 'secret') return true;  // Secret tools are always accessible once unlocked
    if (tool.tier === 'free') return true;
    if (tool.tier === 'pro' && (tier === LicenseTier.PRO || tier === LicenseTier.PRO_PLUS)) return true;
    if (tool.tier === 'pro_plus' && tier === LicenseTier.PRO_PLUS) return true;
    return false;
  };
  
  const handleToolClick = (tool: SecretTool) => {
    if (canAccessTool(tool)) {
      // If SmartPromptIt is installed, open demo instead of install modal
      if (tool.id === 'smart-prompt-it' && isToolInstalled(tool.id)) {
        setShowDemo(true);
        return;
      }
      // Open TimeStretchX directly (no install required for demo)
      if (tool.id === 'time-stretch-x') {
        setShowTimeStretch(true);
        return;
      }
      // Open AudioRepair directly
      if (tool.id === 'audio-repair') {
        setShowAudioRepair(true);
        return;
      }
      // Open DevConsole directly
      if (tool.id === 'dev-console') {
        setShowDevConsole(true);
        return;
      }
      selectTool(tool);
    }
  };
  
  if (!isMenuOpen) return null;
  
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-8 z-[101] bg-slate-950 border border-cyan-500/30 rounded-2xl 
                       shadow-[0_0_60px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <h2 className="text-xl font-mono text-cyan-400 tracking-wider">
                  [ SECRET LABS ]
                </h2>
                <span className="text-[9px] font-mono text-slate-600 tracking-widest">
                  ACCESS GRANTED
                </span>
              </div>
              
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeMenu}
                className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center
                         text-slate-500 hover:text-red-400 hover:border-red-500/50 transition-colors"
              >
                ✕
              </motion.button>
            </div>
            
            {/* Filter tabs */}
            <div className="flex gap-2 p-4 border-b border-slate-800/50">
              {(['all', 'ai', 'audio', 'developer', 'experimental'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all
                    ${filter === cat 
                      ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' 
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Tools grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map((tool) => {
                  const accessible = canAccessTool(tool);
                  const installed = isToolInstalled(tool.id);
                  const progress = getToolInstallProgress(tool.id);
                  const isInstalling = progress > 0 && progress < 100;
                  
                  return (
                    <motion.div
                      key={tool.id}
                      whileHover={accessible ? { scale: 1.02, y: -2 } : {}}
                      whileTap={accessible ? { scale: 0.98 } : {}}
                      onClick={() => handleToolClick(tool)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer
                        ${accessible
                          ? 'border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/30 hover:bg-slate-900/80'
                          : 'border-slate-800/30 bg-slate-950/50 opacity-50 cursor-not-allowed'
                        }
                        ${selectedTool?.id === tool.id ? 'border-cyan-500/50 bg-cyan-950/20' : ''}
                      `}
                    >
                      {/* Status badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <StatusBadge status={tool.status} />
                        {!accessible && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-amber-900/50 text-amber-400 
                                         rounded border border-amber-500/30">
                            {tool.tier === 'pro' ? 'PRO' : 'PRO+'}
                          </span>
                        )}
                        {installed && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-emerald-900/50 text-emerald-400 
                                         rounded border border-emerald-500/30">
                            ✓ INSTALLED
                          </span>
                        )}
                      </div>
                      
                      {/* Icon & Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{tool.icon}</span>
                        <div>
                          <h3 className="text-sm font-mono text-slate-200">{tool.name}</h3>
                          <span className="text-[8px] font-mono text-slate-600 tracking-wider">
                            {tool.codename}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {tool.description}
                      </p>
                      
                      {/* Install indicator */}
                      {isInstalling && (
                        <div className="mt-3">
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-cyan-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-cyan-400 mt-1">
                            Installing... {progress.toFixed(0)}%
                          </span>
                        </div>
                      )}
                      
                      {/* Requires install badge */}
                      {tool.requiresInstall && !installed && !isInstalling && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[8px] text-slate-500">
                            📦 Requires install ({tool.installSize})
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-600">
                CTRL+ALT+INSERT×3 to toggle • ESC to close
              </span>
              <span className="text-[9px] font-mono text-slate-600">
                {SECRET_TOOLS.length} experimental tools available
              </span>
            </div>
          </motion.div>
          
          {/* SmartPromptIt Install Modal */}
          {showInstallModal && selectedTool?.id === 'smart-prompt-it' && (
            <SmartPromptItModal />
          )}
          
          {/* SmartPromptIt Demo */}
          <SmartPromptItDemo 
            isOpen={showDemo} 
            onClose={() => setShowDemo(false)} 
          />
          
          {/* TimeStretchX Tool */}
          <TimeStretchX
            isOpen={showTimeStretch}
            onClose={() => setShowTimeStretch(false)}
          />
          
          {/* AudioRepair Tool */}
          <AudioRepair
            isOpen={showAudioRepair}
            onClose={() => setShowAudioRepair(false)}
          />
          
          {/* DevConsole Tool */}
          <DevConsole
            isOpen={showDevConsole}
            onClose={() => setShowDevConsole(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

const StatusBadge: React.FC<{ status: SecretTool['status'] }> = ({ status }) => {
  const config = {
    prototype: { bg: 'bg-purple-900/50', text: 'text-purple-400', border: 'border-purple-500/30' },
    alpha: { bg: 'bg-orange-900/50', text: 'text-orange-400', border: 'border-orange-500/30' },
    beta: { bg: 'bg-cyan-900/50', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    ready: { bg: 'bg-emerald-900/50', text: 'text-emerald-400', border: 'border-emerald-500/30' }
  };
  
  const c = config[status];
  
  return (
    <span className={`text-[8px] px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

export default SecretToolsMenu;
