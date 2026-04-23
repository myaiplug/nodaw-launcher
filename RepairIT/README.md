# Repair-IT (VST3/AU/Standalone)

Repair-IT is NoDAW's restoration plugin focused on practical cleanup for noisy recordings.

## Current Shipping Slice (v0.3.1)

- Active restoration chain:
  - Adaptive denoise
  - De-click/de-crackle smoothing
  - Multi-notch de-hum
  - Wet/dry mix path
- A/B monitor workflow in editor
- Voiced quick presets (Podcast, Vinyl Restore, Field Cleanup, Vocal Rescue)
- CMake/JUCE build with VST3 + Standalone outputs

## Requirements

- JUCE 8+
- CMake 3.22+
- Visual Studio 2022 (Windows, x64)

## Build (Windows)

From `RepairIT/`:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release --target RepairIT_VST3
```

## Build Outputs

Release VST3 bundle location:

```text
build/RepairIT_artefacts/Release/VST3/Repair-IT.vst3
```

Inner binary (Windows):

```text
build/RepairIT_artefacts/Release/VST3/Repair-IT.vst3/Contents/x86_64-win/Repair-IT.vst3
```

## Ship VST3 (One Command)

Use the included packaging script:

```powershell
./ship_vst3.ps1
```

This will:

1. Build `RepairIT_VST3` in Release
2. Stage distributables under `dist/Repair-IT-v0.3.1-win64/`
3. Produce `dist/Repair-IT-v0.3.1-win64.zip`
4. Produce checksum files: `dist/Repair-IT-v0.3.1-win64.sha256.txt` and `dist/Repair-IT-v0.3.1-win64.hashes.json`

Optional install to system VST3 folder:

```powershell
./ship_vst3.ps1 -InstallToSystem
```

Optional Authenticode signing (requires cert in local cert store):

```powershell
./ship_vst3.ps1 -Sign -CertThumbprint "<YOUR_CERT_THUMBPRINT>"
```

Optional signing with explicit SignTool path:

```powershell
./ship_vst3.ps1 -Sign -CertThumbprint "<YOUR_CERT_THUMBPRINT>" -SignToolPath "C:/Program Files (x86)/Windows Kits/10/bin/10.0.26100.0/x64/signtool.exe"
```

Optional zip signing in addition to VST3 binary signing:

```powershell
./ship_vst3.ps1 -Sign -CertThumbprint "<YOUR_CERT_THUMBPRINT>" -SignZip
```

## Install Manually (Windows)

Copy `Repair-IT.vst3` to:

```text
C:/Program Files/Common Files/VST3/
```

## Validation

Use the host validation matrix in `HOST_VALIDATION_CHECKLIST.md` before external release.
