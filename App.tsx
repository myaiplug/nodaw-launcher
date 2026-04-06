
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppTab } from './types';
import { ConvertTab, TrimTab, CompareTab, EffectsTab, MultiTrackTab } from './components/Tabs';
import { PeakMeter, SpectralAnalyzer } from './components/Visualizer';
import { Paywall, LicenseBadge } from './components/Paywall';
import { LicenseState, loadLicense, canAccessFeature, FeatureKey } from './license';
import { analyzeAudio, AudioAnalysisResult } from './audioAnalysis';
import { AudioAnalysisPanel, CompactBpmDisplay } from './components/AudioAnalysisPanel';
import { LauncherHub, LauncherButton } from './components/LauncherHub';

// Theme type
type Theme = 'dark' | 'light';

// Map tabs to feature keys for license checking
const TAB_FEATURES: Record<AppTab, FeatureKey> = {
  [AppTab.CONVERT]: 'convert',
  [AppTab.TRIM]: 'trim',
  [AppTab.COMPARE]: 'compare',
  [AppTab.EFFECTS]: 'effects',
  [AppTab.MULTITRACK]: 'multitrack',
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CONVERT);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [bufferHistory, setBufferHistory] = useState<AudioBuffer[]>([]);
  
  // License State
  const [license, setLicense] = useState<LicenseState>(() => loadLicense());
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string>('');
  
  // Theme State (dark by default - Cyber HUD)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('nodaw-theme');
    return (saved === 'light' ? 'light' : 'dark') as Theme;
  });
  
  // Sync theme to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    localStorage.setItem('nodaw-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  // Audio Analysis State
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Launcher Hub State
  const [showLauncher, setShowLauncher] = useState(false);
  
  // A/B Comparison State
  const [bufferA, setBufferA] = useState<AudioBuffer | null>(null);
  const [bufferB, setBufferB] = useState<AudioBuffer | null>(null);

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState<{ ext: string; mime: string } | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [previewEffectIds, setPreviewEffectIds] = useState<string[]>([]);
  const [previewEffectParams, setPreviewEffectParams] = useState<Record<string, Record<string, number>>>({});

  // Refs
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const playbackParamsRef = useRef<{ start: number; loop: boolean; end: number }>({ start: 0, loop: false, end: 1 });
  const gainNodeRef = useRef<GainNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSourceTabRef = useRef<AppTab | null>(null);
  const prevPreviewEffectIdsRef = useRef<string>('');
  const prevPreviewEffectParamsRef = useRef<string>('');
  const lastPreviewEffectIdRef = useRef<string | null>(null);
  const effectNodesRef = useRef<Record<string, Record<string, AudioNode | null>>>({
    vocalDeep: { lowBoost: null },
    instLofi: { lowPass: null },
    instKeys: { highShelf: null },
    instGuitar: { cab: null },
    instDrums: { comp: null },
    instPads: { tremGain: null },
    instBass: { lowShelf: null },
    vocalClarity: { lowShelf: null, highShelf: null, comp: null },
    vocalPop: { comp: null },
    vocalTube: { lowShelf: null },
    vocalSpace: { delay: null, feedback: null, wetGain: null, dryGain: null },
    vocalPod: { comp: null },
    procWidth: { mid: null, side: null },
    procNeural: { dryGain: null, ambienceGain: null },
    procEq: { highShelf: null, lowShelf: null },
    mastLufs: { gain: null, comp: null },
    mastTape: { lowShelf: null },
    mastDiamond: { comp: null },
    mastConsole: { mid: null, side: null },
    mastBase: { lowShelf: null, lowCut: null },
    mastHolo: { gain: null, mid: null, side: null },
  });

  // Audio effect chain builder
  const buildEffectChain = useCallback((ctx: AudioContext, source: AudioBufferSourceNode, ids: string[], allParams: Record<string, Record<string, number>>) => {
    let lastNode: AudioNode = source;

    // Reset effect nodes
    Object.keys(effectNodesRef.current).forEach(key => {
      Object.keys(effectNodesRef.current[key]).forEach(subKey => {
        effectNodesRef.current[key][subKey] = null;
      });
    });

    ids.forEach((id) => {
      const params = allParams[id] || {};

      if (id === 'vocal-deep') {
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
        lastNode.connect(lowBoost);
        effectNodesRef.current.vocalDeep.lowBoost = lowBoost;
        lastNode = lowBoost;
      } else if (id === 'inst-lofi') {
        const flutterVal = params.flutter ?? 45;
        const ageVal = params.age ?? 60;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.2 + (flutterVal / 100) * 5;
        lfoGain.gain.value = (flutterVal / 100) * 40;
        lfo.connect(lfoGain);
        lfoGain.connect(source.detune);
        lfo.start();

        const lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 3000 + (1 - ageVal / 100) * 12000;
        effectNodesRef.current.instLofi.lowPass = lowPass;
        lastNode.connect(lowPass);
        lastNode = lowPass;
      } else if (id === 'inst-keys') {
        const shineVal = params.shine ?? 65;
        const attackVal = params.attack ?? 50;

        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 4500;
        highShelf.gain.value = (shineVal - 50) / 5;
        effectNodesRef.current.instKeys.highShelf = highShelf;
        
        const gain = ctx.createGain();
        gain.gain.value = 1 + (attackVal / 250);
        lastNode.connect(highShelf);
        highShelf.connect(gain);
        lastNode = gain;
      } else if (id === 'inst-guitar') {
        const gainVal = params.gain ?? 80;
        const cabVal = params.cab ?? 50;

        const preGain = ctx.createGain();
        preGain.gain.value = 0.6 + (gainVal / 90);
        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          curve[i] = Math.tanh(x * (1.2 + gainVal / 35));
        }
        shaper.curve = curve;
        shaper.oversample = '4x';

        const cab = ctx.createBiquadFilter();
        cab.type = 'lowpass';
        cab.frequency.value = 1800 + (cabVal * 28);
        effectNodesRef.current.instGuitar.cab = cab;

        lastNode.connect(preGain);
        preGain.connect(shaper);
        shaper.connect(cab);
        lastNode = cab;
      } else if (id === 'inst-drums') {
        const crushVal = params.crush ?? 40;
        const punchVal = params.punch ?? 70;

        if (crushVal > 0) {
          const shaper = ctx.createWaveShaper();
          const steps = Math.max(4, Math.round(192 - crushVal * 1.6));
          const curve = new Float32Array(256);
          for (let i = 0; i < 256; i++) {
            const x = (i / 255) * 2 - 1;
            curve[i] = Math.round(x * steps) / steps;
          }
          shaper.curve = curve;
          lastNode.connect(shaper);
          lastNode = shaper;
        }

        if (punchVal > 0) {
          const comp = ctx.createDynamicsCompressor();
          comp.threshold.value = -32 + (punchVal / 2.8);
          comp.ratio.value = 2 + (punchVal / 25);
          comp.attack.value = 0.002;
          comp.release.value = 0.12;
          effectNodesRef.current.instDrums.comp = comp;
          lastNode.connect(comp);
          lastNode = comp;
        }
      } else if (id === 'inst-pads') {
        const moveVal = params.move ?? 50;
        const widthVal = params.width ?? 80;

        const tremGain = ctx.createGain();
        tremGain.gain.value = 1;
        effectNodesRef.current.instPads.tremGain = tremGain;
        if (moveVal > 0) {
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 0.08 + (moveVal / 100) * 0.9;
          lfoGain.gain.value = moveVal / 180;
          lfo.connect(lfoGain);
          lfoGain.connect(tremGain.gain);
          lfo.start();
        }
        lastNode.connect(tremGain);
        lastNode = tremGain;

        if (widthVal !== 50) {
          const splitter = ctx.createChannelSplitter(2);
          const merger = ctx.createChannelMerger(2);
          const mid = ctx.createGain();
          const side = ctx.createGain();
          const inverter = ctx.createGain();
          inverter.gain.value = -1;
          lastNode.connect(splitter);
          splitter.connect(mid, 0);
          splitter.connect(mid, 1);
          mid.gain.value = 0.5;
          splitter.connect(side, 0);
          splitter.connect(inverter, 1);
          inverter.connect(side);
          side.gain.value = 0.4 + (widthVal / 100);
          mid.connect(merger, 0, 0);
          mid.connect(merger, 0, 1);
          side.connect(merger, 0, 0);
          const sidePhaseInvert = ctx.createGain();
          sidePhaseInvert.gain.value = -1;
          side.connect(sidePhaseInvert);
          sidePhaseInvert.connect(merger, 0, 1);
          lastNode = merger;
        }
      } else if (id === 'vocal-clarity') {
        const amountVal = params.amount ?? 70;
        const warmthVal = params.warmth ?? 40;
        const presenceVal = params.presence ?? 60;

        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 200;
        lowShelf.gain.value = (warmthVal - 50) / 6;
        effectNodesRef.current.vocalClarity.lowShelf = lowShelf;

        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 3500;
        highShelf.gain.value = (presenceVal - 50) / 5;
        effectNodesRef.current.vocalClarity.highShelf = highShelf;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -26 + (amountVal / 8);
        comp.ratio.value = 1.5 + (amountVal / 35);
        comp.attack.value = 0.005;
        comp.release.value = 0.18;
        effectNodesRef.current.vocalClarity.comp = comp;

        lastNode.connect(lowShelf);
        lowShelf.connect(highShelf);
        highShelf.connect(comp);
        lastNode = comp;
      } else if (id === 'vocal-pop') {
        const driveVal = params.drive ?? 50;
        const compVal = params.comp ?? 65;

        const preGain = ctx.createGain();
        preGain.gain.value = 1 + (driveVal / 120);
        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          curve[i] = Math.tanh(x * (1.4 + driveVal / 60));
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -28 + (compVal / 3.2);
        comp.ratio.value = 2.5 + (compVal / 25);
        comp.attack.value = 0.004;
        comp.release.value = 0.14;
        effectNodesRef.current.vocalPop.comp = comp;

        lastNode.connect(preGain);
        preGain.connect(shaper);
        shaper.connect(comp);
        lastNode = comp;
      } else if (id === 'vocal-tube') {
        const driveVal = params.drive ?? 60;
        const warmthVal = params.warmth ?? 50;

        const preGain = ctx.createGain();
        preGain.gain.value = 0.9 + (driveVal / 110);
        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          curve[i] = Math.tanh(x * (1.2 + driveVal / 70));
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 250;
        lowShelf.gain.value = (warmthVal - 50) / 6;
        effectNodesRef.current.vocalTube.lowShelf = lowShelf;

        lastNode.connect(preGain);
        preGain.connect(shaper);
        shaper.connect(lowShelf);
        lastNode = lowShelf;
      } else if (id === 'vocal-space') {
        const mixVal = params.mix ?? 40;
        const sizeVal = params.size ?? 75;
        const decayVal = params.decay ?? 50;

        const delay = ctx.createDelay(1.0);
        delay.delayTime.value = 0.05 + (sizeVal / 100) * 0.35;
        effectNodesRef.current.vocalSpace.delay = delay;

        const feedback = ctx.createGain();
        feedback.gain.value = 0.2 + (decayVal / 100) * 0.6;
        effectNodesRef.current.vocalSpace.feedback = feedback;

        const wetGain = ctx.createGain();
        wetGain.gain.value = mixVal / 100;
        effectNodesRef.current.vocalSpace.wetGain = wetGain;
        const dryGain = ctx.createGain();
        dryGain.gain.value = 1 - (mixVal / 100);
        effectNodesRef.current.vocalSpace.dryGain = dryGain;

        lastNode.connect(dryGain);
        lastNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wetGain);

        const mix = ctx.createGain();
        dryGain.connect(mix);
        wetGain.connect(mix);
        lastNode = mix;
      } else if (id === 'vocal-pod') {
        const levelVal = params.level ?? 80;
        const gateVal = params.gate ?? 30;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -36 + (levelVal / 2.5);
        comp.ratio.value = 2 + (levelVal / 20);
        comp.attack.value = 0.004;
        comp.release.value = 0.12;
        effectNodesRef.current.vocalPod.comp = comp;

        const gate = ctx.createDynamicsCompressor();
        gate.threshold.value = -80 + (gateVal * 0.6);
        gate.ratio.value = 20;
        gate.attack.value = 0.001;
        gate.release.value = 0.08;

        lastNode.connect(gate);
        gate.connect(comp);
        lastNode = comp;
      } else if (id === 'proc-width') {
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
        effectNodesRef.current.procWidth.mid = mid;
        splitter.connect(side, 0);
        splitter.connect(inverter, 1);
        inverter.connect(side);
        side.gain.value = 0.4 + (widthVal / 100) * 1.2;
        effectNodesRef.current.procWidth.side = side;
        mid.connect(merger, 0, 0);
        mid.connect(merger, 0, 1);
        side.connect(merger, 0, 0);
        const sidePhaseInvert = ctx.createGain();
        sidePhaseInvert.gain.value = -1;
        side.connect(sidePhaseInvert);
        sidePhaseInvert.connect(merger, 0, 1);
        lastNode = merger;
      } else if (id === 'proc-warp') {
        const speedVal = params.speed ?? 50;
        const pitchVal = params.pitch ?? 50;
        const playbackRate = Math.min(4, Math.max(0.25, speedVal / 50));
        source.playbackRate.value = playbackRate;
        source.detune.value = (pitchVal - 50) * 24;
      } else if (id === 'proc-mono') {
        const blendVal = params.blend ?? 100;
        const blendRatio = Math.min(1, Math.max(0, blendVal / 100));

        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        const monoSum = ctx.createGain();
        monoSum.gain.value = 0.5;
        const monoGain = ctx.createGain();
        monoGain.gain.value = blendRatio;
        const dryGainL = ctx.createGain();
        const dryGainR = ctx.createGain();
        dryGainL.gain.value = 1 - blendRatio;
        dryGainR.gain.value = 1 - blendRatio;

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
      } else if (id === 'proc-neural') {
        const dryVal = params.dry ?? 80;
        const ambienceVal = params.ambience ?? 20;

        const dryGain = ctx.createGain();
        dryGain.gain.value = 0.6 + (dryVal / 100) * 0.8;
        effectNodesRef.current.procNeural.dryGain = dryGain;

        const ambienceGain = ctx.createGain();
        ambienceGain.gain.value = 0.2 + (ambienceVal / 100) * 0.6;
        effectNodesRef.current.procNeural.ambienceGain = ambienceGain;

        const blend = ctx.createGain();
        lastNode.connect(dryGain);
        lastNode.connect(ambienceGain);
        dryGain.connect(blend);
        ambienceGain.connect(blend);
        lastNode = blend;
      } else if (id === 'proc-clip') {
        const threshVal = params.thresh ?? 90;
        const kneeVal = params.knee ?? 30;

        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        const drive = 1 + (threshVal / 100) * 2;
        const knee = Math.max(1, kneeVal / 10);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          curve[i] = Math.tanh(x * drive) / Math.tanh(knee);
        }
        shaper.curve = curve;
        shaper.oversample = '2x';
        lastNode.connect(shaper);
        lastNode = shaper;
      } else if (id === 'proc-eq') {
        const brightVal = params.bright ?? 50;
        const tameVal = params.tame ?? 40;

        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 4000;
        highShelf.gain.value = (brightVal - 50) / 5;
        effectNodesRef.current.procEq.highShelf = highShelf;

        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 200;
        lowShelf.gain.value = -(tameVal / 8);
        effectNodesRef.current.procEq.lowShelf = lowShelf;

        lastNode.connect(highShelf);
        highShelf.connect(lowShelf);
        lastNode = lowShelf;
      } else if (id === 'mast-lufs') {
        const lufsVal = params.lufs ?? -14;
        const ceilingVal = params.ceiling ?? -1;

        const gain = ctx.createGain();
        gain.gain.value = 1 + (lufsVal / -14) * 0.6;
        effectNodesRef.current.mastLufs.gain = gain;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -22 + (ceilingVal * 2);
        comp.ratio.value = 3.5;
        comp.attack.value = 0.005;
        comp.release.value = 0.12;
        effectNodesRef.current.mastLufs.comp = comp;

        lastNode.connect(gain);
        gain.connect(comp);
        lastNode = comp;
      } else if (id === 'mast-tape') {
        const warmthVal = params.warmth ?? 60;
        const satVal = params.sat ?? 40;

        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 200;
        lowShelf.gain.value = (warmthVal - 50) / 6;
        effectNodesRef.current.mastTape.lowShelf = lowShelf;

        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          curve[i] = Math.tanh(x * (1.1 + satVal / 60));
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        lastNode.connect(lowShelf);
        lowShelf.connect(shaper);
        lastNode = shaper;
      } else if (id === 'mast-diamond') {
        const threshVal = params.thresh ?? 80;
        const releaseVal = params.release ?? 50;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -28 + (threshVal / 3.5);
        comp.ratio.value = 6 + (threshVal / 20);
        comp.attack.value = 0.002;
        comp.release.value = Math.min(0.6, Math.max(0.04, releaseVal / 200));
        effectNodesRef.current.mastDiamond.comp = comp;

        lastNode.connect(comp);
        lastNode = comp;
      } else if (id === 'mast-console') {
        const driveVal = params.drive ?? 55;
        const widthVal = params.width ?? 30;

        const preGain = ctx.createGain();
        preGain.gain.value = 0.9 + (driveVal / 120);
        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          curve[i] = Math.tanh(x * (1.2 + driveVal / 80));
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        const mid = ctx.createGain();
        const side = ctx.createGain();
        const inverter = ctx.createGain();
        inverter.gain.value = -1;

        lastNode.connect(preGain);
        preGain.connect(shaper);
        shaper.connect(splitter);
        splitter.connect(mid, 0);
        splitter.connect(mid, 1);
        mid.gain.value = 0.5;
        effectNodesRef.current.mastConsole.mid = mid;
        splitter.connect(side, 0);
        splitter.connect(inverter, 1);
        inverter.connect(side);
        side.gain.value = 0.4 + (widthVal / 100);
        effectNodesRef.current.mastConsole.side = side;
        mid.connect(merger, 0, 0);
        mid.connect(merger, 0, 1);
        side.connect(merger, 0, 0);
        const sidePhaseInvert = ctx.createGain();
        sidePhaseInvert.gain.value = -1;
        side.connect(sidePhaseInvert);
        sidePhaseInvert.connect(merger, 0, 1);
        lastNode = merger;
      } else if (id === 'mast-base') {
        const freqVal = params.freq ?? 120;
        const tightVal = params.tight ?? 50;

        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = freqVal;
        lowShelf.gain.value = 1 + (tightVal / 100) * 2;
        effectNodesRef.current.mastBase.lowShelf = lowShelf;

        const lowCut = ctx.createBiquadFilter();
        lowCut.type = 'highpass';
        lowCut.frequency.value = Math.max(20, freqVal * 0.6);
        lowCut.Q.value = 0.7 + (tightVal / 200);
        effectNodesRef.current.mastBase.lowCut = lowCut;

        lastNode.connect(lowCut);
        lowCut.connect(lowShelf);
        lastNode = lowShelf;
      } else if (id === 'mast-holo') {
        const depthVal = params.depth ?? 60;
        const wideVal = params.wide ?? 70;

        const gain = ctx.createGain();
        gain.gain.value = 1 + (depthVal / 200);
        effectNodesRef.current.mastHolo.gain = gain;

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
        effectNodesRef.current.mastHolo.mid = mid;
        splitter.connect(side, 0);
        splitter.connect(inverter, 1);
        inverter.connect(side);
        side.gain.value = 0.4 + (wideVal / 100) * 1.2;
        effectNodesRef.current.mastHolo.side = side;
        mid.connect(merger, 0, 0);
        mid.connect(merger, 0, 1);
        side.connect(merger, 0, 0);
        const sidePhaseInvert = ctx.createGain();
        sidePhaseInvert.gain.value = -1;
        side.connect(sidePhaseInvert);
        sidePhaseInvert.connect(merger, 0, 1);
        lastNode = merger;
      }
    });

    return lastNode;
  }, []);

  const handleAudioLoad = async (file: File) => {
    setPendingFile(file);
    setShowDownloadModal(true);
    setIsConverting(true);
    const target = { ext: 'wav', mime: 'audio/wav' };
    setTargetFormat(target);
    setTimeout(() => {
      const blob = new Blob([file], { type: target.mime });
      setConvertedBlob(blob);
      setIsConverting(false);
    }, 800);
  };

  const processPendingFile = async () => {
    if (!pendingFile) return;
    const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) setAudioContext(ctx);

    try {
      const arrayBuffer = await pendingFile.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      const node = ctx.createAnalyser();
      node.fftSize = 512;
      setAnalyser(node);
      setAudioBuffer(buffer);
      setBufferHistory([]); // Reset history on new load
      setBufferA(buffer); 
      setFileName(pendingFile.name);
      setShowDownloadModal(false);
      setActiveTab(uploadSourceTabRef.current ?? activeTab);
      uploadSourceTabRef.current = null;
      
      // Trigger BPM analysis
      setIsAnalyzing(true);
      setAudioAnalysis(null);
      analyzeAudio(buffer).then(result => {
        setAudioAnalysis(result);
        setIsAnalyzing(false);
      }).catch(err => {
        console.error('Audio analysis failed:', err);
        setIsAnalyzing(false);
      });
    } catch (err) {
      console.error(err);
      setShowDownloadModal(false);
    }
  };

  const togglePlayback = (startTimeRatio: number = 0, loop: boolean = false, endTimeRatio: number = 1, preservePosition: boolean = false) => {
    if (!audioBuffer || !audioContext || !analyser) return;

    if (isPlaying && !loop && !preservePosition && startTimeRatio === playbackParamsRef.current.start) {
      handleStop();
      return;
    }

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;
    
    let actualStartSec = startTimeRatio * audioBuffer.duration;
    if (preservePosition && isPlaying) {
      const elapsed = audioContext.currentTime - startTimeRef.current;
      actualStartSec = (offsetRef.current + elapsed) % audioBuffer.duration;
    }

    const durationSec = (endTimeRatio - startTimeRatio) * audioBuffer.duration;
    playbackParamsRef.current = { start: startTimeRatio, loop, end: endTimeRatio };

    const chainEnd = buildEffectChain(audioContext, source, previewEffectIds, previewEffectParams);
    
    // Master Gain for Mute
    const masterGain = audioContext.createGain();
    masterGain.gain.value = isMuted ? 0 : 1;
    gainNodeRef.current = masterGain;

    chainEnd.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(audioContext.destination);

    if (endTimeRatio < 0.999 && !loop) {
      source.start(0, actualStartSec, durationSec);
    } else {
      source.start(0, actualStartSec);
    }
    
    sourceNodeRef.current = source;
    startTimeRef.current = audioContext.currentTime;
    offsetRef.current = actualStartSec;
    setIsPlaying(true);

    source.onended = () => {
      if (sourceNodeRef.current === source) setIsPlaying(false);
    };
  };

  useEffect(() => {
    if (!isPlaying) return;
    const idsKey = previewEffectIds.join('|');
    const idsChanged = idsKey !== prevPreviewEffectIdsRef.current;
    prevPreviewEffectIdsRef.current = idsKey;
    
    // Create params key for change detection
    const paramsKey = JSON.stringify(previewEffectParams);
    const paramsChanged = paramsKey !== prevPreviewEffectParamsRef.current;
    prevPreviewEffectParamsRef.current = paramsKey;

    // If effect IDs changed, need to restart playback to rebuild chain
    if (idsChanged) {
      togglePlayback(playbackParamsRef.current.start, playbackParamsRef.current.loop, playbackParamsRef.current.end, true);
      return;
    }

    // If only params changed, try smooth update without restart
    if (paramsChanged && audioContext) {
      const now = audioContext.currentTime;
      const lastId = lastPreviewEffectIdRef.current;
      let handledSmooth = false;

      // Vocal Deep - special handling for playback rate changes
      if (lastId === 'vocal-deep' && previewEffectIds.includes('vocal-deep')) {
        const params = previewEffectParams['vocal-deep'] || {};
        const stretchVal = params.stretch ?? 75;
        const pitchVal = params.pitch ?? 0;
        const depthVal = params.depth ?? 40;
        const bodyVal = params.body ?? 60;
        const playbackRate = Math.min(2, Math.max(0.5, stretchVal / 100));

        if (sourceNodeRef.current) {
          sourceNodeRef.current.playbackRate.setTargetAtTime(playbackRate, now, 0.08);
          sourceNodeRef.current.detune.setTargetAtTime(pitchVal * 100, now, 0.08);
        }
        if (effectNodesRef.current.vocalDeep.lowBoost) {
          effectNodesRef.current.vocalDeep.lowBoost.gain.setTargetAtTime(
            (bodyVal - 50) / 6 + (depthVal - 50) / 10, now, 0.08
          );
        }
        handledSmooth = true;
      }

      // Vocal Clarity - smooth EQ and compression updates
      if (lastId === 'vocal-clarity' && previewEffectIds.includes('vocal-clarity')) {
        const params = previewEffectParams['vocal-clarity'] || {};
        const amountVal = params.amount ?? 70;
        const warmthVal = params.warmth ?? 40;
        const presenceVal = params.presence ?? 60;
        const nodes = effectNodesRef.current.vocalClarity;
        if (nodes.lowShelf) nodes.lowShelf.gain.setTargetAtTime((warmthVal - 50) / 6, now, 0.08);
        if (nodes.highShelf) nodes.highShelf.gain.setTargetAtTime((presenceVal - 50) / 5, now, 0.08);
        if (nodes.comp) {
          nodes.comp.threshold.setTargetAtTime(-26 + (amountVal / 8), now, 0.08);
        }
        handledSmooth = true;
      }

      // Vocal Space - delay and mix updates
      if (lastId === 'vocal-space' && previewEffectIds.includes('vocal-space')) {
        const params = previewEffectParams['vocal-space'] || {};
        const mixVal = params.mix ?? 40;
        const sizeVal = params.size ?? 75;
        const decayVal = params.decay ?? 50;
        const nodes = effectNodesRef.current.vocalSpace;
        if (nodes.delay) nodes.delay.delayTime.setTargetAtTime(0.05 + (sizeVal / 100) * 0.35, now, 0.08);
        if (nodes.feedback) nodes.feedback.gain.setTargetAtTime(0.2 + (decayVal / 100) * 0.6, now, 0.08);
        if (nodes.wetGain) nodes.wetGain.gain.setTargetAtTime(mixVal / 100, now, 0.08);
        if (nodes.dryGain) nodes.dryGain.gain.setTargetAtTime(1 - (mixVal / 100), now, 0.08);
        handledSmooth = true;
      }

      // Vocal Tube - warmth updates
      if (lastId === 'vocal-tube' && previewEffectIds.includes('vocal-tube')) {
        const params = previewEffectParams['vocal-tube'] || {};
        const warmthVal = params.warmth ?? 50;
        const nodes = effectNodesRef.current.vocalTube;
        if (nodes.lowShelf) nodes.lowShelf.gain.setTargetAtTime((warmthVal - 50) / 6, now, 0.08);
        handledSmooth = true;
      }

      // Inst Bass - sub bass updates  
      if (lastId === 'inst-bass' && previewEffectIds.includes('inst-bass')) {
        const params = previewEffectParams['inst-bass'] || {};
        const subVal = params.sub ?? 60;
        const nodes = effectNodesRef.current.instBass;
        if (nodes.lowShelf) nodes.lowShelf.gain.setTargetAtTime((subVal - 50) / 3, now, 0.08);
        handledSmooth = true;
      }

      // Inst LoFi - age/filter updates
      if (lastId === 'inst-lofi' && previewEffectIds.includes('inst-lofi')) {
        const params = previewEffectParams['inst-lofi'] || {};
        const ageVal = params.age ?? 60;
        const nodes = effectNodesRef.current.instLofi;
        if (nodes.lowPass) nodes.lowPass.frequency.setTargetAtTime(3000 + (1 - ageVal / 100) * 12000, now, 0.08);
        handledSmooth = true;
      }

      // Inst Keys - shine updates
      if (lastId === 'inst-keys' && previewEffectIds.includes('inst-keys')) {
        const params = previewEffectParams['inst-keys'] || {};
        const shineVal = params.shine ?? 65;
        const nodes = effectNodesRef.current.instKeys;
        if (nodes.highShelf) nodes.highShelf.gain.setTargetAtTime((shineVal - 50) / 5, now, 0.08);
        handledSmooth = true;
      }

      // Inst Guitar - cab frequency
      if (lastId === 'inst-guitar' && previewEffectIds.includes('inst-guitar')) {
        const params = previewEffectParams['inst-guitar'] || {};
        const cabVal = params.cab ?? 50;
        const nodes = effectNodesRef.current.instGuitar;
        if (nodes.cab) nodes.cab.frequency.setTargetAtTime(1800 + (cabVal * 28), now, 0.08);
        handledSmooth = true;
      }

      // Inst Drums - compression
      if (lastId === 'inst-drums' && previewEffectIds.includes('inst-drums')) {
        const params = previewEffectParams['inst-drums'] || {};
        const punchVal = params.punch ?? 70;
        const nodes = effectNodesRef.current.instDrums;
        if (nodes.comp) {
          nodes.comp.threshold.setTargetAtTime(-32 + (punchVal / 2.8), now, 0.08);
        }
        handledSmooth = true;
      }

      // Proc Width - mid/side balance
      if (lastId === 'proc-width' && previewEffectIds.includes('proc-width')) {
        const params = previewEffectParams['proc-width'] || {};
        const widthVal = params.width ?? 75;
        const centerVal = params.center ?? 50;
        const nodes = effectNodesRef.current.procWidth;
        if (nodes.mid) nodes.mid.gain.setTargetAtTime(0.5 + ((centerVal - 50) / 200), now, 0.08);
        if (nodes.side) nodes.side.gain.setTargetAtTime(0.4 + (widthVal / 100) * 1.2, now, 0.08);
        handledSmooth = true;
      }

      // Proc Neural - dry/ambience balance
      if (lastId === 'proc-neural' && previewEffectIds.includes('proc-neural')) {
        const params = previewEffectParams['proc-neural'] || {};
        const dryVal = params.dry ?? 80;
        const ambienceVal = params.ambience ?? 20;
        const nodes = effectNodesRef.current.procNeural;
        if (nodes.dryGain) nodes.dryGain.gain.setTargetAtTime(0.6 + (dryVal / 100) * 0.8, now, 0.08);
        if (nodes.ambienceGain) nodes.ambienceGain.gain.setTargetAtTime(0.2 + (ambienceVal / 100) * 0.6, now, 0.08);
        handledSmooth = true;
      }

      // Proc EQ - brightness and low taming
      if (lastId === 'proc-eq' && previewEffectIds.includes('proc-eq')) {
        const params = previewEffectParams['proc-eq'] || {};
        const brightVal = params.bright ?? 50;
        const tameVal = params.tame ?? 40;
        const nodes = effectNodesRef.current.procEq;
        if (nodes.highShelf) nodes.highShelf.gain.setTargetAtTime((brightVal - 50) / 5, now, 0.08);
        if (nodes.lowShelf) nodes.lowShelf.gain.setTargetAtTime(-(tameVal / 8), now, 0.08);
        handledSmooth = true;
      }

      // Mast LUFS - gain and compression
      if (lastId === 'mast-lufs' && previewEffectIds.includes('mast-lufs')) {
        const params = previewEffectParams['mast-lufs'] || {};
        const lufsVal = params.lufs ?? -14;
        const ceilingVal = params.ceiling ?? -1;
        const nodes = effectNodesRef.current.mastLufs;
        if (nodes.gain) nodes.gain.gain.setTargetAtTime(1 + (lufsVal / -14) * 0.6, now, 0.08);
        if (nodes.comp) nodes.comp.threshold.setTargetAtTime(-22 + (ceilingVal * 2), now, 0.08);
        handledSmooth = true;
      }

      // Mast Tape - warmth
      if (lastId === 'mast-tape' && previewEffectIds.includes('mast-tape')) {
        const params = previewEffectParams['mast-tape'] || {};
        const warmthVal = params.warmth ?? 60;
        const nodes = effectNodesRef.current.mastTape;
        if (nodes.lowShelf) nodes.lowShelf.gain.setTargetAtTime((warmthVal - 50) / 6, now, 0.08);
        handledSmooth = true;
      }

      // Mast Diamond - compression
      if (lastId === 'mast-diamond' && previewEffectIds.includes('mast-diamond')) {
        const params = previewEffectParams['mast-diamond'] || {};
        const threshVal = params.thresh ?? 80;
        const releaseVal = params.release ?? 50;
        const nodes = effectNodesRef.current.mastDiamond;
        if (nodes.comp) {
          nodes.comp.threshold.setTargetAtTime(-28 + (threshVal / 3.5), now, 0.08);
          nodes.comp.release.setTargetAtTime(Math.min(0.6, Math.max(0.04, releaseVal / 200)), now, 0.08);
        }
        handledSmooth = true;
      }

      // Mast Console - width
      if (lastId === 'mast-console' && previewEffectIds.includes('mast-console')) {
        const params = previewEffectParams['mast-console'] || {};
        const widthVal = params.width ?? 30;
        const nodes = effectNodesRef.current.mastConsole;
        if (nodes.side) nodes.side.gain.setTargetAtTime(0.4 + (widthVal / 100), now, 0.08);
        handledSmooth = true;
      }

      // Mast Base - frequency and tightness
      if (lastId === 'mast-base' && previewEffectIds.includes('mast-base')) {
        const params = previewEffectParams['mast-base'] || {};
        const freqVal = params.freq ?? 120;
        const tightVal = params.tight ?? 50;
        const nodes = effectNodesRef.current.mastBase;
        if (nodes.lowShelf) {
          nodes.lowShelf.frequency.setTargetAtTime(freqVal, now, 0.08);
          nodes.lowShelf.gain.setTargetAtTime(1 + (tightVal / 100) * 2, now, 0.08);
        }
        if (nodes.lowCut) {
          nodes.lowCut.frequency.setTargetAtTime(Math.max(20, freqVal * 0.6), now, 0.08);
        }
        handledSmooth = true;
      }

      // Mast Holo - depth and width
      if (lastId === 'mast-holo' && previewEffectIds.includes('mast-holo')) {
        const params = previewEffectParams['mast-holo'] || {};
        const depthVal = params.depth ?? 60;
        const wideVal = params.wide ?? 70;
        const nodes = effectNodesRef.current.mastHolo;
        if (nodes.gain) nodes.gain.gain.setTargetAtTime(1 + (depthVal / 200), now, 0.08);
        if (nodes.side) nodes.side.gain.setTargetAtTime(0.4 + (wideVal / 100) * 1.2, now, 0.08);
        handledSmooth = true;
      }

      // Proc Warp - playback rate and pitch
      if (lastId === 'proc-warp' && previewEffectIds.includes('proc-warp')) {
        const params = previewEffectParams['proc-warp'] || {};
        const speedVal = params.speed ?? 50;
        const pitchVal = params.pitch ?? 50;
        const playbackRate = Math.min(4, Math.max(0.25, speedVal / 50));
        if (sourceNodeRef.current) {
          sourceNodeRef.current.playbackRate.setTargetAtTime(playbackRate, now, 0.08);
          sourceNodeRef.current.detune.setTargetAtTime((pitchVal - 50) * 24, now, 0.08);
        }
        handledSmooth = true;
      }

      // If smooth update was handled, don't restart playback
      if (handledSmooth) return;
    }

    // Fall back to restarting playback for effects that need chain rebuild
    togglePlayback(playbackParamsRef.current.start, playbackParamsRef.current.loop, playbackParamsRef.current.end, true);
  }, [previewEffectIds, previewEffectParams, isPlaying, audioContext, togglePlayback]);

  // Handle Mute changes during playback
  useEffect(() => {
    if (gainNodeRef.current && audioContext) {
      gainNodeRef.current.gain.setTargetAtTime(isMuted ? 0 : 1, audioContext.currentTime, 0.05);
    }
  }, [isMuted, audioContext]);

  const handleStop = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
    }
    setIsPlaying(false);
  };

  const handleUndo = () => {
    if (bufferHistory.length === 0) return;
    const previousBuffer = bufferHistory[bufferHistory.length - 1];
    setAudioBuffer(previousBuffer);
    setBufferA(previousBuffer);
    setBufferHistory(prev => prev.slice(0, -1));
  };

  const updateBufferWithHistory = (newBuffer: AudioBuffer) => {
    if (audioBuffer) {
      setBufferHistory(prev => [...prev, audioBuffer]);
    }
    setAudioBuffer(newBuffer);
    setBufferA(newBuffer);
  };

  const renderTabContent = () => {
    const commonProps = {
      buffer: audioBuffer,
      bufferA: bufferA,
      bufferB: bufferB,
      isPlaying,
      isMuted,
      togglePlayback,
      playbackParams: playbackParamsRef.current,
      onUpdateBuffer: updateBufferWithHistory,
      onUpdateBufferB: (newBuffer: AudioBuffer) => {
        setBufferB(newBuffer); 
      },
      onSetBufferA: (buf: AudioBuffer) => setBufferA(buf),
      onSetBufferB: (buf: AudioBuffer) => setBufferB(buf),
      onUpload: () => {
        uploadSourceTabRef.current = activeTab;
        fileInputRef.current?.click();
      },
      ctx: audioContext,
      onPreviewEffectsChange: (ids: string[]) => {
        lastPreviewEffectIdRef.current = ids[0] ?? null;
        setPreviewEffectIds(ids);
      },
      onPreviewEffectParamsChange: (id: string, params: Record<string, number>) => {
        lastPreviewEffectIdRef.current = id;
        setPreviewEffectParams(prev => ({ ...prev, [id]: params }));
      },
      onUndo: handleUndo,
      canUndo: bufferHistory.length > 0,
      onToggleMute: () => setIsMuted(!isMuted)
    };

    return (
      <>
        <div className={activeTab === AppTab.CONVERT ? 'block w-full' : 'hidden'}>
          <ConvertTab onFileLoaded={handleAudioLoad} />
        </div>
        <div className={activeTab === AppTab.TRIM ? 'block w-full' : 'hidden'}>
          <TrimTab {...commonProps} />
        </div>
        <div className={activeTab === AppTab.COMPARE ? 'block w-full' : 'hidden'}>
          <CompareTab {...commonProps} isVisible={activeTab === AppTab.COMPARE} />
        </div>
        <div className={activeTab === AppTab.EFFECTS ? 'block w-full' : 'hidden'}>
          <EffectsTab {...commonProps} />
        </div>
        <div className={activeTab === AppTab.MULTITRACK ? 'block w-full' : 'hidden'}>
          <MultiTrackTab {...commonProps} isVisible={activeTab === AppTab.MULTITRACK} />
        </div>
      </>
    );
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-mono antialiased transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-[#f8fafc] text-slate-900'}`}>
      <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleAudioLoad(e.target.files[0])} title="Upload audio file" />
      
      {/* Header - Cyber HUD Style */}
      <header className={`flex-none relative z-50 h-14 flex items-center justify-between px-6 border-b transition-colors ${theme === 'dark' ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab(AppTab.CONVERT)}>
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
            <span className={`text-lg font-display font-bold tracking-[0.15em] uppercase transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-800'}`}>NoDAW</span>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <nav className={`flex space-x-1 p-1 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/30' : 'bg-slate-100/50'}`}>
          {Object.values(AppTab).map((tab) => {
            const featureKey = TAB_FEATURES[tab];
            const hasAccess = !featureKey || canAccessFeature(featureKey, license.tier);
            const isPremium = !!featureKey;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (hasAccess) {
                    setActiveTab(tab);
                  } else {
                    setPaywallFeature(featureKey);
                    setShowPaywall(true);
                  }
                }}
                className={`px-4 py-1.5 rounded font-mono font-semibold text-[10px] uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 ${
                  activeTab === tab 
                    ? theme === 'dark' 
                      ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]' 
                      : 'bg-white text-slate-900 shadow-sm'
                    : theme === 'dark'
                      ? 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50'
                      : 'text-slate-400 hover:text-slate-600'
                } ${!hasAccess ? 'opacity-50' : ''}`}
              >
                {tab}
                {isPremium && !hasAccess && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>}
              </button>
            );
          })}
        </nav>
        
        {/* Header Right Section */}
        <div className="flex items-center space-x-3">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme} 
             title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
             className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             {theme === 'dark' ? (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             ) : (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
             )}
           </button>
           
           <LauncherButton onClick={() => setShowLauncher(true)} />
           {(audioAnalysis || isAnalyzing) && (
             <CompactBpmDisplay 
               bpm={audioAnalysis?.bpm || 0} 
               confidence={audioAnalysis?.confidence || 0} 
               analyzing={isAnalyzing} 
             />
           )}
           <SpectralAnalyzer isPlaying={isPlaying} analyser={analyser || undefined} width={120} height={30} />
           <LicenseBadge license={license} onClick={() => setShowPaywall(true)} />
        </div>
      </header>
      
      {/* Audio Analysis Panel - shows when audio is loaded */}
      {(audioAnalysis || isAnalyzing) && activeTab !== AppTab.MULTITRACK && (
        <div className="flex-none px-6 pt-4">
          <AudioAnalysisPanel 
            analysis={audioAnalysis} 
            isAnalyzing={isAnalyzing} 
            fileName={fileName || undefined}
          />
        </div>
      )}
      
      <main className="flex-1 overflow-hidden relative flex items-center justify-center">
        {/* Absolute Centering Wrapper */}
        <div className="w-full h-full flex items-center justify-center overflow-y-auto px-6">
           <div className="w-full max-w-5xl py-8">
             {renderTabContent()}
           </div>
        </div>
      </main>
      
      {showPaywall && (
        <Paywall
          feature={paywallFeature}
          license={license}
          onClose={() => setShowPaywall(false)}
          onActivate={(newLicense) => {
            setLicense(newLicense);
            setShowPaywall(false);
          }}
        />
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={processPendingFile}>
          <div className={`rounded-2xl p-8 max-w-md w-full text-center relative animate-scaleIn ${theme === 'dark' ? 'bg-slate-900 border border-cyan-900/50 shadow-2xl shadow-cyan-900/20' : 'bg-white shadow-2xl'}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={processPendingFile} title="Close modal" className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-cyan-400' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-14 h-14 gradient-bg rounded-xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <h3 className={`text-xl font-tech font-bold mb-2 tracking-wide ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{isConverting ? 'PROCESSING...' : 'STREAM INITIALIZED'}</h3>
            <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Your master file has been successfully ingested by the NoDAW engine.</p>
            <div className="space-y-3">
              <button onClick={() => { if(convertedBlob && pendingFile) { const url = URL.createObjectURL(convertedBlob); const a = document.createElement('a'); a.href = url; a.download = `nodaw_${pendingFile.name}`; a.click(); } processPendingFile(); }} disabled={isConverting} className="w-full py-3 gradient-bg text-white rounded-lg font-mono font-bold text-[10px] tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-900/30">Download & Continue</button>
              <button onClick={processPendingFile} className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${theme === 'dark' ? 'text-slate-600 hover:text-cyan-400' : 'text-slate-400 hover:text-cyan-500'}`}>[ SKIP ]</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Launcher Hub Modal */}
      <LauncherHub isOpen={showLauncher} onClose={() => setShowLauncher(false)} />
    </div>
  );
};

export default App;
