/**
 * SmartPromptItModal.tsx
 * Installation and configuration modal for SmartPromptIt
 * "The Universal AI Prompt Enhancement Engine"
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecretToolsStore } from './secretToolsStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AIProfile {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  enabled: boolean;
}

const AI_PROFILES: AIProfile[] = [
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', color: '#10a37f', description: 'GPT-4/4o/4.5', enabled: true },
  { id: 'claude', name: 'Claude', icon: '🧠', color: '#cc9b7a', description: 'Anthropic', enabled: true },
  { id: 'gemini', name: 'Gemini', icon: '✨', color: '#4285f4', description: 'Google', enabled: true },
  { id: 'perplexity', name: 'Perplexity', icon: '🔍', color: '#20808d', description: 'Search-focused', enabled: true },
  { id: 'copilot', name: 'Copilot', icon: '👨‍💻', color: '#6366f1', description: 'VS Code/GitHub', enabled: true },
  { id: 'cursor', name: 'Cursor', icon: '⌨️', color: '#7c3aed', description: 'Code Editor AI', enabled: true },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨', color: '#ff6b6b', description: 'Image Gen', enabled: false },
  { id: 'dalle', name: 'DALL-E', icon: '🖼️', color: '#10a37f', description: 'OpenAI Images', enabled: false },
  { id: 'bing', name: 'Bing Chat', icon: '🌐', color: '#00a4ef', description: 'Microsoft', enabled: false },
  { id: 'meta', name: 'Meta AI', icon: '📱', color: '#0668E1', description: 'Social/Casual', enabled: false },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const SmartPromptItModal: React.FC = () => {
  const { 
    selectTool, 
    startInstall, 
    isToolInstalled, 
    getToolInstallProgress 
  } = useSecretToolsStore();
  
  const [step, setStep] = useState<'intro' | 'configure' | 'installing' | 'complete'>('intro');
  const [profiles, setProfiles] = useState(AI_PROFILES);
  const [enhancementLevel, setEnhancementLevel] = useState(80);
  const [autoActivate, setAutoActivate] = useState(true);
  
  const installed = isToolInstalled('smart-prompt-it');
  const progress = getToolInstallProgress('smart-prompt-it');
  
  // Track installation progress
  useEffect(() => {
    if (progress >= 100 && step === 'installing') {
      setStep('complete');
    }
  }, [progress, step]);
  
  const handleClose = () => {
    selectTool(null);
  };
  
  const handleStartInstall = () => {
    setStep('installing');
    startInstall('smart-prompt-it');
  };
  
  const toggleProfile = (id: string) => {
    setProfiles(prev => 
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-950 border border-cyan-500/30 rounded-2xl 
                   shadow-[0_0_80px_rgba(34,211,238,0.2)] overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-slate-800 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-transparent to-purple-950/30" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 
                            flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
                ⚡
              </div>
              <div>
                <h2 className="text-2xl font-mono text-white tracking-wide">
                  SmartPromptIt
                </h2>
                <p className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase">
                  Universal AI Prompt Engine
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center
                       text-slate-500 hover:text-red-400 hover:border-red-500/50 transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <IntroStep 
                key="intro" 
                onContinue={() => setStep('configure')} 
              />
            )}
            
            {step === 'configure' && (
              <ConfigureStep
                key="configure"
                profiles={profiles}
                onToggleProfile={toggleProfile}
                enhancementLevel={enhancementLevel}
                onEnhancementChange={setEnhancementLevel}
                autoActivate={autoActivate}
                onAutoActivateChange={setAutoActivate}
                onBack={() => setStep('intro')}
                onInstall={handleStartInstall}
              />
            )}
            
            {step === 'installing' && (
              <InstallingStep key="installing" progress={progress} />
            )}
            
            {step === 'complete' && (
              <CompleteStep key="complete" onClose={handleClose} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════

const IntroStep: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {/* Hero description */}
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <p className="text-sm text-slate-300 leading-relaxed">
        SmartPromptIt transforms your casual prompts into <span className="text-cyan-400">elite-tier, 
        surgically precise communications</span> that extract maximum value from any AI system.
      </p>
    </div>
    
    {/* Feature grid */}
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: '🎯', title: 'AI Detection', desc: 'Auto-detects ChatGPT, Claude, Gemini & more' },
        { icon: '🧠', title: 'Intent Analysis', desc: 'Classifies your goal for optimal enhancement' },
        { icon: '✨', title: 'Smart Enhancement', desc: 'Role priming, constraints, structure optimization' },
        { icon: '🔄', title: 'Per-AI Tailoring', desc: 'Optimized prompts for each AI\'s strengths' },
      ].map((f, i) => (
        <div key={i} className="bg-slate-900/30 rounded-lg p-3 border border-slate-800/50">
          <span className="text-xl">{f.icon}</span>
          <h4 className="text-xs font-mono text-slate-200 mt-2">{f.title}</h4>
          <p className="text-[9px] text-slate-500 mt-1">{f.desc}</p>
        </div>
      ))}
    </div>
    
    {/* Before/After example */}
    <div className="space-y-2">
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Example Transformation</span>
      
      <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-3">
        <span className="text-[8px] text-red-400 uppercase tracking-wider">Before</span>
        <p className="text-xs text-red-300 font-mono mt-1">"make me a website"</p>
      </div>
      
      <div className="flex justify-center">
        <span className="text-cyan-500">↓</span>
      </div>
      
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3">
        <span className="text-[8px] text-emerald-400 uppercase tracking-wider">After (ChatGPT)</span>
        <p className="text-[10px] text-emerald-300 font-mono mt-1 leading-relaxed">
          "Act as a senior full-stack developer. I need you to architect a professional website. 
          Before proceeding, ask me 5 clarifying questions about: 1) Target audience, 2) Core 
          functionality, 3) Design preferences, 4) Tech stack, 5) SEO priorities..."
        </p>
      </div>
    </div>
    
    {/* How it works */}
    <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-800/50">
      <h4 className="text-xs font-mono text-cyan-400 mb-2">How It Works</h4>
      <ol className="text-[10px] text-slate-400 space-y-1">
        <li>1. SmartPromptIt monitors when you're typing to any AI interface</li>
        <li>2. A floating widget appears showing your enhanced prompt</li>
        <li>3. Click "Inject" to replace your prompt, or copy/customize</li>
        <li>4. Get dramatically better AI responses with zero extra effort</li>
      </ol>
    </div>
    
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onContinue}
      className="w-full py-3 bg-cyan-900 border border-cyan-500 rounded-lg text-cyan-50 
               font-mono text-sm hover:bg-cyan-800 transition-colors
               shadow-lg shadow-cyan-900/50"
    >
      Configure Installation →
    </motion.button>
  </motion.div>
);

const ConfigureStep: React.FC<{
  profiles: AIProfile[];
  onToggleProfile: (id: string) => void;
  enhancementLevel: number;
  onEnhancementChange: (v: number) => void;
  autoActivate: boolean;
  onAutoActivateChange: (v: boolean) => void;
  onBack: () => void;
  onInstall: () => void;
}> = ({ 
  profiles, 
  onToggleProfile, 
  enhancementLevel, 
  onEnhancementChange,
  autoActivate,
  onAutoActivateChange,
  onBack, 
  onInstall 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-5"
  >
    {/* AI Profiles */}
    <div>
      <h3 className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-cyan-900/50 text-cyan-400 text-[10px] flex items-center justify-center">1</span>
        Enable AI Platforms
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onToggleProfile(profile.id)}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left
              ${profile.enabled 
                ? 'bg-slate-800/50 border-cyan-500/30' 
                : 'bg-slate-900/30 border-slate-800/50 opacity-50'
              }`}
          >
            <span className="text-lg">{profile.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-200 block truncate">{profile.name}</span>
              <span className="text-[8px] text-slate-500">{profile.description}</span>
            </div>
            <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px]
              ${profile.enabled 
                ? 'border-cyan-500 bg-cyan-500 text-slate-950' 
                : 'border-slate-600'
              }`}
            >
              {profile.enabled && '✓'}
            </div>
          </button>
        ))}
      </div>
    </div>
    
    {/* Enhancement Level */}
    <div>
      <h3 className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-cyan-900/50 text-cyan-400 text-[10px] flex items-center justify-center">2</span>
        Enhancement Level
      </h3>
      
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500">Minimal</span>
          <span className="text-sm font-mono text-cyan-400">{enhancementLevel}%</span>
          <span className="text-[10px] text-slate-500">Maximum</span>
        </div>
        
        <input
          type="range"
          min={20}
          max={100}
          value={enhancementLevel}
          onChange={(e) => onEnhancementChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                   [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:shadow-cyan-500/50"
        />
        
        <p className="text-[9px] text-slate-600 mt-2">
          Higher levels add more structure, constraints, and AI-specific optimizations. 
          Lower levels make lighter touch-ups while preserving your original voice.
        </p>
      </div>
    </div>
    
    {/* Auto-activate */}
    <div>
      <h3 className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-cyan-900/50 text-cyan-400 text-[10px] flex items-center justify-center">3</span>
        Behavior
      </h3>
      
      <button
        onClick={() => onAutoActivateChange(!autoActivate)}
        className="w-full flex items-center justify-between p-3 bg-slate-900/30 rounded-lg 
                 border border-slate-800/50 hover:border-slate-700 transition-colors"
      >
        <div>
          <span className="text-xs text-slate-200">Auto-activate on AI sites</span>
          <p className="text-[9px] text-slate-500 mt-0.5">
            Automatically show enhancement widget when typing to supported AIs
          </p>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors ${
          autoActivate ? 'bg-cyan-600' : 'bg-slate-700'
        }`}>
          <motion.div 
            className="w-4 h-4 bg-white rounded-full shadow mt-0.5"
            animate={{ x: autoActivate ? 22 : 2 }}
          />
        </div>
      </button>
    </div>
    
    {/* Action buttons */}
    <div className="flex gap-3 pt-2">
      <button
        onClick={onBack}
        className="px-4 py-2 border border-slate-700 rounded-lg text-slate-400 
                 text-xs font-mono hover:bg-slate-800 transition-colors"
      >
        ← Back
      </button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onInstall}
        className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg 
                 text-white font-mono text-sm shadow-lg shadow-cyan-900/50
                 hover:from-cyan-500 hover:to-purple-500 transition-colors"
      >
        Install SmartPromptIt (48 MB)
      </motion.button>
    </div>
  </motion.div>
);

const InstallingStep: React.FC<{ progress: number }> = ({ progress }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="py-8 text-center space-y-6"
  >
    {/* Progress circle */}
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={283}
          strokeDashoffset={283 - (283 * progress) / 100}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono text-cyan-400">{progress.toFixed(0)}%</span>
      </div>
    </div>
    
    {/* Status text */}
    <div className="space-y-2">
      <h3 className="text-lg font-mono text-slate-200">
        {progress < 30 && 'Downloading core engine...'}
        {progress >= 30 && progress < 60 && 'Installing AI profiles...'}
        {progress >= 60 && progress < 90 && 'Configuring enhancement system...'}
        {progress >= 90 && 'Finalizing...'}
      </h3>
      <p className="text-[10px] text-slate-500">
        This may take a moment. Please don't close this window.
      </p>
    </div>
    
    {/* Installation log */}
    <div className="bg-slate-900/50 rounded-lg p-3 text-left max-h-32 overflow-y-auto font-mono text-[9px] text-slate-500">
      {progress >= 5 && <div>✓ Verifying system compatibility</div>}
      {progress >= 15 && <div>✓ Downloading SmartPromptIt v1.0.0-alpha</div>}
      {progress >= 30 && <div>✓ Extracting enhancement engine</div>}
      {progress >= 45 && <div>✓ Loading ChatGPT profile</div>}
      {progress >= 55 && <div>✓ Loading Claude profile</div>}
      {progress >= 65 && <div>✓ Loading Gemini profile</div>}
      {progress >= 75 && <div>✓ Configuring intent classifier</div>}
      {progress >= 85 && <div>✓ Setting up system tray integration</div>}
      {progress >= 95 && <div className="text-cyan-400">✓ Installation complete!</div>}
    </div>
  </motion.div>
);

const CompleteStep: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="py-8 text-center space-y-6"
  >
    {/* Success icon */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.2 }}
      className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 
               flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30"
    >
      ✓
    </motion.div>
    
    <div className="space-y-2">
      <h3 className="text-xl font-mono text-emerald-400">Installation Complete!</h3>
      <p className="text-sm text-slate-400">
        SmartPromptIt is now ready to supercharge your AI interactions.
      </p>
    </div>
    
    {/* Quick start guide */}
    <div className="bg-slate-900/50 rounded-xl p-4 text-left space-y-3">
      <h4 className="text-xs font-mono text-cyan-400">Quick Start</h4>
      
      <div className="space-y-2 text-[10px] text-slate-400">
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[9px] text-slate-500 mt-0.5">1</span>
          <span>Open any AI chat (ChatGPT, Claude, Gemini, etc.)</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[9px] text-slate-500 mt-0.5">2</span>
          <span>Start typing your prompt as usual</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[9px] text-slate-500 mt-0.5">3</span>
          <span>The SmartPromptIt widget will appear with your enhanced prompt</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[9px] text-slate-500 mt-0.5">4</span>
          <span>Click "Inject" to use the enhanced version, or customize as needed</span>
        </div>
      </div>
    </div>
    
    {/* Keyboard shortcut reminder */}
    <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-3">
      <p className="text-[10px] text-cyan-400">
        <strong>Pro tip:</strong> Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[9px]">Ctrl+Shift+P</kbd> to 
        manually trigger enhancement on any selected text
      </p>
    </div>
    
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClose}
      className="w-full py-3 bg-emerald-900 border border-emerald-500 rounded-lg text-emerald-50 
               font-mono text-sm hover:bg-emerald-800 transition-colors
               shadow-lg shadow-emerald-900/50"
    >
      Start Using SmartPromptIt
    </motion.button>
  </motion.div>
);

export default SmartPromptItModal;
