# DESIGN SYSTEMS MASTER PROMPT ENGINEERING DOCUMENT
## Claude Opus 4.5 Optimized • Awwwards-Grade Frontend Generation

> **Document Purpose**: Exhaustive prompt engineering specification for generating the highest-quality, most innovative frontend code through Claude Opus 4.5. This document contains 10 unique design systems plus the core "VAULT" paradigm—each optimized for hyper-intelligent AI comprehension and efficient token usage.

---

## TABLE OF CONTENTS

1. [Claude Opus 4.5 Prompting Protocol](#1-claude-opus-45-prompting-protocol)
2. [Core Aesthetic: The VAULT Paradigm](#2-core-aesthetic-the-vault-paradigm)
3. [WebGL Motion Architecture](#3-webgl-motion-architecture)
4. [Sound Design System](#4-sound-design-system)
5. [Ten Unique Design Systems](#5-ten-unique-design-systems)
6. [Component Blueprints](#6-component-blueprints)
7. [Implementation Templates](#7-implementation-templates)
8. [Quality Assurance Gates](#8-quality-assurance-gates)

---

# 1. CLAUDE OPUS 4.5 PROMPTING PROTOCOL

## 1.1 Optimal Prompting Structure

Claude Opus 4.5 responds best to structured, hierarchical prompts with clear intent signals. Follow this architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: CONTEXT PRIMING                                   │
│  - Role assignment (expert identity)                        │
│  - Domain expertise boundaries                              │
│  - Quality expectations                                     │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: TASK SPECIFICATION                                │
│  - Concrete deliverable definition                          │
│  - Technical constraints                                    │
│  - Success criteria                                         │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: AESTHETIC PARAMETERS                              │
│  - Visual language vocabulary                               │
│  - Reference anchors (real-world analogues)                 │
│  - Anti-patterns (what to avoid)                            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: IMPLEMENTATION DETAILS                            │
│  - Technology stack                                         │
│  - File structure expectations                              │
│  - Code style preferences                                   │
└─────────────────────────────────────────────────────────────┘
```

## 1.2 Token Efficiency Strategies

**DO**:
- Use hierarchical bullet structures (Claude parses faster)
- Provide concrete examples over abstract descriptions
- Include "NOT this, BUT this" contrasts
- Use technical terminology precisely
- Break complex requests into numbered sequences

**DON'T**:
- Repeat information in different words
- Use vague qualifiers ("make it nice", "add some effects")
- Over-explain obvious concepts
- Include irrelevant context

## 1.3 Quality Maximization Keywords

Claude Opus 4.5 responds to these quality signals:

| Signal Type | Keywords |
|-------------|----------|
| **Precision** | "pixel-perfect", "mathematically precise", "sub-pixel accuracy" |
| **Innovation** | "novel approach", "unprecedented", "first-of-its-kind" |
| **Performance** | "GPU-optimized", "60fps guaranteed", "zero jank" |
| **Realism** | "physically-based", "photorealistic", "cinema-grade" |
| **Code Quality** | "production-ready", "type-safe", "fully documented" |

## 1.4 Expert Role Assignment Template

```markdown
You are a world-class frontend engineer specializing in:
- Award-winning WebGL/Three.js implementations
- Cinematic UI motion design (Framer Motion, GSAP)
- Physically-based material rendering
- Spatial audio integration
- Performance-critical animation systems

Your code has won multiple Awwwards Site of the Day/Year honors.
You write production-ready TypeScript with exhaustive type safety.
Every component includes performance optimizations and accessibility.
```

---

# 2. CORE AESTHETIC: THE VAULT PARADIGM

## 2.1 Design Philosophy

**THE VAULT** is a design paradigm inspired by:
- High-security facility blast doors
- Spacecraft airlock mechanisms
- Luxury safe deposit vault aesthetics
- Military-grade equipment interfaces
- Cinematic sci-fi UI (Minority Report, Iron Man, Prometheus)

### Visual DNA

```
┌─────────────────────────────────────────────────────────────┐
│                    THE VAULT VISUAL DNA                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MATERIALS         LIGHTING          MOTION                 │
│  ───────────       ────────          ──────                 │
│  Brushed steel     Studio rim        Mechanical             │
│  Anodized alloy    Blue hour ambient Pneumatic              │
│  Carbon fiber      Lens flare        Hydraulic              │
│  Smoked glass      Caustic bounce    Servo-precise          │
│  Chrome trim       Edge glow         Weight-conscious       │
│                                                             │
│  TEXTURES          SOUNDS            STATES                 │
│  ────────          ──────            ──────                 │
│  Fingerprints      Servo whir        Locked                 │
│  Micro-scratches   Pneumatic hiss    Unlocking              │
│  Dust particles    Magnetic clunk    Open                   │
│  Condensation      Electronic chirp  Processing             │
│  Heat distortion   Ambient hum       Alert                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 The Security Door Mechanism

### Primary Animation: Dual-Door Convergence

```
CLOSED STATE:
┌─────────────────────────────────────────────────────────────┐
│ ◄════════════════ DOOR A ════════════════►                  │
│                    │ │                                      │
│                    │ │ ← Seam line with glow               │
│                    │ │                                      │
│ ◄════════════════ DOOR B ════════════════►                  │
└─────────────────────────────────────────────────────────────┘

OPENING SEQUENCE (1200ms total):
├── 0-100ms:    Ambient hum increases, edge glow intensifies
├── 100-200ms:  Magnetic release sound, doors unlock
├── 200-400ms:  Doors begin sliding outward (ease-out-expo)
├── 400-800ms:  Full slide with servo whir audio
├── 800-1000ms: Doors exit viewport
├── 1000-1200ms: Content fades in with subtle scale

CLOSING SEQUENCE (reverse with different easing):
├── 0-200ms:    Content fades, warning chime
├── 200-600ms:  Doors slide inward (ease-in-out-quart)
├── 600-900ms:  Convergence slowdown (ease-out-cubic)
├── 900-1100ms: Magnetic lock engage, satisfying clunk
├── 1100-1200ms: Edge glow pulse, seal complete
```

### Secondary Animation: Diagonal Panel Flip

```
PANEL GEOMETRY:
     ┌──────────────┐
    ╱              ╱│
   ╱              ╱ │
  ╱              ╱  │
 ╱──────────────╱   │
 │              │   │
 │   CONTROL    │  ╱
 │    PANEL     │ ╱
 │              │╱
 └──────────────┘

FLIP ANIMATION:
- Axis: Diagonal (top-left to bottom-right)
- Rotation: 180° around diagonal axis
- Duration: 600ms
- Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55) // Overshoot
- Reveals: Secondary controls on reverse side
- Sound: Metallic pivot + pneumatic cushion
```

## 2.3 Material Specifications

### Brushed Steel (Primary Surface)

```css
/* CSS Custom Properties for Brushed Steel */
--steel-base: linear-gradient(
  135deg,
  hsl(210, 8%, 25%) 0%,
  hsl(210, 10%, 35%) 25%,
  hsl(210, 8%, 30%) 50%,
  hsl(210, 10%, 28%) 75%,
  hsl(210, 8%, 22%) 100%
);

--steel-highlight: linear-gradient(
  90deg,
  transparent 0%,
  rgba(255, 255, 255, 0.03) 45%,
  rgba(255, 255, 255, 0.08) 50%,
  rgba(255, 255, 255, 0.03) 55%,
  transparent 100%
);

--steel-grain: url("data:image/svg+xml,<svg>...</svg>");
/* Anisotropic grain pattern running horizontally */
```

### Three.js Material Definition

```typescript
const brushedSteelMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x4a5568,
  metalness: 0.9,
  roughness: 0.35,
  clearcoat: 0.1,
  clearcoatRoughness: 0.4,
  anisotropy: 0.8,
  anisotropyRotation: Math.PI / 2,
  envMapIntensity: 1.2,
  // Custom shader for brushed grain
  onBeforeCompile: (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      // Anisotropic brushing direction
      vec2 brushDir = normalize(vec2(1.0, 0.0));
      float brushNoise = snoise(vUv * 200.0) * 0.5 + 0.5;
      roughnessFactor *= 0.8 + brushNoise * 0.4;
      `
    );
  }
});
```

## 2.4 Lighting Rig

### Studio Setup (Three.js)

```typescript
const createVaultLighting = () => {
  const lights: THREE.Light[] = [];
  
  // Key Light: Blue hour sun simulation
  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  keyLight.position.set(5, 8, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  lights.push(keyLight);
  
  // Fill Light: Cool ambient from opposite side
  const fillLight = new THREE.DirectionalLight(0x8899bb, 0.4);
  fillLight.position.set(-3, 2, -2);
  lights.push(fillLight);
  
  // Rim Light: Edge definition (hero light)
  const rimLight = new THREE.SpotLight(0x00d4ff, 0.8);
  rimLight.position.set(-2, 5, -5);
  rimLight.angle = Math.PI / 6;
  rimLight.penumbra = 0.5;
  lights.push(rimLight);
  
  // Practical Lights: UI glow simulation
  const practicalGlow = new THREE.PointLight(0x7b61ff, 0.6, 10);
  practicalGlow.position.set(0, 0, 2);
  lights.push(practicalGlow);
  
  // Ambient: HDRI-style fill
  const ambient = new THREE.AmbientLight(0x1a1a2e, 0.3);
  lights.push(ambient);
  
  return lights;
};
```

### Camera Settings Simulation (Depth of Field)

```typescript
// Canon EOS R5 with 135mm f/2 simulation
const createCinematicCamera = () => {
  const camera = new THREE.PerspectiveCamera(
    18, // ~135mm equivalent FOV
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Bokeh/DOF post-processing
  const bokehPass = new BokehPass(scene, camera, {
    focus: 3.0,
    aperture: 0.002, // f/2 equivalent
    maxblur: 0.01,
  });
  
  // Lens flare artifact
  const lensFlareTexture = textureLoader.load('/textures/lensflare.png');
  const lensFlare = new Lensflare();
  lensFlare.addElement(new LensflareElement(lensFlareTexture, 200, 0));
  lensFlare.addElement(new LensflareElement(lensFlareTexture, 60, 0.6));
  lensFlare.addElement(new LensflareElement(lensFlareTexture, 70, 0.7));
  
  return { camera, bokehPass, lensFlare };
};
```

## 2.5 Interactive Elements

### Knobs and Switches

```
ROTARY KNOB ANATOMY:
        ╭───────────────╮
       ╱   ┌───────┐   ╲
      │    │ GRIP  │    │
      │    │TEXTURE│    │
      │    └───┬───┘    │
      │        │        │
      │   ◄────┼────►   │  ← Rotation axis
      │        │        │
       ╲  ┌────┴────┐  ╱
        ╲ │INDICATOR│ ╱
         ╲└─────────┘╱
          ╰─────────╯
            BASE

INTERACTION:
- Hover: Subtle glow, indicator highlight
- Click+Drag: Rotation with resistance easing
- Release: Snap to nearest detent (12 positions)
- Sound: Detent click on each position

TOGGLE SWITCH:
     ┌─────────────────┐
     │    ╭─────╮      │
     │    │     │      │
     │    │ ● ◄─┼── Throw indicator
     │    │     │      │
     │    ╰─────╯      │
     │  ═══════════    │ ← Track groove
     └─────────────────┘

INTERACTION:
- Hover: Track illumination
- Click: Satisfying toggle (80ms)
- Sound: Mechanical switch clack
- Haptic: Vibration API pulse
```

---

# 3. WEBGL MOTION ARCHITECTURE

## 3.1 Performance Budget

```
┌─────────────────────────────────────────────────────────────┐
│                 PERFORMANCE BUDGET                          │
├─────────────────────────────────────────────────────────────┤
│  TARGET: 60fps (16.67ms per frame)                          │
│                                                             │
│  ALLOCATION:                                                │
│  ├── JavaScript execution    │████░░░░░░│ 4ms               │
│  ├── WebGL render calls      │████████░░│ 8ms               │
│  ├── Post-processing         │██░░░░░░░░│ 2ms               │
│  ├── Audio processing        │█░░░░░░░░░│ 1ms               │
│  └── Buffer (headroom)       │█░░░░░░░░░│ 1.67ms            │
│                                                             │
│  CONSTRAINTS:                                               │
│  - Max draw calls: 100                                      │
│  - Max triangles: 500,000                                   │
│  - Texture memory: 256MB                                    │
│  - Shader complexity: Medium                                │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Animation Timing Functions

```typescript
// Custom easing functions for mechanical motion
export const mechanicalEasings = {
  // Servo motor start-stop (sharp acceleration, sharp deceleration)
  servo: [0.77, 0, 0.175, 1],
  
  // Hydraulic with resistance (slow start, medium end)
  hydraulic: [0.645, 0.045, 0.355, 1],
  
  // Pneumatic release (fast out, cushioned stop)
  pneumatic: [0.19, 1, 0.22, 1],
  
  // Magnetic lock engagement (anticipation → snap)
  magneticLock: [0.68, -0.55, 0.265, 1.55],
  
  // Heavy door momentum (physics-based)
  heavyDoor: [0.16, 1, 0.3, 1],
  
  // Precision mechanism (linear with slight ease)
  precision: [0.25, 0.1, 0.25, 1],
};

// Spring configurations for Framer Motion
export const mechanicalSprings = {
  // Heavy blast door
  blastDoor: { stiffness: 80, damping: 20, mass: 2 },
  
  // Light panel flip
  panelFlip: { stiffness: 200, damping: 25, mass: 0.5 },
  
  // Knob rotation with detents
  knobDetent: { stiffness: 400, damping: 30, mass: 0.2 },
  
  // Toggle switch snap
  toggleSnap: { stiffness: 500, damping: 35, mass: 0.1 },
  
  // Hologram float
  hologramFloat: { stiffness: 50, damping: 10, mass: 1 },
};
```

## 3.3 Shader Library

### Hologram Effect Shader

```glsl
// Vertex Shader
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;

void main() {
  vUv = uv;
  vPosition = position;
  
  // Subtle vertex displacement for hologram flicker
  vec3 pos = position;
  pos.y += sin(position.x * 10.0 + uTime * 3.0) * 0.002;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Fragment Shader
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

// Scanline effect
float scanline(vec2 uv) {
  return sin(uv.y * 400.0 + uTime * 2.0) * 0.04 + 0.96;
}

// Chromatic aberration
vec3 chromaticAberration(vec2 uv, float amount) {
  float r = texture2D(tDiffuse, uv + vec2(amount, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(amount, 0.0)).b;
  return vec3(r, g, b);
}

// Edge glow
float edgeGlow(vec2 uv) {
  vec2 edge = abs(uv - 0.5) * 2.0;
  return pow(max(edge.x, edge.y), 3.0);
}

void main() {
  vec3 color = uColor;
  
  // Apply scanlines
  color *= scanline(vUv);
  
  // Edge glow
  float glow = edgeGlow(vUv);
  color += uColor * glow * 0.5;
  
  // Flicker
  float flicker = sin(uTime * 30.0) * 0.02 + 0.98;
  color *= flicker;
  
  // Output with hologram transparency
  float alpha = uOpacity * (1.0 - glow * 0.3);
  gl_FragColor = vec4(color, alpha);
}
```

### Brushed Metal Normal Map Generator

```glsl
// Procedural brushed metal normal generation
vec3 brushedMetalNormal(vec2 uv, float brushDirection, float intensity) {
  // Anisotropic noise along brush direction
  vec2 brushUV = rotate2D(uv, brushDirection);
  
  float noise1 = snoise(brushUV * vec2(500.0, 20.0));
  float noise2 = snoise(brushUV * vec2(800.0, 15.0) + 0.5);
  
  float combined = noise1 * 0.6 + noise2 * 0.4;
  
  // Convert to normal
  vec3 normal;
  normal.x = dFdx(combined) * intensity;
  normal.y = dFdy(combined) * intensity;
  normal.z = 1.0;
  
  return normalize(normal);
}
```

---

# 4. SOUND DESIGN SYSTEM

## 4.1 Audio Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO LAYERS                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYER 4: UI Feedback          │ Highest priority          │
│  ─────────────────────         │ Click, toggle, error      │
│                                │ Short, distinct           │
│                                                             │
│  LAYER 3: Mechanical Motion    │ Medium-high priority      │
│  ──────────────────────        │ Door slides, panel flips  │
│                                │ Synced to animation       │
│                                                             │
│  LAYER 2: State Transitions    │ Medium priority           │
│  ──────────────────────        │ Mode changes, alerts      │
│                                │ Musical/tonal             │
│                                                             │
│  LAYER 1: Ambient Loop         │ Lowest priority           │
│  ─────────────────────         │ Background hum, air       │
│                                │ Continuous, subtle        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Sound Effect Specifications

### Mechanical Sounds

| Sound | Duration | Characteristics | Trigger |
|-------|----------|-----------------|---------|
| **Door Slide Open** | 800ms | Servo whir + metal friction | Opening animation start |
| **Door Slide Close** | 600ms | Reverse whir + impact thud | Closing animation start |
| **Magnetic Lock** | 200ms | Deep clunk + electronic chirp | Lock engagement |
| **Panel Flip** | 400ms | Pivot squeak + air cushion | Panel rotation |
| **Knob Detent** | 50ms | Sharp click + subtle spring | Rotation snap |
| **Toggle Switch** | 80ms | Mechanical clack | State change |
| **Button Press** | 60ms | Tactile click + confirmation beep | Mousedown |
| **Button Release** | 40ms | Spring return | Mouseup |

### Ambient Sounds

| Sound | Loop Length | Characteristics | Context |
|-------|-------------|-----------------|---------|
| **System Idle** | 8s | Low electrical hum, air circulation | Default state |
| **Processing** | 4s | Rhythmic pulse, data stream whisper | Loading states |
| **Alert Ambient** | 2s | Subtle alarm undertone | Warning state |
| **Secure Mode** | 6s | Deeper hum, heartbeat pulse | Locked/authenticated |

## 4.3 Audio Implementation

```typescript
// Web Audio API sound manager
class VaultSoundManager {
  private context: AudioContext;
  private masterGain: GainNode;
  private layers: Map<string, AudioLayer>;
  private sounds: Map<string, AudioBuffer>;
  
  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    
    // Create gain nodes for each layer
    this.layers = new Map([
      ['ambient', this.createLayer(0.15)],
      ['transition', this.createLayer(0.4)],
      ['mechanical', this.createLayer(0.6)],
      ['ui', this.createLayer(0.8)],
    ]);
  }
  
  private createLayer(volume: number): AudioLayer {
    const gain = this.context.createGain();
    gain.gain.value = volume;
    gain.connect(this.masterGain);
    return { gain, activeNodes: [] };
  }
  
  async playSound(
    soundId: string, 
    layer: string,
    options: PlayOptions = {}
  ): Promise<void> {
    const buffer = this.sounds.get(soundId);
    if (!buffer) return;
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    // Optional pitch variation for realism
    if (options.pitchVariation) {
      source.playbackRate.value = 1 + (Math.random() - 0.5) * options.pitchVariation;
    }
    
    // Optional low-pass filter for muffled effect
    if (options.muffled) {
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(this.layers.get(layer)!.gain);
    } else {
      source.connect(this.layers.get(layer)!.gain);
    }
    
    source.start(this.context.currentTime + (options.delay || 0));
  }
  
  // Sync sound to animation timeline
  syncToAnimation(
    soundId: string,
    animationEvent: AnimationEvent,
    offset: number = 0
  ): void {
    animationEvent.addEventListener('start', () => {
      this.playSound(soundId, 'mechanical', { delay: offset / 1000 });
    });
  }
}
```

## 4.4 Spatial Audio (3D Positioning)

```typescript
// For immersive experiences with panning
const createSpatialSound = (
  soundManager: VaultSoundManager,
  position: THREE.Vector3,
  listenerPosition: THREE.Vector3
) => {
  const panner = soundManager.context.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 100;
  panner.rolloffFactor = 1;
  
  panner.positionX.value = position.x;
  panner.positionY.value = position.y;
  panner.positionZ.value = position.z;
  
  return panner;
};
```

---

# 5. TEN UNIQUE DESIGN SYSTEMS

Each system is a complete, differentiated aesthetic for a specific application type. All systems share the core VAULT paradigm but express it through unique visual languages.

---

## SYSTEM 1: NEUROVAULT
### *Neural Interface Command Center*

**Application Type**: AI/ML Dashboard, Neural Network Visualizer, Brain-Computer Interface

**Visual Language**:
```
AESTHETIC: Biological-mechanical fusion
PALETTE: Bioluminescent cyan, neural purple, synaptic gold
MATERIALS: Wet organic surfaces, glass neural tubes, chrome implants
MOTION: Pulse-based, neuron firing patterns, synaptic transmission
UNIQUE ELEMENT: Neural pathway animations connecting UI elements
```

**Signature Components**:
- **Synapse Connector**: Animated lines between cards showing data flow
- **Neural Cluster**: Organic-shaped containers that "grow" on interaction
- **Brainwave Meter**: Real-time oscillating waveform display
- **Memory Core**: Pulsing central orb representing AI state

**Door Mechanism Variant**:
- Doors split like cellular membranes
- Organic "healing" animation on close
- Bioluminescent edge glow
- Wet surface reflection

**Prompt Template**:
```markdown
Create a NEUROVAULT-style [component type] with:
- Bioluminescent accent color (#00f5d4 primary, #9b5de5 secondary)
- Organic membrane-like borders that pulse
- Neural pathway connector lines to adjacent elements
- Cell-division animation on open
- Wet glass material with subsurface scattering simulation
- Synaptic spark particles on interaction
```

---

## SYSTEM 2: CHRONOSPHERE
### *Time-Critical Operations Interface*

**Application Type**: Mission Control, Financial Trading, Emergency Response

**Visual Language**:
```
AESTHETIC: Precision chronograph meets mission control
PALETTE: Warning amber, critical red, operational green, steel gray
MATERIALS: Instrument glass, precision dials, radar screens
MOTION: Clock-sweep, countdown, heartbeat urgency
UNIQUE ELEMENT: Concentric time-ring animations
```

**Signature Components**:
- **Mission Clock**: Central dominant time display with sweep second
- **Alert Tier Indicator**: Color-coded urgency bands
- **Radar Sweep Panel**: Scanning animation for live data
- **Countdown Module**: Dramatic timing sequences

**Door Mechanism Variant**:
- Aperture iris open (like camera shutter)
- Clock-hand sweep reveal
- Urgency-scaled speed
- Countdown audio integration

**Prompt Template**:
```markdown
Create a CHRONOSPHERE-style [component type] with:
- Instrument bezel with chrome markers
- Sweep-hand animation on data updates
- Concentric ring progress indicators
- Urgency color system (green→amber→red)
- Radar-sweep loading animation
- Precision typography (tabular numerals required)
- Sub-second update capability with smooth interpolation
```

---

## SYSTEM 3: QUANTUM LATTICE
### *Scientific Computing & Research Platform*

**Application Type**: Research Dashboard, Quantum Computing, Data Science Workbench

**Visual Language**:
```
AESTHETIC: Atomic/quantum precision, laboratory instrument
PALETTE: Deep space black, quantum blue, particle white, energy violet
MATERIALS: Laboratory glass, precision optics, particle chamber
MOTION: Quantum superposition flicker, wave function collapse, particle trace
UNIQUE ELEMENT: Probability cloud visualizations
```

**Signature Components**:
- **Qubit Array**: Grid of quantum state indicators
- **Wave Function Display**: Animated probability distributions
- **Entanglement Lines**: Paired element connections
- **Uncertainty Meter**: Fuzzy-edge confidence indicators

**Door Mechanism Variant**:
- Quantum tunneling phase-through effect
- Probability wave that "collapses" on open
- Particle trace borders
- Heisenberg blur on transition

**Prompt Template**:
```markdown
Create a QUANTUM LATTICE-style [component type] with:
- Probability cloud glow effect (gaussian blur with flicker)
- Particle trace motion paths on drag
- Quantum superposition state indicator (dual-state shimmer)
- Wave function visualization (Three.js oscillating mesh)
- Scientific notation typography
- Schrödinger-state loading (appears both loaded and loading)
- Entanglement connection lines to related data
```

---

## SYSTEM 4: TITANFORGE
### *Heavy Industrial Control System*

**Application Type**: Manufacturing Control, Industrial IoT, Heavy Machinery Interface

**Visual Language**:
```
AESTHETIC: Forged metal, industrial strength, pressure gauges
PALETTE: Forge orange, molten yellow, tempered steel, carbon black
MATERIALS: Heavy plate steel, rivets, pressure vessels, heat shields
MOTION: Hydraulic press, steam release, conveyor belt, gear rotation
UNIQUE ELEMENT: Real physical weight simulation
```

**Signature Components**:
- **Pressure Gauge**: Animated needle with danger zones
- **Rivet Panel**: Heavy bordered containers
- **Molten Flow**: Orange glow data streams
- **Steam Vent**: Particle release on state changes

**Door Mechanism Variant**:
- Heavy hydraulic press doors
- Steam hiss on release
- Rivet-bordered panels
- Sparks on impact close

**Prompt Template**:
```markdown
Create a TITANFORGE-style [component type] with:
- Rivet border details (evenly spaced, embossed)
- Pressure gauge readout with danger zone markers
- Hydraulic motion timing (slow start, heavy momentum)
- Heat glow gradient on active elements
- Steam particle system on value changes
- Cast iron / forged steel texture
- Conveyor belt animation for data lists
- Industrial warning stripe patterns
```

---

## SYSTEM 5: AETHERNET
### *Cyberpunk Network Operations Center*

**Application Type**: Network Monitoring, Cybersecurity, Hacker Aesthetic Tools

**Visual Language**:
```
AESTHETIC: 80s cyberpunk meets modern minimalism
PALETTE: Neon pink, electric cyan, grid purple, void black
MATERIALS: CRT phosphor, wire mesh, exposed circuit, neon tube
MOTION: Glitch, scan line, terminal cursor, matrix rain
UNIQUE ELEMENT: ASCII art integration with modern UI
```

**Signature Components**:
- **Terminal Window**: Authentic CRT with phosphor glow
- **Grid Horizon**: Infinite perspective grid background
- **Neon Pipe**: Glowing connection lines
- **Glitch Layer**: Intentional corruption effects

**Door Mechanism Variant**:
- Vertical ASCII art render on close
- Scan-line wipe transition
- Glitch distortion bursts
- CRT power-down effect

**Prompt Template**:
```markdown
Create an AETHERNET-style [component type] with:
- CRT phosphor glow effect (green/amber/cyan variants)
- Scan line overlay (subtle, 2px spacing)
- ASCII art loading states
- Neon glow borders (#ff00ff, #00ffff)
- Grid perspective background
- Terminal-style monospace text with cursor blink
- Intentional glitch artifacts on hover
- VHS tracking distortion on transitions
```

---

## SYSTEM 6: SANCTUARY
### *Premium Secure Vault Interface*

**Application Type**: Password Manager, Banking, Private Document Storage

**Visual Language**:
```
AESTHETIC: Luxury vault, Swiss precision, old money security
PALETTE: Gold bullion, aged bronze, leather brown, vault steel
MATERIALS: Polished vault door, leather binding, brass hardware
MOTION: Combination lock dial, key turn, vault hinge (massive weight)
UNIQUE ELEMENT: Physical key/lock interaction
```

**Signature Components**:
- **Combination Dial**: Interactive spin-to-unlock
- **Vault Timer**: Time-lock countdown display
- **Safety Deposit Grid**: Individual secure containers
- **Seal Status**: Wax seal integrity indicator

**Door Mechanism Variant**:
- Classic vault door swing with physics
- Combination tumbler sounds
- Heavy locking bar retraction
- Gold trim edge lighting

**Prompt Template**:
```markdown
Create a SANCTUARY-style [component type] with:
- Polished brass/gold trim details
- Embossed leather texture areas
- Combination lock dial interaction (drag to spin)
- Vault tumbler sound on number alignment
- Heavy door physics (slow swing, momentum)
- Wax seal visual for verified/signed items
- Safety deposit box grid layout
- Swiss bank precision typography
```

---

## SYSTEM 7: ORACULUM
### *Mystical Data Divination Interface*

**Application Type**: Analytics Dashboard, Prediction Engine, Fortune/Probability Tools

**Visual Language**:
```
AESTHETIC: Mystical technology, crystal ball meets AI
PALETTE: Deep purple, starfield, crystal blue, gold rune
MATERIALS: Crystal, obsidian mirror, ancient metal, star map
MOTION: Crystal formation, constellation trace, smoke/mist, energy orb
UNIQUE ELEMENT: Mystical particle effects for all data
```

**Signature Components**:
- **Crystal Core**: Central prediction orb with swirling interior
- **Rune Keys**: Symbol-based controls
- **Star Chart**: Constellation-style data relationships
- **Mist Veil**: Fog transition between states

**Door Mechanism Variant**:
- Crystal shards assemble/disassemble
- Mystical symbols trace on edges
- Ethereal mist transitions
- Resonating tone on open

**Prompt Template**:
```markdown
Create an ORACULUM-style [component type] with:
- Crystal material with internal refraction
- Particle mist for transitions
- Constellation-style data point connections
- Ancient rune typography accents
- Mystical glow pulsation
- Obsidian mirror reflection effects
- Energy orb loading animation
- Tarot-card flip for reveals
```

---

## SYSTEM 8: PARALLAX PRIME
### *Infinite Depth Spatial Interface*

**Application Type**: 3D Visualization, Architecture, Spatial Computing

**Visual Language**:
```
AESTHETIC: Infinite depth, spatial UI, architectural precision
PALETTE: Blueprint blue, wireframe white, depth fade gray
MATERIALS: Glass planes, architectural wire, spatial grid
MOTION: Z-depth parallax, exploded view, layer separation
UNIQUE ELEMENT: True 3D depth with parallax scrolling
```

**Signature Components**:
- **Depth Stack**: Layered panels with parallax
- **Explode View**: 3D component breakdown
- **Wire Frame Overlay**: Blueprint visualization mode
- **Spatial Cursor**: 3D position indicator

**Door Mechanism Variant**:
- Z-depth push back (doors recede into infinity)
- Layer-by-layer reveal
- Parallax panel separation
- Architectural grid alignment

**Prompt Template**:
```markdown
Create a PARALLAX PRIME-style [component type] with:
- True 3D parallax depth (Three.js layer positioning)
- Glass plane materials with edge refraction
- Blueprint wire overlay option
- Exploded view animation on inspection
- Spatial depth indicators
- Architectural grid snapping
- Isometric projection option
- Layer separation on hover (z-translate)
```

---

## SYSTEM 9: BIOFORGE
### *Living Organism Interface*

**Application Type**: Health Monitoring, Biotech Dashboard, Medical Visualization

**Visual Language**:
```
AESTHETIC: Living tissue meets technology, organic growth
PALETTE: Arterial red, cell green, plasma blue, bone white
MATERIALS: Living tissue, vein networks, cell membranes
MOTION: Heartbeat pulse, cell division, blood flow, breathing
UNIQUE ELEMENT: Organic growth patterns for UI elements
```

**Signature Components**:
- **Heartbeat Monitor**: Central vital rhythm display
- **Vein Network**: Data flow visualized as blood vessels
- **Cell Colony**: Organic-growing data clusters
- **Breath Indicator**: Expand/contract ambient animation

**Door Mechanism Variant**:
- Membrane stretch and part
- Cell division reveal
- Arterial pulse on edges
- Organic closure "healing"

**Prompt Template**:
```markdown
Create a BIOFORGE-style [component type] with:
- Heartbeat-synced pulsation (72 BPM default)
- Vein-style connector lines with blood flow animation
- Cell membrane borders (organic, imperfect edges)
- Breathing expand/contract ambient animation
- Arterial red accent on critical values
- Cell division animation for splitting/spawning
- Organic growth entrance (elements "grow" into view)
- Tissue texture with translucency
```

---

## SYSTEM 10: VOIDRUNNER
### *Deep Space Navigation Interface*

**Application Type**: Space Exploration, Fleet Management, Astronomy Tools

**Visual Language**:
```
AESTHETIC: Deep space exploration, starship command
PALETTE: Nebula purple, star white, void black, thrust blue
MATERIALS: Spacecraft hull, viewscreen glass, star maps
MOTION: Starfield parallax, FTL streak, orbital path, thruster glow
UNIQUE ELEMENT: Infinite star field backgrounds
```

**Signature Components**:
- **Star Map**: Interactive celestial navigation
- **Warp Indicator**: FTL readiness gauge
- **Hull Status**: Spacecraft integrity display
- **Thrust Vector**: Navigation direction control

**Door Mechanism Variant**:
- Spacecraft airlock cycling
- Decompression warning sequence
- Blast shield deployment
- Starfield reveal on open

**Prompt Template**:
```markdown
Create a VOIDRUNNER-style [component type] with:
- Infinite starfield parallax background (Three.js particles)
- Spacecraft hull edge treatment
- FTL streak transition animation
- Orbital path curved connectors
- Nebula gradient backgrounds
- Thruster glow accent on active elements
- Starship HUD typography
- Radar/scanner sweeping animation
```

---

# 6. COMPONENT BLUEPRINTS

## 6.1 Universal Component Structure

Every component in any design system follows this structure:

```typescript
/**
 * [COMPONENT_NAME]
 * Design System: [SYSTEM_NAME]
 * 
 * [Description of component purpose]
 */

import React, { memo, forwardRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface [Component]Props {
  /** Primary variant selection */
  variant?: 'default' | 'accent' | 'subtle' | 'elevated';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom className override */
  className?: string;
  /** Child content */
  children?: React.ReactNode;
  /** Animation configuration */
  animate?: boolean;
  /** Sound effect on interaction */
  sound?: boolean;
  /** Accessibility label */
  'aria-label'?: string;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const VARIANTS: Record<string, Variants> = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
};

const STYLE_MAP = {
  variant: {
    default: 'bg-glass border-glass-border',
    accent: 'bg-glass-accent border-accent-primary',
    subtle: 'bg-glass-subtle border-glass-border-subtle',
    elevated: 'bg-glass-elevated border-glass-border-bright shadow-elevated',
  },
  size: {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
    xl: 'p-8 text-xl',
  },
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

const [Component] = forwardRef<HTMLDivElement, [Component]Props>(
  (
    {
      variant = 'default',
      size = 'md',
      className,
      children,
      animate = true,
      sound = true,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    // Hooks
    const soundManager = useSoundManager();
    
    // Event handlers
    const handleInteraction = () => {
      if (sound) {
        soundManager.play('ui-hover');
      }
    };
    
    // Computed styles
    const computedStyles = cn(
      'relative overflow-hidden rounded-lg backdrop-blur-md',
      'transition-all duration-200',
      STYLE_MAP.variant[variant],
      STYLE_MAP.size[size],
      className
    );
    
    // Render
    return (
      <motion.div
        ref={ref}
        className={computedStyles}
        variants={animate ? VARIANTS.container : undefined}
        initial={animate ? 'initial' : false}
        animate={animate ? 'animate' : false}
        exit={animate ? 'exit' : undefined}
        onHoverStart={handleInteraction}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

[Component].displayName = '[Component]';

export default memo([Component]);

// ═══════════════════════════════════════════════════════════
// [SELF-CRITIQUE]
// 
// Improvements for next iteration:
// 1. [Specific improvement]
// 2. [Specific improvement]
// 3. [Specific improvement]
// 
// ═══════════════════════════════════════════════════════════
```

## 6.2 The Vault Door Component

```typescript
/**
 * VaultDoor
 * The signature dual-door mechanism with full mechanical animation
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useSoundManager } from '@/hooks/useSoundManager';
import { mechanicalEasings, mechanicalSprings } from '@/utils/motion';

interface VaultDoorProps {
  isOpen: boolean;
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'emergency' | 'secure';
  soundEnabled?: boolean;
}

const DOOR_ANIMATION = {
  closed: {
    leftDoor: { x: 0 },
    rightDoor: { x: 0 },
    edgeGlow: { opacity: 0.3 },
  },
  opening: {
    leftDoor: { x: '-120%', transition: { duration: 0.8, ease: mechanicalEasings.servo } },
    rightDoor: { x: '120%', transition: { duration: 0.8, ease: mechanicalEasings.servo } },
    edgeGlow: { opacity: 1, transition: { duration: 0.1 } },
  },
  open: {
    leftDoor: { x: '-120%' },
    rightDoor: { x: '120%' },
    edgeGlow: { opacity: 0 },
  },
  closing: {
    leftDoor: { x: 0, transition: { duration: 0.6, ease: mechanicalEasings.hydraulic } },
    rightDoor: { x: 0, transition: { duration: 0.6, ease: mechanicalEasings.hydraulic } },
    edgeGlow: { opacity: 0.8, transition: { duration: 0.4, delay: 0.5 } },
  },
};

const VaultDoor: React.FC<VaultDoorProps> = ({
  isOpen,
  onOpenComplete,
  onCloseComplete,
  children,
  variant = 'default',
  soundEnabled = true,
}) => {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const soundManager = useSoundManager();
  const leftDoorControls = useAnimation();
  const rightDoorControls = useAnimation();
  const glowControls = useAnimation();

  // Animation sequence
  const runOpenSequence = useCallback(async () => {
    setPhase('opening');
    
    // Sound: Magnetic release
    if (soundEnabled) {
      soundManager.play('magnetic-release');
    }
    
    // Glow intensifies
    glowControls.start(DOOR_ANIMATION.opening.edgeGlow);
    
    // 100ms delay for unlock
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Sound: Servo whir
    if (soundEnabled) {
      soundManager.play('servo-whir', { duration: 800 });
    }
    
    // Doors slide
    await Promise.all([
      leftDoorControls.start(DOOR_ANIMATION.opening.leftDoor),
      rightDoorControls.start(DOOR_ANIMATION.opening.rightDoor),
    ]);
    
    // Complete
    setPhase('open');
    glowControls.start(DOOR_ANIMATION.open.edgeGlow);
    onOpenComplete?.();
  }, [soundEnabled, soundManager, leftDoorControls, rightDoorControls, glowControls, onOpenComplete]);

  const runCloseSequence = useCallback(async () => {
    setPhase('closing');
    
    // Sound: Warning chime
    if (soundEnabled) {
      soundManager.play('warning-chime');
    }
    
    // 200ms for content fade
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Sound: Servo return
    if (soundEnabled) {
      soundManager.play('servo-whir', { duration: 600, reverse: true });
    }
    
    // Doors converge
    await Promise.all([
      leftDoorControls.start(DOOR_ANIMATION.closing.leftDoor),
      rightDoorControls.start(DOOR_ANIMATION.closing.rightDoor),
    ]);
    
    // Sound: Magnetic lock
    if (soundEnabled) {
      soundManager.play('magnetic-lock');
    }
    
    // Glow pulse on seal
    await glowControls.start(DOOR_ANIMATION.closing.edgeGlow);
    await glowControls.start({ opacity: 0.3, transition: { duration: 0.2 } });
    
    setPhase('closed');
    onCloseComplete?.();
  }, [soundEnabled, soundManager, leftDoorControls, rightDoorControls, glowControls, onCloseComplete]);

  // React to isOpen changes
  useEffect(() => {
    if (isOpen && (phase === 'closed' || phase === 'closing')) {
      runOpenSequence();
    } else if (!isOpen && (phase === 'open' || phase === 'opening')) {
      runCloseSequence();
    }
  }, [isOpen, phase, runOpenSequence, runCloseSequence]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Left Door */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 z-20"
        animate={leftDoorControls}
        initial={{ x: 0 }}
      >
        <DoorPanel side="left" variant={variant} />
      </motion.div>

      {/* Right Door */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-20"
        animate={rightDoorControls}
        initial={{ x: 0 }}
      >
        <DoorPanel side="right" variant={variant} />
      </motion.div>

      {/* Center Seam Glow */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 z-30"
        animate={glowControls}
        initial={{ opacity: 0.3 }}
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--accent-primary), transparent)',
          boxShadow: '0 0 20px var(--glow-primary), 0 0 40px var(--glow-primary)',
        }}
      />

      {/* Content Behind Doors */}
      <AnimatePresence>
        {phase === 'open' && (
          <motion.div
            className="relative z-10 w-full h-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Door Panel Sub-component
const DoorPanel: React.FC<{ side: 'left' | 'right'; variant: string }> = ({ side, variant }) => (
  <div
    className="w-full h-full relative"
    style={{
      background: `
        linear-gradient(
          ${side === 'left' ? '135deg' : '-135deg'},
          hsl(210, 8%, 25%) 0%,
          hsl(210, 10%, 35%) 30%,
          hsl(210, 8%, 28%) 70%,
          hsl(210, 8%, 22%) 100%
        )
      `,
    }}
  >
    {/* Brushed metal grain overlay */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 1px,
          rgba(255,255,255,0.03) 1px,
          rgba(255,255,255,0.03) 2px
        )`,
      }}
    />
    
    {/* Edge highlight */}
    <div
      className={`absolute inset-y-0 w-px ${side === 'left' ? 'right-0' : 'left-0'}`}
      style={{
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)',
      }}
    />
    
    {/* Panel rivets */}
    <div className="absolute inset-4 border border-white/5 rounded" />
    <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-white/10" />
    <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-white/10" />
    <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-white/10" />
    <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-white/10" />
    
    {/* Danger stripe (emergency variant) */}
    {variant === 'emergency' && (
      <div
        className="absolute inset-x-0 bottom-0 h-8"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            #f59e0b,
            #f59e0b 10px,
            #000 10px,
            #000 20px
          )`,
        }}
      />
    )}
  </div>
);

export default memo(VaultDoor);
```

---

# 7. IMPLEMENTATION TEMPLATES

## 7.1 Claude Opus 4.5 Generation Request Template

Use this template when requesting component generation:

```markdown
## GENERATION REQUEST

### 1. CONTEXT
- Design System: [SYSTEM_NAME from Section 5]
- Application: [App name/purpose]
- Target Platform: [Web/Desktop/Mobile]

### 2. COMPONENT SPECIFICATION
- Component Name: [PascalCase name]
- Component Type: [Container/Interactive/Display/Navigation]
- Primary Function: [One sentence]

### 3. VISUAL REQUIREMENTS
- Material: [Primary surface material]
- Color Role: [Primary/Accent/Danger/Success]
- Glow: [None/Subtle/Medium/Intense]
- Animation: [Entrance type, interaction type]

### 4. INTERACTION REQUIREMENTS
- Hover State: [Description]
- Active State: [Description]
- Sound Effects: [List of sound triggers]
- Keyboard: [Key bindings if any]

### 5. TECHNICAL CONSTRAINTS
- Dependencies: [Allowed libraries only]
- Performance: [Max animation budget]
- Accessibility: [WCAG level]

### 6. DELIVERABLES
- [ ] TypeScript component file
- [ ] CSS/Tailwind styles
- [ ] Framer Motion variants
- [ ] Sound effect mappings
- [ ] Storybook story (if applicable)

### 7. QUALITY GATES
- [ ] No TypeScript errors
- [ ] 60fps animation verified
- [ ] Sound synced to animation
- [ ] Keyboard navigable
- [ ] Screen reader tested
```

## 7.2 Quick Generation Prompts

### For Simple Components:

```
Create a [SYSTEM_NAME]-style button with [variant] coloring, 
magnetic hover effect, ripple click animation, and 
[sound_type] sound on interaction. Include loading state.
```

### For Complex Panels:

```
Create a [SYSTEM_NAME] glass panel container with:
- [Material] surface treatment
- [Animation_type] entrance animation
- [Glow_intensity] edge glow
- Support for nested content
- Collapse/expand capability
- Sound: [sound_list]
Full TypeScript types, Framer Motion integration.
```

### For Data Visualization:

```
Create a [SYSTEM_NAME] metric display showing:
- Animated number counting to [value]
- Sparkline trend visualization
- [Trend_direction] indicator
- Live update capability
- Unit suffix: [unit]
Full Three.js integration if 3D variant.
```

---

# 8. QUALITY ASSURANCE GATES

## 8.1 Visual Quality Checklist

```
□ MATERIAL AUTHENTICITY
  □ Surface reflects correct material properties
  □ Lighting responds to global light source
  □ Texture scale appropriate for viewport size
  □ No banding in gradients

□ MOTION QUALITY
  □ All animations run at 60fps
  □ Easing matches physical material (heavy = slow, light = fast)
  □ No animation "pops" or sudden stops
  □ Sound synchronized to visual events

□ DEPTH & HIERARCHY
  □ Z-index layers correct
  □ Shadow direction consistent
  □ Glow intensity appropriate to element importance
  □ Focus states clearly visible

□ TYPOGRAPHY
  □ Correct font family for role
  □ Tabular numerals for data
  □ Adequate contrast ratios
  □ No orphaned words in labels
```

## 8.2 Technical Quality Checklist

```
□ TYPESCRIPT
  □ No any types
  □ All props documented with JSDoc
  □ Proper generic constraints
  □ Exported types for consumers

□ PERFORMANCE
  □ memo() wrapper on expensive components
  □ useCallback for event handlers
  □ useMemo for computed styles
  □ will-change for animated properties
  □ No layout thrashing

□ ACCESSIBILITY
  □ ARIA labels on interactive elements
  □ Keyboard navigation functional
  □ Focus management correct
  □ Color contrast meets WCAG AA
  □ Reduced motion preference respected

□ CODE QUALITY
  □ Component has displayName
  □ Props interface exported
  □ Default props defined inline
  □ Self-critique section included
```

## 8.3 Sound Quality Checklist

```
□ TIMING
  □ Sound starts at correct animation moment
  □ Sound duration matches animation duration
  □ No audio overlap/clipping
  □ Proper fadeout on interruption

□ MIXING
  □ UI sounds don't overpower content
  □ Layer volumes balanced
  □ No frequency clashing
  □ Master volume user-controllable

□ VARIETY
  □ Pitch variation on repeated sounds
  □ No exact repetition annoyance
  □ Contextual sound selection
  □ Mute option available
```

---

# APPENDIX A: CSS CUSTOM PROPERTIES REFERENCE

```css
:root {
  /* ═══ VAULT CORE PALETTE ═══ */
  --vault-steel-dark: hsl(210, 8%, 22%);
  --vault-steel-mid: hsl(210, 10%, 30%);
  --vault-steel-light: hsl(210, 8%, 38%);
  --vault-steel-highlight: hsl(210, 15%, 50%);
  
  /* ═══ EDGE GLOW ═══ */
  --glow-primary: rgba(123, 97, 255, 0.6);
  --glow-secondary: rgba(0, 212, 255, 0.5);
  --glow-emergency: rgba(255, 51, 102, 0.6);
  --glow-secure: rgba(0, 255, 148, 0.5);
  
  /* ═══ MECHANICAL TIMING ═══ */
  --timing-servo: cubic-bezier(0.77, 0, 0.175, 1);
  --timing-hydraulic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --timing-pneumatic: cubic-bezier(0.19, 1, 0.22, 1);
  --timing-magnetic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* ═══ DOOR DIMENSIONS ═══ */
  --door-travel-distance: 120%;
  --door-open-duration: 800ms;
  --door-close-duration: 600ms;
  --seam-width: 2px;
}
```

---

# APPENDIX B: SOUND FILE MANIFEST

```
/sounds/
├── mechanical/
│   ├── servo-whir.mp3        (800ms, loop-ready)
│   ├── servo-whir-reverse.mp3
│   ├── magnetic-release.mp3  (200ms)
│   ├── magnetic-lock.mp3     (200ms)
│   ├── hydraulic-hiss.mp3    (400ms)
│   └── panel-pivot.mp3       (300ms)
├── ui/
│   ├── button-click.mp3      (60ms)
│   ├── button-release.mp3    (40ms)
│   ├── knob-detent.mp3       (50ms)
│   ├── toggle-switch.mp3     (80ms)
│   └── hover-tick.mp3        (30ms)
├── alerts/
│   ├── warning-chime.mp3     (400ms)
│   ├── error-buzz.mp3        (300ms)
│   ├── success-ding.mp3      (250ms)
│   └── critical-alarm.mp3    (1000ms, loop)
└── ambient/
    ├── system-idle.mp3       (8000ms, seamless loop)
    ├── processing-hum.mp3    (4000ms, seamless loop)
    └── secure-mode.mp3       (6000ms, seamless loop)
```

---

**END OF MASTER DOCUMENT**

*This document is optimized for Claude Opus 4.5 consumption. Each section is self-contained and can be referenced individually. For best results, cite specific section numbers when requesting component generation.*

---

## Document Metadata

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Created | 2026-04-14 |
| AI Target | Claude Opus 4.5 |
| Token Estimate | ~12,000 |
| Update Cadence | Monthly review |
