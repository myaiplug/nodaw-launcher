# NoDAW VST Monetization Ranking (Project Rescan)
Date: 2026-04-15

This report rescans current project docs and implementation signals to rank all identified VST ideas and VST-adjacent implementations by probability of generating real income.

## Method Used
Scoring is based on:
1. Market demand strength (problem severity + buyer urgency)
2. Current implementation readiness in this project
3. Differentiation potential vs competitors
4. Time-to-ship viability
5. Gumroad conversion fit (clarity + demoability)

Confidence note:
These are forecast probabilities, not guarantees. Numbers are directional planning estimates for prioritization.

## Rescan Inventory (VST Ideas + Implementations Found)
1. NoDAW Clip-IT / NoDAW Clipper (planned, strategy fully defined)
2. TimeStretchX VST3 plugin (implemented and build artifact exists)
3. PluginBridge / VST_LINK (prototype concept for loading VST3/AU in NoDAW)
4. NoDAW Limiter (named cross-sell idea)
5. NoDAW Saturator (named cross-sell idea)
6. AudioRepair as future plugin candidate (beta secret tool, VST path possible)

---

## Ranked Monetization Probability Table

| Rank | Product / Idea | Current State | Price Point (USD) | Prob. of Real Income (12 mo) | Est. Monthly Gross After Launch | 12-mo Expected Gross (EV) |
|---|---|---|---:|---:|---:|---:|
| 1 | NoDAW Clip-IT (Clipper VST3) | Planned but highly specified | 39-69 | 68% | 1,500-7,000 | 18,000-84,000 (EV midpoint ~34,680) |
| 2 | TimeStretchX VST3 | Built artifact, alpha polish pending | 49-99 | 57% | 900-5,500 | 10,800-66,000 (EV midpoint ~21,546) |
| 3 | AudioRepair (as VST SKU) | Beta secret tool, not pluginized | 39-79 | 45% | 700-4,000 | 8,400-48,000 (EV midpoint ~12,852) |
| 4 | NoDAW Saturator (future VST3) | Idea stage | 29-59 | 41% | 500-3,000 | 6,000-36,000 (EV midpoint ~8,610) |
| 5 | NoDAW Limiter (future VST3) | Idea stage | 39-79 | 38% | 450-2,700 | 5,400-32,400 (EV midpoint ~7,182) |
| 6 | Sonic Clipper in FXit (module) | UI/workflow present, DSP not proven | Bundled / +9-19 upsell | 33% | 250-1,200 incremental | 3,000-14,400 (EV midpoint ~2,871) |
| 7 | PluginBridge (VST host feature) | Prototype concept only | Pro+ feature, not standalone | 22% | 150-900 incremental | 1,800-10,800 (EV midpoint ~1,399) |

---

## Why This Ranking

### 1) NoDAW Clip-IT (Highest probability)
- Clipper demand is high, clear, and easy to demo quickly.
- Strategy already includes strong differentiation (metering clarity, ADAA, oversampling narrative, preset depth).
- Fits Gumroad behavior: simple concept + immediate before/after value.

### 2) TimeStretchX
- Strong implementation progress and existing VST3 output reduces execution risk.
- Conversion depends on stability + host compatibility + clear demos.
- Crowded category, but premium UI and workflow can still carve niche.

### 3) AudioRepair as plugin
- Practical problem and broad audience.
- Current secret-tool beta status suggests technical base exists.
- Could monetize well with straightforward result demos.

### 4-5) Saturator / Limiter
- Good cross-sell potential, but both are crowded markets.
- Need unique UX or workflow angle to avoid commodity positioning.

### 6) Sonic Clipper module in FXit
- Valuable for bundle upgrades, but weaker as direct standalone monetization.
- Best used as conversion bridge to Clip-IT full plugin.

### 7) PluginBridge
- Powerful but risky and support-heavy (host/plugin compatibility matrix complexity).
- Better as premium ecosystem lock-in feature, not primary revenue engine.

---

## Revenue Model Assumptions (Used for Estimates)
- Solo founder/boutique plugin business through Gumroad + socials.
- Conversion lift comes from:
  - concise product explanation
  - visual proof clips
  - short before/after audio demos
  - clean positioning and preset usefulness
- Income estimates assume regular release updates and active launch content.

## Evidence Map (Rescan Anchors)
- Clip-IT strategy and VST3 requirements: NoDAW_Clipper_2026_Gumroad_Strategy_and_Product_Plan.md
- TimeStretchX plugin code/build project: TimeStretchX/README.md, TimeStretchX/CMakeLists.txt, TimeStretchX/Source/
- Secret VST host concept (PluginBridge): components/launcher/secretToolsStore.ts
- Sonic Clipper effect module in suite workflows: constants.tsx, components/launcher/panels/FXitPanel.tsx
- Suite roadmap and implementation state percentages: NODAW_MASTER_BLUEPRINT_2026-04-05.md, NODAW_IMPLEMENTATION_GUIDE_2026-04-05.md, PHASE_ASSESSMENT_2026-04-14.md

---

## Recommended Monetization Order (Execution)
1. Ship Clip-IT v1 as flagship revenue driver.
2. Stabilize and host-certify TimeStretchX, then launch as second flagship.
3. Productize AudioRepair as third paid utility.
4. Build Saturator and Limiter only after first two flagship SKUs validate funnel.
5. Keep PluginBridge as Pro+ differentiator, not core revenue bet.

---

## Risk Controls to Protect Revenue
1. Do not launch without host compatibility verification matrix.
2. Do not launch without at least 5 genre-based before/after demos.
3. Keep pricing simple at launch (one-time + optional bundle), avoid complex tiers initially.
4. Enforce strict crash/stability triage in first 30 days post-launch.
5. Treat presets and onboarding as conversion assets, not afterthoughts.

---

## Monetization KPI Targets (First 90 Days Per Flagship VST)
- Product page conversion: 1.5% to 4.0%
- Refund rate: under 6%
- Median support response: under 24h
- Demo-to-purchase uplift after media updates: +20% relative target
- Update cadence: at least 2 meaningful updates in first 90 days
