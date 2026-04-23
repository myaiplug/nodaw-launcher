/**
 * PromptGeniusUI - EditPix AI Prompt Enhancement Interface
 * Awwwards-tier minimalistic premium prompt improvement studio
 * One-click magic wand or detailed configuration
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { 
  enhancePrompt, 
  quickEnhance, 
  enhanceForVideo 
} from './PromptGenius';
import { PromptRequest, EnhancedPrompt } from './types';

interface PromptGeniusUIProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt?: (prompt: string) => void;
}

const PromptGeniusUI: React.FC<PromptGeniusUIProps> = ({
  isOpen,
  onClose,
  onUsePrompt,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const [rawIdea, setRawIdea] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [style, setStyle] = useState<PromptRequest['style']>('photorealistic');
  const [enhancedResult, setEnhancedResult] = useState<EnhancedPrompt | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Quick enhance with magic wand
  const handleQuickEnhance = useCallback(() => {
    if (!rawIdea.trim()) return;
    
    setIsEnhancing(true);
    
    // Simulate processing time for premium feel
    setTimeout(() => {
      const result = enhancePrompt({
        rawIdea,
        mediaType,
        style,
      });
      setEnhancedResult(result);
      setIsEnhancing(false);
    }, 800);
  }, [rawIdea, mediaType, style]);
  
  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);
  
  // Score color
  const getScoreColor = (score: number, isRisk: boolean = false) => {
    if (isRisk) {
      if (score < 30) return isDark ? 'text-emerald-400' : 'text-emerald-600';
      if (score < 60) return isDark ? 'text-amber-400' : 'text-amber-600';
      return isDark ? 'text-red-400' : 'text-red-600';
    }
    if (score > 70) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (score > 40) return isDark ? 'text-amber-400' : 'text-amber-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative w-[800px] max-w-[95vw] max-h-[90vh] overflow-auto rounded-3xl shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/50'
            : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 px-8 pt-8 pb-6 backdrop-blur-xl bg-opacity-90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDark
                    ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30'
                    : 'bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200'
                }`}
              >
                <svg
                  className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  PromptGenius
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Hyper-realistic AI prompt enhancement
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="px-8 pb-8">
          {/* Input section */}
          <div className="mb-6">
            <label
              className={`text-xs font-medium uppercase tracking-wider block mb-3 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Describe your vision
            </label>
            <div className="relative">
              <textarea
                value={rawIdea}
                onChange={(e) => setRawIdea(e.target.value)}
                placeholder="A woman sitting in a coffee shop reading a book, warm afternoon light..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${
                  isDark
                    ? 'bg-slate-800/50 text-white border border-slate-700 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'
                    : 'bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                } outline-none transition-all`}
              />
              
              {/* Magic wand button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleQuickEnhance}
                disabled={!rawIdea.trim() || isEnhancing}
                className={`absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center ${
                  rawIdea.trim() && !isEnhancing
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 cursor-pointer'
                    : isDark
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Magic enhance"
              >
                {isEnhancing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Options row */}
          <div className="flex items-center gap-4 mb-6">
            {/* Media type toggle */}
            <div
              className={`flex rounded-xl p-1 ${
                isDark ? 'bg-slate-800/50' : 'bg-slate-100'
              }`}
            >
              <button
                onClick={() => setMediaType('image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mediaType === 'image'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow'
                      : 'bg-white text-slate-900 shadow'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🖼️ Image
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mediaType === 'video'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow'
                      : 'bg-white text-slate-900 shadow'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🎬 Video
              </button>
            </div>
            
            {/* Style select */}
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as PromptRequest['style'])}
              className={`px-4 py-2 rounded-xl text-sm ${
                isDark
                  ? 'bg-slate-800/50 text-white border border-slate-700'
                  : 'bg-white text-slate-900 border border-slate-300'
              } outline-none`}
            >
              <option value="photorealistic">📷 Photorealistic</option>
              <option value="cinematic">🎥 Cinematic</option>
              <option value="editorial">📰 Editorial</option>
              <option value="product">📦 Product</option>
              <option value="lifestyle">☕ Lifestyle</option>
            </select>
            
            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
                isDark
                  ? 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-300'
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Advanced
            </button>
          </div>
          
          {/* Results section */}
          <AnimatePresence>
            {enhancedResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Score badges */}
                <div className="flex items-center gap-4">
                  <div
                    className={`px-4 py-2 rounded-xl ${
                      isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                    }`}
                  >
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Realism Score
                    </span>
                    <p className={`text-2xl font-bold font-mono ${getScoreColor(enhancedResult.realismScore)}`}>
                      {enhancedResult.realismScore}%
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl ${
                      isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                    }`}
                  >
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Detection Risk
                    </span>
                    <p className={`text-2xl font-bold font-mono ${getScoreColor(enhancedResult.detectionRiskScore, true)}`}>
                      {enhancedResult.detectionRiskScore}%
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl flex-1 ${
                      isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                    }`}
                  >
                    <span
                      className={`text-xs uppercase tracking-wider block ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Technical Parameters
                    </span>
                    <p
                      className={`text-sm font-mono ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {enhancedResult.technicalParams}
                    </p>
                  </div>
                </div>
                
                {/* Primary prompt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Enhanced Prompt
                    </label>
                    <button
                      onClick={() => copyToClipboard(enhancedResult.primary, 0)}
                      className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${
                        copiedIndex === 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isDark
                          ? 'bg-slate-700 text-slate-400 hover:text-white'
                          : 'bg-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {copiedIndex === 0 ? (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    className={`p-4 rounded-xl text-sm ${
                      isDark
                        ? 'bg-violet-500/10 border border-violet-500/20 text-white'
                        : 'bg-violet-50 border border-violet-200 text-slate-900'
                    }`}
                  >
                    {enhancedResult.primary}
                  </div>
                </div>
                
                {/* Negative prompt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Negative Prompt (avoid these)
                    </label>
                    <button
                      onClick={() => copyToClipboard(enhancedResult.negative, 1)}
                      className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${
                        copiedIndex === 1
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isDark
                          ? 'bg-slate-700 text-slate-400 hover:text-white'
                          : 'bg-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {copiedIndex === 1 ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div
                    className={`p-4 rounded-xl text-sm ${
                      isDark
                        ? 'bg-red-500/10 border border-red-500/20 text-slate-400'
                        : 'bg-red-50 border border-red-200 text-slate-600'
                    }`}
                  >
                    {enhancedResult.negative}
                  </div>
                </div>
                
                {/* Alternate versions */}
                <div>
                  <label
                    className={`text-xs font-medium uppercase tracking-wider block mb-2 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Alternative Versions
                  </label>
                  <div className="space-y-2">
                    {enhancedResult.alternateVersions.map((alt, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl flex items-start justify-between gap-3 ${
                          isDark
                            ? 'bg-slate-800/50 border border-slate-700/50'
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <p
                          className={`text-xs flex-1 ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {alt}
                        </p>
                        <button
                          onClick={() => copyToClipboard(alt, i + 10)}
                          className={`p-1 rounded ${
                            copiedIndex === i + 10
                              ? 'text-emerald-400'
                              : isDark
                              ? 'text-slate-500 hover:text-white'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Tips */}
                <div>
                  <label
                    className={`text-xs font-medium uppercase tracking-wider block mb-2 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Pro Tips for Maximum Realism
                  </label>
                  <div className="space-y-1">
                    {enhancedResult.tips.map((tip, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 text-sm ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        <span className={isDark ? 'text-violet-400' : 'text-violet-500'}>→</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Empty state */}
          {!enhancedResult && !isEnhancing && (
            <div
              className={`text-center py-12 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                }`}
              >
                <svg
                  className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <p className="font-medium">Describe your vision above</p>
              <p className="text-sm mt-1">
                Click the magic wand ✨ to generate hyper-realistic prompts
              </p>
              <p className="text-xs mt-4 opacity-60">
                Designed for 99.9% undetectable AI image/video generation
              </p>
            </div>
          )}
          
          {/* Enhancing state */}
          {isEnhancing && (
            <div
              className={`text-center py-12 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl shadow-violet-500/30`}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
                </svg>
              </motion.div>
              <p className="font-medium">Enhancing your prompt...</p>
              <p className="text-sm mt-1">
                Applying ivy-league wordsmith optimization
              </p>
            </div>
          )}
        </div>
        
        {/* Footer branding */}
        <div
          className={`px-8 py-4 border-t text-center ${
            isDark ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'
          }`}
        >
          <p className="text-xs">
            PromptGenius by EditPix • Hyper-realistic prompt engineering
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromptGeniusUI;
