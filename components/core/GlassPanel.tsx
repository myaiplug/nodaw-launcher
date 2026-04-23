/**
 * GlassPanel - Premium Glass Morphism Container
 * NoDAW Frontend Excellence System
 * 
 * Layer: DOM (Layer 3)
 * Purpose: Universal container with blur, glow, and depth
 */

import React, { memo, forwardRef } from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { useThemeStore } from '../../launcher/themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type GlassVariant = 'subtle' | 'default' | 'elevated' | 'accent' | 'danger' | 'success';
export type GlassSize = 'sm' | 'md' | 'lg' | 'xl';

export interface GlassPanelProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  variant?: GlassVariant;
  size?: GlassSize;
  glow?: boolean;
  glowColor?: string;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
  animated?: boolean;
  hoverLift?: boolean;
  noPadding?: boolean;
  noBorder?: boolean;
  noBlur?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

// ═══════════════════════════════════════════════════════════
// STYLE MAPS
// ═══════════════════════════════════════════════════════════

const variantStyles: Record<GlassVariant, { dark: string; light: string }> = {
  subtle: {
    dark: 'bg-white/[0.02] border-white/[0.05]',
    light: 'bg-black/[0.02] border-black/[0.05]',
  },
  default: {
    dark: 'bg-white/[0.04] border-white/[0.08]',
    light: 'bg-white/80 border-slate-200',
  },
  elevated: {
    dark: 'bg-white/[0.06] border-white/[0.12]',
    light: 'bg-white border-slate-300',
  },
  accent: {
    dark: 'bg-violet-500/[0.08] border-violet-500/[0.25]',
    light: 'bg-violet-50 border-violet-200',
  },
  danger: {
    dark: 'bg-red-500/[0.08] border-red-500/[0.25]',
    light: 'bg-red-50 border-red-200',
  },
  success: {
    dark: 'bg-emerald-500/[0.08] border-emerald-500/[0.25]',
    light: 'bg-emerald-50 border-emerald-200',
  },
};

const sizeStyles: Record<GlassSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const radiusStyles: Record<string, string> = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-[20px]',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

const glowIntensityStyles: Record<string, { dark: string; light: string }> = {
  subtle: {
    dark: 'shadow-[0_0_15px_rgba(123,97,255,0.15)]',
    light: 'shadow-[0_0_15px_rgba(123,97,255,0.1)]',
  },
  medium: {
    dark: 'shadow-[0_0_30px_rgba(123,97,255,0.25)]',
    light: 'shadow-[0_0_25px_rgba(123,97,255,0.15)]',
  },
  strong: {
    dark: 'shadow-[0_0_50px_rgba(123,97,255,0.4)]',
    light: 'shadow-[0_0_40px_rgba(123,97,255,0.25)]',
  },
};

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: { duration: 0.15 },
  },
};

const hoverVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  glow = false,
  glowColor,
  glowIntensity = 'medium',
  animated = true,
  hoverLift = false,
  noPadding = false,
  noBorder = false,
  noBlur = false,
  borderRadius = 'xl',
  ...props
}, ref) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Build class string
  const baseClasses = [
    // Transition
    'transition-all duration-200',
    
    // Glass effect
    !noBlur && 'backdrop-blur-xl',
    
    // Border
    !noBorder && 'border',
    
    // Variant
    isDark ? variantStyles[variant].dark : variantStyles[variant].light,
    
    // Padding
    !noPadding && sizeStyles[size],
    
    // Border radius
    radiusStyles[borderRadius],
    
    // Glow effect
    glow && (isDark ? glowIntensityStyles[glowIntensity].dark : glowIntensityStyles[glowIntensity].light),
    
    // Custom glow color
    glow && glowColor && `shadow-[0_0_30px_${glowColor}]`,
    
    // Base shadow
    !glow && (isDark ? 'shadow-lg shadow-black/20' : 'shadow-md'),
    
    // Inset highlight
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    
    // Custom classes
    className,
  ].filter(Boolean).join(' ');

  // Hover effect classes (CSS fallback when not using framer motion hover)
  const hoverClasses = hoverLift ? 'hover:-translate-y-1 hover:scale-[1.01]' : '';

  if (!animated) {
    return (
      <div 
        ref={ref as React.Ref<HTMLDivElement>}
        className={`${baseClasses} ${hoverClasses}`}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      variants={hoverLift ? hoverVariants : containerVariants}
      initial={hoverLift ? 'rest' : 'hidden'}
      animate={hoverLift ? 'rest' : 'visible'}
      exit="exit"
      whileHover={hoverLift ? 'hover' : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});

GlassPanel.displayName = 'GlassPanel';

export default memo(GlassPanel);

// ═══════════════════════════════════════════════════════════
// SELF-CRITIQUE
// ═══════════════════════════════════════════════════════════

/**
 * [SELF-CRITIQUE]
 * 
 * 1. IMPROVEMENT: Could add `contain: layout style paint` for better
 *    rendering performance on complex layouts.
 * 
 * 2. IMPROVEMENT: The glow color prop uses string interpolation which
 *    won't work with Tailwind's JIT. Should use CSS variables instead.
 * 
 * 3. IMPROVEMENT: Consider extracting the blur value as a prop for
 *    cases where subtle blur (8px) vs heavy blur (24px) is needed.
 */
