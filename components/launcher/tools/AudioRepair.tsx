/**
 * AudioRepair.tsx
 * AI-powered audio restoration tool
 * Remove clicks, pops, hum, and background noise
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AudioRepairProps {
  isOpen: boolean;
  onClose: () => void;
}

type RepairType = 'declip' | 'denoise' | 'dehum' | 'declick' | 'dereverb' | 'debreath';

interface RepairPreset {
  id: string;
  name: string;
  description: string;
  repairs: {
    type: RepairType;
    amount: number;
  }[];
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  phase: string;
}

// ═══════════════════════════════════════════════════════════
// REPAIR TYPE CONFIG
// ═══════════════════════════════════════════════════════════

const REPAIR_TYPES: {
  id: RepairType;
  name: string;
  icon: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'declip',
    name: 'Declip',
    icon: '📈',
    description: 'Restore clipped/distorted peaks',
    color: 'red'
  },
  {
    id: 'denoise',
    name: 'Denoise',
    icon: '🔇',
    description: 'Remove background noise & hiss',
    color: 'cyan'
  },
  {
    id: 'dehum',
    name: 'De-Hum',
    icon: '⚡',
    description: 'Remove 50/60Hz electrical hum',
    color: 'amber'
  },
  {
    id: 'declick',
    name: 'De-Click',
    icon: '💥',
    description: 'Remove clicks, pops & crackle',
    color: 'purple'
  },
  {
    id: 'dereverb',
    name: 'De-Reverb',
    icon: '🏠',
    description: 'Reduce room reverb & echo',
    color: 'emerald'
  },
  {
    id: 'debreath',
    name: 'De-Breath',
    icon: '💨',
    description: 'Remove breath sounds from vocals',
    color: 'pink'
  }
];

const PRESETS: RepairPreset[] = [
  {
    id: 'vinyl-restoration',
    name: 'Vinyl Restoration',
    description: 'Clean up vinyl rips',
    repairs: [
      { type: 'declick', amount: 80 },
      { type: 'denoise', amount: 40 },
      { type: 'dehum', amount: 30 }
    ]
  },
  {
    id: 'podcast-cleanup',
    name: 'Podcast Cleanup',
    description: 'Clean dialogue recordings',
    repairs: [
      { type: 'denoise', amount: 60 },
      { type: 'debreath', amount: 50 },
      { type: 'dehum', amount: 40 }
    ]
  },
  {
    id: 'live-recording',
    name: 'Live Recording',
    description: 'Fix live concert audio',
    repairs: [
      { type: 'declip', amount: 70 },
      { type: 'denoise', amount: 30 },
      { type: 'dereverb', amount: 25 }
    ]
  },
  {
    id: 'tape-restoration',
    name: 'Tape Restoration',
    description: 'Restore old tape recordings',
    repairs: [
      { type: 'denoise', amount: 50 },
      { type: 'dehum', amount: 60 },
      { type: 'declip', amount: 40 }
    ]
  },
  {
    id: 'vocal-cleanup',
    name: 'Vocal Cleanup',
    description: 'Clean isolated vocals',
    repairs: [
      { type: 'debreath', amount: 70 },
      { type: 'denoise', amount: 40 },
      { type: 'declick', amount: 30 }
    ]
  },
  {
    id: 'room-cleanup',
    name: 'Room Cleanup',
    description: 'Fix roomy recordings',
    repairs: [
      { type: 'dereverb', amount: 60 },
      { type: 'denoise', amount: 35 },
      { type: 'dehum', amount: 20 }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════

const RepairSlider: React.FC<{
  type: typeof REPAIR_TYPES[0];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}> = ({ type, value, onChange, disabled }) => {
  const colorMap: Record<string, { bg: string; fill: string; text: string }> = {
    red: { bg: 'bg-red-900/30', fill: 'bg-red-500', text: 'text-red-400' },
    cyan: { bg: 'bg-cyan-900/30', fill: 'bg-cyan-500', text: 'text-cyan-400' },
    amber: { bg: 'bg-amber-900/30', fill: 'bg-amber-500', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-900/30', fill: 'bg-purple-500', text: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-900/30', fill: 'bg-emerald-500', text: 'text-emerald-400' },
    pink: { bg: 'bg-pink-900/30', fill: 'bg-pink-500', text: 'text-pink-400' }
  };
  
  const colors = colorMap[type.color] || colorMap.cyan;
  
  return (
    <div className={`p-3 rounded-lg bg-slate-900/50 border border-slate-800 
                    ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{type.icon}</span>
          <div>
            <div className={`text-sm font-mono ${colors.text}`}>{type.name}</div>
            <div className="text-[9px] text-slate-500">{type.description}</div>
          </div>
        </div>
        <div className={`font-mono text-sm ${colors.text}`}>
          {value}%
        </div>
      </div>
      
      <div className="relative h-2 rounded-full overflow-hidden bg-slate-800">
        <motion.div
          className={`absolute inset-y-0 left-0 ${colors.fill}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const AudioRepair: React.FC<AudioRepairProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  // Repair amounts
  const [repairAmounts, setRepairAmounts] = useState<Record<RepairType, number>>({
    declip: 0,
    denoise: 0,
    dehum: 0,
    declick: 0,
    dereverb: 0,
    debreath: 0
  });
  
  // Processing state
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    phase: 'idle'
  });
  
  // File state
  const [loadedFile, setLoadedFile] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    hasClipping: boolean;
    noiseFloor: number;
    humDetected: boolean;
    clicksDetected: number;
  } | null>(null);
  
  // Handlers
  const handleRepairChange = (type: RepairType, value: number) => {
    setRepairAmounts(prev => ({ ...prev, [type]: value }));
  };
  
  const applyPreset = (preset: RepairPreset) => {
    const newAmounts: Record<RepairType, number> = {
      declip: 0, denoise: 0, dehum: 0, declick: 0, dereverb: 0, debreath: 0
    };
    
    preset.repairs.forEach(r => {
      newAmounts[r.type] = r.amount;
    });
    
    setRepairAmounts(newAmounts);
  };
  
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setLoadedFile(file.name);
      
      // Simulate analysis
      setTimeout(() => {
        setAnalysisResults({
          hasClipping: Math.random() > 0.5,
          noiseFloor: Math.floor(Math.random() * 20) - 60,
          humDetected: Math.random() > 0.6,
          clicksDetected: Math.floor(Math.random() * 50)
        });
      }, 500);
    }
  }, []);
  
  const handleProcess = async () => {
    setProcessing({ isProcessing: true, progress: 0, phase: 'analyzing' });
    
    // Simulate processing
    const phases = ['analyzing', 'declipping', 'denoising', 'finalizing'];
    for (let i = 0; i < phases.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setProcessing({
        isProcessing: true,
        progress: ((i + 1) / phases.length) * 100,
        phase: phases[i]
      });
    }
    
    setProcessing({ isProcessing: false, progress: 100, phase: 'complete' });
    
    setTimeout(() => {
      setProcessing({ isProcessing: false, progress: 0, phase: 'idle' });
    }, 2000);
  };
  
  const resetAll = () => {
    setRepairAmounts({
      declip: 0, denoise: 0, dehum: 0, declick: 0, dereverb: 0, debreath: 0
    });
  };
  
  // Check if any repair is active
  const hasActiveRepairs = Object.values(repairAmounts).some(v => v > 0);
  
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
        className={`w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col
          ${isDark 
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/20' 
            : 'bg-white border border-slate-200'
          }`}
        style={{
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.15)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 
                          flex items-center justify-center text-2xl shadow-lg">
              🩹
            </div>
            <div>
              <h2 className={`font-mono text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AudioRepair
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-emerald-400 tracking-widest">
                  RESTORATION
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-cyan-900/50 text-cyan-400 
                               rounded border border-cyan-500/30">
                  PRO
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center
                     text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - File & Analysis */}
            <div className="lg:col-span-1 space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={`p-6 rounded-xl border-2 border-dashed transition-colors text-center
                  ${loadedFile 
                    ? 'border-emerald-500/50 bg-emerald-950/20' 
                    : 'border-slate-700 hover:border-slate-600'
                  }`}
              >
                {loadedFile ? (
                  <div className="space-y-2">
                    <span className="text-3xl">✅</span>
                    <div className="text-sm text-emerald-400 font-mono">{loadedFile}</div>
                    <button
                      onClick={() => { setLoadedFile(null); setAnalysisResults(null); }}
                      className="text-[10px] text-slate-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-3xl opacity-50">📁</span>
                    <div className="text-sm text-slate-400">Drop audio file here</div>
                    <div className="text-[10px] text-slate-600">WAV, MP3, FLAC, AIFF</div>
                  </div>
                )}
              </div>
              
              {/* Analysis Results */}
              {analysisResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3"
                >
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Analysis Results
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clipping Detected</span>
                      <span className={analysisResults.hasClipping ? 'text-red-400' : 'text-emerald-400'}>
                        {analysisResults.hasClipping ? '⚠️ Yes' : '✓ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Noise Floor</span>
                      <span className="text-cyan-400 font-mono">{analysisResults.noiseFloor} dB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hum Detected</span>
                      <span className={analysisResults.humDetected ? 'text-amber-400' : 'text-emerald-400'}>
                        {analysisResults.humDetected ? '⚠️ 60Hz' : '✓ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clicks/Pops</span>
                      <span className={analysisResults.clicksDetected > 10 ? 'text-purple-400' : 'text-slate-400'}>
                        {analysisResults.clicksDetected} found
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      // Auto-set repairs based on analysis
                      setRepairAmounts({
                        declip: analysisResults.hasClipping ? 60 : 0,
                        denoise: Math.min(80, Math.abs(analysisResults.noiseFloor)),
                        dehum: analysisResults.humDetected ? 50 : 0,
                        declick: Math.min(80, analysisResults.clicksDetected * 2),
                        dereverb: 0,
                        debreath: 0
                      });
                    }}
                    className="w-full py-2 rounded-lg text-xs font-mono
                             bg-emerald-900/50 border border-emerald-500/30 text-emerald-400
                             hover:bg-emerald-900/70 transition-colors"
                  >
                    Auto-Detect Settings
                  </button>
                </motion.div>
              )}
              
              {/* Presets */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
                  Quick Presets
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="p-2 rounded-lg text-left text-[10px] transition-colors
                               bg-slate-800/50 border border-slate-700 
                               hover:border-emerald-500/30 hover:bg-slate-800"
                    >
                      <div className="text-slate-200 font-mono">{preset.name}</div>
                      <div className="text-slate-500 text-[8px]">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Repair Controls */}
            <div className="lg:col-span-2 space-y-3">
              {REPAIR_TYPES.map((type) => (
                <RepairSlider
                  key={type.id}
                  type={type}
                  value={repairAmounts[type.id]}
                  onChange={(v) => handleRepairChange(type.id, v)}
                  disabled={processing.isProcessing}
                />
              ))}
            </div>
          </div>
          
          {/* Processing Progress */}
          {processing.phase !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-mono uppercase">
                  {processing.phase}
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  {processing.progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${processing.progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-lg text-xs font-mono
                       bg-slate-800/50 border border-slate-700 text-slate-400
                       hover:border-slate-600 hover:text-slate-300 transition-colors"
            >
              Reset All
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
              disabled={processing.isProcessing || !loadedFile || !hasActiveRepairs}
              className="px-6 py-2.5 rounded-lg text-sm font-mono
                       bg-gradient-to-r from-emerald-500 to-cyan-600 text-white
                       hover:from-emerald-400 hover:to-cyan-500 transition-all
                       disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            >
              {processing.isProcessing ? 'Processing...' : 'Apply Repairs'}
            </button>
            <button
              disabled={!loadedFile}
              className="px-4 py-2.5 rounded-lg text-sm font-mono
                       bg-cyan-900/50 border border-cyan-500/30 text-cyan-400
                       hover:bg-cyan-900/70 transition-colors disabled:opacity-50"
            >
              Export
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioRepair;
