/**
 * usageStore.ts
 * Track usage limits for free tier users
 * Pro users have unlimited access
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useLicenseStore, LicenseTier } from './licenseStore';

// Usage limits for free tier (per month or specific counts)
export interface ToolUsageLimits {
  // Maximum uses per day for free tier (null = unlimited for pro)
  dailyLimit: number;
  // Maximum file size in MB
  maxFileSizeMB: number;
  // Maximum duration in seconds (for audio tools)
  maxDurationSec: number | null;
  // Output quality restriction ('low' | 'medium' | 'high' | 'lossless')
  maxQuality: 'low' | 'medium' | 'high' | 'lossless';
  // Additional restrictions
  restrictions: string[];
}

// Free tier limits per tool
export const FREE_TIER_LIMITS: Record<string, ToolUsageLimits> = {
  // Free tools - generous limits but still limited
  'trim-it': {
    dailyLimit: 10,
    maxFileSizeMB: 50,
    maxDurationSec: 300, // 5 minutes
    maxQuality: 'high',
    restrictions: ['No batch processing', 'Watermark on exports']
  },
  'convert-it': {
    dailyLimit: 5,
    maxFileSizeMB: 25,
    maxDurationSec: 180, // 3 minutes
    maxQuality: 'medium',
    restrictions: ['MP3 320kbps max', 'No FLAC lossless']
  },
  'test-it': {
    dailyLimit: 10,
    maxFileSizeMB: 50,
    maxDurationSec: 300,
    maxQuality: 'high',
    restrictions: []
  },
  
  // Pro tools - very limited free tier to encourage upgrade
  'split-it': {
    dailyLimit: 2,
    maxFileSizeMB: 15,
    maxDurationSec: 60, // 1 minute
    maxQuality: 'low',
    restrictions: ['2-stem only (vocals/instrumental)', 'No batch', 'Low quality preview']
  },
  'screw-it': {
    dailyLimit: 3,
    maxFileSizeMB: 20,
    maxDurationSec: 90, // 1.5 minutes
    maxQuality: 'medium',
    restrictions: ['Limited presets', 'No export', 'Preview only']
  },
  'fx-it': {
    dailyLimit: 3,
    maxFileSizeMB: 20,
    maxDurationSec: 120, // 2 minutes
    maxQuality: 'medium',
    restrictions: ['5 effects only', 'No custom chains', 'Watermarked output']
  },
  'icon-it': {
    dailyLimit: 2,
    maxFileSizeMB: 10,
    maxDurationSec: null, // Not audio
    maxQuality: 'medium',
    restrictions: ['512x512 max', 'PNG only', 'Watermark on exports']
  },
  
  // Pro+ tools - locked for free tier
  'workstation': {
    dailyLimit: 0, // Locked
    maxFileSizeMB: 0,
    maxDurationSec: 0,
    maxQuality: 'low',
    restrictions: ['Pro+ subscription required']
  }
};

// Pro tier limits (generous but some caps for abuse prevention)
export const PRO_TIER_LIMITS: Record<string, ToolUsageLimits> = {
  'split-it': {
    dailyLimit: 100,
    maxFileSizeMB: 500,
    maxDurationSec: 1800, // 30 minutes
    maxQuality: 'lossless',
    restrictions: []
  },
  'screw-it': {
    dailyLimit: 200,
    maxFileSizeMB: 500,
    maxDurationSec: 1800,
    maxQuality: 'lossless',
    restrictions: []
  },
  'fx-it': {
    dailyLimit: 200,
    maxFileSizeMB: 500,
    maxDurationSec: 1800,
    maxQuality: 'lossless',
    restrictions: []
  },
  'icon-it': {
    dailyLimit: 100,
    maxFileSizeMB: 50,
    maxDurationSec: null,
    maxQuality: 'lossless',
    restrictions: []
  },
  'trim-it': {
    dailyLimit: 500,
    maxFileSizeMB: 500,
    maxDurationSec: 7200, // 2 hours
    maxQuality: 'lossless',
    restrictions: []
  },
  'convert-it': {
    dailyLimit: 500,
    maxFileSizeMB: 500,
    maxDurationSec: 7200,
    maxQuality: 'lossless',
    restrictions: []
  },
  'test-it': {
    dailyLimit: 1000,
    maxFileSizeMB: 500,
    maxDurationSec: 7200,
    maxQuality: 'lossless',
    restrictions: []
  },
  'workstation': {
    dailyLimit: 0, // Still locked for PRO
    maxFileSizeMB: 0,
    maxDurationSec: 0,
    maxQuality: 'low',
    restrictions: ['Pro+ subscription required']
  }
};

// Pro+ tier - unlimited
export const PRO_PLUS_LIMITS: ToolUsageLimits = {
  dailyLimit: -1, // Unlimited
  maxFileSizeMB: -1, // Unlimited
  maxDurationSec: -1, // Unlimited
  maxQuality: 'lossless',
  restrictions: []
};

// Usage record per tool per day
interface DailyUsage {
  toolId: string;
  date: string; // YYYY-MM-DD
  count: number;
  totalBytes: number;
  totalDurationSec: number;
}

interface UsageState {
  dailyUsage: DailyUsage[];
  lifetimeUsage: Record<string, { totalUses: number; firstUsed: number; lastUsed: number }>;
  
  // Actions
  recordUsage: (toolId: string, fileSizeBytes?: number, durationSec?: number) => void;
  getTodaysUsage: (toolId: string) => DailyUsage | null;
  getUsageRemaining: (toolId: string) => number;
  canUse: (toolId: string, fileSizeBytes?: number, durationSec?: number) => { allowed: boolean; reason?: string };
  getLimits: (toolId: string) => ToolUsageLimits;
  resetDailyUsage: () => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      dailyUsage: [],
      lifetimeUsage: {},
      
      recordUsage: (toolId: string, fileSizeBytes = 0, durationSec = 0) => {
        const today = getTodayDate();
        const { dailyUsage, lifetimeUsage } = get();
        
        // Update daily usage
        const existingIndex = dailyUsage.findIndex(
          u => u.toolId === toolId && u.date === today
        );
        
        let newDailyUsage: DailyUsage[];
        if (existingIndex >= 0) {
          newDailyUsage = [...dailyUsage];
          newDailyUsage[existingIndex] = {
            ...newDailyUsage[existingIndex],
            count: newDailyUsage[existingIndex].count + 1,
            totalBytes: newDailyUsage[existingIndex].totalBytes + fileSizeBytes,
            totalDurationSec: newDailyUsage[existingIndex].totalDurationSec + durationSec
          };
        } else {
          newDailyUsage = [...dailyUsage, {
            toolId,
            date: today,
            count: 1,
            totalBytes: fileSizeBytes,
            totalDurationSec: durationSec
          }];
        }
        
        // Clean up old daily records (keep last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
        newDailyUsage = newDailyUsage.filter(u => u.date >= cutoffDate);
        
        // Update lifetime usage
        const existing = lifetimeUsage[toolId] || { totalUses: 0, firstUsed: Date.now(), lastUsed: Date.now() };
        const newLifetime = {
          ...lifetimeUsage,
          [toolId]: {
            totalUses: existing.totalUses + 1,
            firstUsed: existing.firstUsed,
            lastUsed: Date.now()
          }
        };
        
        set({ dailyUsage: newDailyUsage, lifetimeUsage: newLifetime });
      },
      
      getTodaysUsage: (toolId: string) => {
        const today = getTodayDate();
        return get().dailyUsage.find(u => u.toolId === toolId && u.date === today) || null;
      },
      
      getUsageRemaining: (toolId: string) => {
        const limits = get().getLimits(toolId);
        if (limits.dailyLimit < 0) return Infinity; // Unlimited
        if (limits.dailyLimit === 0) return 0; // Locked
        
        const usage = get().getTodaysUsage(toolId);
        return Math.max(0, limits.dailyLimit - (usage?.count || 0));
      },
      
      canUse: (toolId: string, fileSizeBytes = 0, durationSec = 0) => {
        const tier = useLicenseStore.getState().getCurrentTier();
        const limits = get().getLimits(toolId);
        const usage = get().getTodaysUsage(toolId);
        
        // Dev mode bypasses all limits
        if (useLicenseStore.getState().isDevMode) {
          return { allowed: true };
        }
        
        // Check daily limit
        if (limits.dailyLimit === 0) {
          return { allowed: false, reason: 'This tool requires a Pro subscription' };
        }
        
        if (limits.dailyLimit > 0 && (usage?.count || 0) >= limits.dailyLimit) {
          return { 
            allowed: false, 
            reason: `Daily limit reached (${limits.dailyLimit}/${limits.dailyLimit}). Upgrade to Pro for unlimited access.` 
          };
        }
        
        // Check file size
        const fileSizeMB = fileSizeBytes / (1024 * 1024);
        if (limits.maxFileSizeMB > 0 && fileSizeMB > limits.maxFileSizeMB) {
          return { 
            allowed: false, 
            reason: `File too large (${fileSizeMB.toFixed(1)}MB). Free tier limit: ${limits.maxFileSizeMB}MB` 
          };
        }
        
        // Check duration
        if (limits.maxDurationSec !== null && limits.maxDurationSec > 0 && durationSec > limits.maxDurationSec) {
          const limitMin = Math.floor(limits.maxDurationSec / 60);
          const durationMin = Math.floor(durationSec / 60);
          return { 
            allowed: false, 
            reason: `Audio too long (${durationMin}min). Free tier limit: ${limitMin}min` 
          };
        }
        
        return { allowed: true };
      },
      
      getLimits: (toolId: string): ToolUsageLimits => {
        const tier = useLicenseStore.getState().getCurrentTier();
        
        // Dev mode = unlimited
        if (useLicenseStore.getState().isDevMode) {
          return PRO_PLUS_LIMITS;
        }
        
        switch (tier) {
          case LicenseTier.PRO_PLUS:
            return PRO_PLUS_LIMITS;
          case LicenseTier.PRO:
            return PRO_TIER_LIMITS[toolId] || FREE_TIER_LIMITS[toolId] || FREE_TIER_LIMITS['trim-it'];
          case LicenseTier.FREE:
          default:
            return FREE_TIER_LIMITS[toolId] || FREE_TIER_LIMITS['trim-it'];
        }
      },
      
      resetDailyUsage: () => {
        // For testing/admin use
        set({ dailyUsage: [] });
      }
    }),
    {
      name: 'nodaw-usage',
      partialize: (state) => ({
        dailyUsage: state.dailyUsage,
        lifetimeUsage: state.lifetimeUsage
      })
    }
  )
);

// Convenience hooks
export const useCanUseTool = (toolId: string) => {
  const canUse = useUsageStore(state => state.canUse);
  return canUse(toolId);
};

export const useUsageRemaining = (toolId: string) => {
  return useUsageStore(state => state.getUsageRemaining(toolId));
};

export const useToolLimits = (toolId: string) => {
  return useUsageStore(state => state.getLimits(toolId));
};

export default useUsageStore;
