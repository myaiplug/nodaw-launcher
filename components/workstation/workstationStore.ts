/**
 * workstationStore.ts
 * Zustand store for NoDAW Workstation state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface Project {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number]; // [beats, noteValue] e.g. [4, 4]
  sampleRate: number;
  duration: number; // total project duration in seconds
  createdAt: number;
  modifiedAt: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'master' | 'bus';
  regions: AudioRegion[];
  automationLanes: AutomationLane[];
  color: string;
  height: number;
  
  // Mix properties
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  armed: boolean; // for recording
  
  // Routing
  output: string; // 'master' or bus ID
}

export interface AudioRegion {
  id: string;
  trackId: string;
  name: string;
  sourceFile: string;
  sourceBuffer?: AudioBuffer; // loaded audio data
  startTime: number;
  duration: number;
  offset: number; // offset into source file
  gain: number;
  
  fadeIn: FadeConfig;
  fadeOut: FadeConfig;
  
  // Visual cache
  waveformPeaks?: Float32Array;
  color?: string;
  
  // Selection state
  selected: boolean;
}

export interface FadeConfig {
  duration: number;
  curve: 'linear' | 'exponential' | 'scurve' | 'logarithmic';
}

export interface AutomationLane {
  id: string;
  trackId: string;
  parameter: AutomatableParameter;
  points: AutomationPoint[];
  visible: boolean;
  height: number;
  color: string;
}

export type AutomatableParameter = 
  | 'volume'
  | 'pan'
  | 'fxMix'
  | 'magicMeter'
  | `fx.${string}`;

export interface AutomationPoint {
  id: string;
  time: number;
  value: number;
  curveType: 'hold' | 'linear' | 'exponential' | 'bezier';
  controlPoint1?: { x: number; y: number };
  controlPoint2?: { x: number; y: number };
}

export interface TimeSelection {
  startTime: number;
  endTime: number;
  trackIds: string[]; // empty = all tracks
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

export interface ViewState {
  zoom: number; // pixels per second
  scrollX: number; // horizontal scroll position
  scrollY: number; // vertical scroll position
  snapEnabled: boolean;
  snapValue: number; // snap to grid value (in beats)
  showAutomation: boolean;
  selectedTrackId: string | null;
}

export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  state: Partial<WorkstationState>;
}

// ═══════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════

const TRACK_COLORS = [
  '#a78bfa', // purple
  '#f87171', // red
  '#60a5fa', // blue
  '#facc15', // yellow
  '#34d399', // emerald
  '#fb923c', // orange
  '#e879f9', // fuchsia
  '#7dd3fc', // sky
];

const createDefaultProject = (): Project => ({
  id: nanoid(),
  name: 'Untitled Project',
  bpm: 120,
  timeSignature: [4, 4],
  sampleRate: 44100,
  duration: 180, // 3 minutes default
  createdAt: Date.now(),
  modifiedAt: Date.now(),
});

const createDefaultTrack = (index: number): Track => ({
  id: nanoid(),
  name: `Track ${index + 1}`,
  type: 'audio',
  regions: [],
  automationLanes: [],
  color: TRACK_COLORS[index % TRACK_COLORS.length],
  height: 80,
  volume: 1,
  pan: 0,
  mute: false,
  solo: false,
  armed: false,
  output: 'master',
});

// ═══════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════

interface WorkstationState {
  // Project
  project: Project;
  tracks: Track[];
  masterTrack: Track;
  
  // Playback
  playback: PlaybackState;
  
  // View
  view: ViewState;
  
  // Selection
  selection: TimeSelection | null;
  selectedRegionIds: string[];
  selectedAutomationPointIds: string[];
  
  // Clipboard
  clipboard: {
    regions: AudioRegion[];
    automationPoints: AutomationPoint[];
  };
  
  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;
  
  // Actions
  // Project
  setProject: (project: Partial<Project>) => void;
  setBpm: (bpm: number) => void;
  
  // Tracks
  addTrack: () => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  
  // Regions
  addRegion: (trackId: string, region: Omit<AudioRegion, 'id' | 'trackId' | 'selected'>) => string;
  removeRegion: (regionId: string) => void;
  updateRegion: (regionId: string, updates: Partial<AudioRegion>) => void;
  moveRegion: (regionId: string, newTrackId: string, newStartTime: number) => void;
  splitRegionAtTime: (regionId: string, time: number) => void;
  duplicateRegion: (regionId: string) => string;
  
  // Selection
  setSelection: (selection: TimeSelection | null) => void;
  selectRegion: (regionId: string, additive?: boolean) => void;
  deselectAllRegions: () => void;
  selectRegionsInRange: (startTime: number, endTime: number, trackIds?: string[]) => void;
  
  // Automation
  addAutomationLane: (trackId: string, parameter: AutomatableParameter) => void;
  removeAutomationLane: (laneId: string) => void;
  addAutomationPoint: (trackId: string, laneId: string, point: Omit<AutomationPoint, 'id'>) => void;
  updateAutomationPoint: (trackId: string, laneId: string, pointId: string, updates: Partial<AutomationPoint>) => void;
  deleteAutomationPoint: (trackId: string, laneId: string, pointId: string) => void;
  selectAutomationPoints: (pointIds: string[]) => void;
  toggleAutomationPointSelection: (pointId: string) => void;
  
  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setLoop: (start: number, end: number) => void;
  toggleLoop: () => void;
  
  // View
  setZoom: (zoom: number) => void;
  setScroll: (x: number, y: number) => void;
  toggleSnap: () => void;
  setSnapValue: (value: number) => void;
  toggleAutomationView: () => void;
  
  // Clipboard
  copySelection: () => void;
  cutSelection: () => void;
  paste: (time?: number) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  pushHistory: (action: string) => void;
  
  // Utility
  getTrackById: (trackId: string) => Track | undefined;
  getRegionById: (regionId: string) => AudioRegion | undefined;
  getRegionsAtTime: (time: number) => AudioRegion[];
  getSelectedRegions: () => AudioRegion[];
  timeToPixels: (time: number) => number;
  pixelsToTime: (pixels: number) => number;
  snapToGrid: (time: number) => number;
}

// ═══════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════

export const useWorkstationStore = create<WorkstationState>()(
  immer((set, get) => ({
    // Initial state
    project: createDefaultProject(),
    tracks: [createDefaultTrack(0)],
    masterTrack: {
      ...createDefaultTrack(0),
      id: 'master',
      name: 'Master',
      type: 'master',
      color: '#22d3ee',
    },
    
    playback: {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      loopEnabled: false,
      loopStart: 0,
      loopEnd: 0,
    },
    
    view: {
      zoom: 50, // 50 pixels per second
      scrollX: 0,
      scrollY: 0,
      snapEnabled: true,
      snapValue: 0.25, // quarter note at 120 BPM = 0.5s, eighth = 0.25s
      showAutomation: true,
      selectedTrackId: null,
    },
    
    selection: null,
    selectedRegionIds: [],
    selectedAutomationPointIds: [],
    
    clipboard: {
      regions: [],
      automationPoints: [],
    },
    
    history: [],
    historyIndex: -1,
    
    // === PROJECT ACTIONS ===
    
    setProject: (updates) => {
      set((state) => {
        Object.assign(state.project, updates);
        state.project.modifiedAt = Date.now();
      });
    },
    
    setBpm: (bpm) => {
      set((state) => {
        state.project.bpm = Math.max(20, Math.min(300, bpm));
        state.project.modifiedAt = Date.now();
      });
    },
    
    // === TRACK ACTIONS ===
    
    addTrack: () => {
      set((state) => {
        const newTrack = createDefaultTrack(state.tracks.length);
        state.tracks.push(newTrack);
        state.project.modifiedAt = Date.now();
      });
      get().pushHistory('Add Track');
    },
    
    removeTrack: (trackId) => {
      set((state) => {
        state.tracks = state.tracks.filter((t) => t.id !== trackId);
        state.selectedRegionIds = state.selectedRegionIds.filter(
          (id) => !state.tracks.some((t) => t.regions.some((r) => r.id === id))
        );
        state.project.modifiedAt = Date.now();
      });
      get().pushHistory('Remove Track');
    },
    
    updateTrack: (trackId, updates) => {
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          Object.assign(track, updates);
          state.project.modifiedAt = Date.now();
        }
      });
    },
    
    reorderTracks: (fromIndex, toIndex) => {
      set((state) => {
        const [removed] = state.tracks.splice(fromIndex, 1);
        state.tracks.splice(toIndex, 0, removed);
        state.project.modifiedAt = Date.now();
      });
    },
    
    setTrackVolume: (trackId, volume) => {
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId) || 
                      (trackId === 'master' ? state.masterTrack : null);
        if (track) {
          track.volume = Math.max(0, Math.min(2, volume)); // 0 to +6dB
        }
      });
    },
    
    setTrackPan: (trackId, pan) => {
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          track.pan = Math.max(-1, Math.min(1, pan));
        }
      });
    },
    
    toggleTrackMute: (trackId) => {
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          track.mute = !track.mute;
        }
      });
    },
    
    toggleTrackSolo: (trackId) => {
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          track.solo = !track.solo;
        }
      });
    },
    
    // === REGION ACTIONS ===
    
    addRegion: (trackId, regionData) => {
      const id = nanoid();
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          track.regions.push({
            ...regionData,
            id,
            trackId,
            selected: false,
          });
          state.project.modifiedAt = Date.now();
        }
      });
      get().pushHistory('Add Region');
      return id;
    },
    
    removeRegion: (regionId) => {
      set((state) => {
        for (const track of state.tracks) {
          const idx = track.regions.findIndex((r) => r.id === regionId);
          if (idx !== -1) {
            track.regions.splice(idx, 1);
            break;
          }
        }
        state.selectedRegionIds = state.selectedRegionIds.filter((id) => id !== regionId);
        state.project.modifiedAt = Date.now();
      });
      get().pushHistory('Delete Region');
    },
    
    updateRegion: (regionId, updates) => {
      set((state) => {
        for (const track of state.tracks) {
          const region = track.regions.find((r) => r.id === regionId);
          if (region) {
            Object.assign(region, updates);
            state.project.modifiedAt = Date.now();
            break;
          }
        }
      });
    },
    
    moveRegion: (regionId, newTrackId, newStartTime) => {
      set((state) => {
        let movedRegion: AudioRegion | null = null;
        
        // Find and remove from current track
        for (const track of state.tracks) {
          const idx = track.regions.findIndex((r) => r.id === regionId);
          if (idx !== -1) {
            [movedRegion] = track.regions.splice(idx, 1);
            break;
          }
        }
        
        // Add to new track
        if (movedRegion) {
          const targetTrack = state.tracks.find((t) => t.id === newTrackId);
          if (targetTrack) {
            movedRegion.trackId = newTrackId;
            movedRegion.startTime = state.view.snapEnabled 
              ? get().snapToGrid(newStartTime) 
              : newStartTime;
            targetTrack.regions.push(movedRegion);
          }
        }
        
        state.project.modifiedAt = Date.now();
      });
      get().pushHistory('Move Region');
    },
    
    splitRegionAtTime: (regionId, time) => {
      set((state) => {
        for (const track of state.tracks) {
          const region = track.regions.find((r) => r.id === regionId);
          if (region && time > region.startTime && time < region.startTime + region.duration) {
            const splitPoint = time - region.startTime;
            
            // Create second half
            const secondHalf: AudioRegion = {
              ...region,
              id: nanoid(),
              startTime: time,
              duration: region.duration - splitPoint,
              offset: region.offset + splitPoint,
              fadeIn: { duration: 0, curve: 'linear' },
              selected: false,
            };
            
            // Trim first half
            region.duration = splitPoint;
            region.fadeOut = { duration: 0, curve: 'linear' };
            
            track.regions.push(secondHalf);
            state.project.modifiedAt = Date.now();
            break;
          }
        }
      });
      get().pushHistory('Split Region');
    },
    
    duplicateRegion: (regionId) => {
      const state = get();
      const region = state.getRegionById(regionId);
      if (!region) return '';
      
      const newId = nanoid();
      set((state) => {
        const track = state.tracks.find((t) => t.id === region.trackId);
        if (track) {
          const duplicate: AudioRegion = {
            ...region,
            id: newId,
            startTime: region.startTime + region.duration,
            selected: false,
          };
          track.regions.push(duplicate);
          state.project.modifiedAt = Date.now();
        }
      });
      get().pushHistory('Duplicate Region');
      return newId;
    },
    
    // === SELECTION ACTIONS ===
    
    setSelection: (selection) => {
      set((state) => {
        state.selection = selection;
      });
    },
    
    selectRegion: (regionId, additive = false) => {
      set((state) => {
        if (!additive) {
          // Deselect all first
          for (const track of state.tracks) {
            for (const region of track.regions) {
              region.selected = false;
            }
          }
          state.selectedRegionIds = [];
        }
        
        // Select the target region
        for (const track of state.tracks) {
          const region = track.regions.find((r) => r.id === regionId);
          if (region) {
            region.selected = true;
            if (!state.selectedRegionIds.includes(regionId)) {
              state.selectedRegionIds.push(regionId);
            }
            break;
          }
        }
      });
    },
    
    deselectAllRegions: () => {
      set((state) => {
        for (const track of state.tracks) {
          for (const region of track.regions) {
            region.selected = false;
          }
        }
        state.selectedRegionIds = [];
      });
    },
    
    selectRegionsInRange: (startTime, endTime, trackIds) => {
      set((state) => {
        for (const track of state.tracks) {
          if (trackIds && !trackIds.includes(track.id)) continue;
          
          for (const region of track.regions) {
            const regionEnd = region.startTime + region.duration;
            const overlaps = region.startTime < endTime && regionEnd > startTime;
            
            if (overlaps) {
              region.selected = true;
              if (!state.selectedRegionIds.includes(region.id)) {
                state.selectedRegionIds.push(region.id);
              }
            }
          }
        }
      });
    },
    
    // === AUTOMATION ACTIONS ===
    
    addAutomationLane: (trackId, parameter) => {
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          const lane: AutomationLane = {
            id: nanoid(),
            trackId,
            parameter,
            points: [],
            visible: true,
            height: 60,
            color: track.color,
          };
          track.automationLanes.push(lane);
          state.project.modifiedAt = Date.now();
        }
      });
    },
    
    removeAutomationLane: (laneId) => {
      set((state) => {
        for (const track of state.tracks) {
          const idx = track.automationLanes.findIndex((l) => l.id === laneId);
          if (idx !== -1) {
            track.automationLanes.splice(idx, 1);
            state.project.modifiedAt = Date.now();
            break;
          }
        }
      });
    },
    
    addAutomationPoint: (trackId, laneId, pointData) => {
      set((state) => {
        const track = state.tracks.find(t => t.id === trackId);
        if (track) {
          const lane = track.automationLanes.find((l) => l.id === laneId);
          if (lane) {
            const point: AutomationPoint = {
              id: nanoid(),
              time: state.view.snapEnabled ? get().snapToGrid(pointData.time) : pointData.time,
              value: pointData.value,
              curveType: pointData.curveType || 'linear',
              controlPoint1: pointData.controlPoint1,
              controlPoint2: pointData.controlPoint2,
            };
            lane.points.push(point);
            lane.points.sort((a, b) => a.time - b.time);
            state.project.modifiedAt = Date.now();
          }
        }
      });
    },
    
    updateAutomationPoint: (trackId, laneId, pointId, updates) => {
      set((state) => {
        const track = state.tracks.find(t => t.id === trackId);
        if (track) {
          const lane = track.automationLanes.find(l => l.id === laneId);
          if (lane) {
            const point = lane.points.find((p) => p.id === pointId);
            if (point) {
              Object.assign(point, updates);
              lane.points.sort((a, b) => a.time - b.time);
              state.project.modifiedAt = Date.now();
            }
          }
        }
      });
    },
    
    deleteAutomationPoint: (trackId, laneId, pointId) => {
      set((state) => {
        const track = state.tracks.find(t => t.id === trackId);
        if (track) {
          const lane = track.automationLanes.find(l => l.id === laneId);
          if (lane) {
            const idx = lane.points.findIndex((p) => p.id === pointId);
            if (idx !== -1) {
              lane.points.splice(idx, 1);
              state.project.modifiedAt = Date.now();
            }
          }
        }
      });
    },
    
    selectAutomationPoints: (pointIds) => {
      set((state) => {
        state.selectedAutomationPointIds = pointIds;
      });
    },
    
    toggleAutomationPointSelection: (pointId) => {
      set((state) => {
        const idx = state.selectedAutomationPointIds.indexOf(pointId);
        if (idx === -1) {
          state.selectedAutomationPointIds.push(pointId);
        } else {
          state.selectedAutomationPointIds.splice(idx, 1);
        }
      });
    },
    
    // === PLAYBACK ACTIONS ===
    
    play: () => {
      set((state) => {
        state.playback.isPlaying = true;
        state.playback.isPaused = false;
      });
    },
    
    pause: () => {
      set((state) => {
        state.playback.isPlaying = false;
        state.playback.isPaused = true;
      });
    },
    
    stop: () => {
      set((state) => {
        state.playback.isPlaying = false;
        state.playback.isPaused = false;
        state.playback.currentTime = 0;
      });
    },
    
    seek: (time) => {
      set((state) => {
        state.playback.currentTime = Math.max(0, Math.min(state.project.duration, time));
      });
    },
    
    setLoop: (start, end) => {
      set((state) => {
        state.playback.loopStart = start;
        state.playback.loopEnd = end;
      });
    },
    
    toggleLoop: () => {
      set((state) => {
        state.playback.loopEnabled = !state.playback.loopEnabled;
      });
    },
    
    // === VIEW ACTIONS ===
    
    setZoom: (zoom) => {
      set((state) => {
        state.view.zoom = Math.max(10, Math.min(500, zoom));
      });
    },
    
    setScroll: (x, y) => {
      set((state) => {
        state.view.scrollX = Math.max(0, x);
        state.view.scrollY = Math.max(0, y);
      });
    },
    
    toggleSnap: () => {
      set((state) => {
        state.view.snapEnabled = !state.view.snapEnabled;
      });
    },
    
    setSnapValue: (value) => {
      set((state) => {
        state.view.snapValue = value;
      });
    },
    
    toggleAutomationView: () => {
      set((state) => {
        state.view.showAutomation = !state.view.showAutomation;
      });
    },
    
    // === CLIPBOARD ACTIONS ===
    
    copySelection: () => {
      const state = get();
      const selectedRegions = state.getSelectedRegions();
      
      set((state) => {
        state.clipboard.regions = JSON.parse(JSON.stringify(selectedRegions));
      });
    },
    
    cutSelection: () => {
      const state = get();
      state.copySelection();
      
      set((state) => {
        for (const regionId of state.selectedRegionIds) {
          for (const track of state.tracks) {
            const idx = track.regions.findIndex((r) => r.id === regionId);
            if (idx !== -1) {
              track.regions.splice(idx, 1);
              break;
            }
          }
        }
        state.selectedRegionIds = [];
        state.project.modifiedAt = Date.now();
      });
      get().pushHistory('Cut');
    },
    
    paste: (time) => {
      const state = get();
      const pasteTime = time ?? state.playback.currentTime;
      
      set((state) => {
        if (state.clipboard.regions.length === 0) return;
        
        // Find earliest region time to calculate offset
        const earliestTime = Math.min(...state.clipboard.regions.map((r) => r.startTime));
        const offset = pasteTime - earliestTime;
        
        for (const region of state.clipboard.regions) {
          const targetTrack = state.tracks.find((t) => t.id === region.trackId) || state.tracks[0];
          if (targetTrack) {
            const newRegion: AudioRegion = {
              ...region,
              id: nanoid(),
              trackId: targetTrack.id,
              startTime: region.startTime + offset,
              selected: true,
            };
            targetTrack.regions.push(newRegion);
            state.selectedRegionIds.push(newRegion.id);
          }
        }
        
        state.project.modifiedAt = Date.now();
      });
      get().pushHistory('Paste');
    },
    
    // === HISTORY ACTIONS ===
    
    undo: () => {
      // Simplified undo - would need deeper implementation for full support
      const state = get();
      if (state.historyIndex > 0) {
        set((state) => {
          state.historyIndex--;
        });
      }
    },
    
    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        set((state) => {
          state.historyIndex++;
        });
      }
    },
    
    pushHistory: (action) => {
      set((state) => {
        // Simple history tracking
        const entry: HistoryEntry = {
          id: nanoid(),
          action,
          timestamp: Date.now(),
          state: {}, // Would store relevant state snapshot
        };
        
        // Truncate future history if we're not at the end
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        
        state.history.push(entry);
        state.historyIndex = state.history.length - 1;
        
        // Limit history size
        if (state.history.length > 100) {
          state.history.shift();
          state.historyIndex--;
        }
      });
    },
    
    // === UTILITY FUNCTIONS ===
    
    getTrackById: (trackId) => {
      const state = get();
      if (trackId === 'master') return state.masterTrack;
      return state.tracks.find((t) => t.id === trackId);
    },
    
    getRegionById: (regionId) => {
      const state = get();
      for (const track of state.tracks) {
        const region = track.regions.find((r) => r.id === regionId);
        if (region) return region;
      }
      return undefined;
    },
    
    getRegionsAtTime: (time) => {
      const state = get();
      const regions: AudioRegion[] = [];
      
      for (const track of state.tracks) {
        for (const region of track.regions) {
          if (time >= region.startTime && time < region.startTime + region.duration) {
            regions.push(region);
          }
        }
      }
      
      return regions;
    },
    
    getSelectedRegions: () => {
      const state = get();
      const regions: AudioRegion[] = [];
      
      for (const track of state.tracks) {
        for (const region of track.regions) {
          if (region.selected) {
            regions.push(region);
          }
        }
      }
      
      return regions;
    },
    
    timeToPixels: (time) => {
      const state = get();
      return time * state.view.zoom;
    },
    
    pixelsToTime: (pixels) => {
      const state = get();
      return pixels / state.view.zoom;
    },
    
    snapToGrid: (time) => {
      const state = get();
      if (!state.view.snapEnabled) return time;
      
      const beatsPerSecond = state.project.bpm / 60;
      const secondsPerBeat = 1 / beatsPerSecond;
      const gridInterval = secondsPerBeat * state.view.snapValue * 4; // snapValue is in quarter notes
      
      return Math.round(time / gridInterval) * gridInterval;
    },
  }))
);

export default useWorkstationStore;
