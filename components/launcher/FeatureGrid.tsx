import React, { useEffect, useState, useRef } from 'react';
import FeatureTile from './FeatureTile';
  return (
    <div
      id="feature-grid"
      className="feature-grid grid grid-cols-2 gap-6 p-4 focus:outline-none"
      role="list"
      aria-label="Feature list"
      tabIndex={0}
    >
      {features.map((feature, idx) => (
        <FeatureTile
          key={feature.id}
          feature={feature}
          unlocked={unlockedFeatures.includes(feature.id)}
          onUnlock={() => onUnlock(feature)}
          ref={el => (tileRefs.current[idx] = el)}
          tabIndex={0}
          ariaLabel={feature.name + (unlockedFeatures.includes(feature.id) ? ' unlocked' : ' locked')}
        />
      ))}
    </div>

  // Parallax effect
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Keyboard navigation: arrow keys to move focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const focusIdx = tileRefs.current.findIndex(ref => ref === document.activeElement);
      if (focusIdx === -1) return;
      let nextIdx = focusIdx;
      if (e.key === 'ArrowRight') nextIdx = (focusIdx + 1) % features.length;
      if (e.key === 'ArrowLeft') nextIdx = (focusIdx - 1 + features.length) % features.length;
      if (e.key === 'ArrowDown') nextIdx = (focusIdx + 2) % features.length;
      if (e.key === 'ArrowUp') nextIdx = (focusIdx - 2 + features.length) % features.length;
      if (nextIdx !== focusIdx) {
        tileRefs.current[nextIdx]?.focus();
        e.preventDefault();
      }
    };
    const grid = document.getElementById('feature-grid');
    grid?.addEventListener('keydown', handleKeyDown);
    return () => grid?.removeEventListener('keydown', handleKeyDown);
  }, [features.length]);

  return (
    <div
      id="feature-grid"
      className="nodaw-feature-grid grid grid-cols-2 sm:grid-cols-4 gap-8 py-8"
      role="list"
      aria-label="Feature list"
      tabIndex={0}
      style={{
        outline: 'none',
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${parallax.x * 8}deg) rotateX(${-parallax.y * 8}deg)`
      }}
    >
      {features.map((f, i) => (
        <div
          key={f.name}
          style={{
            opacity: reveal ? (i < revealed ? 1 : 0) : 1,
            transform: reveal
              ? `translateY(${i < revealed ? 0 : 32}px) scale(${i < revealed ? 1 : 0.95})`
              : undefined,
            transition: 'all 0.7s cubic-bezier(.4,0,.2,1)',
            transitionDelay: reveal ? `${i * 0.08}s` : '0s',
          }}
        >
          <FeatureTile
            locked={f.locked}
            name={f.name}
            onUnlock={f.locked ? () => onRequestUnlock(f.name) : undefined}
            ref={el => (tileRefs.current[i] = el)}
            tabIndex={0}
            aria-posinset={i + 1}
            aria-setsize={features.length}
            aria-label={f.name + (unlockedFeatures.includes(f.name) ? ' unlocked' : ' locked')}
            role="listitem"
          />
        </div>
      ))}
      <style>{`
        .nodaw-feature-grid {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default FeatureGrid;
