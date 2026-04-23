/**
 * TransportBar.tsx
 * Playback controls, timeline display, tempo controls
 * Professional DAW transport with loop, metronome, and BPM tap
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../launcher/themeStore';
import { useWorkstationStore } from './workstationStore';

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function formatBars(seconds: number, bpm: number, timeSignature: [number, number]): string {
  const beatsPerSecond = bpm / 60;
  const totalBeats = seconds * beatsPerSecond;
  const beatsPerBar = timeSignature[0];
  
  const bars = Math.floor(totalBeats / beatsPerBar) + 1;
  const beats = Math.floor(totalBeats % beatsPerBar) + 1;
  const ticks = Math.floor((totalBeats % 1) * 16); // 16th note resolution
  
  return `${bars}.${beats}.${ticks.toString().padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const TransportBar: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const {
    project,
    playback,
    tracks,
    view,
    play,
    pause,
    stop,
    seek,
    setBpm,
    toggleLoop,
    setLoop,
    updateTrack
  } = useWorkstationStore();
  
  const [displayMode, setDisplayMode] = useState<'time' | 'bars'>('bars');
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [bpmInputValue, setBpmInputValue] = useState(project.bpm.toString());
  
  const bpmInputRef = useRef<HTMLInputElement>(null);
  const hasArmedTracks = tracks.some(t => t.armed);
  
  // Handle BPM tap
  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    const newTaps = [...tapTimes.filter(t => now - t < 3000), now];
    setTapTimes(newTaps);
    
    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      if (newBpm >= 20 && newBpm <= 300) {
        setBpm(newBpm);
      }
    }
  }, [tapTimes, setBpm]);
  
  // Handle BPM input
  const handleBpmSubmit = useCallback(() => {
    const newBpm = parseInt(bpmInputValue, 10);
    if (!isNaN(newBpm) && newBpm >= 20 && newBpm <= 300) {
      setBpm(newBpm);
    }
    setIsEditingBpm(false);
  }, [bpmInputValue, setBpm]);
  
  // Focus BPM input when editing
  useEffect(() => {
    if (isEditingBpm && bpmInputRef.current) {
      bpmInputRef.current.select();
    }
  }, [isEditingBpm]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (playback.isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case 'Enter':
          e.preventDefault();
          stop();
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Toggle record arm on selected track
            const selectedTrack = tracks.find(t => t.id === view.selectedTrackId);
            if (selectedTrack) {
              updateTrack(selectedTrack.id, { armed: !selectedTrack.armed });
            }
          }
          break;
        case 'KeyL':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleLoop();
          }
          break;
        case 'KeyM':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setMetronomeEnabled(!metronomeEnabled);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback.isPlaying, play, pause, stop, toggleLoop, metronomeEnabled, tracks, view.selectedTrackId, updateTrack]);
  
  // Button styles
  const buttonBase = `w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150
    ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`;
  
  const activeButton = `${isDark ? 'bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800/50' : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'}`;
  
  return (
    <div className={`flex items-center gap-4 px-4 py-2 border-b 
      ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
    >
      {/* === TRANSPORT CONTROLS === */}
      <div className="flex items-center gap-1">
        {/* Rewind to start */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => seek(0)}
          className={buttonBase}
          title="Return to start (Home)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </motion.button>
        
        {/* Stop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stop}
          className={buttonBase}
          title="Stop (Enter)"
        >
          <div className={`w-4 h-4 rounded-sm ${isDark ? 'bg-slate-400' : 'bg-slate-600'}`} />
        </motion.button>
        
        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => playback.isPlaying ? pause() : play()}
          className={`${buttonBase} ${playback.isPlaying ? activeButton : ''}`}
          title="Play/Pause (Space)"
        >
          {playback.isPlaying ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </motion.button>
        
        {/* Record */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Toggle record mode
          }}
          className={`${buttonBase} ${hasArmedTracks ? 'bg-red-900/50 hover:bg-red-800/50' : ''}`}
          title="Record (Ctrl+R)"
        >
          <motion.div
            className="w-4 h-4 rounded-full bg-red-500"
            animate={hasArmedTracks && playback.isPlaying ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.button>
      </div>
      
      {/* === LOOP CONTROL === */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLoop}
          className={`${buttonBase} ${playback.loopEnabled ? activeButton : ''}`}
          title="Toggle Loop (Ctrl+L)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
        </motion.button>
        
        {playback.loopEnabled && (
          <div className={`text-[10px] font-mono px-2 py-1 rounded 
            ${isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}
          >
            {formatBars(playback.loopStart, project.bpm, project.timeSignature)} → 
            {formatBars(playback.loopEnd, project.bpm, project.timeSignature)}
          </div>
        )}
      </div>
      
      {/* === DIVIDER === */}
      <div className={`w-px h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
      
      {/* === TIME DISPLAY === */}
      <div 
        className={`font-mono text-xl tracking-wider cursor-pointer select-none
          ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
        onClick={() => setDisplayMode(d => d === 'time' ? 'bars' : 'time')}
        title="Click to toggle time/bars display"
      >
        {displayMode === 'time' 
          ? formatTime(playback.currentTime)
          : formatBars(playback.currentTime, project.bpm, project.timeSignature)
        }
      </div>
      
      {/* === DIVIDER === */}
      <div className={`w-px h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
      
      {/* === BPM/TEMPO === */}
      <div className="flex items-center gap-2">
        {isEditingBpm ? (
          <input
            ref={bpmInputRef}
            type="number"
            min="20"
            max="300"
            value={bpmInputValue}
            onChange={(e) => setBpmInputValue(e.target.value)}
            onBlur={handleBpmSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBpmSubmit();
              if (e.key === 'Escape') setIsEditingBpm(false);
            }}
            className={`w-16 px-2 py-1 rounded font-mono text-lg text-center
              ${isDark 
                ? 'bg-slate-800 text-amber-400 border border-amber-500/50' 
                : 'bg-white text-amber-600 border border-amber-400'
              } outline-none`}
          />
        ) : (
          <button
            onClick={() => {
              setBpmInputValue(project.bpm.toString());
              setIsEditingBpm(true);
            }}
            className={`px-2 py-1 rounded font-mono text-lg transition-colors
              ${isDark 
                ? 'text-amber-400 hover:bg-slate-800' 
                : 'text-amber-600 hover:bg-slate-100'
              }`}
            title="Click to edit BPM"
          >
            {project.bpm} <span className="text-xs opacity-60">BPM</span>
          </button>
        )}
        
        {/* Tap Tempo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleTapTempo}
          className={`px-2 py-1 rounded text-xs font-mono uppercase tracking-wider
            ${isDark 
              ? 'bg-slate-800 text-slate-400 hover:text-amber-400' 
              : 'bg-slate-200 text-slate-600 hover:text-amber-600'
            }`}
          title="Tap to set tempo"
        >
          TAP
        </motion.button>
      </div>
      
      {/* === TIME SIGNATURE === */}
      <button
        className={`px-2 py-1 rounded font-mono text-sm
          ${isDark 
            ? 'text-slate-400 hover:bg-slate-800' 
            : 'text-slate-600 hover:bg-slate-100'
          }`}
        title="Click to change time signature"
      >
        {project.timeSignature[0]}/{project.timeSignature[1]}
      </button>
      
      {/* === DIVIDER === */}
      <div className={`w-px h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
      
      {/* === METRONOME === */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMetronomeEnabled(!metronomeEnabled)}
        className={`${buttonBase} ${metronomeEnabled ? activeButton : ''}`}
        title="Toggle Metronome (Ctrl+M)"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.75A2.25 2.25 0 0 0 9.75 4v.67c-3.28.9-5.75 3.83-5.75 7.33 0 4.28 3.47 7.75 7.75 7.75s7.75-3.47 7.75-7.75c0-3.5-2.47-6.43-5.75-7.33V4A2.25 2.25 0 0 0 12 1.75zM12 4.5a.75.75 0 0 1 .75.75v1.19a6.73 6.73 0 0 1 3.75 1.63l.8-.8a.75.75 0 1 1 1.1 1.1l-.84.84A6.73 6.73 0 0 1 18.75 12a6.75 6.75 0 1 1-13.5 0 6.73 6.73 0 0 1 1.25-3.91l-.84-.84a.75.75 0 1 1 1.1-1.1l.8.8a6.73 6.73 0 0 1 3.69-1.61V5.25a.75.75 0 0 1 .75-.75z"/>
          <path d="M12 8.5a.75.75 0 0 1 .75.75v3l2.12 1.06a.75.75 0 0 1-.67 1.34L11.5 13V9.25a.75.75 0 0 1 .5-.75z"/>
        </svg>
      </motion.button>
      
      {/* === SPACER === */}
      <div className="flex-1" />
      
      {/* === SNAP CONTROLS === */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => useWorkstationStore.getState().toggleSnap()}
          className={`px-2 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors
            ${view.snapEnabled 
              ? isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
              : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'
            }`}
          title="Toggle Snap to Grid"
        >
          Snap {view.snapEnabled ? 'ON' : 'OFF'}
        </motion.button>
        
        <select
          value={view.snapValue}
          onChange={(e) => useWorkstationStore.getState().setSnapValue(parseFloat(e.target.value))}
          disabled={!view.snapEnabled}
          className={`px-2 py-1 rounded text-xs font-mono
            ${isDark 
              ? 'bg-slate-800 text-slate-400 border border-slate-700' 
              : 'bg-white text-slate-600 border border-slate-300'
            } ${!view.snapEnabled ? 'opacity-50' : ''}`}
        >
          <option value="1">Bar</option>
          <option value="0.5">1/2</option>
          <option value="0.25">1/4</option>
          <option value="0.125">1/8</option>
          <option value="0.0625">1/16</option>
          <option value="0.03125">1/32</option>
        </select>
      </div>
      
      {/* === AUTOMATION TOGGLE === */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => useWorkstationStore.getState().toggleAutomationView()}
        className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors
          ${view.showAutomation 
            ? isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
            : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'
          }`}
        title="Toggle Automation Lanes (A)"
      >
        Automation
      </motion.button>
      
      {/* === ZOOM CONTROLS === */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => useWorkstationStore.getState().setZoom(Math.max(10, view.zoom * 0.8))}
          className={`w-7 h-7 rounded flex items-center justify-center text-lg
            ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-black'}`}
          title="Zoom Out"
        >
          −
        </motion.button>
        
        <span className={`w-12 text-center text-xs font-mono
          ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          {Math.round(view.zoom)}px/s
        </span>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => useWorkstationStore.getState().setZoom(Math.min(500, view.zoom * 1.25))}
          className={`w-7 h-7 rounded flex items-center justify-center text-lg
            ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-black'}`}
          title="Zoom In"
        >
          +
        </motion.button>
      </div>
    </div>
  );
};

export default TransportBar;
