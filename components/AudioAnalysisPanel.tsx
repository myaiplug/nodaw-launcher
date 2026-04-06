// NoDAW Audio Analysis Panel - Cyber-HUD Style BPM/Key Display
import React from 'react';
import { AudioAnalysisResult, formatDuration } from '../audioAnalysis';

interface AudioAnalysisPanelProps {
  analysis: AudioAnalysisResult | null;
  isAnalyzing: boolean;
  fileName?: string;
}

const ConfidenceRing: React.FC<{ confidence: number; size?: number }> = ({ confidence, size = 48 }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = confidence * circumference;

  const getColor = () => {
    if (confidence >= 0.8) return 'var(--success-color)';
    if (confidence >= 0.5) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        className="transition-all duration-500"
        style={{ filter: `drop-shadow(0 0 6px ${getColor()})` }}
      />
    </svg>
  );
};

const StatBlock: React.FC<{ label: string; value: string | number; unit?: string; highlight?: boolean }> = ({ 
  label, value, unit, highlight 
}) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
    highlight 
      ? 'bg-highlight-bg border-highlight-border' 
      : 'bg-default-bg border-default-border'
  }`}>
    <span className="text-[9px] font-mono text-muted uppercase tracking-[0.15em] mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-lg font-tech font-bold ${highlight ? 'text-highlight-text' : 'text-primary-text'}`}>
        {value}
      </span>
      {unit && <span className="text-[10px] font-mono text-muted">{unit}</span>}
    </div>
  </div>
);

export const AudioAnalysisPanel: React.FC<AudioAnalysisPanelProps> = ({ 
  analysis, 
  isAnalyzing,
  fileName 
}) => {
  if (!analysis && !isAnalyzing) {
    return null;
  }
  
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl p-5 border border-slate-700/50 shadow-lg animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-tech font-bold text-slate-200 tracking-wide">AUDIO ANALYSIS</h3>
            {fileName && (
              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{fileName}</p>
            )}
          </div>
        </div>
        
        {isAnalyzing && (
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.15em]">Analyzing</span>
          </div>
        )}
      </div>
      
      {isAnalyzing ? (
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-slate-700 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }} />
            <div className="absolute inset-2 w-12 h-12 border-2 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s', filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.5))' }} />
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          {/* BPM Hero Display */}
          <div className="flex items-center justify-center gap-6 py-3">
            <div className="relative">
              <ConfidenceRing confidence={analysis.confidence} size={72} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold text-slate-100">{analysis.bpm || '--'}</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em]">BPM</span>
              </div>
            </div>
            
            {analysis.key && (
              <div className="flex flex-col items-center justify-center px-5 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em] mb-1">Key</span>
                <span className="text-xl font-display font-bold text-purple-400 tracking-wide">
                  {analysis.key}
                </span>
              </div>
            )}
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <StatBlock 
              label="Duration" 
              value={formatDuration(analysis.duration)} 
            />
            <StatBlock 
              label="Sample Rate" 
              value={(analysis.sampleRate / 1000).toFixed(1)} 
              unit="kHz" 
            />
            <StatBlock 
              label="Channels" 
              value={analysis.channels === 2 ? 'Stereo' : 'Mono'} 
            />
            <StatBlock 
              label="Confidence" 
              value={Math.round(analysis.confidence * 100)} 
              unit="%" 
              highlight={analysis.confidence >= 0.8}
            />
          </div>
          
          {/* Pitch Info */}
          {analysis.pitch && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 border border-slate-700/30 rounded-lg">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em]">Detected Pitch</span>
              <span className="text-sm font-tech font-bold text-slate-300">{analysis.pitch} Hz</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

// Compact version for header/toolbar (Cyber-HUD style)
export const CompactBpmDisplay: React.FC<{ bpm: number; confidence: number; analyzing?: boolean }> = ({ 
  bpm, confidence, analyzing 
}) => {
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]';
    if (confidence >= 0.5) return 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]';
    return 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.5)]';
  };
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg">
      {analyzing ? (
        <>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.1em]">...</span>
        </>
      ) : (
        <>
          <div className={`w-1.5 h-1.5 rounded-full ${confidence >= 0.5 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
          <span className="text-sm font-tech font-bold text-slate-200">{bpm || '--'}</span>
          <span className="text-[9px] font-mono text-slate-500">BPM</span>
          <div className={`w-2 h-2 rounded-full ${getConfidenceColor()}`} />
        </>
      )}
    </div>
  );
};

export default AudioAnalysisPanel;
