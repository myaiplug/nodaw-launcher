/**
 * DiagonalFlipPanel Component
 * Metallic panel that flips along diagonal axis to reveal secondary content
 * 
 * NoDAW Frontend Excellence System - VAULT Paradigm
 */

import React, { memo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from '../utils/cn';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface DiagonalFlipPanelProps {
  /** Front face content */
  frontContent: React.ReactNode;
  /** Back face content */
  backContent: React.ReactNode;
  /** Whether panel is flipped to show back */
  isFlipped?: boolean;
  /** Callback when flip state changes */
  onFlip?: (isFlipped: boolean) => void;
  /** Panel width */
  width?: number;
  /** Panel height */
  height?: number;
  /** Flip duration in ms */
  flipDuration?: number;
  /** Flip direction */
  flipDirection?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Enable click to flip */
  clickToFlip?: boolean;
  /** Sound enabled */
  soundEnabled?: boolean;
  /** Color variant */
  variant?: 'default' | 'accent' | 'classified';
  /** Additional className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const FLIP_AXIS = {
  'top-left': { 
    x: [1, 0, 0], 
    y: [0, 1, 0], 
    z: [0, 0, 1],
    origin: 'top left',
    rotation: 'rotateX(180deg) rotateY(0deg) rotateZ(0deg)',
  },
  'top-right': {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1],
    origin: 'top right',
    rotation: 'rotateX(180deg) rotateY(0deg) rotateZ(0deg)',
  },
  'bottom-left': {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1],
    origin: 'bottom left',
    rotation: 'rotateX(-180deg) rotateY(0deg) rotateZ(0deg)',
  },
  'bottom-right': {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1],
    origin: 'bottom right',
    rotation: 'rotateX(-180deg) rotateY(0deg) rotateZ(0deg)',
  },
};

const VARIANT_COLORS = {
  default: {
    frame: 'hsl(220, 12%, 20%)',
    accent: '#7b61ff',
    glow: 'rgba(123, 97, 255, 0.3)',
  },
  accent: {
    frame: 'hsl(220, 12%, 20%)',
    accent: '#00ff94',
    glow: 'rgba(0, 255, 148, 0.3)',
  },
  classified: {
    frame: 'hsl(220, 15%, 15%)',
    accent: '#ffb800',
    glow: 'rgba(255, 184, 0, 0.3)',
  },
};

// ═══════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════

const playFlipSound = (phase: 'start' | 'end') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (phase === 'start') {
      // Pivot creak sound
      osc.type = 'sawtooth';
      osc.frequency.value = 200;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    } else {
      // Pneumatic cushion sound
      osc.type = 'triangle';
      osc.frequency.value = 100;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Audio context not available
  }
};

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

interface PanelFaceProps {
  children: React.ReactNode;
  isFront: boolean;
  colors: typeof VARIANT_COLORS.default;
  width: number;
  height: number;
}

const PanelFace = memo<PanelFaceProps>(({ 
  children, 
  isFront, 
  colors,
  width,
  height,
}) => (
  <div 
    className="absolute inset-0 overflow-hidden"
    style={{
      backfaceVisibility: 'hidden',
      transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
    }}
  >
    {/* Metal frame */}
    <div 
      className="absolute inset-0"
      style={{
        background: `
          linear-gradient(
            135deg,
            hsl(220, 10%, 28%) 0%,
            hsl(220, 12%, 22%) 30%,
            hsl(220, 10%, 18%) 70%,
            hsl(220, 12%, 15%) 100%
          )
        `,
        boxShadow: `
          inset 0 1px 2px rgba(255, 255, 255, 0.05),
          inset 0 -1px 2px rgba(0, 0, 0, 0.3),
          0 4px 20px rgba(0, 0, 0, 0.4)
        `,
      }}
    />
    
    {/* Brushed metal texture */}
    <div 
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            ${isFront ? '45deg' : '-45deg'},
            transparent,
            transparent 1px,
            rgba(255, 255, 255, 0.02) 1px,
            rgba(255, 255, 255, 0.02) 2px
          )
        `,
      }}
    />
    
    {/* Diagonal beveled edge */}
    <div 
      className="absolute"
      style={{
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: `0 ${Math.min(40, width * 0.15)}px ${Math.min(40, height * 0.15)}px 0`,
        borderColor: `transparent ${colors.frame} transparent transparent`,
        filter: 'brightness(1.2)',
      }}
    />
    
    {/* Corner accents */}
    {[
      'top-2 left-2',
      'top-2 right-10',
      'bottom-2 left-2',
      'bottom-2 right-2',
    ].map((pos, i) => (
      <div 
        key={i}
        className={cn("absolute w-3 h-3 rounded-full", pos)}
        style={{
          background: `
            radial-gradient(
              circle at 30% 30%,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(0, 0, 0, 0.2) 100%
            )
          `,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
        }}
      />
    ))}
    
    {/* Status indicator strip */}
    <div 
      className="absolute top-3 left-6 right-12 h-[2px]"
      style={{
        background: `linear-gradient(
          90deg,
          transparent 0%,
          ${colors.accent}40 20%,
          ${colors.accent} 50%,
          ${colors.accent}40 80%,
          transparent 100%
        )`,
        boxShadow: `0 0 8px ${colors.glow}`,
      }}
    />
    
    {/* Content area */}
    <div className="absolute inset-4 mt-6">
      {children}
    </div>
    
    {/* Side label (engraved) */}
    <div 
      className="absolute bottom-3 left-4 text-[8px] font-mono uppercase tracking-widest"
      style={{
        color: 'rgba(255, 255, 255, 0.2)',
        textShadow: '0 1px 0 rgba(0, 0, 0, 0.5)',
      }}
    >
      {isFront ? 'PANEL-A' : 'PANEL-B'}
    </div>
  </div>
));

PanelFace.displayName = 'PanelFace';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const DiagonalFlipPanel: React.FC<DiagonalFlipPanelProps> = ({
  frontContent,
  backContent,
  isFlipped: controlledFlipped,
  onFlip,
  width = 280,
  height = 200,
  flipDuration = 600,
  flipDirection = 'top-left',
  clickToFlip = true,
  soundEnabled = true,
  variant = 'default',
  className,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
  const colors = VARIANT_COLORS[variant];
  const axisConfig = FLIP_AXIS[flipDirection];

  const handleFlip = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const newState = !isFlipped;
    
    if (soundEnabled) {
      playFlipSound('start');
    }
    
    // Diagonal flip animation
    await controls.start({
      rotateX: newState ? 180 : 0,
      rotateY: newState ? 8 : 0,
      rotateZ: newState ? 5 : 0,
      scale: [1, 1.02, 1],
      transition: {
        rotateX: {
          duration: flipDuration / 1000,
          ease: [0.68, -0.55, 0.265, 1.55], // Magnetic overshoot
        },
        rotateY: {
          duration: flipDuration / 1000,
          ease: 'easeOut',
        },
        rotateZ: {
          duration: flipDuration / 1000,
          ease: 'easeOut',
        },
        scale: {
          duration: flipDuration / 1000,
          times: [0, 0.5, 1],
        },
      },
    });
    
    if (soundEnabled) {
      playFlipSound('end');
    }
    
    setIsAnimating(false);
    
    if (controlledFlipped === undefined) {
      setInternalFlipped(newState);
    }
    onFlip?.(newState);
  }, [isAnimating, isFlipped, controls, flipDuration, soundEnabled, controlledFlipped, onFlip]);

  const handleClick = useCallback(() => {
    if (clickToFlip) {
      handleFlip();
    }
  }, [clickToFlip, handleFlip]);

  return (
    <div 
      ref={panelRef}
      className={cn(
        "relative cursor-pointer select-none",
        className
      )}
      style={{ 
        width, 
        height,
        perspective: 1000,
      }}
      onClick={handleClick}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
        }}
      />
      
      {/* 3D flip container */}
      <motion.div
        className="relative w-full h-full"
        animate={controls}
        initial={{ rotateX: 0, rotateY: 0, rotateZ: 0 }}
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: axisConfig.origin,
        }}
      >
        {/* Front face */}
        <PanelFace 
          isFront={true} 
          colors={colors}
          width={width}
          height={height}
        >
          {frontContent}
        </PanelFace>
        
        {/* Back face */}
        <div 
          className="absolute inset-0"
          style={{
            transform: 'rotateX(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <PanelFace 
            isFront={false} 
            colors={colors}
            width={width}
            height={height}
          >
            {backContent}
          </PanelFace>
        </div>
      </motion.div>
      
      {/* Pin/hinge visual */}
      <div 
        className="absolute w-2 h-2 rounded-full z-10"
        style={{
          [flipDirection.includes('top') ? 'top' : 'bottom']: 4,
          [flipDirection.includes('left') ? 'left' : 'right']: 4,
          background: `
            radial-gradient(
              circle at 30% 30%,
              hsl(220, 10%, 50%) 0%,
              hsl(220, 12%, 30%) 100%
            )
          `,
          boxShadow: `
            0 2px 4px rgba(0, 0, 0, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.2)
          `,
        }}
      />
      
      {/* Flip indicator */}
      <motion.div
        className="absolute bottom-2 right-2 text-[10px] font-mono"
        style={{ color: colors.accent }}
        animate={{
          opacity: isFlipped ? 1 : 0.4,
        }}
      >
        ⟳
      </motion.div>
    </div>
  );
};

export default memo(DiagonalFlipPanel);

// ═══════════════════════════════════════════════════════════
// [SELF-CRITIQUE]
// 
// Improvements for next iteration:
// 1. Add Three.js version with true 3D geometry and PBR materials
// 2. Implement spring physics for more realistic flip feel
// 3. Add touch gesture support (swipe to flip)
// 
// ═══════════════════════════════════════════════════════════
