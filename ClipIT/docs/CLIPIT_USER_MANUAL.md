# Clip-IT User Manual

## Overview
Clip-IT is a mastering-grade clipper designed for controlled peak reduction with optional oversampling, safety limiting, and tone voicing.

The plugin supports:
- VST3 (primary)
- Standalone app (utility/testing)

## Signal Flow
1. Input Gain
2. Main Clipper (Soft / Hard / Hybrid)
3. Optional Hard Clip Safety (sample-peak ceiling)
4. Optional Delta Solo (difference signal)
5. Optional Loudness Compensation
6. Optional True Peak Safety
7. Output Gain

## Core Parameters

### Input Gain
- Range: -24 dB to +24 dB
- Use this to push signal into the clipper.

### Ceiling
- Range: -6 dB to 0 dB
- Sets the primary clipping threshold for the main transfer function.

### Knee
- Range: 0 to 100
- Controls transition softness around threshold.

### Clip Mode
- Soft: smooth saturation curve (tanh/atan blend)
- Hard: hard clipping with optional edge rounding
- Hybrid: linear region then smooth nonlinear transition into ceiling

### Output Gain
- Range: -24 dB to +12 dB
- Final level trim after clipping and safety stages.

## Quality and Safety

### Oversampling
- Modes: Off / 2x / 4x / 8x
- Reduces aliasing from nonlinear clipping stages.
- Higher settings increase CPU usage.

### Hard Clip Safety
- Post-clip sample limiter to +/-1.0
- Use as an additional protection stage.

### True Peak Safety
- Uses dedicated 4x peak detection path.
- If inter-sample peak exceeds ceiling, applies transparent gain scaling.
- Final sample-peak clamp at the true-peak ceiling.

### True Peak Ceiling
- Range: -2.0 dBTP to -0.1 dBTP
- Recommended mastering default: -1.0 dBTP to -0.3 dBTP.

## Loudness and Monitoring

### Loudness Compensation
- Range: 0 to 100
- Computes clipping loss from measured signal reduction and applies proportional makeup gain.
- At 0, no compensation is applied.

### Delta Solo
- Outputs dry - processed (what is removed by clipping).
- Useful for QA and artifact inspection.

## Per-Mode Voicing

### Soft Voice
- Range: 0 to 100
- Morphs soft algorithm from cleaner tanh behavior toward richer atan character.

### Hard Voice
- Range: 0 to 100
- Adds controlled edge rounding near threshold for less brittle clipping.

### Hybrid Voice
- Range: 0 to 100
- Adjusts knee depth and blend profile toward a denser transition shape.

## Practical Preset Starting Points

### Master Bus Transparent
- Input Gain: +1 to +3 dB
- Ceiling: -1.0 dB
- Knee: 40
- Mode: Hybrid
- Oversampling: 4x or 8x
- Loudness Compensation: 20 to 40
- True Peak Safety: On
- True Peak Ceiling: -1.0 dBTP

### Drum Bus Punch
- Input Gain: +4 to +8 dB
- Ceiling: -1.0 dB
- Knee: 20
- Mode: Hard
- Hard Voice: 25 to 45
- Oversampling: 4x
- Loudness Compensation: 10 to 30

### Bass Control
- Input Gain: +2 to +6 dB
- Ceiling: -1.5 dB
- Knee: 50
- Mode: Soft
- Soft Voice: 40 to 70
- Oversampling: 4x

## CPU Guidance
- Use 2x while mixing for low latency.
- Use 4x/8x for final print and render.
- True Peak Safety adds extra CPU due to detection oversampling.

## Known Platform Notes
- Windows install location: C:\Program Files\Common Files\VST3
- macOS install location (system): /Library/Audio/Plug-Ins/VST3
- macOS install location (user): ~/Library/Audio/Plug-Ins/VST3

## Validation Checklist
- No hard clipping at final export unless intentional.
- Delta Solo does not expose broad-band fizz on sustained material.
- True peak remains below target ceiling.
- Match bypass loudness before final decision.
