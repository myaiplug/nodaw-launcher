/**
 * licenseStore.ts
 * Zustand store for license management with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolTier } from './tools';

export enum LicenseTier {
  FREE = 'free',
  PRO = 'pro',
  PRO_PLUS = 'pro_plus'
}

interface License {
  tier: LicenseTier;
  key: string;
  email?: string;
  activatedAt: number;
  expiresAt: number | null;  // null = lifetime
  machineId?: string;
}

interface LicenseState {
  license: License | null;
  isValidating: boolean;
  lastValidated: number | null;
  isDevMode: boolean;  // Secret admin bypass
  
  // Actions
  getCurrentTier: () => LicenseTier;
  canAccessTool: (toolId: string) => boolean;
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
  deactivateLicense: () => void;
  validateOnline: () => Promise<boolean>;
  toggleDevMode: (secret: string) => boolean;  // Hidden admin toggle
}

// Tool access mapping
const TIER_ACCESS: Record<LicenseTier, string[]> = {
  [LicenseTier.FREE]: ['trim-it', 'convert-it', 'test-it'],
  [LicenseTier.PRO]: ['trim-it', 'convert-it', 'test-it', 'split-it', 'screw-it', 'fx-it'],
  [LicenseTier.PRO_PLUS]: ['*']  // Wildcard = all tools
};

// Secret dev mode passphrase - change this to your own secret!
const DEV_SECRET = 'nodaw-dev-2026';

// Simple hash for machine ID (client-side only)
const generateMachineId = (): string => {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// License validation (local for now, can be extended to server)
const validateLicenseKey = async (key: string): Promise<{ valid: boolean; tier?: LicenseTier; error?: string }> => {
  // Normalize key
  const cleanKey = key.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // Demo validation patterns:
  // PRO-XXXX-XXXX-XXXX = Pro license
  // PLUS-XXXX-XXXX-XXXX = Pro+ license
  // DEMO-PRO-XXXX = Demo Pro (expires in 7 days)
  // DEMO-PLUS-XXXX = Demo Pro+ (expires in 7 days)
  
  // In production, this would call your license server API
  
  if (cleanKey.startsWith('PRO-') && cleanKey.length >= 16) {
    return { valid: true, tier: LicenseTier.PRO };
  }
  
  if (cleanKey.startsWith('PLUS-') && cleanKey.length >= 17) {
    return { valid: true, tier: LicenseTier.PRO_PLUS };
  }
  
  if (cleanKey.startsWith('DEMO-PRO-') && cleanKey.length >= 12) {
    return { valid: true, tier: LicenseTier.PRO };
  }
  
  if (cleanKey.startsWith('DEMO-PLUS-') && cleanKey.length >= 13) {
    return { valid: true, tier: LicenseTier.PRO_PLUS };
  }
  
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return { valid: false, error: 'Invalid license key format' };
};

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      license: null,
      isValidating: false,
      lastValidated: null,
      isDevMode: false,  // Admin bypass - not persisted
      
      getCurrentTier: () => {
        const { license, isDevMode } = get();
        
        // Dev mode = full access
        if (isDevMode) return LicenseTier.PRO_PLUS;
        
        if (!license) return LicenseTier.FREE;
        
        // Check expiration
        if (license.expiresAt && Date.now() > license.expiresAt) {
          return LicenseTier.FREE;
        }
        
        return license.tier;
      },
      
      canAccessTool: (toolId: string) => {
        const { isDevMode } = get();
        
        // Dev mode bypasses all restrictions
        if (isDevMode) return true;
        
        const tier = get().getCurrentTier();
        const allowedTools = TIER_ACCESS[tier];
        
        // Wildcard means all access
        if (allowedTools.includes('*')) return true;
        
        return allowedTools.includes(toolId);
      },
      
      toggleDevMode: (secret: string) => {
        if (secret === DEV_SECRET) {
          const current = get().isDevMode;
          set({ isDevMode: !current });
          console.log(current ? '🔒 Dev mode disabled' : '🔓 Dev mode enabled');
          return true;
        }
        return false;
      },
      
      activateLicense: async (key: string) => {
        set({ isValidating: true });
        
        try {
          const result = await validateLicenseKey(key);
          
          if (result.valid && result.tier) {
            const cleanKey = key.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            const isDemo = cleanKey.startsWith('DEMO-');
            
            const license: License = {
              tier: result.tier,
              key: cleanKey,
              activatedAt: Date.now(),
              expiresAt: isDemo ? Date.now() + (7 * 24 * 60 * 60 * 1000) : null, // 7 days for demo
              machineId: generateMachineId()
            };
            
            set({ 
              license, 
              isValidating: false, 
              lastValidated: Date.now() 
            });
            
            return { success: true };
          }
          
          set({ isValidating: false });
          return { success: false, error: result.error || 'Invalid license key' };
          
        } catch (error) {
          set({ isValidating: false });
          return { success: false, error: 'Validation failed. Please try again.' };
        }
      },
      
      deactivateLicense: () => {
        set({ license: null, lastValidated: null });
      },
      
      validateOnline: async () => {
        const { license } = get();
        if (!license) return false;
        
        // In production, this would call the license server to verify
        // For now, just check if not expired
        if (license.expiresAt && Date.now() > license.expiresAt) {
          set({ license: null });
          return false;
        }
        
        set({ lastValidated: Date.now() });
        return true;
      }
    }),
    {
      name: 'nodaw-license',
      partialize: (state) => ({ 
        license: state.license,
        lastValidated: state.lastValidated 
      })
    }
  )
);

// Convenience hooks
export const useCurrentTier = () => useLicenseStore(state => state.getCurrentTier());
export const useCanAccessTool = (toolId: string) => useLicenseStore(state => state.canAccessTool(toolId));
export const useIsProUser = () => {
  const tier = useLicenseStore(state => state.getCurrentTier());
  return tier === LicenseTier.PRO || tier === LicenseTier.PRO_PLUS;
};
export const useIsProPlusUser = () => {
  const tier = useLicenseStore(state => state.getCurrentTier());
  return tier === LicenseTier.PRO_PLUS;
};
export const useIsDevMode = () => useLicenseStore(state => state.isDevMode);

// Secret dev mode activation via console
// Usage: window.__nodaw_dev('nodaw-dev-2026')
if (typeof window !== 'undefined') {
  (window as any).__nodaw_dev = (secret: string) => {
    const store = useLicenseStore.getState();
    if (store.toggleDevMode(secret)) {
      return store.isDevMode ? '🔓 All tools unlocked!' : '🔒 Dev mode disabled';
    }
    return '❌ Invalid secret';
  };
}

export default useLicenseStore;
