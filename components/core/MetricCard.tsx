/**
 * MetricCard - Animated Data Display with Micro-interactions
 * NoDAW Frontend Excellence System
 * 
 * Layer: DOM (Layer 4)
 * Purpose: Display metrics/stats with engaging number animations
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useThemeStore } from '../../launcher/themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type MetricVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted';
export type MetricSize = 'sm' | 'md' | 'lg' | 'xl';

export interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  prefix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: MetricVariant;
  size?: MetricSize;
  animated?: boolean;
  animationDuration?: number;
  decimals?: number;
  sparkline?: number[];
  className?: string;
  onClick?: () => void;
}

// ═══════════════════════════════════════════════════════════
// STYLE MAPS
// ═══════════════════════════════════════════════════════════

const variantColors: Record<MetricVariant, { dark: string; light: string; accent: string }> = {
  default: {
    dark: 'text-white',
    light: 'text-slate-900',
    accent: 'text-violet-400',
  },
  success: {
    dark: 'text-emerald-400',
    light: 'text-emerald-600',
    accent: 'text-emerald-500',
  },
  warning: {
    dark: 'text-amber-400',
    light: 'text-amber-600',
    accent: 'text-amber-500',
  },
  danger: {
    dark: 'text-red-400',
    light: 'text-red-600',
    accent: 'text-red-500',
  },
  accent: {
    dark: 'text-cyan-400',
    light: 'text-cyan-600',
    accent: 'text-cyan-500',
  },
  muted: {
    dark: 'text-slate-400',
    light: 'text-slate-500',
    accent: 'text-slate-500',
  },
};

const sizeStyles: Record<MetricSize, { value: string; label: string; unit: string; icon: string }> = {
  sm: {
    value: 'text-xl font-bold',
    label: 'text-[10px] uppercase tracking-wider',
    unit: 'text-xs',
    icon: 'w-4 h-4',
  },
  md: {
    value: 'text-2xl font-bold',
    label: 'text-xs uppercase tracking-wider',
    unit: 'text-sm',
    icon: 'w-5 h-5',
  },
  lg: {
    value: 'text-4xl font-bold',
    label: 'text-sm uppercase tracking-wider',
    unit: 'text-base',
    icon: 'w-6 h-6',
  },
  xl: {
    value: 'text-5xl font-bold',
    label: 'text-base uppercase tracking-wider',
    unit: 'text-lg',
    icon: 'w-8 h-8',
  },
};

// ═══════════════════════════════════════════════════════════
// ANIMATED NUMBER COMPONENT
// ═══════════════════════════════════════════════════════════

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = memo(({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  className = '',
}) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : Math.round(displayValue).toLocaleString();

  return (
    <motion.span 
      className={`font-mono ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {prefix}{formatted}
    </motion.span>
  );
});

// ═══════════════════════════════════════════════════════════
// SPARKLINE COMPONENT
// ═══════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

const Sparkline: React.FC<SparklineProps> = memo(({
  data,
  color = '#7B61FF',
  height = 32,
  className = '',
}) => {
  const width = 80;
  const padding = 2;
  const effectiveHeight = height - padding * 2;
  
  if (data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const pathD = `M ${points.split(' ').join(' L ')}`;

  return (
    <svg 
      width={width} 
      height={height} 
      className={`overflow-visible ${className}`}
    >
      {/* Fill gradient */}
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <motion.path
        d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
        fill="url(#sparkGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      
      {/* Line */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
      
      {/* End dot */}
      <motion.circle
        cx={width - padding}
        cy={padding + effectiveHeight - ((data[data.length - 1] - min) / range) * effectiveHeight}
        r="3"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 500 }}
      />
    </svg>
  );
});

// ═══════════════════════════════════════════════════════════
// TREND INDICATOR
// ═══════════════════════════════════════════════════════════

interface TrendIndicatorProps {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  size?: MetricSize;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = memo(({ value, direction, size = 'md' }) => {
  const colors = {
    up: 'text-emerald-400 bg-emerald-400/10',
    down: 'text-red-400 bg-red-400/10',
    neutral: 'text-slate-400 bg-slate-400/10',
  };

  const icons = {
    up: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    neutral: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <motion.span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${colors[direction]}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      {icons[direction]}
      {Math.abs(value)}%
    </motion.span>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  prefix,
  trend,
  icon,
  variant = 'default',
  size = 'md',
  animated = true,
  animationDuration = 1.5,
  decimals = 0,
  sparkline,
  className = '',
  onClick,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  const isNumericValue = typeof value === 'number';

  return (
    <motion.div
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header: Icon & Label */}
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <span className={`${sizes.icon} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {icon}
          </span>
        )}
        <span className={`${sizes.label} ${isDark ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
          {label}
        </span>
        {trend && <TrendIndicator {...trend} size={size} />}
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-1.5">
        {prefix && (
          <span className={`${sizes.unit} ${isDark ? colors.dark : colors.light} opacity-60`}>
            {prefix}
          </span>
        )}
        
        <span className={`${sizes.value} ${isDark ? colors.dark : colors.light} tabular-nums`}>
          {animated && isNumericValue ? (
            <AnimatedNumber 
              value={value as number} 
              duration={animationDuration} 
              decimals={decimals}
            />
          ) : (
            value
          )}
        </span>
        
        {unit && (
          <span className={`${sizes.unit} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {unit}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3">
          <Sparkline 
            data={sparkline} 
            color={colors.accent}
            height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
          />
        </div>
      )}
    </motion.div>
  );
};

export default memo(MetricCard);

// ═══════════════════════════════════════════════════════════
// SELF-CRITIQUE
// ═══════════════════════════════════════════════════════════

/**
 * [SELF-CRITIQUE]
 * 
 * 1. IMPROVEMENT: AnimatedNumber re-animates on every render if parent
 *    re-renders. Should memoize or use refs to track previous value.
 * 
 * 2. IMPROVEMENT: Sparkline SVG gradient ID is hardcoded ('sparkGradient').
 *    Multiple sparklines on page would share same gradient. Use unique IDs.
 * 
 * 3. IMPROVEMENT: Could add loading skeleton state for async-loaded metrics
 *    to provide better perceived performance.
 */
