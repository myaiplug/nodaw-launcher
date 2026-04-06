import React, { useState } from 'react';
import { LicenseState, activateLicense, PRICING, getDaysRemaining } from '../license';

interface PaywallProps {
  license: LicenseState;
  onLicenseChange: (license: LicenseState) => void;
  featureName: string;
  onClose?: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ license, onLicenseChange, featureName, onClose }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActivateForm, setShowActivateForm] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim() || !email.trim()) {
      setError('Please enter both email and license key');
      return;
    }
    
    setIsActivating(true);
    setError(null);
    
    const result = await activateLicense(licenseKey, email);
    
    setIsActivating(false);
    
    if (result.success && result.license) {
      onLicenseChange(result.license);
    } else {
      setError(result.error || 'Activation failed');
    }
  };

  const openPurchase = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    // In production, this would open the payment flow
    // For now, show demo keys
    alert(`Demo Mode: Use these test keys:\n\n• NODAW-PRO-TRIAL (7-day trial)\n• NODAW-PRO-YEAR-2026 (1 year)\n• NODAW-PRO-LIFETIME (forever)`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-2xl mx-auto animate-scaleIn">
      <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-8 shadow-2xl shadow-cyan-900/20 text-center relative">
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto mb-5 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-tech font-bold text-slate-200 tracking-wide mb-2">
          UNLOCK {featureName.toUpperCase()}
        </h2>
        <p className="text-slate-500 text-xs font-mono mb-6 max-w-md mx-auto">
          {featureName} is a Pro feature. Upgrade to NoDAW Pro for full access to all professional audio tools.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Monthly */}
          <button 
            onClick={() => openPurchase('monthly')}
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em] mb-2">Monthly</div>
            <div className="text-xl font-tech font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">${PRICING.monthly.price}</div>
            <div className="text-[9px] text-slate-600 font-mono">/month</div>
          </button>
          
          {/* Yearly - Recommended */}
          <button 
            onClick={() => openPurchase('yearly')}
            className="p-4 rounded-xl bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-900/50 transition-all relative"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 gradient-bg text-white text-[7px] font-mono uppercase tracking-wider rounded">
              Save {PRICING.yearly.savings}
            </div>
            <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.15em] mb-2">Yearly</div>
            <div className="text-xl font-tech font-bold text-cyan-400">${PRICING.yearly.price}</div>
            <div className="text-[9px] text-cyan-600 font-mono">/year</div>
          </button>
          
          {/* Lifetime */}
          <button 
            onClick={() => openPurchase('lifetime')}
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em] mb-2">Lifetime</div>
            <div className="text-xl font-tech font-bold text-slate-200 group-hover:text-purple-400 transition-colors">${PRICING.lifetime.price}</div>
            <div className="text-[9px] text-slate-600 font-mono">one-time</div>
          </button>
        </div>

        {/* Pro Features List */}
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5 mb-6">
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-3">Pro Includes</div>
          <div className="grid grid-cols-2 gap-2 text-left">
            {[
              'One-Click Effects (20+)',
              'Neural Voice Deepener',
              'Multi-Track Editor',
              'Professional Mastering',
              'Unlimited Renders',
              'Priority Support',
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[10px] text-slate-400 font-mono">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activate License */}
        <div className="border-t border-slate-700/50 pt-5">
          {!showActivateForm ? (
            <button
              onClick={() => setShowActivateForm(true)}
              className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.15em] hover:text-cyan-400 transition-colors"
            >
              Already have a license key?
            </button>
          ) : (
            <div className="space-y-3 animate-slideUp">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em] mb-2">
                Activate License
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <input
                type="text"
                placeholder="License key (e.g., NODAW-PRO-XXXXX)"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              {error && (
                <div className="text-red-400 text-xs font-mono">{error}</div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowActivateForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-mono uppercase tracking-[0.15em] hover:bg-slate-700 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="flex-1 px-4 py-2.5 rounded-lg gradient-bg text-white text-[9px] font-mono uppercase tracking-[0.15em] hover:shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
                >
                  {isActivating ? 'Activating...' : 'Activate'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Free Features Reminder */}
        <div className="mt-5 pt-4 border-t border-slate-700/50">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.15em]">
            Free Forever: Convert, Trim, A/B Compare
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// Small badge to show license status in header (Cyber-HUD style)
export const LicenseBadge: React.FC<{ license: LicenseState; onClick: () => void }> = ({ license, onClick }) => {
  const daysRemaining = getDaysRemaining(license);
  
  if (license.isPro) {
    return (
      <button
        onClick={onClick}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg gradient-bg text-white text-[9px] font-mono uppercase tracking-[0.1em] shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/30 transition-all"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
        </svg>
        <span>Pro</span>
        {daysRemaining !== null && daysRemaining < 30 && (
          <span className="opacity-75">({daysRemaining}d)</span>
        )}
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 text-[9px] font-mono uppercase tracking-[0.1em] hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
    >
      <span>Upgrade</span>
    </button>
  );
};

// Lock overlay for premium tabs (Cyber-HUD style)
export const PremiumLockOverlay: React.FC<{ featureName: string; onUpgrade: () => void }> = ({ featureName, onUpgrade }) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-xl">
      <div className="text-center p-6">
        <div className="w-14 h-14 mx-auto mb-4 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base font-tech font-bold text-slate-200 tracking-wide mb-1">{featureName.toUpperCase()}</h3>
        <p className="text-slate-500 text-[10px] font-mono mb-4">Pro feature</p>
        <button
          onClick={onUpgrade}
          className="px-5 py-2 rounded-lg gradient-bg text-white text-[9px] font-mono uppercase tracking-[0.15em] hover:shadow-lg shadow-cyan-900/30 transition-all"
        >
          Unlock Pro
        </button>
      </div>
    </div>
  );
};

export default Paywall;
