/**
 * themeStore.ts
 * Theme state management with Zustand and localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        // Update document class for global CSS support
        if (newTheme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark');
        } else {
          document.documentElement.classList.add('theme-dark');
          document.documentElement.classList.remove('theme-light');
        }
      },
      
      setTheme: (theme: Theme) => {
        set({ theme });
        if (theme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark');
        } else {
          document.documentElement.classList.add('theme-dark');
          document.documentElement.classList.remove('theme-light');
        }
      }
    }),
    {
      name: 'nodaw-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme class on startup
        if (state?.theme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark');
        } else {
          document.documentElement.classList.add('theme-dark');
          document.documentElement.classList.remove('theme-light');
        }
      }
    }
  )
);

// Theme-aware color utilities
export const themeColors = {
  dark: {
    bg: 'bg-slate-950',
    bgSecondary: 'bg-slate-900',
    bgTertiary: 'bg-slate-800',
    bgCard: 'bg-slate-900/80',
    bgCardHover: 'hover:bg-slate-800/90',
    text: 'text-slate-200',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    textAccent: 'text-cyan-400',
    border: 'border-slate-700/50',
    borderAccent: 'border-cyan-500/30',
    shadow: 'shadow-slate-950/50',
    gradient: 'from-slate-950 via-slate-900 to-slate-950',
  },
  light: {
    bg: 'bg-slate-50',
    bgSecondary: 'bg-white',
    bgTertiary: 'bg-slate-100',
    bgCard: 'bg-white/90',
    bgCardHover: 'hover:bg-slate-50/90',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    textAccent: 'text-cyan-600',
    border: 'border-slate-200',
    borderAccent: 'border-cyan-400/50',
    shadow: 'shadow-slate-300/50',
    gradient: 'from-slate-100 via-white to-slate-100',
  }
};

// Helper hook to get current theme colors
export const useThemeColors = () => {
  const theme = useThemeStore(state => state.theme);
  return themeColors[theme];
};
