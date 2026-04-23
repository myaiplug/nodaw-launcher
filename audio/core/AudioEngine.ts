import { AudioGraph } from './AudioGraph';
import { DSPPlugin } from '../plugins/DSPPlugin';
import { TimeStretchPlugin } from '../plugins/TimeStretchPlugin';
import { PitchPlugin } from '../plugins/PitchPlugin';
import { GranularPlugin } from '../plugins/GranularPlugin';
import { GainPlugin } from '../plugins/GainPlugin';
import { SnapshotManager } from './SnapshotManager';

export type NodeType = 'time-stretch' | 'pitch' | 'granular' | 'gain';

export class AudioEngine {
  ctx: AudioContext | null = null;
  graph = new AudioGraph();
  snapshotManager = new SnapshotManager();

  masterGain: GainNode | null = null;

  private readonly nodeMap = new Map<string, DSPPlugin>();
  private readonly nodeParams = new Map<string, Record<string, number>>();

  async init(): Promise<void> {
    if (this.ctx) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
  }

  async createNode(id: string, type: NodeType): Promise<DSPPlugin> {
    if (!this.ctx) throw new Error('AudioEngine is not initialized');

    const plugin = this.instantiatePlugin(id, type);
    await plugin.init(this.ctx);

    this.nodeMap.set(id, plugin);
    this.nodeParams.set(id, this.getDefaultParams(type));
    this.graph.addNode(plugin);

    return plugin;
  }

  removeNode(id: string): void {
    this.graph.removeNode(id);
    this.nodeMap.delete(id);
    this.nodeParams.delete(id);
  }

  connect(fromId: string, toId: string): boolean {
    return this.graph.connect(fromId, toId);
  }

  disconnect(fromId: string, toId: string): void {
    this.graph.disconnect(fromId, toId);
  }

  rebuildGraphChain(): boolean {
    return this.graph.rebuildExecutionOrder();
  }

  graphHasCycle(): boolean {
    return this.graph.hasCycle();
  }

  getExecutionOrder(): string[] {
    return this.graph.getExecutionOrder();
  }

  setParam(nodeId: string, key: string, value: number): void {
    const node = this.nodeMap.get(nodeId);
    if (!node) return;

    node.setParam(key, value);

    const params = this.nodeParams.get(nodeId) ?? {};
    params[key] = value;
    this.nodeParams.set(nodeId, params);
  }

  getNode(nodeId: string): DSPPlugin | undefined {
    return this.nodeMap.get(nodeId);
  }

  getConnections(): Array<{ from: string; to: string }> {
    return this.graph.getConnections();
  }

  getConnectionLevels(): Record<string, number> {
    const t = this.ctx?.currentTime ?? performance.now() / 1000;
    const levels: Record<string, number> = {};

    this.graph.getConnections().forEach((c, index) => {
      const sourceParams = this.nodeParams.get(c.from) ?? {};
      const energy = Object.values(sourceParams).reduce((acc, v) => acc + Math.abs(v), 0);
      const normalized = Math.min(1, energy / Math.max(1, Object.keys(sourceParams).length * 2));
      const oscillation = Math.abs(Math.sin(t * (0.9 + index * 0.21)));
      const level = 0.08 + normalized * oscillation * 0.92;

      levels[`${c.from}->${c.to}`] = Number(level.toFixed(4));
    });

    return levels;
  }

  connectToMaster(nodeId: string): void {
    if (!this.masterGain) return;
    const node = this.nodeMap.get(nodeId);
    if (!node) return;
    node.connect(this.masterGain);
  }

  createSource(buffer: AudioBuffer): AudioBufferSourceNode {
    if (!this.ctx) throw new Error('AudioEngine is not initialized');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  attachSourceToNode(source: AudioNode, targetNodeId: string): void {
    const plugin = this.nodeMap.get(targetNodeId);
    if (!plugin) return;
    source.connect(plugin.node);
  }

  saveSnapshot(id: string): void {
    const params: Record<string, Record<string, number>> = {};
    for (const [nodeId, nodeParams] of this.nodeParams.entries()) {
      params[nodeId] = { ...nodeParams };
    }

    this.snapshotManager.save(id, this.graph, params);
  }

  loadSnapshot(id: string): void {
    const snapshot = this.snapshotManager.load(id);
    if (!snapshot) return;

    this.graph.restoreConnections(snapshot.connections);

    Object.entries(snapshot.params).forEach(([nodeId, params]) => {
      Object.entries(params).forEach(([key, value]) => {
        this.setParam(nodeId, key, value);
      });
    });
  }

  async renderOffline(
    sourceBuffer: AudioBuffer,
    durationSeconds: number,
    entryNodeId: string,
    exitNodeId: string,
  ): Promise<AudioBuffer> {
    if (!this.ctx) throw new Error('AudioEngine is not initialized');

    const offline = new OfflineAudioContext(
      sourceBuffer.numberOfChannels,
      Math.ceil(this.ctx.sampleRate * durationSeconds),
      this.ctx.sampleRate,
    );

    const source = offline.createBufferSource();
    source.buffer = sourceBuffer;

    // Offline bounce currently routes dry through the declared chain boundaries.
    // Dedicated offline plugin instantiation can be added in the next phase.
    const entry = this.nodeMap.get(entryNodeId);
    const exit = this.nodeMap.get(exitNodeId);

    if (!entry || !exit) {
      source.connect(offline.destination);
      source.start();
      return offline.startRendering();
    }

    const passthrough = offline.createGain();
    source.connect(passthrough);
    passthrough.connect(offline.destination);

    source.start();
    return offline.startRendering();
  }

  async resume(): Promise<void> {
    await this.ctx?.resume();
  }

  async dispose(): Promise<void> {
    this.graph.disconnectAll();

    for (const nodeId of this.nodeMap.keys()) {
      this.graph.removeNode(nodeId);
    }

    this.nodeMap.clear();
    this.nodeParams.clear();

    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }

    if (this.ctx) {
      await this.ctx.close();
      this.ctx = null;
    }
  }

  private instantiatePlugin(id: string, type: NodeType): DSPPlugin {
    switch (type) {
      case 'time-stretch':
        return new TimeStretchPlugin(id);
      case 'pitch':
        return new PitchPlugin(id);
      case 'granular':
        return new GranularPlugin(id);
      case 'gain':
      default:
        return new GainPlugin(id);
    }
  }

  private getDefaultParams(type: NodeType): Record<string, number> {
    if (type === 'time-stretch') {
      return { timeRatio: 1, pitchRatio: 1 };
    }

    if (type === 'pitch') {
      return { pitchRatio: 1, gain: 1 };
    }

    if (type === 'granular') {
      return { grainSizeMs: 80, density: 0.5, jitter: 0.1, gain: 1 };
    }

    return { gain: 1 };
  }
}
