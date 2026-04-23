/**
 * ActionButton - Premium CTA with Magnetic Hover, Glow & Ripple
 * NoDAW Frontend Excellence System
 * 
 * Layer: DOM (Layer 3/5)
 * Purpose: High-conversion CTAs with psychological engagement
 */

import React, { memo, useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useThemeStore } from '../../launcher/themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  magnetic?: boolean;
  glow?: boolean;
  ripple?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
}

// ═══════════════════════════════════════════════════════════
// STYLE MAPS
// ═══════════════════════════════════════════════════════════

const variantStyles: Record<ButtonVariant, { dark: string; light: string }> = {
  primary: {
    dark: 'bg-gradient-to-br from-violet-600 to-violet-700 text-white border-violet-500/50 hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-500/25',
    light: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white border-violet-400 hover:from-violet-400 hover:to-violet-500 shadow-lg shadow-violet-500/20',
  },
  secondary: {
    dark: 'bg-white/[0.06] text-white border-white/[0.12] hover:bg-white/[0.1] hover:border-white/[0.2]',
    light: 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200 hover:border-slate-400',
  },
  ghost: {
    dark: 'bg-transparent text-slate-400 border-transparent hover:bg-white/[0.06] hover:text-white',
    light: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900',
  },
  danger: {
    dark: 'bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500/50 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25',
    light: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/20',
  },
  success: {
    dark: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-500/50 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25',
    light: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20',
  },
  accent: {
    dark: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-400/50 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25',
    light: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-400 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-2',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  xl: 'h-14 px-8 text-lg gap-3',
};

const glowStyles: Record<ButtonVariant, string> = {
  primary: 'shadow-[0_0_30px_rgba(139,92,246,0.4)]',
  secondary: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
  ghost: '',
  danger: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
  success: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
  accent: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
};

// ═══════════════════════════════════════════════════════════
// RIPPLE EFFECT
// ═══════════════════════════════════════════════════════════

interface RippleEffect {
  id: number;
  x: number;
  y: number;
  size: number;
}

const Ripple: React.FC<{ ripple: RippleEffect; onComplete: () => void }> = memo(({ ripple, onComplete }) => (
  <motion.span
    className="absolute bg-white/30 rounded-full pointer-events-none"
    style={{
      left: ripple.x - ripple.size / 2,
      top: ripple.y - ripple.size / 2,
      width: ripple.size,
      height: ripple.size,
    }}
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 4, opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    onAnimationComplete={onComplete}
  />
));

// ═══════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════

const LoadingSpinner: React.FC<{ size: ButtonSize }> = memo(({ size }) => {
  const spinnerSizes: Record<ButtonSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <motion.svg
      className={`${spinnerSizes[size]} animate-spin`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </motion.svg>
  );
});

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  magnetic = true,
  glow = false,
  ripple = true,
  fullWidth = false,
  pill = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Magnetic effect state
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 400, damping: 30 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  // Ripple effect state
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const rippleIdRef = useRef(0);

  // Magnetic hover handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled) return;
    
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull strength (pixels)
    const strength = 8;
    x.set(distanceX / (rect.width / 2) * strength);
    y.set(distanceY / (rect.height / 2) * strength);
  }, [magnetic, disabled, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Ripple click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const button = buttonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const newRipple: RippleEffect = {
          id: ++rippleIdRef.current,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          size,
        };
        setRipples((prev) => [...prev, newRipple]);
      }
    }
    onClick?.(e);
  }, [ripple, disabled, loading, onClick]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Build class string
  const baseClasses = [
    // Base
    'relative inline-flex items-center justify-center font-medium',
    'border rounded-xl overflow-hidden',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
    isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white',
    
    // Variant
    isDark ? variantStyles[variant].dark : variantStyles[variant].light,
    
    // Size
    sizeStyles[size],
    
    // Glow
    glow && glowStyles[variant],
    
    // Full width
    fullWidth && 'w-full',
    
    // Pill shape
    pill && 'rounded-full',
    
    // Disabled
    (disabled || loading) && 'opacity-60 cursor-not-allowed',
    
    // Custom
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      ref={buttonRef}
      className={baseClasses}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      {...props}
    >
      {/* Ripple container */}
      {ripples.map((r) => (
        <Ripple key={r.id} ripple={r} onComplete={() => removeRipple(r.id)} />
      ))}
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </span>
      
      {/* Shine overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
        initial={false}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.button>
  );
};

export default memo(ActionButton);

// ═══════════════════════════════════════════════════════════
// SELF-CRITIQUE
// ═══════════════════════════════════════════════════════════

/**
 * [SELF-CRITIQUE]
 * 
 * 1. IMPROVEMENT: The magnetic effect calculates on every mouse move.
 *    Could throttle to 60fps with requestAnimationFrame for better perf.
 * 
 * 2. IMPROVEMENT: Ripple array grows unboundedly if user clicks rapidly.
 *    Should limit max concurrent ripples to ~5.
 * 
 * 3. IMPROVEMENT: The shine overlay animation fires on every hover.
 *    Consider adding a debounce or only triggering once per hover session.
 */
