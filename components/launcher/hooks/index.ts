/**
 * Hooks index
 * Central export for all custom hooks
 */

export { useKeyboardShortcuts, LAUNCHER_SHORTCUTS, TOOL_SHORTCUTS, AB_SHORTCUTS } from './useKeyboardShortcuts';
export { useFileDrop, useGlobalFileDrop } from './useFileDrop';
export { useElectron, type ElectronAPI } from './useElectron';
export { useAudioFeedback, getGlobalAudioFeedback } from './useAudioFeedback';
