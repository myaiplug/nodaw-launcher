# TimeStretchX DAW Validation Matrix

This document defines the release gate for "modern DAW compatibility".

## Build Under Test

- Plugin: Time Stretch X (VST3, x86_64-win)
- Build type: Release
- Artifact path: `build/TimeStretchX_artefacts/Release/VST3/Time Stretch X.vst3`

## Critical Test Dimensions

1. Discovery and scan

   - DAW discovers plugin without blacklist/crash
   - Plugin metadata (name/vendor/version) appears correctly

1. Instantiate and playback

   - Instantiate on audio track succeeds
   - Real-time playback has no crash and no stuck processing
   - Bypass toggles correctly and resumes processing

1. Parameter automation

   - Host automation writes and reads all exposed parameters
   - GUI control moves reflect host automation changes
   - No parameter jump/desync after save/reload

1. State persistence

   - Save project with non-default settings
   - Reopen project and verify all parameter/state restoration
   - Preset/state chunk restores without corruption

1. Transport and timing behavior

   - Start/stop/seek does not destabilize processing
   - No obvious timing drift when changing tempo

1. Visual and UX behavior

   - UI opens/closes without flicker or freeze
   - Output meter updates during signal playback
   - Waveform and playhead behavior are stable in standalone workflow

1. Performance and stability

   - No CPU runaway on idle
   - No denorm-related spikes with silence input
   - No crash after repeated open/close and track duplication

## Suggested DAW Matrix (Windows)

- REAPER (latest stable)
- Ableton Live (latest stable)
- FL Studio (latest stable)
- Cubase (latest stable)
- Studio One (latest stable)
- Bitwig Studio (latest stable)

For each DAW, run the 7 dimensions above and mark Pass/Fail with notes.

## Pass Criteria

Release candidate is accepted when:

- All DAWs pass discovery and instantiate tests.
- No crash in a 20-minute mixed interaction session per DAW.
- Automation/state persistence passes in at least 5/6 DAWs.
- Any remaining issue has a documented workaround and severity <= medium.

## Current Engineering Status

- Release VST3 build completed successfully on this branch.
- Parameter attachment consistency has been fixed using canonical parameter IDs.
- Algorithm selection is APVTS-attached for host/UI synchronization.
- Standalone waveform synchronization behavior was improved.
- Live stereo output metering was added to editor UX.

## Remaining Work To Claim "All Modern DAWs"

Manual host verification is still required. This file is the execution checklist to close that gap.
