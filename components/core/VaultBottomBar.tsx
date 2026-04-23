/**
 * VaultBottomBar Component
 * Dual-motion closing doors that meet in the middle
 * 
 * NoDAW Frontend Excellence System - VAULT Paradigm
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface VaultBottomBarProps {
  /** Whether the bar is visible/active */
  isActive: boolean;
  /** Content to display when open */
  children?: React.ReactNode;
  /** Height when expanded */
  height?: number;
  /** Bar style variant */
  variant?: 'default' | 'accent' | 'minimal';
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Animation speed multiplier */
  speedMultiplier?: number;
  /** Callback after open complete */
  onOpenComplete?: () => void;
  /** Callback after close complete */
  onCloseComplete?: () => void;
  /** Hold duration at center before sliding back (ms) */
  holdDuration?: number;
  /** Additional className */
  className?: string;
}

type BarPhase = 'hidden' | 'entering' | 'meeting' | 'holding' | 'revealing' | 'open' | 'closing' | 'departing';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const MECHANICAL_EASINGS = {
  slideIn: [0.16, 1, 0.3, 1],
  slideOut: [0.77, 0, 0.175, 1],
  converge: [0.645, 0.045, 0.355, 1],
};

const VARIANT_COLORS = {
  default: {
    primary: 'rgba(123, 97, 255, 0.8)',
    secondary: 'rgba(0, 212, 255, 0.6)',
    glow: 'rgba(123, 97, 255, 0.4)',
  },
  accent: {
    primary: 'rgba(0, 255, 148, 0.8)',
    secondary: 'rgba(0, 212, 255, 0.6)',
    glow: 'rgba(0, 255, 148, 0.4)',
  },
  minimal: {
    primary: 'rgba(255, 255, 255, 0.3)',
    secondary: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(255, 255, 255, 0.1)',
  },
};

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

interface BarPanelProps {
  side: 'left' | 'right';
  variant: keyof typeof VARIANT_COLORS;
  height: number;
}

const BarPanel = memo<BarPanelProps>(({ side, variant, height }) => {
  const colors = VARIANT_COLORS[variant];
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(
          ${side === 'left' ? '90deg' : '-90deg'},
          hsl(220, 15%, 12%) 0%,
          hsl(220, 12%, 18%) 80%,
          hsl(220, 10%, 22%) 100%
        )`,
      }}
    >
      {/* Top edge highlight */}
      <div 
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            ${colors.secondary} 50%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Metallic grain */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.02) 2px,
              rgba(255, 255, 255, 0.02) 4px
            )
          `,
        }}
      />
      
      {/* Inner edge (facing center) */}
      <div 
        className={cn(
          "absolute inset-y-0 w-[3px]",
          side === 'left' ? 'right-0' : 'left-0'
        )}
        style={{
          background: `linear-gradient(
            to bottom,
            ${colors.primary} 0%,
            ${colors.secondary} 50%,
            ${colors.primary} 100%
          )`,
          boxShadow: `0 0 8px ${colors.glow}`,
        }}
      />
      
      {/* Tech detail lines */}
      <div 
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-[2px]",
          side === 'left' ? 'left-4 right-8' : 'right-4 left-8'
        )}
        style={{
          background: `linear-gradient(
            ${side === 'left' ? '90deg' : '-90deg'},
            transparent 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.05) 100%
          )`,
        }}
      />
      
      {/* Corner accent */}
      <div 
        className={cn(
          "absolute w-2 h-2 rounded-full",
          side === 'left' ? 'right-4 top-1/2 -translate-y-1/2' : 'left-4 top-1/2 -translate-y-1/2'
        )}
        style={{
          background: colors.primary,
          boxShadow: `0 0 6px ${colors.glow}`,
        }}
      />
    </div>
  );
});

BarPanel.displayName = 'BarPanel';

// Center union design
interface CenterUnionProps {
  isVisible: boolean;
  colors: typeof VARIANT_COLORS.default;
}

const CenterUnion = memo<CenterUnionProps>(({ isVisible, colors }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 z-30 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Diamond shape union marker */}
        <motion.div
          className="w-8 h-8 rotate-45"
          style={{
            background: `linear-gradient(
              135deg,
              ${colors.primary} 0%,
              ${colors.secondary} 100%
            )`,
            boxShadow: `
              0 0 20px ${colors.glow},
              0 0 40px ${colors.glow},
              inset 0 0 10px rgba(255, 255, 255, 0.3)
            `,
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [45, 45, 45],
          }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut',
          }}
        >
          {/* Inner detail */}
          <div 
            className="absolute inset-2 rounded-sm"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              boxShadow: 'inset 0 0 4px rgba(0,0,0,0.5)',
            }}
          />
        </motion.div>
        
        {/* Horizontal connector lines */}
        <motion.div
          className="absolute inset-y-1/2 left-0 right-1/2 h-[2px] -translate-y-1/2"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 100%)`,
          }}
          initial={{ scaleX: 0, originX: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.15 }}
        />
        <motion.div
          className="absolute inset-y-1/2 right-0 left-1/2 h-[2px] -translate-y-1/2"
          style={{
            background: `linear-gradient(-90deg, transparent 0%, ${colors.primary} 100%)`,
          }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>
    )}
  </AnimatePresence>
));

CenterUnion.displayName = 'CenterUnion';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const VaultBottomBar: React.FC<VaultBottomBarProps> = ({
  isActive,
  children,
  height = 64,
  variant = 'default',
  soundEnabled = true,
  speedMultiplier = 1,
  onOpenComplete,
  onCloseComplete,
  holdDuration = 400,
  className,
}) => {
  const [phase, setPhase] = useState<BarPhase>('hidden');
  const leftControls = useAnimation();
  const rightControls = useAnimation();
  const contentControls = useAnimation();
  
  const colors = VARIANT_COLORS[variant];

  const baseDuration = 0.3 / speedMultiplier;

  // Play sound effect
  const playSound = useCallback((type: 'woosh' | 'click' | 'lock') => {
    if (!soundEnabled) return;
    
    // Create audio context and play synthesized sound
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const config = {
      woosh: { freq: 150, duration: 0.2, type: 'sawtooth' as OscillatorType, volume: 0.05 },
      click: { freq: 1200, duration: 0.05, type: 'square' as OscillatorType, volume: 0.1 },
      lock: { freq: 300, duration: 0.1, type: 'triangle' as OscillatorType, volume: 0.08 },
    }[type];
    
    osc.type = config.type;
    osc.frequency.value = config.freq;
    gain.gain.setValueAtTime(config.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
    
    osc.start();
    osc.stop(ctx.currentTime + config.duration);
  }, [soundEnabled]);

  // Opening sequence
  const runOpenSequence = useCallback(async () => {
    // Phase 1: Panels slide in from edges
    setPhase('entering');
    playSound('woosh');
    
    await Promise.all([
      leftControls.start({
        x: '0%',
        transition: { duration: baseDuration, ease: MECHANICAL_EASINGS.slideIn }
      }),
      rightControls.start({
        x: '0%',
        transition: { duration: baseDuration, ease: MECHANICAL_EASINGS.slideIn }
      }),
    ]);
    
    // Phase 2: Meet in middle
    setPhase('meeting');
    playSound('click');
    
    // Phase 3: Hold and pulse
    setPhase('holding');
    await new Promise(r => setTimeout(r, holdDuration));
    playSound('lock');
    
    // Phase 4: Slide back to reveal content
    setPhase('revealing');
    playSound('woosh');
    
    await Promise.all([
      leftControls.start({
        x: '-100%',
        transition: { duration: baseDuration * 0.8, ease: MECHANICAL_EASINGS.slideOut }
      }),
      rightControls.start({
        x: '100%',
        transition: { duration: baseDuration * 0.8, ease: MECHANICAL_EASINGS.slideOut }
      }),
      contentControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: baseDuration, delay: baseDuration * 0.3 }
      }),
    ]);
    
    setPhase('open');
    onOpenComplete?.();
  }, [leftControls, rightControls, contentControls, baseDuration, holdDuration, playSound, onOpenComplete]);

  // Closing sequence
  const runCloseSequence = useCallback(async () => {
    // Hide content
    setPhase('closing');
    
    await contentControls.start({
      opacity: 0,
      y: 10,
      transition: { duration: baseDuration * 0.5 }
    });
    
    // Panels converge
    playSound('woosh');
    
    await Promise.all([
      leftControls.start({
        x: '0%',
        transition: { duration: baseDuration, ease: MECHANICAL_EASINGS.converge }
      }),
      rightControls.start({
        x: '0%',
        transition: { duration: baseDuration, ease: MECHANICAL_EASINGS.converge }
      }),
    ]);
    
    // Brief hold
    playSound('click');
    await new Promise(r => setTimeout(r, 150));
    
    // Depart
    setPhase('departing');
    playSound('woosh');
    
    await Promise.all([
      leftControls.start({
        x: '-100%',
        transition: { duration: baseDuration * 0.8, ease: MECHANICAL_EASINGS.slideOut }
      }),
      rightControls.start({
        x: '100%',
        transition: { duration: baseDuration * 0.8, ease: MECHANICAL_EASINGS.slideOut }
      }),
    ]);
    
    setPhase('hidden');
    onCloseComplete?.();
  }, [leftControls, rightControls, contentControls, baseDuration, playSound, onCloseComplete]);

  // Initialize positions
  useEffect(() => {
    leftControls.set({ x: '-100%' });
    rightControls.set({ x: '100%' });
    contentControls.set({ opacity: 0, y: 10 });
  }, [leftControls, rightControls, contentControls]);

  // React to isActive changes
  useEffect(() => {
    if (isActive && phase === 'hidden') {
      runOpenSequence();
    } else if (!isActive && phase === 'open') {
      runCloseSequence();
    }
  }, [isActive, phase, runOpenSequence, runCloseSequence]);

  const showUnion = phase === 'meeting' || phase === 'holding';

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 overflow-hidden",
        className
      )}
      style={{ height }}
    >
      {/* Left Panel */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 z-20"
        animate={leftControls}
        style={{ willChange: 'transform' }}
      >
        <BarPanel side="left" variant={variant} height={height} />
      </motion.div>
      
      {/* Right Panel */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-20"
        animate={rightControls}
        style={{ willChange: 'transform' }}
      >
        <BarPanel side="right" variant={variant} height={height} />
      </motion.div>
      
      {/* Center Union Design */}
      <CenterUnion isVisible={showUnion} colors={colors} />
      
      {/* Content Area */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center"
        animate={contentControls}
        style={{
          background: 'linear-gradient(to top, rgba(10, 10, 20, 0.95), transparent)',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default memo(VaultBottomBar);

// ═══════════════════════════════════════════════════════════
// [SELF-CRITIQUE]
// 
// Improvements for next iteration:
// 1. Add WebGL version with actual metal reflections
// 2. Implement gesture support for swipe-to-close
// 3. Add breakpoint-aware responsive behavior
// 
// ═══════════════════════════════════════════════════════════
