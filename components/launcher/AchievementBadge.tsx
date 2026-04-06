import React, { useEffect, useRef } from 'react';

interface AchievementBadgeProps {
  open: boolean;
  onClose: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ open, onClose }) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  // Keyboard close (Escape)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={badgeRef}
      className="fixed inset-0 flex items-center justify-center z-50 focus:outline-none"
      role="alertdialog"
      aria-modal="true"
      aria-label="Feature unlocked badge"
      tabIndex={0}
      onClick={onClose}
    >
      <div className="bg-gradient-to-br from-yellow-200 to-yellow-50 rounded-full shadow-2xl p-8 flex flex-col items-center animate-bounce-in">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#ffe066" stroke="#ffd700" strokeWidth="4" />
          <path d="M25 45 L38 58 L58 32" stroke="#2ecc40" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
        <div className="font-bold text-xl text-yellow-900 mt-3 mb-1">Feature Unlocked!</div>
        <div className="text-yellow-800 text-sm mb-2">Enjoy your new power-up.</div>
        <button
          className="mt-2 px-5 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-bold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          onClick={onClose}
          aria-label="Close badge"
        >
          Close
        </button>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.7) translateY(80px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-10px); opacity: 1; }
          80% { transform: scale(0.95) translateY(0); }
          100% { transform: scale(1) translateY(0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
      `}</style>
    </div>
  );
};

export default AchievementBadge;
