# Time Stretch X - Build Instructions

A premium dual-knob time-stretching VST3/AU/Standalone plugin from the NoDAW Studio Suite.

## Features

- **Three Time-Stretch Algorithms**
  - Phase Vocoder (FFT-based, best for music)
  - Granular Synthesis (creative/experimental)
  - WSOLA (low latency, best for speech)

- **Dual-Knob Interface**
  - Time Stretch: 0.25x to 4x
  - Pitch Shift: -24 to +24 semitones
  - Key Lock: Preserve pitch while time-stretching
  - Link Mode: Lock time and pitch together

- **Premium UI**
  - Animated hourglass-to-X logo
  - Waveform display with playhead
  - Bold cyan/copper visual system
  - 60fps smooth animations

- **Release-Ready Tooling**
  - Native Windows EXE installer generation
  - Native macOS PKG installer generation
  - Quality score gate with >90 acceptance threshold

## Requirements

- **JUCE Framework**: 8.0 or later
- **CMake**: 3.22 or later
- **C++ Compiler**: 
  - Windows: Visual Studio 2022 (MSVC 19.30+)
  - macOS: Xcode 14+ / Apple Clang 14+
- **Operating System**:
  - Windows 10/11 (64-bit)
  - macOS 11+ (Big Sur and later)

## Building

### 1. Install JUCE

Download JUCE from https://juce.com/get-juce and install it.
Set the `JUCE_DIR` environment variable or edit CMakeLists.txt with the correct path.

```powershell
# Windows PowerShell
$env:JUCE_DIR = "C:\JUCE"
```

```bash
# macOS/Linux
export JUCE_DIR="/path/to/JUCE"
```

### 2. Configure with CMake

```powershell
cd TimeStretchX

# Create build directory
mkdir build
cd build

# Configure (Windows)
cmake -G "Visual Studio 17 2022" -A x64 ..

# Configure (macOS)
cmake -G "Xcode" ..
```

### 3. Build

```powershell
# Windows (Release build)
cmake --build . --config Release

# macOS
cmake --build . --config Release
```

### 4. Output Locations

After building, the plugins will be in:

```
build/TimeStretchX_artefacts/Release/
├── Standalone/
│   └── TimeStretchX.exe (or .app on macOS)
├── VST3/
│   └── TimeStretchX.vst3
└── AU/ (macOS only)
    └── TimeStretchX.component
```

## Installing the Plugin

Detailed installer workflows are documented in:

- `docs/INSTALL_WINDOWS.md`
- `docs/INSTALL_MACOS.md`
- `docs/RELEASE_GUIDE.md`
- `docs/QUALITY_SCORECARD.md`

### VST3 (Windows)
Copy `TimeStretchX.vst3` to:
```
C:\Program Files\Common Files\VST3\
```

### VST3 (macOS)
Copy `TimeStretchX.vst3` to:
```
/Library/Audio/Plug-Ins/VST3/
```

### AU (macOS)
Copy `TimeStretchX.component` to:
```
/Library/Audio/Plug-Ins/Components/
```

## Development

### Project Structure

```
TimeStretchX/
├── CMakeLists.txt           # Build configuration
├── Source/
│   ├── PluginProcessor.h/cpp    # Audio processor
│   ├── PluginEditor.h/cpp       # Main UI
│   ├── DSP/
│   │   └── TimeStretchEngine.h/cpp  # DSP algorithms
│   ├── State/
│   │   └── ParameterLayout.h    # Parameter definitions
│   └── UI/
│       ├── LookAndFeel/
│       │   ├── NoDAWLookAndFeel.h/cpp
│       │   └── Colours.h
│       └── Components/
│           ├── DualKnob.h/cpp
│           ├── AnimatedIcon.h/cpp
│           ├── WaveformDisplay.h/cpp
│           ├── AlgorithmSelector.h/cpp
│           └── PresetBrowser.h/cpp
└── Resources/
    ├── Fonts/
    └── Images/
```

### Adding Resources (Fonts, Images)

1. Place font files (.ttf, .otf) in `Resources/Fonts/`
2. Place images (.png, .svg) in `Resources/Images/`
3. They will be embedded via JUCE's BinaryData system

## Usage

### Standalone Mode

1. Launch `TimeStretchX.exe` (or `.app`)
2. Click "LOAD AUDIO" to import a file (WAV, MP3, FLAC, AIFF, OGG)
3. Adjust Time Stretch and Pitch Shift knobs
4. Click "PLAY" to preview

### Plugin Mode (DAW)

1. Insert Time Stretch X on a track
2. The plugin automatically receives audio from the DAW track input. No manual file loading is required in VST3/AU mode.
3. Adjust parameters via knobs or automation
4. Use the standalone build only when you want to audition imported files outside a DAW

## DAW Compatibility Notes

- Time Stretch X is designed to operate as an insert effect in major DAWs through normal track input routing.
- The VST3 build is intended for hosts such as FL Studio, Ableton Live, Reaper, Cubase, and Studio One.
- In plugin mode, transport and file-loading controls are intentionally hidden because the host owns playback and audio routing.

## Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Time Stretch | 0.25x - 4.0x | 1.0x | Speed/duration ratio |
| Pitch Shift | -24 st - +24 st | 0 st | Pitch transposition |
| Formant Shift | -12 st - +12 st | 0 st | Formant preservation offset |
| Mix | 0% - 100% | 100% | Dry/wet blend |
| Output Gain | -24 dB - +12 dB | 0 dB | Output level |
| Quality | 1 - 5 | 3 | Processing quality (CPU vs. quality) |
| Algorithm | PV/Granular/WSOLA | Phase Vocoder | Time-stretch method |
| Key Lock | On/Off | On | Preserve pitch during time stretch |
| Linked | On/Off | Off | Link time stretch and pitch |

## Troubleshooting

### Build Errors

**"JUCE not found"**
- Ensure JUCE is installed and `JUCE_DIR` is set correctly

**"CMake version too old"**
- Update CMake to 3.22 or later

**"Compiler not found"**
- Install Visual Studio 2022 (Windows) or Xcode 14+ (macOS)

### Runtime Issues

**Plugin doesn't appear in DAW**
- Ensure VST3 is in the correct system folder
- Rescan plugins in your DAW

**Audio glitches**
- Lower the Quality setting
- Increase buffer size in DAW/audio settings

## Release Commands

```powershell
./release.ps1 -Version 1.0.0
```

```bash
./release.sh --version 1.0.0
```

## Quality Gate

```powershell
./scripts/score_release_readiness.ps1 -BuildDir ./build -DistDir ./dist
```

The release gate requires a total score above 90.

## License

Copyright (c) 2026 NoDAW Studio. All rights reserved.

This software is proprietary. See LICENSE file for details.

---

*Time Stretch X - Part of the NoDAW Studio Suite*
