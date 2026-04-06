/**
 * useKeyboardShortcuts.ts
 * Global keyboard shortcuts hook for NoDAW launcher
 */

import { useEffect, useCallback } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: ShortcutHandler[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        shortcut.handler();
        return;
      }
    }
  }, [shortcuts, enabled, preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Preset shortcut configurations
export const LAUNCHER_SHORTCUTS = {
  TOGGLE_THEME: { key: 't', ctrl: true, description: 'Toggle dark/light theme' },
  OPEN_SETTINGS: { key: ',', ctrl: true, description: 'Open settings' },
  QUICK_SEARCH: { key: 'k', ctrl: true, description: 'Quick search' },
  ESCAPE: { key: 'Escape', description: 'Close modal / Go back' },
};

export const TOOL_SHORTCUTS = {
  PLAY_PAUSE: { key: ' ', description: 'Play/Pause' },
  STOP: { key: 's', description: 'Stop' },
  SAVE: { key: 's', ctrl: true, description: 'Save/Export' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
};

export const AB_SHORTCUTS = {
  SWITCH_A: { key: 'a', description: 'Switch to Track A' },
  SWITCH_B: { key: 'b', description: 'Switch to Track B' },
  TOGGLE: { key: 'Tab', description: 'Toggle between A/B' },
};

export default useKeyboardShortcuts;
