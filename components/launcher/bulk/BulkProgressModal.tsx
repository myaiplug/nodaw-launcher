/**
 * BulkProgressModal - NoDAW Studio Suite
 * Awwwards-tier premium progress visualization
 * Sophisticated real-time processing feedback with technical details
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBulkStore } from './bulkStore';
import { useThemeStore } from '../themeStore';

interface BulkProgressModalProps {
  isOpen: boolean;
  onMinimize: () => void;
  onCancel: () => void;
}

const BulkProgressModal: React.FC<BulkProgressModalProps> = ({
  isOpen,
  onMinimize,
  onCancel,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const {
    currentJob,
    progressStats,
    isPaused,
    setItForgetItMode,
    pauseProcessing,
    resumeProcessing,
    cancelProcessing,
  } = useBulkStore();
  
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);
  const [expandedLog, setExpandedLog] = useState(false);
  
  // Processing log for nerd view
  const [processLog, setProcessLog] = useState<Array<{
    timestamp: number;
    type: 'info' | 'process' | 'success' | 'error' | 'system';
    message: string;
  }>>([]);
  
  // Add log entry
  const addLogEntry = useCallback((type: 'info' | 'process' | 'success' | 'error' | 'system', message: string) => {
    setProcessLog(prev => [...prev.slice(-50), { timestamp: Date.now(), type, message }]);
  }, []);
  
  // Update log based on progress changes
  useEffect(() => {
    if (progressStats?.currentOperation) {
      addLogEntry('process', progressStats.currentOperation);
    }
  }, [progressStats?.currentOperation, addLogEntry]);
  
  // Format time
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  
  // Get log entry color
  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return isDark ? 'text-emerald-400' : 'text-emerald-600';
      case 'error': return isDark ? 'text-red-400' : 'text-red-600';
      case 'process': return isDark ? 'text-cyan-400' : 'text-cyan-600';
      case 'system': return isDark ? 'text-purple-400' : 'text-purple-600';
      default: return isDark ? 'text-slate-400' : 'text-slate-500';
    }
  };
  
  // Progress ring calculations
  const progress = progressStats?.percentComplete ?? 0;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Estimated completion
  const eta = useMemo(() => {
    if (!progressStats?.estimatedTimeRemaining) return 'Calculating...';
    return formatTime(progressStats.estimatedTimeRemaining);
  }, [progressStats?.estimatedTimeRemaining]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-[600px] max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/50'
              : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200'
          }`}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `conic-gradient(from ${(Date.now() / 20) % 360}deg at 50% 50%, 
                  ${isDark ? '#00fff7' : '#0891b2'}, 
                  ${isDark ? '#0fffc3' : '#06b6d4'}, 
                  ${isDark ? '#00d4ff' : '#0ea5e9'}, 
                  ${isDark ? '#00fff7' : '#0891b2'})`,
                animation: 'spin 4s linear infinite',
              }}
            />
            <div
              className={`absolute inset-[2px] rounded-3xl ${
                isDark ? 'bg-slate-900' : 'bg-white'
              }`}
            />
          </div>
          
          {/* Header */}
          <div className="relative z-10 px-8 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isPaused ? 'Processing Paused' : 'Processing Files'}
                </h2>
                {setItForgetItMode && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-full text-xs font-medium ${
                      isDark
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Set It & Forget It Mode
                  </div>
                )}
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMinimize}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-slate-700/50 text-slate-400'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                  title="Minimize to tray"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Main progress visualization */}
          <div className="relative z-10 px-8 pb-6">
            <div className="flex items-center gap-8">
              {/* Circular progress */}
              <div className="relative flex-shrink-0">
                <svg width="200" height="200" className="transform -rotate-90">
                  {/* Background ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    className={isDark ? 'stroke-slate-800' : 'stroke-slate-200'}
                    strokeWidth="8"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isDark ? '#00fff7' : '#0891b2'} />
                      <stop offset="50%" stopColor={isDark ? '#0fffc3' : '#06b6d4'} />
                      <stop offset="100%" stopColor={isDark ? '#00d4ff' : '#0ea5e9'} />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-4xl font-bold font-mono ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {Math.round(progress)}%
                  </span>
                  <span
                    className={`text-xs font-mono mt-1 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {progressStats?.filesProcessed ?? 0}/{progressStats?.totalFiles ?? 0} files
                  </span>
                </div>
              </div>
              
              {/* Stats panel */}
              <div className="flex-1 space-y-4">
                {/* Current file */}
                <div>
                  <label
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Current File
                  </label>
                  <p
                    className={`text-sm font-medium truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                    title={progressStats?.currentFile}
                  >
                    {progressStats?.currentFile || 'Initializing...'}
                  </p>
                </div>
                
                {/* Current tool */}
                <div>
                  <label
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Processing With
                  </label>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                    }`}
                  >
                    {progressStats?.currentTool || 'Preparing pipeline...'}
                  </p>
                </div>
                
                {/* Time stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Elapsed
                    </label>
                    <p
                      className={`text-lg font-mono ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {formatTime(progressStats?.elapsedTime ?? 0)}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Remaining
                    </label>
                    <p
                      className={`text-lg font-mono ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    >
                      {eta}
                    </p>
                  </div>
                </div>
                
                {/* Throughput */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Data Processed
                    </label>
                    <p
                      className={`text-sm font-mono ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {formatBytes(progressStats?.bytesProcessed ?? 0)} / {formatBytes(progressStats?.totalBytes ?? 0)}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Speed
                    </label>
                    <p
                      className={`text-sm font-mono ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {(progressStats?.operationsPerSecond ?? 0).toFixed(2)} ops/s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Technical Details (Nerd Mode) */}
          <AnimatePresence>
            {showTechnicalDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: expandedLog ? 200 : 100, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`relative z-10 mx-8 mb-6 rounded-xl overflow-hidden ${
                  isDark ? 'bg-slate-950/80' : 'bg-slate-100'
                }`}
              >
                {/* Log header */}
                <div
                  className={`flex items-center justify-between px-3 py-2 border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <span
                      className={`text-xs font-mono ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      process_log — batch_processor
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedLog(!expandedLog)}
                    className={`text-xs ${
                      isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {expandedLog ? '▼ Collapse' : '▲ Expand'}
                  </button>
                </div>
                
                {/* Log content */}
                <div className="p-3 font-mono text-xs overflow-auto h-full">
                  {processLog.slice(-10).map((entry, i) => (
                    <div key={i} className="flex gap-2">
                      <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>
                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className={getLogColor(entry.type)}>
                        {entry.message}
                      </span>
                    </div>
                  ))}
                  {progressStats?.currentOperation && (
                    <div className="flex gap-2 animate-pulse">
                      <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>
                        [{new Date().toLocaleTimeString()}]
                      </span>
                      <span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                        → {progressStats.currentOperation}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Toggle technical details */}
          <div className="relative z-10 px-8 pb-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className={`text-xs flex items-center gap-1 ${
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg
                className={`w-3 h-3 transition-transform ${showTechnicalDetails ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
            </button>
          </div>
          
          {/* Footer actions */}
          <div
            className={`relative z-10 px-8 py-5 border-t flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Pause/Resume */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isPaused ? resumeProcessing : pauseProcessing}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  isPaused
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : isDark
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {isPaused ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause
                  </>
                )}
              </motion.button>
              
              {/* Minimize to tray */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onMinimize}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  isDark
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Hide to Tray
              </motion.button>
            </div>
            
            {/* Cancel */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (confirm('Are you sure you want to cancel processing? Progress will be lost.')) {
                  cancelProcessing();
                  onCancel();
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                isDark
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default BulkProgressModal;
