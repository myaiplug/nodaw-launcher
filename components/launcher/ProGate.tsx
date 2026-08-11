import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from './themeStore';
import { LicenseTier, useLicenseStore } from './licenseStore';

interface ProGateProps {
  toolId: string;
  requiredTier?: LicenseTier;
  children: React.ReactNode;
  mode?: 'overlay' | 'block' | 'badge';
  message?: string;
  showUsage?: boolean;
  onUpgradeClick?: () => void;
}

interface UsageBadgeProps {
  toolId: string;
  size?: 'sm' | 'md' | 'lg';
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
  requiredTier: LicenseTier;
}

const TIER_CONFIG = {
  [LicenseTier.FREE]: {
    label: 'FREE',
    text: 'text-slate-100',
    gradient: 'from-slate-600 to-slate-700',
  },
  [LicenseTier.PRO]: {
    label: 'PRO',
    text: 'text-cyan-100',
    gradient: 'from-cyan-500 to-blue-600',
  },
  [LicenseTier.PRO_PLUS]: {
    label: 'PRO+',
    text: 'text-amber-100',
    gradient: 'from-amber-400 to-orange-500',
  },
};

function tierAllows(current: LicenseTier, required: LicenseTier) {
  if (current === LicenseTier.PRO_PLUS) return true;
  if (current === LicenseTier.PRO) return required !== LicenseTier.PRO_PLUS;
  return required === LicenseTier.FREE;
}

export const UsageBadge: React.FC<UsageBadgeProps> = ({ size = 'md' }) => {
  const tier = useLicenseStore(state => state.getCurrentTier());
  if (tier !== LicenseTier.FREE) return null;
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-1',
    lg: 'text-xs px-3 py-1.5',
  };
  return (
    <span className={`inline-flex rounded-full font-mono border border-slate-600 text-slate-400 ${sizeClasses[size]}`}>
      FREE FOREVER
    </span>
  );
};

export const TierBadge: React.FC<{ tier: LicenseTier; size?: 'sm' | 'md' | 'lg' }> = ({ tier, size = 'md' }) => {
  const config = TIER_CONFIG[tier];
  const sizeClasses = {
    sm: 'text-[8px] px-1.5 py-0.5',
    md: 'text-[9px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  };
  return (
    <span className={`inline-flex items-center font-bold tracking-wider rounded ${sizeClasses[size]} bg-gradient-to-r ${config.gradient} ${config.text} shadow-sm`}>
      {config.label}
    </span>
  );
};

export const RestrictionList: React.FC<{ toolId: string }> = () => {
  const theme = useThemeStore(state => state.theme);
  const tier = useLicenseStore(state => state.getCurrentTier());
  if (tier !== LicenseTier.FREE) return null;
  return (
    <div className={`mt-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Free forever</div>
      <div className="text-xs text-slate-500">Use the included capabilities without daily counters. PRO unlocks expanded tools and automation.</div>
    </div>
  );
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, requiredTier }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  const beginUpgrade = useLicenseStore(state => state.beginUpgrade);
  const waitForPendingUpgrade = useLicenseStore(state => state.waitForPendingUpgrade);
  const upgradeStatus = useLicenseStore(state => state.upgradeStatus);
  const upgradeError = useLicenseStore(state => state.upgradeError);
  const [localError, setLocalError] = useState<string | null>(null);

  const tierConfig = TIER_CONFIG[requiredTier];
  const isBusy = upgradeStatus === 'creating' || upgradeStatus === 'awaiting_payment' || upgradeStatus === 'activating';

  const handleUpgrade = async () => {
    setLocalError(null);
    const checkoutWindow = window.open('about:blank', '_blank');
    const result = await beginUpgrade(requiredTier === LicenseTier.PRO_PLUS ? LicenseTier.PRO_PLUS : LicenseTier.PRO);

    if (!result.success || !result.checkoutUrl) {
      checkoutWindow?.close();
      setLocalError(result.error || 'Unable to start checkout');
      return;
    }

    if (checkoutWindow) checkoutWindow.location.href = result.checkoutUrl;
    else window.location.href = result.checkoutUrl;

    const unlocked = await waitForPendingUpgrade();
    if (unlocked) onClose();
  };

  const features = requiredTier === LicenseTier.PRO_PLUS
    ? ['Everything in PRO', 'Workstation access', 'Expanded system integrations']
    : ['Expanded tools', 'Batch workflows', 'Automation', 'Advanced processing and exports'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 14 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 14 }}
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
          >
            <div className={`p-6 bg-gradient-to-r ${tierConfig.gradient}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">NoDAW Launcher</div>
                  <h3 className="text-2xl font-bold text-white mt-1">Unlock {tierConfig.label}</h3>
                  <p className="text-white/80 text-sm mt-1">One-time license. No subscription.</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white">✕</button>
              </div>
            </div>

            <div className="p-6">
              <p className={`text-sm mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Free mode stays free forever. Upgrade only to unlock expanded capability, automation, and higher-value workflows.
              </p>

              <div className="space-y-2 mb-6">
                {features.map((feature) => (
                  <div key={feature} className={`text-sm flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="text-emerald-500">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`rounded-xl p-4 mb-5 border ${isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">License model</div>
                <div className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Pay once · Permanent access</div>
                <div className="text-xs text-slate-500 mt-1">Checkout shows the current canonical price.</div>
              </div>

              {(localError || upgradeError) && (
                <div className="mb-4 text-sm text-red-400">{localError || upgradeError}</div>
              )}

              {upgradeStatus === 'awaiting_payment' && (
                <div className="mb-4 text-sm text-cyan-400">Checkout opened. PRO will unlock here automatically after payment.</div>
              )}
              {upgradeStatus === 'activating' && (
                <div className="mb-4 text-sm text-cyan-400">Payment confirmed. Activating PRO…</div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: isBusy ? 1 : 1.02 }}
                  whileTap={{ scale: isBusy ? 1 : 0.98 }}
                  disabled={isBusy}
                  onClick={handleUpgrade}
                  className={`flex-1 py-3 rounded-xl font-medium text-white bg-gradient-to-r ${tierConfig.gradient} shadow-lg disabled:opacity-60`}
                >
                  {upgradeStatus === 'creating' ? 'Preparing secure checkout…' :
                   upgradeStatus === 'awaiting_payment' ? 'Waiting for payment…' :
                   upgradeStatus === 'activating' ? 'Activating…' :
                   `Unlock ${tierConfig.label}`}
                </motion.button>
                <button
                  onClick={onClose}
                  disabled={upgradeStatus === 'activating'}
                  className={`px-5 py-3 rounded-xl font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'}`}
                >
                  Keep Free
                </button>
              </div>

              <div className="text-[11px] text-slate-500 mt-4 text-center">
                Already purchased elsewhere? Restore with your purchase email and license code in Settings.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ProGate: React.FC<ProGateProps> = ({
  toolId,
  requiredTier = LicenseTier.PRO,
  children,
  mode = 'overlay',
  message,
  onUpgradeClick,
}) => {
  const theme = useThemeStore(state => state.theme);
  const tier = useLicenseStore(state => state.getCurrentTier());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasAccess = tierAllows(tier, requiredTier);

  if (hasAccess) return <>{children}</>;

  const openUpgrade = () => {
    onUpgradeClick?.();
    setShowUpgradeModal(true);
  };

  if (mode === 'badge') {
    return (
      <>
        <button onClick={openUpgrade} className="inline-flex items-center gap-2">
          {children}
          <TierBadge tier={requiredTier} size="sm" />
        </button>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} toolId={toolId} requiredTier={requiredTier} />
      </>
    );
  }

  if (mode === 'block') {
    return (
      <>
        <button
          onClick={openUpgrade}
          className={`w-full rounded-xl border p-5 text-left ${theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white'}`}
        >
          <div className="flex items-center gap-2 mb-1"><TierBadge tier={requiredTier} /><span className="font-semibold">Expanded capability</span></div>
          <div className="text-sm text-slate-500">{message || 'This advanced feature is available with a one-time PRO unlock.'}</div>
        </button>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} toolId={toolId} requiredTier={requiredTier} />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none opacity-45">{children}</div>
        <button
          onClick={openUpgrade}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/55 backdrop-blur-[2px]"
        >
          <div className="text-center px-4">
            <TierBadge tier={requiredTier} />
            <div className="text-sm text-white mt-2">{message || 'Unlock expanded capability and automation.'}</div>
            <div className="text-xs text-slate-300 mt-1">One-time purchase · Free mode remains available</div>
          </div>
        </button>
      </div>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} toolId={toolId} requiredTier={requiredTier} />
    </>
  );
};

export default ProGate;
