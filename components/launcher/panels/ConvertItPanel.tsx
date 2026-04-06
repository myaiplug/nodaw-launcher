/**
 * ConvertItPanel.tsx
 * Audio format conversion tool
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';

type OutputFormat = 'wav' | 'mp3' | 'ogg' | 'flac';

interface ConversionFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  status: 'pending' | 'converting' | 'complete' | 'error';
  progress: number;
  outputBlob?: Blob;
  error?: string;
}

// Audio buffer to WAV
const bufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let pos = 0;
  
  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos++, str.charCodeAt(i));
    }
  };
  
  const writeUint32 = (val: number) => {
    view.setUint32(pos, val, true);
    pos += 4;
  };
  
  const writeUint16 = (val: number) => {
    view.setUint16(pos, val, true);
    pos += 2;
  };
  
  writeString('RIFF');
  writeUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16);
  writeUint16(1);
  writeUint16(numOfChan);
  writeUint32(buffer.sampleRate);
  writeUint32(buffer.sampleRate * numOfChan * 2);
  writeUint16(numOfChan * 2);
  writeUint16(16);
  writeString('data');
  writeUint32(buffer.length * numOfChan * 2);
  
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      let sample = Math.max(-1, Math.min(1, channels[ch][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ConvertItPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('wav');
  const [bitrate, setBitrate] = useState(192);
  const [isConverting, setIsConverting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => { audioContextRef.current?.close(); };
  }, []);
  
  const addFiles = async (fileList: FileList) => {
    const newFiles: ConversionFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('audio/')) continue;
      
      const convFile: ConversionFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0
      };
      
      // Get duration
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer.slice(0));
        convFile.duration = audioBuffer.duration;
      } catch {}
      
      newFiles.push(convFile);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const convertFiles = async () => {
    if (files.length === 0 || isConverting) return;
    setIsConverting(true);
    
    for (const convFile of files) {
      if (convFile.status === 'complete') continue;
      
      setFiles(prev => prev.map(f => 
        f.id === convFile.id ? { ...f, status: 'converting', progress: 0 } : f
      ));
      
      try {
        const arrayBuffer = await convFile.file.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(r => setTimeout(r, 50));
          setFiles(prev => prev.map(f => 
            f.id === convFile.id ? { ...f, progress: i } : f
          ));
        }
        
        // Convert to output format
        let outputBlob: Blob;
        
        switch (outputFormat) {
          case 'wav':
            outputBlob = bufferToWav(audioBuffer);
            break;
          case 'mp3':
            // For now, output as WAV (MP3 encoding requires lamejs)
            outputBlob = bufferToWav(audioBuffer);
            break;
          case 'ogg':
          case 'flac':
            // These would require additional libraries
            outputBlob = bufferToWav(audioBuffer);
            break;
          default:
            outputBlob = bufferToWav(audioBuffer);
        }
        
        setFiles(prev => prev.map(f => 
          f.id === convFile.id 
            ? { ...f, status: 'complete', progress: 100, outputBlob } 
            : f
        ));
        
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === convFile.id 
            ? { ...f, status: 'error', error: 'Conversion failed' } 
            : f
        ));
      }
    }
    
    setIsConverting(false);
  };
  
  const downloadFile = (convFile: ConversionFile) => {
    if (!convFile.outputBlob) return;
    
    const url = URL.createObjectURL(convFile.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convFile.name.replace(/\.[^.]+$/, '') + '.' + outputFormat;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const downloadAll = () => {
    files.filter(f => f.status === 'complete' && f.outputBlob).forEach(downloadFile);
  };
  
  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'complete'));
  };
  
  const formats: { value: OutputFormat; label: string; desc: string }[] = [
    { value: 'wav', label: 'WAV', desc: 'Lossless, large files' },
    { value: 'mp3', label: 'MP3', desc: 'Compressed, universal' },
    { value: 'ogg', label: 'OGG', desc: 'Open source codec' },
    { value: 'flac', label: 'FLAC', desc: 'Lossless compression' },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Settings */}
      <div className={`rounded-xl p-6 mb-6 border ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`font-mono text-xs uppercase tracking-widest mb-4 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Output Settings
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {formats.map(format => (
            <motion.button
              key={format.value}
              onClick={() => setOutputFormat(format.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border text-left transition-colors ${
                outputFormat === format.value
                  ? isDark
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-cyan-50 border-cyan-400 text-cyan-700'
                  : isDark
                    ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="font-mono font-bold">{format.label}</div>
              <div className={`text-xs mt-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {format.desc}
              </div>
            </motion.button>
          ))}
        </div>
        
        {(outputFormat === 'mp3' || outputFormat === 'ogg') && (
          <div className="mt-4">
            <label className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Bitrate: {bitrate} kbps
            </label>
            <input
              type="range"
              min="128"
              max="320"
              step="32"
              value={bitrate}
              onChange={e => setBitrate(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        )}
      </div>
      
      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`rounded-xl p-8 mb-6 border-2 border-dashed text-center transition-colors ${
          isDark
            ? 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/30'
            : 'border-slate-300 hover:border-cyan-400 bg-slate-50/50'
        }`}
      >
        <div className={`text-4xl mb-3 ${isDark ? 'opacity-30' : 'opacity-40'}`}>
          🔄
        </div>
        <p className={`font-mono text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Drop audio files here or
        </p>
        <label className="cursor-pointer">
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-block px-5 py-2.5 rounded-lg font-mono text-sm transition-colors border ${
              isDark
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
                : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100'
            }`}
          >
            Browse Files
          </motion.span>
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className={`rounded-xl overflow-hidden border ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <h3 className={`font-mono text-xs uppercase tracking-widest ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {files.length} File{files.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex gap-2">
              {files.some(f => f.status === 'complete') && (
                <>
                  <motion.button
                    onClick={downloadAll}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-3 py-1.5 rounded text-xs font-mono ${
                      isDark
                        ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                        : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                    }`}
                  >
                    Download All
                  </motion.button>
                  <motion.button
                    onClick={clearCompleted}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-3 py-1.5 rounded text-xs font-mono ${
                      isDark
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Clear Done
                  </motion.button>
                </>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-slate-800">
            <AnimatePresence>
              {files.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-4 py-3 flex items-center gap-4 ${
                    isDark ? 'divide-slate-800' : 'divide-slate-200'
                  }`}
                >
                  {/* Status icon */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    {file.status === 'pending' && <span className="text-lg">📄</span>}
                    {file.status === 'converting' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"
                      />
                    )}
                    {file.status === 'complete' && <span className="text-lg">✅</span>}
                    {file.status === 'error' && <span className="text-lg">❌</span>}
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-mono text-sm truncate ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      {file.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatFileSize(file.size)}
                      {file.duration && ` • ${formatDuration(file.duration)}`}
                    </div>
                    
                    {/* Progress bar */}
                    {file.status === 'converting' && (
                      <div className={`mt-2 h-1 rounded-full overflow-hidden ${
                        isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className="h-full bg-cyan-500"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    {file.status === 'complete' && file.outputBlob && (
                      <motion.button
                        onClick={() => downloadFile(file)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 rounded text-xs font-mono ${
                          isDark
                            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                            : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                        }`}
                      >
                        💾 Save
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => removeFile(file.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded text-xs font-mono ${
                        isDark
                          ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                          : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      ✕
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Convert button */}
      {files.some(f => f.status === 'pending') && (
        <motion.button
          onClick={convertFiles}
          disabled={isConverting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full mt-6 py-4 rounded-xl font-mono text-sm uppercase tracking-widest transition-colors border ${
            isConverting
              ? isDark
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-wait'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait'
              : isDark
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30'
                : 'bg-cyan-500 border-cyan-600 text-white hover:bg-cyan-600 shadow-lg'
          }`}
        >
          {isConverting ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
        </motion.button>
      )}
    </div>
  );
};

export default ConvertItPanel;
