/**
 * Production-oriented NoDAW Launcher entitlement store.
 *
 * Free mode is the default and works forever. PRO/PRO+ are server-issued
 * entitlements. Direct Stripe upgrades use a short-lived claim so checkout can
 * unlock this app instance automatically; manual email + license activation is
 * retained only as a recovery path.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum LicenseTier {
  FREE = 'free',
  PRO = 'pro',
  PRO_PLUS = 'pro_plus'
}

interface License {
  tier: LicenseTier;
  key: string;
  email: string;
  features: string[];
  activatedAt: number;
  expiresAt: number | null;
}

interface PendingUpgrade {
  claimId: string;
  claimToken: string;
  productId: string;
  plan: LicenseTier;
  checkoutUrl: string;
  expiresAt: string;
}

interface UpgradeResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

interface LicenseState {
  license: License | null;
  pendingUpgrade: PendingUpgrade | null;
  isValidating: boolean;
  lastValidated: number | null;
  upgradeStatus: 'idle' | 'creating' | 'awaiting_payment' | 'activating' | 'unlocked' | 'error';
  upgradeError: string | null;
  isDevMode: false;

  getCurrentTier: () => LicenseTier;
  canAccessTool: (toolId: string) => boolean;
  beginUpgrade: (tier?: LicenseTier.PRO | LicenseTier.PRO_PLUS) => Promise<UpgradeResult>;
  checkPendingUpgrade: () => Promise<boolean>;
  waitForPendingUpgrade: (timeoutMs?: number) => Promise<boolean>;
  activateLicense: (key: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  deactivateLicense: () => void;
  validateOnline: () => Promise<boolean>;
  toggleDevMode: (_secret: string) => false;
}

const PRODUCT_ID = 'launcher';
const ENTITLEMENTS_URL = String(import.meta.env.VITE_NODAW_ENTITLEMENTS_URL || '').replace(/\/$/, '');

const TIER_ACCESS: Record<LicenseTier, string[]> = {
  [LicenseTier.FREE]: ['trim-it', 'convert-it', 'test-it'],
  [LicenseTier.PRO]: ['trim-it', 'convert-it', 'test-it', 'split-it', 'screw-it', 'fx-it', 'icon-it', 'half-screw'],
  [LicenseTier.PRO_PLUS]: ['*']
};

function getAppInstanceId(): string {
  const storageKey = 'nodaw-app-instance-id';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const value = globalThis.crypto?.randomUUID?.() || `app-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(storageKey, value);
  return value;
}

function tierFromPlan(plan: string): LicenseTier {
  if (plan === LicenseTier.PRO_PLUS) return LicenseTier.PRO_PLUS;
  if (plan === LicenseTier.PRO) return LicenseTier.PRO;
  return LicenseTier.FREE;
}

async function jsonFetch(path: string, init?: RequestInit) {
  if (!ENTITLEMENTS_URL) throw new Error('NoDAW entitlement service is not configured');
  const response = await fetch(`${ENTITLEMENTS_URL}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function validateCredential(email: string, licenseKey: string) {
  return jsonFetch('/api/entitlements/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, productId: PRODUCT_ID, licenseKey }),
  });
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      license: null,
      pendingUpgrade: null,
      isValidating: false,
      lastValidated: null,
      upgradeStatus: 'idle',
      upgradeError: null,
      isDevMode: false,

      getCurrentTier: () => {
        const { license } = get();
        if (!license) return LicenseTier.FREE;
        if (license.expiresAt && Date.now() > license.expiresAt) return LicenseTier.FREE;
        return license.tier;
      },

      canAccessTool: (toolId: string) => {
        const tier = get().getCurrentTier();
        const allowed = TIER_ACCESS[tier];
        return allowed.includes('*') || allowed.includes(toolId);
      },

      beginUpgrade: async (tier = LicenseTier.PRO) => {
        set({ upgradeStatus: 'creating', upgradeError: null });
        try {
          const data = await jsonFetch('/api/upgrades/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: PRODUCT_ID,
              plan: tier,
              appInstanceId: getAppInstanceId(),
            }),
          });
          const pendingUpgrade: PendingUpgrade = {
            claimId: data.claimId,
            claimToken: data.claimToken,
            productId: data.productId,
            plan: tier,
            checkoutUrl: data.checkoutUrl,
            expiresAt: data.expiresAt,
          };
          set({ pendingUpgrade, upgradeStatus: 'awaiting_payment', upgradeError: null });
          return { success: true, checkoutUrl: pendingUpgrade.checkoutUrl };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to start checkout';
          set({ upgradeStatus: 'error', upgradeError: message });
          return { success: false, error: message };
        }
      },

      checkPendingUpgrade: async () => {
        const pending = get().pendingUpgrade;
        if (!pending) return false;

        if (Date.parse(pending.expiresAt) <= Date.now()) {
          set({ pendingUpgrade: null, upgradeStatus: 'error', upgradeError: 'Upgrade session expired. Start checkout again.' });
          return false;
        }

        try {
          const query = new URLSearchParams({ claimId: pending.claimId, claimToken: pending.claimToken });
          const data = await jsonFetch(`/api/upgrades/status?${query.toString()}`);
          const claim = data.claim;
          if (!claim) return false;

          if (claim.productId !== pending.productId || claim.productId !== PRODUCT_ID || claim.plan !== pending.plan) {
            set({ pendingUpgrade: null, upgradeStatus: 'error', upgradeError: 'Upgrade verification mismatch. Purchase was not activated.' });
            return false;
          }

          if (claim.status === 'expired') {
            set({ pendingUpgrade: null, upgradeStatus: 'error', upgradeError: 'Upgrade session expired. Start checkout again.' });
            return false;
          }

          if (claim.status !== 'fulfilled' || !claim.licenseKey || !claim.email) return false;

          set({ upgradeStatus: 'activating', upgradeError: null });
          const normalizedEmail = String(claim.email).trim().toLowerCase();
          const cleanKey = String(claim.licenseKey).trim();
          const validation = await validateCredential(normalizedEmail, cleanKey);

          if (!validation.valid || validation.plan !== pending.plan) {
            set({ pendingUpgrade: null, upgradeStatus: 'error', upgradeError: 'Purchase was received but the entitlement could not be verified.' });
            return false;
          }

          const license: License = {
            tier: tierFromPlan(validation.plan),
            key: cleanKey,
            email: normalizedEmail,
            features: Array.isArray(validation.features) ? validation.features : [],
            activatedAt: Date.now(),
            expiresAt: null,
          };
          set({
            license,
            pendingUpgrade: null,
            lastValidated: Date.now(),
            upgradeStatus: 'unlocked',
            upgradeError: null,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Activation check failed';
          set({ upgradeError: message });
          return false;
        }
      },

      waitForPendingUpgrade: async (timeoutMs = 5 * 60 * 1000) => {
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
          if (!get().pendingUpgrade) return get().getCurrentTier() !== LicenseTier.FREE;
          if (await get().checkPendingUpgrade()) return true;
          await sleep(1500);
        }
        return false;
      },

      activateLicense: async (key: string, email?: string) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const cleanKey = String(key || '').trim();
        if (!normalizedEmail) return { success: false, error: 'Purchase email is required to restore a license' };
        if (!cleanKey) return { success: false, error: 'License key is required' };

        set({ isValidating: true });
        try {
          const result = await validateCredential(normalizedEmail, cleanKey);
          if (!result.valid) {
            set({ isValidating: false });
            return { success: false, error: result.error || 'License could not be verified' };
          }
          const license: License = {
            tier: tierFromPlan(result.plan),
            key: cleanKey,
            email: normalizedEmail,
            features: Array.isArray(result.features) ? result.features : [],
            activatedAt: Date.now(),
            expiresAt: null,
          };
          set({ license, isValidating: false, lastValidated: Date.now(), upgradeStatus: 'unlocked', upgradeError: null });
          return { success: true };
        } catch (error) {
          set({ isValidating: false });
          return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
        }
      },

      deactivateLicense: () => set({ license: null, lastValidated: null, pendingUpgrade: null, upgradeStatus: 'idle', upgradeError: null }),

      validateOnline: async () => {
        const { license } = get();
        if (!license) return false;
        try {
          const result = await validateCredential(license.email, license.key);
          if (!result.valid) {
            set({ license: null, lastValidated: Date.now() });
            return false;
          }
          set({
            license: {
              ...license,
              tier: tierFromPlan(result.plan),
              features: Array.isArray(result.features) ? result.features : license.features,
            },
            lastValidated: Date.now(),
          });
          return true;
        } catch {
          // Network failure does not revoke a valid paid license. This preserves
          // offline studio use while allowing revocation to sync next time online.
          return true;
        }
      },

      // Deprecated compatibility shim. The previous client-side secret was a
      // bypass vulnerability and has intentionally been removed.
      toggleDevMode: () => false,
    }),
    {
      name: 'nodaw-license-v2',
      partialize: (state) => ({
        license: state.license,
        pendingUpgrade: state.pendingUpgrade,
        lastValidated: state.lastValidated,
      }),
    }
  )
);

export const useCurrentTier = () => useLicenseStore(state => state.getCurrentTier());
export const useCanAccessTool = (toolId: string) => useLicenseStore(state => state.canAccessTool(toolId));
export const useIsProUser = () => {
  const tier = useLicenseStore(state => state.getCurrentTier());
  return tier === LicenseTier.PRO || tier === LicenseTier.PRO_PLUS;
};
export const useIsProPlusUser = () => useLicenseStore(state => state.getCurrentTier()) === LicenseTier.PRO_PLUS;
export const useIsDevMode = () => false;

export default useLicenseStore;
