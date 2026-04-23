/**
 * useSoundManager Hook
 * Centralized sound effect management for VAULT UI components
 * 
 * NoDAW Frontend Excellence System
 */

import { useCallback, useRef, useEffect, useState, createContext, useContext } from 'react';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type SoundCategory = 'mechanical' | 'ui' | 'ambient' | 'alert';

export interface SoundDefinition {
  /** Synthesizer configuration */
  synth: {
    type: OscillatorType;
    frequency: number;
    duration: number;
    volume: number;
    attack?: number;
    decay?: number;
    pitchEnvelope?: number;
    filterFreq?: number;
  };
  /** Sound category for volume mixing */
  category: SoundCategory;
  /** Optional pitch variation range */
  pitchVariation?: number;
}

export interface SoundManagerOptions {
  /** Master volume (0-1) */
  masterVolume?: number;
  /** Category-specific volumes */
  categoryVolumes?: Partial<Record<SoundCategory, number>>;
  /** Enable/disable all sounds */
  enabled?: boolean;
}

export interface SoundManagerContextValue {
  play: (soundId: string, overrides?: Partial<SoundDefinition['synth']>) => void;
  setMasterVolume: (volume: number) => void;
  setCategoryVolume: (category: SoundCategory, volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
  masterVolume: number;
}

// ═══════════════════════════════════════════════════════════
// SOUND LIBRARY
// ═══════════════════════════════════════════════════════════

const SOUND_LIBRARY: Record<string, SoundDefinition> = {
  // ─────────────────────────────────────────────────────────
  // MECHANICAL SOUNDS
  // ─────────────────────────────────────────────────────────
  
  'door-unlock': {
    synth: {
      type: 'square',
      frequency: 800,
      duration: 0.1,
      volume: 0.1,
      filterFreq: 2000,
    },
    category: 'mechanical',
    pitchVariation: 0.1,
  },
  
  'door-servo': {
    synth: {
      type: 'sawtooth',
      frequency: 180,
      duration: 0.4,
      volume: 0.06,
      pitchEnvelope: 50,
    },
    category: 'mechanical',
  },
  
  'door-lock': {
    synth: {
      type: 'square',
      frequency: 150,
      duration: 0.15,
      volume: 0.12,
      attack: 0.01,
      decay: 0.1,
    },
    category: 'mechanical',
  },
  
  'panel-flip-start': {
    synth: {
      type: 'sawtooth',
      frequency: 200,
      duration: 0.15,
      volume: 0.06,
    },
    category: 'mechanical',
  },
  
  'panel-flip-end': {
    synth: {
      type: 'triangle',
      frequency: 100,
      duration: 0.2,
      volume: 0.08,
    },
    category: 'mechanical',
  },
  
  'hydraulic-hiss': {
    synth: {
      type: 'sawtooth',
      frequency: 80,
      duration: 0.3,
      volume: 0.05,
      filterFreq: 800,
    },
    category: 'mechanical',
  },
  
  // ─────────────────────────────────────────────────────────
  // UI SOUNDS
  // ─────────────────────────────────────────────────────────
  
  'hover-tick': {
    synth: {
      type: 'sine',
      frequency: 3000,
      duration: 0.02,
      volume: 0.03,
    },
    category: 'ui',
    pitchVariation: 0.2,
  },
  
  'button-click': {
    synth: {
      type: 'square',
      frequency: 2000,
      duration: 0.03,
      volume: 0.1,
    },
    category: 'ui',
    pitchVariation: 0.15,
  },
  
  'button-release': {
    synth: {
      type: 'square',
      frequency: 1600,
      duration: 0.02,
      volume: 0.06,
    },
    category: 'ui',
  },
  
  'toggle-on': {
    synth: {
      type: 'square',
      frequency: 1500,
      duration: 0.05,
      volume: 0.08,
    },
    category: 'ui',
  },
  
  'toggle-off': {
    synth: {
      type: 'square',
      frequency: 1000,
      duration: 0.05,
      volume: 0.08,
    },
    category: 'ui',
  },
  
  'knob-detent': {
    synth: {
      type: 'square',
      frequency: 2000,
      duration: 0.03,
      volume: 0.1,
    },
    category: 'ui',
    pitchVariation: 0.1,
  },
  
  'knob-rotate': {
    synth: {
      type: 'triangle',
      frequency: 800,
      duration: 0.08,
      volume: 0.04,
    },
    category: 'ui',
    pitchVariation: 0.2,
  },
  
  'slider-move': {
    synth: {
      type: 'sine',
      frequency: 600,
      duration: 0.03,
      volume: 0.02,
    },
    category: 'ui',
    pitchVariation: 0.3,
  },
  
  // ─────────────────────────────────────────────────────────
  // ALERT SOUNDS
  // ─────────────────────────────────────────────────────────
  
  'warning-chime': {
    synth: {
      type: 'triangle',
      frequency: 600,
      duration: 0.2,
      volume: 0.1,
      pitchEnvelope: -100,
    },
    category: 'alert',
  },
  
  'error-buzz': {
    synth: {
      type: 'square',
      frequency: 200,
      duration: 0.3,
      volume: 0.12,
    },
    category: 'alert',
  },
  
  'success-ding': {
    synth: {
      type: 'sine',
      frequency: 880,
      duration: 0.25,
      volume: 0.1,
      pitchEnvelope: 220,
    },
    category: 'alert',
  },
  
  'notification': {
    synth: {
      type: 'sine',
      frequency: 1000,
      duration: 0.15,
      volume: 0.08,
    },
    category: 'alert',
    pitchVariation: 0.1,
  },
};

// ═══════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════

const SoundManagerContext = createContext<SoundManagerContextValue | null>(null);

// ═══════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════

interface SoundManagerProviderProps {
  children: React.ReactNode;
  options?: SoundManagerOptions;
}

export const SoundManagerProvider: React.FC<SoundManagerProviderProps> = ({
  children,
  options = {},
}) => {
  const [isEnabled, setEnabled] = useState(options.enabled ?? true);
  const [masterVolume, setMasterVolume] = useState(options.masterVolume ?? 0.8);
  const [categoryVolumes, setCategoryVolumes] = useState<Record<SoundCategory, number>>({
    mechanical: options.categoryVolumes?.mechanical ?? 0.7,
    ui: options.categoryVolumes?.ui ?? 0.5,
    ambient: options.categoryVolumes?.ambient ?? 0.3,
    alert: options.categoryVolumes?.alert ?? 0.9,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const categoryGainsRef = useRef<Record<SoundCategory, GainNode> | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Create master gain
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.gain.value = masterVolume;
        masterGainRef.current.connect(audioContextRef.current.destination);
        
        // Create category gains
        categoryGainsRef.current = {
          mechanical: audioContextRef.current.createGain(),
          ui: audioContextRef.current.createGain(),
          ambient: audioContextRef.current.createGain(),
          alert: audioContextRef.current.createGain(),
        };
        
        // Connect category gains to master
        Object.entries(categoryGainsRef.current).forEach(([cat, gain]) => {
          gain.gain.value = categoryVolumes[cat as SoundCategory];
          gain.connect(masterGainRef.current!);
        });
      }
    };
    
    // Initialize on first user interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      audioContextRef.current?.close();
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        masterVolume,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [masterVolume]);

  // Play sound
  const play = useCallback((
    soundId: string,
    overrides?: Partial<SoundDefinition['synth']>
  ) => {
    if (!isEnabled || !audioContextRef.current || !categoryGainsRef.current) return;
    
    const sound = SOUND_LIBRARY[soundId];
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }
    
    const ctx = audioContextRef.current;
    const categoryGain = categoryGainsRef.current[sound.category];
    const config = { ...sound.synth, ...overrides };
    
    // Apply pitch variation
    let frequency = config.frequency;
    if (sound.pitchVariation) {
      const variation = (Math.random() - 0.5) * 2 * sound.pitchVariation;
      frequency *= (1 + variation);
    }
    
    // Create oscillator
    const osc = ctx.createOscillator();
    osc.type = config.type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Apply pitch envelope
    if (config.pitchEnvelope) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, frequency + config.pitchEnvelope),
        ctx.currentTime + config.duration
      );
    }
    
    // Create gain envelope
    const gain = ctx.createGain();
    const attack = config.attack ?? 0.005;
    const decay = config.decay ?? config.duration - attack;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + attack + decay);
    
    // Optional filter
    if (config.filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = config.filterFreq;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    
    gain.connect(categoryGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + config.duration + 0.1);
  }, [isEnabled]);

  // Set category volume
  const setCategoryVolume = useCallback((category: SoundCategory, volume: number) => {
    setCategoryVolumes(prev => ({ ...prev, [category]: volume }));
    
    if (categoryGainsRef.current && audioContextRef.current) {
      categoryGainsRef.current[category].gain.setValueAtTime(
        volume,
        audioContextRef.current.currentTime
      );
    }
  }, []);

  const value: SoundManagerContextValue = {
    play,
    setMasterVolume,
    setCategoryVolume,
    setEnabled,
    isEnabled,
    masterVolume,
  };

  return (
    <SoundManagerContext.Provider value={value}>
      {children}
    </SoundManagerContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════

export function useSoundManager(): SoundManagerContextValue {
  const context = useContext(SoundManagerContext);
  
  if (!context) {
    // Return a no-op implementation if used outside provider
    return {
      play: () => {},
      setMasterVolume: () => {},
      setCategoryVolume: () => {},
      setEnabled: () => {},
      isEnabled: false,
      masterVolume: 0,
    };
  }
  
  return context;
}

// ═══════════════════════════════════════════════════════════
// STANDALONE HOOK (no context required)
// ═══════════════════════════════════════════════════════════

export function useSoundEffects(options: SoundManagerOptions = {}): {
  play: (soundId: string, overrides?: Partial<SoundDefinition['synth']>) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
} {
  const [enabled, setEnabled] = useState(options.enabled ?? true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback((
    soundId: string,
    overrides?: Partial<SoundDefinition['synth']>
  ) => {
    if (!enabled) return;
    
    const sound = SOUND_LIBRARY[soundId];
    if (!sound) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const config = { ...sound.synth, ...overrides };
      
      let frequency = config.frequency;
      if (sound.pitchVariation) {
        frequency *= (1 + (Math.random() - 0.5) * 2 * sound.pitchVariation);
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = config.type;
      osc.frequency.value = frequency;
      
      const masterVol = options.masterVolume ?? 0.8;
      const catVol = options.categoryVolumes?.[sound.category] ?? 0.7;
      const finalVol = config.volume * masterVol * catVol;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(finalVol, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + config.duration + 0.1);
    } catch (e) {
      // Audio not available
    }
  }, [enabled, options.masterVolume, options.categoryVolumes]);

  return { play, enabled, setEnabled };
}

export default useSoundManager;

// ═══════════════════════════════════════════════════════════
// [SELF-CRITIQUE]
// 
// Improvements for next iteration:
// 1. Add support for loading and playing audio files (not just synthesis)
// 2. Implement spatial audio positioning with Web Audio panner
// 3. Add audio sprite sheet support for efficient loading
// 
// ═══════════════════════════════════════════════════════════
