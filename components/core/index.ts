/**
 * Core Component System
 * NoDAW Frontend Excellence System
 * 
 * Exports all foundational UI components following the design system
 */

// Glass morphism container
export { default as GlassPanel } from './GlassPanel';
export type { GlassPanelProps, GlassVariant, GlassSize } from './GlassPanel';

// Premium action button with magnetic hover
export { default as ActionButton } from './ActionButton';
export type { ActionButtonProps, ButtonVariant, ButtonSize } from './ActionButton';

// Animated metric display
export { default as MetricCard } from './MetricCard';
export type { MetricCardProps, MetricVariant, MetricSize } from './MetricCard';

// Real-time data flicker indicator
export { default as DataFlicker, LiveIndicator, ProcessingIndicator } from './DataFlicker';
export type { DataFlickerProps, FlickerVariant, FlickerSize } from './DataFlicker';

// Progress timeline visualization
export { default as TimelineBar, createProcessingTimeline } from './TimelineBar';
export type { TimelineBarProps, TimelineStage, TimelineVariant, TimelineSize } from './TimelineBar';

// 3D hero visualization (requires Three.js)
export { default as IntelligenceCore } from './IntelligenceCore';
export type { IntelligenceCoreProps } from './IntelligenceCore';

// ═══════════════════════════════════════════════════════════
// VAULT PARADIGM COMPONENTS
// Mechanical door and control system components
// ═══════════════════════════════════════════════════════════

// Dual-door vault mechanism
export { default as VaultDoor } from './VaultDoor';
export type { VaultDoorProps } from './VaultDoor';

// Bottom bar with converging door animation
export { default as VaultBottomBar } from './VaultBottomBar';
export type { VaultBottomBarProps } from './VaultBottomBar';

// Tactile controls (knobs, switches, buttons, sliders)
export { 
  RotaryKnob, 
  ToggleSwitch, 
  PushButton, 
  SliderControl 
} from './VaultControls';
export type { 
  RotaryKnobProps, 
  ToggleSwitchProps, 
  PushButtonProps, 
  SliderControlProps 
} from './VaultControls';

// Diagonal flip metallic panel
export { default as DiagonalFlipPanel } from './DiagonalFlipPanel';
export type { DiagonalFlipPanelProps } from './DiagonalFlipPanel';
