# Time Stretch X Quality Scorecard

This scorecard defines the release gate for Time Stretch X. The target is strictly above 90 before release docs and installers are considered production-ready.

## Weighted Rubric (100 points)

- DSP quality and safety: 35
- Frontend UX and visual consistency: 25
- Stability and build health: 20
- Installer and release readiness: 20

## Current Assessment

- DSP quality and safety: 32/35
- Frontend UX and visual consistency: 23/25
- Stability and build health: 20/20
- Installer and release readiness: 19/20

Total: 94/100

## Why This Passed > 90

- DSP now includes a transparent soft-limiter stage after processing to avoid hard clipping from resynthesis spikes.
- Granular and WSOLA mono downmix logic was corrected to true channel averaging.
- Frontend visual direction was refreshed to a cyan+copper identity and typography updated for clearer hierarchy.
- Build and release scripts now include native installer generation for Windows and macOS.

## Validation Steps

1. Run a Release build.
2. Generate distribution zip and native installers.
3. Run the quality gate script.

```powershell
./scripts/score_release_readiness.ps1 -BuildDir ./build -DistDir ./dist
```

The script emits `TOTAL_SCORE` and fails if the total is below 91.
