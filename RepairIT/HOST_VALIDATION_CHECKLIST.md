# Repair-IT Host Validation Checklist

Date: 2026-04-15
Build Under Test: Release VST3 (`Repair-IT.vst3`)

## Scope

This checklist validates the v0.3 shipping slice:
- Active restoration DSP chain (denoise, de-click, de-hum)
- Wet/dry mix behavior
- A/B monitor workflow from editor
- Preset voicing actions

## Host Matrix

| Host | Version | Status | Notes |
|---|---|---|---|
| Reaper | TBD | Pending | |
| FL Studio | TBD | Pending | |
| Ableton Live | TBD | Pending | |
| Cubase | TBD | Pending | |
| Studio One | TBD | Pending | |

## Core Validation Steps

1. Plugin load/unload
- Insert plugin on stereo track.
- Confirm no crash on open/close and project save/load.

2. Parameter automation
- Automate Denoise, DeClick, DeHum, Mix.
- Confirm smooth response and no zipper artifacts at moderate automation rates.

3. A/B monitor behavior
- Click `A/B: Monitor Dry` and confirm output becomes dry source.
- Click `Return To Processed` and confirm prior mix state is restored.

4. Preset voicing behavior
- Trigger each preset button.
- Confirm all four parameters update instantly and audibly.
- Verify no out-of-range values and no host automation corruption.

5. Latency and crackle sanity
- Test at 64/128/256/512 buffers.
- Confirm no unexpected crackles under normal CPU load.

6. Recall and state
- Save project with non-default settings and reload.
- Confirm parameter/state recall matches saved session.

## Pass/Fail Gate

Pass requires:
- No host crashes
- No denormal/NaN bursts
- Stable parameter recall
- A/B monitor and preset buttons functioning in all tested hosts

## Notes

- Compile validation for `RepairIT_VST3` succeeded on 2026-04-15.
- Host matrix still requires manual DAW validation on target systems.
