/**
 * Bulk Processing Store - NoDAW Studio Suite
 * Zustand store for managing bulk upload and processing state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  BulkFile, 
  EffectChainPreset, 
  ProcessingJob, 
  ToolPreset,
  ProgressStats,
  PRESET_COLORS 
} from './types';

interface BulkStore {
  // File management
  files: BulkFile[];
  selectedIds: Set<string>;
  
  // Effect chains
  effectChains: EffectChainPreset[];
  activeChainId: string | null;
  
  // Processing state
  currentJob: ProcessingJob | null;
  isProcessing: boolean;
  isPaused: boolean;
  setItForgetItMode: boolean;
  minimizedToTray: boolean;
  
  // Progress tracking
  progressStats: ProgressStats | null;
  
  // Actions - Files
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  removeAllFiles: () => void;
  toggleFileSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectByPattern: (pattern: string) => void;
  updateFileStatus: (id: string, status: BulkFile['status'], progress?: number, error?: string) => void;
  
  // Actions - Effect Chains
  createChain: (name: string, color?: string) => string;
  updateChain: (id: string, updates: Partial<EffectChainPreset>) => void;
  deleteChain: (id: string) => void;
  addToolToChain: (chainId: string, toolPreset: ToolPreset) => void;
  removeToolFromChain: (chainId: string, presetId: string) => void;
  reorderToolsInChain: (chainId: string, fromIndex: number, toIndex: number) => void;
  setActiveChain: (id: string | null) => void;
  duplicateChain: (id: string) => string;
  
  // Actions - Processing
  startProcessing: (chainId?: string) => void;
  pauseProcessing: () => void;
  resumeProcessing: () => void;
  cancelProcessing: () => void;
  
  // Actions - Modes
  toggleSetItForgetItMode: () => void;
  minimizeToTray: () => void;
  restoreFromTray: () => void;
  
  // Actions - Progress
  updateProgress: (stats: Partial<ProgressStats>) => void;
  
  // Computed
  getSelectedFiles: () => BulkFile[];
  getChainById: (id: string) => EffectChainPreset | undefined;
  getTotalDuration: () => number;
  getEstimatedProcessingTime: () => number;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create the store
export const useBulkStore = create<BulkStore>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      selectedIds: new Set<string>(),
      effectChains: [],
      activeChainId: null,
      currentJob: null,
      isProcessing: false,
      isPaused: false,
      setItForgetItMode: false,
      minimizedToTray: false,
      progressStats: null,
      
      // File Actions
      addFiles: (newFiles) => set((state) => {
        const bulkFiles: BulkFile[] = newFiles.map((file) => ({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          selected: true,
          status: 'pending' as const,
          progress: 0,
        }));
        
        const newSelectedIds = new Set(state.selectedIds);
        bulkFiles.forEach((f) => newSelectedIds.add(f.id));
        
        return {
          files: [...state.files, ...bulkFiles],
          selectedIds: newSelectedIds,
        };
      }),
      
      removeFile: (id) => set((state) => {
        const newSelectedIds = new Set(state.selectedIds);
        newSelectedIds.delete(id);
        return {
          files: state.files.filter((f) => f.id !== id),
          selectedIds: newSelectedIds,
        };
      }),
      
      removeAllFiles: () => set({
        files: [],
        selectedIds: new Set(),
      }),
      
      toggleFileSelection: (id) => set((state) => {
        const newSelectedIds = new Set(state.selectedIds);
        if (newSelectedIds.has(id)) {
          newSelectedIds.delete(id);
        } else {
          newSelectedIds.add(id);
        }
        return { selectedIds: newSelectedIds };
      }),
      
      selectAll: () => set((state) => ({
        selectedIds: new Set(state.files.map((f) => f.id)),
      })),
      
      deselectAll: () => set({
        selectedIds: new Set(),
      }),
      
      selectByPattern: (pattern) => set((state) => {
        const regex = new RegExp(pattern, 'i');
        const matching = state.files.filter((f) => regex.test(f.name));
        return {
          selectedIds: new Set(matching.map((f) => f.id)),
        };
      }),
      
      updateFileStatus: (id, status, progress, error) => set((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, status, progress: progress ?? f.progress, error } : f
        ),
      })),
      
      // Effect Chain Actions
      createChain: (name, color) => {
        const id = generateId();
        const existingNumbers = get().effectChains.map((c) => c.number);
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        
        const chain: EffectChainPreset = {
          id,
          name,
          color: color || PRESET_COLORS[nextNumber % PRESET_COLORS.length],
          number: nextNumber,
          toolSequence: [],
          createdAt: Date.now(),
        };
        
        set((state) => ({
          effectChains: [...state.effectChains, chain],
        }));
        
        return id;
      },
      
      updateChain: (id, updates) => set((state) => ({
        effectChains: state.effectChains.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      deleteChain: (id) => set((state) => ({
        effectChains: state.effectChains.filter((c) => c.id !== id),
        activeChainId: state.activeChainId === id ? null : state.activeChainId,
      })),
      
      addToolToChain: (chainId, toolPreset) => set((state) => ({
        effectChains: state.effectChains.map((c) =>
          c.id === chainId
            ? { ...c, toolSequence: [...c.toolSequence, toolPreset] }
            : c
        ),
      })),
      
      removeToolFromChain: (chainId, presetId) => set((state) => ({
        effectChains: state.effectChains.map((c) =>
          c.id === chainId
            ? { ...c, toolSequence: c.toolSequence.filter((t) => t.id !== presetId) }
            : c
        ),
      })),
      
      reorderToolsInChain: (chainId, fromIndex, toIndex) => set((state) => ({
        effectChains: state.effectChains.map((c) => {
          if (c.id !== chainId) return c;
          const newSequence = [...c.toolSequence];
          const [moved] = newSequence.splice(fromIndex, 1);
          newSequence.splice(toIndex, 0, moved);
          return { ...c, toolSequence: newSequence };
        }),
      })),
      
      setActiveChain: (id) => set({ activeChainId: id }),
      
      duplicateChain: (id) => {
        const original = get().effectChains.find((c) => c.id === id);
        if (!original) return '';
        
        const newId = generateId();
        const existingNumbers = get().effectChains.map((c) => c.number);
        const nextNumber = Math.max(...existingNumbers) + 1;
        
        const duplicate: EffectChainPreset = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
          number: nextNumber,
          createdAt: Date.now(),
          toolSequence: original.toolSequence.map((t) => ({
            ...t,
            id: generateId(),
          })),
        };
        
        set((state) => ({
          effectChains: [...state.effectChains, duplicate],
        }));
        
        return newId;
      },
      
      // Processing Actions
      startProcessing: (chainId) => {
        const state = get();
        const chain = chainId
          ? state.effectChains.find((c) => c.id === chainId)
          : state.activeChainId
          ? state.effectChains.find((c) => c.id === state.activeChainId)
          : null;
        
        if (!chain) return;
        
        const selectedFiles = state.files.filter((f) => state.selectedIds.has(f.id));
        if (selectedFiles.length === 0) return;
        
        const job: ProcessingJob = {
          id: generateId(),
          files: selectedFiles,
          effectChain: chain,
          currentFileIndex: 0,
          currentToolIndex: 0,
          status: 'processing',
          startTime: Date.now(),
          processedCount: 0,
          totalOperations: selectedFiles.length * chain.toolSequence.length,
          currentOperation: 'Initializing...',
          errors: [],
        };
        
        set({
          currentJob: job,
          isProcessing: true,
          isPaused: false,
          progressStats: {
            elapsedTime: 0,
            estimatedTimeRemaining: 0,
            percentComplete: 0,
            filesProcessed: 0,
            totalFiles: selectedFiles.length,
            currentFile: selectedFiles[0]?.name || '',
            currentTool: chain.toolSequence[0]?.name || '',
            currentOperation: 'Starting batch processor...',
            operationsPerSecond: 0,
            bytesProcessed: 0,
            totalBytes: selectedFiles.reduce((sum, f) => sum + f.size, 0),
          },
        });
      },
      
      pauseProcessing: () => set((state) => ({
        isPaused: true,
        currentJob: state.currentJob
          ? { ...state.currentJob, status: 'paused' }
          : null,
      })),
      
      resumeProcessing: () => set((state) => ({
        isPaused: false,
        currentJob: state.currentJob
          ? { ...state.currentJob, status: 'processing' }
          : null,
      })),
      
      cancelProcessing: () => set({
        isProcessing: false,
        isPaused: false,
        currentJob: null,
        progressStats: null,
      }),
      
      // Mode Actions
      toggleSetItForgetItMode: () => set((state) => ({
        setItForgetItMode: !state.setItForgetItMode,
      })),
      
      minimizeToTray: () => set({ minimizedToTray: true }),
      
      restoreFromTray: () => set({ minimizedToTray: false }),
      
      // Progress Actions
      updateProgress: (stats) => set((state) => ({
        progressStats: state.progressStats
          ? { ...state.progressStats, ...stats }
          : null,
      })),
      
      // Computed Getters
      getSelectedFiles: () => {
        const state = get();
        return state.files.filter((f) => state.selectedIds.has(f.id));
      },
      
      getChainById: (id) => get().effectChains.find((c) => c.id === id),
      
      getTotalDuration: () => {
        const state = get();
        return state.files.reduce((sum, f) => sum + (f.duration || 0), 0);
      },
      
      getEstimatedProcessingTime: () => {
        const state = get();
        const chain = state.activeChainId
          ? state.effectChains.find((c) => c.id === state.activeChainId)
          : null;
        if (!chain) return 0;
        
        const selectedFiles = state.files.filter((f) => state.selectedIds.has(f.id));
        const avgProcessingPerTool = 5000; // 5 seconds average per tool per file
        return selectedFiles.length * chain.toolSequence.length * avgProcessingPerTool;
      },
    }),
    {
      name: 'nodaw-bulk-storage',
      partialize: (state) => ({
        effectChains: state.effectChains,
        setItForgetItMode: state.setItForgetItMode,
      }),
    }
  )
);
