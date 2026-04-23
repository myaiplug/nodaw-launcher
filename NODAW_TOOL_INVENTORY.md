# NoDAW Launcher Tool Inventory

Generated from source-of-truth registries in components/launcher/tools.ts and components/launcher/secretToolsStore.ts.

## Displayed Tools (Launcher Grid)

| ID | Name | Tier | Status | Current Implementation Reality | Completion Estimate |
|---|---|---|---|---|---|
| split-it | SplitIt | pro | ready | Integrated launcher panel with diagnostics and external app launch path for StemSplit | 75% |
| screw-it | ScrewIt | pro | ready | Integrated launcher panel for launching ScrewAI app, with usage gating and preset UX | 70% |
| trim-it | TrimIt | free | ready | Functional in-browser waveform trim/edit/export workflow | 85% |
| convert-it | ConvertIt | free | ready | Functional conversion UI, but non-WAV outputs currently fall back to WAV without true encoder path | 65% |
| fx-it | FXit | pro | ready | Large feature-rich panel and realtime controls in launcher context | 80% |
| test-it | TestIt | free | ready | Present as dedicated panel in launcher | 70% |
| icon-it | IconIt | pro | ready | Present as dedicated panel in launcher | 75% |
| time-stretch-x | HalfScrew | pro | ready | Wired into native TimeStretchX tool panel and recent native graph hardening work | 88% |
| meta-mane | MetaMane | pro | beta | Newly integrated as visible launcher tool with working metadata sidecar editor/export panel | 55% |
| workstation | NoDAW Workstation | pro_plus | beta | Explicit placeholder panel (in-development, no full DAW implementation yet) | 30% |

## Hidden/Secret Tools (Secret Labs Menu)

| ID (Registry) | Name | Tier | Status | Category | Current Implementation Reality                                               | Completion Estimate |
|---|---|---|---|---|---|---|
| smart-prompt | SmartPromptIt | secret | alpha | ai | Tool exists in secret registry, menu logic checks smart-prompt-it (ID mismatch risk) | 40% |
| stem-iso | Stem Surgeon | pro_plus | prototype | audio | Listed as prototype concept, no fully wired production panel found | 20% |
| time-stretch-x | HalfScrew | pro_plus | alpha | audio | Secret and visible pathways overlap; actual engine is strongest in project | 88% |
| vocal-cloneit | VocalClone | pro_plus | prototype | ai | Listed prototype concept; no production-ready panel integration found | 15% |
| audio-fixit | AudioRepair | pro | beta | audio | Registry exists, but current menu launch condition checks audio-repair (ID mismatch risk) | 55% |
| DevDash | DevConsole | secret | ready | developer | Registry exists, but current menu launch condition checks dev-console (ID mismatch risk) | 65% |
| plugin-link | PluginBridge | pro_plus | prototype | experimental | Prototype listing only; no mature host implementation surfaced | 25% |
| midi-gen | MIDIGenIt | pro | alpha | ai | Alpha listing, no mature production panel found | 25% |

## Critical Wiring Gaps Detected

Secret tool ID mismatches were identified and fixed in this pass by aligning registry IDs to active launch/install checks:

1. SmartPromptIt: smart-prompt-it
2. AudioRepair: audio-repair
3. DevConsole: dev-console

## MetaMane Status

MetaMane is now integrated as a visible launcher tool and wired to a working panel that creates and exports metadata sidecar files.

## Recommended Next Moves (Execution Order)

1. Fix secret-tool ID mismatches first (fast, high impact).
2. Promote AudioRepair from secret beta to first-class visible tool once stable.
3. Expand MetaMane from sidecar export to direct embedded tag-writing workflow (ID3/FLAC/Vorbis support).
4. Re-audit all tool IDs and route wiring after MetaMane integration.
