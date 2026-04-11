/**
 * useDevModeShortcut.ts
 * Secret keyboard shortcut to toggle dev mode
 * Type 'devmode' quickly (within 2 seconds) to toggle
 */

import { useEffect, useRef } from 'react';
import { useLicenseStore } from '../licenseStore';

const SECRET_SEQUENCE = 'devmode';
const TIMEOUT_MS = 2000;
const DEV_SECRET = 'nodaw-dev-2026';

export const useDevModeShortcut = () => {
  const bufferRef = useRef('');
  const timeoutRef = useRef<number | null>(null);
  const toggleDevMode = useLicenseStore(state => state.toggleDevMode);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track regular letter keys
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Skip if typing in input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      // Add to buffer
      bufferRef.current += e.key.toLowerCase();
      
      // Clear previous timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout to reset buffer
      timeoutRef.current = window.setTimeout(() => {
        bufferRef.current = '';
      }, TIMEOUT_MS);
      
      // Check if buffer ends with secret sequence
      if (bufferRef.current.endsWith(SECRET_SEQUENCE)) {
        toggleDevMode(DEV_SECRET);
        bufferRef.current = '';
        
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [toggleDevMode]);
};

export default useDevModeShortcut;
