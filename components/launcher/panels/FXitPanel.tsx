/**
 * FXitPanel.tsx
 * One-Click Professional Effects - Full implementation with REAL-TIME parameter control
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';

// Live effect chain interface - stores all node references for real-time updates
interface LiveEffectChain {
  effectId: string;
  source: AudioBufferSourceNode;
  nodes: Map<string, AudioNode>;
  outputNode: AudioNode;
}

// Effect parameter type
interface EffectParameter {
  id: string;
  name: string;
  defaultValue: number;
  min: number;
  max: number;
  unit?: string;
}

// Effect workflow type
interface EffectWorkflow {
  id: string;
  title: string;
  category: 'Instrumental' | 'Vocals' | 'Both' | 'Mastering';
  description: string;
  icon: string;
  defaultParams?: EffectParameter[];
}

// All available effects
const WORKFLOWS: EffectWorkflow[] = [
  // --- VOCALS ---
  { 
    id: 'vocal-clarity', 
    title: 'Vocal Clarity', 
    category: 'Vocals', 
    description: 'Deep-learning driven resonance correction.', 
    icon: '🎤',
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
    icon: '✨',
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
    icon: '📻',
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
    icon: '🔊',
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
    icon: '🌌',
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
    icon: '🎙️',
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
    icon: '🎸',
    defaultParams: [
      { id: 'sub', name: 'Sub Bass', defaultValue: 60, min: 0, max: 100, unit: '%' },
      { id: 'grit', name: 'Grit', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-lofi', 
    title: 'Lo-Fi Tape', 
    category: 'Instrumental', 
    description: 'Vintage wow/flutter and subtle saturation.', 
    icon: '📼',
    defaultParams: [
      { id: 'flutter', name: 'Flutter', defaultValue: 45, min: 0, max: 100, unit: '%' },
      { id: 'age', name: 'Tape Age', defaultValue: 60, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-guitar', 
    title: 'Shredder Heat', 
    category: 'Instrumental', 
    description: 'High-gain amp emulation with cabinet modeling.', 
    icon: '🎸',
    defaultParams: [
      { id: 'gain', name: 'Gain', defaultValue: 80, min: 0, max: 100, unit: '%' },
      { id: 'cab', name: 'Cab Res', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-keys', 
    title: 'Lucid Keys', 
    category: 'Instrumental', 
    description: 'Transient sharpening for piano/synths.', 
    icon: '🎹',
    defaultParams: [
      { id: 'shine', name: 'Shine', defaultValue: 65, min: 0, max: 100, unit: '%' },
      { id: 'attack', name: 'Transients', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'inst-drums', 
    title: 'Industrial Crunch', 
    category: 'Instrumental', 
    description: 'Bit-crushing and transient shaping for drums.', 
    icon: '🥁',
    defaultParams: [
      { id: 'crush', name: 'Crush', defaultValue: 40, min: 0, max: 100, unit: '%' },
      { id: 'punch', name: 'Punch', defaultValue: 70, min: 0, max: 100, unit: '%' }
    ] 
  },
  { 
    id: 'inst-pads', 
    title: 'Pad Sculptor', 
    category: 'Instrumental', 
    description: 'LFO-sync filtering and stereo rotation.', 
    icon: '☁️',
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
    description: 'Psychoacoustic stereo widening.', 
    icon: '↔️',
    defaultParams: [
      { id: 'width', name: 'Width', defaultValue: 75, min: 0, max: 100, unit: '%' },
      { id: 'center', name: 'Center', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-warp', 
    title: 'Time Warp', 
    category: 'Both', 
    description: 'Phase-coherent time stretching.', 
    icon: '⏱️',
    defaultParams: [
      { id: 'speed', name: 'Speed', defaultValue: 50, min: 0, max: 100, unit: '%' },
      { id: 'pitch', name: 'Pitch', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-mono', 
    title: 'Mono Integrity', 
    category: 'Both', 
    description: 'Fold to mono with phase-cancellation repair.', 
    icon: '🔘',
    defaultParams: [
      { id: 'blend', name: 'Blend', defaultValue: 100, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-clip', 
    title: 'Sonic Clipper', 
    category: 'Both', 
    description: 'Soft-knee clipping for maximum loudness.', 
    icon: '✂️',
    defaultParams: [
      { id: 'thresh', name: 'Ceiling', defaultValue: 90, min: 0, max: 100, unit: '%' },
      { id: 'knee', name: 'Soft Knee', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'proc-eq', 
    title: 'Dynamic AI-EQ', 
    category: 'Both', 
    description: 'Self-adjusting equalization curves.', 
    icon: '📊',
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
    description: 'Optimized for streaming platforms.', 
    icon: '🎧',
    defaultParams: [
      { id: 'lufs', name: 'Target', defaultValue: -14, min: -20, max: -6, unit: 'dB' },
      { id: 'ceiling', name: 'Ceiling', defaultValue: -1, min: -3, max: 0, unit: 'dB' }
    ]
  },
  { 
    id: 'mast-tape', 
    title: 'Analog Master', 
    category: 'Mastering', 
    description: 'Tape saturation and transformer color.', 
    icon: '🎞️',
    defaultParams: [
      { id: 'warmth', name: 'Warmth', defaultValue: 60, min: 0, max: 100, unit: '%' },
      { id: 'sat', name: 'Saturation', defaultValue: 40, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'mast-diamond', 
    title: 'Diamond Peak', 
    category: 'Mastering', 
    description: 'Transparent look-ahead limiting.', 
    icon: '💎',
    defaultParams: [
      { id: 'thresh', name: 'Threshold', defaultValue: 80, min: 0, max: 100, unit: '%' },
      { id: 'release', name: 'Release', defaultValue: 50, min: 20, max: 500, unit: 'ms' }
    ]
  },
  { 
    id: 'mast-console', 
    title: 'Console Glow', 
    category: 'Mastering', 
    description: 'UK console emulation with crosstalk.', 
    icon: '🎛️',
    defaultParams: [
      { id: 'drive', name: 'Input', defaultValue: 55, min: 0, max: 100, unit: '%' },
      { id: 'width', name: 'X-Talk', defaultValue: 30, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'mast-base', 
    title: 'Solid Foundation', 
    category: 'Mastering', 
    description: 'Mono-compatible sub filtering.', 
    icon: '🏛️',
    defaultParams: [
      { id: 'freq', name: 'Mono Freq', defaultValue: 120, min: 60, max: 200, unit: 'Hz' },
      { id: 'tight', name: 'Tightness', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ]
  },
  { 
    id: 'mast-holo', 
    title: 'Holographic FX', 
    category: 'Mastering', 
    description: 'Mid-Side spatial enhancement.', 
    icon: '🌀',
    defaultParams: [
      { id: 'depth', name: 'Depth', defaultValue: 60, min: 0, max: 100, unit: '%' },
      { id: 'wide', name: 'Width', defaultValue: 70, min: 0, max: 100, unit: '%' }
    ]
  }
];

const CATEGORIES = ['Vocals', 'Instrumental', 'Both', 'Mastering'] as const;

const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  'Vocals': { light: 'text-pink-600 bg-pink-50 border-pink-200', dark: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  'Instrumental': { light: 'text-blue-600 bg-blue-50 border-blue-200', dark: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  'Both': { light: 'text-emerald-600 bg-emerald-50 border-emerald-200', dark: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  'Mastering': { light: 'text-purple-600 bg-purple-50 border-purple-200', dark: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

// Mini waveform component
const MiniWaveform: React.FC<{ samples: number[]; isDark: boolean; color?: string }> = ({ samples, isDark, color }) => {
  return (
    <div className="h-16 flex items-center justify-center gap-[1px] overflow-hidden">
      {samples.map((sample, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full transition-all duration-150 ${color || (isDark ? 'bg-cyan-400' : 'bg-cyan-500')}`}
          style={{ height: `${Math.max(4, sample * 56)}px`, opacity: 0.6 + sample * 0.4 }}
        />
      ))}
    </div>
  );
};

// Helper: Generate waveshaper curve
const generateWaveShaperCurve = (drive: number, type: 'tanh' | 'softclip' | 'bitcrush' = 'tanh'): Float32Array => {
  const curve = new Float32Array(44100);
  for (let i = 0; i < 44100; i++) {
    const x = (i * 2) / 44100 - 1;
    if (type === 'tanh') {
      curve[i] = Math.tanh(x * drive);
    } else if (type === 'softclip') {
      const tanhDrive = Math.tanh(drive) || 1;
      curve[i] = Math.tanh(x * drive) / tanhDrive;
    } else {
      const steps = Math.max(4, Math.round(192 - drive * 1.6));
      curve[i] = Math.round(x * steps) / steps;
    }
  }
  return curve;
};

// Type-safe waveshaper curve setter
const setWaveShaperCurve = (shaper: WaveShaperNode, curve: Float32Array) => {
  (shaper as any).curve = curve;
};

// Build LIVE effect chain - returns node references for real-time updates
const buildLiveEffectChain = (
  ctx: AudioContext, 
  source: AudioBufferSourceNode, 
  effectId: string, 
  params: Record<string, number>
): LiveEffectChain => {
  const nodes = new Map<string, AudioNode>();
  let lastNode: AudioNode = source;

  if (effectId === 'vocal-deep') {
    const depthVal = params.depth ?? 40;
    const bodyVal = params.body ?? 60;
    const stretchVal = params.stretch ?? 75;
    const pitchVal = params.pitch ?? 0;
    const playbackRate = Math.min(2, Math.max(0.5, stretchVal / 100));
    source.playbackRate.value = playbackRate;
    source.detune.value = pitchVal * 100;
    const lowBoost = ctx.createBiquadFilter();
    lowBoost.type = 'lowshelf';
    lowBoost.frequency.value = 250;
    lowBoost.gain.value = (bodyVal - 50) / 6 + (depthVal - 50) / 10;
    nodes.set('lowBoost', lowBoost);
    lastNode.connect(lowBoost);
    lastNode = lowBoost;
  } else if (effectId === 'inst-lofi') {
    const flutterVal = params.flutter ?? 45;
    const ageVal = params.age ?? 60;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.2 + (flutterVal / 100) * 5;
    lfoGain.gain.value = (flutterVal / 100) * 40;
    lfo.connect(lfoGain);
    lfoGain.connect(source.detune);
    lfo.start();
    nodes.set('lfo', lfo);
    nodes.set('lfoGain', lfoGain);
    const lowPass = ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 3000 + (1 - ageVal / 100) * 12000;
    nodes.set('lowPass', lowPass);
    lastNode.connect(lowPass);
    lastNode = lowPass;
  } else if (effectId === 'inst-keys') {
    const shineVal = params.shine ?? 65;
    const attackVal = params.attack ?? 50;
    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 4500;
    highShelf.gain.value = (shineVal - 50) / 5;
    nodes.set('highShelf', highShelf);
    const gain = ctx.createGain();
    gain.gain.value = 1 + (attackVal / 250);
    nodes.set('gain', gain);
    lastNode.connect(highShelf);
    highShelf.connect(gain);
    lastNode = gain;
  } else if (effectId === 'inst-guitar') {
    const gainVal = params.gain ?? 80;
    const cabVal = params.cab ?? 50;
    const preGain = ctx.createGain();
    preGain.gain.value = 0.6 + (gainVal / 90);
    nodes.set('preGain', preGain);
    const shaper = ctx.createWaveShaper();
    setWaveShaperCurve(shaper, generateWaveShaperCurve(1.2 + gainVal / 35, 'tanh'));
    shaper.oversample = '4x';
    nodes.set('shaper', shaper);
    const cab = ctx.createBiquadFilter();
    cab.type = 'lowpass';
    cab.frequency.value = 1800 + (cabVal * 28);
    nodes.set('cab', cab);
    lastNode.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(cab);
    lastNode = cab;
  } else if (effectId === 'inst-drums') {
    const crushVal = params.crush ?? 40;
    const punchVal = params.punch ?? 70;
    if (crushVal > 0) {
      const shaper = ctx.createWaveShaper();
      setWaveShaperCurve(shaper, generateWaveShaperCurve(crushVal, 'bitcrush'));
      nodes.set('shaper', shaper);
      lastNode.connect(shaper);
      lastNode = shaper;
    }
    if (punchVal > 0) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -32 + (punchVal / 2.8);
      comp.ratio.value = 2 + (punchVal / 25);
      comp.attack.value = 0.002;
      comp.release.value = 0.12;
      nodes.set('comp', comp);
      lastNode.connect(comp);
      lastNode = comp;
    }
  } else if (effectId === 'inst-pads') {
    const moveVal = params.move ?? 50;
    const tremGain = ctx.createGain();
    tremGain.gain.value = 1;
    nodes.set('tremGain', tremGain);
    if (moveVal > 0) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08 + (moveVal / 100) * 0.9;
      lfoGain.gain.value = moveVal / 180;
      lfo.connect(lfoGain);
      lfoGain.connect(tremGain.gain);
      lfo.start();
      nodes.set('lfo', lfo);
      nodes.set('lfoGain', lfoGain);
    }
    lastNode.connect(tremGain);
    lastNode = tremGain;
  } else if (effectId === 'vocal-clarity') {
    const amountVal = params.amount ?? 70;
    const warmthVal = params.warmth ?? 40;
    const presenceVal = params.presence ?? 60;
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = (warmthVal - 50) / 6;
    nodes.set('lowShelf', lowShelf);
    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 3500;
    highShelf.gain.value = (presenceVal - 50) / 5;
    nodes.set('highShelf', highShelf);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -26 + (amountVal / 8);
    comp.ratio.value = 1.5 + (amountVal / 35);
    comp.attack.value = 0.005;
    comp.release.value = 0.18;
    nodes.set('comp', comp);
    lastNode.connect(lowShelf);
    lowShelf.connect(highShelf);
    highShelf.connect(comp);
    lastNode = comp;
  } else if (effectId === 'vocal-pop') {
    const driveVal = params.drive ?? 50;
    const compVal = params.comp ?? 65;
    const preGain = ctx.createGain();
    preGain.gain.value = 1 + (driveVal / 120);
    nodes.set('preGain', preGain);
    const shaper = ctx.createWaveShaper();
    setWaveShaperCurve(shaper, generateWaveShaperCurve(1.4 + driveVal / 60, 'tanh'));
    shaper.oversample = '2x';
    nodes.set('shaper', shaper);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -28 + (compVal / 3.2);
    comp.ratio.value = 2.5 + (compVal / 25);
    comp.attack.value = 0.004;
    comp.release.value = 0.14;
    nodes.set('comp', comp);
    lastNode.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(comp);
    lastNode = comp;
  } else if (effectId === 'vocal-tube') {
    const driveVal = params.drive ?? 60;
    const warmthVal = params.warmth ?? 50;
    const preGain = ctx.createGain();
    preGain.gain.value = 0.9 + (driveVal / 110);
    nodes.set('preGain', preGain);
    const shaper = ctx.createWaveShaper();
    setWaveShaperCurve(shaper, generateWaveShaperCurve(1.2 + driveVal / 70, 'tanh'));
    shaper.oversample = '2x';
    nodes.set('shaper', shaper);
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 250;
    lowShelf.gain.value = (warmthVal - 50) / 6;
    nodes.set('lowShelf', lowShelf);
    lastNode.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(lowShelf);
    lastNode = lowShelf;
  } else if (effectId === 'vocal-space') {
    const mixVal = params.mix ?? 40;
    const sizeVal = params.size ?? 75;
    const decayVal = params.decay ?? 50;
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.05 + (sizeVal / 100) * 0.35;
    nodes.set('delay', delay);
    const feedback = ctx.createGain();
    feedback.gain.value = 0.2 + (decayVal / 100) * 0.6;
    nodes.set('feedback', feedback);
    const wetGain = ctx.createGain();
    wetGain.gain.value = mixVal / 100;
    nodes.set('wetGain', wetGain);
    const dryGain = ctx.createGain();
    dryGain.gain.value = 1 - (mixVal / 100);
    nodes.set('dryGain', dryGain);
    lastNode.connect(dryGain);
    lastNode.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    const mix = ctx.createGain();
    dryGain.connect(mix);
    wetGain.connect(mix);
    nodes.set('mix', mix);
    lastNode = mix;
  } else if (effectId === 'vocal-pod') {
    const levelVal = params.level ?? 80;
    const gateVal = params.gate ?? 30;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -36 + (levelVal / 2.5);
    comp.ratio.value = 2 + (levelVal / 20);
    comp.attack.value = 0.004;
    comp.release.value = 0.12;
    nodes.set('comp', comp);
    const gate = ctx.createDynamicsCompressor();
    gate.threshold.value = -80 + (gateVal * 0.6);
    gate.ratio.value = 20;
    gate.attack.value = 0.001;
    gate.release.value = 0.08;
    nodes.set('gate', gate);
    lastNode.connect(gate);
    gate.connect(comp);
    lastNode = comp;
  } else if (effectId === 'inst-bass') {
    const subVal = params.sub ?? 60;
    const gritVal = params.grit ?? 30;
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 80;
    lowShelf.gain.value = (subVal - 50) / 4;
    nodes.set('lowShelf', lowShelf);
    const shaper = ctx.createWaveShaper();
    setWaveShaperCurve(shaper, generateWaveShaperCurve(1.1 + gritVal / 80, 'tanh'));
    nodes.set('shaper', shaper);
    lastNode.connect(lowShelf);
    lowShelf.connect(shaper);
    lastNode = shaper;
  } else if (effectId === 'proc-width') {
    const widthVal = params.width ?? 75;
    const centerVal = params.center ?? 50;
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    const mid = ctx.createGain();
    const side = ctx.createGain();
    const inverter = ctx.createGain();
    inverter.gain.value = -1;
    lastNode.connect(splitter);
    splitter.connect(mid, 0);
    splitter.connect(mid, 1);
    mid.gain.value = 0.5 + ((centerVal - 50) / 200);
    nodes.set('mid', mid);
    splitter.connect(side, 0);
    splitter.connect(inverter, 1);
    inverter.connect(side);
    side.gain.value = 0.4 + (widthVal / 100) * 1.2;
    nodes.set('side', side);
    mid.connect(merger, 0, 0);
    mid.connect(merger, 0, 1);
    side.connect(merger, 0, 0);
    const sidePhaseInvert = ctx.createGain();
    sidePhaseInvert.gain.value = -1;
    side.connect(sidePhaseInvert);
    sidePhaseInvert.connect(merger, 0, 1);
    lastNode = merger;
  } else if (effectId === 'proc-warp') {
    const speedVal = params.speed ?? 50;
    const pitchVal = params.pitch ?? 50;
    const playbackRate = Math.min(4, Math.max(0.25, speedVal / 50));
    source.playbackRate.value = playbackRate;
    source.detune.value = (pitchVal - 50) * 24;
  } else if (effectId === 'proc-mono') {
    const blendVal = params.blend ?? 100;
    const blendRatio = Math.min(1, Math.max(0, blendVal / 100));
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    const monoSum = ctx.createGain();
    monoSum.gain.value = 0.5;
    nodes.set('monoSum', monoSum);
    const monoGain = ctx.createGain();
    monoGain.gain.value = blendRatio;
    nodes.set('monoGain', monoGain);
    const dryGainL = ctx.createGain();
    const dryGainR = ctx.createGain();
    dryGainL.gain.value = 1 - blendRatio;
    dryGainR.gain.value = 1 - blendRatio;
    nodes.set('dryGainL', dryGainL);
    nodes.set('dryGainR', dryGainR);
    lastNode.connect(splitter);
    splitter.connect(monoSum, 0);
    splitter.connect(monoSum, 1);
    monoSum.connect(monoGain);
    monoGain.connect(merger, 0, 0);
    monoGain.connect(merger, 0, 1);
    splitter.connect(dryGainL, 0);
    splitter.connect(dryGainR, 1);
    dryGainL.connect(merger, 0, 0);
    dryGainR.connect(merger, 0, 1);
    lastNode = merger;
  } else if (effectId === 'proc-clip') {
    const threshVal = params.thresh ?? 90;
    const kneeVal = params.knee ?? 30;
    const shaper = ctx.createWaveShaper();
    const drive = 1 + (threshVal / 100) * 2;
    const knee = Math.max(1, kneeVal / 10);
    setWaveShaperCurve(shaper, generateWaveShaperCurve(drive, 'softclip'));
    shaper.oversample = '2x';
    nodes.set('shaper', shaper);
    lastNode.connect(shaper);
    lastNode = shaper;
  } else if (effectId === 'proc-eq') {
    const brightVal = params.bright ?? 50;
    const tameVal = params.tame ?? 40;
    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 4000;
    highShelf.gain.value = (brightVal - 50) / 5;
    nodes.set('highShelf', highShelf);
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = -(tameVal / 8);
    nodes.set('lowShelf', lowShelf);
    lastNode.connect(highShelf);
    highShelf.connect(lowShelf);
    lastNode = lowShelf;
  } else if (effectId === 'mast-lufs') {
    const lufsVal = params.lufs ?? -14;
    const ceilingVal = params.ceiling ?? -1;
    const gain = ctx.createGain();
    gain.gain.value = 1 + (lufsVal / -14) * 0.6;
    nodes.set('gain', gain);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22 + (ceilingVal * 2);
    comp.ratio.value = 3.5;
    comp.attack.value = 0.005;
    comp.release.value = 0.12;
    nodes.set('comp', comp);
    lastNode.connect(gain);
    gain.connect(comp);
    lastNode = comp;
  } else if (effectId === 'mast-tape') {
    const warmthVal = params.warmth ?? 60;
    const satVal = params.sat ?? 40;
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = (warmthVal - 50) / 6;
    nodes.set('lowShelf', lowShelf);
    const shaper = ctx.createWaveShaper();
    setWaveShaperCurve(shaper, generateWaveShaperCurve(1.1 + satVal / 60, 'tanh'));
    shaper.oversample = '2x';
    nodes.set('shaper', shaper);
    lastNode.connect(lowShelf);
    lowShelf.connect(shaper);
    lastNode = shaper;
  } else if (effectId === 'mast-diamond') {
    const threshVal = params.thresh ?? 80;
    const releaseVal = params.release ?? 50;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -28 + (threshVal / 3.5);
    comp.ratio.value = 6 + (threshVal / 20);
    comp.attack.value = 0.002;
    comp.release.value = Math.min(0.6, Math.max(0.04, releaseVal / 200));
    nodes.set('comp', comp);
    lastNode.connect(comp);
    lastNode = comp;
  } else if (effectId === 'mast-console') {
    const driveVal = params.drive ?? 55;
    const preGain = ctx.createGain();
    preGain.gain.value = 0.9 + (driveVal / 120);
    nodes.set('preGain', preGain);
    const shaper = ctx.createWaveShaper();
    setWaveShaperCurve(shaper, generateWaveShaperCurve(1.2 + driveVal / 80, 'tanh'));
    shaper.oversample = '2x';
    nodes.set('shaper', shaper);
    lastNode.connect(preGain);
    preGain.connect(shaper);
    lastNode = shaper;
  } else if (effectId === 'mast-base') {
    const freqVal = params.freq ?? 120;
    const tightVal = params.tight ?? 50;
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = freqVal;
    lowShelf.gain.value = 1 + (tightVal / 100) * 2;
    nodes.set('lowShelf', lowShelf);
    const lowCut = ctx.createBiquadFilter();
    lowCut.type = 'highpass';
    lowCut.frequency.value = Math.max(20, freqVal * 0.6);
    lowCut.Q.value = 0.7 + (tightVal / 200);
    nodes.set('lowCut', lowCut);
    lastNode.connect(lowCut);
    lowCut.connect(lowShelf);
    lastNode = lowShelf;
  } else if (effectId === 'mast-holo') {
    const depthVal = params.depth ?? 60;
    const wideVal = params.wide ?? 70;
    const gain = ctx.createGain();
    gain.gain.value = 1 + (depthVal / 200);
    nodes.set('gain', gain);
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    const mid = ctx.createGain();
    const side = ctx.createGain();
    const inverter = ctx.createGain();
    inverter.gain.value = -1;
    lastNode.connect(gain);
    gain.connect(splitter);
    splitter.connect(mid, 0);
    splitter.connect(mid, 1);
    mid.gain.value = 0.5;
    nodes.set('mid', mid);
    splitter.connect(side, 0);
    splitter.connect(inverter, 1);
    inverter.connect(side);
    side.gain.value = 0.4 + (wideVal / 100) * 1.2;
    nodes.set('side', side);
    mid.connect(merger, 0, 0);
    mid.connect(merger, 0, 1);
    side.connect(merger, 0, 0);
    const sidePhaseInvert = ctx.createGain();
    sidePhaseInvert.gain.value = -1;
    side.connect(sidePhaseInvert);
    sidePhaseInvert.connect(merger, 0, 1);
    lastNode = merger;
  }

  return { effectId, source, nodes, outputNode: lastNode };
};

// Update live effect chain parameters in real-time
const updateLiveEffectParams = (
  chain: LiveEffectChain,
  params: Record<string, number>
): void => {
  const { effectId, source, nodes } = chain;

  if (effectId === 'vocal-deep') {
    const depthVal = params.depth ?? 40;
    const bodyVal = params.body ?? 60;
    const stretchVal = params.stretch ?? 75;
    const pitchVal = params.pitch ?? 0;
    source.playbackRate.value = Math.min(2, Math.max(0.5, stretchVal / 100));
    source.detune.value = pitchVal * 100;
    const lowBoost = nodes.get('lowBoost') as BiquadFilterNode;
    if (lowBoost) lowBoost.gain.value = (bodyVal - 50) / 6 + (depthVal - 50) / 10;
  } else if (effectId === 'inst-lofi') {
    const flutterVal = params.flutter ?? 45;
    const ageVal = params.age ?? 60;
    const lfo = nodes.get('lfo') as OscillatorNode;
    const lfoGain = nodes.get('lfoGain') as GainNode;
    const lowPass = nodes.get('lowPass') as BiquadFilterNode;
    if (lfo) lfo.frequency.value = 0.2 + (flutterVal / 100) * 5;
    if (lfoGain) lfoGain.gain.value = (flutterVal / 100) * 40;
    if (lowPass) lowPass.frequency.value = 3000 + (1 - ageVal / 100) * 12000;
  } else if (effectId === 'inst-keys') {
    const shineVal = params.shine ?? 65;
    const attackVal = params.attack ?? 50;
    const highShelf = nodes.get('highShelf') as BiquadFilterNode;
    const gain = nodes.get('gain') as GainNode;
    if (highShelf) highShelf.gain.value = (shineVal - 50) / 5;
    if (gain) gain.gain.value = 1 + (attackVal / 250);
  } else if (effectId === 'inst-guitar') {
    const gainVal = params.gain ?? 80;
    const cabVal = params.cab ?? 50;
    const preGain = nodes.get('preGain') as GainNode;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    const cab = nodes.get('cab') as BiquadFilterNode;
    if (preGain) preGain.gain.value = 0.6 + (gainVal / 90);
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(1.2 + gainVal / 35, 'tanh'));
    if (cab) cab.frequency.value = 1800 + (cabVal * 28);
  } else if (effectId === 'inst-drums') {
    const crushVal = params.crush ?? 40;
    const punchVal = params.punch ?? 70;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    const comp = nodes.get('comp') as DynamicsCompressorNode;
    if (shaper && crushVal > 0) setWaveShaperCurve(shaper, generateWaveShaperCurve(crushVal, 'bitcrush'));
    if (comp && punchVal > 0) {
      comp.threshold.value = -32 + (punchVal / 2.8);
      comp.ratio.value = 2 + (punchVal / 25);
    }
  } else if (effectId === 'inst-pads') {
    const moveVal = params.move ?? 50;
    const lfo = nodes.get('lfo') as OscillatorNode;
    const lfoGain = nodes.get('lfoGain') as GainNode;
    if (lfo) lfo.frequency.value = 0.08 + (moveVal / 100) * 0.9;
    if (lfoGain) lfoGain.gain.value = moveVal / 180;
  } else if (effectId === 'vocal-clarity') {
    const amountVal = params.amount ?? 70;
    const warmthVal = params.warmth ?? 40;
    const presenceVal = params.presence ?? 60;
    const lowShelf = nodes.get('lowShelf') as BiquadFilterNode;
    const highShelf = nodes.get('highShelf') as BiquadFilterNode;
    const comp = nodes.get('comp') as DynamicsCompressorNode;
    if (lowShelf) lowShelf.gain.value = (warmthVal - 50) / 6;
    if (highShelf) highShelf.gain.value = (presenceVal - 50) / 5;
    if (comp) {
      comp.threshold.value = -26 + (amountVal / 8);
      comp.ratio.value = 1.5 + (amountVal / 35);
    }
  } else if (effectId === 'vocal-pop') {
    const driveVal = params.drive ?? 50;
    const compVal = params.comp ?? 65;
    const preGain = nodes.get('preGain') as GainNode;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    const comp = nodes.get('comp') as DynamicsCompressorNode;
    if (preGain) preGain.gain.value = 1 + (driveVal / 120);
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(1.4 + driveVal / 60, 'tanh'));
    if (comp) {
      comp.threshold.value = -28 + (compVal / 3.2);
      comp.ratio.value = 2.5 + (compVal / 25);
    }
  } else if (effectId === 'vocal-tube') {
    const driveVal = params.drive ?? 60;
    const warmthVal = params.warmth ?? 50;
    const preGain = nodes.get('preGain') as GainNode;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    const lowShelf = nodes.get('lowShelf') as BiquadFilterNode;
    if (preGain) preGain.gain.value = 0.9 + (driveVal / 110);
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(1.2 + driveVal / 70, 'tanh'));
    if (lowShelf) lowShelf.gain.value = (warmthVal - 50) / 6;
  } else if (effectId === 'vocal-space') {
    const mixVal = params.mix ?? 40;
    const sizeVal = params.size ?? 75;
    const decayVal = params.decay ?? 50;
    const delay = nodes.get('delay') as DelayNode;
    const feedback = nodes.get('feedback') as GainNode;
    const wetGain = nodes.get('wetGain') as GainNode;
    const dryGain = nodes.get('dryGain') as GainNode;
    if (delay) delay.delayTime.value = 0.05 + (sizeVal / 100) * 0.35;
    if (feedback) feedback.gain.value = 0.2 + (decayVal / 100) * 0.6;
    if (wetGain) wetGain.gain.value = mixVal / 100;
    if (dryGain) dryGain.gain.value = 1 - (mixVal / 100);
  } else if (effectId === 'vocal-pod') {
    const levelVal = params.level ?? 80;
    const gateVal = params.gate ?? 30;
    const comp = nodes.get('comp') as DynamicsCompressorNode;
    const gate = nodes.get('gate') as DynamicsCompressorNode;
    if (comp) {
      comp.threshold.value = -36 + (levelVal / 2.5);
      comp.ratio.value = 2 + (levelVal / 20);
    }
    if (gate) gate.threshold.value = -80 + (gateVal * 0.6);
  } else if (effectId === 'inst-bass') {
    const subVal = params.sub ?? 60;
    const gritVal = params.grit ?? 30;
    const lowShelf = nodes.get('lowShelf') as BiquadFilterNode;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    if (lowShelf) lowShelf.gain.value = (subVal - 50) / 4;
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(1.1 + gritVal / 80, 'tanh'));
  } else if (effectId === 'proc-width') {
    const widthVal = params.width ?? 75;
    const centerVal = params.center ?? 50;
    const mid = nodes.get('mid') as GainNode;
    const side = nodes.get('side') as GainNode;
    if (mid) mid.gain.value = 0.5 + ((centerVal - 50) / 200);
    if (side) side.gain.value = 0.4 + (widthVal / 100) * 1.2;
  } else if (effectId === 'proc-warp') {
    const speedVal = params.speed ?? 50;
    const pitchVal = params.pitch ?? 50;
    source.playbackRate.value = Math.min(4, Math.max(0.25, speedVal / 50));
    source.detune.value = (pitchVal - 50) * 24;
  } else if (effectId === 'proc-mono') {
    const blendVal = params.blend ?? 100;
    const blendRatio = Math.min(1, Math.max(0, blendVal / 100));
    const monoGain = nodes.get('monoGain') as GainNode;
    const dryGainL = nodes.get('dryGainL') as GainNode;
    const dryGainR = nodes.get('dryGainR') as GainNode;
    if (monoGain) monoGain.gain.value = blendRatio;
    if (dryGainL) dryGainL.gain.value = 1 - blendRatio;
    if (dryGainR) dryGainR.gain.value = 1 - blendRatio;
  } else if (effectId === 'proc-clip') {
    const threshVal = params.thresh ?? 90;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    const drive = 1 + (threshVal / 100) * 2;
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(drive, 'softclip'));
  } else if (effectId === 'proc-eq') {
    const brightVal = params.bright ?? 50;
    const tameVal = params.tame ?? 40;
    const highShelf = nodes.get('highShelf') as BiquadFilterNode;
    const lowShelf = nodes.get('lowShelf') as BiquadFilterNode;
    if (highShelf) highShelf.gain.value = (brightVal - 50) / 5;
    if (lowShelf) lowShelf.gain.value = -(tameVal / 8);
  } else if (effectId === 'mast-lufs') {
    const lufsVal = params.lufs ?? -14;
    const ceilingVal = params.ceiling ?? -1;
    const gain = nodes.get('gain') as GainNode;
    const comp = nodes.get('comp') as DynamicsCompressorNode;
    if (gain) gain.gain.value = 1 + (lufsVal / -14) * 0.6;
    if (comp) comp.threshold.value = -22 + (ceilingVal * 2);
  } else if (effectId === 'mast-tape') {
    const warmthVal = params.warmth ?? 60;
    const satVal = params.sat ?? 40;
    const lowShelf = nodes.get('lowShelf') as BiquadFilterNode;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    if (lowShelf) lowShelf.gain.value = (warmthVal - 50) / 6;
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(1.1 + satVal / 60, 'tanh'));
  } else if (effectId === 'mast-diamond') {
    const threshVal = params.thresh ?? 80;
    const releaseVal = params.release ?? 50;
    const comp = nodes.get('comp') as DynamicsCompressorNode;
    if (comp) {
      comp.threshold.value = -28 + (threshVal / 3.5);
      comp.ratio.value = 6 + (threshVal / 20);
      comp.release.value = Math.min(0.6, Math.max(0.04, releaseVal / 200));
    }
  } else if (effectId === 'mast-console') {
    const driveVal = params.drive ?? 55;
    const preGain = nodes.get('preGain') as GainNode;
    const shaper = nodes.get('shaper') as WaveShaperNode;
    if (preGain) preGain.gain.value = 0.9 + (driveVal / 120);
    if (shaper) setWaveShaperCurve(shaper, generateWaveShaperCurve(1.2 + driveVal / 80, 'tanh'));
  } else if (effectId === 'mast-base') {
    const freqVal = params.freq ?? 120;
    const tightVal = params.tight ?? 50;
    const lowShelf = nodes.get('lowShelf') as BiquadFilterNode;
    const lowCut = nodes.get('lowCut') as BiquadFilterNode;
    if (lowShelf) {
      lowShelf.frequency.value = freqVal;
      lowShelf.gain.value = 1 + (tightVal / 100) * 2;
    }
    if (lowCut) {
      lowCut.frequency.value = Math.max(20, freqVal * 0.6);
      lowCut.Q.value = 0.7 + (tightVal / 200);
    }
  } else if (effectId === 'mast-holo') {
    const depthVal = params.depth ?? 60;
    const wideVal = params.wide ?? 70;
    const gain = nodes.get('gain') as GainNode;
    const side = nodes.get('side') as GainNode;
    if (gain) gain.gain.value = 1 + (depthVal / 200);
    if (side) side.gain.value = 0.4 + (wideVal / 100) * 1.2;
  }
};

// Build effect chain for offline rendering (unchanged behavior)
const buildEffectChain = (
  ctx: AudioContext, 
  source: AudioBufferSourceNode, 
  effectId: string, 
  params: Record<string, number>
): AudioNode => {
  const chain = buildLiveEffectChain(ctx, source, effectId, params);
  return chain.outputNode;
};

// Render processed audio to a new buffer
const renderProcessedAudio = async (
  ctx: AudioContext,
  buffer: AudioBuffer,
  effectId: string,
  params: Record<string, number>
): Promise<AudioBuffer> => {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  
  const lastNode = buildEffectChain(offlineCtx as unknown as AudioContext, source, effectId, params);
  lastNode.connect(offlineCtx.destination);
  
  source.start(0);
  return await offlineCtx.startRendering();
};

// Get waveform samples from buffer
const getSamplesFromBuffer = (buffer: AudioBuffer, numSamples: number): number[] => {
  const channel = buffer.getChannelData(0);
  const samples: number[] = [];
  const blockSize = Math.floor(channel.length / numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    const start = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channel[start + j]);
    }
    samples.push(sum / blockSize);
  }
  
  const max = Math.max(...samples) || 1;
  return samples.map(s => s / max);
};

// Convert buffer to WAV blob
const bufferToWave = (buffer: AudioBuffer): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

export const FXitPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [samples, setSamples] = useState<number[]>([]);
  const [processedSamples, setProcessedSamples] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Vocals');
  const [selectedEffect, setSelectedEffect] = useState<EffectWorkflow | null>(null);
  const [effectParams, setEffectParams] = useState<Record<string, number>>({});
  const [compareMode, setCompareMode] = useState<'before' | 'after'>('after');
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const effectNodesRef = useRef<AudioNode[]>([]);
  const liveChainRef = useRef<LiveEffectChain | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => { ctx.close(); };
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !audioContext) return;
    const file = e.target.files[0];
    setFileName(file.name);
    stopPlayback();
    setProcessedBuffer(null);
    setProcessedSamples([]);
    setSelectedEffect(null);
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    setBuffer(audioBuffer);
    setSamples(getSamplesFromBuffer(audioBuffer, 100));
  };
  
  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
    }
    // Clean up effect nodes
    effectNodesRef.current.forEach(node => {
      try { node.disconnect(); } catch (e) {}
    });
    effectNodesRef.current = [];
    // Clear live chain reference
    if (liveChainRef.current) {
      liveChainRef.current.nodes.forEach(node => {
        try { node.disconnect(); } catch (e) {}
      });
      liveChainRef.current = null;
    }
    setIsPlaying(false);
    setIsPreviewing(false);
  }, []);
  
  // Realtime preview - plays audio through live effect chain with real-time parameter control
  const playPreview = useCallback(() => {
    if (!audioContext || !buffer || !selectedEffect) return;
    
    stopPlayback();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Build LIVE effect chain and store reference for real-time updates
    const liveChain = buildLiveEffectChain(audioContext, source, selectedEffect.id, effectParams);
    liveChainRef.current = liveChain;
    liveChain.outputNode.connect(audioContext.destination);
    
    source.start(0);
    sourceRef.current = source;
    setIsPlaying(true);
    setIsPreviewing(true);
    
    source.onended = () => {
      setIsPlaying(false);
      setIsPreviewing(false);
      sourceRef.current = null;
      liveChainRef.current = null;
    };
  }, [audioContext, buffer, selectedEffect, effectParams, stopPlayback]);
  
  const playAudio = useCallback((useProcessed: boolean) => {
    if (!audioContext) return;
    const targetBuffer = useProcessed && processedBuffer ? processedBuffer : buffer;
    if (!targetBuffer) return;
    
    stopPlayback();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = targetBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    sourceRef.current = source;
    setIsPlaying(true);
    
    source.onended = () => {
      setIsPlaying(false);
      sourceRef.current = null;
    };
  }, [audioContext, buffer, processedBuffer, stopPlayback]);
  
  const handleSelectEffect = useCallback((effect: EffectWorkflow) => {
    setSelectedEffect(effect);
    // Initialize params with defaults
    const defaults: Record<string, number> = {};
    effect.defaultParams?.forEach(p => {
      defaults[p.id] = p.defaultValue;
    });
    setEffectParams(defaults);
    setProcessedBuffer(null);
    setProcessedSamples([]);
  }, []);
  
  const handleApplyEffect = useCallback(async () => {
    if (!audioContext || !buffer || !selectedEffect) return;
    
    setIsProcessing(true);
    stopPlayback();
    
    try {
      const processed = await renderProcessedAudio(audioContext, buffer, selectedEffect.id, effectParams);
      setProcessedBuffer(processed);
      setProcessedSamples(getSamplesFromBuffer(processed, 100));
      setCompareMode('after');
    } catch (e) {
      console.error('Processing failed:', e);
    } finally {
      setIsProcessing(false);
    }
  }, [audioContext, buffer, selectedEffect, effectParams, stopPlayback]);
  
  const handleDownload = useCallback(() => {
    const targetBuffer = processedBuffer || buffer;
    if (!targetBuffer) return;
    
    const blob = bufferToWave(targetBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = processedBuffer && selectedEffect ? `_${selectedEffect.id}` : '';
    a.download = fileName.replace(/\.[^.]+$/, '') + suffix + '.wav';
    a.click();
    URL.revokeObjectURL(url);
  }, [buffer, processedBuffer, fileName, selectedEffect]);
  
  // Handle parameter changes - updates state AND live audio chain in real-time
  const handleParamChange = useCallback((paramId: string, value: number) => {
    setEffectParams(prev => {
      const newParams = { ...prev, [paramId]: value };
      
      // Update live effect chain in real-time during preview
      if (isPreviewing && liveChainRef.current) {
        try {
          updateLiveEffectParams(liveChainRef.current, newParams);
        } catch (e) {
          console.warn('Live param update failed:', e);
        }
      }
      
      return newParams;
    });
  }, [isPreviewing]);
  
  const filteredEffects = WORKFLOWS.filter(w => w.category === activeCategory);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          FXit – One-Click Effects
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Professional effect chains in a single click. Load audio, pick an effect, and export.
        </p>
      </div>
      
      {/* File Upload */}
      <div className={`rounded-xl p-6 mb-6 border ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Load audio file"
        />
        
        {!buffer ? (
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full py-12 rounded-xl border-2 border-dashed transition-colors ${
              isDark
                ? 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50'
                : 'border-slate-300 hover:border-cyan-500/50 hover:bg-slate-50'
            }`}
          >
            <div className="text-4xl mb-3">🎵</div>
            <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Click to load audio file
            </div>
            <div className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              MP3, WAV, FLAC, OGG supported
            </div>
          </motion.button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-lg font-mono text-sm ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {fileName}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`text-sm ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}
                >
                  Change file
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isPlaying) stopPlayback();
                    else playAudio(compareMode === 'after' && !!processedBuffer);
                  }}
                  className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors ${
                    isDark
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200'
                  }`}
                >
                  {isPlaying ? '■ Stop' : '▶ Play'}
                </button>
              </div>
            </div>
            
            {/* Waveform comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setCompareMode('before')}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  compareMode === 'before'
                    ? isDark ? 'border-cyan-500 bg-slate-800/80' : 'border-cyan-500 bg-cyan-50'
                    : isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className={`text-xs font-mono uppercase tracking-wider mb-2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Original
                </div>
                <MiniWaveform samples={samples} isDark={isDark} />
              </div>
              <div 
                onClick={() => processedBuffer && setCompareMode('after')}
                className={`p-4 rounded-xl transition-all border-2 ${
                  processedBuffer ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                } ${
                  compareMode === 'after' && processedBuffer
                    ? isDark ? 'border-emerald-500 bg-slate-800/80' : 'border-emerald-500 bg-emerald-50'
                    : isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className={`text-xs font-mono uppercase tracking-wider mb-2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Processed
                </div>
                {processedSamples.length > 0 ? (
                  <MiniWaveform samples={processedSamples} isDark={isDark} color={isDark ? 'bg-emerald-400' : 'bg-emerald-500'} />
                ) : (
                  <div className={`h-16 flex items-center justify-center text-sm ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Select and apply an effect
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Effects Browser */}
      {buffer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories & Effects List */}
          <div className="lg:col-span-2">
            {/* Category tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all border ${
                    activeCategory === cat
                      ? isDark ? CATEGORY_COLORS[cat].dark : CATEGORY_COLORS[cat].light
                      : isDark 
                        ? 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Effects grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredEffects.map((effect, i) => (
                  <motion.button
                    key={effect.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectEffect(effect)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      selectedEffect?.id === effect.id
                        ? isDark 
                          ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30' 
                          : 'bg-cyan-50 border-cyan-300 ring-2 ring-cyan-200'
                        : isDark 
                          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="text-2xl mb-2">{effect.icon}</div>
                    <div className={`font-medium text-sm mb-1 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {effect.title}
                    </div>
                    <div className={`text-xs line-clamp-2 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {effect.description}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Selected Effect Panel */}
          <div className={`rounded-xl p-5 border ${
            isDark 
              ? 'bg-slate-900/50 border-slate-800' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {selectedEffect ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{selectedEffect.icon}</div>
                  <div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEffect.title}
                    </div>
                    <div className={`text-xs ${
                      isDark ? CATEGORY_COLORS[selectedEffect.category].dark.split(' ')[0] : CATEGORY_COLORS[selectedEffect.category].light.split(' ')[0]
                    }`}>
                      {selectedEffect.category}
                    </div>
                  </div>
                </div>
                
                <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedEffect.description}
                </p>
                
                {/* Parameters */}
                {selectedEffect.defaultParams && selectedEffect.defaultParams.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {selectedEffect.defaultParams.map(param => (
                      <div key={param.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            {param.name}
                          </span>
                          <span className={`font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            {effectParams[param.id] ?? param.defaultValue}{param.unit || ''}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          value={effectParams[param.id] ?? param.defaultValue}
                          onChange={(e) => handleParamChange(param.id, Number(e.target.value))}
                          aria-label={param.name}
                          className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700 [&::-webkit-slider-thumb]:bg-cyan-400' 
                              : 'bg-slate-200 [&::-webkit-slider-thumb]:bg-cyan-500'
                          } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Realtime Preview button */}
                <motion.button
                  onClick={() => isPreviewing ? stopPlayback() : playPreview()}
                  disabled={!buffer}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider transition-all mb-3 ${
                    !buffer
                      ? isDark 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isPreviewing
                        ? isDark 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30' 
                          : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                        : isDark 
                          ? 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isPreviewing ? '■ Stop Preview' : '▶ Live Preview'}
                </motion.button>
                
                {/* Apply button */}
                <motion.button
                  onClick={handleApplyEffect}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider transition-all ${
                    isProcessing
                      ? isDark 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-400 hover:to-emerald-400' 
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ⏳
                      </motion.span>
                      Processing...
                    </span>
                  ) : (
                    'Apply Effect'
                  )}
                </motion.button>
                
                {/* Download button */}
                {processedBuffer && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleDownload}
                    className={`w-full mt-3 py-3 rounded-xl font-mono text-sm uppercase tracking-wider border transition-all ${
                      isDark 
                        ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10' 
                        : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    ⬇ Download Processed
                  </motion.button>
                )}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <div className="text-4xl mb-3">👆</div>
                <div className="text-sm">Select an effect from the left to get started</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FXitPanel;
