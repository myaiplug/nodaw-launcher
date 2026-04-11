/**
 * TrimItPanel.tsx
 * Precision audio trimming tool integrated with launcher theme
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Audio utility functions
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
  
  // Normalize
  const max = Math.max(...samples) || 1;
  return samples.map(s => s / max);
};

const sliceBuffer = (
  ctx: AudioContext, 
  buffer: AudioBuffer, 
  start: number, 
  end: number
): AudioBuffer => {
  const startSample = Math.floor(start * buffer.sampleRate);
  const endSample = Math.floor(end * buffer.sampleRate);
  const length = endSample - startSample;
  
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    length,
    buffer.sampleRate
  );
  
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const oldData = buffer.getChannelData(ch);
    const newData = newBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      newData[i] = oldData[startSample + i];
    }
  }
  
  return newBuffer;
};

const removeRange = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  start: number,
  end: number
): AudioBuffer => {
  const startSample = Math.floor(start * buffer.sampleRate);
  const endSample = Math.floor(end * buffer.sampleRate);
  const newLength = buffer.length - (endSample - startSample);
  
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    newLength,
    buffer.sampleRate
  );
  
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const oldData = buffer.getChannelData(ch);
    const newData = newBuffer.getChannelData(ch);
    
    for (let i = 0; i < startSample; i++) {
      newData[i] = oldData[i];
    }
    for (let i = endSample; i < buffer.length; i++) {
      newData[i - (endSample - startSample)] = oldData[i];
    }
  }
  
  return newBuffer;
};

const fadeBuffer = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  start: number,
  end: number,
  type: 'in' | 'out'
): AudioBuffer => {
  const startSample = Math.floor(start * buffer.sampleRate);
  const endSample = Math.floor(end * buffer.sampleRate);
  const fadeSamples = endSample - startSample;
  
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const oldData = buffer.getChannelData(ch);
    const newData = newBuffer.getChannelData(ch);
    
    for (let i = 0; i < buffer.length; i++) {
      if (i >= startSample && i < endSample) {
        const fadePos = (i - startSample) / fadeSamples;
        const gain = type === 'in' ? fadePos : 1 - fadePos;
        newData[i] = oldData[i] * gain;
      } else {
        newData[i] = oldData[i];
      }
    }
  }
  
  return newBuffer;
};

const reverseBuffer = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  start: number,
  end: number
): AudioBuffer => {
  const startSample = Math.floor(start * buffer.sampleRate);
  const endSample = Math.floor(end * buffer.sampleRate);
  
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const oldData = buffer.getChannelData(ch);
    const newData = newBuffer.getChannelData(ch);
    
    for (let i = 0; i < buffer.length; i++) {
      if (i >= startSample && i < endSample) {
        newData[i] = oldData[endSample - 1 - (i - startSample)];
      } else {
        newData[i] = oldData[i];
      }
    }
  }
  
  return newBuffer;
};

const bufferToWave = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let pos = 0;
  
  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos++, str.charCodeAt(i));
    }
  };
  
  const writeUint32 = (val: number) => {
    view.setUint32(pos, val, true);
    pos += 4;
  };
  
  const writeUint16 = (val: number) => {
    view.setUint16(pos, val, true);
    pos += 2;
  };
  
  writeString('RIFF');
  writeUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16);
  writeUint16(1);
  writeUint16(numOfChan);
  writeUint32(buffer.sampleRate);
  writeUint32(buffer.sampleRate * numOfChan * 2);
  writeUint16(numOfChan * 2);
  writeUint16(16);
  writeString('data');
  writeUint32(buffer.length * numOfChan * 2);
  
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      let sample = Math.max(-1, Math.min(1, channels[ch][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

// Waveform component
interface WaveformProps {
  samples: number[];
  progress: number;
  selectionStart?: number;
  selectionEnd?: number;
  onSelectionChange: (start: number, end: number) => void;
  height?: number;
}

const Waveform: React.FC<WaveformProps> = ({
  samples,
  progress,
  selectionStart,
  selectionEnd,
  onSelectionChange,
  height = 200
}) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  
  const getPositionFromEvent = (e: React.MouseEvent | MouseEvent): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPositionFromEvent(e);
    setDragStart(pos);
    setIsDragging(true);
    onSelectionChange(pos, pos);
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const pos = getPositionFromEvent(e);
      if (dragStart !== null) {
        const start = Math.min(dragStart, pos);
        const end = Math.max(dragStart, pos);
        onSelectionChange(start, end);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onSelectionChange]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full cursor-crosshair select-none"
      style={{ height }}
      onMouseDown={handleMouseDown}
    >
      {/* Waveform bars */}
      <div className="absolute inset-0 flex items-center gap-px">
        {samples.map((sample, i) => {
          const barProgress = i / samples.length;
          const isPlayed = barProgress <= progress;
          const isSelected = selectionStart !== undefined && 
            selectionEnd !== undefined &&
            barProgress >= selectionStart && 
            barProgress <= selectionEnd;
          
          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-center"
              style={{ height: '100%' }}
            >
              <div
                className={`w-full rounded-sm transition-colors duration-75 ${
                  isSelected
                    ? isDark ? 'bg-cyan-400' : 'bg-cyan-500'
                    : isPlayed
                      ? isDark ? 'bg-cyan-600' : 'bg-cyan-600'
                      : isDark ? 'bg-slate-600' : 'bg-slate-400'
                }`}
                style={{
                  height: `${Math.max(4, sample * 100)}%`,
                  opacity: isSelected ? 1 : isPlayed ? 0.8 : 0.5
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Selection overlay */}
      {selectionStart !== undefined && selectionEnd !== undefined && selectionEnd > selectionStart && (
        <div
          className={`absolute top-0 bottom-0 ${
            isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/30'
          } border-l border-r ${
            isDark ? 'border-cyan-400' : 'border-cyan-500'
          }`}
          style={{
            left: `${selectionStart * 100}%`,
            width: `${(selectionEnd - selectionStart) * 100}%`
          }}
        />
      )}
      
      {/* Playhead */}
      <div
        className={`absolute top-0 bottom-0 w-0.5 ${
          isDark ? 'bg-white' : 'bg-slate-900'
        } shadow-lg`}
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
};

// Main TrimIt Panel
export const TrimItPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [samples, setSamples] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [history, setHistory] = useState<AudioBuffer[]>([]);
  const [redoStack, setRedoStack] = useState<AudioBuffer[]>([]);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const startOffsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => { ctx.close(); };
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !audioContext) return;
    const file = e.target.files[0];
    setFileName(file.name);
    stopAudio();
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    setBuffer(audioBuffer);
    setSelection(null);
    setProgress(0);
    startOffsetRef.current = 0;
    setSamples(getSamplesFromBuffer(audioBuffer, 600));
    // Clear history when loading new file
    setHistory([]);
    setRedoStack([]);
  };
  
  const stopAudio = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      try { 
        sourceRef.current.stop(); 
        sourceRef.current.disconnect();
      } catch (e) {
        // Already stopped
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);
  
  const playAudio = useCallback(() => {
    if (!audioContext || !buffer) return;
    
    // Stop any existing playback first
    if (sourceRef.current) {
      try { 
        sourceRef.current.stop(); 
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
    }
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    let offset = startOffsetRef.current;
    if (selection) {
      const selStart = selection.start * buffer.duration;
      const selEnd = selection.end * buffer.duration;
      if (offset < selStart || offset > selEnd) {
        offset = selStart;
      }
    }
    if (offset >= buffer.duration) offset = 0;
    
    source.start(0, offset);
    sourceRef.current = source;
    startTimeRef.current = audioContext.currentTime - offset;
    setIsPlaying(true);
    
    const loop = () => {
      if (!audioContext || !buffer) return;
      const current = audioContext.currentTime - startTimeRef.current;
      
      let shouldStop = current >= buffer.duration;
      if (selection) {
        const selEnd = selection.end * buffer.duration;
        if (current >= selEnd) shouldStop = true;
      }
      
      if (shouldStop) {
        stopAudio();
        return;
      }
      
      setProgress(current / buffer.duration);
      startOffsetRef.current = current;
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, [audioContext, buffer, selection, stopAudio]);
  
  const handlePlayToggle = useCallback(() => {
    // Use ref to avoid stale closure of isPlaying
    if (sourceRef.current) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [stopAudio, playAudio]);
  
  const updateBuffer = useCallback((newBuffer: AudioBuffer) => {
    stopAudio();
    // Save current buffer to history before updating
    if (buffer) {
      setHistory(prev => [...prev.slice(-19), buffer]); // Keep last 20 states
      setRedoStack([]); // Clear redo stack on new edit
    }
    setBuffer(newBuffer);
    setSamples(getSamplesFromBuffer(newBuffer, 600));
    setSelection(null);
    setProgress(0);
    startOffsetRef.current = 0;
  }, [stopAudio, buffer]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    stopAudio();
    const prevBuffer = history[history.length - 1];
    // Save current to redo stack
    if (buffer) {
      setRedoStack(prev => [...prev, buffer]);
    }
    setHistory(prev => prev.slice(0, -1));
    setBuffer(prevBuffer);
    setSamples(getSamplesFromBuffer(prevBuffer, 600));
    setSelection(null);
    setProgress(0);
    startOffsetRef.current = 0;
  }, [history, buffer, stopAudio]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    stopAudio();
    const nextBuffer = redoStack[redoStack.length - 1];
    // Save current to history
    if (buffer) {
      setHistory(prev => [...prev, buffer]);
    }
    setRedoStack(prev => prev.slice(0, -1));
    setBuffer(nextBuffer);
    setSamples(getSamplesFromBuffer(nextBuffer, 600));
    setSelection(null);
    setProgress(0);
    startOffsetRef.current = 0;
  }, [redoStack, buffer, stopAudio]);
  
  const handleCrop = useCallback(() => {
    if (!audioContext || !buffer || !selection) return;
    const start = selection.start * buffer.duration;
    const end = selection.end * buffer.duration;
    updateBuffer(sliceBuffer(audioContext, buffer, start, end));
  }, [audioContext, buffer, selection, updateBuffer]);
  
  const handleCut = useCallback(() => {
    if (!audioContext || !buffer || !selection) return;
    const start = selection.start * buffer.duration;
    const end = selection.end * buffer.duration;
    updateBuffer(removeRange(audioContext, buffer, start, end));
  }, [audioContext, buffer, selection, updateBuffer]);
  
  const handleFadeIn = useCallback(() => {
    if (!audioContext || !buffer || !selection) return;
    const start = selection.start * buffer.duration;
    const end = selection.end * buffer.duration;
    updateBuffer(fadeBuffer(audioContext, buffer, start, end, 'in'));
  }, [audioContext, buffer, selection, updateBuffer]);
  
  const handleFadeOut = useCallback(() => {
    if (!audioContext || !buffer || !selection) return;
    const start = selection.start * buffer.duration;
    const end = selection.end * buffer.duration;
    updateBuffer(fadeBuffer(audioContext, buffer, start, end, 'out'));
  }, [audioContext, buffer, selection, updateBuffer]);
  
  const handleReverse = useCallback(() => {
    if (!audioContext || !buffer) return;
    const start = selection ? selection.start * buffer.duration : 0;
    const end = selection ? selection.end * buffer.duration : buffer.duration;
    updateBuffer(reverseBuffer(audioContext, buffer, start, end));
  }, [audioContext, buffer, selection, updateBuffer]);
  
  const handleDownload = useCallback(() => {
    if (!buffer) return;
    const blob = bufferToWave(buffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, '') + '_trimmed.wav';
    a.click();
    URL.revokeObjectURL(url);
  }, [buffer, fileName]);

  const handleReset = useCallback(() => {
    stopAudio();
    setProgress(0);
    startOffsetRef.current = 0;
  }, [stopAudio]);

  // Keyboard shortcuts for audio editing
  useKeyboardShortcuts([
    { key: ' ', handler: () => handlePlayToggle() },
    { key: 's', ctrl: true, handler: () => handleDownload() },
    { key: 'z', ctrl: true, handler: () => handleUndo() },
    { key: 'y', ctrl: true, handler: () => handleRedo() },
    { key: 'Delete', handler: () => selection && handleCut() },
    { key: 'Backspace', handler: () => selection && handleCut() },
    { key: 'Escape', handler: () => setSelection(null) },
    { 
      key: 'ArrowLeft', 
      handler: () => {
        if (!buffer) return;
        const step = 0.02;
        setProgress(p => Math.max(0, p - step));
        startOffsetRef.current = Math.max(0, progress - step) * buffer.duration;
      }
    },
    { 
      key: 'ArrowRight', 
      handler: () => {
        if (!buffer) return;
        const step = 0.02;
        setProgress(p => Math.min(1, p + step));
        startOffsetRef.current = Math.min(1, progress + step) * buffer.duration;
      }
    },
  ]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };
  
  // Button component
  const Button: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
  }> = ({ onClick, disabled, variant = 'secondary', children }) => {
    const baseClasses = 'px-4 py-2.5 font-mono text-xs uppercase tracking-widest rounded-lg transition-all duration-150 border disabled:opacity-40 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: isDark
        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-400'
        : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 hover:bg-cyan-500/20 hover:border-cyan-500',
      secondary: isDark
        ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 shadow-sm',
      danger: isDark
        ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
        : 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
    };
    
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {children}
      </motion.button>
    );
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* File loader */}
      <div className={`rounded-xl p-6 mb-6 border ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-block px-5 py-3 rounded-lg font-mono text-sm transition-colors border ${
                  isDark
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100'
                }`}
              >
                {fileName ? '📁 Load New File' : '📁 Load Audio File'}
              </motion.span>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
            </label>
            
            {fileName && (
              <div className={`font-mono text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <span className="opacity-60">File:</span> {fileName}
              </div>
            )}
          </div>
          
          {buffer && (
            <Button onClick={handleDownload} variant="primary">
              💾 Download
            </Button>
          )}
        </div>
      </div>
      
      {/* Waveform display */}
      <div className={`rounded-xl overflow-hidden mb-6 border ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="p-6">
          {!buffer ? (
            <div className={`h-48 flex flex-col items-center justify-center ${
              isDark ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <div className="text-6xl mb-4 opacity-30">∿</div>
              <p className="font-mono text-sm">Load an audio file to begin</p>
            </div>
          ) : (
            <div className="relative">
              <Waveform
                samples={samples}
                progress={progress}
                selectionStart={selection?.start}
                selectionEnd={selection?.end}
                onSelectionChange={(start, end) => setSelection({ start, end })}
                height={180}
              />
              
              {/* Time display */}
              <div className={`absolute top-2 right-2 font-mono text-xs px-2 py-1 rounded ${
                isDark 
                  ? 'bg-slate-800/80 text-cyan-400' 
                  : 'bg-white/90 text-cyan-600 shadow-sm'
              }`}>
                {formatTime(progress * buffer.duration)} / {formatTime(buffer.duration)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transport */}
        <div className={`rounded-xl p-4 border ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`font-mono text-xs uppercase tracking-widest mb-3 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Transport
          </h3>
          <div className="flex gap-3">
            <button 
              onClick={handlePlayToggle}
              disabled={!buffer}
              className={`px-4 py-2.5 font-mono text-xs uppercase tracking-widest rounded-lg transition-all duration-150 border disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-400'
                  : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 hover:bg-cyan-500/20 hover:border-cyan-500'
              }`}
            >
              {isPlaying ? '■ Stop' : '▶ Play'}
            </button>
            <Button onClick={handleReset} disabled={!buffer}>
              ⏮ Reset
            </Button>
            <Button onClick={handleUndo} disabled={history.length === 0}>
              ↩ Undo
            </Button>
            <Button onClick={handleRedo} disabled={redoStack.length === 0}>
              ↪ Redo
            </Button>
          </div>
        </div>
        
        {/* Edit tools */}
        <div className={`rounded-xl p-4 border ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`font-mono text-xs uppercase tracking-widest mb-3 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Edit Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCrop} disabled={!buffer || !selection}>
              Crop
            </Button>
            <Button onClick={handleCut} disabled={!buffer || !selection} variant="danger">
              Cut
            </Button>
            <Button onClick={handleFadeIn} disabled={!buffer || !selection}>
              Fade In
            </Button>
            <Button onClick={handleFadeOut} disabled={!buffer || !selection}>
              Fade Out
            </Button>
            <Button onClick={handleReverse} disabled={!buffer}>
              Reverse
            </Button>
          </div>
        </div>
      </div>
      
      {/* Status bar */}
      <div className={`mt-4 px-4 py-2 rounded-lg font-mono text-xs ${
        isDark ? 'bg-slate-900/30 text-slate-500' : 'bg-slate-100 text-slate-500'
      }`}>
        Status: {isPlaying ? 'Playing' : 'Ready'}
        {selection && selection.end > selection.start && (
          <span className="ml-4">
            Selection: {(selection.start * 100).toFixed(1)}% – {(selection.end * 100).toFixed(1)}%
          </span>
        )}
        {buffer && (
          <span className="ml-4">
            Duration: {formatTime(buffer.duration)} • {buffer.sampleRate}Hz • {buffer.numberOfChannels}ch
          </span>
        )}
      </div>
    </div>
  );
};

export default TrimItPanel;
