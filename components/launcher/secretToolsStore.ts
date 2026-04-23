/**
 * secretToolsStore.ts
 * Hidden tools accessible via secret keyboard combination
 * Ctrl+Alt+Insert, Insert, Insert (within 500ms)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SecretTool {
  id: string;
  name: string;
  codename: string;
  description: string;
  icon: string;
  tier: 'free' | 'pro' | 'pro_plus' | 'secret';
  status: 'prototype' | 'alpha' | 'beta' | 'ready';
  requiresInstall?: boolean;
  installSize?: string;
  category: 'ai' | 'audio' | 'developer' | 'experimental';
}

export const SECRET_TOOLS: SecretTool[] = [
  {
    id: 'smart-prompt-it',
    name: 'SmartPromptIt',
    codename: 'gprompt3300',
    description: 'Universal AI prompt enhancement engine. Detects any AI platform (ChatGPT, Claude, Gemini, etc.) and transforms your raw thoughts into elite-tier prompts tailored for each specific AI.',
    icon: '⚡',
    tier: 'secret',
    status: 'alpha',
    requiresInstall: true,
    installSize: '48 MB',
    category: 'ai'
  },
  {
    id: 'stem-iso',
    name: 'Stem Surgeon',
    codename: 'isolator3300',
    description: 'Experimental AI that can isolate individual instruments within a stem. Extract just the hi-hats from drums, or just the backing vocals.',
    icon: '🔬',
    tier: 'pro_plus',
    status: 'prototype',
    category: 'audio'
  },
  {
    id: 'time-stretch-x',
    name: 'HalfScrew',
    codename: 'QUANTUM_TIME',
    description: 'Next-gen time stretching with phase-aware spectral processing. Extreme tempo changes with zero artifacts. Independent or linked pitch/time control with secret mix knob.',
    icon: '⏱️',
    tier: 'pro_plus',
    status: 'alpha',
    category: 'audio'
  },
  {
    id: 'vocal-cloneit',
    name: 'VocalClone',
    codename: 'VOICE_DNA',
    description: 'Create a voice model from any audio. Requires explicit consent verification. For legal use only.',
    icon: '🎙️',
    tier: 'pro_plus',
    status: 'prototype',
    category: 'ai'
  },
  {
    id: 'audio-repair',
    name: 'AudioRepair',
    codename: 'RESTORATION',
    description: 'AI-powered audio restoration. Remove clicks, pops, hum, and background noise from damaged recordings.',
    icon: '🩹',
    tier: 'pro',
    status: 'beta',
    category: 'audio'
  },
  {
    id: 'dev-console',
    name: 'DevConsole',
    codename: 'ROOT_ACCESS',
    description: 'Advanced developer tools. Access internal APIs, debug audio processing, view telemetry.',
    icon: '🖥️',
    tier: 'secret',
    status: 'ready',
    category: 'developer'
  },
  {
    id: 'plugin-link',
    name: 'PluginBridge',
    codename: 'VST_LINK',
    description: 'Load VST3/AU plugins within NoDAW. Experimental host implementation.',
    icon: '🔌',
    tier: 'pro_plus',
    status: 'prototype',
    category: 'experimental'
  },
  {
    id: 'midi-gen',
    name: 'MIDIGenIt',
    codename: 'MELODY_AI',
    description: 'Generate MIDI patterns using AI. Chord progressions, bass lines, drum patterns, and melodies.',
    icon: '🎹',
    tier: 'pro',
    status: 'alpha',
    category: 'ai'
  }
];

interface SecretToolsState {
  // Access state
  isUnlocked: boolean;
  unlockSequenceProgress: number;  // 0-3 for the insert taps
  lastKeyTime: number;
  modifiersHeld: boolean;  // Ctrl+Alt held
  
  // Installed tools
  installedTools: string[];
  installProgress: Record<string, number>;  // Tool ID -> progress 0-100
  
  // UI state
  isMenuOpen: boolean;
  selectedTool: SecretTool | null;
  showInstallModal: boolean;
  
  // Actions
  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
  resetSequence: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  selectTool: (tool: SecretTool | null) => void;
  startInstall: (toolId: string) => void;
  cancelInstall: (toolId: string) => void;
  isToolInstalled: (toolId: string) => boolean;
  getToolInstallProgress: (toolId: string) => number;
}

const SEQUENCE_TIMEOUT = 500;  // ms between insert taps
const REQUIRED_TAPS = 3;

export const useSecretToolsStore = create<SecretToolsState>()(
  persist(
    (set, get) => ({
      isUnlocked: false,
      unlockSequenceProgress: 0,
      lastKeyTime: 0,
      modifiersHeld: false,
      
      installedTools: [],
      installProgress: {},
      
      isMenuOpen: false,
      selectedTool: null,
      showInstallModal: false,
      
      handleKeyDown: (e: KeyboardEvent) => {
        const state = get();
        
        // Track Ctrl+Alt being held
        if ((e.ctrlKey && e.altKey) || (e.key === 'Control' && e.altKey) || (e.key === 'Alt' && e.ctrlKey)) {
          set({ modifiersHeld: true });
        }
        
        // Check for Insert key while Ctrl+Alt held
        if (e.key === 'Insert' && state.modifiersHeld) {
          e.preventDefault();
          
          const now = Date.now();
          const timeSinceLastKey = now - state.lastKeyTime;
          
          // Reset if too much time has passed
          if (timeSinceLastKey > SEQUENCE_TIMEOUT && state.unlockSequenceProgress > 0) {
            set({ unlockSequenceProgress: 1, lastKeyTime: now });
            return;
          }
          
          const newProgress = state.unlockSequenceProgress + 1;
          
          if (newProgress >= REQUIRED_TAPS) {
            // Sequence complete!
            set({ 
              isUnlocked: true, 
              unlockSequenceProgress: 0,
              isMenuOpen: true,
              lastKeyTime: now
            });
            
            // Play unlock sound if available
            try {
              const audio = new Audio('/sounds/unlock.wav');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
            
            console.log('🔓 Secret Tools Unlocked!');
          } else {
            set({ 
              unlockSequenceProgress: newProgress, 
              lastKeyTime: now 
            });
          }
        }
        
        // Escape closes menu
        if (e.key === 'Escape' && state.isMenuOpen) {
          set({ isMenuOpen: false, selectedTool: null, showInstallModal: false });
        }
      },
      
      handleKeyUp: (e: KeyboardEvent) => {
        // Track when Ctrl or Alt is released
        if (e.key === 'Control' || e.key === 'Alt') {
          set({ modifiersHeld: false });
        }
      },
      
      resetSequence: () => {
        set({ unlockSequenceProgress: 0, lastKeyTime: 0 });
      },
      
      openMenu: () => {
        set({ isMenuOpen: true });
      },
      
      closeMenu: () => {
        set({ isMenuOpen: false, selectedTool: null, showInstallModal: false });
      },
      
      selectTool: (tool) => {
        set({ selectedTool: tool, showInstallModal: tool?.requiresInstall || false });
      },
      
      startInstall: (toolId: string) => {
        const state = get();
        
        // Already installed?
        if (state.installedTools.includes(toolId)) return;
        
        // Start installation progress simulation
        set(s => ({ 
          installProgress: { ...s.installProgress, [toolId]: 0 } 
        }));
        
        // Simulate download/install progress
        const interval = setInterval(() => {
          const current = get().installProgress[toolId] || 0;
          
          if (current >= 100) {
            clearInterval(interval);
            set(s => ({
              installedTools: [...s.installedTools, toolId],
              installProgress: { ...s.installProgress, [toolId]: 100 },
              showInstallModal: false
            }));
            return;
          }
          
          // Variable progress speed
          const increment = Math.random() * 8 + 2;
          set(s => ({
            installProgress: { 
              ...s.installProgress, 
              [toolId]: Math.min(100, current + increment) 
            }
          }));
        }, 200);
      },
      
      cancelInstall: (toolId: string) => {
        set(s => {
          const newProgress = { ...s.installProgress };
          delete newProgress[toolId];
          return { installProgress: newProgress };
        });
      },
      
      isToolInstalled: (toolId: string) => {
        return get().installedTools.includes(toolId);
      },
      
      getToolInstallProgress: (toolId: string) => {
        return get().installProgress[toolId] || 0;
      }
    }),
    {
      name: 'nodaw-secret-tools',
      partialize: (state) => ({
        isUnlocked: state.isUnlocked,
        installedTools: state.installedTools
      })
    }
  )
);

// Global keyboard listener setup
export const initSecretToolsListener = () => {
  const { handleKeyDown, handleKeyUp } = useSecretToolsStore.getState();
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
};
