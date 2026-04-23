/**
 * BulkUploadManager - NoDAW Studio Suite
 * Main component for bulk file upload and selection
 * Awwwards-quality design with sophisticated interactions
 */

import React, { useCallback, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBulkStore } from './bulkStore';
import { BulkFile } from './types';
import { useThemeStore } from '../themeStore';

interface BulkUploadManagerProps {
  onProceed: (files: BulkFile[]) => void;
  onClose: () => void;
  targetTool?: string;
}

const BulkUploadManager: React.FC<BulkUploadManagerProps> = ({
  onProceed,
  onClose,
  targetTool,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const {
    files,
    selectedIds,
    addFiles,
    removeFile,
    removeAllFiles,
    toggleFileSelection,
    selectAll,
    deselectAll,
    getSelectedFiles,
  } = useBulkStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filtered and sorted files
  const displayedFiles = useMemo(() => {
    let result = [...files];
    
    // Filter
    if (filterText) {
      const regex = new RegExp(filterText, 'i');
      result = result.filter((f) => regex.test(f.name));
    }
    
    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'size') cmp = a.size - b.size;
      else if (sortBy === 'date') cmp = a.file.lastModified - b.file.lastModified;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return result;
  }, [files, filterText, sortBy, sortDir]);
  
  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('audio/')
      );
      
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );
  
  // Handle folder selection
  const handleFolderSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;
      
      const audioFiles = Array.from(fileList).filter(
        (file) =>
          file.type.startsWith('audio/') ||
          /\.(mp3|wav|ogg|flac|m4a|aac|wma|aiff)$/i.test(file.name)
      );
      
      if (audioFiles.length > 0) {
        addFiles(audioFiles);
      }
    },
    [addFiles]
  );
  
  // Stats
  const totalSize = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files]
  );
  const selectedCount = selectedIds.size;
  const selectedSize = useMemo(
    () =>
      files
        .filter((f) => selectedIds.has(f.id))
        .reduce((sum, f) => sum + f.size, 0),
    [files, selectedIds]
  );
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative w-[95vw] max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50'
            : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700/50' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Bulk Upload Manager
              </h2>
              <p
                className={`text-sm mt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {targetTool
                  ? `Load files for ${targetTool}`
                  : 'Load audio files for batch processing'}
              </p>
            </div>
            
            {/* Stats badges */}
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                  isDark
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                }`}
              >
                {files.length} files • {formatSize(totalSize)}
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {selectedCount} selected • {formatSize(selectedSize)}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div
          className={`px-6 py-3 border-b flex items-center gap-4 ${
            isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          {/* Hidden file input for folder selection */}
          <input
            ref={inputRef}
            type="file"
            // @ts-ignore - webkitdirectory is a non-standard attribute
            webkitdirectory=""
            multiple
            accept="audio/*"
            onChange={handleFolderSelect}
            className="hidden"
          />
          
          {/* Add Folder button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => inputRef.current?.click()}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              isDark
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Add Folder
          </motion.button>
          
          {/* Selection controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              Deselect All
            </button>
            <button
              onClick={removeAllFiles}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}
            >
              Remove All
            </button>
          </div>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter files..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className={`w-48 px-3 py-1.5 pr-8 rounded-lg text-sm ${
                isDark
                  ? 'bg-slate-800/50 text-white border border-slate-600/50 placeholder:text-slate-500 focus:border-cyan-500/50'
                  : 'bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 focus:border-cyan-500'
              } outline-none transition-colors`}
            />
            <svg
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Sort */}
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split('-') as ['name' | 'size' | 'date', 'asc' | 'desc'];
              setSortBy(by);
              setSortDir(dir);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDark
                ? 'bg-slate-800/50 text-slate-300 border border-slate-600/50'
                : 'bg-white text-slate-600 border border-slate-300'
            } outline-none`}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-asc">Size ↑</option>
            <option value="size-desc">Size ↓</option>
            <option value="date-asc">Date ↑</option>
            <option value="date-desc">Date ↓</option>
          </select>
        </div>
        
        {/* File Grid / Drop Zone */}
        <div
          className={`relative overflow-auto p-4 ${
            files.length === 0 ? 'h-80' : 'max-h-[50vh]'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-4 rounded-xl border-2 border-dashed flex items-center justify-center z-10 ${
                  isDark
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-cyan-50 border-cyan-400'
                }`}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <svg
                      className={`w-16 h-16 mx-auto ${
                        isDark ? 'text-cyan-400' : 'text-cyan-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </motion.div>
                  <p
                    className={`mt-4 text-lg font-medium ${
                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                    }`}
                  >
                    Drop audio files here
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    or entire folders
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Empty state */}
          {files.length === 0 && !isDragging && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                  }`}
                >
                  <svg
                    className={`w-10 h-10 ${
                      isDark ? 'text-slate-600' : 'text-slate-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p
                  className={`mt-4 font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  No files loaded
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Drag & drop audio files or click "Add Folder"
                </p>
                <p
                  className={`text-xs mt-2 ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Supports MP3, WAV, FLAC, OGG, M4A, AAC, AIFF
                </p>
              </div>
            </div>
          )}
          
          {/* File grid */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>
                {displayedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`relative p-3 rounded-xl cursor-pointer transition-all group ${
                      selectedIds.has(file.id)
                        ? isDark
                          ? 'bg-cyan-500/15 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : 'bg-cyan-50 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : isDark
                        ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        selectedIds.has(file.id)
                          ? isDark
                            ? 'bg-cyan-500 text-slate-900'
                            : 'bg-cyan-500 text-white'
                          : isDark
                          ? 'bg-slate-700 group-hover:bg-slate-600'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    >
                      {selectedIds.has(file.id) && (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-100 text-red-500 hover:bg-red-200'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* File icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                        isDark ? 'bg-slate-700/50' : 'bg-slate-100'
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          selectedIds.has(file.id)
                            ? isDark
                              ? 'text-cyan-400'
                              : 'text-cyan-500'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    
                    {/* File name */}
                    <p
                      className={`text-sm font-medium truncate pr-6 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    
                    {/* File meta */}
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {formatSize(file.size)}
                      </span>
                      {file.duration && (
                        <>
                          <span
                            className={`text-xs ${
                              isDark ? 'text-slate-600' : 'text-slate-300'
                            }`}
                          >
                            •
                          </span>
                          <span
                            className={`text-xs ${
                              isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {formatDuration(file.duration)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Status indicator */}
                    {file.status !== 'pending' && (
                      <div className="absolute bottom-2 right-2">
                        {file.status === 'processing' && (
                          <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        )}
                        {file.status === 'completed' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div
            className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {selectedCount > 0
              ? `${selectedCount} file${selectedCount !== 1 ? 's' : ''} selected for processing`
              : 'Select files to proceed'}
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isDark
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProceed(getSelectedFiles())}
              disabled={selectedCount === 0}
              className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                selectedCount > 0
                  ? isDark
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                  : isDark
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Proceed with {selectedCount} file{selectedCount !== 1 ? 's' : ''}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BulkUploadManager;
