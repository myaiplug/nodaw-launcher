# VST Execution Sequence (Locked)
Date: 2026-04-15

Build order locked by request:
1. TimeStretchX (finish first)
2. Repair-IT (second)
3. Clip-IT (third, applying Sonic Clipper ideas)

## Track 1 - TimeStretchX Finish

### Definition of done
- Stable VST3 builds without admin-dependent post-copy failures
- No compile errors
- Host smoke tests pass in at least 3 DAWs
- Plugin launch docs match actual toolchain requirements

### Immediate tasks
- [x] Disable copy-after-build by default in CMake to prevent permission failures
- [x] Rebuild and verify fresh VST3 artifact
- [x] Align README JUCE requirement with JUCE 8
- [ ] Replace deprecated JUCE font constructors with FontOptions variants throughout
- [ ] Remove or intentionally mark unreferenced parameter warnings
- [ ] Add host test matrix log document

## Track 2 - Repair-IT Build

### v0.1 scaffold (now created)
- [x] JUCE plugin project structure
- [x] APVTS parameter layout (Denoise, DeClick, DeHum, Mix)
- [x] Processor/editor baseline

### next build steps
- [ ] Configure and compile Repair-IT VST3 target
- [ ] Build first denoise stage (spectral gate baseline)
- [ ] Build click detector + removal pass
- [ ] Build hum notch stage + harmonics mode
- [ ] Add restoration meter panel and A/B switch

## Track 3 - Clip-IT Build (Sonic Clipper -> Clip-IT)

### Sonic Clipper concepts migrated into Clip-IT
- Input/Output gain control path
- Ceiling + Soft Knee shaping
- Clip mode selector
- Oversampling selector
- Hard clip safety
- Delta solo (clipped-only monitoring)
- FIR remainder control placeholder

### v0.1 scaffold (now created)
- [x] JUCE plugin project structure
- [x] APVTS parameter architecture with migrated concepts
- [x] Processor/editor baseline

### next build steps
- [ ] Configure and compile Clip-IT VST3 target
- [ ] Implement core clipping transfer function
- [ ] Implement oversampling + anti-aliasing signal path
- [ ] Implement meter suite (input/output/peak hold/GR trace)
- [ ] Implement transfer curve renderer + knee visualization
- [ ] Add preset system and first category packs

## Execution rule
No new plugin track starts until the current track's critical definition-of-done items are complete.
