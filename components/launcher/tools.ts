/**
 * tools.ts
 * Tool definitions for the NoDAW launcher
 */

export type ToolTier = 'free' | 'pro' | 'pro_plus';
export type ToolStatus = 'ready' | 'beta' | 'coming-soon';

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  tier: ToolTier;
  status: ToolStatus;
  route?: string;  // Internal navigation route
}

export const TOOLS: Tool[] = [
  {
    id: 'split-it',
    name: 'SplitIt',
    tagline: 'AI Stem Separation',
    description: 'Extract vocals, drums, bass & more using deep learning',
    icon: '🎵',
    tier: 'pro',
    status: 'ready',
    route: '/split-it'
  },
  {
    id: 'screw-it',
    name: 'ScrewIt',
    tagline: 'Pitch & Tempo Warp',
    description: 'Slow, chop & manipulate audio with precision',
    icon: '🔩',
    tier: 'pro',
    status: 'ready',
    route: '/screw-it'
  },
  {
    id: 'trim-it',
    name: 'TrimIt',
    tagline: 'Precision Trimming',
    description: 'Cut, split & export audio with waveform accuracy',
    icon: '✂️',
    tier: 'free',
    status: 'ready',
    route: '/trim-it'
  },
  {
    id: 'convert-it',
    name: 'ConvertIt',
    tagline: 'Format Converter',
    description: 'Convert between MP3, WAV, FLAC, OGG & more',
    icon: '🔄',
    tier: 'free',
    status: 'ready',
    route: '/convert-it'
  },
  {
    id: 'fx-it',
    name: 'FXit',
    tagline: 'One-Click Effects',
    description: 'Pro effect chains applied in a single click',
    icon: '✨',
    tier: 'pro',
    status: 'ready',
    route: '/fx-it'
  },
  {
    id: 'test-it',
    name: 'TestIt',
    tagline: 'A/B Comparison',
    description: 'Compare before/after with instant switching',
    icon: '🔀',
    tier: 'free',
    status: 'ready',
    route: '/test-it'
  },
  {
    id: 'workstation',
    name: 'NoDAW Workstation',
    tagline: 'Multitrack DAW',
    description: 'Full-featured mixing & rendering workstation',
    icon: '🎛️',
    tier: 'pro_plus',
    status: 'beta',
    route: '/workstation'
  }
];

// Get tools by tier
export const getToolsByTier = (tier: ToolTier): Tool[] => {
  return TOOLS.filter(tool => tool.tier === tier);
};

// Get tool by ID
export const getToolById = (id: string): Tool | undefined => {
  return TOOLS.find(tool => tool.id === id);
};

// Free tools
export const FREE_TOOLS = TOOLS.filter(t => t.tier === 'free');

// Pro tools (includes free)
export const PRO_TOOLS = TOOLS.filter(t => t.tier === 'free' || t.tier === 'pro');

// Pro+ tools (all)
export const PRO_PLUS_TOOLS = TOOLS;

export default TOOLS;
