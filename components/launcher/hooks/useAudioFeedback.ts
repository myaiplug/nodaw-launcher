/**
 * useAudioFeedback.ts
 * Procedural audio feedback for UI interactions using Web Audio API
 * Generates subtle, synth-like tones without requiring audio files
 */

import { useRef, useCallback, useEffect } from 'react';
import { useThemeStore } from '../themeStore';

type FeedbackType = 'hover' | 'click' | 'success' | 'error' | 'lock' | 'unlock';

interface AudioFeedbackConfig {
  enabled: boolean;
  volume: number; // 0-1
}

// Procedural sound parameters per feedback type
const SOUND_PARAMS: Record<FeedbackType, {
  frequency: number;
  type: OscillatorType;
  duration: number;
  attack: number;
  release: number;
  detune?: number;
  harmonics?: number[];
}> = {
  hover: {
    frequency: 880, // A5
    type: 'sine',
    duration: 0.08,
    attack: 0.01,
    release: 0.06,
    detune: -5
  },
  click: {
    frequency: 440, // A4
    type: 'triangle',
    duration: 0.1,
    attack: 0.005,
    release: 0.08
  },
  success: {
    frequency: 523.25, // C5
    type: 'sine',
    duration: 0.2,
    attack: 0.01,
    release: 0.15,
    harmonics: [1, 1.5, 2] // C-G-C chord
  },
  error: {
    frequency: 220, // A3
    type: 'sawtooth',
    duration: 0.15,
    attack: 0.01,
    release: 0.12,
    detune: 20
  },
  lock: {
    frequency: 300,
    type: 'triangle',
    duration: 0.12,
    attack: 0.02,
    release: 0.1
  },
  unlock: {
    frequency: 660, // E5
    type: 'sine',
    duration: 0.25,
    attack: 0.01,
    release: 0.2,
    harmonics: [1, 1.26, 1.5] // Major chord
  }
};

/**
 * Creates a procedural audio feedback system
 */
export function useAudioFeedback(config?: Partial<AudioFeedbackConfig>) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  
  // Default config
  const settings = {
    enabled: config?.enabled ?? true,
    volume: config?.volume ?? 0.08 // Very subtle by default
  };
  
  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = settings.volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    } catch (e) {
      console.warn('Audio feedback unavailable:', e);
    }
  }, [settings.volume]);
  
  // Play a procedural sound
  const play = useCallback((type: FeedbackType) => {
    if (!settings.enabled) return;
    
    // Debounce rapid triggers
    const now = performance.now();
    if (now - lastPlayTimeRef.current < 50) return;
    lastPlayTimeRef.current = now;
    
    // Lazy init
    if (!audioContextRef.current) {
      initAudio();
    }
    
    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current;
    if (!ctx || !masterGain) return;
    
    // Resume if suspended (due to browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const params = SOUND_PARAMS[type];
    const currentTime = ctx.currentTime;
    
    // Create nodes
    const oscillators: OscillatorNode[] = [];
    const gainEnvelope = ctx.createGain();
    gainEnvelope.connect(masterGain);
    
    // Create main oscillator(s)
    const frequencies = params.harmonics 
      ? params.harmonics.map(h => params.frequency * h)
      : [params.frequency];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = params.type;
      osc.frequency.value = freq;
      if (params.detune) {
        osc.detune.value = params.detune;
      }
      
      // Lower gain for harmonics
      const harmonicGain = ctx.createGain();
      harmonicGain.gain.value = i === 0 ? 1 : 0.4;
      harmonicGain.connect(gainEnvelope);
      osc.connect(harmonicGain);
      oscillators.push(osc);
    });
    
    // ADSR envelope (simplified)
    gainEnvelope.gain.setValueAtTime(0, currentTime);
    gainEnvelope.gain.linearRampToValueAtTime(1, currentTime + params.attack);
    gainEnvelope.gain.linearRampToValueAtTime(0, currentTime + params.duration);
    
    // Start and schedule stop
    oscillators.forEach(osc => {
      osc.start(currentTime);
      osc.stop(currentTime + params.duration + 0.01);
    });
  }, [settings.enabled, initAudio]);
  
  // Update volume
  const setVolume = useCallback((vol: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, vol));
    }
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);
  
  return {
    play,
    setVolume,
    playHover: useCallback(() => play('hover'), [play]),
    playClick: useCallback(() => play('click'), [play]),
    playSuccess: useCallback(() => play('success'), [play]),
    playError: useCallback(() => play('error'), [play]),
    playLock: useCallback(() => play('lock'), [play]),
    playUnlock: useCallback(() => play('unlock'), [play])
  };
}

/**
 * Global audio feedback singleton for use outside React
 */
let globalAudioFeedback: ReturnType<typeof useAudioFeedback> | null = null;

export function getGlobalAudioFeedback() {
  if (!globalAudioFeedback) {
    // Create a minimal implementation for outside React
    let ctx: AudioContext | null = null;
    let gain: GainNode | null = null;
    
    const init = () => {
      if (ctx) return;
      try {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        gain = ctx.createGain();
        gain.gain.value = 0.08;
        gain.connect(ctx.destination);
      } catch {}
    };
    
    const play = (type: FeedbackType) => {
      init();
      if (!ctx || !gain) return;
      
      if (ctx.state === 'suspended') ctx.resume();
      
      const params = SOUND_PARAMS[type];
      const osc = ctx.createOscillator();
      const envGain = ctx.createGain();
      
      osc.type = params.type;
      osc.frequency.value = params.frequency;
      if (params.detune) osc.detune.value = params.detune;
      
      envGain.connect(gain);
      osc.connect(envGain);
      
      const t = ctx.currentTime;
      envGain.gain.setValueAtTime(0, t);
      envGain.gain.linearRampToValueAtTime(1, t + params.attack);
      envGain.gain.linearRampToValueAtTime(0, t + params.duration);
      
      osc.start(t);
      osc.stop(t + params.duration + 0.01);
    };
    
    globalAudioFeedback = {
      play,
      setVolume: (v: number) => { if (gain) gain.gain.value = v; },
      playHover: () => play('hover'),
      playClick: () => play('click'),
      playSuccess: () => play('success'),
      playError: () => play('error'),
      playLock: () => play('lock'),
      playUnlock: () => play('unlock')
    };
  }
  return globalAudioFeedback;
}

export default useAudioFeedback;
