/**
 * ToolPanel.tsx
 * Wrapper component for tool panels with slide-in animation and back navigation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import ThemeToggle from '../ThemeToggle';

interface ToolPanelProps {
  open: boolean;
  title: string;
  icon: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  open,
  title,
  icon,
  onBack,
  children
}) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            mass: 0.8
          }}
          className={`fixed inset-0 z-50 overflow-auto ${
            isDark 
              ? 'bg-slate-950' 
              : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
          }`}
        >
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`sticky top-0 z-20 backdrop-blur-xl border-b ${
              isDark 
                ? 'bg-slate-950/80 border-slate-800' 
                : 'bg-white/80 border-slate-200'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              {/* Back button + Title */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 19l-7-7 7-7" 
                    />
                  </svg>
                  <span className="text-sm font-medium">Back</span>
                </motion.button>
                
                <div className={`h-6 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <h1 className={`text-xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {title}
                  </h1>
                </div>
              </div>
              
              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </motion.header>
          
          {/* Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {children}
          </motion.main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToolPanel;
