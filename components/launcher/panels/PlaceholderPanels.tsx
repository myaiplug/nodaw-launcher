/**
 * PlaceholderPanels.tsx
 * Placeholder panels for Pro tools awaiting full implementation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../themeStore';

interface PlaceholderProps {
  title: string;
  icon: string;
  features: string[];
  comingSoon?: boolean;
}

const PlaceholderPanel: React.FC<PlaceholderProps> = ({ 
  title, 
  icon, 
  features,
  comingSoon = false 
}) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 text-center border ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 shadow-lg'
        }`}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-6xl mb-4"
        >
          {icon}
        </motion.div>
        
        {/* Title */}
        <h2 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h2>
        
        {/* Status badge */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-mono mb-6 ${
          comingSoon
            ? isDark
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-orange-100 text-orange-600'
            : isDark
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-purple-100 text-purple-600'
        }`}>
          {comingSoon ? 'Coming Soon' : 'In Development'}
        </div>
        
        {/* Features list */}
        <div className={`rounded-xl p-4 mb-6 ${
          isDark ? 'bg-slate-800/50' : 'bg-slate-50'
        }`}>
          <h3 className={`font-mono text-xs uppercase tracking-widest mb-3 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Planned Features
          </h3>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-2 text-sm ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <span className="text-cyan-500">✦</span>
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* CTA */}
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          This feature is part of the Pro tier. Stay tuned for updates!
        </p>
      </motion.div>
    </div>
  );
};

// ScrewIt - Pitch & Tempo Warp
export const ScrewItPanel: React.FC = () => (
  <PlaceholderPanel
    title="ScrewIt - Pitch & Tempo Warp"
    icon="🔩"
    features={[
      'Time-stretching without pitch change',
      'Pitch shifting without tempo change',
      'Chopped & screwed presets',
      'Half-speed / Double-speed modes',
      'Real-time preview with waveform sync'
    ]}
  />
);

// Workstation - Multitrack DAW
export const WorkstationPanel: React.FC = () => (
  <PlaceholderPanel
    title="NoDAW Workstation"
    icon="🎛️"
    features={[
      'Multitrack arrangement view',
      'Non-destructive editing',
      'Built-in effects and plugins',
      'Mix bus routing',
      'Export to multiple formats'
    ]}
    comingSoon
  />
);

export default {
  ScrewItPanel,
  WorkstationPanel
};
