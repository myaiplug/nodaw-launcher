import { AudioGraph } from './AudioGraph';
import { Connection } from './Connection';

interface GraphSnapshot {
  connections: Connection[];
  params: Record<string, Record<string, number>>;
}

export class SnapshotManager {
  private readonly snapshots = new Map<string, GraphSnapshot>();

  save(id: string, graph: AudioGraph, params: Record<string, Record<string, number>>): void {
    this.snapshots.set(id, {
      connections: graph.getConnections(),
      params: JSON.parse(JSON.stringify(params)),
    });
  }

  load(id: string): GraphSnapshot | null {
    const snapshot = this.snapshots.get(id);
    return snapshot ? JSON.parse(JSON.stringify(snapshot)) : null;
  }

  list(): string[] {
    return Array.from(this.snapshots.keys());
  }
}
