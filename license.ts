// NoDAW Freemium License System
// Free: Convert, Trim, A/B Compare
// Pro: One-Click Effects, Multi-Track Grid

export type LicenseTier = 'free' | 'pro';

export interface LicenseState {
  tier: LicenseTier;
  isPro: boolean;
  expiresAt: Date | null;
  email: string | null;
  licenseKey: string | null;
}

const LICENSE_STORAGE_KEY = 'nodaw_license';

// Features available per tier
export const FEATURE_ACCESS = {
  convert: ['free', 'pro'],
  trim: ['free', 'pro'],
  compare: ['free', 'pro'],
  effects: ['pro'],
  multitrack: ['pro'],
} as const;

export type FeatureKey = keyof typeof FEATURE_ACCESS;

// Check if a feature is available for the current license
export const canAccessFeature = (feature: FeatureKey, tier: LicenseTier): boolean => {
  return FEATURE_ACCESS[feature].includes(tier);
};

// Load license from localStorage
export const loadLicense = (): LicenseState => {
  try {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if license has expired
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        return getDefaultLicense();
      }
      return {
        ...parsed,
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
        isPro: parsed.tier === 'pro',
      };
    }
  } catch (e) {
    console.error('Failed to load license:', e);
  }
  return getDefaultLicense();
};

// Save license to localStorage
export const saveLicense = (license: LicenseState): void => {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
  } catch (e) {
    console.error('Failed to save license:', e);
  }
};

// Get default free license
export const getDefaultLicense = (): LicenseState => ({
  tier: 'free',
  isPro: false,
  expiresAt: null,
  email: null,
  licenseKey: null,
});

// Validate a license key (simple validation - in production, verify with server)
export const validateLicenseKey = async (key: string, email: string): Promise<{ valid: boolean; expiresAt?: Date; error?: string }> => {
  // Simple offline validation for demo purposes
  // In production, this should call a licensing server
  
  // Demo keys for testing:
  // NODAW-PRO-LIFETIME - lifetime license
  // NODAW-PRO-YEAR-2026 - expires end of 2026
  // NODAW-PRO-TRIAL - 7-day trial
  
  const key_upper = key.toUpperCase().trim();
  
  if (key_upper === 'NODAW-PRO-LIFETIME') {
    return { valid: true, expiresAt: new Date('2099-12-31') };
  }
  
  if (key_upper === 'NODAW-PRO-YEAR-2026') {
    return { valid: true, expiresAt: new Date('2026-12-31') };
  }
  
  if (key_upper === 'NODAW-PRO-TRIAL') {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    return { valid: true, expiresAt: trialEnd };
  }
  
  // In production: verify with licensing server
  // const response = await fetch('https://api.nodaw.com/license/validate', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ key, email }),
  // });
  // return response.json();
  
  return { valid: false, error: 'Invalid license key' };
};

// Activate a pro license
export const activateLicense = async (key: string, email: string): Promise<{ success: boolean; license?: LicenseState; error?: string }> => {
  const validation = await validateLicenseKey(key, email);
  
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Invalid license key' };
  }
  
  const license: LicenseState = {
    tier: 'pro',
    isPro: true,
    expiresAt: validation.expiresAt || null,
    email,
    licenseKey: key,
  };
  
  saveLicense(license);
  
  return { success: true, license };
};

// Deactivate license (revert to free)
export const deactivateLicense = (): LicenseState => {
  const defaultLicense = getDefaultLicense();
  saveLicense(defaultLicense);
  return defaultLicense;
};

// Get days remaining on license
export const getDaysRemaining = (license: LicenseState): number | null => {
  if (!license.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(license.expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

// Purchase URLs (would link to payment processor)
export const PURCHASE_URLS = {
  monthly: 'https://nodaw.com/pro/monthly',
  yearly: 'https://nodaw.com/pro/yearly', 
  lifetime: 'https://nodaw.com/pro/lifetime',
};

export const PRICING = {
  monthly: { price: 9.99, period: 'month' },
  yearly: { price: 79.99, period: 'year', savings: '33%' },
  lifetime: { price: 199.99, period: 'once', savings: 'Best Value' },
};
