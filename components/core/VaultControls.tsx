/**
 * VaultControls Component Library
 * Knobs, switches, and tactile controls with sound effects
 * 
 * NoDAW Frontend Excellence System - VAULT Paradigm
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { cn } from '../utils/cn';

// ═══════════════════════════════════════════════════════════
// AUDIO CONTEXT SINGLETON
// ═══════════════════════════════════════════════════════════

let sharedAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioContext;
};

// Sound synthesis utilities
const playDetentClick = (volume: number = 0.1) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'square';
  osc.frequency.value = 2000;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.03);
};

const playToggleClick = (isOn: boolean) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'square';
  osc.frequency.value = isOn ? 1500 : 1000;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

const playHoverTick = () => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.value = 3000;
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.02);
};

const playKnobRotate = (direction: 'cw' | 'ccw') => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'triangle';
  osc.frequency.value = direction === 'cw' ? 800 : 600;
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
};

// ═══════════════════════════════════════════════════════════
// ROTARY KNOB
// ═══════════════════════════════════════════════════════════

export interface RotaryKnobProps {
  /** Current value (0-1) */
  value: number;
  /** Value change callback */
  onChange: (value: number) => void;
  /** Number of detent positions (0 for continuous) */
  detents?: number;
  /** Size in pixels */
  size?: number;
  /** Label text */
  label?: string;
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Color variant */
  variant?: 'default' | 'accent' | 'danger';
  /** Disabled state */
  disabled?: boolean;
  /** Min/max range for display */
  displayRange?: [number, number];
  /** Additional className */
  className?: string;
}

export const RotaryKnob = memo<RotaryKnobProps>(({
  value,
  onChange,
  detents = 12,
  size = 64,
  label,
  soundEnabled = true,
  variant = 'default',
  disabled = false,
  displayRange = [0, 100],
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const lastDetentRef = useRef<number>(Math.round(value * (detents || 100)));
  
  const rotation = useMotionValue(value * 270 - 135); // -135 to +135 degrees
  const springRotation = useSpring(rotation, { stiffness: 300, damping: 30 });
  
  const indicatorX = useTransform(springRotation, (r) => Math.sin(r * Math.PI / 180) * (size / 2 - 12));
  const indicatorY = useTransform(springRotation, (r) => -Math.cos(r * Math.PI / 180) * (size / 2 - 12));
  
  const variantColors = {
    default: { accent: '#7b61ff', glow: 'rgba(123, 97, 255, 0.4)' },
    accent: { accent: '#00ff94', glow: 'rgba(0, 255, 148, 0.4)' },
    danger: { accent: '#ff3366', glow: 'rgba(255, 51, 102, 0.4)' },
  }[variant];

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const rect = knobRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
    
    const angle = Math.atan2(clientX - centerX, -(clientY - centerY)) * (180 / Math.PI);
    const clampedAngle = Math.max(-135, Math.min(135, angle));
    const newValue = (clampedAngle + 135) / 270;
    
    // Handle detents
    if (detents > 0) {
      const detentValue = Math.round(newValue * detents) / detents;
      const currentDetent = Math.round(detentValue * detents);
      
      if (currentDetent !== lastDetentRef.current && soundEnabled) {
        playDetentClick();
        const direction = currentDetent > lastDetentRef.current ? 'cw' : 'ccw';
        playKnobRotate(direction);
        lastDetentRef.current = currentDetent;
      }
      
      onChange(detentValue);
      rotation.set(detentValue * 270 - 135);
    } else {
      onChange(newValue);
      rotation.set(newValue * 270 - 135);
    }
  }, [disabled, detents, onChange, rotation, soundEnabled]);

  const handleHover = useCallback(() => {
    if (soundEnabled && !disabled) {
      playHoverTick();
    }
    setIsHovered(true);
  }, [soundEnabled, disabled]);

  // Sync rotation with value prop
  useEffect(() => {
    if (!isDragging) {
      rotation.set(value * 270 - 135);
    }
  }, [value, isDragging, rotation]);

  const displayValue = Math.round(displayRange[0] + value * (displayRange[1] - displayRange[0]));

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Knob container */}
      <motion.div
        ref={knobRef}
        className={cn(
          "relative rounded-full cursor-grab select-none",
          isDragging && "cursor-grabbing",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          width: size,
          height: size,
          background: `
            radial-gradient(
              circle at 30% 30%,
              hsl(220, 10%, 35%) 0%,
              hsl(220, 12%, 25%) 40%,
              hsl(220, 15%, 18%) 100%
            )
          `,
          boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.05),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3)
            ${isHovered ? `, 0 0 20px ${variantColors.glow}` : ''}
          `,
        }}
        onMouseEnter={handleHover}
        onMouseLeave={() => setIsHovered(false)}
        onPanStart={() => setIsDragging(true)}
        onPan={handleDrag}
        onPanEnd={() => setIsDragging(false)}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {/* Grip texture ring */}
        <div 
          className="absolute inset-2 rounded-full"
          style={{
            background: `
              conic-gradient(
                from 0deg,
                ${Array(36).fill(0).map((_, i) => 
                  `${i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.1)'} ${i * 10}deg ${(i + 1) * 10}deg`
                ).join(', ')}
              )
            `,
          }}
        />
        
        {/* Center cap */}
        <div 
          className="absolute rounded-full"
          style={{
            top: size * 0.25,
            left: size * 0.25,
            width: size * 0.5,
            height: size * 0.5,
            background: `
              radial-gradient(
                circle at 40% 40%,
                hsl(220, 8%, 30%) 0%,
                hsl(220, 10%, 22%) 60%,
                hsl(220, 12%, 18%) 100%
              )
            `,
            boxShadow: `
              inset 0 2px 4px rgba(255, 255, 255, 0.08),
              inset 0 -2px 4px rgba(0, 0, 0, 0.3),
              0 2px 8px rgba(0, 0, 0, 0.3)
            `,
          }}
        />
        
        {/* Indicator dot */}
        <motion.div
          className="absolute w-2 h-2 rounded-full"
          style={{
            x: indicatorX,
            y: indicatorY,
            left: '50%',
            top: '50%',
            marginLeft: -4,
            marginTop: -4,
            background: variantColors.accent,
            boxShadow: `0 0 8px ${variantColors.glow}`,
          }}
        />
        
        {/* Detent markers (outer ring) */}
        {detents > 0 && Array(detents + 1).fill(0).map((_, i) => {
          const angle = (i / detents) * 270 - 135;
          const isActive = i <= Math.round(value * detents);
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `
                  translate(-50%, -50%) 
                  rotate(${angle}deg) 
                  translateY(-${size / 2 + 6}px)
                `,
                background: isActive ? variantColors.accent : 'rgba(255, 255, 255, 0.2)',
                opacity: isActive ? 1 : 0.5,
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Value display */}
      <div 
        className="text-xs font-mono tabular-nums"
        style={{ color: variantColors.accent }}
      >
        {displayValue}
      </div>
      
      {/* Label */}
      {label && (
        <div className="text-[10px] uppercase tracking-wider text-white/50">
          {label}
        </div>
      )}
    </div>
  );
});

RotaryKnob.displayName = 'RotaryKnob';

// ═══════════════════════════════════════════════════════════
// TOGGLE SWITCH
// ═══════════════════════════════════════════════════════════

export interface ToggleSwitchProps {
  /** Current state */
  isOn: boolean;
  /** State change callback */
  onChange: (isOn: boolean) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: string;
  /** On label */
  onLabel?: string;
  /** Off label */
  offLabel?: string;
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Color variant */
  variant?: 'default' | 'accent' | 'danger';
  /** Additional className */
  className?: string;
}

const SWITCH_SIZES = {
  sm: { width: 40, height: 20, thumb: 16 },
  md: { width: 52, height: 26, thumb: 22 },
  lg: { width: 64, height: 32, thumb: 28 },
};

export const ToggleSwitch = memo<ToggleSwitchProps>(({
  isOn,
  onChange,
  size = 'md',
  label,
  onLabel = 'ON',
  offLabel = 'OFF',
  soundEnabled = true,
  disabled = false,
  variant = 'default',
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const dims = SWITCH_SIZES[size];
  
  const variantColors = {
    default: { on: '#7b61ff', off: 'rgba(255, 255, 255, 0.1)', glow: 'rgba(123, 97, 255, 0.4)' },
    accent: { on: '#00ff94', off: 'rgba(255, 255, 255, 0.1)', glow: 'rgba(0, 255, 148, 0.4)' },
    danger: { on: '#ff3366', off: 'rgba(255, 255, 255, 0.1)', glow: 'rgba(255, 51, 102, 0.4)' },
  }[variant];

  const handleClick = useCallback(() => {
    if (disabled) return;
    
    if (soundEnabled) {
      playToggleClick(!isOn);
    }
    onChange(!isOn);
  }, [disabled, isOn, onChange, soundEnabled]);

  const handleHover = useCallback(() => {
    if (soundEnabled && !disabled) {
      playHoverTick();
    }
    setIsHovered(true);
  }, [soundEnabled, disabled]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Label */}
      {label && (
        <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
          {label}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Off label */}
        <span 
          className={cn(
            "text-xs font-mono transition-opacity",
            isOn ? "opacity-30" : "opacity-100"
          )}
          style={{ color: !isOn ? variantColors.on : 'rgba(255, 255, 255, 0.5)' }}
        >
          {offLabel}
        </span>
        
        {/* Switch track */}
        <motion.button
          type="button"
          className={cn(
            "relative rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            width: dims.width,
            height: dims.height,
            background: `
              linear-gradient(
                to bottom,
                hsl(220, 15%, 12%) 0%,
                hsl(220, 12%, 18%) 100%
              )
            `,
            boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.4),
              inset 0 -1px 2px rgba(255, 255, 255, 0.05),
              0 1px 2px rgba(0, 0, 0, 0.2)
              ${isHovered ? `, 0 0 15px ${variantColors.glow}` : ''}
            `,
          }}
          onClick={handleClick}
          onMouseEnter={handleHover}
          onMouseLeave={() => setIsHovered(false)}
          disabled={disabled}
          whileTap={disabled ? {} : { scale: 0.98 }}
          aria-pressed={isOn}
        >
          {/* Track fill (active state) */}
          <motion.div
            className="absolute inset-[2px] rounded-full"
            animate={{
              opacity: isOn ? 1 : 0,
              background: variantColors.on,
            }}
            transition={{ duration: 0.15 }}
            style={{
              boxShadow: isOn ? `inset 0 0 10px ${variantColors.glow}` : 'none',
            }}
          />
          
          {/* Track groove */}
          <div 
            className="absolute inset-[3px] rounded-full"
            style={{
              background: `
                linear-gradient(
                  90deg,
                  rgba(0, 0, 0, 0.3) 0%,
                  transparent 20%,
                  transparent 80%,
                  rgba(0, 0, 0, 0.3) 100%
                )
              `,
            }}
          />
          
          {/* Thumb */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: dims.thumb,
              height: dims.thumb,
              top: (dims.height - dims.thumb) / 2,
              background: `
                radial-gradient(
                  circle at 35% 35%,
                  hsl(220, 8%, 45%) 0%,
                  hsl(220, 10%, 30%) 50%,
                  hsl(220, 12%, 22%) 100%
                )
              `,
              boxShadow: `
                0 2px 6px rgba(0, 0, 0, 0.4),
                inset 0 1px 2px rgba(255, 255, 255, 0.1),
                inset 0 -1px 2px rgba(0, 0, 0, 0.2)
              `,
            }}
            animate={{
              x: isOn ? dims.width - dims.thumb - 2 : 2,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            {/* Thumb grip lines */}
            <div className="absolute inset-0 flex items-center justify-center gap-[2px] opacity-30">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  className="w-[1px] h-[40%] bg-white/30 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.button>
        
        {/* On label */}
        <span 
          className={cn(
            "text-xs font-mono transition-opacity",
            !isOn ? "opacity-30" : "opacity-100"
          )}
          style={{ color: isOn ? variantColors.on : 'rgba(255, 255, 255, 0.5)' }}
        >
          {onLabel}
        </span>
      </div>
    </div>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

// ═══════════════════════════════════════════════════════════
// PUSH BUTTON
// ═══════════════════════════════════════════════════════════

export interface PushButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Label text */
  label?: string;
  /** Size in pixels */
  size?: number;
  /** Momentary (button) or toggle (switch) */
  mode?: 'momentary' | 'toggle';
  /** Current state (for toggle mode) */
  isActive?: boolean;
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Color variant */
  variant?: 'default' | 'accent' | 'danger' | 'success';
  /** Disabled state */
  disabled?: boolean;
  /** LED indicator */
  showLED?: boolean;
  /** Additional className */
  className?: string;
}

export const PushButton = memo<PushButtonProps>(({
  onClick,
  label,
  size = 48,
  mode = 'momentary',
  isActive = false,
  soundEnabled = true,
  variant = 'default',
  disabled = false,
  showLED = true,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const variantColors = {
    default: { led: '#7b61ff', glow: 'rgba(123, 97, 255, 0.5)' },
    accent: { led: '#00ff94', glow: 'rgba(0, 255, 148, 0.5)' },
    danger: { led: '#ff3366', glow: 'rgba(255, 51, 102, 0.5)' },
    success: { led: '#00ff94', glow: 'rgba(0, 255, 148, 0.5)' },
  }[variant];

  const activeState = mode === 'toggle' ? isActive : isPressed;

  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (soundEnabled) {
      playDetentClick(0.15);
    }
    
    if (mode === 'momentary') {
      setIsPressed(true);
    }
    onClick();
  }, [disabled, mode, onClick, soundEnabled]);

  const handleRelease = useCallback(() => {
    if (mode === 'momentary') {
      setIsPressed(false);
      if (soundEnabled) {
        playDetentClick(0.08);
      }
    }
  }, [mode, soundEnabled]);

  const handleHover = useCallback(() => {
    if (soundEnabled && !disabled) {
      playHoverTick();
    }
    setIsHovered(true);
  }, [soundEnabled, disabled]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Button */}
      <motion.button
        type="button"
        className={cn(
          "relative rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          width: size,
          height: size,
        }}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={() => {
          setIsHovered(false);
          if (mode === 'momentary') setIsPressed(false);
        }}
        onMouseEnter={handleHover}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        disabled={disabled}
        animate={{
          y: activeState ? 2 : 0,
        }}
        transition={{ duration: 0.05 }}
      >
        {/* Outer bezel */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(
                145deg,
                hsl(220, 10%, 22%) 0%,
                hsl(220, 12%, 15%) 100%
              )
            `,
            boxShadow: `
              0 4px 12px rgba(0, 0, 0, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.05)
              ${isHovered ? `, 0 0 20px ${variantColors.glow}` : ''}
            `,
          }}
        />
        
        {/* Button cap */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: 4,
            left: 4,
            right: 4,
            bottom: 4,
            background: `
              radial-gradient(
                circle at 35% 35%,
                hsl(220, 8%, 40%) 0%,
                hsl(220, 10%, 28%) 60%,
                hsl(220, 12%, 22%) 100%
              )
            `,
            boxShadow: activeState
              ? `inset 0 2px 6px rgba(0, 0, 0, 0.5)`
              : `
                  0 2px 4px rgba(0, 0, 0, 0.3),
                  inset 0 1px 2px rgba(255, 255, 255, 0.1),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.2)
                `,
          }}
        />
        
        {/* LED indicator */}
        {showLED && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size * 0.25,
              height: size * 0.25,
              top: '50%',
              left: '50%',
              marginTop: -(size * 0.125),
              marginLeft: -(size * 0.125),
            }}
            animate={{
              background: activeState ? variantColors.led : 'rgba(50, 50, 60, 0.8)',
              boxShadow: activeState 
                ? `0 0 10px ${variantColors.glow}, 0 0 20px ${variantColors.glow}`
                : 'none',
            }}
            transition={{ duration: 0.1 }}
          />
        )}
      </motion.button>
      
      {/* Label */}
      {label && (
        <div className="text-[10px] uppercase tracking-wider text-white/50">
          {label}
        </div>
      )}
    </div>
  );
});

PushButton.displayName = 'PushButton';

// ═══════════════════════════════════════════════════════════
// SLIDER / FADER
// ═══════════════════════════════════════════════════════════

export interface SliderControlProps {
  /** Current value (0-1) */
  value: number;
  /** Value change callback */
  onChange: (value: number) => void;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Track length in pixels */
  length?: number;
  /** Label text */
  label?: string;
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Color variant */
  variant?: 'default' | 'accent';
  /** Disabled state */
  disabled?: boolean;
  /** Show value display */
  showValue?: boolean;
  /** Additional className */
  className?: string;
}

export const SliderControl = memo<SliderControlProps>(({
  value,
  onChange,
  orientation = 'vertical',
  length = 120,
  label,
  soundEnabled = true,
  variant = 'default',
  disabled = false,
  showValue = true,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const isVertical = orientation === 'vertical';
  const variantColors = {
    default: { fill: '#7b61ff', glow: 'rgba(123, 97, 255, 0.4)' },
    accent: { fill: '#00ff94', glow: 'rgba(0, 255, 148, 0.4)' },
  }[variant];

  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clientPos = 'touches' in e 
      ? (isVertical ? e.touches[0].clientY : e.touches[0].clientX)
      : (isVertical ? e.clientY : e.clientX);
    
    let newValue: number;
    if (isVertical) {
      newValue = 1 - (clientPos - rect.top) / rect.height;
    } else {
      newValue = (clientPos - rect.left) / rect.width;
    }
    
    newValue = Math.max(0, Math.min(1, newValue));
    onChange(newValue);
    
    if (soundEnabled && Math.abs(newValue - value) > 0.01) {
      playHoverTick();
    }
  }, [disabled, isVertical, onChange, soundEnabled, value]);

  const handleHover = useCallback(() => {
    if (soundEnabled && !disabled) {
      playHoverTick();
    }
    setIsHovered(true);
  }, [soundEnabled, disabled]);

  return (
    <div 
      className={cn(
        "flex items-center gap-3",
        isVertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {/* Label */}
      {label && (
        <div className="text-[10px] uppercase tracking-wider text-white/50">
          {label}
        </div>
      )}
      
      {/* Track container */}
      <div
        ref={trackRef}
        className={cn(
          "relative cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          width: isVertical ? 24 : length,
          height: isVertical ? length : 24,
        }}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleDrag(e);
        }}
        onMouseMove={(e) => isDragging && handleDrag(e)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => {
          setIsDragging(false);
          setIsHovered(false);
        }}
        onMouseEnter={handleHover}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleDrag(e);
        }}
        onTouchMove={(e) => isDragging && handleDrag(e)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Track groove */}
        <div 
          className={cn(
            "absolute",
            isVertical ? "inset-x-[9px] inset-y-0" : "inset-y-[9px] inset-x-0"
          )}
          style={{
            background: `
              linear-gradient(
                ${isVertical ? '90deg' : '180deg'},
                hsl(220, 15%, 12%) 0%,
                hsl(220, 12%, 18%) 50%,
                hsl(220, 15%, 12%) 100%
              )
            `,
            borderRadius: 3,
            boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.5)
              ${isHovered ? `, 0 0 10px ${variantColors.glow}` : ''}
            `,
          }}
        />
        
        {/* Fill */}
        <motion.div
          className={cn(
            "absolute",
            isVertical ? "inset-x-[10px] bottom-0" : "inset-y-[10px] left-0"
          )}
          style={{
            [isVertical ? 'height' : 'width']: `${value * 100}%`,
            background: variantColors.fill,
            borderRadius: 2,
            boxShadow: `0 0 8px ${variantColors.glow}`,
          }}
        />
        
        {/* Thumb */}
        <motion.div
          className="absolute"
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            [isVertical ? 'bottom' : 'left']: `calc(${value * 100}% - 10px)`,
            [isVertical ? 'left' : 'top']: 2,
            background: `
              linear-gradient(
                145deg,
                hsl(220, 8%, 40%) 0%,
                hsl(220, 10%, 28%) 100%
              )
            `,
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Grip lines */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center gap-[2px]",
            isVertical ? "flex-row" : "flex-col"
          )}>
            {[0, 1, 2].map(i => (
              <div 
                key={i} 
                className={cn(
                  "bg-white/20 rounded-full",
                  isVertical ? "w-[1px] h-[8px]" : "w-[8px] h-[1px]"
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Value display */}
      {showValue && (
        <div 
          className="text-xs font-mono tabular-nums min-w-[3ch] text-center"
          style={{ color: variantColors.fill }}
        >
          {Math.round(value * 100)}
        </div>
      )}
    </div>
  );
});

SliderControl.displayName = 'SliderControl';

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  RotaryKnob,
  ToggleSwitch,
  PushButton,
  SliderControl,
};

// ═══════════════════════════════════════════════════════════
// [SELF-CRITIQUE]
// 
// Improvements for next iteration:
// 1. Add MIDI CC mapping support for real hardware integration
// 2. Implement visual feedback for incoming external changes
// 3. Add haptic feedback patterns via Vibration API
// 
// ═══════════════════════════════════════════════════════════
