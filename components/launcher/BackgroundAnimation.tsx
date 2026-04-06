import React, { useEffect, useRef } from 'react';

const BackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let running = true;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx?.scale(dpr, dpr);
    function draw() {
      if (!ctx || !running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 0; i < 32; i++) {
        const t = frame / 60 + i * 0.2;
        const x = window.innerWidth / 2 + Math.sin(t) * (120 + i * 8);
        const y = window.innerHeight / 2 + Math.cos(t * 1.2) * (80 + i * 4);
        ctx.beginPath();
        ctx.arc(x, y, 32 - i, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(0,255,247,${0.08 + 0.02 * Math.sin(t)})`;
        ctx.lineWidth = 2 + Math.sin(t) * 1.5;
        ctx.shadowColor = '#00fff7';
        ctx.shadowBlur = 16;
        ctx.stroke();
      }
      frame++;
      requestAnimationFrame(draw);
    }
    draw();
    return () => {
      running = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-gradient-to-br from-[#0f2027] to-[#2c5364]"
      aria-hidden="true"
      tabIndex={-1}
      role="presentation"
    />
  );
};

export default BackgroundAnimation;
