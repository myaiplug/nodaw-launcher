# SmartPromptIt Standalone EXE + Website Plan
Date: 2026-04-15
Status: Build Plan

## Goal
Build SmartPromptIt as two coordinated products:
1. A standalone desktop EXE for Windows first, then macOS
2. A website/web app for direct prompt enhancement, acquisition, and conversion

The desktop app and website should share the same prompt intelligence core, but solve different user jobs.

## Product Split

### A) Standalone EXE
Primary role:
- Always-available desktop prompt enhancer for power users
- Fast capture, rewrite, copy, and export flow
- Deeper local workflows, clipboard handling, profiles, and saved prompt systems

### B) Website / Web App
Primary role:
- Top-of-funnel acquisition engine
- Immediate browser demo for trust and conversion
- Search-discoverable education + prompt generation + upgrade path

## Desktop App Vision

### Core desktop jobs
- Paste raw prompt -> enhance -> copy in one action
- Choose target AI model/platform profile
- Save prompt templates, libraries, and recent history
- Run structured enhancement modes for coding, design, music, marketing, and business
- Offer one-click output formatting for ChatGPT, Claude, Gemini, Midjourney, etc.

### Desktop stack recommendation
- Electron + React + TypeScript for fastest cross-platform execution in your existing ecosystem
- Local encrypted storage for saved prompts and profiles
- Optional global shortcut / clipboard watcher behind explicit opt-in
- Shared core prompt engine in a reusable package consumed by both desktop and web

### Desktop feature milestones
1. v0.1
- Prompt input/output
- AI target selector
- Enhancement modes
- Copy/export
- Local history

2. v0.2
- Saved templates
- Persona presets
- Prompt scoring / confidence suggestions
- Batch prompt enhancement

3. v0.3
- Optional clipboard monitor
- Desktop quick-launch widget
- Team/export bundle features

## Website / Web App Vision

### Core web jobs
- Let users try SmartPromptIt in seconds without installing
- Rank for searchable pain-point content
- Convert traffic into downloads, email signups, and paid upgrades

### Website structure
1. Landing page
- Clear problem/solution statement
- Before/after prompt examples
- Strong CTA: Try in browser / Download desktop

2. Live demo page
- Textarea input
- Profile selector
- Enhanced output preview
- Copy button
- Download CTA / paid upgrade CTA

3. Use-case pages
- Prompting for coding
- Prompting for image generation
- Prompting for music and plugin ideas
- Prompting for business/marketing

4. Comparison pages
- SmartPromptIt vs generic prompt templates
- How to write better Claude prompts
- How to improve ChatGPT coding prompts

5. Pricing / download page
- Free vs Pro feature comparison
- Desktop app benefits
- FAQ and support info

## Shared Architecture

### Shared core package
Create one shared engine package for:
- AI profile definitions
- Prompt transformation rules
- output formatting templates
- content safety / legality rules
- scoring heuristics

### Suggested internal structure
- `packages/prompt-engine`
- `apps/smartpromptit-desktop`
- `apps/smartpromptit-web`
- `packages/profile-library`
- `packages/ui-tokens`

## Monetization Model

### Free
- Limited daily enhancements or limited advanced profiles
- Basic output modes
- Browser demo access

### Pro
- Unlimited enhancements
- Advanced profile packs
- Saved libraries and templates
- Export formats and batch modes
- Desktop quick actions

### Team later
- Shared template sets
- Brand/system style packs
- Admin/export tooling

## Technical Build Plan

### Phase 1 - Shared engine
- Define prompt profile schema
- Build transformation pipeline
- Add test suite for profile outputs
- Version profile library separately from UI

### Phase 2 - Desktop MVP
- Electron shell
- Main enhance view
- local storage/history
- profile selector
- copy/export actions

### Phase 3 - Web MVP
- Landing page
- live enhancer demo
- pricing/download pages
- email capture / analytics

### Phase 4 - Growth and conversion
- SEO content pages
- comparison pages
- creator demos
- affiliate / Gumroad / direct checkout routing

## Design Direction
Desktop and web should share the same core traits:
- premium but fast
- minimal but highly legible
- dark-neutral base with one electric accent
- zero clutter, zero gimmick noise
- confidence-building before/after presentation

## Immediate Next Steps
1. Extract SmartPromptIt into its own app folder and define shared package structure.
2. Build the prompt-engine package first so desktop and web stay aligned.
3. Create the desktop MVP before the full website because the executable is the higher-value product.
4. Ship the website demo in parallel as acquisition and trust layer.
