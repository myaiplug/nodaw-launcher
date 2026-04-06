import React, { forwardRef, useState } from 'react';
import { Feature } from '../../types';

// Individual feature tile, handles locked/unlocked, mini-preview, unlock animation
interface FeatureTileProps {
  feature: Feature;
  unlocked: boolean;
  onUnlock: () => void;
  tabIndex?: number;
  ariaPosinset?: number;
  ariaSetsize?: number;
  ariaLabel?: string;
  role?: string;
}

const FeatureTile = forwardRef<HTMLDivElement, FeatureTileProps>(
  (
    {
      return (
        <div
          ref={ref}
          className={`feature-tile relative rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 focus:outline-none ${
            unlocked
              ? 'bg-gradient-to-br from-green-200 to-green-50 text-green-900' // unlocked visual
              : 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-200 opacity-80 cursor-pointer hover:scale-105 hover:shadow-2xl' // locked visual
          }`}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          role="listitem"
          onClick={!unlocked ? onUnlock : undefined}
          onKeyDown={handleKeyDown}
        >
        onUnlock();
        e.preventDefault();
      }
    };
    return (
      <div
        ref={ref}
        className={`feature-tile relative rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 focus:outline-none ${unlocked
          ? 'bg-gradient-to-br from-green-200 to-green-50 text-green-900' // unlocked visual
          : 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-200 opacity-80 cursor-pointer hover:scale-105 hover:shadow-2xl' // locked visual
          }`}
        tabIndex={tabIndex}
        aria-posinset={ariaPosinset}
        aria-setsize={ariaSetsize}
        aria-label={ariaLabel}
        role={role}
        onClick={!unlocked ? onUnlock : undefined}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{ outline: 'none' }}
      >
        <div className="text-3xl mb-2" aria-hidden="true">
          {feature.icon}
        </div>
        <div className="font-bold text-lg mb-1">{feature.name}</div>
        <div className="text-sm opacity-80 text-center mb-2">{feature.description}</div>
        {!unlocked && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 text-xs font-bold animate-pulse">
            Locked
          </div>
        )}
        {unlocked && (
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
