/**
 * VaultDoor Component
 * Signature dual-door mechanism with full mechanical animation
 * 
 * NoDAW Frontend Excellence System - VAULT Paradigm
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { cn } from '../utils/cn';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface VaultDoorProps {
  /** Door state */
  isOpen: boolean;
  /** Callback when open animation completes */
  onOpenComplete?: () => void;
  /** Callback when close animation completes */
  onCloseComplete?: () => void;
  /** Content revealed behind doors */
  children?: React.ReactNode;
  /** Door style variant */
  variant?: 'default' | 'emergency' | 'secure' | 'classified';
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Door travel distance as percentage */
  travelDistance?: number;
  /** Custom door open duration (ms) */
  openDuration?: number;
  /** Custom door close duration (ms) */
  closeDuration?: number;
  /** Show warning stripes */
  showWarningStripes?: boolean;
  /** Glow color override */
  glowColor?: string;
  /** Additional className */
  className?: string;
}

type DoorPhase = 'closed' | 'unlocking' | 'opening' | 'open' | 'closing' | 'locking';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const MECHANICAL_EASINGS = {
  servo: [0.77, 0, 0.175, 1],
  hydraulic: [0.645, 0.045, 0.355, 1],
  pneumatic: [0.19, 1, 0.22, 1],
  magnetic: [0.68, -0.55, 0.265, 1.55],
} as const;

const VARIANT_STYLES = {
  default: {
    glowColor: 'rgba(123, 97, 255, 0.6)',
    baseGradient: 'from-slate-700 via-slate-600 to-slate-800',
    accentColor: '#7b61ff',
  },
  emergency: {
    glowColor: 'rgba(255, 51, 102, 0.6)',
    baseGradient: 'from-red-900 via-red-800 to-red-950',
    accentColor: '#ff3366',
  },
  secure: {
    glowColor: 'rgba(0, 255, 148, 0.5)',
    baseGradient: 'from-emerald-900 via-emerald-800 to-emerald-950',
    accentColor: '#00ff94',
  },
  classified: {
    glowColor: 'rgba(255, 184, 0, 0.6)',
    baseGradient: 'from-amber-900 via-amber-800 to-amber-950',
    accentColor: '#ffb800',
  },
};

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

interface DoorPanelProps {
  side: 'left' | 'right';
  variant: keyof typeof VARIANT_STYLES;
  showWarningStripes: boolean;
  phase: DoorPhase;
}

const DoorPanel = memo<DoorPanelProps>(({ side, variant, showWarningStripes, phase }) => {
  const styles = VARIANT_STYLES[variant];
  const isEngaged = phase === 'closed' || phase === 'locking';
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Base metal gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          styles.baseGradient
        )}
      />
      
      {/* Brushed metal grain texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(255, 255, 255, 0.03) 1px,
              rgba(255, 255, 255, 0.03) 2px
            )
          `,
        }}
      />
      
      {/* Anisotropic highlight sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isEngaged
            ? `linear-gradient(
                ${side === 'left' ? '135deg' : '-135deg'},
                transparent 0%,
                rgba(255, 255, 255, 0.02) 40%,
                rgba(255, 255, 255, 0.06) 50%,
                rgba(255, 255, 255, 0.02) 60%,
                transparent 100%
              )`
            : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Inner edge highlight (facing seam) */}
      <div 
        className={cn(
          "absolute inset-y-0 w-[2px]",
          side === 'left' ? 'right-0' : 'left-0'
        )}
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 10%,
            rgba(255, 255, 255, 0.15) 30%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.15) 70%,
            transparent 90%
          )`,
        }}
      />
      
      {/* Outer edge shadow */}
      <div 
        className={cn(
          "absolute inset-y-0 w-[4px]",
          side === 'left' ? 'left-0' : 'right-0'
        )}
        style={{
          background: `linear-gradient(
            to ${side === 'left' ? 'right' : 'left'},
            rgba(0, 0, 0, 0.4),
            transparent
          )`,
        }}
      />
      
      {/* Panel border inset */}
      <div className="absolute inset-4 border border-white/5 rounded-sm">
        {/* Corner rivets */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div 
            key={i}
            className={cn(
              "absolute w-3 h-3 rounded-full",
              pos,
              "m-1"
            )}
            style={{
              background: `
                radial-gradient(
                  circle at 30% 30%,
                  rgba(255, 255, 255, 0.2) 0%,
                  rgba(255, 255, 255, 0.05) 40%,
                  rgba(0, 0, 0, 0.2) 60%,
                  rgba(0, 0, 0, 0.4) 100%
                )
              `,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.1)',
            }}
          />
        ))}
        
        {/* Center embossed detail */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded"
          style={{
            background: `
              radial-gradient(
                circle at center,
                rgba(255, 255, 255, 0.03) 0%,
                transparent 70%
              )
            `,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.05)',
          }}
        >
          {/* Lock indicator */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: isEngaged ? 1 : 0,
              scale: isEngaged ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{
                background: styles.accentColor,
                boxShadow: `0 0 10px ${styles.glowColor}, 0 0 20px ${styles.glowColor}`,
              }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Warning stripes (emergency mode or explicit) */}
      {(variant === 'emergency' || showWarningStripes) && (
        <div 
          className="absolute inset-x-0 bottom-0 h-8 opacity-80"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              #f59e0b,
              #f59e0b 10px,
              #000 10px,
              #000 20px
            )`,
          }}
        />
      )}
      
      {/* Classified stamp (classified mode) */}
      {variant === 'classified' && (
        <div 
          className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1 border-2 border-red-600 
                     text-red-600 font-mono text-xs font-bold tracking-widest
                     rotate-[-5deg] opacity-60"
        >
          CLASSIFIED
        </div>
      )}
    </div>
  );
});

DoorPanel.displayName = 'DoorPanel';

// Seam glow effect
interface SeamGlowProps {
  phase: DoorPhase;
  glowColor: string;
}

const SeamGlow = memo<SeamGlowProps>(({ phase, glowColor }) => {
  const intensity = {
    closed: 0.3,
    unlocking: 1,
    opening: 0.8,
    open: 0,
    closing: 0.6,
    locking: 1,
  }[phase];
  
  return (
    <motion.div
      className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      animate={{ 
        opacity: intensity,
        width: phase === 'open' ? '0px' : '2px',
      }}
      transition={{ 
        duration: phase === 'locking' ? 0.2 : 0.4,
        ease: 'easeOut',
      }}
      style={{
        background: `linear-gradient(
          to bottom,
          transparent 5%,
          ${glowColor} 20%,
          ${glowColor} 80%,
          transparent 95%
        )`,
        boxShadow: `
          0 0 10px ${glowColor},
          0 0 20px ${glowColor},
          0 0 40px ${glowColor}
        `,
      }}
    />
  );
});

SeamGlow.displayName = 'SeamGlow';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const VaultDoor: React.FC<VaultDoorProps> = ({
  isOpen,
  onOpenComplete,
  onCloseComplete,
  children,
  variant = 'default',
  soundEnabled = true,
  travelDistance = 105,
  openDuration = 800,
  closeDuration = 600,
  showWarningStripes = false,
  glowColor,
  className,
}) => {
  const [phase, setPhase] = useState<DoorPhase>('closed');
  const leftDoorControls = useAnimation();
  const rightDoorControls = useAnimation();
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const styles = VARIANT_STYLES[variant];
  const effectiveGlowColor = glowColor || styles.glowColor;

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, [soundEnabled]);

  // Placeholder sound effect (would load actual sounds in production)
  const playSound = useCallback((type: 'unlock' | 'servo' | 'lock' | 'warning') => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Different sound characteristics per type
    const soundConfig = {
      unlock: { freq: 800, duration: 0.1, type: 'sine' as OscillatorType },
      servo: { freq: 200, duration: 0.3, type: 'sawtooth' as OscillatorType },
      lock: { freq: 150, duration: 0.15, type: 'square' as OscillatorType },
      warning: { freq: 600, duration: 0.2, type: 'triangle' as OscillatorType },
    };
    
    const config = soundConfig[type];
    osc.type = config.type;
    osc.frequency.value = config.freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
    
    osc.start();
    osc.stop(ctx.currentTime + config.duration);
  }, [soundEnabled]);

  // Open sequence
  const runOpenSequence = useCallback(async () => {
    setPhase('unlocking');
    playSound('unlock');
    
    await new Promise(r => setTimeout(r, 100));
    
    setPhase('opening');
    playSound('servo');
    
    await Promise.all([
      leftDoorControls.start({
        x: `-${travelDistance}%`,
        transition: { 
          duration: openDuration / 1000, 
          ease: MECHANICAL_EASINGS.servo 
        }
      }),
      rightDoorControls.start({
        x: `${travelDistance}%`,
        transition: { 
          duration: openDuration / 1000, 
          ease: MECHANICAL_EASINGS.servo 
        }
      }),
    ]);
    
    setPhase('open');
    onOpenComplete?.();
  }, [leftDoorControls, rightDoorControls, travelDistance, openDuration, playSound, onOpenComplete]);

  // Close sequence
  const runCloseSequence = useCallback(async () => {
    playSound('warning');
    
    await new Promise(r => setTimeout(r, 200));
    
    setPhase('closing');
    playSound('servo');
    
    await Promise.all([
      leftDoorControls.start({
        x: '0%',
        transition: { 
          duration: closeDuration / 1000, 
          ease: MECHANICAL_EASINGS.hydraulic 
        }
      }),
      rightDoorControls.start({
        x: '0%',
        transition: { 
          duration: closeDuration / 1000, 
          ease: MECHANICAL_EASINGS.hydraulic 
        }
      }),
    ]);
    
    setPhase('locking');
    playSound('lock');
    
    await new Promise(r => setTimeout(r, 200));
    
    setPhase('closed');
    onCloseComplete?.();
  }, [leftDoorControls, rightDoorControls, closeDuration, playSound, onCloseComplete]);

  // React to isOpen prop changes
  useEffect(() => {
    if (isOpen && (phase === 'closed' || phase === 'closing' || phase === 'locking')) {
      runOpenSequence();
    } else if (!isOpen && (phase === 'open' || phase === 'opening' || phase === 'unlocking')) {
      runCloseSequence();
    }
  }, [isOpen, phase, runOpenSequence, runCloseSequence]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Left Door */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 z-20"
        animate={leftDoorControls}
        initial={{ x: '0%' }}
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <DoorPanel 
          side="left" 
          variant={variant} 
          showWarningStripes={showWarningStripes}
          phase={phase}
        />
      </motion.div>

      {/* Right Door */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-20"
        animate={rightDoorControls}
        initial={{ x: '0%' }}
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <DoorPanel 
          side="right" 
          variant={variant}
          showWarningStripes={showWarningStripes}
          phase={phase}
        />
      </motion.div>

      {/* Center Seam Glow */}
      <SeamGlow phase={phase} glowColor={effectiveGlowColor} />

      {/* Background (visible when doors open) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            rgba(10, 10, 20, 0.95) 0%,
            rgba(5, 5, 15, 1) 100%
          )`,
        }}
      />

      {/* Content Container */}
      <AnimatePresence mode="wait">
        {phase === 'open' && (
          <motion.div
            key="content"
            className="relative z-10 w-full h-full"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(VaultDoor);

// ═══════════════════════════════════════════════════════════
// [SELF-CRITIQUE]
// 
// Improvements for next iteration:
// 1. Load actual sound files instead of Web Audio API synthesis
// 2. Add Three.js version with PBR materials and real-time lighting
// 3. Implement haptic feedback via Vibration API for mobile
// 
// ═══════════════════════════════════════════════════════════
