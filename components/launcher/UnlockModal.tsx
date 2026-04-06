import React, { useState, useRef, useEffect } from 'react';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  onUnlock?: (key: string) => Promise<boolean>;
  error?: string;
}

const UnlockModal: React.FC<UnlockModalProps> = ({ open, onClose, onUnlock, error }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and autofocus
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          // Trap focus inside modal
          const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'input,button,[tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  const handleUnlock = async () => {
    setLoading(true);
    if (onUnlock) {
      const ok = await onUnlock(key);
      if (!ok) {
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlockModalTitle"
      ref={modalRef}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <h2 id="unlockModalTitle" className="text-2xl font-bold mb-4 text-center text-gray-900">
          Unlock Feature
        </h2>
        <label htmlFor="licenseInput" className="block mb-2 text-gray-700 font-semibold">
          Enter License Key
        </label>
        <input
          id="licenseInput"
          ref={inputRef}
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="XXXX-XXXX-XXXX"
          aria-label="License key"
          value={key}
          onChange={e => setKey(e.target.value)}
          disabled={loading}
          onKeyDown={e => {
            if (e.key === 'Enter') handleUnlock();
          }}
        />
        {error && (
          <div className="text-red-600 mb-2" role="alert">
            {error}
          </div>
        )}
        <div className="flex gap-4 justify-center mt-2">
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleUnlock}
            aria-label="Unlock"
            disabled={loading || !key}
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-bold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={onClose}
            aria-label="Cancel unlock"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockModal;
