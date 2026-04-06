/**
 * DropZoneOverlay.tsx
 * Global file drop zone overlay for the launcher
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from './themeStore';

interface DropZoneOverlayProps {
  isActive: boolean;
  acceptedTypes?: string[];
  message?: string;
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({
  isActive,
  acceptedTypes = ['audio/*'],
  message = 'Drop audio files to get started'
}) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* Backdrop blur */}
          <div className={`absolute inset-0 ${
            isDark ? 'bg-slate-900/90' : 'bg-white/90'
          } backdrop-blur-sm`} />
          
          {/* Border pulse */}
          <motion.div
            className="absolute inset-4 rounded-3xl border-4 border-dashed"
            initial={{ borderColor: isDark ? 'rgb(6, 182, 212)' : 'rgb(34, 211, 238)' }}
            animate={{ 
              borderColor: isDark 
                ? ['rgb(6, 182, 212)', 'rgb(139, 92, 246)', 'rgb(6, 182, 212)']
                : ['rgb(34, 211, 238)', 'rgb(168, 85, 247)', 'rgb(34, 211, 238)']
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 ${
                isDark 
                  ? 'bg-cyan-500/20 border border-cyan-500/50' 
                  : 'bg-cyan-100 border border-cyan-200'
              }`}
            >
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="text-5xl"
              >
                🎵
              </motion.span>
            </motion.div>
            
            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              {message}
            </motion.h2>
            
            {/* Accepted types */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-sm font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Supports MP3, WAV, OGG, FLAC, M4A
            </motion.p>
            
            {/* Tool hints */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mt-8 flex gap-4 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {[
                { icon: '✂️', label: 'Trim' },
                { icon: '🔄', label: 'Convert' },
                { icon: '🔬', label: 'Compare' },
              ].map(tool => (
                <div key={tool.label} className="flex items-center gap-2 text-sm">
                  <span>{tool.icon}</span>
                  <span className="font-mono">{tool.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DropZoneOverlay;
