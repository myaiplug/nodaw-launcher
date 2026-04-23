/**
 * Timeline.tsx
 * Ruler with time/beat markers and playhead
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../launcher/themeStore';
import { useWorkstationStore } from './workstationStore';

interface TimelineProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const Timeline: React.FC<TimelineProps> = ({ containerRef }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const { playback, view, project, seek, setSelection } = useWorkstationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  
  // Calculate timeline width based on project duration and zoom
  const timelineWidth = Math.max(
    project.duration * view.pixelsPerSecond * view.zoom,
    containerRef.current?.clientWidth || 1000
  );
  
  // Draw timeline ruler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = timelineWidth * dpr;
    canvas.height = 32 * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, timelineWidth, 32);
    
    // Draw based on zoom level
    const pixelsPerSecond = view.pixelsPerSecond * view.zoom;
    
    // Determine interval based on zoom
    let majorInterval: number;
    let minorDivisions: number;
    
    if (pixelsPerSecond < 10) {
      majorInterval = 60; // 1 minute
      minorDivisions = 6;
    } else if (pixelsPerSecond < 30) {
      majorInterval = 30; // 30 seconds
      minorDivisions = 6;
    } else if (pixelsPerSecond < 80) {
      majorInterval = 10; // 10 seconds
      minorDivisions = 10;
    } else if (pixelsPerSecond < 200) {
      majorInterval = 5; // 5 seconds
      minorDivisions = 5;
    } else {
      majorInterval = 1; // 1 second
      minorDivisions = 4;
    }
    
    const minorInterval = majorInterval / minorDivisions;
    
    // Colors
    const majorColor = isDark ? '#94a3b8' : '#475569';
    const minorColor = isDark ? '#475569' : '#94a3b8';
    const textColor = isDark ? '#94a3b8' : '#334155';
    
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    // Draw markers
    for (let time = 0; time <= project.duration; time += minorInterval) {
      const x = time * pixelsPerSecond;
      const isMajor = Math.abs(time % majorInterval) < 0.001;
      
      ctx.beginPath();
      ctx.strokeStyle = isMajor ? majorColor : minorColor;
      ctx.lineWidth = isMajor ? 1 : 0.5;
      ctx.moveTo(x, isMajor ? 8 : 16);
      ctx.lineTo(x, 32);
      ctx.stroke();
      
      // Draw time label on major ticks
      if (isMajor && x > 10) {
        ctx.fillStyle = textColor;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const label = minutes > 0 
          ? `${minutes}:${seconds.toString().padStart(2, '0')}`
          : `${seconds}s`;
        ctx.fillText(label, x, 8);
      }
    }
    
    // Draw bottom border
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.moveTo(0, 31);
    ctx.lineTo(timelineWidth, 31);
    ctx.stroke();
    
  }, [timelineWidth, view.zoom, view.pixelsPerSecond, project.duration, isDark]);
  
  // Handle click/drag on timeline
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0);
    const time = x / (view.pixelsPerSecond * view.zoom);
    
    // If shift held, start selection
    if (e.shiftKey) {
      setSelection({ start: time, end: time });
    } else {
      seek(Math.max(0, Math.min(time, project.duration)));
    }
  }, [view.pixelsPerSecond, view.zoom, project.duration, seek, setSelection, containerRef]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0);
    const time = x / (view.pixelsPerSecond * view.zoom);
    
    if (e.shiftKey) {
      const { selection } = useWorkstationStore.getState();
      if (selection) {
        setSelection({ ...selection, end: Math.max(0, Math.min(time, project.duration)) });
      }
    } else {
      seek(Math.max(0, Math.min(time, project.duration)));
    }
  }, [view.pixelsPerSecond, view.zoom, project.duration, seek, setSelection, containerRef]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  // Playhead position
  const playheadX = playback.currentTime * view.pixelsPerSecond * view.zoom;
  
  return (
    <div 
      className="sticky top-0 z-20"
      style={{ width: timelineWidth }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: timelineWidth, height: 32 }}
        className="cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Playhead */}
      <motion.div
        className="absolute top-0 bottom-0 w-px pointer-events-none z-30"
        style={{ 
          left: playheadX,
          background: 'linear-gradient(to bottom, #ef4444 0%, #ef4444 28px, rgba(239,68,68,0.5) 28px, rgba(239,68,68,0.3) 100%)',
        }}
        animate={{ left: playheadX }}
        transition={{ type: 'tween', duration: playback.isPlaying ? 0.05 : 0 }}
      >
        {/* Playhead head */}
        <div 
          className="absolute top-6 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #ef4444',
          }}
        />
      </motion.div>
    </div>
  );
};

export default Timeline;
