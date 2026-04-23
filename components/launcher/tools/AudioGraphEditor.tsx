import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGraphStore, NodeUI, NodeType } from './graphStore';
import { useAudioEngine } from './useAudioEngine';

const DEFAULT_PARAMS: Record<NodeType, Record<string, number>> = {
  'time-stretch': { timeRatio: 1.0, pitchRatio: 1.0 },
  pitch: { pitchRatio: 1.0, gain: 1.0 },
  granular: { grainSizeMs: 80, density: 0.5, jitter: 0.1 },
  gain: { gain: 1.0 },
};

const NODE_WIDTH = 208;
const PORT_Y = 18;
const SNAP_RADIUS = 22;

type PortPosition = {
  nodeId: string;
  x: number;
  y: number;
};

function AudioNodeCard({
  node,
  onMove,
  onOutputDragStart,
  onInputHover,
  onParamChange,
}: {
  node: NodeUI;
  onMove: (id: string, x: number, y: number) => void;
  onOutputDragStart: (id: string) => void;
  onInputHover: (id: string | null) => void;
  onParamChange: (id: string, key: string, value: number) => void;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => onMove(node.id, node.x + info.offset.x, node.y + info.offset.y)}
      style={{ position: 'absolute', left: node.x, top: node.y }}
      className="w-52 p-3 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-900/40"
    >
      <div className="flex items-center justify-between">
        <button
          onMouseEnter={() => onInputHover(node.id)}
          onMouseLeave={() => onInputHover(null)}
          className="w-3 h-3 rounded-full bg-cyan-700 border border-cyan-400"
          title="Input"
        />
        <div className="text-xs text-cyan-300 font-mono uppercase">{node.type}</div>
        <button
          onMouseDown={() => onOutputDragStart(node.id)}
          className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-400"
          title="Output"
        />
      </div>

      <div className="mt-2 space-y-2">
        {Object.entries(node.params).map(([key, val]) => (
          <label key={key} className="block text-[10px] text-slate-300">
            <div className="flex justify-between">
              <span>{key}</span>
              <span>{val.toFixed(2)}</span>
            </div>
            <input
              className="w-full mt-1 accent-cyan-400"
              type="range"
              min={0}
              max={key.includes('pitch') ? 4 : key.includes('grainSize') ? 200 : 2}
              step={0.01}
              value={val}
              onChange={(e) => onParamChange(node.id, key, Number(e.target.value))}
            />
          </label>
        ))}
      </div>
    </motion.div>
  );
}

function makeCablePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = Math.max(60, Math.abs(to.x - from.x) * 0.45);
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
}

function findNearestInputPort(mouse: { x: number; y: number }, nodes: Record<string, NodeUI>): PortPosition | null {
  let best: PortPosition | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  Object.values(nodes).forEach((node) => {
    const candidate: PortPosition = { nodeId: node.id, x: node.x, y: node.y + PORT_Y };
    const dx = candidate.x - mouse.x;
    const dy = candidate.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < SNAP_RADIUS && dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  });

  return best;
}

export default function AudioGraphEditor(): React.JSX.Element {
  const { engineRef, ready } = useAudioEngine();
  const graphRef = useRef<HTMLDivElement | null>(null);

  const nodes = useGraphStore((s) => s.nodes);
  const connections = useGraphStore((s) => s.connections);
  const connectionLevels = useGraphStore((s) => s.connectionLevels);
  const addNode = useGraphStore((s) => s.addNode);
  const moveNode = useGraphStore((s) => s.moveNode);
  const connectNodes = useGraphStore((s) => s.connectNodes);
  const setNodeParam = useGraphStore((s) => s.setNodeParam);
  const setConnectionLevel = useGraphStore((s) => s.setConnectionLevel);

  const [dragFromId, setDragFromId] = useState<string | null>(null);
  const [dragMouse, setDragMouse] = useState<{ x: number; y: number } | null>(null);
  const [hoveredInputId, setHoveredInputId] = useState<string | null>(null);

  const orderedNodes = useMemo(() => Object.values(nodes), [nodes]);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      if (engineRef.current) {
        const levels = engineRef.current.getConnectionLevels();
        Object.entries(levels).forEach(([k, level]) => {
          const [from, to] = k.split('->');
          if (from && to) {
            setConnectionLevel(from, to, level);
          }
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engineRef, setConnectionLevel]);

  const handleAddNode = async (type: NodeType) => {
    const id = crypto.randomUUID();
    if (!engineRef.current) return;

    await engineRef.current.createNode(id, type);

    addNode({
      id,
      type,
      x: 80 + orderedNodes.length * 44,
      y: 90 + (orderedNodes.length % 3) * 110,
      params: { ...DEFAULT_PARAMS[type] },
    });
  };

  const startCableDrag = (fromId: string) => {
    setDragFromId(fromId);
    setDragMouse(null);
    setHoveredInputId(null);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragFromId || !graphRef.current) return;

    const rect = graphRef.current.getBoundingClientRect();
    const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragMouse(mouse);

    const snapped = findNearestInputPort(mouse, nodes);
    setHoveredInputId(snapped?.nodeId ?? null);
  };

  const finishCableDrag = () => {
    if (!dragFromId || !engineRef.current) {
      setDragFromId(null);
      setDragMouse(null);
      setHoveredInputId(null);
      return;
    }

    const toId = hoveredInputId;
    if (toId && toId !== dragFromId) {
      const ok = engineRef.current.connect(dragFromId, toId);
      if (ok) {
        connectNodes(dragFromId, toId);
      }
    }

    setDragFromId(null);
    setDragMouse(null);
    setHoveredInputId(null);
  };

  const handleParamChange = (nodeId: string, key: string, value: number) => {
    setNodeParam(nodeId, key, value);
    engineRef.current?.setParam(nodeId, key, value);
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider">Graph UI</div>
        <div className="flex gap-2">
          <button onClick={() => { void handleAddNode('time-stretch'); }} className="px-2 py-1 text-[10px] rounded bg-slate-800 border border-cyan-700 text-cyan-300">+ Time</button>
          <button onClick={() => { void handleAddNode('pitch'); }} className="px-2 py-1 text-[10px] rounded bg-slate-800 border border-purple-700 text-purple-300">+ Pitch</button>
          <button onClick={() => { void handleAddNode('granular'); }} className="px-2 py-1 text-[10px] rounded bg-slate-800 border border-amber-700 text-amber-300">+ Granular</button>
          <button onClick={() => { void handleAddNode('gain'); }} className="px-2 py-1 text-[10px] rounded bg-slate-800 border border-emerald-700 text-emerald-300">+ Gain</button>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono mb-2">
        {ready ? 'Engine Ready' : 'Initializing Engine...'}
        {dragFromId ? ` • Dragging cable from ${dragFromId.slice(0, 8)}...` : ''}
        {engineRef.current?.graphHasCycle() ? ' • Cycle prevented' : ''}
      </div>

      <div
        ref={graphRef}
        onMouseMove={handlePointerMove}
        onMouseUp={finishCableDrag}
        onMouseLeave={finishCableDrag}
        className="relative w-full h-[360px] rounded-lg border border-slate-800 bg-[radial-gradient(circle_at_1px_1px,rgba(56,189,248,0.08)_1px,transparent_0)] [background-size:16px_16px] overflow-hidden"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((c, i) => {
            const from = nodes[c.from];
            const to = nodes[c.to];
            if (!from || !to) return null;

            const level = connectionLevels[`${c.from}->${c.to}`] ?? 0;
            const d = makeCablePath({ x: from.x + NODE_WIDTH, y: from.y + PORT_Y }, { x: to.x, y: to.y + PORT_Y });

            return (
              <g key={`${c.from}-${c.to}-${i}`}>
                <path
                  d={d}
                  stroke="rgb(15 23 42)"
                  fill="none"
                  strokeWidth={4}
                  opacity={0.9}
                />
                <path
                  d={d}
                  stroke={level > 0.6 ? 'rgb(16 185 129)' : 'rgb(34 211 238)'}
                  fill="none"
                  strokeWidth={2 + level * 2}
                  opacity={0.45 + level * 0.55}
                />
                <motion.path
                  d={d}
                  stroke={level > 0.6 ? 'rgb(134 239 172)' : 'rgb(125 211 252)'}
                  fill="none"
                  strokeWidth={1.5 + level}
                  strokeDasharray="14 18"
                  initial={false}
                  animate={{ strokeDashoffset: [0, -64], opacity: [0.35, 1, 0.35] }}
                  transition={{
                    duration: 1.2 - Math.min(0.8, level * 0.7),
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </g>
            );
          })}

          {dragFromId && dragMouse && nodes[dragFromId] && (
            <path
              d={makeCablePath(
                { x: nodes[dragFromId].x + NODE_WIDTH, y: nodes[dragFromId].y + PORT_Y },
                hoveredInputId && nodes[hoveredInputId]
                  ? { x: nodes[hoveredInputId].x, y: nodes[hoveredInputId].y + PORT_Y }
                  : dragMouse,
              )}
              stroke={hoveredInputId ? 'rgb(16 185 129)' : 'rgb(56 189 248)'}
              fill="none"
              strokeWidth="2"
              strokeDasharray={hoveredInputId ? undefined : '6 4'}
              opacity="0.9"
            />
          )}
        </svg>

        {orderedNodes.map((node) => (
          <AudioNodeCard
            key={node.id}
            node={node}
            onMove={moveNode}
            onOutputDragStart={startCableDrag}
            onInputHover={setHoveredInputId}
            onParamChange={handleParamChange}
          />
        ))}
      </div>
    </div>
  );
}
