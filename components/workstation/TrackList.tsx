/**
 * TrackList.tsx
 * Container for all tracks and their regions
 */

import React from 'react';
import { useThemeStore } from '../launcher/themeStore';
import { useWorkstationStore } from './workstationStore';
import TrackRow from './TrackRow';

export const TrackList: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const { tracks, view, project } = useWorkstationStore();
  
  // Calculate timeline width based on project duration and zoom
  const timelineWidth = project.duration * view.pixelsPerSecond * view.zoom;
  
  return (
    <div 
      className={`relative ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}
      style={{ width: timelineWidth, minHeight: '100%' }}
    >
      {/* Grid lines for visual reference */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isDark ? '#334155' : '#cbd5e1'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isDark ? '#334155' : '#cbd5e1'} 1px, transparent 1px)
          `,
          backgroundSize: `${view.pixelsPerSecond * view.zoom * 1}px 100px, 100% 80px`,
        }}
      />
      
      {/* Tracks */}
      {tracks.map((track, index) => (
        <TrackRow key={track.id} track={track} index={index} />
      ))}
      
      {/* Empty state */}
      {tracks.length === 0 && (
        <div className={`absolute inset-0 flex items-center justify-center ${
          isDark ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="font-mono text-sm">Drop audio files here to begin</div>
            <div className="text-xs mt-1 opacity-60">or click "Add Track" to create empty tracks</div>
          </div>
        </div>
      )}
      
      {/* Selection overlay */}
      <SelectionOverlay />
    </div>
  );
};

// Selection rectangle overlay
const SelectionOverlay: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const { selection, view } = useWorkstationStore();
  
  if (!selection) return null;
  
  const left = Math.min(selection.start, selection.end) * view.pixelsPerSecond * view.zoom;
  const width = Math.abs(selection.end - selection.start) * view.pixelsPerSecond * view.zoom;
  
  return (
    <div
      className={`absolute top-0 bottom-0 pointer-events-none ${
        isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-500/10 border-cyan-500/30'
      } border-l border-r`}
      style={{ left, width }}
    />
  );
};

export default TrackList;
