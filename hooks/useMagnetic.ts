/**
 * useMagnetic Hook
 * Creates magnetic cursor-following hover effects
 * 
 * NoDAW Frontend Excellence System
 */

import { useRef, useCallback, useState } from 'react';
import { useSpring, SpringConfig } from 'framer-motion';

interface UseMagneticOptions {
  /** Strength of magnetic pull (0-1) */
  strength?: number;
  /** Spring damping (higher = less bouncy) */
  damping?: number;
  /** Spring stiffness (higher = faster) */
  stiffness?: number;
  /** Maximum displacement in pixels */
  maxDistance?: number;
  /** Disable on touch devices */
  disableOnTouch?: boolean;
}

interface MagneticState {
  x: number;
  y: number;
  isHovering: boolean;
}

interface UseMagneticReturn {
  /** Ref to attach to the magnetic element */
  ref: React.RefObject<HTMLElement | null>;
  /** Spring-animated x position */
  x: ReturnType<typeof useSpring>;
  /** Spring-animated y position */
  y: ReturnType<typeof useSpring>;
  /** Current magnetic state */
  state: MagneticState;
  /** Props to spread on the element */
  bind: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onMouseEnter: () => void;
  };
  /** Reset to center position */
  reset: () => void;
}

const defaultSpringConfig: SpringConfig = {
  damping: 15,
  stiffness: 150,
};

export function useMagnetic(options: UseMagneticOptions = {}): UseMagneticReturn {
  const {
    strength = 0.3,
    damping = 15,
    stiffness = 150,
    maxDistance = 50,
    disableOnTouch = true,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<MagneticState>({
    x: 0,
    y: 0,
    isHovering: false,
  });

  // Check if device is touch
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Create spring values
  const springConfig = { damping, stiffness };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const calculateOffset = useCallback((
    mouseX: number,
    mouseY: number,
    rect: DOMRect
  ): { offsetX: number; offsetY: number } => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let offsetX = (mouseX - centerX) * strength;
    let offsetY = (mouseY - centerY) * strength;
    
    // Clamp to max distance
    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      offsetX *= scale;
      offsetY *= scale;
    }
    
    return { offsetX, offsetY };
  }, [strength, maxDistance]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disableOnTouch && isTouchDevice) return;
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const { offsetX, offsetY } = calculateOffset(e.clientX, e.clientY, rect);

    x.set(offsetX);
    y.set(offsetY);
    setState(prev => ({ ...prev, x: offsetX, y: offsetY }));
  }, [calculateOffset, x, y, disableOnTouch, isTouchDevice]);

  const handleMouseEnter = useCallback(() => {
    setState(prev => ({ ...prev, isHovering: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setState({ x: 0, y: 0, isHovering: false });
  }, [x, y]);

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
    setState({ x: 0, y: 0, isHovering: false });
  }, [x, y]);

  return {
    ref,
    x,
    y,
    state,
    bind: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
    reset,
  };
}

/**
 * Simple hook for magnetic button effect
 * Returns transform style directly
 */
export function useMagneticSimple(
  strength: number = 0.2
): {
  bind: {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
  style: { transform: string };
} {
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    
    setTransform({ x, y });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 });
  }, []);

  return {
    bind: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    style: {
      transform: `translate(${transform.x}px, ${transform.y}px)`,
    },
  };
}

/**
 * Hook for creating tilt effect on hover
 */
export function useTilt(maxTilt: number = 15): {
  bind: {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
  style: { transform: string };
} {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    
    setRotation({ x: rotateX, y: rotateY });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 });
  }, []);

  return {
    bind: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    style: {
      transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    },
  };
}

export default useMagnetic;

/* ═══════════════════════════════════════════════════════════
   [SELF-CRITIQUE]
   
   Improvements for next iteration:
   1. Add support for nested magnetic elements with containment
   2. Implement velocity tracking for momentum-based release
   3. Add boundary detection to prevent elements from leaving viewport
   
   ═══════════════════════════════════════════════════════════ */
