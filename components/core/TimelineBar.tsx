/**
 * TimelineBar - Animated Progress Visualization
 * NoDAW Frontend Excellence System
 * 
 * Layer: DOM (Layer 4)
 * Purpose: Display multi-stage progress with engaging animations
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../launcher/themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface TimelineStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  progress?: number; // 0-100 for active stage
}

export type TimelineVariant = 'default' | 'compact' | 'detailed';
export type TimelineSize = 'sm' | 'md' | 'lg';

export interface TimelineBarProps {
  stages: TimelineStage[];
  variant?: TimelineVariant;
  size?: TimelineSize;
  showLabels?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// STYLE MAPS
// ═══════════════════════════════════════════════════════════

const sizeStyles: Record<TimelineSize, {
  track: string;
  dot: string;
  activeDot: string;
  label: string;
  progress: string;
}> = {
  sm: {
    track: 'h-1',
    dot: 'w-2 h-2',
    activeDot: 'w-3 h-3',
    label: 'text-[10px]',
    progress: 'text-xs',
  },
  md: {
    track: 'h-1.5',
    dot: 'w-3 h-3',
    activeDot: 'w-4 h-4',
    label: 'text-xs',
    progress: 'text-sm',
  },
  lg: {
    track: 'h-2',
    dot: 'w-4 h-4',
    activeDot: 'w-5 h-5',
    label: 'text-sm',
    progress: 'text-base',
  },
};

const statusColors = {
  pending: {
    dot: 'bg-slate-600',
    track: 'bg-slate-700',
    text: 'text-slate-500',
  },
  active: {
    dot: 'bg-violet-500',
    track: 'bg-violet-500',
    text: 'text-violet-400',
  },
  complete: {
    dot: 'bg-emerald-500',
    track: 'bg-emerald-500',
    text: 'text-emerald-400',
  },
  error: {
    dot: 'bg-red-500',
    track: 'bg-red-500',
    text: 'text-red-400',
  },
};

// ═══════════════════════════════════════════════════════════
// STAGE DOT COMPONENT
// ═══════════════════════════════════════════════════════════

interface StageDotProps {
  stage: TimelineStage;
  size: TimelineSize;
  animated: boolean;
}

const StageDot: React.FC<StageDotProps> = memo(({ stage, size, animated }) => {
  const sizes = sizeStyles[size];
  const colors = statusColors[stage.status];
  const isActive = stage.status === 'active';
  const isComplete = stage.status === 'complete';

  return (
    <motion.div
      className={`relative flex items-center justify-center ${isActive ? sizes.activeDot : sizes.dot}`}
      initial={animated ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Ring for active state */}
      {isActive && animated && (
        <motion.span
          className={`absolute inset-0 rounded-full ${colors.dot} opacity-30`}
          animate={{
            scale: [1, 1.8, 1.8],
            opacity: [0.3, 0, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
      
      {/* Core dot */}
      <span
        className={`${isActive ? sizes.activeDot : sizes.dot} rounded-full ${colors.dot} transition-all duration-300`}
        style={{
          boxShadow: isActive ? `0 0 12px currentColor` : 'none',
        }}
      />
      
      {/* Checkmark for complete */}
      {isComplete && (
        <motion.svg
          className="absolute w-2/3 h-2/3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </motion.svg>
      )}
      
      {/* X for error */}
      {stage.status === 'error' && (
        <motion.svg
          className="absolute w-2/3 h-2/3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </motion.svg>
      )}
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════
// TRACK SEGMENT COMPONENT
// ═══════════════════════════════════════════════════════════

interface TrackSegmentProps {
  fromStage: TimelineStage;
  toStage: TimelineStage;
  size: TimelineSize;
  animated: boolean;
}

const TrackSegment: React.FC<TrackSegmentProps> = memo(({ fromStage, toStage, size, animated }) => {
  const sizes = sizeStyles[size];
  
  // Determine fill percentage
  let fillPercent = 0;
  if (fromStage.status === 'complete') {
    fillPercent = 100;
  } else if (fromStage.status === 'active' && fromStage.progress !== undefined) {
    fillPercent = fromStage.progress;
  }

  const baseColor = statusColors.pending.track;
  const fillColor = fromStage.status === 'error' 
    ? statusColors.error.track 
    : fromStage.status === 'complete' 
      ? statusColors.complete.track 
      : statusColors.active.track;

  return (
    <div className={`flex-1 ${sizes.track} rounded-full ${baseColor} overflow-hidden`}>
      <motion.div
        className={`h-full ${fillColor} rounded-full`}
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${fillPercent}%` }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const TimelineBar: React.FC<TimelineBarProps> = ({
  stages,
  variant = 'default',
  size = 'md',
  showLabels = true,
  showProgress = true,
  animated = true,
  className = '',
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const sizes = sizeStyles[size];

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completedCount = stages.filter(s => s.status === 'complete').length;
    const activeStage = stages.find(s => s.status === 'active');
    const activeProgress = activeStage?.progress ?? 0;
    
    return Math.round(
      (completedCount / stages.length * 100) + 
      (activeProgress / stages.length)
    );
  }, [stages]);

  if (variant === 'compact') {
    // Simple linear progress bar
    return (
      <div className={`w-full ${className}`}>
        <div className={`w-full ${sizes.track} rounded-full bg-slate-700 overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
            initial={animated ? { width: 0 } : false}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        {showProgress && (
          <motion.p
            className={`mt-1 ${sizes.label} text-slate-400 text-right font-mono`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {overallProgress}%
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Progress indicator */}
      {showProgress && (
        <motion.div
          className="flex items-center justify-between mb-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={`${sizes.label} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Progress
          </span>
          <span className={`${sizes.progress} font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {overallProgress}%
          </span>
        </motion.div>
      )}

      {/* Timeline track with dots */}
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            {/* Stage dot */}
            <StageDot stage={stage} size={size} animated={animated} />
            
            {/* Track segment (not after last) */}
            {index < stages.length - 1 && (
              <TrackSegment
                fromStage={stage}
                toStage={stages[index + 1]}
                size={size}
                animated={animated}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Labels */}
      {showLabels && variant === 'detailed' && (
        <div className="flex justify-between mt-2">
          {stages.map((stage) => (
            <motion.span
              key={stage.id}
              className={`${sizes.label} ${statusColors[stage.status].text} text-center flex-1 truncate px-1`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {stage.label}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(TimelineBar);

// ═══════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════

export const createProcessingTimeline = (
  currentStep: number,
  steps: string[],
  currentProgress?: number
): TimelineStage[] => {
  return steps.map((label, index) => ({
    id: `step-${index}`,
    label,
    status: index < currentStep 
      ? 'complete' 
      : index === currentStep 
        ? 'active' 
        : 'pending',
    progress: index === currentStep ? currentProgress : undefined,
  }));
};

// ═══════════════════════════════════════════════════════════
// SELF-CRITIQUE
// ═══════════════════════════════════════════════════════════

/**
 * [SELF-CRITIQUE]
 * 
 * 1. IMPROVEMENT: Track segments use percentage-based width animation.
 *    For smoother fills, consider using scaleX transform instead.
 * 
 * 2. IMPROVEMENT: Labels in detailed mode use flex-1 which can cause
 *    uneven spacing with long labels. Should use grid for consistent sizing.
 * 
 * 3. IMPROVEMENT: The pulse animation on active dots may cause performance
 *    issues with many timelines. Consider using CSS animations instead of
 *    Framer Motion for this effect.
 */
