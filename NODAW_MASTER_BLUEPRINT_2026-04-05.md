# NoDAW Studio Suite — Master Blueprint
**Version:** 1.0  
**Date:** April 5, 2026  
**Status:** Architecture & Implementation Plan

---

## Executive Summary

NoDAW is a premium audio production suite delivering **7 specialized tools** through a unified, cinematic launcher experience. The visual design targets **Awwwards Site of the Day** quality through the existing Cyber-HUD design language, elevated with WebGL effects, 3D spatial interactions, and theatrical micro-animations.

### Product Suite (Final Naming)
| Tool                   | Internal Name | Marketing Name         | Status | Tier |
|------|---------------|----------------|--------|------|
| AI Stem Separator       | StemSplit        | **SplitIt**          | ~90% | Pro |
| Pitch/Tempo Manipulation | HalfScrew       | **ScrewIt**           | ~85% | Pro |
| Audio Trimming              | TrimIt | **TrimIt**                   | ~75% | Free |
| Format Converter        | AudioConvert | **ConvertIt**             | ~70% | Free |
| One-Click FX Chain        | 1-Click FX | **FXit**                  | ~60% | Pro |
| A/B Comparison              | A/B Test | **TestIt**                  | ~50% | Free |
| Multitrack Workstation     | MultiTrack | **NoDAW Workstation**    | ~40% | Pro+ |

---

# PART 1: VISUAL DESIGN SYSTEM

## 1.1 Awwwards Criteria Targeting

To achieve SOTD/SOTM status, the launcher must excel in:

| Category | Weight | Strategy |
|----------|--------|----------|
| **Design** | 40% | Cyber-organic HUD, 3D parallax grid, glassmorphism |
| **Creativity** | 25% | Device metaphor, unlock theatrics, progressive reveal |
| **Usability** | 20% | Sub-200ms interactions, intuitive flow, full A11y |
| **Content** | 15% | Compelling copy, feature education, social proof |

## 1.2 Launcher Visual Architecture

### Hero Section (Above-the-Fold)
```
┌────────────────────────────────────────────────────────────────────┐
│  ╭─────────────────────────────────────────────────────────────╮ │
│  │        [WebGL: Neural-Wave Particle System]                 │   │
│  │              ○ Cyan particle field                          │   │
│  │              ○ Mouse-reactive flow                          │   │
│  │              ○ Audio-reactive when music plays              │   │
│  ╰────────────────────────────────────────────────────────────╯  │
│                                                                    │
│                     ╔═══════════════════╗                          │
│                     ║     N O D A W     ║  <- 3D extruded logo     │
│                     ║    STUDIO SUITE   ║     with chrome rim      │
│                     ╚═══════════════════╝                          │
│                                                                    │
│         [ One App. Seven Powers. Zero Limits. ]                    │
│                                                                    │
│              ┌─────────────────────────────┐                       │
│              │    ▶  ENTER THE SUITE       │  <- Pulsing CTA       │
│              └─────────────────────────────┘                       │
│                                                                    │
│         ∨  Scroll to Explore  ∨                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Feature Grid (3D Tile System)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐            │
│   │ SplitIt │   │ ScrewIt │   │  TrimIt │   │ConvertIt│            │
│   │   🔐    │   │   🔐    │   │   FREE  │   │  FREE   │            │
│   │  [Pro]  │   │  [Pro]  │   │         │   │         │            │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘            │
│       ↕             ↕             ↕             ↕                  │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐                          │
│   │  FXit   │   │  TestIt │   │Workstatn│                          │
│   │   🔐    │   │   FREE  │   │   🔐    │                          │
│   │  [Pro]  │   │         │   │  [Pro+] │                          │
│   └─────────┘   └─────────┘   └─────────┘                          │
│                                                                     │
│   [ Tiles have 3D depth, parallax hover, glow on hover ]           │
│   [ Locked tiles show animated lock + shimmer effect   ]           │
│   [ Clicking locked = Unlock Modal with shatter anim   ]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 1.3 Motion Design Spec

### Timings
| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Hero logo entrance | 1200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | 3D rotation + scale |
| Tile hover tilt | 300ms | `spring(1, 80, 10, 0)` | 3D transform |
| Tile click | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Scale down + glow |
| Lock shatter | 800ms | `spring` | Particle burst + color bloom |
| Modal entrance | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Scale + fade |
| Background particles | ∞ | Linear | 60fps WebGL loop |

### Signature Effects
1. **Chromatic Aberration**: RGB offset layers on hero elements
2. **Glow Pulse**: Cyan accent elements pulse at 2s intervals
3. **Particle Wake**: Mouse trail leaves dissipating particles
4. **Boot Sequence**: Tiles animate in sequence (100ms stagger)

## 1.4 Component Token System

```typescript
// Design Tokens (extend SYSTEM_DESIGN.md)
const tokens = {
  // Surfaces
  bgPrimary: '#020617',      // slate-950
  bgSecondary: '#0f172a',    // slate-900
  bgGlass: 'rgba(15, 23, 42, 0.85)',
  
  // Accents
  accentPrimary: '#22d3ee',  // cyan-400
  accentSecondary: '#06b6d4', // cyan-500
  accentGlow: 'rgba(34, 211, 238, 0.5)',
  
  // Tier Colors
  tierFree: '#34d399',       // emerald-400
  tierPro: '#a78bfa',        // purple-400  
  tierProPlus: '#f97316',    // orange-500
  
  // Lock States
  lockedOverlay: 'rgba(15, 23, 42, 0.9)',
  lockedBorder: 'rgba(148, 163, 184, 0.3)',
  
  // Shadows
  shadowGlow: '0 0 40px rgba(34, 211, 238, 0.15)',
  shadowCard: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  
  // Border Radius
  radiusCard: '16px',
  radiusButton: '8px',
  radiusModal: '24px',
};
```

---

# PART 2: ARCHITECTURE & PROJECT STRUCTURE

## 2.1 Monorepo Structure

```
NoDAW-Suite/
├── apps/
│   ├── launcher/              # Main launcher (Electron + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── 3d/        # Three.js components
│   │   │   │   ├── ui/        # Core UI components
│   │   │   │   └── features/  # Feature tiles, modals
│   │   │   ├── hooks/
│   │   │   ├── stores/        # Zustand state
│   │   │   └── effects/       # WebGL shaders
│   │   ├── electron/
│   │   │   ├── main.ts        # Main process
│   │   │   ├── preload.ts     # Context bridge
│   │   │   └── updater.ts     # Auto-updates
│   │   └── package.json
│   │
│   ├── split-it/              # StemSplit (standalone + embeddable)
│   ├── screw-it/              # HalfScrew
│   ├── trim-it/               # TrimIt
│   ├── convert-it/            # Audio converter
│   ├── fx-it/                 # One-click FX
│   ├── test-it/               # A/B Compare
│   └── workstation/           # MultiTrack DAW
│
├── packages/
│   ├── ui/                    # Shared UI components
│   ├── audio-engine/          # Web Audio utilities
│   ├── license/               # License validation
│   ├── analytics/             # Usage tracking
│   └── design-tokens/         # Shared styles
│
├── installers/
│   ├── windows/
│   │   ├── nsis/              # NSIS installer scripts
│   │   └── assets/            # Icons, banners
│   └── macos/
│       ├── dmg/               # DMG builder
│       └── notarization/      # Apple notarization
│
├── website/                   # Marketing site (optional)
│   ├── src/
│   └── public/
│
├── turbo.json                 # Turborepo config
├── package.json               # Root workspace
└── pnpm-workspace.yaml
```

## 2.2 Core Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Desktop Runtime | Electron 40+ | Cross-platform native shell |
| UI Framework | React 19+ | Component architecture |
| 3D/WebGL | Three.js + R3F | Particle systems, 3D tiles |
| Animation | Framer Motion | UI transitions |
| State | Zustand | License state, preferences |
| Styling | Tailwind CSS 4 | Design system |
| Audio | Web Audio API + ffmpeg.wasm | Processing |
| Build | Vite + Turborepo | Fast monorepo builds |
| Installer | electron-builder + NSIS | Distribution |

---

# PART 3: INSTALLER & DISTRIBUTION

## 3.1 Windows Installer (NSIS)

### Self-Troubleshooting Features
```nsis
; installer.nsi - Key features

!include "MUI2.nsh"
!include "LogicLib.nsh"

; Pre-flight checks
Function .onInit
  ; Check .NET runtime
  Call CheckDotNetRuntime
  
  ; Check Visual C++ Redistributable
  Call CheckVCRedist
  
  ; Check disk space (min 500MB)
  Call CheckDiskSpace
  
  ; Check Windows version (10+)
  Call CheckWindowsVersion
  
  ; Auto-repair permissions if needed
  Call EnsureWriteAccess
FunctionEnd

; Dependency auto-install
Function InstallDependencies
  ; Download and silently install VC++ if missing
  IfFileExists "$SYSDIR\vcruntime140.dll" vcok
    SetOutPath "$TEMP"
    inetc::get /SILENT "https://nodaw.studio/deps/vc_redist.x64.exe" "$TEMP\vc_redist.exe"
    ExecWait '"$TEMP\vc_redist.exe" /quiet /norestart'
  vcok:
FunctionEnd

; Self-repair option
Function RepairInstallation
  ; Clears cache, resets config, verifies files
  RMDir /r "$LOCALAPPDATA\NoDAW\Cache"
  RMDir /r "$LOCALAPPDATA\NoDAW\GPUCache"
  SetOverwrite on
  File /r "${SRCDIR}\*.*"
  Call CreateShortcuts
FunctionEnd
```

### Installer UX Flow
```
┌─────────────────────────────────────────────────────────┐
│  [1. Welcome]                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │     ╔═══════════════════╗                           ││
│  │     ║     N O D A W     ║                           ││
│  │     ╚═══════════════════╝                           ││
│  │                                                      ││
│  │  Welcome to NoDAW Studio Suite                       ││
│  │  The professional audio toolkit                      ││
│  │                                                      ││
│  │  ○ Checking system requirements...                   ││
│  │    ✓ Windows 10 or later                             ││
│  │    ✓ 500 MB available                                ││
│  │    ✓ Visual C++ Runtime                              ││
│  │                                                      ││
│  │        [ Install Now ]  [ Advanced ]                 ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [2. Progress - Animated]                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Installing NoDAW Studio Suite...                    ││
│  │                                                      ││
│  │  [████████████████░░░░░░░░░░░░░░] 47%                ││
│  │                                                      ││
│  │  ▸ Extracting SplitIt engine...                      ││
│  │  ▸ Registering audio codecs...                       ││
│  │                                                      ││
│  │  [ Animated waveform visualization here ]            ││
│  │                                                      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [3. Complete]                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │         ✓ Installation Complete                      ││
│  │                                                      ││
│  │  NoDAW Studio Suite is ready!                        ││
│  │                                                      ││
│  │  ☑ Launch NoDAW now                                  ││
│  │  ☐ Create Desktop shortcut                           ││
│  │  ☐ Pin to taskbar                                    ││
│  │                                                      ││
│  │        [ Finish ]                                    ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 3.2 macOS Installer (DMG + Notarization)

### DMG Design
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│    ╔═══════════════════╗                                 │
│    ║     N O D A W     ║                                 │
│    ╚═══════════════════╝                                 │
│                                                          │
│              ↓ Drag to install ↓                         │
│                                                          │
│    ┌──────────┐        ┌──────────┐                      │
│    │          │   →    │          │                      │
│    │  NoDAW   │        │ Apps     │                      │
│    │   .app   │        │ folder   │                      │
│    └──────────┘        └──────────┘                      │
│                                                          │
│         [ Background: Cyber-HUD gradient ]               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Notarization Pipeline
```yaml
# .github/workflows/macos-release.yml
jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - name: Build
        run: npm run build:mac
        
      - name: Sign
        run: |
          codesign --deep --force --sign "$APPLE_CERT_ID" \
            --options runtime \
            --entitlements entitlements.mac.plist \
            "release/NoDAW-Suite.app"
            
      - name: Notarize
        run: |
          xcrun notarytool submit "release/NoDAW-Suite.dmg" \
            --apple-id "$APPLE_ID" \
            --team-id "$APPLE_TEAM_ID" \
            --password "$NOTARIZE_PASSWORD" \
            --wait
            
      - name: Staple
        run: xcrun stapler staple "release/NoDAW-Suite.dmg"
```

## 3.3 Unified Bundle Architecture

All tools are bundled in a single ~150MB installer. Tools load on-demand:

```
NoDAW/
├── NoDAW.exe                    # Main launcher (~15MB)
├── resources/
│   ├── app.asar                 # Launcher code
│   └── modules/
│       ├── split-it.asar        # ~40MB (includes ML models)
│       ├── screw-it.asar        # ~25MB
│       ├── trim-it.asar         # ~8MB
│       ├── convert-it.asar      # ~12MB (includes ffmpeg)
│       ├── fx-it.asar           # ~10MB
│       ├── test-it.asar         # ~6MB
│       └── workstation.asar     # ~35MB
├── ffmpeg/
│   └── ffmpeg.exe               # Shared binary
├── models/
│   └── demucs/                  # Shared AI models
└── licenses/
    └── license.json             # User license state
```

---

# PART 4: LICENSING & GATING MODEL

## 4.1 Tier Structure

```typescript
enum LicenseTier {
  FREE = 'free',
  PRO = 'pro',
  PRO_PLUS = 'pro_plus'
}

const TIER_ACCESS: Record<LicenseTier, string[]> = {
  [LicenseTier.FREE]: [
    'trim-it',
    'convert-it', 
    'test-it'
  ],
  [LicenseTier.PRO]: [
    'trim-it',
    'convert-it',
    'test-it',
    'split-it',      // StemSplit
    'screw-it',      // HalfScrew
    'fx-it'          // One-Click FX
  ],
  [LicenseTier.PRO_PLUS]: [
    '*',              // All tools
    'workstation'     // Full DAW
  ]
};
```

## 4.2 Pricing Strategy

| Tier | Price | Value Proposition |
|------|-------|-------------------|
| **Free** | $0 | Basic audio toolkit. Convert, trim, compare. Perfect for casual use. |
| **Pro** | $49/once or $4.99/mo | Unlock creative tools. AI stem separation, pitch manipulation, instant FX chains. |
| **Pro+** | $99/once or $9.99/mo | Everything + NoDAW Workstation. Full DAW capabilities, commercial license. |

### Upsell Triggers
1. **First locked feature click**: Unlock modal with value preview
2. **After 3 free tool uses**: Banner suggesting Pro benefits
3. **Export completion**: "Upgrade for unlimited exports" CTA
4. **7-day mark**: Special offer email if signed up

## 4.3 License Validation System

```typescript
// packages/license/src/index.ts

interface License {
  tier: LicenseTier;
  key: string;
  email: string;
  activatedAt: number;
  expiresAt: number | null;  // null = lifetime
  machineId: string;
}

class LicenseManager {
  private static LICENSE_API = 'https://api.nodaw.studio/v1/license';
  
  // Offline-first validation with periodic sync
  async validateLicense(key: string): Promise<LicenseResult> {
    // 1. Check local cache first
    const cached = this.getCachedLicense();
    if (cached && this.isValid(cached)) {
      return { valid: true, license: cached };
    }
    
    // 2. If online, validate with server
    if (navigator.onLine) {
      try {
        const response = await fetch(`${LICENSE_API}/validate`, {
          method: 'POST',
          body: JSON.stringify({ key, machineId: this.getMachineId() })
        });
        const result = await response.json();
        if (result.valid) {
          this.cacheLicense(result.license);
        }
        return result;
      } catch (e) {
        // Server unreachable, use cache with grace period
        if (cached && this.isInGracePeriod(cached)) {
          return { valid: true, license: cached, offline: true };
        }
      }
    }
    
    // 3. Offline with valid cache
    if (cached && this.isInGracePeriod(cached)) {
      return { valid: true, license: cached, offline: true };
    }
    
    return { valid: false };
  }
  
  // 30-day offline grace period
  private isInGracePeriod(license: License): boolean {
    const gracePeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
    return Date.now() - license.activatedAt < gracePeriod;
  }
  
  // Machine fingerprinting for activation limits
  private getMachineId(): string {
    // Combine: hostname + username + platform + CPU
    return hashString(`${os.hostname()}:${os.userInfo().username}:${process.platform}:${os.cpus()[0].model}`);
  }
}
```

## 4.4 Protection & Security

### Obfuscation Pipeline
```javascript
// vite.config.ts - Production build
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        properties: {
          regex: /^_/  // Mangle private properties
        }
      },
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Post-build obfuscation
  plugins: [
    obfuscatorPlugin({
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      rotateStringArray: true,
      selfDefending: true
    })
  ]
});
```

### ASAR Integrity
```javascript
// electron/main.ts
import { verifyAsar } from './security';

app.on('ready', async () => {
  // Verify ASAR integrity before loading modules
  const modules = ['split-it', 'screw-it', 'fx-it', 'workstation'];
  for (const mod of modules) {
    const valid = await verifyAsar(`resources/modules/${mod}.asar`);
    if (!valid) {
      dialog.showErrorBox('Integrity Error', `Module ${mod} has been tampered with.`);
      app.quit();
      return;
    }
  }
});
```

---

# PART 5: IMPLEMENTATION ROADMAP

## Phase 0: Foundation (Current State Assessment)
**Duration:** 1 week  
**Goal:** Consolidate existing projects into unified structure

| Task | Status | Priority |
|------|--------|----------|
| Audit StemSplit completion | ~90% done | P0 |
| Audit HalfScrew completion | ~85% done | P0 |
| Consolidate TrimIt from subfolder | ~75% done | P1 |
| Merge IconGenius (separate product) | Exclude | - |
| Create shared packages structure | Not started | P0 |

## Phase 1: Launcher Core (Week 2-3)
**Goal:** Unified launcher with 3D visual system

| Task | Days | Dependencies |
|------|------|--------------|
| Set up Turborepo monorepo | 2 | None |
| Implement Three.js particle system | 3 | None |
| Build 3D tile grid component | 3 | Particle system |
| Create unlock modal with animations | 2 | Tile grid |
| Implement onboarding sequence | 2 | All above |
| License state management | 2 | None |

## Phase 2: Tool Integration (Week 4-5)
**Goal:** All tools embedded in launcher

| Task | Days | Dependencies |
|------|------|--------------|
| Extract shared audio-engine package | 2 | Phase 1 |
| Integrate StemSplit (SplitIt) | 2 | audio-engine |
| Integrate HalfScrew (ScrewIt) | 2 | audio-engine |
| Migrate TrimIt to launcher | 1 | audio-engine |
| Build ConvertIt from existing code | 2 | audio-engine |
| Build FXit from WORKFLOWS | 2 | audio-engine |
| Build TestIt (A/B) from existing | 1 | audio-engine |

## Phase 3: Workstation MVP (Week 6-7)
**Goal:** Basic multitrack DAW functionality

| Task | Days | Dependencies |
|------|------|--------------|
| Multitrack timeline component | 4 | Phase 2 |
| Basic mixing controls | 3 | Timeline |
| Drag-drop workflow | 2 | Timeline |
| Export to stems/master | 2 | Mixing |

## Phase 4: Installers & Distribution (Week 8)
**Goal:** Production-ready installers

| Task | Days | Dependencies |
|------|------|--------------|
| NSIS Windows installer | 3 | Phase 3 |
| DMG + Notarization for macOS | 3 | Phase 3 |
| Auto-update system | 2 | Installers |
| Self-repair functionality | 1 | Installers |

## Phase 5: Polish & Launch (Week 9-10)
**Goal:** Awwwards-ready quality

| Task | Days | Dependencies |
|------|------|--------------|
| Performance optimization | 3 | All |
| Accessibility audit | 2 | All |
| Final animation polish | 3 | All |
| Marketing site (if separate) | 3 | None |
| Beta testing | 4 | All |
| Launch preparation | 2 | Testing |

---

# PART 6: COMPONENT SPECIFICATIONS

## 6.1 Core Launcher Components

### `<ParticleField />`
```tsx
// WebGL particle system with audio reactivity
interface ParticleFieldProps {
  particleCount: number;      // 800-1200 for performance
  colorPrimary: string;       // cyan-400
  colorSecondary: string;     // purple-400
  audioData?: Float32Array;   // Connect analyzer for reactivity
  mouseTrail: boolean;        // Enable mouse wake effect
}
```

### `<FeatureTile />`
```tsx
interface FeatureTileProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tier: 'free' | 'pro' | 'pro_plus';
  locked: boolean;
  onLaunch: () => void;
  onUnlockRequest: () => void;
  preview?: React.ReactNode;  // Mini animation preview
}

// States:
// - idle: Base styling with subtle glow
// - hover: 3D tilt + glow intensify + preview plays
// - locked: Grayscale overlay + lock icon + shimmer
// - launching: Scale pulse + loading indicator
```

### `<UnlockModal />`
```tsx
interface UnlockModalProps {
  open: boolean;
  feature: FeatureInfo;
  onClose: () => void;
  onUnlock: (key: string) => Promise<boolean>;
}

// Visual spec:
// - Glass panel with neon border
// - Lock icon that shatters on success
// - Key input with glow focus state
// - Error shake animation
// - Success: confetti + color bloom
```

### `<OnboardingSequence />`
```tsx
// Boot sequence:
// 1. Background fades in (500ms)
// 2. Logo assembles from particles (800ms)
// 3. Tiles boot up in sequence (100ms stagger)
// 4. Welcome message types in (600ms)
// 5. Grid becomes interactive

interface OnboardingSequenceProps {
  onComplete: () => void;
  skipEnabled: boolean;       // ESC to skip
}
```

## 6.2 Tool Component Architecture

Each tool follows a consistent panel structure:

```tsx
// apps/split-it/src/SplitItPanel.tsx
const SplitItPanel: React.FC = () => {
  return (
    <ToolPanel 
      title="SplitIt"
      subtitle="AI Stem Separation"
      icon={<SplitIcon />}
    >
      <DropZone 
        onDrop={handleFileDrop}
        accept={['audio/*']}
      />
      
      <ConfigPanel>
        {/* Model selection, quality settings */}
      </ConfigPanel>
      
      <ProcessingView>
        {/* Progress, waveform preview */}
      </ProcessingView>
      
      <OutputPanel>
        {/* Stem players, export options */}
      </OutputPanel>
    </ToolPanel>
  );
};
```

---

# PART 7: MARKETING SITE (OPTIONAL)

If deploying a separate web presence (recommended for Awwwards submission):

## 7.1 Site Structure
```
nodaw.studio/
├── /                   # Hero + feature overview
├── /tools              # Individual tool pages
│   ├── /split-it
│   ├── /screw-it
│   └── ...
├── /pricing           # Tier comparison
├── /download          # Platform detection + download
└── /support           # Docs + troubleshooting
```

## 7.2 Hero Section (Site)
Same visual language as launcher, but scroll-driven reveal:

1. **Hero**: Full-viewport particle field + logo
2. **Problem Section**: "Audio tools are fragmented and expensive"
3. **Solution Carousel**: Animated tool previews
4. **Testimonials**: Artist quotes with portraits
5. **Pricing Cards**: Glassmorphism tiers
6. **Download CTA**: Platform auto-detection

---

# PART 8: METRICS & SUCCESS CRITERIA

## 8.1 Technical Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Launcher cold start | < 3s | Electron timing |
| First contentful paint | < 1s | Lighthouse |
| Frame rate (particles) | 60fps | Performance API |
| Memory usage (idle) | < 150MB | Task manager |
| Bundle size | < 150MB | Build output |

## 8.2 UX Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature discovery | > 80% click-through | Analytics |
| Unlock conversion | > 5% click-to-purchase | Analytics |
| Time to first export | < 2 minutes | User tracking |
| Session duration | > 5 minutes | Analytics |

## 8.3 Business Metrics
| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Downloads | 5,000 | 25,000 | 100,000 |
| Free signups | 2,000 | 10,000 | 40,000 |
| Pro conversions | 200 | 1,500 | 8,000 |
| Revenue | $9,800 | $73,500 | $392,000 |

---

# APPENDIX A: QUICK DECISIONS

## Naming Conventions
| Current | Final | Rationale |
|---------|-------|-----------|
| StemSplit | **SplitIt** | Verb-based, memorable, "It" suffix consistency |
| HalfScrew | **ScrewIt** | Edgy, memorable, maintains suite naming |
| AudioConvert | **ConvertIt** | Consistent naming |
| 1-Click FX | **FXit** | Short, punchy |
| A/B Test | **TestIt** | Consistent |
| MultiTrack | **NoDAW Workstation** | Premium positioning |

## Recommended Execution Order
1. **Consolidate**: Merge existing StemSplit + HalfScrew into monorepo
2. **Extract**: Create shared packages (ui, audio-engine, license)
3. **Launcher**: Build 3D launcher shell
4. **Integrate**: Embed existing tools into launcher
5. **Complete**: Finish MVP for incomplete tools
6. **Installers**: NSIS + DMG with self-repair
7. **Polish**: Animation timing, accessibility, performance
8. **Ship**: Beta → Production

---

# APPENDIX B: FILE CHECKLIST

## New Files to Create
```
□ apps/launcher/src/components/3d/ParticleField.tsx
□ apps/launcher/src/components/3d/GlowEffect.tsx
□ apps/launcher/src/components/ui/FeatureTile.tsx
□ apps/launcher/src/components/ui/UnlockModal.tsx
□ apps/launcher/src/components/ui/OnboardingSequence.tsx
□ apps/launcher/src/stores/licenseStore.ts
□ apps/launcher/src/hooks/useParticles.ts
□ packages/license/src/index.ts
□ packages/license/src/validation.ts
□ packages/audio-engine/src/index.ts
□ installers/windows/nsis/installer.nsi
□ installers/macos/dmg/background.png
□ turbo.json
□ pnpm-workspace.yaml
```

## Files to Migrate/Refactor
```
□ TrimIt/ → apps/trim-it/
□ IconGenius/ → Remove (separate project)
□ components/launcher/* → apps/launcher/src/components/
□ constants.tsx → packages/shared/src/constants.ts
□ license.ts → packages/license/src/
□ audioAnalysis.ts → packages/audio-engine/src/
```

---

*Document Version: 1.0*  
*Last Updated: April 5, 2026*  
*Author: NoDAW Architecture Team*
