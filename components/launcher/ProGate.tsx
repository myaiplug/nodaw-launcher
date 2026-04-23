/**
 * ProGate.tsx
 * Feature gating component for Pro/Free tier enforcement
 * Provides visual overlay and upgrade prompts for locked features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from './themeStore';
import { useLicenseStore, LicenseTier } from './licenseStore';
import { useUsageStore, FREE_TIER_LIMITS, ToolUsageLimits } from './usageStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ProGateProps {
  /** Tool ID for checking limits */
  toolId: string;
  /** Required tier to fully access this feature */
  requiredTier?: LicenseTier;
  /** Children to render (the actual feature content) */
  children: React.ReactNode;
  /** Render mode: 'overlay' shows content with overlay, 'block' hides content entirely */
  mode?: 'overlay' | 'block' | 'badge';
  /** Custom message for the gate */
  message?: string;
  /** Show usage remaining counter */
  showUsage?: boolean;
  /** Callback when upgrade is clicked */
  onUpgradeClick?: () => void;
}

interface UsageBadgeProps {
  toolId: string;
  size?: 'sm' | 'md' | 'lg';
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
  requiredTier: LicenseTier;
}

// ═══════════════════════════════════════════════════════════
// TIER BADGE COLORS
// ═══════════════════════════════════════════════════════════

const TIER_CONFIG = {
  [LicenseTier.FREE]: {
    label: 'FREE',
    bg: 'bg-slate-600',
    text: 'text-slate-100',
    border: 'border-slate-500',
    gradient: 'from-slate-600 to-slate-700'
  },
  [LicenseTier.PRO]: {
    label: 'PRO',
    bg: 'bg-cyan-600',
    text: 'text-cyan-100',
    border: 'border-cyan-500',
    gradient: 'from-cyan-500 to-blue-600'
  },
  [LicenseTier.PRO_PLUS]: {
    label: 'PRO+',
    bg: 'bg-amber-500',
    text: 'text-amber-100',
    border: 'border-amber-400',
    gradient: 'from-amber-400 to-orange-500'
  }
};

// ═══════════════════════════════════════════════════════════
// USAGE BADGE COMPONENT
// ═══════════════════════════════════════════════════════════

export const UsageBadge: React.FC<UsageBadgeProps> = ({ toolId, size = 'md' }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const { getTodaysUsage, getLimits, getUsageRemaining } = useUsageStore();
  const tier = useLicenseStore(state => state.getCurrentTier());
  
  // Pro users don't need usage badges
  if (tier !== LicenseTier.FREE) {
    return null;
  }
  
  const limits = getLimits(toolId);
  if (!limits || limits.dailyLimit <= 0) return null;
  
  const remaining = getUsageRemaining(toolId);
  const used = limits.dailyLimit - remaining;
  const percentage = (used / limits.dailyLimit) * 100;
  
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-1',
    lg: 'text-xs px-3 py-1.5'
  };
  
  const isLow = remaining <= Math.ceil(limits.dailyLimit * 0.2);
  const isEmpty = remaining === 0;
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full font-mono ${sizeClasses[size]}
      ${isEmpty 
        ? isDark ? 'bg-red-900/50 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600 border border-red-300'
        : isLow 
          ? isDark ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-600 border border-amber-300'
          : isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-300'
      }
    `}>
      <span>{remaining}</span>
      <span className="opacity-60">/</span>
      <span className="opacity-60">{limits.dailyLimit}</span>
      {isEmpty && <span className="ml-1">⚠️</span>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TIER BADGE COMPONENT
// ═══════════════════════════════════════════════════════════

export const TierBadge: React.FC<{ tier: LicenseTier; size?: 'sm' | 'md' | 'lg' }> = ({ tier, size = 'md' }) => {
  const config = TIER_CONFIG[tier];
  
  const sizeClasses = {
    sm: 'text-[8px] px-1.5 py-0.5',
    md: 'text-[9px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1'
  };
  
  return (
    <span className={`
      inline-flex items-center font-bold tracking-wider rounded ${sizeClasses[size]}
      bg-gradient-to-r ${config.gradient} ${config.text} shadow-sm
    `}>
      {config.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// RESTRICTION LIST COMPONENT
// ═══════════════════════════════════════════════════════════

export const RestrictionList: React.FC<{ toolId: string }> = ({ toolId }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const tier = useLicenseStore(state => state.getCurrentTier());
  const { getLimits } = useUsageStore();
  
  // Pro users don't see restrictions
  if (tier !== LicenseTier.FREE) return null;
  
  const limits = getLimits(toolId);
  if (!limits || limits.restrictions.length === 0) return null;
  
  return (
    <div className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
      <div className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Free Tier Limits
      </div>
      <ul className="space-y-1">
        {limits.restrictions.map((r, i) => (
          <li key={i} className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-amber-500">•</span>
            {r}
          </li>
        ))}
        {limits.maxDurationSec && (
          <li className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-amber-500">•</span>
            Max duration: {Math.floor(limits.maxDurationSec / 60)}:{(limits.maxDurationSec % 60).toString().padStart(2, '0')}
          </li>
        )}
        {limits.maxFileSizeMB && (
          <li className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-amber-500">•</span>
            Max file size: {limits.maxFileSizeMB}MB
          </li>
        )}
      </ul>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// UPGRADE MODAL COMPONENT
// ═══════════════════════════════════════════════════════════

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, toolId, requiredTier }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const tierConfig = TIER_CONFIG[requiredTier];
  
  const PRO_FEATURES = [
    '✓ Unlimited daily uses',
    '✓ Maximum file sizes (500MB+)',
    '✓ Full duration support (30min+)',
    '✓ Lossless quality exports',
    '✓ All presets & effects',
    '✓ No watermarks',
    '✓ Batch processing',
    '✓ Priority processing'
  ];
  
  const PRO_PLUS_FEATURES = [
    ...PRO_FEATURES,
    '✓ Full Workstation access',
    '✓ AI-powered features',
    '✓ Custom effect chains',
    '✓ MIDI controller support',
    '✓ API access',
    '✓ Priority support'
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl
              ${isDark ? 'bg-slate-900' : 'bg-white'}`}
          >
            {/* Header */}
            <div className={`p-6 bg-gradient-to-r ${tierConfig.gradient}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Upgrade to {tierConfig.label}</h3>
                  <p className="text-white/80 text-sm mt-1">Unlock the full power of NoDAW</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className={`text-sm mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                You've reached the free tier limit for this feature. Upgrade to unlock unlimited access and premium features.
              </div>
              
              {/* Features list */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(requiredTier === LicenseTier.PRO_PLUS ? PRO_PLUS_FEATURES : PRO_FEATURES).map((feature, i) => (
                  <div key={i} className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {feature}
                  </div>
                ))}
              </div>
              
              {/* Pricing */}
              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {requiredTier === LicenseTier.PRO_PLUS ? '$19.99' : '$9.99'}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  or {requiredTier === LicenseTier.PRO_PLUS ? '$149.99' : '$79.99'}/year (save 37%)
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 rounded-xl font-medium text-white
                    bg-gradient-to-r ${tierConfig.gradient} shadow-lg`}
                  onClick={() => {
                    // Open upgrade page
                    window.open('https://nodaw.com/upgrade', '_blank');
                  }}
                >
                  Upgrade Now
                </motion.button>
                <button
                  onClick={onClose}
                  className={`px-6 py-3 rounded-xl font-medium
                    ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN PROGATE COMPONENT
// ═══════════════════════════════════════════════════════════

export const ProGate: React.FC<ProGateProps> = ({
  toolId,
  requiredTier = LicenseTier.PRO,
  children,
  mode = 'overlay',
  message,
  showUsage = true,
  onUpgradeClick
}) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const tier = useLicenseStore(state => state.getCurrentTier());
  const isDevMode = useLicenseStore(state => state.isDevMode);
  const { canUse, getLimits, getUsageRemaining } = useUsageStore();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Dev mode bypasses all gates
  if (isDevMode) {
    return <>{children}</>;
  }
  
  // Check if user has access
  const hasAccess = tier === LicenseTier.PRO_PLUS || 
    (tier === LicenseTier.PRO && requiredTier !== LicenseTier.PRO_PLUS) ||
    (tier === LicenseTier.FREE && requiredTier === LicenseTier.FREE);
  
  // Check usage limits for free tier
  const usageCheck = canUse(toolId);
  const canUseFeature = hasAccess && usageCheck.allowed;
  
  const limits = getLimits(toolId);
  const remaining = getUsageRemaining(toolId);
  
  const tierConfig = TIER_CONFIG[requiredTier];
  
  // Badge mode - just show a small indicator
  if (mode === 'badge') {
    return (
      <div className="relative inline-flex">
        {children}
        {!hasAccess && (
          <div className="absolute -top-1 -right-1">
            <TierBadge tier={requiredTier} size="sm" />
          </div>
        )}
      </div>
    );
  }
  
  // Block mode - completely hide content
  if (mode === 'block' && !hasAccess) {
    return (
      <div 
        className={`relative rounded-xl p-8 text-center
          ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}
        onClick={() => setShowUpgradeModal(true)}
      >
        <div className="text-4xl mb-4">🔒</div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {requiredTier === LicenseTier.PRO_PLUS ? 'Pro+ Feature' : 'Pro Feature'}
        </h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {message || `Upgrade to ${tierConfig.label} to unlock this feature`}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 rounded-lg font-medium text-white
            bg-gradient-to-r ${tierConfig.gradient}`}
          onClick={(e) => {
            e.stopPropagation();
            onUpgradeClick?.() || setShowUpgradeModal(true);
          }}
        >
          Upgrade to {tierConfig.label}
        </motion.button>
        
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          toolId={toolId}
          requiredTier={requiredTier}
        />
      </div>
    );
  }
  
  // Overlay mode - show content with overlay when locked or out of uses
  return (
    <div className="relative">
      {children}
      
      {/* Usage badge */}
      {showUsage && tier === LicenseTier.FREE && hasAccess && limits && limits.dailyLimit > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <UsageBadge toolId={toolId} />
        </div>
      )}
      
      {/* Overlay when no uses remaining */}
      {(!hasAccess || (tier === LicenseTier.FREE && !canUseFeature)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm
            ${isDark ? 'bg-slate-950/90' : 'bg-white/90'}`}
        >
          <div className="text-4xl mb-3">
            {hasAccess ? '⏱️' : '🔒'}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {hasAccess ? 'Daily Limit Reached' : `${tierConfig.label} Feature`}
          </h3>
          <p className={`text-sm text-center px-4 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {hasAccess 
              ? 'You\'ve used all your free uses for today. Upgrade for unlimited access!'
              : message || `Upgrade to ${tierConfig.label} to unlock this feature`
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium text-white
              bg-gradient-to-r ${tierConfig.gradient} shadow-lg`}
            onClick={() => onUpgradeClick?.() || setShowUpgradeModal(true)}
          >
            Upgrade to {tierConfig.label}
          </motion.button>
          
          {hasAccess && (
            <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Resets at midnight local time
            </p>
          )}
        </motion.div>
      )}
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        toolId={toolId}
        requiredTier={requiredTier}
      />
    </div>
  );
};

export default ProGate;
