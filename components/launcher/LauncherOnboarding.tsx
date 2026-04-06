import React, { useEffect, useRef, useState } from 'react';
import BackgroundAnimation from './BackgroundAnimation';
import AnimatedLogo from './AnimatedLogo';
import FeatureGrid from './FeatureGrid';

interface LauncherOnboardingProps {
  onFinish: () => void;
}

const LauncherOnboarding: React.FC<LauncherOnboardingProps> = ({ onFinish }) => {
    // Fallback: auto-finish onboarding after 5 seconds
    useEffect(() => {
      const timeout = setTimeout(() => {
        console.log('[LauncherOnboarding] Auto-finish triggered');
        onFinish();
      }, 5000);
      return () => clearTimeout(timeout);
    }, [onFinish]);
  const [stage, setStage] = useState<'bg' | 'logo' | 'grid' | 'welcome'>('bg');
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Animate through onboarding stages
    if (stage === 'bg') {
      setTimeout(() => setStage('logo'), 1200);
    } else if (stage === 'logo') {
      setTimeout(() => setStage('grid'), 1800);
    } else if (stage === 'grid') {
      setTimeout(() => setStage('welcome'), 1200);
    }
  }, [stage]);

  // Keyboard: skip with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFinish]);

  useEffect(() => {
    skipRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <BackgroundAnimation />
      <div className="z-10 flex flex-col items-center justify-center w-full h-full">
        {(stage === 'logo' || stage === 'grid' || stage === 'welcome') && (
          <div className="mb-12 animate-fadeIn">
            <AnimatedLogo />
          </div>
        )}
        {(stage === 'grid' || stage === 'welcome') && (
          <div className="w-full max-w-3xl animate-fadeIn">
            <FeatureGrid reveal={stage === 'grid' || stage === 'welcome'} />
          </div>
        )}
        {stage === 'welcome' && (
          <div className="mt-12 animate-fadeIn text-center">
            <h1 className="text-3xl font-extrabold text-cyan-200 mb-2 tracking-wide drop-shadow-lg">
              Welcome to NoDAW Studio Suite
            </h1>
            <p className="text-cyan-100 text-lg font-mono opacity-80">
              Your creative playground is ready.
            </p>
          </div>
        )}
        {/* Only show onboarding modal if not auto-finished */}
        {stage !== 'welcome' && (
          <div
            className="onboarding-modal flex flex-col items-center justify-center p-8 bg-white bg-opacity-95 rounded-2xl shadow-2xl max-w-lg mx-auto mt-16 focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Launcher onboarding"
            tabIndex={0}
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
              Welcome to NoDAW Launcher
            </h2>
            <p className="text-gray-700 text-center mb-6">
              Discover, unlock, and launch powerful features. <br />
              <span className="font-semibold">Tip:</span> Use keyboard or mouse to explore. <br />
              Press <span className="font-mono">Escape</span> to skip onboarding at any time.
            </p>
            <button
              ref={skipRef}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => {
                console.log('[LauncherOnboarding] Manual finish triggered');
                onFinish();
              }}
              aria-label="Skip onboarding"
            >
              Skip
            </button>
          </div>
        )}
      </div>
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default LauncherOnboarding;
