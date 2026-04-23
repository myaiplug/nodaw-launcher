# Time Stretch X — Master Development Plan

> **Version:** 1.0.0-alpha  
> **Created:** April 14, 2026  
> **Author:** NoDAW Studio Team  
> **Status:** Planning Phase  

---

## Executive Summary

Time Stretch X is a premium audio time-stretching and pitch manipulation VST3/AU/Standalone plugin built with JUCE, featuring award-winning visual design that seamlessly integrates with the NoDAW Studio brand ecosystem. The plugin centers around an innovative dual-knob interface metaphor with a signature animated hourglass-to-X icon that communicates time manipulation through motion design.

### Core Value Propositions
1. **Professional-Grade DSP** — Phase-locked vocoder, granular synthesis, and élastique-quality algorithms
2. **Award-Winning UI** — Awwwards-caliber visual design with micro-interactions and skeuomorphic depth
3. **Dual-Knob Slowdown** — Intuitive two-handed control for Time and Pitch independence
4. **Brand Cohesion** — Seamless integration with NoDAW Studio design language
5. **Cross-Platform** — VST3, AU, AAX, and Standalone builds from single codebase

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Brand Identity & Icon Design](#2-brand-identity--icon-design)
3. [User Experience Architecture](#3-user-experience-architecture)
4. [Frontend Design System](#4-frontend-design-system)
5. [DSP Architecture](#5-dsp-architecture)
6. [JUCE Implementation](#6-juce-implementation)
7. [Build System & Distribution](#7-build-system--distribution)
8. [Quality Assurance](#8-quality-assurance)
9. [Project Timeline](#9-project-timeline)
10. [Appendix](#10-appendix)

---

## 1. Product Vision

### 1.1 Problem Statement

Existing time-stretch plugins suffer from:
- **Visual mediocrity** — Generic knobs and dated interfaces
- **Cognitive overload** — Too many parameters with unclear relationships
- **Quality compromises** — Artifacts at extreme settings
- **Workflow friction** — Complex routing and poor preset management

### 1.2 Solution

Time Stretch X delivers:
- **Visual excellence** — Award-worthy design that inspires confidence
- **Intuitive control** — Dual-knob metaphor maps directly to mental model (Time × Pitch)
- **Pristine audio** — Multiple algorithm choices from fast to transparent
- **Workflow acceleration** — Drag-and-drop audio, smart presets, instant A/B

### 1.3 Target Users

| Persona | Use Case | Priority Features |
|---------|----------|-------------------|
| Hip-Hop Producers | Chopped & Screwed, sample manipulation | Extreme slow, vinyl emulation |
| Electronic Musicians | Creative sound design, ambient textures | Granular modes, freeze |
| Podcast Editors | Speech rate adjustment | Formant preservation, natural sound |
| Film/Game Audio | Foley manipulation, time-fit | Frame-accurate sync, automation |
| Remix Artists | Tempo matching, mashup creation | Key lock, beat detection |

### 1.4 Competitive Positioning

```
                    QUALITY
                       ↑
                       │
     Serato Pitch'n'Time ●
                       │    ● Time Stretch X (TARGET)
    Waves SoundShifter ●   ●
                       │     Élastique
            Paulstretch ●
                       │
         ──────────────┼──────────────→ USABILITY
                       │
              Audacity ●
                       │
```

---

## 2. Brand Identity & Icon Design

### 2.1 Animated Icon Concept

The Time Stretch X icon tells a story through motion:

#### Phase 1: Hourglass State (Idle)
```
     ╭─────────╮
     │ ▓▓▓▓▓▓▓ │  ← Sand chamber (full)
     ╰────┬────╯
          │       ← Narrow waist (time passing)
     ╭────┴────╮
     │ ░░░░░░░ │  ← Empty chamber
     ╰─────────╯
```

#### Phase 2: Sand Flow (Processing)
```
     ╭─────────╮
     │ ▓▓▓▓░░░ │  ← Draining
     ╰────┬────╯
          ┊       ← Animated grain stream
     ╭────┴────╮
     │ ░▓▓▓░░░ │  ← Filling
     ╰─────────╯
```

#### Phase 3: Transformation (Complete)
```
          ╲   ╱
           ╲ ╱
     ███████████   ← Morphs into thick X
           ╱ ╲
          ╱   ╲
          
    ▓▓▓▓▓▓▓▓▓▓▓   ← X interior has flowing
                     particle animation
```

### 2.2 Icon Specifications

| Property | Value |
|----------|-------|
| Base Size | 512×512px (scalable SVG) |
| Animation Duration | 1.8s (hourglass → X morph) |
| Loop Duration | 4s (sand flow cycle) |
| Frame Rate | 60fps |
| Color Scheme | NoDAW accent gradient (cyan → purple) |

### 2.3 Icon Animation Keyframes

```css
@keyframes hourglassToX {
  0% {
    /* Full hourglass, top chamber filled */
    --top-fill: 100%;
    --bottom-fill: 0%;
    --morph-progress: 0;
  }
  
  40% {
    /* Sand flowing, midpoint */
    --top-fill: 50%;
    --bottom-fill: 50%;
    --morph-progress: 0;
  }
  
  70% {
    /* Hourglass complete, begin morph */
    --top-fill: 0%;
    --bottom-fill: 100%;
    --morph-progress: 0;
  }
  
  100% {
    /* Full X with interior motion */
    --top-fill: 0%;
    --bottom-fill: 100%;
    --morph-progress: 1;
  }
}
```

### 2.4 Motion Language

| Element | Animation | Easing | Purpose |
|---------|-----------|--------|---------|
| Sand grains | Particle flow | Physics-based | Time passage feeling |
| Hourglass morph | Scale + rotate | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Transformation drama |
| X interior fill | Shimmer wave | ease-in-out | Premium quality signal |
| Glow pulse | Opacity cycle | sine | Activity indicator |

### 2.5 SVG Icon Structure

```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient definitions -->
    <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4" />   <!-- Cyan-500 -->
      <stop offset="50%" stop-color="#8B5CF6" />  <!-- Purple-500 -->
      <stop offset="100%" stop-color="#EC4899" /> <!-- Pink-500 -->
    </linearGradient>
    
    <!-- Sand particle pattern -->
    <pattern id="sandPattern" width="4" height="4" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.8"/>
    </pattern>
    
    <!-- Glow filter -->
    <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <g id="hourglass" class="icon-hourglass">
    <!-- Top chamber -->
    <path d="M128,64 L384,64 L384,96 L320,192 L192,192 L128,96 Z" 
          fill="url(#timeGradient)" opacity="0.3"/>
    <!-- Sand in top -->
    <path id="topSand" d="..." fill="url(#sandPattern)"/>
    <!-- Waist -->
    <path d="M192,192 L320,192 L288,256 L224,256 Z" fill="url(#timeGradient)"/>
    <!-- Bottom chamber -->
    <path d="M128,448 L384,448 L384,416 L320,320 L192,320 L128,416 Z"
          fill="url(#timeGradient)" opacity="0.3"/>
    <!-- Sand in bottom -->
    <path id="bottomSand" d="..." fill="url(#sandPattern)"/>
  </g>
  
  <g id="xShape" class="icon-x" opacity="0">
    <!-- X arms with thick strokes -->
    <path d="M96,96 L224,224 L96,416 L160,416 L256,288 L352,416 L416,416 L288,224 L416,96 L352,96 L256,192 L160,96 Z"
          fill="url(#timeGradient)" filter="url(#iconGlow)"/>
    <!-- Interior motion fill -->
    <path id="xInterior" d="..." fill="url(#sandPattern)" opacity="0.6"/>
  </g>
</svg>
```

---

## 3. User Experience Architecture

### 3.1 Interface Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║  TIME STRETCH X                              [≡] [─] [□] [×]  ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    WAVEFORM DISPLAY                          │   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │ ░░▒▓█████▓▒░░░▒▓███████▓▒░░░▒▓█████▓▒░░░▒▓██████▓▒░░░  ││   │
│  │  │ ░▒▓████▓▒░░░▒▓█████████▓▒░░▒▓██████▓▒░░▒▓████████▓▒░░  ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  │  [▶ Play]  [⏹ Stop]  [⟲ Loop]     00:00:00 / 00:03:24      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐     │
│  │    ╭───────────────╮    │  │    ╭───────────────╮        │     │
│  │    │               │    │  │    │               │        │     │
│  │    │    ◯ TIME     │    │  │    │   ◯ PITCH     │        │     │
│  │    │     100%      │    │  │    │     0 st      │        │     │
│  │    │               │    │  │    │               │        │     │
│  │    ╰───────────────╯    │  │    ╰───────────────╯        │     │
│  │         [LINK]          │  │        [KEY LOCK]           │     │
│  └─────────────────────────┘  └─────────────────────────────┘     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ALGORITHM  │ QUALITY  │  FORMANT  │  MIX   │  OUTPUT      │   │
│  │  [▼ Phase]  │ [●●●○○]  │  [-12|+12]│ [100%] │ [0.0 dB]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ PRESETS: [Chopped] [Screwed] [Ambient] [Speech] [+]          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                     NoDAW Studio v1.4.0                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Interaction Zones

| Zone | Primary Action | Secondary Action | Modifier |
|------|---------------|------------------|----------|
| Time Knob | Drag vertical | Fine adjust | Shift = 0.1% steps |
| Pitch Knob | Drag vertical | Semitone snap | Ctrl = cent steps |
| Waveform | Scrub position | Range select | Alt = zoom |
| Algorithm | Click = cycle | Right-click = menu | — |
| Presets | Click = load | Double-click = edit | Ctrl+Click = A/B |

### 3.3 Gesture Library

```
┌─────────────────────────────────────────────────────────────┐
│ DUAL-KNOB SLOWDOWN GESTURES                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ○ ──── ○   PARALLEL DRAG                                  │
│  ↓      ↓   Both knobs move together                       │
│  ○ ──── ○   Result: Proportional slowdown (natural)        │
│                                                             │
│  ○ ──── ○   DIVERGENT DRAG                                 │
│  ↓      ↑   Knobs move opposite                            │
│  ○      ○   Result: Time down + Pitch up (DJ style)        │
│                                                             │
│  ○ ──── ○   SOLO DRAG (TIME)                               │
│  ↓          Only time knob                                 │
│  ○      ○   Result: Slower with pitch drop                 │
│                                                             │
│  ○ ──── ○   SOLO DRAG (PITCH) + KEY LOCK                   │
│        ↓    Pitch knob with lock engaged                   │
│  ○      ○   Result: Pitch shift, time unchanged            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Audio Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌─────────────┐                                         │
│    │  DRAG FILE  │                                         │
│    │  onto window │                                        │
│    └──────┬──────┘                                         │
│           ↓                                                 │
│    ┌─────────────┐     ┌────────────────┐                  │
│    │  Validate   │────▶│  Show dropzone  │                 │
│    │  file type  │     │  highlight      │                 │
│    └──────┬──────┘     └────────────────┘                  │
│           ↓                                                 │
│    ┌─────────────┐                                         │
│    │   Decode    │  ← Progress indicator                   │
│    │   audio     │    Waveform builds incrementally        │
│    └──────┬──────┘                                         │
│           ↓                                                 │
│    ┌─────────────┐                                         │
│    │   Analyze   │  ← BPM detection, key estimation        │
│    │   features  │    Transient markers                    │
│    └──────┬──────┘                                         │
│           ↓                                                 │
│    ┌─────────────┐                                         │
│    │   Ready to  │  ← Auto-suggest presets                 │
│    │   process   │    based on content type                │
│    └─────────────┘                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Design System

### 4.1 Color Palette

#### Primary Palette (Dark Theme)
```scss
// Background layers
$bg-deepest:    #0A0A0F;   // Plugin background
$bg-deep:       #12121A;   // Panel backgrounds
$bg-mid:        #1A1A25;   // Control wells
$bg-surface:    #242430;   // Elevated elements

// Accent colors
$accent-primary:   #06B6D4; // Cyan-500 (Time)
$accent-secondary: #8B5CF6; // Purple-500 (Pitch)
$accent-tertiary:  #EC4899; // Pink-500 (Alerts)

// Text hierarchy
$text-primary:   #FAFAFA;   // High emphasis
$text-secondary: #A1A1AA;   // Medium emphasis
$text-tertiary:  #52525B;   // Low emphasis

// Semantic colors
$success: #22C55E;
$warning: #F59E0B;
$error:   #EF4444;
```

#### Knob Gradients
```scss
// Time Knob - Cyan dominance
$time-knob-gradient: linear-gradient(
  135deg,
  #06B6D4 0%,
  #0891B2 50%,
  #0E7490 100%
);

// Pitch Knob - Purple dominance  
$pitch-knob-gradient: linear-gradient(
  135deg,
  #8B5CF6 0%,
  #7C3AED 50%,
  #6D28D9 100%
);

// Linked state - Merged gradient
$linked-knob-gradient: linear-gradient(
  135deg,
  #06B6D4 0%,
  #8B5CF6 50%,
  #EC4899 100%
);
```

### 4.2 Typography

```scss
// Font stack
$font-display: 'NoDAW Display', 'Inter', system-ui, sans-serif;
$font-mono: 'JetBrains Mono', 'SF Mono', monospace;

// Scale (based on 16px root)
$type-scale: (
  'display-xl': 2.5rem,    // 40px - Plugin title
  'display':    2rem,      // 32px - Section headers
  'heading':    1.5rem,    // 24px - Panel titles
  'subheading': 1.125rem,  // 18px - Control labels
  'body':       1rem,      // 16px - General text
  'caption':    0.875rem,  // 14px - Secondary info
  'micro':      0.75rem,   // 12px - Timestamps, metadata
);

// Weights
$weight-regular: 400;
$weight-medium:  500;
$weight-bold:    700;
```

### 4.3 Spacing System

```scss
// 4px base unit
$space-unit: 4px;

$space: (
  'xs':   $space-unit,       // 4px
  'sm':   $space-unit * 2,   // 8px
  'md':   $space-unit * 4,   // 16px
  'lg':   $space-unit * 6,   // 24px
  'xl':   $space-unit * 8,   // 32px
  'xxl':  $space-unit * 12,  // 48px
  'xxxl': $space-unit * 16,  // 64px
);
```

### 4.4 Component Specifications

#### 4.4.1 Dual Knob Component

```
┌─────────────────────────────────────┐
│         KNOB ANATOMY                │
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────────┐        │
│     │    VALUE DISPLAY    │  ←──── Floating readout
│     │       "75.5%"       │        Appears on hover/drag
│     └─────────────────────┘        │
│                                     │
│         ╭─────────────╮            │
│        ╱               ╲           │
│       │   ┌───────┐    │          │
│       │   │ GLOW  │    │  ←────── Inner glow zone
│       │   │ ZONE  │    │          Pulses with activity
│       │   └───────┘    │          │
│       │      ⬤        │  ←────── Indicator dot
│        ╲               ╱          Rotates with value
│         ╰─────────────╯           │
│              ║                     │
│         ───────────  ←──────────── Arc track (270°)
│                                    Shows value range
│                                     │
│     ┌─────────────────────┐        │
│     │      LABEL          │  ←──── Static label
│     │      "TIME"         │        Below knob
│     └─────────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

**Dimensions:**
- Outer diameter: 120px (large) / 80px (compact)
- Track width: 6px
- Indicator size: 10px diameter
- Rotation range: 270° (-135° to +135°)

**States:**
| State | Track Color | Glow | Indicator |
|-------|-------------|------|-----------|
| Default | 30% accent | None | Solid accent |
| Hover | 50% accent | Subtle pulse | Brighter |
| Active | 100% accent | Strong pulse | Full glow |
| Disabled | 15% neutral | None | Dimmed |
| Linked | Gradient | Shared pulse | Synced |

#### 4.4.2 Waveform Display

```
┌─────────────────────────────────────────────────────────────┐
│                   WAVEFORM ANATOMY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │  ↑                                                   │   │
│  │  Played region (colored)                            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                ┌───────────────────┐                │   │
│  │  ░░░░░░░░░░░░░░│ SELECTION RANGE  │░░░░░░░░░░░░░░  │   │
│  │                └───────────────────┘                │   │
│  │                     ↑                               │   │
│  │                     Loop/process region             │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼       │   │
│  │  Transient markers (auto-detected)                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  |──────────────────────────────|                   │   │
│  │  0:00                      0:30                     │   │
│  │  Timeline with beat grid                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Rendering specs:**
- Resolution: 2× display density minimum
- Color: Gradient from accent-primary (loud) to accent-secondary (quiet)
- Playhead: 2px vertical line with glow
- Selection: Semi-transparent overlay with handles

#### 4.4.3 Algorithm Selector

```
┌─────────────────────────────────────┐
│        ALGORITHM DROPDOWN           │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Phase Vocoder          [▼]  │  │
│  └───────────────────────────────┘  │
│            │                        │
│            ▼                        │
│  ┌───────────────────────────────┐  │
│  │ ● Phase Vocoder              │  │
│  │   Best for music, preserves  │  │
│  │   transients and harmonics   │  │
│  ├───────────────────────────────┤  │
│  │ ○ Granular                   │  │
│  │   Creative textures, best    │  │
│  │   for extreme stretching     │  │
│  ├───────────────────────────────┤  │
│  │ ○ WSOLA                      │  │
│  │   Fast processing, good for  │  │
│  │   speech and voice           │  │
│  ├───────────────────────────────┤  │
│  │ ○ Élastique Pro              │  │  ← Premium tier
│  │   Broadcast quality, lowest  │  │
│  │   artifacts                  │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 4.5 Animation Specifications

#### 4.5.1 Micro-Interactions

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Knob hover | Scale 1.02, glow fade in | 150ms | ease-out |
| Knob grab | Scale 0.98, indicator glow | 50ms | ease-in |
| Knob release | Scale 1.0, value snap | 200ms | spring(300, 20) |
| Button press | Scale 0.95, darken 10% | 100ms | ease-in |
| Button release | Scale 1.0, ripple | 300ms | ease-out |
| Panel expand | Height tween, fade children | 250ms | ease-in-out |
| Dropdown open | Scale Y from 0, fade | 200ms | ease-out |
| Value change | Number morph | 100ms | linear |

#### 4.5.2 State Transitions

```
IDLE → PROCESSING → COMPLETE

┌─────────┐     ┌─────────────┐     ┌──────────┐
│  IDLE   │────▶│ PROCESSING  │────▶│ COMPLETE │
│         │     │             │     │          │
│ Static  │     │ Sand flows  │     │ X glows  │
│ hourglass│    │ Progress bar│     │ Success  │
│         │     │ Knobs pulse │     │ checkmark│
└─────────┘     └─────────────┘     └──────────┘
     ↑                                    │
     └────────────────────────────────────┘
                   (auto-reset)
```

### 4.6 Responsive Breakpoints

| Breakpoint | Min Width | Layout Adaptation |
|------------|-----------|-------------------|
| Compact | 400px | Single column, stacked knobs |
| Standard | 600px | Two-column, side-by-side knobs |
| Extended | 800px | Full layout with expanded waveform |
| Wide | 1000px+ | Preset browser sidebar |

---

## 5. DSP Architecture

### 5.1 Signal Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DSP SIGNAL FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐                                                   │
│  │   INPUT     │                                                   │
│  │   Buffer    │                                                   │
│  └──────┬──────┘                                                   │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────┐     ┌─────────────────────────────────────────┐  │
│  │   ANALYSIS  │     │  ALGORITHM SELECTOR                      │  │
│  │   Window    │     │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │
│  │   (FFT)     │────▶│  │ Phase   │ │Granular │ │ WSOLA   │   │  │
│  └─────────────┘     │  │ Vocoder │ │         │ │         │   │  │
│                      │  └────┬────┘ └────┬────┘ └────┬────┘   │  │
│                      │       │           │           │         │  │
│                      │       └───────────┼───────────┘         │  │
│                      │                   │                      │  │
│                      └───────────────────┼──────────────────────┘  │
│                                          │                         │
│                                          ▼                         │
│                      ┌───────────────────────────────────────┐    │
│                      │          TIME STRETCH CORE            │    │
│                      │  ┌─────────────────────────────────┐  │    │
│                      │  │  Rate: 0.25× ─────────── 4.0×   │  │    │
│                      │  │  ┌───────────────────────────┐  │  │    │
│                      │  │  │ INTERPOLATION ENGINE      │  │  │    │
│                      │  │  │ - Overlap-add synthesis   │  │  │    │
│                      │  │  │ - Phase coherence lock    │  │  │    │
│                      │  │  │ - Transient preservation  │  │  │    │
│                      │  │  └───────────────────────────┘  │  │    │
│                      │  └─────────────────────────────────┘  │    │
│                      └───────────────────┬───────────────────┘    │
│                                          │                         │
│                                          ▼                         │
│                      ┌───────────────────────────────────────┐    │
│                      │          PITCH SHIFT CORE             │    │
│                      │  ┌─────────────────────────────────┐  │    │
│                      │  │  Shift: -24 ──────────── +24 st │  │    │
│                      │  │  ┌───────────────────────────┐  │  │    │
│                      │  │  │ RESAMPLING ENGINE         │  │  │    │
│                      │  │  │ - Sinc interpolation      │  │  │    │
│                      │  │  │ - Formant preservation    │  │  │    │
│                      │  │  │ - Anti-aliasing filter    │  │  │    │
│                      │  │  └───────────────────────────┘  │  │    │
│                      │  └─────────────────────────────────┘  │    │
│                      └───────────────────┬───────────────────┘    │
│                                          │                         │
│                                          ▼                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐         │
│  │  FORMANT    │────▶│   MIX       │────▶│   OUTPUT    │         │
│  │  Correction │     │   Control   │     │   Limiter   │         │
│  └─────────────┘     └─────────────┘     └─────────────┘         │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Algorithm Implementations

#### 5.2.1 Phase Vocoder

```cpp
class PhaseVocoder {
public:
    // Configuration
    static constexpr int FFT_SIZE = 4096;
    static constexpr int HOP_SIZE = FFT_SIZE / 4;  // 75% overlap
    static constexpr int OVERLAP = 4;
    
    struct Parameters {
        float timeStretch;   // 0.25 to 4.0
        float pitchShift;    // -24 to +24 semitones
        bool preserveFormants;
        int quality;         // 1-5 (affects FFT size)
    };
    
    void process(const float* input, float* output, int numSamples);
    
private:
    // FFT buffers
    std::vector<std::complex<float>> fftBuffer;
    std::vector<float> magnitudes;
    std::vector<float> phases;
    std::vector<float> phaseDiff;
    std::vector<float> lastPhases;
    
    // Synthesis
    void analyzeFrame(const float* frame);
    void synthesizeFrame(float* frame);
    void overlapAdd(float* output, const float* frame, int position);
    
    // Phase locking
    void lockPhases();
    float unwrapPhase(float phase);
};
```

#### 5.2.2 Granular Engine

```cpp
class GranularEngine {
public:
    struct Grain {
        int sourcePosition;
        int currentPosition;
        int length;
        float amplitude;
        float pan;
        WindowFunction window;
    };
    
    struct Parameters {
        float grainSize;      // 10ms - 500ms
        float grainDensity;   // grains per second
        float randomization;  // 0.0 - 1.0
        float pitchSpread;    // 0.0 - 1.0
        float timeStretch;    // 0.25 - 4.0
    };
    
    void process(const float* input, float* output, int numSamples);
    
private:
    std::vector<Grain> activeGrains;
    std::mt19937 rng;
    
    void spawnGrain(int sourcePosition);
    void processGrain(Grain& grain, float* output);
    float applyWindow(const Grain& grain, int position);
};
```

#### 5.2.3 WSOLA (Waveform Similarity Overlap-Add)

```cpp
class WSOLA {
public:
    static constexpr int SEARCH_RANGE = 50;  // samples
    static constexpr int SEGMENT_SIZE = 1024;
    
    struct Parameters {
        float timeStretch;
        int tolerance;  // search tolerance in samples
    };
    
    void process(const float* input, float* output, int numSamples);
    
private:
    // Find best overlap position using cross-correlation
    int findBestOverlap(const float* current, const float* target, int length);
    float crossCorrelate(const float* a, const float* b, int length);
    
    // Synthesis
    void synthesizeSegment(float* output, const float* segment, int overlap);
};
```

### 5.3 Quality Metrics

| Algorithm | CPU Usage | Latency | Quality (Music) | Quality (Speech) |
|-----------|-----------|---------|-----------------|------------------|
| Phase Vocoder | Medium | 50-100ms | ★★★★★ | ★★★★☆ |
| Granular | Low | 10-30ms | ★★★☆☆ | ★★☆☆☆ |
| WSOLA | Low | 20-50ms | ★★★☆☆ | ★★★★★ |
| Élastique | High | 80-150ms | ★★★★★ | ★★★★★ |

### 5.4 Parameter Ranges

| Parameter | Range | Default | Units | Resolution |
|-----------|-------|---------|-------|------------|
| Time Stretch | 0.25 - 4.0 | 1.0 | ratio | 0.01 |
| Pitch Shift | -24 - +24 | 0 | semitones | 0.01 |
| Formant Shift | -12 - +12 | 0 | semitones | 0.1 |
| Mix | 0 - 100 | 100 | percent | 1 |
| Output Gain | -12 - +12 | 0 | dB | 0.1 |
| Grain Size | 10 - 500 | 100 | ms | 1 |
| Quality | 1 - 5 | 3 | level | 1 |

### 5.5 Latency Budget

```
┌─────────────────────────────────────────────────────────────┐
│              LATENCY BREAKDOWN (Standard Quality)           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Input Buffer:      256 samples    ≈  5.8ms @ 44.1kHz     │
│  ─────────────────────────────────────────────────────────  │
│  Analysis Window:   4096 samples   ≈ 92.9ms               │
│  ─────────────────────────────────────────────────────────  │
│  Processing:        ~200 samples   ≈  4.5ms               │
│  ─────────────────────────────────────────────────────────  │
│  Synthesis Window:  2048 samples   ≈ 46.4ms               │
│  ─────────────────────────────────────────────────────────  │
│  Output Buffer:     256 samples    ≈  5.8ms               │
│  ═══════════════════════════════════════════════════════   │
│  TOTAL:                             ≈ 155ms                │
│                                                             │
│  Note: Latency can be reduced with quality tradeoff        │
│  Low-latency mode: ~50ms (reduced FFT size)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. JUCE Implementation

### 6.1 Project Structure

```
TimeStretchX/
├── CMakeLists.txt                    # Build configuration
├── TimeStretchX.jucer                # Projucer project (optional)
├── JuceLibraryCode/                  # JUCE modules (auto-generated)
│
├── Source/
│   ├── PluginProcessor.h             # Main audio processor
│   ├── PluginProcessor.cpp
│   ├── PluginEditor.h                # Main UI component
│   ├── PluginEditor.cpp
│   │
│   ├── DSP/
│   │   ├── TimeStretchEngine.h       # Core stretching logic
│   │   ├── TimeStretchEngine.cpp
│   │   ├── PhaseVocoder.h            # Phase vocoder implementation
│   │   ├── PhaseVocoder.cpp
│   │   ├── GranularEngine.h          # Granular synthesis
│   │   ├── GranularEngine.cpp
│   │   ├── WSOLA.h                   # WSOLA algorithm
│   │   ├── WSOLA.cpp
│   │   ├── PitchShifter.h            # Pitch shifting
│   │   ├── PitchShifter.cpp
│   │   ├── FormantPreserver.h        # Formant correction
│   │   └── FormantPreserver.cpp
│   │
│   ├── UI/
│   │   ├── LookAndFeel/
│   │   │   ├── NoDAWLookAndFeel.h    # Custom look and feel
│   │   │   ├── NoDAWLookAndFeel.cpp
│   │   │   └── Colours.h             # Color definitions
│   │   │
│   │   ├── Components/
│   │   │   ├── DualKnob.h            # Dual knob component
│   │   │   ├── DualKnob.cpp
│   │   │   ├── WaveformDisplay.h     # Waveform viewer
│   │   │   ├── WaveformDisplay.cpp
│   │   │   ├── AlgorithmSelector.h   # Algorithm dropdown
│   │   │   ├── AlgorithmSelector.cpp
│   │   │   ├── PresetBrowser.h       # Preset management
│   │   │   ├── PresetBrowser.cpp
│   │   │   ├── AnimatedIcon.h        # Hourglass→X icon
│   │   │   └── AnimatedIcon.cpp
│   │   │
│   │   └── Animations/
│   │       ├── AnimationEngine.h     # Animation system
│   │       ├── AnimationEngine.cpp
│   │       └── Easings.h             # Easing functions
│   │
│   ├── State/
│   │   ├── ParameterLayout.h         # APVTS parameter definitions
│   │   ├── ParameterLayout.cpp
│   │   ├── PresetManager.h           # Preset save/load
│   │   └── PresetManager.cpp
│   │
│   └── Utils/
│       ├── AudioFileLoader.h         # File loading (standalone)
│       ├── AudioFileLoader.cpp
│       ├── RingBuffer.h              # Lock-free ring buffer
│       ├── FFTProcessor.h            # FFT wrapper
│       └── WindowFunctions.h         # Hann, Blackman, etc.
│
├── Resources/
│   ├── Fonts/
│   │   ├── NoDAWDisplay.ttf
│   │   └── JetBrainsMono.ttf
│   ├── Images/
│   │   ├── icon.svg
│   │   ├── knob_time.png
│   │   ├── knob_pitch.png
│   │   └── background.png
│   └── Presets/
│       ├── Factory/
│       │   ├── Chopped.tspreset
│       │   ├── Screwed.tspreset
│       │   ├── Ambient.tspreset
│       │   └── Speech.tspreset
│       └── User/
│
├── Builds/
│   ├── Windows/
│   │   └── TimeStretchX.vcxproj
│   ├── MacOS/
│   │   └── TimeStretchX.xcodeproj
│   └── Linux/
│       └── Makefile
│
└── Installers/
    ├── Windows/
    │   └── TimeStretchX_Installer.iss
    └── MacOS/
        └── TimeStretchX.pkgproj
```

### 6.2 Core Classes

#### 6.2.1 PluginProcessor

```cpp
// PluginProcessor.h
#pragma once

#include <JuceHeader.h>
#include "DSP/TimeStretchEngine.h"
#include "State/ParameterLayout.h"

class TimeStretchXProcessor : public juce::AudioProcessor,
                               public juce::AudioProcessorValueTreeState::Listener
{
public:
    TimeStretchXProcessor();
    ~TimeStretchXProcessor() override;

    // AudioProcessor overrides
    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    // Editor
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    // Plugin info
    const juce::String getName() const override { return "Time Stretch X"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    double getTailLengthSeconds() const override;

    // State
    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    // Parameter listener
    void parameterChanged(const juce::String& parameterID, float newValue) override;

    // Accessors
    juce::AudioProcessorValueTreeState& getAPVTS() { return apvts; }
    TimeStretchEngine& getEngine() { return stretchEngine; }
    
    // Standalone audio loading
    bool loadAudioFile(const juce::File& file);
    bool hasLoadedAudio() const { return audioLoaded; }
    juce::AudioBuffer<float>& getLoadedAudio() { return loadedAudio; }
    
    // Playback control (standalone)
    void play();
    void stop();
    void setPlayPosition(double positionInSeconds);
    double getPlayPosition() const;
    bool isPlaying() const { return playing; }

private:
    juce::AudioProcessorValueTreeState apvts;
    TimeStretchEngine stretchEngine;
    
    // Standalone mode
    juce::AudioBuffer<float> loadedAudio;
    juce::AudioBuffer<float> processedAudio;
    bool audioLoaded = false;
    bool playing = false;
    std::atomic<int> playPosition { 0 };
    
    // Algorithm selection
    enum Algorithm { PhaseVocoder, Granular, WSOLA };
    Algorithm currentAlgorithm = PhaseVocoder;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(TimeStretchXProcessor)
};
```

#### 6.2.2 DualKnob Component

```cpp
// UI/Components/DualKnob.h
#pragma once

#include <JuceHeader.h>

class DualKnob : public juce::Component,
                  public juce::Timer
{
public:
    enum class KnobType { Time, Pitch };
    
    DualKnob(KnobType type);
    ~DualKnob() override;

    void paint(juce::Graphics& g) override;
    void resized() override;
    void mouseDown(const juce::MouseEvent& e) override;
    void mouseDrag(const juce::MouseEvent& e) override;
    void mouseUp(const juce::MouseEvent& e) override;
    void mouseEnter(const juce::MouseEvent& e) override;
    void mouseExit(const juce::MouseEvent& e) override;
    
    // Timer for animations
    void timerCallback() override;

    // Value control
    void setValue(float newValue);
    float getValue() const { return value; }
    void setRange(float min, float max, float interval = 0.01f);
    
    // Linking
    void setLinked(bool shouldBeLinked);
    bool isLinked() const { return linked; }
    
    // Callbacks
    std::function<void(float)> onValueChange;
    std::function<void()> onDragStart;
    std::function<void()> onDragEnd;

private:
    KnobType type;
    float value = 1.0f;
    float minValue = 0.25f;
    float maxValue = 4.0f;
    float interval = 0.01f;
    
    bool isHovered = false;
    bool isDragging = false;
    bool linked = false;
    
    // Animation state
    float glowIntensity = 0.0f;
    float hoverScale = 1.0f;
    
    // Drawing helpers
    void drawKnobBackground(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawKnobArc(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawIndicator(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawGlow(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawLabel(juce::Graphics& g, juce::Rectangle<float> bounds);
    
    // Value to angle conversion
    float valueToAngle(float val) const;
    float angleToValue(float angle) const;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DualKnob)
};
```

#### 6.2.3 Animated Icon

```cpp
// UI/Components/AnimatedIcon.h
#pragma once

#include <JuceHeader.h>

class AnimatedIcon : public juce::Component,
                     public juce::Timer
{
public:
    enum class State { Idle, Processing, Complete };
    
    AnimatedIcon();
    ~AnimatedIcon() override;

    void paint(juce::Graphics& g) override;
    void timerCallback() override;
    
    void setState(State newState);
    State getState() const { return currentState; }
    
    void setProgress(float progress); // 0.0 - 1.0

private:
    State currentState = State::Idle;
    float animationProgress = 0.0f;
    float morphProgress = 0.0f;  // 0 = hourglass, 1 = X
    float sandLevel = 1.0f;      // Top chamber sand level
    
    // Sand particles for flowing animation
    struct SandParticle {
        float x, y;
        float velocity;
        float size;
    };
    std::vector<SandParticle> particles;
    
    void drawHourglass(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawXShape(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawSandFlow(juce::Graphics& g, juce::Rectangle<float> bounds);
    void drawInteriorMotion(juce::Graphics& g, juce::Rectangle<float> bounds);
    
    void updateParticles();
    juce::Path getMorphedPath(float t);
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AnimatedIcon)
};
```

### 6.3 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.22)

project(TimeStretchX VERSION 1.0.0)

# JUCE configuration
add_subdirectory(JUCE)

# Plugin target
juce_add_plugin(TimeStretchX
    COMPANY_NAME "NoDAW Studio"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD TRUE
    PLUGIN_MANUFACTURER_CODE Ndaw
    PLUGIN_CODE Tsx1
    FORMATS VST3 AU Standalone
    PRODUCT_NAME "Time Stretch X"
)

# Generate JUCE header
juce_generate_juce_header(TimeStretchX)

# Source files
target_sources(TimeStretchX
    PRIVATE
        Source/PluginProcessor.cpp
        Source/PluginEditor.cpp
        
        # DSP
        Source/DSP/TimeStretchEngine.cpp
        Source/DSP/PhaseVocoder.cpp
        Source/DSP/GranularEngine.cpp
        Source/DSP/WSOLA.cpp
        Source/DSP/PitchShifter.cpp
        Source/DSP/FormantPreserver.cpp
        
        # UI
        Source/UI/LookAndFeel/NoDAWLookAndFeel.cpp
        Source/UI/Components/DualKnob.cpp
        Source/UI/Components/WaveformDisplay.cpp
        Source/UI/Components/AlgorithmSelector.cpp
        Source/UI/Components/PresetBrowser.cpp
        Source/UI/Components/AnimatedIcon.cpp
        Source/UI/Animations/AnimationEngine.cpp
        
        # State
        Source/State/ParameterLayout.cpp
        Source/State/PresetManager.cpp
        
        # Utils
        Source/Utils/AudioFileLoader.cpp
)

# Binary resources (fonts, images)
juce_add_binary_data(TimeStretchXData
    SOURCES
        Resources/Fonts/NoDAWDisplay.ttf
        Resources/Fonts/JetBrainsMono.ttf
        Resources/Images/icon.svg
        Resources/Images/knob_time.png
        Resources/Images/knob_pitch.png
        Resources/Images/background.png
)

# Link libraries
target_link_libraries(TimeStretchX
    PRIVATE
        TimeStretchXData
        juce::juce_audio_basics
        juce::juce_audio_devices
        juce::juce_audio_formats
        juce::juce_audio_plugin_client
        juce::juce_audio_processors
        juce::juce_audio_utils
        juce::juce_core
        juce::juce_dsp
        juce::juce_graphics
        juce::juce_gui_basics
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# Compile definitions
target_compile_definitions(TimeStretchX
    PUBLIC
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
)

# C++ standard
target_compile_features(TimeStretchX PRIVATE cxx_std_20)
```

### 6.4 Build Instructions

#### 6.4.1 Prerequisites

**Windows:**
```powershell
# Install Visual Studio 2022 with C++ workload
winget install Microsoft.VisualStudio.2022.Community

# Install CMake
winget install Kitware.CMake

# Clone JUCE
git clone https://github.com/juce-framework/JUCE.git
```

**macOS:**
```bash
# Install Xcode
xcode-select --install

# Install CMake
brew install cmake

# Clone JUCE
git clone https://github.com/juce-framework/JUCE.git
```

**Linux:**
```bash
# Install dependencies
sudo apt-get install build-essential cmake \
    libasound2-dev libjack-jackd2-dev \
    libfreetype6-dev libx11-dev libxcomposite-dev \
    libxcursor-dev libxext-dev libxinerama-dev \
    libxrandr-dev libxrender-dev libwebkit2gtk-4.0-dev \
    libcurl4-openssl-dev

# Clone JUCE
git clone https://github.com/juce-framework/JUCE.git
```

#### 6.4.2 Build Commands

**Configure:**
```bash
# Create build directory
mkdir build && cd build

# Configure with CMake
cmake .. -DCMAKE_BUILD_TYPE=Release

# On Windows (Visual Studio)
cmake .. -G "Visual Studio 17 2022" -A x64
```

**Build:**
```bash
# Build all targets
cmake --build . --config Release

# Build specific format
cmake --build . --config Release --target TimeStretchX_VST3
cmake --build . --config Release --target TimeStretchX_AU
cmake --build . --config Release --target TimeStretchX_Standalone
```

**Install:**
```bash
# Install to system plugin directories
cmake --install . --config Release

# Windows: C:\Program Files\Common Files\VST3\
# macOS: /Library/Audio/Plug-Ins/VST3/
# Linux: ~/.vst3/
```

#### 6.4.3 Signing & Notarization (macOS)

```bash
# Sign the plugin
codesign --force --sign "Developer ID Application: Your Name" \
    --timestamp --options runtime \
    "TimeStretchX.vst3"

# Create DMG for notarization
hdiutil create -volname "TimeStretchX" \
    -srcfolder "TimeStretchX.vst3" \
    -ov -format UDZO "TimeStretchX.dmg"

# Notarize
xcrun notarytool submit "TimeStretchX.dmg" \
    --apple-id "your@email.com" \
    --password "app-specific-password" \
    --team-id "TEAMID"

# Staple
xcrun stapler staple "TimeStretchX.dmg"
```

---

## 7. Build System & Distribution

### 7.1 Installer Configuration

#### Windows (Inno Setup)

```iss
; TimeStretchX_Installer.iss
[Setup]
AppName=Time Stretch X
AppVersion=1.0.0
AppPublisher=NoDAW Studio
DefaultDirName={autopf}\NoDAW Studio\Time Stretch X
DefaultGroupName=NoDAW Studio
OutputBaseFilename=TimeStretchX_Setup_1.0.0
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64

[Files]
Source: "build\TimeStretchX_artefacts\Release\VST3\TimeStretchX.vst3\*"; DestDir: "{commoncf64}\VST3\NoDAW\TimeStretchX.vst3"; Flags: recursesubdirs
Source: "build\TimeStretchX_artefacts\Release\Standalone\TimeStretchX.exe"; DestDir: "{app}"
Source: "Resources\Presets\Factory\*"; DestDir: "{userappdata}\NoDAW\TimeStretchX\Presets\Factory"

[Icons]
Name: "{group}\Time Stretch X"; Filename: "{app}\TimeStretchX.exe"
Name: "{group}\Uninstall Time Stretch X"; Filename: "{uninstallexe}"

[Registry]
Root: HKCU; Subkey: "Software\NoDAW\TimeStretchX"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"
```

#### macOS (Packages)

```xml
<!-- TimeStretchX.pkgproj -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PROJECT</key>
    <dict>
        <key>PROJECT_PRESENTATION</key>
        <dict>
            <key>TITLE</key>
            <dict>
                <key>LOCALIZATIONS</key>
                <array>
                    <dict>
                        <key>LANGUAGE</key>
                        <string>English</string>
                        <key>VALUE</key>
                        <string>Time Stretch X</string>
                    </dict>
                </array>
            </dict>
        </dict>
        <key>PROJECT_SETTINGS</key>
        <dict>
            <key>NAME</key>
            <string>TimeStretchX</string>
            <key>BUILD_PATH</key>
            <string>build/installer</string>
        </dict>
    </dict>
</dict>
</plist>
```

### 7.2 Distribution Matrix

| Platform | Format | Target Directory | Installer |
|----------|--------|------------------|-----------|
| Windows | VST3 | `C:\Program Files\Common Files\VST3\` | NSIS/Inno Setup |
| Windows | Standalone | `C:\Program Files\NoDAW\` | NSIS/Inno Setup |
| macOS | VST3 | `/Library/Audio/Plug-Ins/VST3/` | PKG |
| macOS | AU | `/Library/Audio/Plug-Ins/Components/` | PKG |
| macOS | Standalone | `/Applications/` | DMG |
| Linux | VST3 | `~/.vst3/` | DEB/RPM/AppImage |
| Linux | Standalone | `/opt/nodaw/` | DEB/RPM/AppImage |

---

## 8. Quality Assurance

### 8.1 Test Matrix

| Test Category | Test Cases | Automation |
|---------------|------------|------------|
| Unit Tests | DSP algorithms, parameter handling | Google Test |
| Integration | Plugin loading, host compatibility | pluginval |
| Performance | CPU usage, memory, latency | Custom benchmark |
| UI | Visual regression, interaction | Catch2 + screenshots |
| Compatibility | DAW matrix testing | Manual + CI |

### 8.2 DAW Compatibility Matrix

| DAW | Windows | macOS | Notes |
|-----|---------|-------|-------|
| Ableton Live 11/12 | ✓ | ✓ | Full support |
| Logic Pro X | — | ✓ | AU preferred |
| Pro Tools | ✓ | ✓ | AAX pending |
| FL Studio 21 | ✓ | ✓ | Full support |
| Cubase 13 | ✓ | ✓ | Full support |
| Reaper | ✓ | ✓ | Full support |
| Studio One 6 | ✓ | ✓ | Full support |
| Bitwig Studio | ✓ | ✓ | Full support |
| GarageBand | — | ✓ | AU only |

### 8.3 Performance Benchmarks

**Target Metrics (on reference system: M1 Mac, 44.1kHz, 256 samples):**

| Metric | Target | Maximum |
|--------|--------|---------|
| CPU (idle) | < 1% | 2% |
| CPU (processing) | < 15% | 25% |
| RAM | < 100MB | 200MB |
| Latency | < 100ms | 200ms |
| UI framerate | 60fps | 30fps |

---

## 9. Project Timeline

### 9.1 Development Phases

```
2026 Q2                                                     2026 Q4
│                                                             │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┤
│  WEEK   │  WEEK   │  WEEK   │  WEEK   │  WEEK   │  WEEK   │
│   1-2   │   3-4   │   5-6   │   7-8   │   9-10  │  11-12  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│         │         │         │         │         │         │
│ Project │   DSP   │   DSP   │   UI    │   UI    │  Test   │
│  Setup  │  Core   │ Polish  │  Core   │ Polish  │ & Ship  │
│         │         │         │         │         │         │
│ • JUCE  │ • Phase │ • WSOLA │ • Knobs │ • Anim  │ • DAW   │
│   init  │   vocod │ • Grain │ • Wave  │   icon  │   compat│
│ • Build │ • Pitch │ • Form  │ • Algo  │ • Micro │ • Beta  │
│   sys   │   shift │   pres  │   sel   │   inter │   test  │
│ • Param │ • Test  │ • Test  │ • Preset│ • Polish│ • Build │
│   layout│   suite │   suite │   mgr   │         │   inst  │
│         │         │         │         │         │         │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 9.2 Milestone Checklist

#### Phase 1: Project Setup (Week 1-2)
- [ ] JUCE project initialization
- [ ] CMake build system configuration
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] Parameter layout and APVTS
- [ ] Basic plugin shell compiling
- [ ] Development environment documentation

#### Phase 2: DSP Core (Week 3-4)
- [ ] Phase vocoder implementation
- [ ] FFT processing wrapper
- [ ] Basic pitch shifting
- [ ] Time stretch core algorithm
- [ ] Unit test framework
- [ ] Initial benchmarks

#### Phase 3: DSP Polish (Week 5-6)
- [ ] WSOLA algorithm
- [ ] Granular engine
- [ ] Formant preservation
- [ ] Algorithm switching
- [ ] Quality presets
- [ ] Latency compensation

#### Phase 4: UI Core (Week 7-8)
- [ ] NoDAW LookAndFeel
- [ ] Dual knob component
- [ ] Waveform display
- [ ] Algorithm selector
- [ ] Preset browser
- [ ] File loader (standalone)

#### Phase 5: UI Polish (Week 9-10)
- [ ] Animated hourglass→X icon
- [ ] Micro-interactions
- [ ] Theme support
- [ ] Responsive layout
- [ ] Keyboard shortcuts
- [ ] Accessibility

#### Phase 6: Testing & Release (Week 11-12)
- [ ] DAW compatibility testing
- [ ] Performance optimization
- [ ] Beta testing program
- [ ] Installer creation
- [ ] Documentation
- [ ] Marketing assets
- [ ] v1.0.0 release

---

## 10. Appendix

### 10.1 References

**DSP Theory:**
- Zölzer, U. (2011). *DAFX: Digital Audio Effects*
- Roads, C. (2001). *Microsound*
- Laroche, J. & Dolson, M. (1999). "Improved Phase Vocoder Time-Scale Modification of Audio"

**JUCE Resources:**
- [JUCE Documentation](https://docs.juce.com/)
- [JUCE Tutorials](https://juce.com/learn/tutorials)
- [The Audio Programmer](https://www.theaudioprogrammer.com/)

**Design Inspiration:**
- [Awwwards](https://www.awwwards.com/)
- [Dribbble Audio UI](https://dribbble.com/search/audio-plugin)
- [Plugin Boutique](https://www.pluginboutique.com/)

### 10.2 Glossary

| Term | Definition |
|------|------------|
| APVTS | AudioProcessorValueTreeState - JUCE's parameter management |
| FFT | Fast Fourier Transform - frequency domain analysis |
| Formant | Resonant frequencies that give voice its character |
| Granular | Synthesis technique using small audio grains |
| Phase Vocoder | Frequency-domain time-stretching algorithm |
| WSOLA | Waveform Similarity Overlap-Add - time-domain stretching |

### 10.3 File Format Support

| Format | Read | Write | Notes |
|--------|------|-------|-------|
| WAV | ✓ | ✓ | Full support |
| AIFF | ✓ | ✓ | Full support |
| FLAC | ✓ | ✓ | Requires JUCE module |
| MP3 | ✓ | — | Read only (licensing) |
| OGG | ✓ | ✓ | Full support |
| M4A/AAC | ✓ | — | macOS only |

### 10.4 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space | Play/Stop |
| Ctrl+O | Open file |
| Ctrl+S | Save preset |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| 1-5 | Select algorithm |
| L | Toggle link mode |
| K | Toggle key lock |
| R | Reset values |
| Esc | Cancel/Close |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-14 | NoDAW Team | Initial comprehensive plan |

---

*This document is confidential and proprietary to NoDAW Studio.*
