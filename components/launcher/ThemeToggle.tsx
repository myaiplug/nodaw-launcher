/**
 * ThemeToggle.tsx
 * Animated sun/moon toggle button for dark/light theme switching
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from './themeStore';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-12 h-12 rounded-xl flex items-center justify-center
        transition-all duration-300 overflow-hidden
        ${isDark 
          ? 'bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/50' 
          : 'bg-white/80 hover:bg-slate-50/90 border border-slate-200 shadow-lg shadow-slate-200/50'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: isDark 
            ? 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)' 
            : 'radial-gradient(circle at center, rgba(251,191,36,0.2) 0%, transparent 70%)'
        }}
        transition={{ duration: 0.4 }}
      />
      
      <AnimatePresence mode="wait">
        {isDark ? (
          // Moon icon
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Moon body */}
            <svg 
              className="w-6 h-6 text-indigo-400" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            
            {/* Stars */}
            <motion.div 
              className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut' 
              }}
            />
            <motion.div 
              className="absolute -top-2 right-2 w-1 h-1 bg-yellow-300 rounded-full"
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: 0.5,
                ease: 'easeInOut' 
              }}
            />
            <motion.div 
              className="absolute top-0 -left-1 w-1 h-1 bg-blue-300 rounded-full"
              animate={{ 
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                delay: 1,
                ease: 'easeInOut' 
              }}
            />
          </motion.div>
        ) : (
          // Sun icon
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Sun rays - animated */}
            <motion.div 
              className="absolute inset-0 w-6 h-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-amber-400 rounded-full"
                  style={{
                    width: '2px',
                    height: '6px',
                    left: '50%',
                    top: '-4px',
                    marginLeft: '-1px',
                    transformOrigin: '50% calc(12px + 4px)',
                    transform: `rotate(${i * 45}deg)`
                  }}
                  animate={{
                    height: ['6px', '8px', '6px'],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </motion.div>
            
            {/* Sun body */}
            <motion.div
              className="relative w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-amber-400/50"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(251,191,36,0.4)',
                  '0 0 30px rgba(251,191,36,0.6)',
                  '0 0 20px rgba(251,191,36,0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
