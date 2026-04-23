import { DSPPlugin } from './DSPPlugin';

export class GainPlugin extends DSPPlugin {
  private gainNode!: GainNode;

  constructor(id: string) {
    super(id, 'Gain', 'gain');
  }

  async init(ctx: AudioContext): Promise<void> {
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 1;
    this.node = this.gainNode;
  }

  setParam(key: string, value: number): void {
    if (key !== 'gain') return;
    this.gainNode.gain.setValueAtTime(value, this.gainNode.context.currentTime);
  }
}
