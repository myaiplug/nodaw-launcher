import React, { forwardRef, useState } from 'react';

interface FeatureTileProps {
  locked: boolean;
  name: string;
  onUnlock?: () => void;
  tabIndex?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  'aria-label'?: string;
  role?: string;
}

const FeatureTile = forwardRef<HTMLDivElement, FeatureTileProps>(
  (
    {
      locked,
      name,
      onUnlock,
      tabIndex,
      'aria-posinset': ariaPosinset,
      'aria-setsize': ariaSetsize,
      'aria-label': ariaLabel,
      role = 'listitem'
    },
    ref
  ) => {
    const [hover, setHover] = useState(false);
    const [pressed, setPressed] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && locked && onUnlock) {
        onUnlock();
        e.preventDefault();
      }
    };

    return (
      <div
        ref={ref}
        className={`feature-tile relative rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 focus:outline-none ${
          locked
            ? 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-200 opacity-80 cursor-pointer hover:scale-105 hover:shadow-2xl'
            : 'bg-gradient-to-br from-green-200 to-green-50 text-green-900'
        }`}
        tabIndex={tabIndex}
        aria-posinset={ariaPosinset}
        aria-setsize={ariaSetsize}
        aria-label={ariaLabel}
        role={role}
        onClick={locked ? onUnlock : undefined}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{ outline: 'none' }}
      >
        <div className="font-bold text-lg mb-1">{name}</div>
        {locked && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 text-xs font-bold animate-pulse">
            Locked
          </div>
        )}
        {!locked && (
          <div className="absolute top-2 right-2 bg-green-400 text-green-900 rounded-full px-2 py-1 text-xs font-bold animate-bounce">
            Unlocked
          </div>
        )}
        <style>{`
          .feature-tile:focus {
            box-shadow: 0 0 0 3px #00fff7, 0 4px 24px #0fffc366;
            z-index: 2;
          }
        `}</style>
      </div>
    );
  }
);

export default FeatureTile;
