
export enum AppTab {
  CONVERT = 'Convert',
  TRIM = 'Trim',
  COMPARE = 'A/B Compare',
  EFFECTS = 'One-Click Effects',
  MULTITRACK = 'Multi-Track Grid'
}

export interface AppliedEffect {
  workflowId: string;
  params: Record<string, number>;
}

export interface AudioTrack {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  data: number[]; // Normalized samples for visualization
  color?: string;
  buffer?: AudioBuffer | null;
  effects?: AppliedEffect[];
}

export interface EffectParameter {
  id: string;
  name: string;
  defaultValue: number;
  min: number;
  max: number;
  unit?: string;
}

export interface EffectWorkflow {
  id: string;
  title: string;
  category: 'Instrumental' | 'Vocals' | 'Both' | 'Mastering';
  description: string;
  icon: string;
  defaultParams?: EffectParameter[];
}
