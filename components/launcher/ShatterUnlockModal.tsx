/**
 * ShatterUnlockModal.tsx
 * Unlock modal with animated lock shatter effect, confetti, and license input
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TierType } from './FeatureTile3D';

interface UnlockModalProps {
  open: boolean;
  featureName: string;
  featureId: string;
  featureTier: Exclude<TierType, 'free'>;
  onClose: () => void;
  onUnlock: (key: string) => Promise<boolean>;
  onPurchase?: () => void;
}

// Confetti particle component
const ConfettiParticle: React.FC<{ index: number }> = ({ index }) => {
  const colors = ['bg-cyan-400', 'bg-purple-400', 'bg-emerald-400', 'bg-orange-400', 'bg-pink-400'];
  const color = colors[index % colors.length];
  
  const randomX = (Math.random() - 0.5) * 350;
  const randomY = (Math.random() - 0.5) * 350;
  const randomRotate = Math.random() * 720 - 360;
  const delay = 0.1 + Math.random() * 0.4;
  
  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-sm ${color}`}
      initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
      animate={{
        x: randomX,
        y: randomY,
        scale: [0, 1.2, 0.8],
        rotate: randomRotate,
        opacity: [1, 1, 0]
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    />
  );
};

// Lock shatter pieces
const ShatterPiece: React.FC<{ index: number }> = ({ index }) => {
  const angle = (index / 8) * Math.PI * 2;
  const distance = 60 + Math.random() * 40;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const rotate = Math.random() * 360;
  
  return (
    <motion.div
      className="absolute w-3 h-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-sm"
      initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
      animate={{
        x,
        y,
        scale: 0,
        rotate,
        opacity: 0
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
};

export const ShatterUnlockModal: React.FC<UnlockModalProps> = ({
  open,
  featureName,
  featureId,
  featureTier,
  onClose,
  onUnlock,
  onPurchase
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showShatter, setShowShatter] = useState(false);
  
  const tierColors = {
    pro: {
      bg: 'bg-purple-900',
      border: 'border-purple-500',
      text: 'text-purple-50',
      hover: 'hover:bg-purple-800',
      glow: 'shadow-purple-500/20',
      modalBorder: 'border-purple-500/30'
    },
    pro_plus: {
      bg: 'bg-orange-900',
      border: 'border-orange-500',
      text: 'text-orange-50',
      hover: 'hover:bg-orange-800',
      glow: 'shadow-orange-500/20',
      modalBorder: 'border-orange-500/30'
    }
  };
  
  const colors = tierColors[featureTier];
  
  const handleUnlock = useCallback(async () => {
    const trimmedKey = licenseKey.trim();
    if (!trimmedKey) {
      setError('Please enter a license key');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await onUnlock(trimmedKey);
      if (success) {
        setShowShatter(true);
        setTimeout(() => {
          setIsSuccess(true);
        }, 400);
        setTimeout(() => {
          onClose();
          // Reset state after close
          setTimeout(() => {
            setIsSuccess(false);
            setShowShatter(false);
            setLicenseKey('');
          }, 300);
        }, 2000);
      } else {
        setError('Invalid license key');
      }
    } catch (e) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [licenseKey, onUnlock, onClose]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUnlock();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleUnlock, isLoading, onClose]);
  
  const handleClose = useCallback(() => {
    if (!isLoading && !isSuccess) {
      onClose();
      setTimeout(() => {
        setLicenseKey('');
        setError(null);
      }, 200);
    }
  }, [isLoading, isSuccess, onClose]);
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={`
              relative w-full max-w-md mx-4 p-8 rounded-2xl
              bg-slate-900/95 backdrop-blur-xl
              border ${colors.modalBorder}
              shadow-2xl ${colors.glow}
            `}
          >
            {/* Success overlay with shatter + confetti */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 rounded-2xl overflow-hidden"
                >
                  {/* Confetti burst */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                      <ConfettiParticle key={i} index={i} />
                    ))}
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                    className="text-6xl mb-4 relative z-10"
                  >
                    🔓
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-emerald-400 font-bold text-xl tracking-wider relative z-10"
                  >
                    UNLOCKED!
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-500 text-sm mt-2 relative z-10"
                  >
                    {featureName} is now available
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Lock icon with shatter effect */}
            <div className="flex justify-center mb-6 relative">
              <motion.div
                animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center
                  ${featureTier === 'pro' 
                    ? 'bg-purple-950/50 border border-purple-500/30' 
                    : 'bg-orange-950/50 border border-orange-500/30'
                  }
                  relative overflow-visible
                `}
              >
                {/* Shatter pieces */}
                {showShatter && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(12)].map((_, i) => (
                      <ShatterPiece key={i} index={i} />
                    ))}
                  </div>
                )}
                
                {/* Lock icon */}
                <motion.span 
                  className="text-4xl"
                  animate={showShatter ? { scale: 0, opacity: 0 } : {}}
                  transition={{ duration: 0.3 }}
                >
                  🔐
                </motion.span>
              </motion.div>
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-bold text-center text-slate-200 mb-2">
              Unlock {featureName}
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Enter your {featureTier === 'pro' ? 'Pro' : 'Pro+'} license key to unlock this feature.
            </p>
            
            {/* License input */}
            <div className="mb-5">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value.toUpperCase());
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                autoFocus
                className={`
                  w-full px-4 py-3.5 rounded-lg
                  bg-slate-950 border-2
                  ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-cyan-500'}
                  text-slate-200 font-mono text-center tracking-widest text-sm
                  focus:outline-none
                  transition-colors duration-200
                  placeholder:text-slate-600
                `}
                disabled={isLoading || isSuccess}
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs text-center mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading || isSuccess}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={isLoading || isSuccess}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-bold
                  ${colors.bg} border ${colors.border} ${colors.text} ${colors.hover}
                  transition-colors disabled:opacity-50
                  flex items-center justify-center gap-2
                `}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Verifying...
                  </>
                ) : (
                  'Unlock'
                )}
              </button>
            </div>
            
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-slate-600 text-xs">or</span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>
            
            {/* Purchase CTA */}
            <button
              onClick={onPurchase}
              className={`
                w-full px-4 py-3 rounded-lg
                bg-gradient-to-r ${featureTier === 'pro' ? 'from-purple-600 to-cyan-600' : 'from-orange-600 to-pink-600'}
                text-white font-bold
                hover:opacity-90 transition-opacity
                flex items-center justify-center gap-2
              `}
            >
              <span>Get {featureTier === 'pro' ? 'Pro' : 'Pro+'} — ${featureTier === 'pro' ? '49' : '99'}</span>
              <span className="text-sm opacity-75">one-time</span>
            </button>
            
            <p className="text-center text-slate-600 text-xs mt-3">
              Lifetime license. No subscription.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShatterUnlockModal;
