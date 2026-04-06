/**
 * TestItPanel.tsx
 * A/B Audio Comparison Tool
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface AudioTrack {
  id: 'A' | 'B';
  file?: File;
  buffer?: AudioBuffer;
  name?: string;
}

export const TestItPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const [tracks, setTracks] = useState<{ A: AudioTrack; B: AudioTrack }>({
    A: { id: 'A' },
    B: { id: 'B' }
  });
  const [activeTrack, setActiveTrack] = useState<'A' | 'B'>('A');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [syncPlayback, setSyncPlayback] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceARef = useRef<AudioBufferSourceNode | null>(null);
  const sourceBRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef(0);
  const startOffsetRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;
    
    return () => { ctx.close(); };
  }, []);
  
  const loadFile = async (trackId: 'A' | 'B', file: File) => {
    if (!audioContextRef.current) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      setTracks(prev => ({
        ...prev,
        [trackId]: {
          id: trackId,
          file,
          buffer,
          name: file.name
        }
      }));
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  };
  
  const handleFileInput = (trackId: 'A' | 'B') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      loadFile(trackId, e.target.files[0]);
    }
  };
  
  const stopPlayback = useCallback(() => {
    [sourceARef, sourceBRef].forEach(ref => {
      if (ref.current) {
        try { ref.current.stop(); } catch {}
        ref.current = null;
      }
    });
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
  }, []);
  
  const startPlayback = useCallback(() => {
    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    if (!ctx || !gainNode) return;
    
    const track = tracks[activeTrack];
    if (!track.buffer) return;
    
    // Create source for active track
    const source = ctx.createBufferSource();
    source.buffer = track.buffer;
    source.loop = isLooping;
    source.connect(gainNode);
    
    const offset = startOffsetRef.current;
    source.start(0, offset);
    
    if (activeTrack === 'A') {
      sourceARef.current = source;
    } else {
      sourceBRef.current = source;
    }
    
    startTimeRef.current = ctx.currentTime - offset;
    setIsPlaying(true);
    
    const duration = track.buffer.duration;
    
    const loop = () => {
      if (!ctx || !isPlaying) return;
      const current = ctx.currentTime - startTimeRef.current;
      
      if (current >= duration && !isLooping) {
        stopPlayback();
        startOffsetRef.current = 0;
        setProgress(0);
        return;
      }
      
      const normalizedProgress = isLooping ? (current % duration) / duration : current / duration;
      setProgress(normalizedProgress);
      startOffsetRef.current = current % duration;
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    
    source.onended = () => {
      if (!isLooping) {
        stopPlayback();
      }
    };
  }, [activeTrack, tracks, isLooping, stopPlayback, isPlaying]);
  
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };
  
  const switchTrack = (trackId: 'A' | 'B') => {
    if (trackId === activeTrack) return;
    
    const wasPlaying = isPlaying;
    const currentOffset = startOffsetRef.current;
    
    if (wasPlaying) {
      stopPlayback();
    }
    
    setActiveTrack(trackId);
    
    if (wasPlaying && syncPlayback && tracks[trackId].buffer) {
      // Resume from same position
      setTimeout(() => {
        startOffsetRef.current = currentOffset;
        startPlayback();
      }, 50);
    }
  };
  
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = val;
    }
  };
  
  const handleSeek = (pos: number) => {
    const track = tracks[activeTrack];
    if (!track.buffer) return;
    
    const wasPlaying = isPlaying;
    stopPlayback();
    startOffsetRef.current = pos * track.buffer.duration;
    setProgress(pos);
    
    if (wasPlaying) {
      setTimeout(startPlayback, 50);
    }
  };

  // Keyboard shortcuts for A/B comparison
  useKeyboardShortcuts([
    { key: 'a', handler: () => tracks.A.buffer && switchTrack('A') },
    { key: 'b', handler: () => tracks.B.buffer && switchTrack('B') },
    { key: ' ', handler: (e) => { e.preventDefault(); togglePlayback(); } },
    { key: 'l', handler: () => setIsLooping(prev => !prev) },
    { key: 'ArrowLeft', handler: () => handleSeek(Math.max(0, progress - 0.05)) },
    { key: 'ArrowRight', handler: () => handleSeek(Math.min(1, progress + 0.05)) },
  ]);
  
  const formatTime = (buffer: AudioBuffer | undefined, progress: number): string => {
    if (!buffer) return '0:00';
    const seconds = progress * buffer.duration;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const TrackSlot: React.FC<{ trackId: 'A' | 'B' }> = ({ trackId }) => {
    const track = tracks[trackId];
    const isActive = activeTrack === trackId;
    
    return (
      <motion.div
        onClick={() => track.buffer && switchTrack(trackId)}
        whileHover={{ scale: track.buffer ? 1.02 : 1 }}
        whileTap={{ scale: track.buffer ? 0.98 : 1 }}
        className={`relative flex-1 rounded-2xl p-6 border-2 transition-all cursor-pointer ${
          isActive
            ? isDark
              ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/20'
              : 'bg-cyan-50 border-cyan-500 shadow-lg shadow-cyan-200'
            : isDark
              ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        {/* Track label */}
        <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xl ${
          isActive
            ? isDark ? 'bg-cyan-500 text-slate-900' : 'bg-cyan-500 text-white'
            : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
        }`}>
          {trackId}
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-mono ${
              isDark ? 'bg-cyan-500/30 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
            }`}
          >
            {isPlaying ? '▶ Playing' : 'Active'}
          </motion.div>
        )}
        
        <div className="mt-12">
          {track.buffer ? (
            <>
              <h3 className={`font-mono text-sm truncate mb-2 ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                {track.name}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {formatTime(track.buffer, 1)} • {track.buffer.sampleRate}Hz
              </p>
              
              {/* Mini waveform visualization */}
              <div className={`mt-4 h-12 rounded-lg overflow-hidden ${
                isDark ? 'bg-slate-800/50' : 'bg-slate-100'
              }`}>
                <div className="h-full flex items-center gap-px px-2">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        isActive && (i / 40) <= progress
                          ? 'bg-cyan-500'
                          : isDark ? 'bg-slate-600' : 'bg-slate-300'
                      }`}
                      style={{ 
                        height: `${20 + Math.random() * 60}%`,
                        opacity: isActive ? 1 : 0.5
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Replace button */}
              <label className="cursor-pointer mt-3 block">
                <span className={`text-xs font-mono ${
                  isDark ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-400 hover:text-cyan-500'
                }`}>
                  Replace file
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileInput(trackId)}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <label className="block cursor-pointer">
              <div className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed transition-colors ${
                isDark
                  ? 'border-slate-700 hover:border-cyan-500/50 text-slate-500'
                  : 'border-slate-200 hover:border-cyan-400 text-slate-400'
              }`}>
                <span className="text-3xl mb-2">🎵</span>
                <span className="font-mono text-sm">Load Track {trackId}</span>
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInput(trackId)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </motion.div>
    );
  };
  
  const bothLoaded = tracks.A.buffer && tracks.B.buffer;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header instructions */}
      <div className={`text-center mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <p className="font-mono text-sm">
          Load two audio files and switch between them instantly to compare
        </p>
      </div>
      
      {/* Track slots */}
      <div className="flex gap-6 mb-8">
        <TrackSlot trackId="A" />
        
        {/* VS divider */}
        <div className="flex flex-col items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold ${
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
          }`}>
            VS
          </div>
        </div>
        
        <TrackSlot trackId="B" />
      </div>
      
      {/* Controls */}
      <div className={`rounded-xl p-6 border ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Progress bar */}
        <div 
          className={`h-2 rounded-full mb-6 cursor-pointer ${
            isDark ? 'bg-slate-800' : 'bg-slate-200'
          }`}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            handleSeek(pos);
          }}
        >
          <motion.div
            className="h-full bg-cyan-500 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        
        {/* Time display */}
        <div className="flex justify-between mb-6">
          <span className={`font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatTime(tracks[activeTrack].buffer, progress)}
          </span>
          <span className={`font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatTime(tracks[activeTrack].buffer, 1)}
          </span>
        </div>
        
        {/* Main controls */}
        <div className="flex items-center justify-center gap-4">
          {/* A/B Switch buttons */}
          <div className={`flex rounded-lg overflow-hidden border ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            {(['A', 'B'] as const).map(trackId => (
              <motion.button
                key={trackId}
                onClick={() => switchTrack(trackId)}
                disabled={!tracks[trackId].buffer}
                whileHover={{ scale: tracks[trackId].buffer ? 1.02 : 1 }}
                whileTap={{ scale: tracks[trackId].buffer ? 0.98 : 1 }}
                className={`px-6 py-3 font-mono font-bold text-lg transition-colors disabled:opacity-30 ${
                  activeTrack === trackId
                    ? isDark
                      ? 'bg-cyan-500 text-slate-900'
                      : 'bg-cyan-500 text-white'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {trackId}
              </motion.button>
            ))}
          </div>
          
          {/* Play/Pause */}
          <motion.button
            onClick={togglePlayback}
            disabled={!tracks[activeTrack].buffer}
            whileHover={{ scale: tracks[activeTrack].buffer ? 1.05 : 1 }}
            whileTap={{ scale: tracks[activeTrack].buffer ? 0.95 : 1 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors disabled:opacity-30 ${
              isDark
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg'
            }`}
          >
            {isPlaying ? '⏸' : '▶'}
          </motion.button>
          
          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={e => handleVolumeChange(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
        
        {/* Options */}
        <div className="flex justify-center gap-6 mt-6">
          <label className={`flex items-center gap-2 text-sm cursor-pointer ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <input
              type="checkbox"
              checked={isLooping}
              onChange={e => setIsLooping(e.target.checked)}
              className="rounded"
            />
            Loop
          </label>
          <label className={`flex items-center gap-2 text-sm cursor-pointer ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <input
              type="checkbox"
              checked={syncPlayback}
              onChange={e => setSyncPlayback(e.target.checked)}
              className="rounded"
            />
            Sync position on switch
          </label>
        </div>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className={`mt-6 text-center text-xs font-mono ${
        isDark ? 'text-slate-600' : 'text-slate-400'
      }`}>
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>A</kbd>
        {' / '}
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>B</kbd>
        {' switch • '}
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>Space</kbd>
        {' play • '}
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>←</kbd>
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>→</kbd>
        {' seek • '}
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>L</kbd>
        {' loop'}
      </div>
    </div>
  );
};

export default TestItPanel;
