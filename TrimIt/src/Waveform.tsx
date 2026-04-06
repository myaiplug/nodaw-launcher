import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  samples: number[];
  progress?: number;
  selectionStart?: number;
  selectionEnd?: number;
  height?: number;
  interactive?: boolean;
  isPlaying?: boolean;
  onTogglePlay?: (start?: number, loop?: boolean, end?: number) => void;
  onSelectionChange?: (start: number, end: number) => void;
}

const Waveform: React.FC<WaveformProps> = ({ 
  samples, 
  progress = 0, 
  selectionStart = -1, 
  selectionEnd = -1,
  height = 200,
  interactive = true,
  isPlaying = false,
  onTogglePlay,
  onSelectionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'selection' | null>(null);
  const [dragStart, setDragStart] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize
    const rect = (canvas.parentNode as Element)?.getBoundingClientRect();
    if (rect) {
        canvas.width = rect.width;
        canvas.height = height;
    }

    // Colors (Industrial Theme)
    const WAVE_COLOR = '#06b6d4'; // Cyan
    const BG_COLOR = '#050505';
    const PROGRESS_COLOR = '#ff4444'; // Red Playhead
    const SELECTION_COLOR = 'rgba(6, 182, 212, 0.2)';
    
    // Clear
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Wave
    const barWidth = canvas.width / samples.length;
    const centerY = canvas.height / 2;
    
    ctx.strokeStyle = WAVE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for(let i=0; i<samples.length; i++) {
        const x = i * barWidth;
        const h = samples[i] * (height * 0.8);
        ctx.moveTo(x, centerY - h/2);
        ctx.lineTo(x, centerY + h/2);
    }
    ctx.stroke();

    // Draw Selection
    if (selectionStart !== -1 && selectionEnd !== -1) {
        const x1 = selectionStart * canvas.width;
        const w = (selectionEnd - selectionStart) * canvas.width;
        ctx.fillStyle = SELECTION_COLOR;
        ctx.fillRect(x1, 0, w, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(x1, 0); ctx.lineTo(x1, canvas.height);
        ctx.moveTo(x1+w, 0); ctx.lineTo(x1+w, canvas.height);
        ctx.stroke();
    }

    // Draw Playhead
    if (progress >= 0 && progress <= 1) {
        const px = progress * canvas.width;
        ctx.strokeStyle = PROGRESS_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();
    }

  }, [samples, progress, selectionStart, selectionEnd, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      setDragStart(x);
      setIsDragging('selection');
      onSelectionChange?.(x, x);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      
      onSelectionChange?.(Math.min(dragStart, x), Math.max(dragStart, x));
  };

  const handleMouseUp = () => {
      setIsDragging(null);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full relative cursor-crosshair group waveform-container waveform-height-${height}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
       <canvas ref={canvasRef} className="w-full h-full block rounded-lg" />
    </div>
  );
};

export default Waveform;
