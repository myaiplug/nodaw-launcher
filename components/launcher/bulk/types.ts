/**
 * Bulk Processing Types - NoDAW Studio Suite
 * Comprehensive type definitions for bulk upload and processing pipeline
 */

export interface BulkFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  selected: boolean;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  progress: number;
  error?: string;
  outputPath?: string;
  waveformData?: number[];
  thumbnail?: string;
}

export interface ToolPreset {
  id: string;
  name: string;
  color: string; // Hex color for visual grouping
  number: number; // Numbered preset (1-99)
  toolId: string;
  settings: Record<string, any>;
  description?: string;
}

export interface EffectChainPreset {
  id: string;
  name: string;
  color: string;
  number: number;
  toolSequence: ToolPreset[];
  description?: string;
  createdAt: number;
  lastUsed?: number;
}

export interface ProcessingJob {
  id: string;
  files: BulkFile[];
  effectChain: EffectChainPreset;
  currentFileIndex: number;
  currentToolIndex: number;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'cancelled' | 'error';
  startTime?: number;
  estimatedEndTime?: number;
  processedCount: number;
  totalOperations: number; // files * tools in chain
  currentOperation: string;
  errors: { fileId: string; toolId: string; message: string }[];
}

export interface BulkProcessingState {
  files: BulkFile[];
  selectedFiles: Set<string>;
  effectChains: EffectChainPreset[];
  activeChain: string | null;
  currentJob: ProcessingJob | null;
  isProcessing: boolean;
  isPaused: boolean;
  setItForgetItMode: boolean;
  minimizedToTray: boolean;
}

// Tool definitions for the chain builder
export type ToolId = 'trim-it' | 'split-it' | 'screw-it' | 'fx-it' | 'convert-it';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  icon: string;
  description: string;
  defaultSettings: Record<string, any>;
  settingsSchema: SettingField[];
}

export interface SettingField {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select' | 'range' | 'color';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: any; label: string }[];
}

// Progress tracking
export interface ProgressStats {
  elapsedTime: number;
  estimatedTimeRemaining: number;
  percentComplete: number;
  filesProcessed: number;
  totalFiles: number;
  currentFile: string;
  currentTool: string;
  currentOperation: string;
  operationsPerSecond: number;
  bytesProcessed: number;
  totalBytes: number;
}

// EditPix Prompt Genius types
export interface PromptRequest {
  rawIdea: string;
  mediaType: 'image' | 'video';
  style?: 'photorealistic' | 'cinematic' | 'editorial' | 'product' | 'lifestyle';
  aspect?: '1:1' | '16:9' | '9:16' | '4:3' | '3:2';
  mood?: string;
  avoidElements?: string[];
}

export interface EnhancedPrompt {
  primary: string;
  negative: string;
  technicalParams: string;
  alternateVersions: string[];
  realismScore: number;
  detectionRiskScore: number;
  tips: string[];
}

// Color presets for visual grouping
export const PRESET_COLORS = [
  '#00fff7', // Cyan
  '#ff6b6b', // Coral
  '#4ecdc4', // Teal
  '#ffe66d', // Yellow
  '#95e1d3', // Mint
  '#dda0dd', // Plum
  '#f38181', // Salmon
  '#aa96da', // Lavender
  '#fcbad3', // Pink
  '#a8d8ea', // Sky
  '#ff9a3c', // Orange
  '#38b000', // Green
];
