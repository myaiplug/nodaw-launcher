/**
 * EffectChainBuilder - NoDAW Studio Suite
 * Create numbered and colored effect chain presets
 * Drag-and-drop tool sequencing with per-tool variable settings
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useBulkStore } from './bulkStore';
import { ToolPreset, EffectChainPreset, PRESET_COLORS, ToolId } from './types';
import { useThemeStore } from '../themeStore';

// Available tools for the chain
const AVAILABLE_TOOLS: Array<{
  id: ToolId;
  name: string;
  icon: string;
  description: string;
  defaultSettings: Record<string, any>;
}> = [
  {
    id: 'trim-it',
    name: 'TrimIt',
    icon: '✂️',
    description: 'Trim audio start/end, fade in/out',
    defaultSettings: { trimStart: 0, trimEnd: 0, fadeIn: 0, fadeOut: 0 },
  },
  {
    id: 'split-it',
    name: 'SplitIt',
    icon: '🎛️',
    description: 'Stem separation (vocals, drums, bass, etc)',
    defaultSettings: { stems: ['vocals', 'drums', 'bass', 'other'], model: 'htdemucs' },
  },
  {
    id: 'screw-it',
    name: 'ScrewIt',
    icon: '🔊',
    description: 'Chopped & screwed, pitch, tempo',
    defaultSettings: { pitch: -3, tempo: 0.8, chop: false, reverb: 0.2 },
  },
  {
    id: 'fx-it',
    name: 'FXit',
    icon: '✨',
    description: 'Audio effects processing',
    defaultSettings: { reverb: 0, delay: 0, distortion: 0, filter: 'none' },
  },
  {
    id: 'convert-it',
    name: 'ConvertIt',
    icon: '📦',
    description: 'Convert to MP3, WAV, FLAC, etc',
    defaultSettings: { format: 'mp3', quality: 320, normalize: true },
  },
];

interface EffectChainBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProcessing: (chainId: string) => void;
}

const EffectChainBuilder: React.FC<EffectChainBuilderProps> = ({
  isOpen,
  onClose,
  onStartProcessing,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const {
    effectChains,
    activeChainId,
    createChain,
    updateChain,
    deleteChain,
    addToolToChain,
    removeToolFromChain,
    reorderToolsInChain,
    setActiveChain,
    duplicateChain,
    setItForgetItMode,
    toggleSetItForgetItMode,
  } = useBulkStore();
  
  const [editingChainId, setEditingChainId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  
  const activeChain = effectChains.find((c) => c.id === activeChainId);
  
  // Create new chain
  const handleCreateChain = useCallback(() => {
    const id = createChain('New Effect Chain', selectedColor);
    setActiveChain(id);
    setEditingChainId(id);
    setEditingName('New Effect Chain');
  }, [createChain, selectedColor, setActiveChain]);
  
  // Add tool to active chain
  const handleAddTool = useCallback(
    (tool: typeof AVAILABLE_TOOLS[0]) => {
      if (!activeChainId) return;
      
      const preset: ToolPreset = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: tool.name,
        color: activeChain?.color || PRESET_COLORS[0],
        number: (activeChain?.toolSequence.length || 0) + 1,
        toolId: tool.id,
        settings: { ...tool.defaultSettings },
      };
      
      addToolToChain(activeChainId, preset);
    },
    [activeChainId, activeChain, addToolToChain]
  );
  
  // Save chain name
  const handleSaveName = useCallback(() => {
    if (editingChainId && editingName.trim()) {
      updateChain(editingChainId, { name: editingName.trim() });
    }
    setEditingChainId(null);
  }, [editingChainId, editingName, updateChain]);
  
  if (!isOpen) return null;
  
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
        className={`relative w-[95vw] max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50'
            : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-700/50' : 'border-slate-200'
          }`}
        >
          <div>
            <h2
              className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Effect Chain Builder
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Create numbered preset chains to process files through multiple tools
            </p>
          </div>
          
          {/* Set It & Forget It Toggle */}
          <div className="flex items-center gap-4">
            <label
              className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-colors ${
                setItForgetItMode
                  ? isDark
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-purple-100 border border-purple-300'
                  : isDark
                  ? 'bg-slate-800/50 border border-slate-700'
                  : 'bg-slate-100 border border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={setItForgetItMode}
                onChange={toggleSetItForgetItMode}
                className="sr-only"
              />
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  setItForgetItMode
                    ? 'bg-purple-500'
                    : isDark
                    ? 'bg-slate-600'
                    : 'bg-slate-300'
                }`}
              >
                <motion.div
                  animate={{ x: setItForgetItMode ? 20 : 0 }}
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  setItForgetItMode
                    ? isDark
                      ? 'text-purple-400'
                      : 'text-purple-600'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                Set It & Forget It Mode
              </span>
            </label>
            
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
        
        {/* Main content - 3 column layout */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Left: Chain list */}
          <div
            className={`w-64 border-r overflow-auto ${
              isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="p-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateChain}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Effect Chain
              </motion.button>
            </div>
            
            {/* Chain list */}
            <div className="px-3 pb-4 space-y-2">
              {effectChains.map((chain) => (
                <motion.div
                  key={chain.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setActiveChain(chain.id)}
                  className={`relative p-3 rounded-xl cursor-pointer transition-all ${
                    activeChainId === chain.id
                      ? isDark
                        ? 'bg-slate-700/70 border-2 shadow-lg'
                        : 'bg-white border-2 shadow-lg'
                      : isDark
                      ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'
                      : 'bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                  style={{
                    borderColor: activeChainId === chain.id ? chain.color : undefined,
                  }}
                >
                  {/* Color indicator */}
                  <div
                    className="absolute top-3 left-3 w-3 h-3 rounded-full"
                    style={{ backgroundColor: chain.color }}
                  />
                  
                  {/* Number badge */}
                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {chain.number}
                  </div>
                  
                  {/* Chain info */}
                  <div className="ml-5 pr-8">
                    {editingChainId === chain.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className={`w-full px-2 py-1 text-sm rounded ${
                          isDark
                            ? 'bg-slate-900 text-white border border-cyan-500'
                            : 'bg-white text-slate-900 border border-cyan-500'
                        }`}
                      />
                    ) : (
                      <p
                        className={`text-sm font-medium truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                        onDoubleClick={() => {
                          setEditingChainId(chain.id);
                          setEditingName(chain.name);
                        }}
                      >
                        {chain.name}
                      </p>
                    )}
                    <p
                      className={`text-xs mt-0.5 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {chain.toolSequence.length} tool{chain.toolSequence.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  {activeChainId === chain.id && (
                    <div className="flex items-center gap-1 mt-2 ml-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateChain(chain.id);
                        }}
                        className={`p-1 rounded text-xs ${
                          isDark
                            ? 'hover:bg-slate-600 text-slate-400'
                            : 'hover:bg-slate-200 text-slate-500'
                        }`}
                        title="Duplicate"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this effect chain?')) {
                            deleteChain(chain.id);
                          }
                        }}
                        className={`p-1 rounded text-xs ${
                          isDark
                            ? 'hover:bg-red-500/20 text-red-400'
                            : 'hover:bg-red-100 text-red-500'
                        }`}
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {effectChains.length === 0 && (
                <div
                  className={`text-center py-8 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <p className="text-sm">No effect chains yet</p>
                  <p className="text-xs mt-1">Create one to get started</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Middle: Chain builder */}
          <div className="flex-1 overflow-auto p-6">
            {activeChain ? (
              <div>
                {/* Chain header */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="relative"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: activeChain.color }}
                    />
                    {showColorPicker && (
                      <div
                        className={`absolute top-full left-0 mt-2 p-2 rounded-xl shadow-xl z-10 ${
                          isDark ? 'bg-slate-800' : 'bg-white'
                        }`}
                      >
                        <div className="grid grid-cols-4 gap-2">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                updateChain(activeChain.id, { color });
                                setShowColorPicker(false);
                              }}
                              className={`w-6 h-6 rounded-md ${
                                activeChain.color === color ? 'ring-2 ring-white ring-offset-2' : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {activeChain.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Preset #{activeChain.number}
                    </p>
                  </div>
                </div>
                
                {/* Tool sequence */}
                <div className="space-y-3">
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Tool Sequence (drag to reorder)
                  </p>
                  
                  {activeChain.toolSequence.length > 0 ? (
                    <Reorder.Group
                      axis="y"
                      values={activeChain.toolSequence}
                      onReorder={(newOrder) => {
                        // Update the chain with new order
                        newOrder.forEach((preset, index) => {
                          const fromIndex = activeChain.toolSequence.findIndex(
                            (t) => t.id === preset.id
                          );
                          if (fromIndex !== index) {
                            reorderToolsInChain(activeChain.id, fromIndex, index);
                          }
                        });
                      }}
                      className="space-y-2"
                    >
                      {activeChain.toolSequence.map((preset, index) => (
                        <Reorder.Item
                          key={preset.id}
                          value={preset}
                          className={`p-4 rounded-xl cursor-grab active:cursor-grabbing ${
                            isDark
                              ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'
                              : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Step number */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                            
                            {/* Tool icon */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                                isDark ? 'bg-slate-700/50' : 'bg-slate-100'
                              }`}
                            >
                              {AVAILABLE_TOOLS.find((t) => t.id === preset.toolId)?.icon}
                            </div>
                            
                            {/* Tool info */}
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {preset.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  isDark ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              >
                                {Object.entries(preset.settings)
                                  .slice(0, 3)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <button
                              onClick={() =>
                                setExpandedToolId(
                                  expandedToolId === preset.id ? null : preset.id
                                )
                              }
                              className={`p-2 rounded-lg ${
                                isDark
                                  ? 'hover:bg-slate-600 text-slate-400'
                                  : 'hover:bg-slate-200 text-slate-500'
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  expandedToolId === preset.id ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeToolFromChain(activeChain.id, preset.id)}
                              className={`p-2 rounded-lg ${
                                isDark
                                  ? 'hover:bg-red-500/20 text-red-400'
                                  : 'hover:bg-red-100 text-red-500'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Expanded settings */}
                          <AnimatePresence>
                            {expandedToolId === preset.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className={`mt-4 pt-4 border-t grid grid-cols-2 gap-4 ${
                                    isDark ? 'border-slate-700' : 'border-slate-200'
                                  }`}
                                >
                                  {Object.entries(preset.settings).map(([key, value]) => (
                                    <div key={key}>
                                      <label
                                        className={`text-xs font-medium uppercase tracking-wider block mb-1 ${
                                          isDark ? 'text-slate-500' : 'text-slate-400'
                                        }`}
                                      >
                                        {key}
                                      </label>
                                      {typeof value === 'boolean' ? (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => {
                                              const newSequence = activeChain.toolSequence.map((t) =>
                                                t.id === preset.id
                                                  ? {
                                                      ...t,
                                                      settings: {
                                                        ...t.settings,
                                                        [key]: e.target.checked,
                                                      },
                                                    }
                                                  : t
                                              );
                                              updateChain(activeChain.id, {
                                                toolSequence: newSequence,
                                              });
                                            }}
                                            className="w-4 h-4 rounded"
                                          />
                                          <span
                                            className={`text-sm ${
                                              isDark ? 'text-slate-300' : 'text-slate-600'
                                            }`}
                                          >
                                            {value ? 'Enabled' : 'Disabled'}
                                          </span>
                                        </label>
                                      ) : typeof value === 'number' ? (
                                        <input
                                          type="number"
                                          value={value}
                                          onChange={(e) => {
                                            const newSequence = activeChain.toolSequence.map((t) =>
                                              t.id === preset.id
                                                ? {
                                                    ...t,
                                                    settings: {
                                                      ...t.settings,
                                                      [key]: parseFloat(e.target.value),
                                                    },
                                                  }
                                                : t
                                            );
                                            updateChain(activeChain.id, {
                                              toolSequence: newSequence,
                                            });
                                          }}
                                          className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                                            isDark
                                              ? 'bg-slate-900 text-white border border-slate-600'
                                              : 'bg-white text-slate-900 border border-slate-300'
                                          }`}
                                        />
                                      ) : Array.isArray(value) ? (
                                        <p
                                          className={`text-sm ${
                                            isDark ? 'text-slate-300' : 'text-slate-600'
                                          }`}
                                        >
                                          {value.join(', ')}
                                        </p>
                                      ) : (
                                        <input
                                          type="text"
                                          value={value as string}
                                          onChange={(e) => {
                                            const newSequence = activeChain.toolSequence.map((t) =>
                                              t.id === preset.id
                                                ? {
                                                    ...t,
                                                    settings: {
                                                      ...t.settings,
                                                      [key]: e.target.value,
                                                    },
                                                  }
                                                : t
                                            );
                                            updateChain(activeChain.id, {
                                              toolSequence: newSequence,
                                            });
                                          }}
                                          className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                                            isDark
                                              ? 'bg-slate-900 text-white border border-slate-600'
                                              : 'bg-white text-slate-900 border border-slate-300'
                                          }`}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  ) : (
                    <div
                      className={`text-center py-12 rounded-xl border-2 border-dashed ${
                        isDark
                          ? 'border-slate-700 text-slate-500'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      <p>No tools in this chain yet</p>
                      <p className="text-sm mt-1">Add tools from the right panel</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`flex items-center justify-center h-full ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto opacity-30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-4">Select or create an effect chain</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right: Available tools */}
          <div
            className={`w-80 border-l overflow-auto ${
              isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div
              className={`px-4 py-3 border-b ${
                isDark ? 'border-slate-700/50' : 'border-slate-200'
              }`}
            >
              <h3
                className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Available Tools
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Click to add to chain
              </p>
            </div>
            
            <div className="p-3 space-y-2">
              {AVAILABLE_TOOLS.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddTool(tool)}
                  disabled={!activeChainId}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    activeChainId
                      ? isDark
                        ? 'bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 hover:border-cyan-500/30'
                        : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-300 shadow-sm'
                      : isDark
                      ? 'bg-slate-800/30 border border-slate-700/30 opacity-50 cursor-not-allowed'
                      : 'bg-slate-100 border border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        isDark ? 'bg-slate-700/50' : 'bg-slate-100'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {tool.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div
            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {activeChain
              ? `${activeChain.toolSequence.length} tool${
                  activeChain.toolSequence.length !== 1 ? 's' : ''
                } in "${activeChain.name}"`
              : 'Select a chain to configure'}
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
              onClick={() => activeChainId && onStartProcessing(activeChainId)}
              disabled={!activeChain || activeChain.toolSequence.length === 0}
              className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                activeChain && activeChain.toolSequence.length > 0
                  ? isDark
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                  : isDark
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Start Processing</span>
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

export default EffectChainBuilder;
