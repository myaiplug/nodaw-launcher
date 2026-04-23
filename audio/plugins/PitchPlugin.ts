import { DSPPlugin } from './DSPPlugin';

export class PitchPlugin extends DSPPlugin {
  private gainNode!: GainNode;
  private pitchRatio = 1;

  constructor(id: string) {
    super(id, 'Pitch Shift', 'pitch');
  }

  async init(ctx: AudioContext): Promise<void> {
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 1;
    this.node = this.gainNode;
  }

  setParam(key: string, value: number): void {
    if (key === 'pitchRatio') {
      this.pitchRatio = Math.max(0.25, Math.min(4, value));
    }

    if (key === 'gain') {
      this.gainNode.gain.setValueAtTime(value, this.gainNode.context.currentTime);
    }
  }

  getPitchRatio(): number {
    return this.pitchRatio;
  }
}
