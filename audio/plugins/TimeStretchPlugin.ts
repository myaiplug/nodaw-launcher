import { DSPPlugin } from './DSPPlugin';

export class TimeStretchPlugin extends DSPPlugin {
  private workletNode!: AudioWorkletNode;

  constructor(id: string) {
    super(id, 'Time Stretch', 'time-stretch');
  }

  async init(ctx: AudioContext): Promise<void> {
    const workletUrl = new URL('../worklets/timeStretchProcessor.js', import.meta.url);
    await ctx.audioWorklet.addModule(workletUrl.toString());

    this.workletNode = new AudioWorkletNode(ctx, 'time-stretch-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
      processorOptions: {
        blockSize: 128,
        sampleRate: ctx.sampleRate,
        wasmUrl: '/wasm/dsp.wasm',
      },
    });

    this.node = this.workletNode;
  }

  setParam(key: string, value: number): void {
    this.workletNode.port.postMessage({
      type: 'param',
      key,
      value,
    });
  }
}
