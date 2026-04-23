import { AudioGraphNode } from '../core/AudioNode';

export abstract class DSPPlugin implements AudioGraphNode {
  readonly id: string;
  readonly name: string;
  readonly type: 'time-stretch' | 'pitch' | 'granular' | 'gain';
  node!: AudioNode;

  protected constructor(
    id: string,
    name: string,
    type: 'time-stretch' | 'pitch' | 'granular' | 'gain',
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  abstract init(ctx: AudioContext): Promise<void>;

  abstract setParam(key: string, value: number): void;

  connect(target: AudioNode): void {
    this.node.connect(target);
  }

  disconnect(target?: AudioNode): void {
    if (!target) {
      this.node.disconnect();
      return;
    }
    this.node.disconnect(target);
  }

  destroy(): void {
    this.disconnect();
  }
}
