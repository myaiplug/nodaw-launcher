import { create } from 'zustand';

export type NodeType = 'time-stretch' | 'pitch' | 'granular' | 'gain';

export interface Connection {
  from: string;
  to: string;
}

export interface NodeUI {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  params: Record<string, number>;
}

interface GraphState {
  nodes: Record<string, NodeUI>;
  connections: Connection[];
  connectionLevels: Record<string, number>;

  addNode: (node: NodeUI) => void;
  moveNode: (id: string, x: number, y: number) => void;
  setNodeParam: (id: string, key: string, value: number) => void;
  connectNodes: (from: string, to: string) => void;
  disconnectNodes: (from: string, to: string) => void;
  removeNode: (id: string) => void;
  setConnectionLevel: (from: string, to: string, level: number) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: {},
  connections: [],
  connectionLevels: {},

  addNode: (node) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [node.id]: node,
      },
    }));
  },

  moveNode: (id, x, y) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;

      return {
        nodes: {
          ...state.nodes,
          [id]: {
            ...node,
            x,
            y,
          },
        },
      };
    });
  },

  setNodeParam: (id, key, value) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;

      return {
        nodes: {
          ...state.nodes,
          [id]: {
            ...node,
            params: {
              ...node.params,
              [key]: value,
            },
          },
        },
      };
    });
  },

  connectNodes: (from, to) => {
    set((state) => {
      const exists = state.connections.some((c) => c.from === from && c.to === to);
      if (exists || from === to) return state;

      return {
        connections: [...state.connections, { from, to }],
        connectionLevels: {
          ...state.connectionLevels,
          [`${from}->${to}`]: state.connectionLevels[`${from}->${to}`] ?? 0,
        },
      };
    });
  },

  disconnectNodes: (from, to) => {
    set((state) => {
      const nextLevels = { ...state.connectionLevels };
      delete nextLevels[`${from}->${to}`];

      return {
        connections: state.connections.filter((c) => !(c.from === from && c.to === to)),
        connectionLevels: nextLevels,
      };
    });
  },

  removeNode: (id) => {
    set((state) => {
      const nextNodes = { ...state.nodes };
      delete nextNodes[id];

      const nextLevels = { ...state.connectionLevels };
      Object.keys(nextLevels).forEach((k) => {
        if (k.startsWith(`${id}->`) || k.endsWith(`->${id}`)) {
          delete nextLevels[k];
        }
      });

      return {
        nodes: nextNodes,
        connections: state.connections.filter((c) => c.from !== id && c.to !== id),
        connectionLevels: nextLevels,
      };
    });
  },

  setConnectionLevel: (from, to, level) => {
    set((state) => ({
      connectionLevels: {
        ...state.connectionLevels,
        [`${from}->${to}`]: Math.max(0, Math.min(1, level)),
      },
    }));
  },
}));
