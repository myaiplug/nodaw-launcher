import React, { useState } from 'react';
import { useThemeStore } from './themeStore';

// Morphing, glowing NoDAW logo (SVG + CSS animation)
const morphStates = [
  // State 1
  'M35,90 Q60,30 85,90 Q70,70 60,90 Q50,70 35,90 Z',
  // State 2
  'M40,85 Q60,35 80,85 Q70,70 60,90 Q50,70 40,85 Z',
  // State 3
  'M38,92 Q60,25 82,92 Q70,70 60,90 Q50,70 38,92 Z',
];

const AnimatedLogo: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const [morphIdx, setMorphIdx] = useState(0);
  const [glow, setGlow] = useState(false);

  // Theme-aware colors
  const primaryColor = isDark ? '#00fff7' : '#0891b2';
  const secondaryColor = isDark ? '#0fffc3' : '#06b6d4';
  const glowOpacity = isDark ? 'cc' : '99';

  // Cycle morph state on click
  const handleClick = () => setMorphIdx((morphIdx + 1) % morphStates.length);
  // Pulse glow on hover
  const handleMouseEnter = () => setGlow(true);
  const handleMouseLeave = () => setGlow(false);

  return (
    <div
      className={`nodaw-animated-logo flex items-center justify-center ${glow ? 'logo-glow' : ''} ${isDark ? 'dark-theme' : 'light-theme'}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="NoDAW animated logo"
      role="img"
      tabIndex={0}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="nodaw-logo-svg"
        aria-labelledby="nodawLogoTitle"
      >
        <title id="nodawLogoTitle">NoDAW Animated Logo</title>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={isDark ? 0.8 : 0.6} />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
          </radialGradient>
          <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={isDark ? 6 : 4} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer Glow */}
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="url(#glow)"
          filter="url(#glowFilter)"
        >
          <animate
            attributeName="r"
            values="48;52;48"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Morphing Core Shape (NoDAW stylized N) */}
        <path
          d={morphStates[morphIdx]}
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="3"
        >
          <animate
            attributeName="d"
            values={morphStates.join(';') + ';' + morphStates[0]}
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <style>{`
        .nodaw-animated-logo.dark-theme {
          filter: drop-shadow(0 0 32px ${primaryColor}${glowOpacity});
          animation: logoPulseDark 2.5s infinite alternate;
        }
        .nodaw-animated-logo.light-theme {
          filter: drop-shadow(0 0 20px ${primaryColor}${glowOpacity});
          animation: logoPulseLight 2.5s infinite alternate;
        }
        .nodaw-animated-logo:focus {
          box-shadow: 0 0 0 3px ${secondaryColor};
        }
        .dark-theme.logo-glow {
          filter: drop-shadow(0 0 64px ${secondaryColor}cc) brightness(1.2);
        }
        .light-theme.logo-glow {
          filter: drop-shadow(0 0 40px ${secondaryColor}99) brightness(1.1);
        }
        @keyframes logoPulseDark {
          0% { filter: drop-shadow(0 0 32px ${primaryColor}cc); }
          100% { filter: drop-shadow(0 0 64px ${secondaryColor}cc); }
        }
        @keyframes logoPulseLight {
          0% { filter: drop-shadow(0 0 16px ${primaryColor}88); }
          100% { filter: drop-shadow(0 0 32px ${secondaryColor}99); }
        }
        .nodaw-logo-svg {
          display: block;
        }
        .nodaw-animated-logo {
          outline: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLogo;
