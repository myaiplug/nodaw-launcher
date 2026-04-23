# Time Stretch X Installation (macOS)

## Preferred: Native PKG Installer

1. Download `TimeStretchX-vX.Y.Z-macOS.pkg`.
2. Open the package and follow the installer prompts.
3. The installer places:
   - VST3 in `/Library/Audio/Plug-Ins/VST3/`
   - AU in `/Library/Audio/Plug-Ins/Components/` when available
4. Rescan plugins in your DAW.

## Script-based Installation

```bash
./installers/macos/install_timestretchx.sh "./dist/TimeStretchX-v1.0.0-macos/Time Stretch X.vst3"
```

## Uninstall

```bash
./installers/macos/uninstall_timestretchx.sh
```

## Notes

- Gatekeeper may require approval if the build is unsigned.
- Use a signed PKG for public distribution.
