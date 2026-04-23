/**
 * AudioRegion.tsx
 * Draggable audio region with waveform display
 */

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useThemeStore } from '../launcher/themeStore';
import { useWorkstationStore, AudioRegion as AudioRegionType } from './workstationStore';

interface AudioRegionProps {
  region: AudioRegionType;
  trackId: string;
  trackMuted: boolean;
}

export const AudioRegion: React.FC<AudioRegionProps> = ({ region, trackId, trackMuted }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const { 
    view, 
    selectedRegionIds, 
    selectRegion, 
    moveRegion,
    resizeRegion,
    view: { pixelsPerSecond, zoom, snapEnabled, snapValue }
  } = useWorkstationStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStartTime, setDragStartTime] = useState(0);
  
  const isSelected = selectedRegionIds.includes(region.id);
  
  // Calculate pixel dimensions
  const left = region.startTime * pixelsPerSecond * zoom;
  const width = region.duration * pixelsPerSecond * zoom;
  
  // Generate placeholder waveform peaks (in real app, would come from audio analysis)
  const waveformPeaks = useMemo(() => {
    const numPeaks = Math.ceil(width / 2);
    const peaks: number[] = [];
    
    // Generate pseudo-random waveform based on region name hash
    let hash = 0;
    for (let i = 0; i < region.name.length; i++) {
      hash = ((hash << 5) - hash) + region.name.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let i = 0; i < numPeaks; i++) {
      const seed = Math.sin(hash * i * 0.01) * 10000;
      const value = Math.abs(Math.sin(seed) * Math.sin(i * 0.05) * Math.cos(i * 0.02));
      peaks.push(value * 0.8 + 0.1);
    }
    
    return peaks;
  }, [region.name, width]);
  
  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = width;
    const canvasHeight = 64;
    
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Waveform color based on selection and mute state
    let color: string;
    if (trackMuted || region.gain === 0) {
      color = isDark ? '#64748b' : '#94a3b8';
    } else if (isSelected) {
      color = isDark ? '#22d3ee' : '#0891b2';
    } else {
      color = isDark ? '#06b6d4' : '#0891b2';
    }
    
    // Draw waveform
    const centerY = canvasHeight / 2;
    const maxAmplitude = canvasHeight * 0.4;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Top half
    ctx.moveTo(0, centerY);
    for (let i = 0; i < waveformPeaks.length; i++) {
      const x = i * 2;
      const y = centerY - waveformPeaks[i] * maxAmplitude * region.gain;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvasWidth, centerY);
    
    // Bottom half (mirror)
    for (let i = waveformPeaks.length - 1; i >= 0; i--) {
      const x = i * 2;
      const y = centerY + waveformPeaks[i] * maxAmplitude * region.gain;
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.globalAlpha = 0.7;
    ctx.fill();
    
    // Draw center line
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();
    
    // Draw fade in/out gradients
    if (region.fadeIn.duration > 0) {
      const fadeWidth = region.fadeIn.duration * pixelsPerSecond * zoom;
      const gradient = ctx.createLinearGradient(0, 0, fadeWidth, 0);
      gradient.addColorStop(0, isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)');
      gradient.addColorStop(1, 'transparent');
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, fadeWidth, canvasHeight);
    }
    
    if (region.fadeOut.duration > 0) {
      const fadeWidth = region.fadeOut.duration * pixelsPerSecond * zoom;
      const gradient = ctx.createLinearGradient(canvasWidth - fadeWidth, 0, canvasWidth, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.fillRect(canvasWidth - fadeWidth, 0, fadeWidth, canvasHeight);
    }
    
  }, [width, waveformPeaks, isSelected, trackMuted, region.gain, region.fadeIn, region.fadeOut, isDark, pixelsPerSecond, zoom]);
  
  // Handle click to select
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectRegion(region.id, e.ctrlKey || e.metaKey || e.shiftKey);
  }, [region.id, selectRegion]);
  
  // Handle drag
  const handleDragStart = useCallback(() => {
    setDragStartTime(region.startTime);
    if (!isSelected) {
      selectRegion(region.id, false);
    }
  }, [region.startTime, region.id, isSelected, selectRegion]);
  
  const handleDrag = useCallback((e: MouseEvent, info: PanInfo) => {
    const deltaTime = info.offset.x / (pixelsPerSecond * zoom);
    let newTime = dragStartTime + deltaTime;
    
    // Snap if enabled
    if (snapEnabled) {
      newTime = Math.round(newTime / snapValue) * snapValue;
    }
    
    moveRegion(region.id, trackId, Math.max(0, newTime));
  }, [dragStartTime, pixelsPerSecond, zoom, snapEnabled, snapValue, region.id, trackId, moveRegion]);
  
  // Handle resize
  const handleResizeStart = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(side);
  }, []);
  
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.parentElement?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const time = x / (pixelsPerSecond * zoom);
      
      if (isResizing === 'left') {
        const newStart = Math.max(0, snapEnabled ? Math.round(time / snapValue) * snapValue : time);
        const newDuration = region.startTime + region.duration - newStart;
        if (newDuration > 0.1) {
          resizeRegion(region.id, newStart, newDuration);
        }
      } else {
        const newEnd = snapEnabled ? Math.round(time / snapValue) * snapValue : time;
        const newDuration = newEnd - region.startTime;
        if (newDuration > 0.1) {
          resizeRegion(region.id, region.startTime, newDuration);
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, region, pixelsPerSecond, zoom, snapEnabled, snapValue, resizeRegion]);
  
  return (
    <motion.div
      ref={containerRef}
      className={`absolute top-1 h-[calc(100%-8px)] rounded-md overflow-hidden cursor-move
        ${isSelected 
          ? isDark 
            ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900'
            : 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-white' 
          : ''
        }
        ${isDark ? 'bg-slate-800/90' : 'bg-white/90'}
        ${trackMuted ? 'opacity-50' : ''}
      `}
      style={{ left, width }}
      drag="x"
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onClick={handleClick}
      whileHover={{ filter: 'brightness(1.05)' }}
    >
      {/* Region header */}
      <div className={`absolute top-0 left-0 right-0 h-4 px-1 flex items-center justify-between z-10
        ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}
      `}>
        <span className={`text-[10px] font-mono truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {region.name}
        </span>
        {region.gain !== 1 && (
          <span className={`text-[8px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {(region.gain * 100).toFixed(0)}%
          </span>
        )}
      </div>
      
      {/* Waveform */}
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 left-0"
        style={{ width, height: 64 }}
      />
      
      {/* Resize handles */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize
          ${isResizing === 'left' ? (isDark ? 'bg-cyan-400/50' : 'bg-cyan-500/50') : 'hover:bg-cyan-400/30'}
        `}
        onMouseDown={(e) => handleResizeStart('left', e)}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize
          ${isResizing === 'right' ? (isDark ? 'bg-cyan-400/50' : 'bg-cyan-500/50') : 'hover:bg-cyan-400/30'}
        `}
        onMouseDown={(e) => handleResizeStart('right', e)}
      />
      
      {/* Selection highlight */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none bg-cyan-400/5" />
      )}
    </motion.div>
  );
};

export default AudioRegion;
