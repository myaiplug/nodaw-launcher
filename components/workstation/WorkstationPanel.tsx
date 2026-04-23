/**
 * WorkstationPanel.tsx
 * NoDAW Mini-DAW - Fast audio editing workstation
 * "Make big edits faster than your DAW takes to boot"
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../launcher/themeStore';
import { useWorkstationStore } from './workstationStore';
import Timeline from './Timeline';
import TrackList from './TrackList';
import TransportBar from './TransportBar';
import Toolbar from './Toolbar';
import TrackHeader from './TrackHeader';
import AutomationEditor from './AutomationEditor';
import FXApplyModal from './FXApplyModal';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const WorkstationPanel: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const {
    project,
    tracks,
    playback,
    view,
    selection,
    selectedRegionIds,
  } = useWorkstationStore();
  
  const [showFXModal, setShowFXModal] = useState(false);
  const [showAutomationEditor, setShowAutomationEditor] = useState(false);
  const [automationEditTarget, setAutomationEditTarget] = useState<string | null>(null);
  
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate total track heights
  const totalTrackHeight = tracks.reduce((sum, t) => {
    let height = t.height;
    if (view.showAutomation) {
      height += t.automationLanes.filter(l => l.visible).reduce((h, l) => h + l.height, 0);
    }
    return sum + height;
  }, 0);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const { play, pause, stop, seek, toggleSnap, toggleLoop, playback, undo, redo } = useWorkstationStore.getState();
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (playback.isPlaying) pause();
          else play();
          break;
        case 'Enter':
          e.preventDefault();
          stop();
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            // Split at playhead
            const regions = useWorkstationStore.getState().getRegionsAtTime(playback.currentTime);
            if (regions.length > 0) {
              useWorkstationStore.getState().splitRegionAtTime(regions[0].id, playback.currentTime);
            }
          }
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          const selected = useWorkstationStore.getState().selectedRegionIds;
          selected.forEach(id => useWorkstationStore.getState().removeRegion(id));
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const selected = useWorkstationStore.getState().selectedRegionIds;
            selected.forEach(id => useWorkstationStore.getState().duplicateRegion(id));
          }
          break;
        case 'n':
          e.preventDefault();
          toggleSnap();
          break;
        case 'l':
          e.preventDefault();
          toggleLoop();
          break;
        case 'f':
          e.preventDefault();
          if (selectedRegionIds.length > 0) {
            setShowFXModal(true);
          }
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Select all regions
            // Would need a selectAll action
          } else {
            e.preventDefault();
            // Add automation point at playhead
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegionIds]);
  
  // Handle file drop
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('audio/') || 
      /\.(wav|mp3|ogg|flac|m4a|aac|aiff)$/i.test(f.name)
    );
    
    if (files.length === 0) return;
    
    const { addTrack, tracks } = useWorkstationStore.getState();
    
    // Add files to tracks
    files.forEach((file, index) => {
      let targetTrack = tracks[index];
      
      // Create new track if needed
      if (!targetTrack) {
        addTrack();
        targetTrack = useWorkstationStore.getState().tracks[useWorkstationStore.getState().tracks.length - 1];
      }
      
      // Create region from file
      // In real implementation, would load audio and get duration
      const region = {
        name: file.name.replace(/\.[^.]+$/, ''),
        sourceFile: file.name, // Would be actual path/URL
        startTime: 0,
        duration: 60, // Placeholder - would get from audio analysis
        offset: 0,
        gain: 1,
        fadeIn: { duration: 0, curve: 'linear' as const },
        fadeOut: { duration: 0, curve: 'linear' as const },
      };
      
      useWorkstationStore.getState().addRegion(targetTrack.id, region);
    });
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);
  
  return (
    <div 
      className={`flex flex-col h-full overflow-hidden ${
        isDark ? 'bg-slate-950' : 'bg-slate-100'
      }`}
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
    >
      {/* Toolbar */}
      <Toolbar 
        onOpenFX={() => setShowFXModal(true)}
        onOpenAutomation={() => setShowAutomationEditor(true)}
      />
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track headers (left sidebar) */}
        <div 
          className={`w-48 flex-shrink-0 border-r ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'
          }`}
        >
          {/* Ruler spacer */}
          <div className={`h-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-300'}`} />
          
          {/* Track headers */}
          <div 
            className="overflow-y-auto"
            style={{ height: `calc(100% - 32px)` }}
          >
            {tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
            
            {/* Add track button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => useWorkstationStore.getState().addTrack()}
              className={`w-full p-2 text-sm font-mono flex items-center justify-center gap-2 transition-colors ${
                isDark 
                  ? 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50' 
                  : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">+</span>
              Add Track
            </motion.button>
          </div>
        </div>
        
        {/* Timeline area */}
        <div 
          ref={timelineContainerRef}
          className="flex-1 overflow-auto relative"
        >
          <Timeline containerRef={timelineContainerRef} />
          <TrackList />
        </div>
      </div>
      
      {/* Transport bar */}
      <TransportBar />
      
      {/* FX Modal */}
      <AnimatePresence>
        {showFXModal && (
          <FXApplyModal 
            onClose={() => setShowFXModal(false)}
            selection={selection}
            selectedRegionIds={selectedRegionIds}
          />
        )}
      </AnimatePresence>
      
      {/* Automation Editor Modal */}
      <AnimatePresence>
        {showAutomationEditor && (
          <AutomationEditor 
            onClose={() => setShowAutomationEditor(false)}
            targetLaneId={automationEditTarget}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkstationPanel;
