import { AudioGraphNode } from './AudioNode';
import { Connection } from './Connection';

export class AudioGraph {
  private readonly nodes = new Map<string, AudioGraphNode>();
  private connections: Connection[] = [];
  private executionOrder: string[] = [];
  private cycleDetected = false;

  addNode(node: AudioGraphNode): void {
    this.nodes.set(node.id, node);
  }

  getNode(id: string): AudioGraphNode | undefined {
    return this.nodes.get(id);
  }

  getNodes(): AudioGraphNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    node.disconnect();
    node.destroy();
    this.nodes.delete(id);

    this.connections = this.connections.filter((c) => c.from !== id && c.to !== id);
  }

  connect(fromId: string, toId: string): boolean {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);

    if (!from || !to || fromId === toId) return false;

    const exists = this.connections.some((c) => c.from === fromId && c.to === toId);
    if (exists) return true;

    from.connect(to.node);
    this.connections.push({ from: fromId, to: toId });

    const ok = this.rebuildExecutionOrder();
    if (!ok) {
      from.disconnect(to.node);
      this.connections = this.connections.filter((c) => !(c.from === fromId && c.to === toId));
      this.rebuildExecutionOrder();
      return false;
    }

    return true;
  }

  disconnect(fromId: string, toId: string): void {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);

    if (!from || !to) return;

    from.disconnect(to.node);
    this.connections = this.connections.filter((c) => !(c.from === fromId && c.to === toId));
    this.rebuildExecutionOrder();
  }

  disconnectAll(): void {
    for (const node of this.nodes.values()) {
      node.disconnect();
    }
    this.connections = [];
    this.executionOrder = [];
    this.cycleDetected = false;
  }

  getConnections(): Connection[] {
    return [...this.connections];
  }

  restoreConnections(connections: Connection[]): void {
    this.disconnectAll();
    connections.forEach((c) => this.connect(c.from, c.to));
  }

  getExecutionOrder(): string[] {
    return [...this.executionOrder];
  }

  hasCycle(): boolean {
    return this.cycleDetected;
  }

  rebuildExecutionOrder(): boolean {
    const ids = Array.from(this.nodes.keys()).sort((a, b) => a.localeCompare(b));
    const indegree = new Map<string, number>();
    const outgoing = new Map<string, string[]>();

    ids.forEach((id) => {
      indegree.set(id, 0);
      outgoing.set(id, []);
    });

    this.connections.forEach((c) => {
      if (!indegree.has(c.from) || !indegree.has(c.to)) return;
      outgoing.set(c.from, [...(outgoing.get(c.from) ?? []), c.to]);
      indegree.set(c.to, (indegree.get(c.to) ?? 0) + 1);
    });

    outgoing.forEach((targets, key) => {
      outgoing.set(key, [...targets].sort((a, b) => a.localeCompare(b)));
    });

    const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0).sort((a, b) => a.localeCompare(b));
    const order: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift() as string;
      order.push(current);

      for (const target of outgoing.get(current) ?? []) {
        const next = (indegree.get(target) ?? 0) - 1;
        indegree.set(target, next);
        if (next === 0) {
          queue.push(target);
          queue.sort((a, b) => a.localeCompare(b));
        }
      }
    }

    this.cycleDetected = order.length !== this.nodes.size;

    if (this.cycleDetected) {
      return false;
    }

    this.executionOrder = order;
    return true;
  }
}
