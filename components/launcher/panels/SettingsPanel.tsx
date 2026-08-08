/**
 * Launcher settings. Paid activation is automatic after checkout; manual entry
 * exists only to restore an existing purchase on another/reinstalled device.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { LicenseTier, useLicenseStore } from '../licenseStore';

const Card: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => {
  const isDark = useThemeStore(state => state.theme) === 'dark';
  return (
    <section className={`rounded-xl p-6 border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <h3 className={isDark ? 'font-semibold text-slate-200' : 'font-semibold text-slate-800'}>{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>}
      {children}
    </section>
  );
};

export const SettingsPanel: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const {
    license,
    getCurrentTier,
    beginUpgrade,
    waitForPendingUpgrade,
    activateLicense,
    deactivateLicense,
    upgradeStatus,
    upgradeError,
  } = useLicenseStore();

  const tier = getCurrentTier();
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(localStorage.getItem('nodaw_audio_device') || 'default');

  useEffect(() => {
    let stream: MediaStream | null = null;
    const loadDevices = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(device => device.kind === 'audiooutput'));
      } catch {
        // Device enumeration is optional and can be unavailable in Electron/web.
      } finally {
        stream?.getTracks().forEach(track => track.stop());
      }
    };
    void loadDevices();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const startUpgrade = async () => {
    setError(null);
    setMessage(null);
    const popup = window.open('about:blank', '_blank');
    if (popup) {
      try { popup.opener = null; } catch { /* browser controlled */ }
      popup.document.title = 'Opening secure checkout…';
    }

    const result = await beginUpgrade(LicenseTier.PRO);
    if (!result.success || !result.checkoutUrl) {
      popup?.close();
      setError(result.error || 'Unable to start checkout.');
      return;
    }

    if (popup) popup.location.href = result.checkoutUrl;
    else window.location.assign(result.checkoutUrl);

    setMessage('Checkout opened. PRO will activate automatically after payment.');
    const unlocked = await waitForPendingUpgrade();
    if (unlocked) setMessage('PRO activated. No restart required.');
  };

  const restorePurchase = async () => {
    if (!purchaseEmail.trim() || !licenseKey.trim()) {
      setError('Purchase email and recovery license key are required.');
      return;
    }
    setRestoring(true);
    setError(null);
    setMessage(null);
    const result = await activateLicense(licenseKey.trim(), purchaseEmail.trim());
    setRestoring(false);
    if (result.success) {
      setMessage('Purchase restored successfully.');
      setPurchaseEmail('');
      setLicenseKey('');
    } else {
      setError(result.error || 'Purchase could not be restored.');
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
    isDark ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
  }`;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card title="Appearance" description="Choose the Launcher interface theme.">
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map(value => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`px-4 py-2 rounded-lg text-sm font-mono uppercase ${
                theme === value ? 'bg-cyan-600 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Audio" description="Select the preferred output device when the platform exposes one.">
        <select
          value={selectedDevice}
          onChange={event => {
            setSelectedDevice(event.target.value);
            localStorage.setItem('nodaw_audio_device', event.target.value);
          }}
          className={inputClass}
        >
          <option value="default">System Default</option>
          {audioDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>{device.label || 'Audio output'}</option>
          ))}
        </select>
      </Card>

      <Card title="License" description="Free is permanent. PRO is a one-time upgrade tied to a verified purchase.">
        <div className={`rounded-xl border p-4 mb-5 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex justify-between items-center gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500">Current plan</div>
              <div className="text-xl font-bold mt-1">
                {tier === LicenseTier.FREE ? 'FREE FOREVER' : tier === LicenseTier.PRO ? 'PRO' : 'PRO+'}
              </div>
              {license?.email && <div className="text-xs text-slate-500 mt-1">Verified purchase: {license.email}</div>}
            </div>
            {license && (
              <button
                onClick={() => confirm('Deactivate this local license? You can restore it later with your purchase email and recovery key.') && deactivateLicense()}
                className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10"
              >
                Deactivate local license
              </button>
            )}
          </div>
        </div>

        {tier === LicenseTier.FREE && (
          <div className="space-y-4">
            <button
              onClick={startUpgrade}
              disabled={upgradeStatus === 'creating' || upgradeStatus === 'awaiting_payment' || upgradeStatus === 'activating'}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold disabled:opacity-50"
            >
              UNLOCK PRO · ONE-TIME PURCHASE
            </button>
            <p className="text-xs text-slate-500 text-center">Checkout is secure. Activation happens automatically after verified payment.</p>

            <div className={`pt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-sm font-medium mb-1">Restore an existing purchase</div>
              <p className="text-xs text-slate-500 mb-3">Use this only after reinstalling or moving to another device.</p>
              <div className="grid gap-3">
                <input
                  type="email"
                  value={purchaseEmail}
                  onChange={event => setPurchaseEmail(event.target.value)}
                  placeholder="Purchase email"
                  autoComplete="email"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={event => setLicenseKey(event.target.value)}
                  placeholder="Recovery license key"
                  autoComplete="off"
                  className={`${inputClass} font-mono`}
                />
                <button
                  onClick={restorePurchase}
                  disabled={restoring}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'} disabled:opacity-50`}
                >
                  {restoring ? 'Verifying…' : 'Restore Purchase'}
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {(error || upgradeError) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-red-400">
              {error || upgradeError}
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-emerald-400">
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card title="About" description="NoDAW Studio Suite">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-slate-500">Version</div><div className="font-mono">1.4.0</div>
          <div className="text-slate-500">License model</div><div className="font-mono">Free Forever + One-Time PRO</div>
          <div className="text-slate-500">Product</div><div className="font-mono">launcher</div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
