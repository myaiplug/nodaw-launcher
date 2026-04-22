/**
 * ScrewItPanel.tsx
 * Launcher panel for ScrewAI + FX Rack
 * Real-time audio effects with MIDI control
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { useElectron } from '../hooks';
import { useUsageStore } from '../usageStore';
import { useLicenseStore, LicenseTier } from '../licenseStore';

// Feature highlights for ScrewAI
const FEATURES = [
  { icon: '🎚️', title: 'FX Rack', desc: 'EQ, Compression, Reverb, Delay' },
  { icon: '🎹', title: 'MIDI Control', desc: 'Map any controller' },
  { icon: '🎛️', title: 'Screw FX', desc: 'Slow, chop, tape saturation' },
  { icon: '🔊', title: 'Real-time', desc: 'Live audio processing' },
];

// Preset categories
const PRESETS = [
  { name: 'Codeine', color: '#c084fc' },
  { name: 'Hydro Syrup', color: '#60a5fa' },
  { name: 'Classic Screw', color: '#f472b6' },
  { name: 'Bass Boost', color: '#f97316' },
];

export const ScrewItPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const { isElectron, launchSubApp } = useElectron();
  const { canUse: checkCanUse, recordUsage, getUsageRemaining, getLimits } = useUsageStore();
  const tier = useLicenseStore(state => state.getCurrentTier());
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Check if user can use the feature
  const usageCheck = checkCanUse('screw-it');
  const canUse = usageCheck.allowed;
  const limit = getLimits('screw-it');
  const remainingUses = getUsageRemaining('screw-it');

  const handleLaunch = async () => {
    if (!canUse && tier === LicenseTier.FREE) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsLaunching(true);
    setError(null);

    try {
      if (isElectron && launchSubApp) {
        const launchResult = await launchSubApp('ScrewAI');
        if (!launchResult.success) {
          throw new Error(launchResult.error || 'Failed to launch ScrewAI');
        }
        // Record usage after successful launch
        if (tier === LicenseTier.FREE) {
          recordUsage('screw-it');
        }
      } else {
        // Fallback: Open in new tab (web version)
        window.open('/screw-it', '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch ScrewAI');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`h-full flex flex-col ${isDark ? 'text-white' : 'text-gray-900'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
            bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30
          `}>
            🎛️
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ScrewAI + FX Rack
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time audio FX with MIDI control
            </p>
          </div>
        </div>
        
        {/* Usage indicator for free tier */}
        {tier === LicenseTier.FREE && (
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-medium
            ${remainingUses > 0 
              ? 'bg-purple-500/20 text-purple-300' 
              : 'bg-red-500/20 text-red-300'}
          `}>
            {remainingUses > 0 ? `${remainingUses} uses left` : 'Upgrade for more'}
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`
              p-4 rounded-xl border
              ${isDark 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
              transition-colors cursor-default
            `}
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="font-semibold text-sm">{feature.title}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {feature.desc}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Quick Presets
        </h3>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map(preset => (
            <motion.button
              key={preset.name}
              onClick={() => setSelectedPreset(preset.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedPreset === preset.name
                  ? 'ring-2 ring-offset-2 ring-offset-transparent'
                  : 'opacity-70 hover:opacity-100'}
              `}
              style={{
                backgroundColor: `${preset.color}30`,
                color: preset.color,
                borderColor: preset.color,
                ...(selectedPreset === preset.name ? { ringColor: preset.color } : {})
              }}
            >
              {preset.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Audio Visualizer Placeholder */}
      <div className={`
        flex-1 rounded-xl border overflow-hidden mb-6 min-h-[120px]
        ${isDark ? 'bg-black/30 border-white/10' : 'bg-gray-100 border-gray-200'}
      `}>
        <div className="h-full flex items-center justify-center">
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [10, 30 + Math.random() * 30, 10],
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.05,
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-pink-500"
                style={{ opacity: 0.3 + (i % 3) * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch Button */}
      <motion.button
        onClick={handleLaunch}
        disabled={isLaunching}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full py-4 rounded-xl font-bold text-lg
          transition-all duration-200 flex items-center justify-center gap-3
          ${isLaunching
            ? 'bg-gray-500 cursor-wait'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'}
          text-white
        `}
      >
        {isLaunching ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            Launching...
          </>
        ) : (
          <>
            <span className="text-xl">🎛️</span>
            Open ScrewAI + FX Rack
          </>
        )}
      </motion.button>

      {/* Upgrade Prompt Modal */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowUpgradePrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`
                max-w-md w-full mx-4 p-6 rounded-2xl
                ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'}
              `}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Free Limit Reached</h3>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You've used all {limit} free sessions. Upgrade to Pro for unlimited access to ScrewAI + FX Rack.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradePrompt(false)}
                    className={`
                      flex-1 py-3 rounded-xl font-medium
                      ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}
                    `}
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => {
                      setShowUpgradePrompt(false);
                      // Navigate to upgrade page
                      window.dispatchEvent(new CustomEvent('navigate-to-upgrade'));
                    }}
                    className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScrewItPanel;
