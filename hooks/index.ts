/**
 * Hooks Index
 * Export all custom hooks from NoDAW Frontend Excellence System
 */

// Magnetic cursor effects
export { useMagnetic, useMagneticSimple, useTilt } from './useMagnetic';
export type { MagneticOptions } from './useMagnetic';

// Centralized sound management
export {
  useSoundManager,
  useSoundEffects,
  SoundManagerProvider,
} from './useSoundManager';
export type {
  SoundCategory,
  SoundDefinition,
  SoundManagerOptions,
  SoundManagerContextValue,
} from './useSoundManager';
