/**
 * SettingsPanel.tsx
 * Application settings panel with theme, audio, and license management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { useLicenseStore, LicenseTier } from '../licenseStore';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl p-6 border ${
      isDark 
        ? 'bg-slate-900/50 border-slate-800' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <h3 className={`font-semibold mb-1 ${
        isDark ? 'text-slate-200' : 'text-slate-800'
      }`}>
        {title}
      </h3>
      {description && (
        <p className={`text-sm mb-4 ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0 border-opacity-50"
      style={{ borderColor: isDark ? 'rgb(51, 65, 85)' : 'rgb(226, 232, 240)' }}
    >
      <div className="flex-1 mr-4">
        <div className={`font-mono text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
        </div>
        {description && (
          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
};

export const SettingsPanel: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';
  
  const { 
    license, 
    getCurrentTier, 
    activateLicense, 
    deactivateLicense 
  } = useLicenseStore();
  
  const currentTier = getCurrentTier();
  
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [licenseSuccess, setLicenseSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');

  // Fetch audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(outputs);
        
        const savedDevice = localStorage.getItem('nodaw_audio_device');
        if (savedDevice && outputs.some(d => d.deviceId === savedDevice)) {
          setSelectedDevice(savedDevice);
        }
      } catch (e) {
        console.log('Audio device enumeration not available');
      }
    };
    getDevices();
  }, []);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('nodaw_audio_device', deviceId);
  };

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      setLicenseError('Please enter a license key');
      return;
    }
    
    setIsActivating(true);
    setLicenseError('');
    setLicenseSuccess(false);
    
    try {
      const result = await activateLicense(licenseKey.trim());
      if (result.success) {
        setLicenseSuccess(true);
        setLicenseKey('');
      } else {
        setLicenseError(result.error || 'Invalid license key');
      }
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate your license?')) {
      deactivateLicense();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierLabel = (tier: LicenseTier) => {
    switch (tier) {
      case LicenseTier.FREE: return 'Free';
      case LicenseTier.PRO: return 'Pro';
      case LicenseTier.PRO_PLUS: return 'Pro+';
    }
  };

  const getTierColor = (tier: LicenseTier) => {
    switch (tier) {
      case LicenseTier.FREE: return isDark ? 'text-slate-400' : 'text-slate-600';
      case LicenseTier.PRO: return isDark ? 'text-purple-400' : 'text-purple-600';
      case LicenseTier.PRO_PLUS: return isDark ? 'text-orange-400' : 'text-orange-600';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Appearance Section */}
      <SettingsSection 
        title="Appearance" 
        description="Customize how NoDAW looks"
      >
        <SettingRow 
          label="Theme" 
          description="Choose between light and dark mode"
        >
          <div className={`flex rounded-lg overflow-hidden border ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                  theme === t
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-cyan-500 text-white'
                    : isDark
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {t === 'light' ? '☀️' : '🌙'} {t}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingsSection>

      {/* Audio Section */}
      <SettingsSection 
        title="Audio" 
        description="Configure audio output settings"
      >
        <SettingRow 
          label="Output Device" 
          description="Select your preferred audio output"
        >
          <select
            value={selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className={`px-3 py-2 rounded-lg font-mono text-sm border transition-colors min-w-[200px] ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="default">System Default</option>
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Device ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </SettingRow>
      </SettingsSection>

      {/* License Section */}
      <SettingsSection 
        title="License" 
        description="Manage your NoDAW license"
      >
        {/* Current Status */}
        <div className={`p-4 rounded-lg mb-4 ${
          isDark ? 'bg-slate-800/50' : 'bg-slate-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-mono uppercase tracking-wider mb-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Current Plan
              </div>
              <div className={`text-lg font-bold ${getTierColor(currentTier)}`}>
                {getTierLabel(currentTier)}
                {currentTier === LicenseTier.FREE && (
                  <span className={`ml-2 text-xs font-normal ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    (3 tools included)
                  </span>
                )}
              </div>
            </div>
            
            {license && (
              <motion.button
                onClick={handleDeactivate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  isDark
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                Deactivate
              </motion.button>
            )}
          </div>
          
          {license && (
            <div className={`mt-3 pt-3 border-t text-xs font-mono ${
              isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <div>Activated: {formatDate(license.activatedAt)}</div>
              {license.expiresAt && (
                <div>Expires: {formatDate(license.expiresAt)}</div>
              )}
            </div>
          )}
        </div>

        {/* License Activation */}
        {!license && (
          <div className="space-y-3">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter your license key to unlock Pro features
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="PRO-XXXX-XXXX-XXXX"
                className={`flex-1 px-4 py-2.5 rounded-lg font-mono text-sm border transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-cyan-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-cyan-500'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
              />
              
              <motion.button
                onClick={handleActivateLicense}
                disabled={isActivating || !licenseKey.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-5 py-2.5 rounded-lg font-mono text-sm transition-colors disabled:opacity-50 ${
                  isDark
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/40'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                {isActivating ? 'Activating...' : 'Activate'}
              </motion.button>
            </div>
            
            <AnimatePresence>
              {licenseError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                >
                  ⚠️ {licenseError}
                </motion.div>
              )}
              
              {licenseSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}
                >
                  ✓ License activated successfully!
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              Don't have a license?{' '}
              <a 
                href="https://nodaw.studio/pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`underline ${isDark ? 'text-cyan-500 hover:text-cyan-400' : 'text-cyan-600 hover:text-cyan-500'}`}
              >
                Get one here
              </a>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* About Section */}
      <SettingsSection 
        title="About" 
        description="NoDAW Studio Suite"
      >
        <div className="space-y-3">
          <SettingRow label="Version">
            <span className={`font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              1.2.0
            </span>
          </SettingRow>
          
          <SettingRow label="Build">
            <span className={`font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              2026.04.07
            </span>
          </SettingRow>
          
          <div className={`pt-3 border-t ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="flex gap-4">
              <a 
                href="https://github.com/myaiplug/nodaw-launcher" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-xs font-mono underline ${
                  isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                GitHub
              </a>
              <a 
                href="https://nodaw.studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-xs font-mono underline ${
                  isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                Website
              </a>
              <a 
                href="https://nodaw.studio/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-xs font-mono underline ${
                  isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Keyboard Shortcuts Reference */}
      <SettingsSection 
        title="Keyboard Shortcuts" 
        description="Quick reference for keyboard navigation"
      >
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { keys: ['Ctrl', 'T'], action: 'Toggle theme' },
            { keys: ['1-7'], action: 'Quick launch tools' },
            { keys: ['Esc'], action: 'Close panel / Cancel' },
            { keys: ['Space'], action: 'Play / Pause audio' },
            { keys: ['←', '→'], action: 'Seek audio' },
            { keys: ['A', 'B'], action: 'Switch A/B tracks' },
          ].map(({ keys, action }) => (
            <div key={action} className="flex items-center justify-between py-1.5">
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {action}
              </span>
              <div className="flex gap-1">
                {keys.map((key) => (
                  <kbd 
                    key={key}
                    className={`px-2 py-0.5 rounded text-xs font-mono ${
                      isDark 
                        ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
};

export default SettingsPanel;
