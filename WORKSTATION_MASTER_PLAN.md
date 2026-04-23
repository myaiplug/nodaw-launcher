# NoDAW — VAULT Components & Workstation Master Plan
**Date:** April 14, 2026  
**Status:** Architecture Documentation + Implementation Roadmap

---

## Part 1: VAULT Components Explained

### What Are VAULT Components?

VAULT is a **premium UI component system** we built for NoDAW. Think of it as the visual identity system — mechanical, industrial, sci-fi security aesthetic.

**The components:**
 
| Component              | What It Does                                                            | File |
|-----------------------|-------------                                                                |------| 
| **VaultDoor**         | Dual sliding blast doors with servo sounds                     | `components/core/VaultDoor.tsx` |
| **VaultBottomBar**    | Two panels that slide from edges and meet in the middle         | `components/core/VaultBottomBar.tsx` |
| **RotaryKnob**        | Draggable knob with detent clicks (like a real amplifier knob) | `components/core/VaultControls.tsx` |
| **ToggleSwitch**      | Physical-looking toggle with spring animation                   | `components/core/VaultControls.tsx` |
| **PushButton**        | Momentary or toggle button with LED indicator                  | `components/core/VaultControls.tsx` |
| **SliderControl**     | Horizontal/vertical fader with tick sounds                      | `components/core/VaultControls.tsx` |
| **DiagonalFlipPanel** | Metallic panel that flips on a diagonal axis (3D effect)         | `components/core/DiagonalFlipPanel.tsx` |

**Visual concept:**
```
┌─────────────────────────────────────────────────────────┐
│  VAULT DOOR (Closed - protecting content)               │
│  ┌────────────────┬┬┬────────────────┐                  │
│  │  LEFT DOOR     │││   RIGHT DOOR   │                  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓  │▓│  ▓▓▓▓▓▓▓▓▓▓▓▓  │ <- Brushed metal │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓  │▓│  ▓▓▓▓▓▓▓▓▓▓▓▓  │                  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓  │▓│  ▓▓▓▓▓▓▓▓▓▓▓▓  │                  │
│  └────────────────┴┴┴────────────────┘                  │
│                    ↑                                    │
│               Glowing seam                              │
│                                                         │
│  [Unlock] → Doors slide apart with servo motor sound   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Sound effects built-in:**
- Unlock click (mechanical latch release)
- Servo motor (hydraulic slide sound)
- Lock engage (heavy bolt sound)
- Knob detent clicks (like turning a real amp knob)
- Toggle switch snap
- Button press/release

**Where they could be used:**
1. App startup sequence → VaultDoor opens to reveal launcher
2. Pro tool unlock → Door opens when license verified
3. Settings panel → RotaryKnobs for volume, ToggleSwitches for options
4. Hidden features → DiagonalFlipPanel reveals advanced options

**Current status:** Built but NOT integrated into the launcher. They're ready to use.

---

## Part 2: StemSplit/ScrewIt Launching — No CLI Visible

### Good News: The CLI Is Already Hidden

Looking at the code in `electron/main.cjs`:

```javascript
spawn(appInfo.exe, [], { 
  cwd: appInfo.dir,
  detached: true,        // ← Runs independently
  stdio: 'ignore'        // ← NO CONSOLE WINDOW SHOWN
}).unref();
```

**`stdio: 'ignore'`** means the terminal/console window is completely hidden from the user. They never see any command line.

**`detached: true`** means the sub-app runs as its own process — if the launcher closes, StemSplit/ScrewIt keep running.

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NoDAW LAUNCHER                          │
│         (Main Electron Window - what user sees)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ IPC: 'launch-subapp'
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     MAIN PROCESS                            │
│    electron/main.cjs                                        │
│                                                             │
│    spawn('StemSplit.exe', { stdio: 'ignore' })             │
│           │                                                 │
│           │ (hidden, no console)                            │
│           ▼                                                 │
│    ┌─────────────────┐                                      │
│    │  STEMSPLIT.EXE  │  ← User sees GUI window, not CLI    │
│    └─────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

### Improvements We Should Add

Even though CLI is hidden, we need better **error handling** and **status monitoring**:

#### 1. Process Health Monitoring

```typescript
// Track launched sub-apps
const runningApps = new Map<string, {
  process: ChildProcess,
  startTime: number,
  status: 'starting' | 'running' | 'error' | 'exited'
}>();

// Monitor process status
subProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    // Send error to renderer
    mainWindow.webContents.send('subapp-error', {
      app: appName,
      exitCode: code,
      signal
    });
  }
});

subProcess.on('error', (err) => {
  mainWindow.webContents.send('subapp-error', {
    app: appName,
    error: err.message
  });
});
```

#### 2. User-Facing Status Modal

Instead of any CLI, show elegant modals:

```tsx
// When launch fails
<Modal title="StemSplit Launch Error">
  <p>StemSplit encountered a problem starting.</p>
  <ErrorDetails code={error.code} message={error.message} />
  <ActionButtons>
    <Button onClick={retryLaunch}>Try Again</Button>
    <Button onClick={openTroubleshooter}>Troubleshoot</Button>
    <Button onClick={downloadInstaller}>Reinstall</Button>
  </ActionButtons>
</Modal>
```

#### 3. Auto-Handle "Press Enter" Scenarios

If any subprocess DOES require user input (shouldn't happen but just in case):

```javascript
// Dev mode - pipe stdin to auto-respond
const subProcess = spawn(cmd, args, {
  stdio: ['pipe', 'pipe', 'pipe'] // capture all streams
});

// Auto-answer any prompts
subProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Detect common prompts
  if (output.includes('Press Enter') || output.includes('[Y/n]')) {
    subProcess.stdin.write('\n'); // Auto-press enter
  }
  
  // Log for debugging (not shown to user)
  logToFile(output);
});
```

---

## Part 3: NoDAW Workstation — Full Implementation Plan

You want a mini-DAW that's **faster for common tasks** than full DAWs. Here's the complete architecture.

### 3.1 Core Value Proposition

> "NoDAW Workstation makes big edits faster than your DAW takes to boot."

**Target use cases:**
1. Combine stems into a single track (from StemSplit output)
2. Quick automation edits (fade in/out, volume, pan)
3. Apply DSP effects to selections
4. Render final mix without DAW overhead
5. Add producer tag 

**NOT trying to compete with:**
- Full arrangement/composition (Ableton, FL)
- Recording/tracking (Pro Tools, Logic)
- Synthesis/sound design (Serum, Vital)

### 3.2 UI Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NODAW WORKSTATION                                           [─][□][✕]  │
├─────────────────────────────────────────────────────────────────────────┤
│  TOOLBAR                                                                │
│  [Import] [Export] [Play] [Stop] | [Undo] [Redo] | [Snap: 1/4] [BPM:120]│
├─────────────────────────────────────────────────────────────────────────┤
│        │ Timeline Ruler (beats/bars or time)                            │
│        │ 1--|--2--|--3--|--4--|--5--|--6--|--7--|--8--|                 │
│  ┌─────┼─────────────────────────────────────────────────────────────┐  │
│  │TRACK│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │
│  │  1  │ Vocals.wav                                                  │  │
│  ├─────┼─────────────────────────────────────────────────────────────┤  │
│  │     │ ┌─ Automation: Volume ──────────────────────────────────┐   │  │
│  │     │ │    ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲             │  │  │
│  │     │ │___╱                                       ╲____________ │  │
│  │     │ └───────────────────────────────────────────────────────┘   │  │
│  ├─────┼─────────────────────────────────────────────────────────────┤  │
│  │TRACK│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │  │
│  │  2  │ Drums.wav                     Bass.wav                      │  │
│  ├─────┼─────────────────────────────────────────────────────────────┤  │
│  │TRACK│ ░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░     │  │
│  │  3  │        Guitar.wav                                           │  │
│  └─────┴─────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  INSPECTOR (when region selected)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Selection: Vocals.wav [00:00.000 - 03:24.512]                   │    │
│  │ [Apply FX ▼] [Automate ▼] [Split] [Delete] [Duplicate]          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│  TRANSPORT: ◀◀  ▶  ◼  ▶▶  │ 00:01:24.156 │ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ (meters)  
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Track System

```typescript
interface Track {
  id: string;
  name: string;
  type: 'audio' | 'master' | 'bus';
  regions: AudioRegion[];
  automationLanes: AutomationLane[];
  color: string;
  height: number; // pixels
  
  // Mix properties
  volume: number;      // 0 to 1 (0dB = 1.0)
  pan: number;         // -1 (L) to +1 (R)
  mute: boolean;
  solo: boolean;
  
  // Routing
  output: string;      // 'master' or bus ID
  effects: EffectChain;
}

interface AudioRegion {
  id: string;
  trackId: string;
  sourceFile: string;  // path to audio file
  startTime: number;   // position on timeline (seconds)
  duration: number;    // length (seconds)
  offset: number;      // start point within source file
  gain: number;        // region-level gain (not automation)
  fadeIn: FadeConfig;
  fadeOut: FadeConfig;
  
  // Visual
  waveformData: Float32Array; // pre-computed for display
  color?: string;
}

interface FadeConfig {
  duration: number;
  curve: 'linear' | 'exponential' | 'scurve' | 'logarithmic';
}
```

### 3.4 Automation System (Your Request)

This is the big one. Full point-based automation with bezier curves.

```typescript
interface AutomationLane {
  id: string;
  trackId: string;
  parameter: AutomatableParameter;
  points: AutomationPoint[];
  visible: boolean;
  height: number;     // pixels when expanded
  color: string;
}

type AutomatableParameter = 
  | 'volume'
  | 'pan'
  | 'fxMix'          // Wet/dry for effects
  | 'magicMeter'     // Your "Soundgoodizer" effect intensity
  | `fx.${string}`;  // Any effect parameter: 'fx.reverb.decay'

interface AutomationPoint {
  id: string;
  time: number;       // position in seconds
  value: number;      // 0-1 normalized value
  
  // Curve from THIS point to NEXT point
  curveType: 'hold' | 'linear' | 'exponential' | 'bezier';
  
  // For bezier curves
  controlPoint1?: { x: number; y: number }; // relative to this point
  controlPoint2?: { x: number; y: number }; // relative to next point
}
```

#### Automation Curve Types

```
1. HOLD (Step)
   Value stays constant until next point, then jumps
   
   ┌───────┐
   │       │
   │       └───────
   
2. LINEAR (Angled)
   Straight line between points
   
        ╱
      ╱
    ╱
   
3. EXPONENTIAL (Fade curves)
   Fast start, slow end (or vice versa)
   
   ╭─────────
   │
   │
   
4. BEZIER (Custom curves)
   Drag handles for full control
   
     ●────○
    ╱       ╲
   ●          ○────●
   
   ● = automation point
   ○ = bezier control handle
```

#### Automation Editor Modal

When user clicks "Automate" on a selection:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AUTOMATION EDITOR                                              [✕]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Parameter: [Volume ▼]    Range: -∞ to +6dB                            │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ +6dB ──────────────────────────────────────────────────────────── │  │
│  │                                                                   │  │
│  │   0dB ─────────●━━━━━━━━━━━━━━━━━━━━●─────────────────────────── │  │
│  │               ╱                      ╲                            │  │
│  │              ╱                        ╲                           │  │
│  │   -6dB ────●                            ●──────────────────────── │  │
│  │                                                                   │  │
│  │  -∞dB ──────────────────────────────────────────────────────────  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│       |    1    |    2    |    3    |    4    |    5    | bars         │
│                                                                         │
│  TOOLS:  [◉ Draw] [⊕ Add Point] [⊖ Delete Point] [↔ Move]              │
│                                                                         │
│  PRESETS:                                                               │
│  [Fade In] [Fade Out] [Swell] [Dip] [Pulse] [Ramp Up] [Ramp Down]      │
│                                                                         │
│  CURVE TYPE: [Hold] [Linear ●] [Exponential] [Bezier]                   │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│  [Cancel]                                    [Preview] [Apply to Track] │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Click-Drag Selection + FX Application

User workflow:
1. Click and drag on waveform to select time range
2. Selection highlights in cyan
3. Right-click or click "Apply FX" button
4. FX popup appears

```typescript
interface TimeSelection {
  trackId: string;      // Which track (or null for all tracks)
  startTime: number;
  endTime: number;
  
  // Computed
  duration: number;
  affectedRegions: AudioRegion[]; // regions that overlap selection
}
```

#### FX Application Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  APPLY EFFECTS TO SELECTION                                     [✕]    │
│  Selection: 00:01:24.000 → 00:02:48.500 (1:24.500)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  EFFECT CHAIN:                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  1. [🔊 Normalize ▼]              [Settings] [X Remove]           │  │
│  │  2. [🎚️ Compressor ▼]             [Settings] [X Remove]           │  │
│  │  3. [🌊 Reverb ▼]                 [Settings] [X Remove]           │  │
│  │  4. [✨ Magic Meter ▼]            [Settings] [X Remove]           │  │
│  │                                                                   │  │
│  │  [+ Add Effect]                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  QUICK PRESETS:                                                         │
│  [Vocal Polish] [Drum Punch] [Master Bus] [Lo-Fi] [Radio Ready]        │
│                                                                         │
│  OPTIONS:                                                               │
│  [x] Preview before applying                                           │
│  [ ] Create new track with result (non-destructive)                    │
│  [x] Normalize output                                                  │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│  [Cancel]                            [▶ Preview] [✓ Apply Effects]     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.6 Magic Meter (Soundgoodizer-Style Effect)

Your signature "make it sound good" one-knob effect:

```typescript
interface MagicMeterConfig {
  intensity: number;    // 0-100
  mode: 'warm' | 'bright' | 'punch' | 'wide' | 'vintage' | 'modern';
}

// Under the hood, "Magic Meter" is a preset chain:
const magicMeterChains: Record<string, EffectChain> = {
  warm: [
    { type: 'eq', config: { lowShelf: +3, highShelf: -2 } },
    { type: 'saturation', config: { drive: 'intensity * 0.3' } },
    { type: 'compressor', config: { ratio: 4, threshold: -12 } }
  ],
  bright: [
    { type: 'eq', config: { presence: +4, air: +3 } },
    { type: 'exciter', config: { harmonics: 'intensity * 0.5' } },
    { type: 'limiter', config: { ceiling: -0.3 } }
  ],
  punch: [
    { type: 'transientShaper', config: { attack: +6, sustain: -3 } },
    { type: 'compressor', config: { ratio: 6, attack: 5, release: 50 } },
    { type: 'saturation', config: { drive: 'intensity * 0.2' } }
  ],
  // ... etc
};
```

### 3.7 DSP Effects Library

High-quality Web Audio + custom DSP:

| Effect | Parameters | Quality Note |
|--------|------------|--------------|
| **EQ** | Low/Mid/High bands, Q, frequency | Precise 64-point FFT |
| **Compressor** | Threshold, ratio, attack, release, knee | Look-ahead option |
| **Limiter** | Ceiling, release | True peak limiting |
| **Reverb** | Decay, size, damping, wet/dry | Convolution-based (IR library) |
| **Delay** | Time, feedback, wet/dry, sync to BPM | Ping-pong option |
| **Chorus** | Rate, depth, voices | Stereo spread |
| **Distortion** | Drive, tone, type | Tube/tape/digital modes |
| **Pitch Shift** | Semitones, cents, formant preserve | Phase vocoder |
| **Time Stretch** | Ratio, preserve pitch | Elastique-quality goal |
| **De-esser** | Frequency, threshold, reduction | Sibilance detection |
| **Noise Gate** | Threshold, attack, hold, release | Sidechain input |
| **Stereo Widener** | Width, bass mono | M/S processing |
| **Magic Meter** | Intensity, mode | One-knob wonder |

### 3.8 File Format Support

| Format | Import | Export | Notes |
|--------|--------|--------|-------|
| WAV | ✓ | ✓ | 16/24/32-bit, up to 192kHz |
| MP3 | ✓ | ✓ | Via LAME encoder |
| FLAC | ✓ | ✓ | Lossless |
| OGG | ✓ | ✓ | Vorbis codec |
| M4A/AAC | ✓ | ✓ | Via ffmpeg |
| AIFF | ✓ | ✓ | Apple format |

### 3.9 Implementation Phases

#### Phase 1: Core Timeline (2 weeks)

```
TODO:
[x] Project state management (Zustand store)
[x] Track list component (add/remove/reorder)
[x] Timeline ruler (zoom, scroll)
[x] Waveform rendering (pre-computed, cached)
[x] Region drag & drop (import files)
[x] Basic playback (Web Audio)
[x] Region trimming (handles on edges)
[x] Region moving (drag on timeline)
[ ] Region copy/paste/delete
[ ] Snap to grid
[ ] Undo/redo system
```

#### Phase 2: Selection & Basic Editing (1 week)

```
TODO:
[ ] Click-drag time selection
[ ] Selection to region boundaries
[ ] Split at selection
[ ] Delete selection
[ ] Duplicate selection
[ ] Fade in/out handles on regions
```

#### Phase 3: Automation (2 weeks)

```
TODO:
[ ] Automation lane UI
[ ] Point creation (click to add)
[ ] Point dragging
[ ] Curve type selection
[ ] Bezier handle editing
[ ] Automation presets
[ ] Real-time automation playback
[ ] Automation recording (write mode)
```

#### Phase 4: Effects System (2 weeks)

```
TODO:
[ ] Web Audio effect nodes
[ ] Effect chain UI
[ ] Parameter controls per effect
[ ] Real-time preview
[ ] Render-in-place (apply to region)
[ ] Effect presets
[ ] Magic Meter implementation
```

#### Phase 5: Mix & Export (1 week)

```
TODO:
[ ] Track mixer (volume, pan, mute, solo)
[ ] Master bus effects
[ ] Metering (peak, RMS, LUFS)
[ ] Export dialog
[ ] Render to file (bounce)
[ ] Multi-format export
```

### 3.10 Keyboard Shortcuts

Power users want SPEED:

| Action | Shortcut |
|--------|----------|
| Play/Pause | `Space` |
| Stop (return to start) | `Enter` |
| Split at playhead | `S` |
| Delete selection | `Delete` / `Backspace` |
| Duplicate | `Ctrl+D` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Shift+Z` |
| Select all | `Ctrl+A` |
| Zoom in | `Ctrl+=` or scroll |
| Zoom out | `Ctrl+-` or scroll |
| Add automation point | `A` |
| Toggle automation view | `Ctrl+A` |
| Open FX panel | `F` |
| Snap toggle | `N` |
| Loop selection | `L` |

---

## Part 4: Updated Tool Tier System

| Tool | Tier | Status | Notes |
|------|------|--------|-------|
| TrimIt | FREE | Ready | Audio trimming |
| ConvertIt | FREE | Ready | Format conversion |
| TestIt | FREE | Ready | A/B comparison |
| SplitIt | PRO | Ready | External app (StemSplit) |
| ScrewIt | PRO | Ready | External app (HalfScrew) |
| FXit | PRO | 60% | Effect chains (needs audio engine) |
| **Workstation** | PRO+ | 40% → Building | Mini-DAW |

---

## Part 5: VAULT Integration Plan

Once Workstation is stable, add VAULT for premium experience:

1. **App startup** — VaultDoor opens to reveal launcher
2. **Pro unlock** — VaultDoor ceremony when activating license
3. **Workstation mixer** — RotaryKnobs for track volume/pan
4. **Settings** — ToggleSwitches for preferences
5. **Feature reveal** — DiagonalFlipPanels for hidden features

---

## Part 6: Next Steps

1. **Immediately:** Create `WorkstationPanel.tsx` with basic timeline
2. **This week:** Track system + region display + basic playback
3. **Next week:** Selection + automation lanes
4. **Week 3:** Effects system + Magic Meter
5. **Week 4:** Polish + export + VAULT integration

---

**Ready to build Workstation?** Let me know and I'll start with the core timeline components.
