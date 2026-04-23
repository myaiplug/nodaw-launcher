/**
 * DataFlicker - Real-time Status Indicator with Flicker Effect
 * NoDAW Frontend Excellence System
 * 
 * Layer: DOM (Layer 4)
 * Purpose: Indicate live data streams with randomized micro-animations
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../launcher/themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type FlickerVariant = 'default' | 'success' | 'warning' | 'danger' | 'live' | 'processing';
export type FlickerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface DataFlickerProps {
  label?: string;
  value?: string | number;
  variant?: FlickerVariant;
  size?: FlickerSize;
  live?: boolean;
  flickerIntensity?: 'subtle' | 'medium' | 'intense';
  showDot?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// STYLE MAPS
// ═══════════════════════════════════════════════════════════

const variantColors: Record<FlickerVariant, { text: string; dot: string; glow: string }> = {
  default: {
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    glow: 'shadow-slate-400/50',
  },
  success: {
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'shadow-emerald-400/50',
  },
  warning: {
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    glow: 'shadow-amber-400/50',
  },
  danger: {
    text: 'text-red-400',
    dot: 'bg-red-400',
    glow: 'shadow-red-400/50',
  },
  live: {
    text: 'text-rose-400',
    dot: 'bg-rose-500',
    glow: 'shadow-rose-500/50',
  },
  processing: {
    text: 'text-cyan-400',
    dot: 'bg-cyan-400',
    glow: 'shadow-cyan-400/50',
  },
};

const sizeStyles: Record<FlickerSize, { text: string; dot: string; gap: string }> = {
  xs: { text: 'text-[10px]', dot: 'w-1.5 h-1.5', gap: 'gap-1' },
  sm: { text: 'text-xs', dot: 'w-2 h-2', gap: 'gap-1.5' },
  md: { text: 'text-sm', dot: 'w-2.5 h-2.5', gap: 'gap-2' },
  lg: { text: 'text-base', dot: 'w-3 h-3', gap: 'gap-2.5' },
};

// ═══════════════════════════════════════════════════════════
// FLICKER HOOK
// ═══════════════════════════════════════════════════════════

const useFlicker = (
  enabled: boolean,
  intensity: 'subtle' | 'medium' | 'intense'
) => {
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const intervals = {
    subtle: { min: 3000, max: 6000 },
    medium: { min: 1500, max: 4000 },
    intense: { min: 500, max: 2000 },
  };

  const opacityRange = {
    subtle: { min: 0.85, max: 1 },
    medium: { min: 0.6, max: 1 },
    intense: { min: 0.3, max: 1 },
  };

  useEffect(() => {
    if (!enabled) {
      setOpacity(1);
      return;
    }

    const flicker = () => {
      const range = opacityRange[intensity];
      const randomOpacity = Math.random() * (range.max - range.min) + range.min;
      setOpacity(randomOpacity);

      // Quick return to normal
      setTimeout(() => setOpacity(1), 50 + Math.random() * 100);

      // Schedule next flicker
      const interval = intervals[intensity];
      const nextDelay = Math.random() * (interval.max - interval.min) + interval.min;
      timeoutRef.current = setTimeout(flicker, nextDelay);
    };

    // Initial delay before first flicker
    timeoutRef.current = setTimeout(flicker, Math.random() * 2000 + 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, intensity]);

  return opacity;
};

// ═══════════════════════════════════════════════════════════
// LIVE DOT COMPONENT
// ═══════════════════════════════════════════════════════════

interface LiveDotProps {
  variant: FlickerVariant;
  size: FlickerSize;
  live: boolean;
}

const LiveDot: React.FC<LiveDotProps> = memo(({ variant, size, live }) => {
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  return (
    <span className="relative flex">
      {/* Ping animation for live state */}
      {live && (
        <motion.span
          className={`absolute inline-flex h-full w-full rounded-full ${colors.dot} opacity-75`}
          animate={{
            scale: [1, 2],
            opacity: [0.75, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
      
      {/* Core dot */}
      <motion.span
        className={`relative inline-flex rounded-full ${sizes.dot} ${colors.dot}`}
        style={{
          boxShadow: live ? `0 0 8px currentColor` : 'none',
        }}
        animate={live ? {
          scale: [1, 1.1, 1],
        } : undefined}
        transition={live ? {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        } : undefined}
      />
    </span>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const DataFlicker: React.FC<DataFlickerProps> = ({
  label,
  value,
  variant = 'default',
  size = 'sm',
  live = false,
  flickerIntensity = 'subtle',
  showDot = true,
  className = '',
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];
  
  const opacity = useFlicker(live, flickerIntensity);

  return (
    <motion.div
      className={`inline-flex items-center ${sizes.gap} font-mono ${className}`}
      style={{ opacity }}
    >
      {showDot && <LiveDot variant={variant} size={size} live={live} />}
      
      {label && (
        <span className={`${sizes.text} ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>
          {label}
        </span>
      )}
      
      {value !== undefined && (
        <AnimatePresence mode="wait">
          <motion.span
            key={String(value)}
            className={`${sizes.text} ${colors.text} font-medium tabular-nums`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default memo(DataFlicker);

// ═══════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════

export const LiveIndicator: React.FC<{ label?: string; className?: string }> = memo(({ 
  label = 'LIVE', 
  className 
}) => (
  <DataFlicker 
    label={label} 
    variant="live" 
    size="xs" 
    live 
    flickerIntensity="medium"
    className={className}
  />
));

export const ProcessingIndicator: React.FC<{ value?: string; className?: string }> = memo(({ 
  value, 
  className 
}) => (
  <DataFlicker 
    label="Processing" 
    value={value} 
    variant="processing" 
    size="sm" 
    live 
    flickerIntensity="subtle"
    className={className}
  />
));

// ═══════════════════════════════════════════════════════════
// SELF-CRITIQUE
// ═══════════════════════════════════════════════════════════

/**
 * [SELF-CRITIQUE]
 * 
 * 1. IMPROVEMENT: Flicker timeout uses setTimeout which can drift over time.
 *    Consider using requestAnimationFrame with time tracking for precision.
 * 
 * 2. IMPROVEMENT: Multiple DataFlicker instances create independent timers.
 *    Could centralize timing with a context provider for sync effects.
 * 
 * 3. IMPROVEMENT: The ping animation uses CSS opacity which might cause
 *    layer promotion. Should test performance with many instances.
 */
