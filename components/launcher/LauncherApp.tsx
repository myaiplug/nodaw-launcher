/**
 * LauncherApp.tsx
 * Main NoDAW Launcher - Awwwards-quality 3D launcher experience
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleField from './ParticleField';
import AnimatedLogo from './AnimatedLogo';
import { FeatureTile3D, TierType } from './FeatureTile3D';
import ShatterUnlockModal from './ShatterUnlockModal';
import AchievementBadge from './AchievementBadge';
import ThemeToggle from './ThemeToggle';
import DropZoneOverlay from './DropZoneOverlay';
import { TOOLS, Tool } from './tools';
import { useLicenseStore, LicenseTier, useIsDevMode } from './licenseStore';
import { useThemeStore } from './themeStore';
import { useGlobalFileDrop } from './hooks/useFileDrop';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDevModeShortcut } from './hooks/useDevModeShortcut';

// Tool panels
import { 
  ToolPanel,
  TrimItPanel,
  ConvertItPanel,
  TestItPanel,
  SplitItPanel,
  ScrewItPanel,
  FXitPanel,
  IconItPanel,
  WorkstationPanel,
  SettingsPanel
} from './panels';

// Onboarding sequence component
const OnboardingSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),   // Logo appears
      setTimeout(() => setStage(2), 1300),  // Tagline appears
      setTimeout(() => setStage(3), 2100),  // Grid appears
      setTimeout(() => onComplete(), 2800)  // Complete
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);
  
  // Skip on any key press
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onComplete]);
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <AnimatedLogo />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {stage >= 2 && (
          <motion.p
            key="tagline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-sm font-mono tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
          >
            One App. Eight Tools. Zero Limits.
          </motion.p>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {stage >= 2 && (
          <motion.p
            key="skip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8 }}
            className={`text-xs font-mono mt-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
          >
            Press any key to continue...
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Feature grid component
const FeatureGrid: React.FC<{
  tools: Tool[];
  onLaunch: (tool: Tool) => void;
  onUnlockRequest: (tool: Tool) => void;
  canAccessTool: (toolId: string) => boolean;
}> = ({ tools, onLaunch, onUnlockRequest, canAccessTool }) => {
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
    >
      {tools.map((tool, index) => {
        const hasAccess = canAccessTool(tool.id);
        const isLocked = !hasAccess && tool.tier !== 'free';
        
        return (
          <motion.div
            key={tool.id}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 20 
                }
              }
            }}
          >
            <FeatureTile3D
              id={tool.id}
              name={tool.name}
              tagline={tool.tagline}
              description={tool.description}
              icon={tool.icon}
              tier={tool.tier}
              locked={isLocked}
              status={tool.status}
              onLaunch={() => onLaunch(tool)}
              onUnlockRequest={() => onUnlockRequest(tool)}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Tier badge at top
const TierBadge: React.FC<{ tier: LicenseTier }> = ({ tier }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  if (tier === LicenseTier.FREE) return null;
  
  const styles = tier === LicenseTier.PRO 
    ? isDark 
      ? 'bg-purple-950/60 text-purple-400 border-purple-500/40'
      : 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm'
    : isDark
      ? 'bg-orange-950/60 text-orange-400 border-orange-500/40'
      : 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`fixed top-4 right-20 z-20 px-3 py-1.5 rounded-lg border ${styles} font-mono text-xs tracking-wider`}
    >
      {tier === LicenseTier.PRO ? '✦ PRO' : '✦ PRO+'}
    </motion.div>
  );
};

// Main launcher component
const LauncherApp: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Only show onboarding on first visit
    const hasSeenOnboarding = localStorage.getItem('nodaw_onboarding_complete');
    return !hasSeenOnboarding;
  });
  
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [pendingUnlockTool, setPendingUnlockTool] = useState<Tool | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // License store
  const { getCurrentTier, canAccessTool, activateLicense } = useLicenseStore();
  const currentTier = getCurrentTier();
  const isDevMode = useIsDevMode();
  
  // Secret dev mode keyboard shortcut (type 'devmode' to toggle)
  useDevModeShortcut();
  
  // Global file drop handling
  const { isDragging } = useGlobalFileDrop({
    accept: ['audio/*', 'image/*', '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.png', '.jpg', '.jpeg', '.svg'],
    multiple: false,
    onDrop: (files) => {
      if (files.length > 0) {
        const file = files[0];
        setDroppedFile(file);
        
        // Route based on file type
        if (file.type.startsWith('image/')) {
          // Image files go to IconIt
          const iconItTool = TOOLS.find(t => t.id === 'icon-it');
          if (iconItTool && canAccessTool('icon-it')) {
            setActiveTool(iconItTool);
          }
        } else {
          // Audio files go to TrimIt
          const trimItTool = TOOLS.find(t => t.id === 'trim-it');
          if (trimItTool && canAccessTool('trim-it')) {
            setActiveTool(trimItTool);
          }
        }
      }
    },
    onError: (message) => {
      console.warn('Drop error:', message);
    }
  });

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    { key: 't', ctrl: true, handler: (e) => { e.preventDefault(); toggleTheme(); } },
    { key: ',', ctrl: true, handler: (e) => { e.preventDefault(); setShowSettings(s => !s); } },
    { key: 'Escape', handler: () => {
      if (showSettings) setShowSettings(false);
      else if (activeTool) setActiveTool(null);
      else if (unlockModalOpen) setUnlockModalOpen(false);
    }},
    // Quick launch shortcuts (1-7 for tools)
    { key: '1', handler: () => !activeTool && launchToolByIndex(0) },
    { key: '2', handler: () => !activeTool && launchToolByIndex(1) },
    { key: '3', handler: () => !activeTool && launchToolByIndex(2) },
    { key: '4', handler: () => !activeTool && launchToolByIndex(3) },
    { key: '5', handler: () => !activeTool && launchToolByIndex(4) },
    { key: '6', handler: () => !activeTool && launchToolByIndex(5) },
    { key: '7', handler: () => !activeTool && launchToolByIndex(6) },
    { key: '8', handler: () => !activeTool && launchToolByIndex(7) },
  ]);

  // Launch tool by index
  const launchToolByIndex = useCallback((index: number) => {
    const tool = TOOLS[index];
    if (tool && canAccessTool(tool.id)) {
      setActiveTool(tool);
    } else if (tool) {
      setPendingUnlockTool(tool);
      setUnlockModalOpen(true);
    }
  }, [canAccessTool]);
  
  // Handle onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('nodaw_onboarding_complete', 'true');
  }, []);
  
  // Handle tool launch
  const handleLaunch = useCallback((tool: Tool) => {
    console.log(`Launching ${tool.name}...`);
    setActiveTool(tool);
  }, []);
  
  // Handle tool close
  const handleToolClose = useCallback(() => {
    setActiveTool(null);
  }, []);
  
  // Handle unlock request
  const handleUnlockRequest = useCallback((tool: Tool) => {
    setPendingUnlockTool(tool);
    setUnlockModalOpen(true);
  }, []);
  
  // Handle license unlock
  const handleUnlock = useCallback(async (key: string): Promise<boolean> => {
    const result = await activateLicense(key);
    if (result.success) {
      setShowAchievement(true);
      return true;
    }
    return false;
  }, [activateLicense]);
  
  // Handle purchase redirect
  const handlePurchase = useCallback(() => {
    const tier = pendingUnlockTool?.tier === 'pro_plus' ? 'pro-plus' : 'pro';
    window.open(`https://nodaw.studio/pricing?tier=${tier}`, '_blank');
  }, [pendingUnlockTool]);
  
  return (
    <div className={`relative w-full h-full min-h-screen overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-100 via-white to-slate-50'
    }`}>
      {/* 3D Particle Background */}
      <Suspense fallback={<div className={`fixed inset-0 ${isDark ? 'bg-slate-950' : 'bg-white'}`} />}>
        <ParticleField />
      </Suspense>
      
      {/* Theme Toggle & Settings - Top Left */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed top-4 left-4 z-30 flex items-center gap-2"
      >
        <ThemeToggle />
        {/* Dev mode indicator - only visible when active */}
        {isDevMode && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider ${
              isDark
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
            }`}
            title="Dev Mode Active - All tools unlocked"
          >
            🔓 DEV
          </motion.div>
        )}
        <motion.button
          onClick={() => setShowSettings(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2.5 rounded-xl transition-colors ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              : 'bg-white/80 hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 shadow-sm'
          }`}
          title="Settings (Ctrl+,)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      </motion.div>
      
      {/* Tier badge */}
      <TierBadge tier={currentTier} />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8">
        <AnimatePresence mode="wait">
          {showOnboarding ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingSequence onComplete={handleOnboardingComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Logo */}
              <AnimatedLogo />
              
              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-sm font-mono tracking-wider mb-4 ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                Professional Audio Suite
              </motion.p>
              
              {/* Feature grid */}
              <FeatureGrid
                tools={TOOLS}
                onLaunch={handleLaunch}
                onUnlockRequest={handleUnlockRequest}
                canAccessTool={canAccessTool}
              />
              
              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-2 mt-4"
              >
                <p className={`text-[10px] font-mono tracking-wider ${
                  isDark ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  NoDAW Studio Suite v1.2
                </p>
                {currentTier === LicenseTier.FREE && (
                  <button
                    onClick={() => handleUnlockRequest(TOOLS.find(t => t.tier === 'pro')!)}
                    className={`text-xs transition-colors ${
                      isDark 
                        ? 'text-cyan-500 hover:text-cyan-400' 
                        : 'text-cyan-600 hover:text-cyan-500'
                    }`}
                  >
                    Upgrade to Pro →
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Unlock Modal */}
      {pendingUnlockTool && (
        <ShatterUnlockModal
          open={unlockModalOpen}
          featureName={pendingUnlockTool.name}
          featureId={pendingUnlockTool.id}
          featureTier={pendingUnlockTool.tier as Exclude<TierType, 'free'>}
          onClose={() => {
            setUnlockModalOpen(false);
            setPendingUnlockTool(null);
          }}
          onUnlock={handleUnlock}
          onPurchase={handlePurchase}
        />
      )}
      
      {/* Achievement Badge */}
      <AchievementBadge 
        open={showAchievement} 
        onClose={() => setShowAchievement(false)} 
      />
      
      {/* Tool Panel - Slides in when a tool is launched */}
      {activeTool && (
        <ToolPanel
          open={!!activeTool}
          title={activeTool.name}
          icon={activeTool.icon}
          onBack={handleToolClose}
        >
          {activeTool.id === 'trim-it' && <TrimItPanel />}
          {activeTool.id === 'convert-it' && <ConvertItPanel />}
          {activeTool.id === 'test-it' && <TestItPanel />}
          {activeTool.id === 'split-it' && <SplitItPanel />}
          {activeTool.id === 'screw-it' && <ScrewItPanel />}
          {activeTool.id === 'fx-it' && <FXitPanel />}
          {activeTool.id === 'icon-it' && <IconItPanel />}
          {activeTool.id === 'workstation' && <WorkstationPanel />}
        </ToolPanel>
      )}

      {/* Global Drop Zone Overlay */}
      <DropZoneOverlay isActive={isDragging && !activeTool} />

      {/* Settings Panel */}
      <ToolPanel
        open={showSettings}
        title="Settings"
        icon="⚙️"
        onBack={() => setShowSettings(false)}
      >
        <SettingsPanel />
      </ToolPanel>
    </div>
  );
};

export default LauncherApp;
