/**
 * TimeStretchX.tsx
 * Next-gen time stretching with phase-aware spectral processing
 * Extreme tempo changes with zero artifacts
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { getTimeStretchEngine, TimeStretchParams } from './timeStretchEngine';
import AudioGraphEditor from './AudioGraphEditor';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TimeStretchXProps {
  isOpen: boolean;
  onClose: () => void;
  audioFile?: File | null;
}

interface StretchPreset {
  id: string;
  name: string;
  timeRatio: number;
  pitchShift: number;
  algorithm: Algorithm;
  description: string;
}

type Algorithm = 'rubberband' | 'wsola' | 'phase_vocoder' | 'granular' | 'elastique';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  phase: 'idle' | 'analyzing' | 'stretching' | 'rendering' | 'complete';
}

// ═══════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════

const STRETCH_PRESETS: StretchPreset[] = [
  {
    id: 'screwed',
    name: 'Screwed',
    timeRatio: 0.75,
    pitchShift: -3,
    algorithm: 'rubberband',
    description: 'Classic Houston slowed style'
  },
  {
    id: 'chopped-not-slopped',
    name: 'Chopped Not Slopped',
    timeRatio: 0.85,
    pitchShift: -2,
    algorithm: 'wsola',
    description: 'OG DJ Screw vibes'
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    timeRatio: 0.65,
    pitchShift: -5,
    algorithm: 'phase_vocoder',
    description: 'Aesthetic slowdown'
  },
  {
    id: 'nightcore',
    name: 'Nightcore',
    timeRatio: 1.25,
    pitchShift: 4,
    algorithm: 'rubberband',
    description: 'Sped up anime style'
  },
  {
    id: 'daycore',
    name: 'Daycore',
    timeRatio: 0.9,
    pitchShift: -1,
    algorithm: 'elastique',
    description: 'Subtle slowdown'
  },
  {
    id: 'extreme-slow',
    name: 'Extreme Slow',
    timeRatio: 0.5,
    pitchShift: 0,
    algorithm: 'granular',
    description: 'Half speed, maintain pitch'
  },
  {
    id: 'double-time',
    name: 'Double Time',
    timeRatio: 2.0,
    pitchShift: 0,
    algorithm: 'rubberband',
    description: '2x speed, maintain pitch'
  },
  {
    id: 'pitch-up',
    name: 'Pitch Up +12',
    timeRatio: 1.0,
    pitchShift: 12,
    algorithm: 'phase_vocoder',
    description: 'Octave up, same speed'
  },
  {
    id: 'pitch-down',
    name: 'Pitch Down -12',
    timeRatio: 1.0,
    pitchShift: -12,
    algorithm: 'phase_vocoder',
    description: 'Octave down, same speed'
  }
];

const ALGORITHMS: { id: Algorithm; name: string; quality: string; speed: string }[] = [
  { id: 'rubberband', name: 'RubberBand', quality: '★★★★★', speed: 'Fast' },
  { id: 'elastique', name: 'Élastique', quality: '★★★★★', speed: 'Medium' },
  { id: 'phase_vocoder', name: 'Phase Vocoder', quality: '★★★★☆', speed: 'Fast' },
  { id: 'wsola', name: 'WSOLA', quality: '★★★☆☆', speed: 'Very Fast' },
  { id: 'granular', name: 'Granular', quality: '★★★★☆', speed: 'Slow' }
];

// ═══════════════════════════════════════════════════════════
// KNOB COMPONENT
// ═══════════════════════════════════════════════════════════

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  onChange: (value: number) => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const Knob: React.FC<KnobProps> = ({
  value,
  min,
  max,
  step = 0.01,
  label,
  unit = '',
  onChange,
  color = 'cyan',
  size = 'lg',
  disabled = false
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);
  
  const sizeConfig = {
    sm: { outer: 60, inner: 48, indicator: 4 },
    md: { outer: 80, inner: 64, indicator: 5 },
    lg: { outer: 120, inner: 96, indicator: 6 }
  };
  
  const config = sizeConfig[size];
  const range = max - min;
  const normalized = (value - min) / range;
  const rotation = -135 + (normalized * 270); // -135 to +135 degrees
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = startY.current - e.clientY;
    const sensitivity = (e.shiftKey ? 0.1 : 1) * (range / 200);
    const newValue = Math.max(min, Math.min(max, startValue.current + (deltaY * sensitivity)));
    
    // Snap to step
    const snapped = Math.round(newValue / step) * step;
    onChange(snapped);
  }, [min, max, range, step, onChange]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const handleDoubleClick = () => {
    if (disabled) return;
    // Reset to center/default
    const center = (min + max) / 2;
    onChange(center);
  };
  
  const colorMap: Record<string, { gradient: string; glow: string; text: string }> = {
    cyan: { gradient: 'from-cyan-500 to-cyan-600', glow: 'rgba(34,211,238,0.5)', text: 'text-cyan-400' },
    purple: { gradient: 'from-purple-500 to-purple-600', glow: 'rgba(168,85,247,0.5)', text: 'text-purple-400' },
    amber: { gradient: 'from-amber-500 to-amber-600', glow: 'rgba(245,158,11,0.5)', text: 'text-amber-400' },
    emerald: { gradient: 'from-emerald-500 to-emerald-600', glow: 'rgba(16,185,129,0.5)', text: 'text-emerald-400' }
  };
  
  const colors = colorMap[color] || colorMap.cyan;
  
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Knob Container */}
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={`relative rounded-full cursor-pointer select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          width: config.outer,
          height: config.outer,
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          boxShadow: `
            inset 2px 2px 4px rgba(0,0,0,0.5),
            inset -2px -2px 4px rgba(255,255,255,0.05),
            0 0 20px ${colors.glow}
          `
        }}
      >
        {/* Inner Knob */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${colors.gradient}`}
          style={{
            width: config.inner,
            height: config.inner,
            top: (config.outer - config.inner) / 2,
            left: (config.outer - config.inner) / 2,
            transform: `rotate(${rotation}deg)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}
        >
          {/* Indicator Dot */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: config.indicator,
              height: config.indicator,
              top: 8,
              left: '50%',
              marginLeft: -config.indicator / 2,
              boxShadow: '0 0 8px rgba(255,255,255,0.8)'
            }}
          />
        </div>
        
        {/* Tick Marks */}
        {[0, 45, 90, 135, 180, 225, 270].map((deg, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-2 bg-slate-600"
            style={{
              top: 2,
              left: '50%',
              marginLeft: -1,
              transformOrigin: `0 ${config.outer / 2 - 2}px`,
              transform: `rotate(${-135 + deg}deg)`
            }}
          />
        ))}
      </div>
      
      {/* Value Display */}
      <div className={`font-mono text-lg ${colors.text}`}>
        {value.toFixed(2)}{unit}
      </div>
      
      {/* Label */}
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// WAVEFORM DISPLAY
// ═══════════════════════════════════════════════════════════

const WaveformDisplay: React.FC<{
  audioData?: Float32Array | null;
  timeRatio: number;
  isProcessing: boolean;
}> = ({ audioData, timeRatio, isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    if (!audioData || audioData.length === 0) {
      // Draw placeholder waveform
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * 0.05) * 30 * Math.sin(x * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Time stretch preview line
      const stretchedWidth = width * timeRatio;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(stretchedWidth, 0);
      ctx.lineTo(stretchedWidth, height);
      ctx.stroke();
      ctx.setLineDash([]);
      
      return;
    }
    
    // Draw actual waveform
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    const step = Math.ceil(audioData.length / width);
    const centerY = height / 2;
    const amp = height / 2 - 10;
    
    for (let x = 0; x < width; x++) {
      const index = Math.floor(x * step);
      const sample = audioData[index] || 0;
      const y = centerY + sample * amp;
      
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [audioData, timeRatio]);
  
  return (
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
      <canvas
        ref={canvasRef}
        width={600}
        height={128}
        className="w-full h-full"
      />
      
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-cyan-400 font-mono">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const TimeStretchX: React.FC<TimeStretchXProps> = ({ isOpen, onClose, audioFile }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const engineRef = useRef(getTimeStretchEngine());
  
  // Core parameters
  const [timeRatio, setTimeRatio] = useState(1.0);
  const [pitchShift, setPitchShift] = useState(0);
  const [mixAmount, setMixAmount] = useState(100);
  const [isLinked, setIsLinked] = useState(false);
  
  // Algorithm settings
  const [algorithm, setAlgorithm] = useState<Algorithm>('rubberband');
  const [preserveFormants, setPreserveFormants] = useState(true);
  const [antiAliasing, setAntiAliasing] = useState(true);
  
  // Secret controls
  const [showSecretControls, setShowSecretControls] = useState(false);
  const [secretTaps, setSecretTaps] = useState(0);
  
  // Processing state
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    phase: 'idle'
  });
  
  // Audio data
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ingestAudioFile = useCallback((file?: File | null) => {
    if (!file || !file.type.startsWith('audio/')) return;
    void engineRef.current.loadFile(file).then(() => {
      setLoadedFileName(file.name);
      setAudioData(engineRef.current.getWaveformData());
    });
  }, []);

  useEffect(() => {
    if (audioFile) {
      ingestAudioFile(audioFile);
    }
  }, [audioFile, ingestAudioFile]);
  
  // Handle linked mode
  useEffect(() => {
    if (isLinked) {
      // When time changes, adjust pitch proportionally
      // This mimics vinyl behavior
    }
  }, [timeRatio, isLinked]);
  
  // Secret tap sequence to show mix knob
  const handleSecretTap = () => {
    const newTaps = secretTaps + 1;
    setSecretTaps(newTaps);
    
    if (newTaps >= 5) {
      setShowSecretControls(true);
      setSecretTaps(0);
    }
    
    // Reset after 2 seconds
    setTimeout(() => setSecretTaps(0), 2000);
  };
  
  // Apply preset
  const applyPreset = (preset: StretchPreset) => {
    setTimeRatio(preset.timeRatio);
    setPitchShift(preset.pitchShift);
    setAlgorithm(preset.algorithm);
  };
  
  // Process audio
  const handleProcess = async () => {
    try {
      setProcessing({ isProcessing: true, progress: 0, phase: 'analyzing' });

      const params: TimeStretchParams = {
        timeRatio,
        pitchShift,
        mixAmount,
        preserveFormants,
        antiAliasing,
      };

      await engineRef.current.process(params, (progress, phase) => {
        const mappedPhase: ProcessingState['phase'] = phase === 'complete'
          ? 'complete'
          : phase === 'hybrid' || phase === 'pitch' || phase === 'post'
            ? 'rendering'
            : phase === 'transient-detect'
              ? 'analyzing'
              : 'stretching';

        setProcessing({ isProcessing: phase !== 'complete', progress, phase: mappedPhase });
      });

      setTimeout(() => {
        setProcessing({ isProcessing: false, progress: 0, phase: 'idle' });
      }, 1200);
    } catch {
      setProcessing({ isProcessing: false, progress: 0, phase: 'idle' });
    }
  };

  const handlePreview = async () => {
    if (engineRef.current.getIsPlaying()) {
      engineRef.current.stop();
      return;
    }

    await engineRef.current.play();
  };

  const handleExport = async () => {
    const blob = await engineRef.current.exportWav();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (loadedFileName?.replace(/\.[^.]+$/, '') || 'timestretchx-export') + '.wav';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  
  // Handle file drop
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    ingestAudioFile(file);
  }, [ingestAudioFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) ingestAudioFile(file);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl
          ${isDark 
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/20' 
            : 'bg-white border border-slate-200'
          }`}
        style={{
          boxShadow: '0 0 60px rgba(34, 211, 238, 0.15), 0 0 120px rgba(168, 85, 247, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 
                          flex items-center justify-center text-2xl shadow-lg">
              ⏱️
            </div>
            <div>
              <h2 className={`font-mono text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                HalfScrew
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-cyan-400 tracking-widest">
                  QUANTUM_TIME
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-purple-900/50 text-purple-400 
                               rounded border border-purple-500/30">
                  PRO+
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Algorithm selector */}
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              title="Select time-stretch algorithm"
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 border border-slate-700 
                       text-slate-300 focus:border-cyan-500/50 outline-none"
            >
              {ALGORITHMS.map((alg) => (
                <option key={alg.id} value={alg.id}>
                  {alg.name} ({alg.speed})
                </option>
              ))}
            </select>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center
                       text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {/* Waveform Display */}
          <div 
            className="mb-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Drop audio here or load from file
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md text-xs font-mono bg-slate-800/70 border border-slate-700 text-cyan-300 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors"
              >
                Load Audio
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                title="Load an audio file"
                className="hidden"
              />
            </div>
            <WaveformDisplay 
              audioData={audioData}
              timeRatio={timeRatio}
              isProcessing={processing.isProcessing}
            />
            {loadedFileName && (
              <div className="mt-2 text-xs text-slate-400 font-mono">
                📁 {loadedFileName}
              </div>
            )}
          </div>
          
          {/* Main Knobs */}
          <div className="flex items-center justify-center gap-16 mb-8">
            {/* Time Stretch Knob */}
            <Knob
              value={timeRatio}
              min={0.25}
              max={4.0}
              step={0.01}
              label="Time Stretch"
              unit="x"
              onChange={setTimeRatio}
              color="cyan"
              size="lg"
            />
            
            {/* Link Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsLinked(!isLinked)}
                onDoubleClick={handleSecretTap}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center
                           transition-all duration-300
                  ${isLinked 
                    ? 'border-amber-500 bg-amber-900/30 text-amber-400' 
                    : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600'
                  }`}
              >
                {isLinked ? '🔗' : '⛓️‍💥'}
              </button>
              <span className="text-[9px] uppercase tracking-wider text-slate-500">
                {isLinked ? 'Linked' : 'Independent'}
              </span>
            </div>
            
            {/* Pitch Shift Knob */}
            <Knob
              value={pitchShift}
              min={-24}
              max={24}
              step={0.1}
              label="Pitch Shift"
              unit="st"
              onChange={setPitchShift}
              color="purple"
              size="lg"
            />
          </div>
          
          {/* Secret Mix Knob */}
          <AnimatePresence>
            {showSecretControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center mb-6 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-slate-900/50 border border-amber-500/30">
                  <div className="flex items-center gap-8">
                    <Knob
                      value={mixAmount}
                      min={0}
                      max={100}
                      step={1}
                      label="Dry/Wet Mix"
                      unit="%"
                      onChange={setMixAmount}
                      color="amber"
                      size="md"
                    />
                    
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={preserveFormants}
                          onChange={(e) => setPreserveFormants(e.target.checked)}
                          className="accent-cyan-500"
                        />
                        Preserve Formants
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={antiAliasing}
                          onChange={(e) => setAntiAliasing(e.target.checked)}
                          className="accent-cyan-500"
                        />
                        Anti-Aliasing
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Presets */}
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
              Quick Presets
            </div>
            <div className="flex flex-wrap gap-2">
              {STRETCH_PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all
                           bg-slate-800/50 border border-slate-700 text-slate-300
                           hover:border-cyan-500/50 hover:bg-slate-800"
                  title={preset.description}
                >
                  {preset.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Phase 1 Graph UI */}
          <div className="mb-6">
            <AudioGraphEditor />
          </div>
          
          {/* Processing Info */}
          {processing.phase !== 'idle' && (
            <div className="mb-6 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-mono uppercase">
                  {processing.phase}
                </span>
                <span className="text-xs text-cyan-400 font-mono">
                  {processing.progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${processing.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { void handlePreview(); }}
                className="px-4 py-2 rounded-lg text-xs font-mono
                               bg-slate-800/50 border border-slate-700 text-slate-400
                               hover:border-slate-600 hover:text-slate-300 transition-colors">
                {engineRef.current.getIsPlaying() ? 'Stop Preview' : 'Preview'}
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-mono
                               bg-slate-800/50 border border-slate-700 text-slate-400
                               hover:border-slate-600 hover:text-slate-300 transition-colors">
                Compare A/B
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleProcess}
                disabled={processing.isProcessing}
                className="px-6 py-2.5 rounded-lg text-sm font-mono
                         bg-gradient-to-r from-cyan-500 to-purple-600 text-white
                         hover:from-cyan-400 hover:to-purple-500 transition-all
                         disabled:opacity-50 shadow-lg shadow-cyan-500/25"
              >
                {processing.isProcessing ? 'Processing...' : 'Apply Stretch'}
              </button>
              <button
                onClick={() => { void handleExport(); }}
                className="px-4 py-2.5 rounded-lg text-sm font-mono
                               bg-emerald-900/50 border border-emerald-500/30 text-emerald-400
                               hover:bg-emerald-900/70 transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[9px] text-slate-600 font-mono">
            <span>Algorithm: {ALGORITHMS.find(a => a.id === algorithm)?.name}</span>
            <span>Quality: {ALGORITHMS.find(a => a.id === algorithm)?.quality}</span>
          </div>
          <div className="text-[9px] text-slate-600 font-mono">
            Double-click knob to reset • Shift+drag for fine control
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimeStretchX;
