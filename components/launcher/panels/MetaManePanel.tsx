/**
 * MetaManePanel.tsx
 * Lightweight metadata utility for creating and exporting track metadata sidecars.
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../themeStore';

interface TrackMeta {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  bpm: string;
  key: string;
  comment: string;
}

const emptyMeta: TrackMeta = {
  title: '',
  artist: '',
  album: '',
  genre: '',
  year: '',
  bpm: '',
  key: '',
  comment: ''
};

const sanitizeFileStem = (name: string) => {
  const stem = name.replace(/\.[^/.]+$/, '');
  return stem.replace(/[^a-zA-Z0-9_\- ]+/g, '').trim() || 'track';
};

export const MetaManePanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<TrackMeta>(emptyMeta);
  const [savedAt, setSavedAt] = useState<string>('');

  const inferredTitle = useMemo(() => {
    if (!sourceFile) return '';
    return sanitizeFileStem(sourceFile.name);
  }, [sourceFile]);

  const update = (field: keyof TrackMeta, value: string) => {
    setMeta(prev => ({ ...prev, [field]: value }));
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] || null;
    setSourceFile(nextFile);
    if (nextFile && !meta.title) {
      setMeta(prev => ({ ...prev, title: sanitizeFileStem(nextFile.name) }));
    }
  };

  const exportSidecar = () => {
    const createdAt = new Date().toISOString();
    const payload = {
      sourceFileName: sourceFile?.name || null,
      generatedBy: 'MetaMane',
      createdAt,
      metadata: {
        ...meta,
        title: meta.title || inferredTitle
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const base = sourceFile ? sanitizeFileStem(sourceFile.name) : 'track';
    anchor.href = url;
    anchor.download = `${base}.meta.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSavedAt(createdAt);
  };

  const fieldClass = isDark
    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>MetaMane</h2>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Create and export metadata sidecars for tracks, stems, and project assets.
        </p>

        <div className="mb-6">
          <label htmlFor="metamane-source-file" className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Source Audio File
          </label>
          <input
            id="metamane-source-file"
            type="file"
            accept="audio/*"
            onChange={handleFile}
            title="Choose source audio file"
            className={`w-full rounded-lg border px-3 py-2 text-sm ${fieldClass}`}
          />
          {sourceFile && (
            <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Attached: {sourceFile.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={meta.title} onChange={e => update('title', e.target.value)} placeholder="Title" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.artist} onChange={e => update('artist', e.target.value)} placeholder="Artist" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.album} onChange={e => update('album', e.target.value)} placeholder="Album" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.genre} onChange={e => update('genre', e.target.value)} placeholder="Genre" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.year} onChange={e => update('year', e.target.value)} placeholder="Year" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.bpm} onChange={e => update('bpm', e.target.value)} placeholder="BPM" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.key} onChange={e => update('key', e.target.value)} placeholder="Key" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
          <input value={meta.comment} onChange={e => update('comment', e.target.value)} placeholder="Comment" className={`rounded-lg border px-3 py-2 text-sm ${fieldClass}`} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={exportSidecar}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-sm font-semibold"
          >
            Export Metadata JSON
          </button>
          {savedAt && (
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Exported: {new Date(savedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetaManePanel;
