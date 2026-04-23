# Clip-IT macOS Installation

## Supported Targets
- macOS 12+
- VST3 hosts (Logic via wrappers/host, Ableton, Reaper, Cubase, Studio One, etc.)

## Build and Package (Developer)

Generate a distributable mac package (`Clip-IT-vX.Y.Z-mac.zip`):

```bash
chmod +x ./installers/macos/ship_vst3_macos.sh
./installers/macos/ship_vst3_macos.sh --version 1.0.0
```

Optional signing variants:

```bash
./installers/macos/ship_vst3_macos.sh --version 1.0.0 --codesign-identity "Developer ID Application: Your Name (TEAMID)"
./installers/macos/ship_vst3_macos.sh --version 1.0.0 --adhoc-sign
```

## Recommended Method
Run the native pkg installer:

```bash
open ./dist/Clip-IT-Installer-macOS-v1.0.0.pkg
```

Alternative (script installer):

```bash
chmod +x ./installers/macos/install_clipit.sh
./installers/macos/install_clipit.sh --source ./dist/Clip-IT-v1.0.0-mac.zip --system
```

Use --user to install only for current account.

## What It Does
1. Validates source artifact (zip or .vst3 bundle).
2. Installs to one of:
   - System: /Library/Audio/Plug-Ins/VST3/Clip-IT.vst3
   - User:   ~/Library/Audio/Plug-Ins/VST3/Clip-IT.vst3
3. Clears quarantine attribute on installed bundle.
4. Optionally ad-hoc signs bundle if requested.

## Example Commands
System install:
```bash
./installers/macos/install_clipit.sh --source ./dist/Clip-IT-v1.0.0-mac.zip --system
```

User install:
```bash
./installers/macos/install_clipit.sh --source ./dist/Clip-IT-v1.0.0-mac.zip --user
```

## Uninstall
```bash
rm -rf /Library/Audio/Plug-Ins/VST3/Clip-IT.vst3
# or user path
rm -rf ~/Library/Audio/Plug-Ins/VST3/Clip-IT.vst3
```

## DAW Rescan
Rescan plugins in your DAW after installation.

## Troubleshooting
- If system install fails, rerun with sudo or use --user.
- If blocked by Gatekeeper in unsigned workflows, verify quarantine was removed.
- If plugin is x86_64-only, some Apple Silicon native-only hosts may require Rosetta workflow.
