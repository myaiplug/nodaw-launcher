/**
 * Production upgrade modal for the live NoDAW Launcher route.
 * Checkout is the normal path. Email + license key is recovery only.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TierType } from './FeatureTile3D';
import { LicenseTier, useLicenseStore } from './licenseStore';

interface UnlockModalProps {
  open: boolean;
  featureName: string;
  featureTier: Exclude<TierType, 'free'>;
  onClose: () => void;
  featureId?: string;
  onUnlock?: (key: string) => Promise<boolean>;
  onPurchase?: () => void;
}

export const ShatterUnlockModal: React.FC<UnlockModalProps> = ({
  open,
  featureName,
  featureTier,
  onClose,
}) => {
  const {
    beginUpgrade,
    waitForPendingUpgrade,
    activateLicense,
    upgradeStatus,
    upgradeError,
  } = useLicenseStore();

  const [showRecovery, setShowRecovery] = useState(false);
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const isProPlus = featureTier === 'pro_plus';
  const busy = upgradeStatus === 'creating' || upgradeStatus === 'awaiting_payment' || upgradeStatus === 'activating';

  useEffect(() => {
    if (!open) {
      setShowRecovery(false);
      setPurchaseEmail('');
      setLicenseKey('');
      setLocalError(null);
      setRestoring(false);
    }
  }, [open]);

  const startUpgrade = useCallback(async () => {
    if (isProPlus) {
      setLocalError('PRO+ checkout is not enabled until the Workstation tier is production-ready.');
      return;
    }

    setLocalError(null);
    const popup = window.open('about:blank', '_blank');
    if (popup) {
      try { popup.opener = null; } catch { /* browser controlled */ }
      popup.document.title = 'Opening secure checkout…';
    }

    const result = await beginUpgrade(LicenseTier.PRO);
    if (!result.success || !result.checkoutUrl) {
      popup?.close();
      setLocalError(result.error || 'Unable to start checkout.');
      return;
    }

    if (popup) popup.location.href = result.checkoutUrl;
    else window.location.assign(result.checkoutUrl);

    const unlocked = await waitForPendingUpgrade();
    if (unlocked) onClose();
  }, [beginUpgrade, isProPlus, onClose, waitForPendingUpgrade]);

  const restorePurchase = useCallback(async () => {
    const email = purchaseEmail.trim().toLowerCase();
    const key = licenseKey.trim();
    if (!email || !key) {
      setLocalError('Purchase email and license key are both required to restore a purchase.');
      return;
    }

    setRestoring(true);
    setLocalError(null);
    const result = await activateLicense(key, email);
    setRestoring(false);

    if (result.success) {
      onClose();
      return;
    }
    setLocalError(result.error || 'Purchase could not be restored.');
  }, [activateLicense, licenseKey, onClose, purchaseEmail]);

  const statusText = upgradeStatus === 'creating'
    ? 'Creating secure checkout…'
    : upgradeStatus === 'awaiting_payment'
      ? 'Checkout opened. Complete payment to activate PRO automatically.'
      : upgradeStatus === 'activating'
        ? 'Payment received. Activating PRO…'
        : null;

  const error = localError || upgradeError;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => !busy && onClose()}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md mx-4 p-8 rounded-2xl bg-slate-900/95 border border-purple-500/30 shadow-2xl"
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-950/50 border border-purple-500/30 text-3xl">
                🔐
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-slate-100 mb-2">
              Unlock {featureName}
            </h2>
            <p className="text-sm text-slate-400 text-center mb-6">
              Free stays free forever. PRO unlocks the advanced tools and automation with a one-time purchase.
            </p>

            {!showRecovery ? (
              <>
                <button
                  onClick={startUpgrade}
                  disabled={busy || isProPlus}
                  className="w-full px-4 py-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {isProPlus ? 'PRO+ COMING AFTER WORKSTATION QA' : busy ? 'ACTIVATING…' : 'UNLOCK PRO · ONE-TIME PURCHASE'}
                </button>

                {statusText && (
                  <p className="text-center text-cyan-300 text-xs mt-3">{statusText}</p>
                )}

                <p className="text-center text-slate-500 text-xs mt-3">
                  Secure checkout. The app unlocks automatically after verified payment.
                </p>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-slate-700/60" />
                  <span className="text-slate-600 text-xs">already purchased?</span>
                  <div className="flex-1 h-px bg-slate-700/60" />
                </div>

                <button
                  onClick={() => { setShowRecovery(true); setLocalError(null); }}
                  disabled={busy}
                  className="w-full px-4 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Restore Purchase
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center mb-4">
                  Recovery only. Use the email used at checkout and the recovery license issued with your purchase.
                </p>
                <input
                  type="email"
                  value={purchaseEmail}
                  onChange={(event) => setPurchaseEmail(event.target.value)}
                  placeholder="Purchase email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(event) => setLicenseKey(event.target.value)}
                  placeholder="Recovery license key"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={restorePurchase}
                  disabled={restoring}
                  className="w-full px-4 py-3 rounded-lg bg-cyan-700 text-white font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  {restoring ? 'VERIFYING…' : 'RESTORE PURCHASE'}
                </button>
                <button
                  onClick={() => { setShowRecovery(false); setLocalError(null); }}
                  disabled={restoring}
                  className="w-full px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Back to upgrade
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={onClose}
              disabled={busy}
              aria-label="Close upgrade window"
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 disabled:opacity-40"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShatterUnlockModal;
