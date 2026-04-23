/**
 * TrackRow.tsx
 * Individual track row with regions and automation lanes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../launcher/themeStore';
import { useWorkstationStore, Track } from './workstationStore';
import AudioRegion from './AudioRegion';
import AutomationLane from './AutomationLane';

interface TrackRowProps {
  track: Track;
  index: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const { view, selection } = useWorkstationStore();
  
  // Calculate track total height including visible automation lanes
  const automationHeight = view.showAutomation 
    ? track.automationLanes.filter(l => l.visible).reduce((sum, l) => sum + l.height, 0)
    : 0;
  
  const totalHeight = track.height + automationHeight;
  
  // Track background color based on mute/solo state
  const getTrackBg = () => {
    if (track.muted) {
      return isDark ? 'bg-slate-900/70' : 'bg-slate-200/70';
    }
    if (track.solo) {
      return isDark ? 'bg-amber-950/20' : 'bg-amber-50/50';
    }
    return isDark ? 'bg-slate-900/30' : 'bg-slate-50';
  };
  
  return (
    <div 
      className={`relative border-b ${isDark ? 'border-slate-800' : 'border-slate-300'}`}
      style={{ height: totalHeight }}
    >
      {/* Track content area */}
      <div 
        className={`relative ${getTrackBg()} ${track.muted ? 'opacity-60' : ''}`}
        style={{ height: track.height }}
      >
        {/* Alternating track stripe */}
        {index % 2 === 1 && (
          <div className={`absolute inset-0 ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`} />
        )}
        
        {/* Regions */}
        {track.regions.map((region) => (
          <AudioRegion 
            key={region.id} 
            region={region} 
            trackId={track.id}
            trackMuted={track.muted}
          />
        ))}
        
        {/* Recording indicator */}
        {track.armed && (
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <motion.div
              className="w-3 h-3 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-red-500 font-mono">REC ARMED</span>
          </div>
        )}
      </div>
      
      {/* Automation lanes */}
      {view.showAutomation && track.automationLanes
        .filter(lane => lane.visible)
        .map((lane) => (
          <AutomationLane
            key={lane.id}
            lane={lane}
            trackId={track.id}
          />
        ))
      }
    </div>
  );
};

export default TrackRow;
