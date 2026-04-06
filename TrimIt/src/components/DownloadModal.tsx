import React, { useState, useEffect } from 'react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, format: 'wav' | 'mp3', bitrate: number) => void;
  originalFileName: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onConfirm, originalFileName }) => {
  const [filename, setFilename] = useState('');
  const [format, setFormat] = useState<'wav' | 'mp3'>('wav');
  const [bitrate, setBitrate] = useState(128); // For MP3
  
  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      const parts = originalFileName.split('.');
      let ext = 'wav';
      if (parts.length > 1) {
          const originalExt = parts.pop()?.toLowerCase();
          if (originalExt === 'mp3') ext = 'mp3';
      }
      const baseName = parts.join('.') || 'audio';
      
      setFilename(`${baseName}_Trimmed`);
      setFormat(ext as 'wav' | 'mp3');
    }
  }, [isOpen, originalFileName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(filename, format, bitrate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#222] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <h2 className="text-xl font-bold text-cyan-400 mb-6 tracking-wide border-b border-[#222] pb-2">
            EXPORT SETTINGS
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Filename */}
            <div className="space-y-2">
                <label className="text-xs text-gray-500 font-mono uppercase">Filename</label>
                <input 
                    type="text" 
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-gray-200 px-3 py-2 focus:border-cyan-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder="Enter filename"
                    autoFocus
                />
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
                <label className="text-xs text-gray-500 font-mono uppercase">Format</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`
                        cursor-pointer border px-4 py-3 flex items-center justify-center gap-2 transition-all
                        ${format === 'wav' ? 'border-cyan-500 bg-cyan-900/10 text-cyan-400' : 'border-[#333] bg-[#111] text-gray-500 hover:border-[#444]'}
                    `}>
                        <input type="radio" value="wav" checked={format === 'wav'} onChange={() => setFormat('wav')} className="hidden" />
                        <span className="font-bold">WAV</span>
                    </label>
                    <label className={`
                        cursor-pointer border px-4 py-3 flex items-center justify-center gap-2 transition-all
                        ${format === 'mp3' ? 'border-cyan-500 bg-cyan-900/10 text-cyan-400' : 'border-[#333] bg-[#111] text-gray-500 hover:border-[#444]'}
                    `}>
                        <input type="radio" value="mp3" checked={format === 'mp3'} onChange={() => setFormat('mp3')} className="hidden" />
                        <span className="font-bold">MP3</span>
                    </label>
                </div>
            </div>

            {/* Quality (Only for MP3) */}
            {format === 'mp3' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-xs text-gray-500 font-mono uppercase">Quality (Bitrate)</label>
                    <select 
                        value={bitrate} 
                        onChange={(e) => setBitrate(Number(e.target.value))}
                        className="w-full bg-[#111] border border-[#333] text-gray-200 px-3 py-2 focus:border-cyan-500 focus:outline-none appearance-none font-mono text-sm"
                        aria-label="Quality Bitrate"
                    >
                        <option value="320">320 kbps (High)</option>
                        <option value="256">256 kbps</option>
                        <option value="192">192 kbps (Standard)</option>
                        <option value="128">128 kbps</option>
                        <option value="64">64 kbps (Low)</option>
                    </select>
                </div>
            )}
            
            {/* Info */}
            <div className="text-[10px] text-gray-600 font-mono pt-2">
                {format === 'wav' 
                    ? 'Lossless uncompressed audio. Best quality, larger file size.' 
                    : 'Compressed audio. Good quality, smaller file size.'}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-mono uppercase text-gray-500 hover:text-gray-300 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-6 py-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 text-xs font-mono uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                    Download
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default DownloadModal;
