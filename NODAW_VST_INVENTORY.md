# NoDAW VST Inventory and Readiness

Generated from JUCE CMake targets and project READMEs.

## VST Targets Found in This Repository

| Product | JUCE Target | Formats | Evidence | Build/Readiness Snapshot |
|---|---|---|---|---|
| TimeStretchX | TimeStretchX | VST3, Standalone | TimeStretchX/CMakeLists.txt | Most mature native plugin in this repo; graph runtime recently migrated/hardened |
| RepairIT | RepairIT | VST3, Standalone | RepairIT/CMakeLists.txt | Early scaffold/pass-through baseline; restoration DSP milestones still pending |
| ClipIT | ClipIT | VST3, Standalone | ClipIT/CMakeLists.txt | Early scaffold/pass-through baseline; core clipping DSP chain still pending |

## Non-VST App Tracks Relevant to Your Request

| Product | Current Form | VST Status in Repo | Notes |
|---|---|---|---|
| ScrewAI | Electron/Vite app | Not currently a JUCE VST target | Requires dedicated native plugin project to become VST3 |
| StemSplit | Next.js + Tauri + Python stack | Not currently a JUCE VST target | Large ML pipeline app; can be bridged to plugin but significant architecture work |

## Difficulty Ratings (1-10)

| Goal | Difficulty | Why |
|---|---|---|
| Finish AudioRepair as shipping VST3 | 7/10 | DSP chain and restoration quality tuning are substantial but straightforward within JUCE plugin architecture |
| Ship ScrewAI as VST3 | 8/10 | Needs product translation from Electron app to real-time-safe plugin DSP/UI runtime |
| Build StemSplit as VST3 | 9/10 | Heavy ML separation stack, model runtime packaging, latency/CPU constraints, host compatibility, licensing and UX complexity |
| Add YouTube split workflow to StemSplit product line | 4/10 in app form, 8/10 in VST form | App path already has docs and implementation track; VST-embedded online import is much harder and policy-sensitive |

## StemSplit + YouTube Split Status

StemSplit docs indicate major YouTube downloader expansion work already planned/implemented in the app track. This is strong for standalone workflow but not yet represented as a VST plugin target.

## Practical Path to Deliver What You Asked

1. Complete RepairIT first as the second mature VST3 after TimeStretchX.
2. Convert ScrewAI into a JUCE VST3 project (new native target), not an Electron wrapper.
3. Keep StemSplit as standalone desktop first, then build PluginBridge-style VST companion that calls external separator service.
4. Only after that, evaluate fully embedded StemSplit VST (highest risk and support burden).
