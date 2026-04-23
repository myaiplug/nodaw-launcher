export interface AudioGraphNode {
  id: string;
  name: string;
  type: 'time-stretch' | 'pitch' | 'granular' | 'gain';
  node: AudioNode;

  setParam(key: string, value: number): void;
  connect(target: AudioNode): void;
  disconnect(target?: AudioNode): void;
  destroy(): void;
}
