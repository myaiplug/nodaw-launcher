import { EffectWorkflow } from './types';

export const WORKFLOWS: EffectWorkflow[] = [
  // --- VOCALS ---
  { 
    id: 'vocal-clarity', 
    title: 'Vocal Clarity', 
    category: 'Vocals', 
    description: 'Deep-learning driven resonance correction.', 
    icon: 'vocal',
    defaultParams: [
      { id: 'amount', name: 'Amount', defaultValue: 70, min: 0, max: 100, unit: '%' },
      { id: 'warmth', name: 'Warmth', defaultValue: 40, min: 0, max: 100, unit: '%' },
      { id: 'presence', name: 'Presence', defaultValue: 60, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'vocal-pop', 
    title: 'Studio Pop', 
    category: 'Vocals', 
    description: 'Commercial-grade compression and saturation.', 
    icon: 'sparkles',
    defaultParams: [
      { id: 'drive', name: 'Drive', defaultValue: 50, min: 0, max: 100, unit: '%' },
      { id: 'comp', name: 'Compression', defaultValue: 65, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'vocal-tube', 
    title: 'Vintage Tube', 
    category: 'Vocals', 
    description: 'Warm second-order harmonic saturation.', 
    icon: 'radio',
    defaultParams: [
        { id: 'drive', name: 'Drive', defaultValue: 60, min: 0, max: 100, unit: '%' },
        { id: 'warmth', name: 'Warmth', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'vocal-deep', 
    title: 'Voice Deepener', 
    category: 'Vocals', 
    description: 'Formant-aware pitch manipulation.', 
    icon: 'user',
    defaultParams: [
        { id: 'depth', name: 'Depth', defaultValue: 40, min: 0, max: 100, unit: '%' },
        { id: 'body', name: 'Body', defaultValue: 60, min: 0, max: 100, unit: '%' },
        { id: 'stretch', name: 'Time Stretch', defaultValue: 75, min: 50, max: 200, unit: '%' },
        { id: 'pitch', name: 'Pitch Bend', defaultValue: 0, min: -12, max: 12, unit: 'st' }
    ]
  },
  { 
    id: 'vocal-space', 
    title: 'Ethereal Space', 
    category: 'Vocals', 
    description: 'Multi-tap delay combined with reverb.', 
    icon: 'waves',
    defaultParams: [
        { id: 'mix', name: 'Mix', defaultValue: 40, min: 0, max: 100, unit: '%' },
        { id: 'size', name: 'Size', defaultValue: 75, min: 0, max: 100, unit: '%' },
        { id: 'decay', name: 'Decay', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'vocal-pod', 
    title: 'Podcast Master', 
    category: 'Vocals', 
    description: 'Intelligent leveling and noise gating.', 
    icon: 'mic',
    defaultParams: [
        { id: 'level', name: 'Leveling', defaultValue: 80, min: 0, max: 100, unit: '%' },
        { id: 'gate', name: 'Gate Thresh', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },

  // --- INSTRUMENTAL ---
  { 
    id: 'inst-bass', 
    title: 'Bass Drive', 
    category: 'Instrumental', 
    description: 'Sub-harmonic synthesis and low-end saturation.', 
    icon: 'volume',
    defaultParams: [
      { id: 'sub', name: 'Sub Bass', defaultValue: 60, min: 0, max: 100, unit: '%' },
      { id: 'grit', name: 'Grit', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-lofi', 
    title: 'Lo-Fi Tape', 
    category: 'Instrumental', 
    description: 'Vintage wow/flutter and subtle saturation for nostalgic warmth.', 
    icon: 'tape',
    defaultParams: [
        { id: 'flutter', name: 'Flutter', defaultValue: 45, min: 0, max: 100, unit: '%' },
        { id: 'age', name: 'Tape Age', defaultValue: 60, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-guitar', 
    title: 'Shredder Heat', 
    category: 'Instrumental', 
    description: 'High-gain amp emulation with impulse response cabinet modeling.', 
    icon: 'guitar',
    defaultParams: [
        { id: 'gain', name: 'Gain', defaultValue: 80, min: 0, max: 100, unit: '%' },
        { id: 'cab', name: 'Cab Res', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-keys', 
    title: 'Lucid Keys', 
    category: 'Instrumental', 
    description: 'Transient sharpening and high-frequency excitation for piano/synths.', 
    icon: 'keys',
    defaultParams: [
        { id: 'shine', name: 'Shine', defaultValue: 65, min: 0, max: 100, unit: '%' },
        { id: 'attack', name: 'Transients', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-drums', 
    title: 'Industrial Crunch', 
    category: 'Instrumental', 
    description: 'Parallel bit-crushing and aggressive transient shaping for drums.', 
    icon: 'drum',
    defaultParams: [
        { id: 'crush', name: 'Crush', defaultValue: 40, min: 0, max: 100, unit: '%' },
        { id: 'punch', name: 'Punch', defaultValue: 70, min: 0, max: 100, unit: '%' }
    ] 
  },
  { 
    id: 'inst-pads', 
    title: 'Pad Sculptor', 
    category: 'Instrumental', 
    description: 'Dynamic movement via LFO-sync filtering and stereo rotation.', 
    icon: 'cloud',
    defaultParams: [
        { id: 'move', name: 'Movement', defaultValue: 50, min: 0, max: 100, unit: '%' },
        { id: 'width', name: 'Width', defaultValue: 80, min: 0, max: 100, unit: '%' }
    ]
  },

  // --- BOTH ---
  { 
    id: 'proc-width', 
    title: 'Airy Width', 
    category: 'Both', 
    description: 'Intelligent psychoacoustic stereo widening and balancing.', 
    icon: 'width',
    defaultParams: [
        { id: 'width', name: 'Width', defaultValue: 75, min: 0, max: 100, unit: '%' },
        { id: 'center', name: 'Center', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-warp', 
    title: 'Time Warp', 
    category: 'Both', 
    description: 'Phase-coherent time stretching without frequency artifacts.', 
    icon: 'clock',
    defaultParams: [
        { id: 'speed', name: 'Speed', defaultValue: 50, min: 0, max: 100, unit: '%' },
        { id: 'pitch', name: 'Pitch', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-mono', 
    title: 'Mono Integrity', 
    category: 'Both', 
    description: 'Folds signals to mono with active phase-cancellation repair.', 
    icon: 'mono',
    defaultParams: [
        { id: 'blend', name: 'Blend', defaultValue: 100, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-neural', 
    title: 'Neural De-Verb', 
    category: 'Both', 
    description: 'AI-driven reflection removal to dry out room recordings.', 
    icon: 'brain',
    defaultParams: [
        { id: 'dry', name: 'Dryness', defaultValue: 80, min: 0, max: 100, unit: '%' },
        { id: 'ambience', name: 'Room', defaultValue: 20, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-clip', 
    title: 'Sonic Clipper', 
    category: 'Both', 
    description: 'Soft-knee hard clipping to shave peaks for maximum loudness.', 
    icon: 'scissors',
    defaultParams: [
        { id: 'thresh', name: 'Ceiling', defaultValue: 90, min: 0, max: 100, unit: '%' },
        { id: 'knee', name: 'Soft Knee', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-eq', 
    title: 'Dynamic AI-EQ', 
    category: 'Both', 
    description: 'Self-adjusting equalization curves based on harmonic content.', 
    icon: 'barchart',
    defaultParams: [
        { id: 'bright', name: 'Bright', defaultValue: 50, min: 0, max: 100, unit: '%' },
        { id: 'tame', name: 'Tame Lows', defaultValue: 40, min: 0, max: 100, unit: '%' }
    ]
  },

  // --- MASTERING ---
  { 
    id: 'mast-lufs', 
    title: 'LUFS Target', 
    category: 'Mastering', 
    description: 'Optimized for Spotify, Apple Music, and YouTube loudness standards.', 
    icon: 'headphones',
    defaultParams: [
        { id: 'lufs', name: 'Target', defaultValue: -14, min: -20, max: -6, unit: 'dB' },
        { id: 'ceiling', name: 'Ceiling', defaultValue: -1, min: -3, max: 0, unit: 'dB' }
    ]
  },
  { 
    id: 'mast-tape', 
    title: 'Analog Master', 
    category: 'Mastering', 
    description: 'Final-stage tape saturation and soft-clipping transformer color.', 
    icon: 'film',
    defaultParams: [
        { id: 'warmth', name: 'Warmth', defaultValue: 60, min: 0, max: 100, unit: '%' },
        { id: 'sat', name: 'Saturation', defaultValue: 40, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'mast-diamond', 
    title: 'Diamond Peak', 
    category: 'Mastering', 
    description: 'Transparent look-ahead limiting with 0dB ceiling protection.', 
    icon: 'diamond',
    defaultParams: [
        { id: 'thresh', name: 'Threshold', defaultValue: 80, min: 0, max: 100, unit: '%' },
        { id: 'release', name: 'Release', defaultValue: 50, min: 20, max: 500, unit: 'ms' }
    ]
  },
  { 
    id: 'mast-console', 
    title: 'Console Glow', 
    category: 'Mastering', 
    description: 'Emulates the crosstalk and saturation of high-end UK consoles.', 
    icon: 'sliders',
    defaultParams: [
        { id: 'drive', name: 'Input', defaultValue: 55, min: 0, max: 100, unit: '%' },
        { id: 'width', name: 'X-Talk', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'mast-base', 
    title: 'Solid Foundation', 
    category: 'Mastering', 
    description: 'Mono-compatible sub filtering and low-end phase alignment.', 
    icon: 'layers',
    defaultParams: [
        { id: 'freq', name: 'Mono Freq', defaultValue: 120, min: 60, max: 200, unit: 'Hz' },
        { id: 'tight', name: 'Tightness', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'mast-holo', 
    title: 'Holographic FX', 
    category: 'Mastering', 
    description: 'Mid-Side spatial enhancement for immersive depth and height.', 
    icon: 'orbit',
    defaultParams: [
        { id: 'depth', name: 'Depth', defaultValue: 60, min: 0, max: 100, unit: '%' },
        { id: 'wide', name: 'Width', defaultValue: 70, min: 0, max: 100, unit: '%' }
    ]
  }
];

export const MOCK_SAMPLES = Array.from({ length: 200 }, () => Math.random() * 0.8 + 0.1);

export const features = [
  {
    id: 'audio-analysis',
    name: 'Audio Analysis',
    description: 'Visualize and analyze your audio files with advanced waveforms and spectral tools.',
    icon: '🔎',
    ariaLabel: 'Audio Analysis feature',
    preview: 'Waveform and spectrum preview',
  },
  {
    id: 'trim-it',
    name: 'Trim It',
    description: 'Quickly trim, split, and export audio segments with precision.',
    icon: '✂️',
    ariaLabel: 'Trim It feature',
    preview: 'Trim and split preview',
  },
  {
    id: 'icon-genius',
    name: 'Icon Genius',
    description: 'Generate beautiful icons and artwork for your projects in seconds.',
    icon: '🎨',
    ariaLabel: 'Icon Genius feature',
    preview: 'Icon preview',
  },
  {
    id: 'launcher-hub',
    name: 'Launcher Hub',
    description: 'Central hub to access all NoDAW tools and manage your workflow.',
    icon: '🚀',
    ariaLabel: 'Launcher Hub feature',
    preview: 'Hub preview',
  },
];
