/**
 * FeatureTile3D.tsx
 * Interactive 3D feature tiles with parallax hover, glow effects, and lock states
 * Includes usage tracking display for free tier users
 */

import React, { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useThemeStore } from './themeStore';
import { useAudioFeedback } from './hooks/useAudioFeedback';
import { useUsageStore } from './usageStore';
import { useLicenseStore, LicenseTier } from './licenseStore';

export type TierType = 'free' | 'pro' | 'pro_plus';

interface FeatureTileProps {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  tier: TierType;
  locked: boolean;
  status?: 'ready' | 'beta' | 'coming-soon';
  onLaunch: () => void;
  onUnlockRequest: () => void;
}

// Dark theme styles
const TIER_STYLES_DARK = {
  free: {
    border: 'border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/50',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.15)]',
    badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    gradient: 'from-emerald-500/10 via-transparent to-transparent'
  },
  pro: {
    border: 'border-purple-500/30',
    borderHover: 'hover:border-purple-500/50',
    glow: 'shadow-[0_0_30px_rgba(167,139,250,0.15)]',
    badge: 'bg-purple-950/60 text-purple-400 border-purple-500/40',
    gradient: 'from-purple-500/10 via-transparent to-transparent'
  },
  pro_plus: {
    border: 'border-orange-500/30',
    borderHover: 'hover:border-orange-500/50',
    glow: 'shadow-[0_0_30px_rgba(251,146,60,0.15)]',
    badge: 'bg-orange-950/60 text-orange-400 border-orange-500/40',
    gradient: 'from-orange-500/10 via-transparent to-transparent'
  }
};

// Light theme styles
const TIER_STYLES_LIGHT = {
  free: {
    border: 'border-emerald-300/60',
    borderHover: 'hover:border-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.2)]',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    gradient: 'from-emerald-100/50 via-transparent to-transparent'
  },
  pro: {
    border: 'border-purple-300/60',
    borderHover: 'hover:border-purple-400',
    glow: 'shadow-[0_0_30px_rgba(167,139,250,0.25)]',
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    gradient: 'from-purple-100/50 via-transparent to-transparent'
  },
  pro_plus: {
    border: 'border-orange-300/60',
    borderHover: 'hover:border-orange-400',
    glow: 'shadow-[0_0_30px_rgba(251,146,60,0.25)]',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    gradient: 'from-orange-100/50 via-transparent to-transparent'
  }
};

const STATUS_BADGES_DARK = {
  ready: null,
  beta: { text: 'BETA', class: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40' },
  'coming-soon': { text: 'SOON', class: 'bg-slate-800/60 text-slate-400 border-slate-600/40' }
};

const STATUS_BADGES_LIGHT = {
  ready: null,
  beta: { text: 'BETA', class: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  'coming-soon': { text: 'SOON', class: 'bg-slate-200 text-slate-500 border-slate-300' }
};

export const FeatureTile3D: React.FC<FeatureTileProps> = ({
  id,
  name,
  tagline,
  description,
  icon,
  tier,
  locked,
  status = 'ready',
  onLaunch,
  onUnlockRequest
}) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  const { playHover, playClick, playLock } = useAudioFeedback({ volume: 0.06 });
  
  // Usage tracking
  const currentTier = useLicenseStore(state => state.getCurrentTier());
  const isDevMode = useLicenseStore(state => state.isDevMode);
  const usageRemaining = useUsageStore(state => state.getUsageRemaining(id));
  const limits = useUsageStore(state => state.getLimits(id));
  
  // Show usage info only for non-pro users and when not in dev mode
  const showUsageInfo = !isDevMode && currentTier === LicenseTier.FREE && !locked;
  const isUsageExhausted = usageRemaining === 0 && limits.dailyLimit > 0;
  
  // 3D tilt effect with mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [12, -12]);
  const rotateY = useTransform(x, [-100, 100], [-12, 12]);
  
  // Spring physics for smooth movement
  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  }, [x, y]);
  
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playHover();
  }, [playHover]);
  
  const handleClick = useCallback(() => {
    if (status === 'coming-soon') return;
    if (locked) {
      playLock();
      onUnlockRequest();
    } else {
      playClick();
      onLaunch();
    }
  }, [locked, status, onUnlockRequest, onLaunch, playClick, playLock]);
  
  const TIER_STYLES = isDark ? TIER_STYLES_DARK : TIER_STYLES_LIGHT;
  const STATUS_BADGES = isDark ? STATUS_BADGES_DARK : STATUS_BADGES_LIGHT;
  
  const styles = TIER_STYLES[tier];
  const statusBadge = STATUS_BADGES[status];
  const isDisabled = status === 'coming-soon';
  
  return (
    <motion.div
      className="relative"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          relative w-44 h-52 p-4 rounded-xl
          ${isDark 
            ? 'bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-black/30' 
            : 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-300/50'
          }
          border ${styles.border} ${!isDisabled ? styles.borderHover : ''}
          ${isHovered && !locked && !isDisabled ? styles.glow : ''}
          transition-all duration-300
          flex flex-col items-center justify-center gap-2
          overflow-hidden group
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d'
        }}
        whileHover={!isDisabled ? { scale: 1.02, z: 20 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
      >
        {/* Gradient glow on hover */}
        <motion.div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
        
        {/* Shimmer effect for locked tiles */}
        {locked && !isDisabled && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r from-transparent ${isDark ? 'via-white/5' : 'via-white/40'} to-transparent`}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
        
        {/* Lock overlay */}
        {locked && !isDisabled && (
          <motion.div 
            className={`absolute inset-0 ${isDark ? 'bg-slate-950/60' : 'bg-white/70'} backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.08, 1],
                rotate: [0, 3, -3, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-3xl drop-shadow-lg"
            >
              🔒
            </motion.div>
          </motion.div>
        )}
        
        {/* Icon container */}
        <motion.div 
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center
            ${isDark 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50' 
              : 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300/80'
            }
            border text-2xl transition-all duration-300
            ${isHovered && !locked && !isDisabled 
              ? isDark ? 'scale-110 border-slate-600/50' : 'scale-110 border-slate-400 shadow-md' 
              : ''
            }
          `}
          style={{ transform: 'translateZ(25px)' }}
        >
          {icon}
        </motion.div>
        
        {/* Name */}
        <h3 
          className={`text-base font-bold tracking-wide mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
          style={{ transform: 'translateZ(20px)' }}
        >
          {name}
        </h3>
        
        {/* Tagline */}
        <p 
          className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-cyan-400/80' : 'text-cyan-600'}`}
          style={{ transform: 'translateZ(15px)' }}
        >
          {tagline}
        </p>
        
        {/* Description */}
        <p 
          className={`text-[9px] text-center leading-tight mt-1 px-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
          style={{ transform: 'translateZ(10px)' }}
        >
          {description}
        </p>
        
        {/* Tier badge */}
        <span 
          className={`
            absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider
            border ${styles.badge}
          `}
          style={{ transform: 'translateZ(30px)' }}
        >
          {tier === 'free' ? 'FREE' : tier === 'pro' ? 'PRO' : 'PRO+'}
        </span>
        
        {/* Usage indicator for free tier users */}
        {showUsageInfo && limits.dailyLimit > 0 && (
          <motion.div
            className={`
              absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1
              px-2 py-1 rounded-lg text-[8px] font-mono
              ${isUsageExhausted 
                ? isDark 
                  ? 'bg-red-950/80 text-red-400 border border-red-500/40' 
                  : 'bg-red-100 text-red-600 border border-red-300'
                : isDark
                  ? 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }
            `}
            style={{ transform: 'translateZ(25px)' }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isUsageExhausted ? (
              <>
                <span>⏳</span>
                <span>Daily limit reached</span>
              </>
            ) : (
              <>
                <span className={
                  usageRemaining <= 1 
                    ? 'text-red-400' 
                    : usageRemaining <= 3 
                      ? 'text-yellow-400' 
                      : 'text-emerald-400'
                }>
                  {usageRemaining}
                </span>
                <span>/{limits.dailyLimit} today</span>
              </>
            )}
          </motion.div>
        )}
        
        {/* Status badge (beta, coming-soon) */}
        {statusBadge && (
          <span 
            className={`
              absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider
              border ${statusBadge.class}
            `}
            style={{ transform: 'translateZ(30px)' }}
          >
            {statusBadge.text}
          </span>
        )}
        
        {/* Bottom glow line */}
        <div 
          className={`
            absolute bottom-0 left-4 right-4 h-[1px] 
            bg-gradient-to-r from-transparent ${isDark ? 'via-cyan-500/30' : 'via-cyan-400/50'} to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-300
          `}
        />
      </motion.button>
    </motion.div>
  );
};

export default FeatureTile3D;
