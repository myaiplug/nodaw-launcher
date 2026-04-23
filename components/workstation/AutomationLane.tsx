/**
 * AutomationLane.tsx
 * Bezier curve automation lane with point editing
 * Supports volume, pan, fx mix, and custom parameter automation
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../launcher/themeStore';
import { 
  useWorkstationStore, 
  AutomationLane as AutomationLaneType, 
  AutomationPoint,
  AutomatableParameter 
} from './workstationStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AutomationLaneProps {
  lane: AutomationLaneType;
  trackId: string;
}

interface PointDragState {
  pointId: string;
  dragType: 'point' | 'control1' | 'control2';
  startX: number;
  startY: number;
  startTime: number;
  startValue: number;
  startControl?: { x: number; y: number };
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const PARAMETER_CONFIG: Record<AutomatableParameter, {
  label: string;
  icon: string;
  min: number;
  max: number;
  defaultValue: number;
  unit: string;
  format: (val: number) => string;
}> = {
  volume: {
    label: 'Volume',
    icon: '🔊',
    min: 0,
    max: 1.5,
    defaultValue: 1,
    unit: 'dB',
    format: (v) => v === 0 ? '-∞' : `${(20 * Math.log10(v)).toFixed(1)}`
  },
  pan: {
    label: 'Pan',
    icon: '↔️',
    min: -1,
    max: 1,
    defaultValue: 0,
    unit: '',
    format: (v) => v === 0 ? 'C' : v < 0 ? `L${Math.abs(v * 100).toFixed(0)}` : `R${(v * 100).toFixed(0)}`
  },
  fxMix: {
    label: 'FX Mix',
    icon: '✨',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    unit: '%',
    format: (v) => `${(v * 100).toFixed(0)}`
  },
  magicMeter: {
    label: 'Magic',
    icon: '🪄',
    min: 0,
    max: 1,
    defaultValue: 0,
    unit: '%',
    format: (v) => `${(v * 100).toFixed(0)}`
  }
};

const CURVE_COLORS = {
  volume: '#60a5fa',   // blue
  pan: '#f472b6',      // pink
  fxMix: '#a78bfa',    // purple
  magicMeter: '#34d399' // green
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function getParameterConfig(param: AutomatableParameter) {
  if (param.startsWith('fx.')) {
    return {
      label: param.replace('fx.', ''),
      icon: '🎛️',
      min: 0,
      max: 1,
      defaultValue: 0.5,
      unit: '%',
      format: (v: number) => `${(v * 100).toFixed(0)}`
    };
  }
  return PARAMETER_CONFIG[param] || PARAMETER_CONFIG.volume;
}

function getCurveColor(param: AutomatableParameter): string {
  if (param.startsWith('fx.')) return '#fbbf24'; // amber for fx
  return CURVE_COLORS[param as keyof typeof CURVE_COLORS] || '#60a5fa';
}

// Cubic bezier evaluation
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

// Generate SVG path for automation curve
function generateAutomationPath(
  points: AutomationPoint[],
  width: number,
  height: number,
  zoom: number,
  scrollX: number,
  minValue: number,
  maxValue: number
): string {
  if (points.length === 0) return '';
  
  const sortedPoints = [...points].sort((a, b) => a.time - b.time);
  
  const timeToX = (time: number) => (time * zoom) - scrollX;
  const valueToY = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    return height - (normalized * height);
  };
  
  let path = '';
  
  sortedPoints.forEach((point, i) => {
    const x = timeToX(point.time);
    const y = valueToY(point.value);
    
    if (i === 0) {
      // Start with first point
      path = `M ${x} ${y}`;
    } else {
      const prevPoint = sortedPoints[i - 1];
      const prevX = timeToX(prevPoint.time);
      const prevY = valueToY(prevPoint.value);
      
      switch (point.curveType) {
        case 'hold':
          // Step function - horizontal then vertical
          path += ` L ${x} ${prevY} L ${x} ${y}`;
          break;
          
        case 'linear':
          // Straight line
          path += ` L ${x} ${y}`;
          break;
          
        case 'exponential':
          // Quadratic curve approximating exponential
          const expControlX = prevX + (x - prevX) * 0.7;
          const expControlY = prevY + (y - prevY) * 0.1;
          path += ` Q ${expControlX} ${expControlY} ${x} ${y}`;
          break;
          
        case 'bezier':
          // Full cubic bezier with control points
          if (prevPoint.controlPoint2 && point.controlPoint1) {
            const cp1x = timeToX(prevPoint.time + prevPoint.controlPoint2.x);
            const cp1y = valueToY(prevPoint.value + prevPoint.controlPoint2.y * (maxValue - minValue));
            const cp2x = timeToX(point.time + point.controlPoint1.x);
            const cp2y = valueToY(point.value + point.controlPoint1.y * (maxValue - minValue));
            path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`;
          } else {
            // Fallback to smooth curve
            const controlDist = (x - prevX) * 0.3;
            path += ` C ${prevX + controlDist} ${prevY} ${x - controlDist} ${y} ${x} ${y}`;
          }
          break;
      }
    }
  });
  
  return path;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const AutomationLane: React.FC<AutomationLaneProps> = ({ lane, trackId }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const { 
    view, 
    selectedAutomationPointIds,
    updateAutomationPoint,
    addAutomationPoint,
    deleteAutomationPoint,
    selectAutomationPoints,
    toggleAutomationPointSelection
  } = useWorkstationStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [dragState, setDragState] = useState<PointDragState | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [showValueTooltip, setShowValueTooltip] = useState(false);
  const [tooltipValue, setTooltipValue] = useState<{ x: number; y: number; value: number } | null>(null);
  
  const config = getParameterConfig(lane.parameter);
  const curveColor = getCurveColor(lane.parameter);
  
  // Convert coordinates
  const timeToX = useCallback((time: number) => {
    return (time * view.zoom) - view.scrollX;
  }, [view.zoom, view.scrollX]);
  
  const xToTime = useCallback((x: number) => {
    return (x + view.scrollX) / view.zoom;
  }, [view.zoom, view.scrollX]);
  
  const valueToY = useCallback((value: number) => {
    const normalized = (value - config.min) / (config.max - config.min);
    return lane.height - (normalized * lane.height);
  }, [config.min, config.max, lane.height]);
  
  const yToValue = useCallback((y: number) => {
    const normalized = 1 - (y / lane.height);
    return config.min + normalized * (config.max - config.min);
  }, [config.min, config.max, lane.height]);
  
  // Generate SVG path
  const pathData = useMemo(() => {
    if (!containerRef.current) return '';
    const width = containerRef.current.clientWidth || 1000;
    return generateAutomationPath(
      lane.points,
      width,
      lane.height,
      view.zoom,
      view.scrollX,
      config.min,
      config.max
    );
  }, [lane.points, lane.height, view.zoom, view.scrollX, config.min, config.max]);
  
  // Handle double-click to add point
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const time = xToTime(x);
    const value = yToValue(y);
    
    addAutomationPoint(trackId, lane.id, {
      time: Math.max(0, time),
      value: Math.max(config.min, Math.min(config.max, value)),
      curveType: 'bezier'
    });
  }, [xToTime, yToValue, trackId, lane.id, config.min, config.max, addAutomationPoint]);
  
  // Handle point drag start
  const handlePointMouseDown = useCallback((
    e: React.MouseEvent, 
    point: AutomationPoint,
    dragType: PointDragState['dragType'] = 'point'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    setDragState({
      pointId: point.id,
      dragType,
      startX: e.clientX,
      startY: e.clientY,
      startTime: point.time,
      startValue: point.value,
      startControl: dragType === 'control1' 
        ? point.controlPoint1 
        : dragType === 'control2' 
          ? point.controlPoint2 
          : undefined
    });
    
    // Select the point
    if (e.shiftKey) {
      toggleAutomationPointSelection(point.id);
    } else if (!selectedAutomationPointIds.includes(point.id)) {
      selectAutomationPoints([point.id]);
    }
  }, [selectedAutomationPointIds, selectAutomationPoints, toggleAutomationPointSelection]);
  
  // Handle mouse move during drag
  useEffect(() => {
    if (!dragState) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      if (dragState.dragType === 'point') {
        // Dragging the main point
        const deltaTime = deltaX / view.zoom;
        const deltaValue = -deltaY / lane.height * (config.max - config.min);
        
        const newTime = Math.max(0, dragState.startTime + deltaTime);
        const newValue = Math.max(config.min, Math.min(config.max, dragState.startValue + deltaValue));
        
        updateAutomationPoint(trackId, lane.id, dragState.pointId, {
          time: view.snapEnabled ? snapToGrid(newTime, view.snapValue, view.zoom) : newTime,
          value: newValue
        });
        
        setTooltipValue({ x: e.clientX, y: e.clientY, value: newValue });
        setShowValueTooltip(true);
      } else {
        // Dragging a bezier control handle
        if (!dragState.startControl) return;
        
        const deltaTime = deltaX / view.zoom;
        const deltaValue = -deltaY / lane.height;
        
        const update = dragState.dragType === 'control1' 
          ? { controlPoint1: { x: dragState.startControl.x + deltaTime, y: dragState.startControl.y + deltaValue } }
          : { controlPoint2: { x: dragState.startControl.x + deltaTime, y: dragState.startControl.y + deltaValue } };
        
        updateAutomationPoint(trackId, lane.id, dragState.pointId, update);
      }
    };
    
    const handleMouseUp = () => {
      setDragState(null);
      setShowValueTooltip(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, view.zoom, view.snapEnabled, view.snapValue, lane.height, config.min, config.max, trackId, lane.id, updateAutomationPoint]);
  
  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAutomationPointIds.length > 0) {
        selectedAutomationPointIds.forEach(pointId => {
          deleteAutomationPoint(trackId, lane.id, pointId);
        });
        selectAutomationPoints([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAutomationPointIds, trackId, lane.id, deleteAutomationPoint, selectAutomationPoints]);
  
  // Snap to grid helper
  const snapToGrid = (time: number, snapValue: number, zoom: number): number => {
    const gridSize = 60 / 120 * snapValue; // Assuming 120 BPM for now
    return Math.round(time / gridSize) * gridSize;
  };
  
  return (
    <div
      ref={containerRef}
      className={`relative border-t ${isDark ? 'border-slate-800/50' : 'border-slate-300/50'}`}
      style={{ height: lane.height }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Lane background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-slate-950/30' : 'bg-slate-100/50'}`} />
      
      {/* Parameter label */}
      <div className="absolute left-2 top-1 flex items-center gap-1.5 z-10">
        <span className="text-xs">{config.icon}</span>
        <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
          {config.label}
        </span>
      </div>
      
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Horizontal center line */}
        <line
          x1="0"
          y1={lane.height / 2}
          x2="100%"
          y2={lane.height / 2}
          stroke={isDark ? '#334155' : '#cbd5e1'}
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {/* Automation curve */}
        {pathData && (
          <>
            {/* Glow effect */}
            <path
              d={pathData}
              fill="none"
              stroke={curveColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.2"
              filter="blur(4px)"
            />
            {/* Main curve */}
            <path
              d={pathData}
              fill="none"
              stroke={curveColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
      
      {/* Automation points */}
      {lane.points.map((point) => {
        const x = timeToX(point.time);
        const y = valueToY(point.value);
        const isSelected = selectedAutomationPointIds.includes(point.id);
        const isHovered = hoveredPointId === point.id;
        
        // Don't render if off-screen
        if (x < -20 || x > (containerRef.current?.clientWidth ?? 1000) + 20) return null;
        
        return (
          <React.Fragment key={point.id}>
            {/* Bezier control handles (only show for selected bezier points) */}
            {isSelected && point.curveType === 'bezier' && (
              <>
                {/* Control point 1 (incoming) */}
                {point.controlPoint1 && (
                  <>
                    <line
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        pointerEvents: 'none'
                      }}
                    />
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1={x}
                        y1={y}
                        x2={x + point.controlPoint1.x * view.zoom}
                        y2={y - point.controlPoint1.y * lane.height}
                        stroke={curveColor}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.5"
                      />
                    </svg>
                    <motion.div
                      className="absolute w-3 h-3 rounded-full cursor-move"
                      style={{
                        left: x + point.controlPoint1.x * view.zoom - 6,
                        top: y - point.controlPoint1.y * lane.height - 6,
                        backgroundColor: curveColor,
                        opacity: 0.6
                      }}
                      whileHover={{ scale: 1.3 }}
                      onMouseDown={(e) => handlePointMouseDown(e, point, 'control1')}
                    />
                  </>
                )}
                
                {/* Control point 2 (outgoing) */}
                {point.controlPoint2 && (
                  <>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1={x}
                        y1={y}
                        x2={x + point.controlPoint2.x * view.zoom}
                        y2={y - point.controlPoint2.y * lane.height}
                        stroke={curveColor}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.5"
                      />
                    </svg>
                    <motion.div
                      className="absolute w-3 h-3 rounded-full cursor-move"
                      style={{
                        left: x + point.controlPoint2.x * view.zoom - 6,
                        top: y - point.controlPoint2.y * lane.height - 6,
                        backgroundColor: curveColor,
                        opacity: 0.6
                      }}
                      whileHover={{ scale: 1.3 }}
                      onMouseDown={(e) => handlePointMouseDown(e, point, 'control2')}
                    />
                  </>
                )}
              </>
            )}
            
            {/* Main point */}
            <motion.div
              className={`absolute cursor-pointer transition-all
                ${isSelected ? 'z-20' : 'z-10'}`}
              style={{
                left: x - (isSelected ? 6 : 5),
                top: y - (isSelected ? 6 : 5),
                width: isSelected ? 12 : 10,
                height: isSelected ? 12 : 10,
                borderRadius: point.curveType === 'hold' ? '2px' : '50%',
                backgroundColor: curveColor,
                border: `2px solid ${isDark ? '#0f172a' : '#ffffff'}`,
                boxShadow: isSelected 
                  ? `0 0 10px ${curveColor}, 0 0 20px ${curveColor}40` 
                  : hoveredPointId === point.id 
                    ? `0 0 8px ${curveColor}80`
                    : 'none'
              }}
              whileHover={{ scale: 1.3 }}
              onMouseDown={(e) => handlePointMouseDown(e, point)}
              onMouseEnter={() => setHoveredPointId(point.id)}
              onMouseLeave={() => setHoveredPointId(null)}
            />
            
            {/* Point value tooltip */}
            {(isHovered || isSelected) && !dragState && (
              <div
                className={`absolute px-1.5 py-0.5 rounded text-[9px] font-mono pointer-events-none z-30
                  ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} shadow-lg`}
                style={{
                  left: x + 12,
                  top: y - 8,
                }}
              >
                {config.format(point.value)}{config.unit}
              </div>
            )}
          </React.Fragment>
        );
      })}
      
      {/* Curve type selector (on hover near point) */}
      <AnimatePresence>
        {isHovering && hoveredPointId && !dragState && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`absolute bottom-1 right-2 flex gap-1 z-30`}
          >
            {(['hold', 'linear', 'bezier'] as const).map((curveType) => {
              const point = lane.points.find(p => p.id === hoveredPointId);
              const isActive = point?.curveType === curveType;
              
              return (
                <button
                  key={curveType}
                  onClick={() => {
                    if (point) {
                      updateAutomationPoint(trackId, lane.id, point.id, { 
                        curveType,
                        controlPoint1: curveType === 'bezier' ? { x: -0.1, y: 0 } : undefined,
                        controlPoint2: curveType === 'bezier' ? { x: 0.1, y: 0 } : undefined
                      });
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase transition-colors
                    ${isActive 
                      ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50' 
                      : isDark 
                        ? 'bg-slate-800 text-slate-500 hover:text-slate-300' 
                        : 'bg-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {curveType[0]}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Value tooltip during drag */}
      <AnimatePresence>
        {showValueTooltip && tooltipValue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed px-2 py-1 rounded text-xs font-mono z-50
              ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-white text-cyan-600'} shadow-xl`}
            style={{
              left: tooltipValue.x + 15,
              top: tooltipValue.y - 10,
            }}
          >
            {config.format(tooltipValue.value)}{config.unit}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Instructions hint */}
      {isHovering && lane.points.length === 0 && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none
          ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
        >
          <span className="text-[10px] font-mono">Double-click to add automation point</span>
        </div>
      )}
    </div>
  );
};

export default AutomationLane;
