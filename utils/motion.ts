/**
 * Motion System - Framer Motion Variants & Utilities
 * NoDAW Frontend Excellence System
 */

import { Variants, Transition } from 'framer-motion';

// ═══════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════

export const transitions = {
  instant: { duration: 0.05 },
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  normal: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 },
  springGentle: { type: 'spring', stiffness: 200, damping: 25 },
} as const;

// ═══════════════════════════════════════════════════════════
// ENTRANCE ANIMATIONS
// ═══════════════════════════════════════════════════════════

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: transitions.normal 
  },
  exit: { 
    opacity: 0, 
    transition: transitions.fast 
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { ...transitions.normal, duration: 0.4 } 
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    transition: transitions.fast 
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { ...transitions.normal, duration: 0.4 } 
  },
  exit: { 
    opacity: 0, 
    y: 12, 
    transition: transitions.fast 
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { ...transitions.normal, duration: 0.4 } 
  },
  exit: { 
    opacity: 0, 
    x: -12, 
    transition: transitions.fast 
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { ...transitions.normal, duration: 0.4 } 
  },
  exit: { 
    opacity: 0, 
    x: 12, 
    transition: transitions.fast 
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: transitions.springBouncy 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: transitions.fast 
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 25 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: transitions.fast 
  },
};

export const expandHeight: Variants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: { 
    opacity: 1, 
    height: 'auto', 
    transition: { 
      height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.2, delay: 0.1 } 
    } 
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    transition: { 
      height: { duration: 0.2 },
      opacity: { duration: 0.1 } 
    } 
  },
};

// ═══════════════════════════════════════════════════════════
// STAGGER ANIMATIONS
// ═══════════════════════════════════════════════════════════

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.springGentle,
  },
};

// ═══════════════════════════════════════════════════════════
// HOVER ANIMATIONS
// ═══════════════════════════════════════════════════════════

export const hoverLift: Variants = {
  rest: { 
    y: 0, 
    scale: 1,
    transition: transitions.fast,
  },
  hover: { 
    y: -4, 
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: { 
    y: -2, 
    scale: 0.98,
    transition: transitions.instant,
  },
};

export const hoverScale: Variants = {
  rest: { 
    scale: 1,
    transition: transitions.fast,
  },
  hover: { 
    scale: 1.05,
    transition: transitions.fast,
  },
  tap: { 
    scale: 0.95,
    transition: transitions.instant,
  },
};

export const hoverGlow: Variants = {
  rest: { 
    boxShadow: '0 0 0 rgba(123, 97, 255, 0)',
    transition: transitions.fast,
  },
  hover: { 
    boxShadow: '0 0 30px rgba(123, 97, 255, 0.4)',
    transition: transitions.fast,
  },
};

// ═══════════════════════════════════════════════════════════
// CONTINUOUS ANIMATIONS
// ═══════════════════════════════════════════════════════════

export const float: Variants = {
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(123, 97, 255, 0.2)',
      '0 0 40px rgba(123, 97, 255, 0.4)',
      '0 0 20px rgba(123, 97, 255, 0.2)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export const createStaggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * 0.08 + baseDelay;
};

export const createTransitionWithDelay = (
  delay: number,
  base: Transition = transitions.normal
): Transition => ({
  ...base,
  delay,
});

// ═══════════════════════════════════════════════════════════
// SPECIAL EFFECTS
// ═══════════════════════════════════════════════════════════

export const shatter: Variants = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
    opacity: 0,
    scale: 0,
    rotate: Math.random() * 360,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const ripple: Variants = {
  initial: { 
    scale: 0, 
    opacity: 0.5 
  },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { 
      duration: 0.6, 
      ease: 'easeOut' 
    },
  },
};

export const typewriter: Variants = {
  hidden: { width: 0 },
  visible: {
    width: '100%',
    transition: {
      duration: 1,
      ease: 'linear',
    },
  },
};

export const dataFlicker: Variants = {
  animate: {
    opacity: [1, 0.7, 1, 0.8, 1],
    transition: {
      duration: 0.15,
      repeat: Infinity,
      repeatDelay: Math.random() * 3 + 2,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// MODAL & OVERLAY ANIMATIONS
// ═══════════════════════════════════════════════════════════

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15, delay: 0.1 },
  },
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: transitions.springBouncy,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: transitions.fast,
  },
};

export const slidePanel: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { 
      type: 'spring', 
      damping: 30, 
      stiffness: 300 
    },
  },
  exit: { 
    x: '100%',
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 1, 1] 
    },
  },
};

// ═══════════════════════════════════════════════════════════
// PRESET COLLECTIONS
// ═══════════════════════════════════════════════════════════

export const cardAnimation = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: scaleIn,
  whileHover: 'hover',
  whileTap: 'tap',
};

export const listAnimation = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: staggerContainer,
};

export const listItemAnimation = {
  variants: staggerItem,
};

export default {
  // Transitions
  transitions,
  
  // Entrances
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleInBounce,
  expandHeight,
  
  // Stagger
  staggerContainer,
  staggerFast,
  staggerSlow,
  staggerItem,
  
  // Hover
  hoverLift,
  hoverScale,
  hoverGlow,
  
  // Continuous
  float,
  pulse,
  glowPulse,
  rotate,
  shimmer,
  
  // Special
  shatter,
  ripple,
  typewriter,
  dataFlicker,
  
  // Modal
  modalBackdrop,
  modalContent,
  slidePanel,
  
  // Presets
  cardAnimation,
  listAnimation,
  listItemAnimation,
};
