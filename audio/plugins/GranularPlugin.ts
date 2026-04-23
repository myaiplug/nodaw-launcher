import { DSPPlugin } from './DSPPlugin';

export class GranularPlugin extends DSPPlugin {
  private gainNode!: GainNode;
  private grainSizeMs = 80;
  private density = 0.5;
  private jitter = 0.1;

  constructor(id: string) {
    super(id, 'Granular', 'granular');
  }

  async init(ctx: AudioContext): Promise<void> {
    this.gainNode = ctx.createGain();
    this.node = this.gainNode;
  }

  setParam(key: string, value: number): void {
    if (key === 'grainSizeMs') this.grainSizeMs = Math.max(20, Math.min(200, value));
    if (key === 'density') this.density = Math.max(0, Math.min(1, value));
    if (key === 'jitter') this.jitter = Math.max(0, Math.min(1, value));
    if (key === 'gain') this.gainNode.gain.setValueAtTime(value, this.gainNode.context.currentTime);
  }

  getState(): { grainSizeMs: number; density: number; jitter: number } {
    return {
      grainSizeMs: this.grainSizeMs,
      density: this.density,
      jitter: this.jitter,
    };
  }
}
