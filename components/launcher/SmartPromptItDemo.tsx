/**
 * SmartPromptItDemo.tsx
 * Interactive demo for the prompt enhancement engine
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from './themeStore';
import enhancePrompt, { 
  AIProvider, 
  IntentCategory,
  EnhancementConfig,
  EnhancementResult,
  AI_PROFILES,
  getProviderProfile
} from './promptEngine';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface SmartPromptItDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const SmartPromptItDemo: React.FC<SmartPromptItDemoProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const [rawPrompt, setRawPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('chatgpt');
  const [enhancementLevel, setEnhancementLevel] = useState(75);
  const [addClarifying, setAddClarifying] = useState(true);
  const [addStructure, setAddStructure] = useState(true);
  const [addQualityGates, setAddQualityGates] = useState(true);
  
  const [result, setResult] = useState<EnhancementResult | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Example prompts
  const EXAMPLE_PROMPTS = [
    'make me a website',
    'write a poem about rain',
    'fix this code that keeps crashing',
    'compare react and vue',
    'generate a logo for my startup',
    'explain how machine learning works',
    'create a function to sort an array',
    'help me brainstorm business ideas'
  ];
  
  // Auto-enhance when input changes
  useEffect(() => {
    if (!rawPrompt.trim()) {
      setResult(null);
      return;
    }
    
    const timer = setTimeout(() => {
      const config: EnhancementConfig = {
        level: enhancementLevel,
        preserveVoice: false,
        addClarifyingQuestions: addClarifying,
        addStructure: addStructure,
        addConstraints: true,
        addQualityGates: addQualityGates
      };
      
      const enhanced = enhancePrompt(rawPrompt, selectedProvider, config);
      setResult(enhanced);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [rawPrompt, selectedProvider, enhancementLevel, addClarifying, addStructure, addQualityGates]);
  
  // Copy to clipboard
  const handleCopy = async () => {
    if (!result) return;
    
    await navigator.clipboard.writeText(result.enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const providerProfile = useMemo(() => getProviderProfile(selectedProvider), [selectedProvider]);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl
          ${isDark 
            ? 'bg-slate-950 border border-cyan-500/30 shadow-cyan-500/10' 
            : 'bg-white border border-slate-200'
          }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b
          ${isDark ? 'border-slate-800' : 'border-slate-200'}
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 
                          flex items-center justify-center text-xl shadow-lg">
              ⚡
            </div>
            <div>
              <h2 className={`font-mono text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SmartPromptIt Demo
              </h2>
              <p className={`text-[10px] tracking-wider uppercase ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                AI Prompt Enhancement Engine
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${isDark 
                ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800' 
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
              }`}
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Left Panel - Input & Config */}
          <div className={`flex-1 flex flex-col p-4 border-r
            ${isDark ? 'border-slate-800' : 'border-slate-200'}
          `}>
            {/* Provider Selection */}
            <div className="mb-4">
              <label className={`text-[10px] uppercase tracking-wider mb-2 block
                ${isDark ? 'text-slate-500' : 'text-slate-400'}
              `}>
                Target AI Platform
              </label>
              <div className="flex flex-wrap gap-2">
                {(['chatgpt', 'claude', 'gemini', 'perplexity', 'copilot', 'midjourney'] as AIProvider[]).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all
                      ${selectedProvider === provider
                        ? isDark
                          ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50'
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                        : isDark
                          ? 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AI Profile Info */}
            <div className={`mb-4 p-3 rounded-lg text-[10px]
              ${isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-slate-50 border border-slate-200'}
            `}>
              <div className="flex items-center justify-between mb-2">
                <span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                  {providerProfile.displayName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[8px] uppercase
                  ${providerProfile.promptStyle.prefersRolePlaying 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-slate-700/50 text-slate-400'
                  }`}>
                  {providerProfile.promptStyle.prefersRolePlaying ? 'Loves Role-Play' : 'Direct Style'}
                </span>
              </div>
              <div className={`flex flex-wrap gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {providerProfile.strengths.slice(0, 4).map((s, i) => (
                  <span key={i} className={`px-1.5 py-0.5 rounded
                    ${isDark ? 'bg-slate-800' : 'bg-slate-200'}
                  `}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Raw Prompt Input */}
            <div className="flex-1 flex flex-col">
              <label className={`text-[10px] uppercase tracking-wider mb-2 flex items-center justify-between
                ${isDark ? 'text-slate-500' : 'text-slate-400'}
              `}>
                <span>Your Raw Prompt</span>
                <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>
                  {rawPrompt.length} chars
                </span>
              </label>
              
              <textarea
                value={rawPrompt}
                onChange={(e) => setRawPrompt(e.target.value)}
                placeholder="Type a prompt... e.g. 'make me a website'"
                className={`flex-1 p-3 rounded-lg resize-none font-mono text-sm
                  ${isDark 
                    ? 'bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50' 
                    : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-500'
                  } outline-none transition-colors`}
              />
              
              {/* Example prompts */}
              <div className="mt-3">
                <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  Try:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {EXAMPLE_PROMPTS.slice(0, 4).map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setRawPrompt(example)}
                      className={`text-[9px] px-2 py-1 rounded transition-colors
                        ${isDark 
                          ? 'bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700' 
                          : 'bg-slate-100 text-slate-500 hover:text-cyan-600 hover:bg-slate-200'
                        }`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Enhancement Config */}
            <div className={`mt-4 p-3 rounded-lg
              ${isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-slate-50 border border-slate-200'}
            `}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enhancement Level
                </span>
                <span className={`font-mono text-sm ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {enhancementLevel}%
                </span>
              </div>
              
              <input
                type="range"
                min={20}
                max={100}
                value={enhancementLevel}
                onChange={(e) => setEnhancementLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-cyan-500"
              />
              
              <div className="flex gap-3 mt-3">
                {[
                  { label: 'Clarifying Qs', value: addClarifying, set: setAddClarifying },
                  { label: 'Structure', value: addStructure, set: setAddStructure },
                  { label: 'Quality Gates', value: addQualityGates, set: setAddQualityGates }
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => opt.set(!opt.value)}
                    className={`flex-1 text-[9px] py-1.5 rounded transition-colors
                      ${opt.value 
                        ? isDark 
                          ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' 
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                        : isDark 
                          ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                  >
                    {opt.value ? '✓ ' : ''}{opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Output */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {result ? (
              <>
                {/* Result Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Enhanced Prompt
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded
                      ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}
                    `}>
                      Intent: {result.intent.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors
                      ${copied
                        ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50'
                        : isDark
                          ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-800/50'
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-300 hover:bg-cyan-200'
                      }`}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </motion.button>
                </div>
                
                {/* Enhanced Prompt Display */}
                <div className={`flex-1 p-4 rounded-lg overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap
                  ${isDark 
                    ? 'bg-slate-900 border border-slate-700 text-slate-200' 
                    : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {result.enhanced}
                </div>
                
                {/* Stats Footer */}
                <div className={`mt-3 flex items-center justify-between text-[9px]
                  ${isDark ? 'text-slate-500' : 'text-slate-400'}
                `}>
                  <div className="flex items-center gap-3">
                    <span>
                      Words: {result.wordCountChange.before} → <span className="text-cyan-400">{result.wordCountChange.after}</span>
                      <span className="text-emerald-400"> (+{((result.wordCountChange.after / result.wordCountChange.before - 1) * 100).toFixed(0)}%)</span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    {result.techniques.map((t, i) => (
                      <span key={i} className={`px-1.5 py-0.5 rounded
                        ${isDark ? 'bg-slate-800' : 'bg-slate-200'}
                      `}>
                        {t.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className={`text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span className="text-4xl mb-3 block">⚡</span>
                  <p className="text-sm font-mono">Type a prompt to see the enhancement</p>
                  <p className="text-[10px] mt-1">Your prompts will be transformed in real-time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmartPromptItDemo;
