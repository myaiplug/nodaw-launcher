# NoDAW Super Master TODO List

Consolidated from VST and design planning docs into one execution checklist.

## Source Docs Consolidated
- [NoDAW_Clipper_2026_Gumroad_Strategy_and_Product_Plan.md](NoDAW_Clipper_2026_Gumroad_Strategy_and_Product_Plan.md)
- [TimeStretchX/TIMESTRETCH_X_MASTER_PLAN.md](TimeStretchX/TIMESTRETCH_X_MASTER_PLAN.md)
- [NODAW_MASTER_BLUEPRINT_2026-04-05.md](NODAW_MASTER_BLUEPRINT_2026-04-05.md)
- [NODAW_IMPLEMENTATION_GUIDE_2026-04-05.md](NODAW_IMPLEMENTATION_GUIDE_2026-04-05.md)
- [DESIGN_SYSTEMS_MASTER.md](DESIGN_SYSTEMS_MASTER.md)
- [FRONTEND_EXCELLENCE.md](FRONTEND_EXCELLENCE.md)
- [WORKSTATION_MASTER_PLAN.md](WORKSTATION_MASTER_PLAN.md)
- [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)
- [NoDAW_Launcher_Analysis_2026-03-18.md](NoDAW_Launcher_Analysis_2026-03-18.md)
- [NoDAW_Launcher_Wireframe_2026-03-19.md](NoDAW_Launcher_Wireframe_2026-03-19.md)
- [NoDAW_Launcher_Onboarding_Prototype_2026-03-19.md](NoDAW_Launcher_Onboarding_Prototype_2026-03-19.md)
- [NoDAW_Launcher_Gating_Unlock_Design_2026-03-19.md](NoDAW_Launcher_Gating_Unlock_Design_2026-03-19.md)

---

## Phase 0 - Product Direction Lock
- [ ] Finalize suite naming alignment for all tools (marketing + internal names).
- [ ] Freeze v1 launch set (what ships now vs what moves to v1.1/v1.2).
- [ ] Define quality gates for every shipped UI: readability, responsiveness, visual polish, CPU budget.
- [ ] Define quality gates for every shipped audio tool: artifact tolerance, latency, CPU ceiling, stability.
- [ ] Approve one shared positioning statement for NoDAW suite and one per tool.

## Phase 1 - Shared Foundations (Design + Engineering)

### 1.1 Shared Design System
- [ ] Standardize typography system: one display family + one utility mono family.
- [ ] Standardize dark-neutral palette + one accent strategy per product line.
- [ ] Standardize component behavior: buttons, knobs, toggles, sliders, meters, modals.
- [ ] Build shared token file for spacing, radius, elevation, motion, glow.
- [ ] Create accessibility baseline: contrast, focus states, keyboard flow, reduced motion mode.

### 1.2 Shared Audio/Plugin Infrastructure
- [ ] Lock toolchain: C++20 + CMake + JUCE 8.x + VST3 SDK pathing.
- [ ] Create shared plugin base classes for parameter/state management.
- [ ] Build shared metering package (peak, RMS, true-peak approximation, hold logic).
- [ ] Build shared preset schema with versioning and migration.
- [ ] Build shared realtime-safety guardrails (no allocs/no locks in audio callback).
- [ ] Add shared test harness for DSP unit tests and audio regression tests.

### 1.3 Release Infrastructure
- [ ] Configure CI for Windows/macOS plugin builds.
- [ ] Set up artifact packaging per build (dev/beta/release).
- [ ] Set up code signing and notarization workflows.
- [ ] Add changelog/version automation and release checklist template.

---

## Phase 2 - Launcher Completion (Cyber-HUD + Gating)

### 2.1 Core Launcher Completion
- [ ] Implement dynamic app discovery (remove hardcoded tile dependence).
- [ ] Add robust user-facing error system (toast + modal + retry actions).
- [ ] Add accessibility pass (ARIA, keyboard nav, focus management, screen reader labels).
- [ ] Add app health/status indicators (running, failed, update available).
- [ ] Add launcher settings/preferences panel.
- [ ] Add launcher unit/integration tests.

### 2.2 Onboarding and Progressive Reveal
- [ ] Implement boot sequence: animated logo + sequential tile startup.
- [ ] Implement progressive visual unlock evolution.
- [ ] Add achievement badge system and reveal animations.
- [ ] Add optional ambient sound layer with mute toggle.

### 2.3 Feature Gating and Unlock Flow
- [ ] Finalize locked tile visual language and teaser previews.
- [ ] Implement unlock modal with key entry, upgrade CTA, and failure feedback.
- [ ] Add unlock success sequence (lock shatter, color bloom, tile activation).
- [ ] Persist and recover unlock state safely.
- [ ] Add full unlock analytics funnel events.

### 2.4 3D/Effects Layer
- [ ] Integrate production particle field and performance fallback path.
- [ ] Add chromatic effects and glow tuning without harming readability.
- [ ] Profile and enforce 60fps target on typical hardware.

---

## Phase 3 - VST Track A: NoDAW Clip-IT (Top Priority)

### 3.1 DSP Core
- [ ] Implement clipping modes (hard/soft/variable knee).
- [ ] Implement 4x optimized linear-phase oversampling (+ quality modes).
- [ ] Implement antiderivative antialiasing path.
- [ ] Implement FIR remainder control path.
- [ ] Implement optional hard clip stage for overshoot management.
- [ ] Implement low CPU / normal / high quality processing profiles.

### 3.2 Metering and Analysis
- [ ] Implement input/output meters with peak hold.
- [ ] Implement gain reduction history trace.
- [ ] Implement true-peak warning indicator.
- [ ] Implement clip-difference solo (listen to removed content).

### 3.3 GUI (High-End Minimalist)
- [ ] Build main layout with all sound-critical controls visible.
- [ ] Build transfer curve display with knee visualization.
- [ ] Build GR/clip amount readout panel.
- [ ] Add footer diagnostics (CPU, latency, preset, A/B, undo/redo).
- [ ] Validate typography/contrast at arm's-length readability standard.

### 3.4 Filters and Presets
- [ ] Implement basic filter families for v1 with advanced mode toggle.
- [ ] Implement category-based factory presets.
- [ ] Ship at least 80 factory presets (8 categories x 10).
- [ ] Add preset metadata fields: use case, source hint, recommended input range.

### 3.5 Commercial Readiness (Clip-IT)
- [ ] Create Gumroad hero assets (images + motion snippets + A/B audio).
- [ ] Create concise product demo video and deep-dive walkthrough.
- [ ] Create educational copy: clipper vs limiter, oversampling usage.

---

## Phase 4 - VST Track B: TimeStretchX

### 4.1 Stability and Build
- [x] Fix JUCE 8 compatibility blockers and achieve VST3 build artifact.
- [ ] Resolve auto-install permission flow for non-admin builds.
- [ ] Run full host compatibility pass (Ableton, FL, Reaper, Cubase).

### 4.2 DSP Quality Track
- [ ] Finalize algorithm set and quality tiers.
- [ ] Add artifact detection test cases (extreme stretch/pitch cases).
- [ ] Validate formant/key-lock behavior across vocal/instrument material.

### 4.3 UI Excellence Track
- [ ] Finalize dual-knob interaction model and linked behavior.
- [ ] Complete waveform + transport clarity for standalone workflow.
- [ ] Implement premium motion and micro-interactions with restraint.
- [ ] Align visual language with suite design tokens.

### 4.4 Content and Presets
- [ ] Build algorithm-specific preset banks by use case.
- [ ] Add quick-start macro presets (speech, remix, ambient, chop/screw).

---

## Phase 5 - VST Track C: Suite-Wide Plugin Expansion
- [ ] Define next plugin sequence after Clip-IT and TimeStretchX.
- [ ] Create shared plugin shell template for fast new-tool creation.
- [ ] Enforce identical UX conventions across all NoDAW plugins.
- [ ] Build common telemetry hooks for usage-informed iteration.

---

## Phase 6 - Workstation and Tool Integration
- [ ] Implement Workstation MVP focused on fast stem combining and automation.
- [ ] Add one-click import from SplitIt output into Workstation timeline.
- [ ] Add quick export presets for social/release workflows.
- [ ] Add workflow bridges between launcher tools (handoff metadata).

---

## Phase 7 - QA, Performance, and Reliability

### 7.1 Performance
- [ ] Establish per-tool CPU budgets and enforce profiling checks.
- [ ] Add GPU performance budget for launcher visuals.
- [ ] Add low-spec fallback modes for visual effects.

### 7.2 Testing
- [ ] Add automated DSP regression suite.
- [ ] Add plugin state serialization tests (preset backward compatibility).
- [ ] Add launcher integration tests (unlock, launch, error, recovery).

### 7.3 Reliability
- [ ] Add process monitoring for launched sub-apps.
- [ ] Add crash recovery and actionable user diagnostics.
- [ ] Add self-repair flows for broken installs.

---

## Phase 8 - Go-To-Market and Sales Optimization
- [ ] Build product-page templates with proof-first structure.
- [ ] Produce short before/after content for each flagship tool.
- [ ] Add onboarding education snippets directly inside launcher.
- [ ] Set up post-purchase update and feedback loop.
- [ ] Run conversion experiments on pricing, demo format, and copy.

---

## Critical Milestones
- [ ] M1: Launcher polish + gating fully production-ready.
- [ ] M2: Clip-IT v1 internal beta complete.
- [ ] M3: TimeStretchX v1 host-certified.
- [ ] M4: Shared preset and metering infrastructure adopted by all tools.
- [ ] M5: Gumroad-ready launch package complete for flagship VST.

## Definition of Done (Global)
- [ ] Every shipping feature has tests, docs, and demo media.
- [ ] Every shipping UI meets high-end minimalist readability and motion standards.
- [ ] Every shipping audio path meets artifact and CPU acceptance criteria.
- [ ] Every shipping installer path is signed, stable, and user-recoverable.
