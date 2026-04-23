# Clip-IT Release Guide

## Goal
Produce signed (or ad-hoc) distributable artifacts plus installer bundles.

## Output Artifacts
All outputs are generated in `dist/`.

Windows:
- Clip-IT-vX.Y.Z-win64.zip
- Clip-IT-vX.Y.Z-win64.sha256.txt
- Clip-IT-vX.Y.Z-win64.hashes.json
- Clip-IT-Installer-Windows-vX.Y.Z.zip
- Clip-IT-Setup-vX.Y.Z.exe (native installer; generated when Inno Setup is installed)

macOS:
- Clip-IT-vX.Y.Z-mac.zip
- Clip-IT-vX.Y.Z-mac.sha256.txt
- Clip-IT-vX.Y.Z-mac.hashes.json
- Clip-IT-Installer-macOS-vX.Y.Z.zip
- Clip-IT-Installer-macOS-vX.Y.Z.pkg (native installer)

## One-Command Orchestrators

### Windows
Run from project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\release.ps1 -Version 1.0.0
```

Skip native installer creation:

```powershell
powershell -ExecutionPolicy Bypass -File .\release.ps1 -Version 1.0.0 -SkipNativeInstaller
```

With signing:

```powershell
powershell -ExecutionPolicy Bypass -File .\release.ps1 -Version 1.0.0 -Sign -CertThumbprint "<THUMBPRINT>" -SignZip
```

### macOS
Run from project root:

```bash
chmod +x ./release.sh
./release.sh --version 1.0.0
```

Generate signed `.pkg` installer:

```bash
./release.sh --version 1.0.0 --pkg-sign-identity "Developer ID Installer: Your Name (TEAMID)"
```

With Developer ID signing:

```bash
./release.sh --version 1.0.0 --codesign-identity "Developer ID Application: Your Name (TEAMID)"
```

With ad-hoc signing:

```bash
./release.sh --version 1.0.0 --adhoc-sign
```

## GitHub Actions Release Automation

Workflow path:
- `.github/workflows/release.yml`

Trigger modes:
1. Tag push: `vX.Y.Z` (recommended for production)
2. Manual dispatch: provide `version` (example `1.0.0`) and set `create_release`

Tag release flow:
```bash
git tag v1.0.0
git push origin v1.0.0
```

What CI does:
1. Configures CMake on Windows and macOS runners.
2. Runs `release.ps1` and `release.sh`.
3. Uploads all `dist/` artifacts from both operating systems.
4. Creates or updates a GitHub Release and attaches generated artifacts.

## Installer Execution (Customer Side)

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\install_clipit.ps1 -SourcePath .\Clip-IT-v1.0.0-win64.zip -InstallVcRedist
```

macOS system install:

```bash
./install_clipit.sh --source ./Clip-IT-v1.0.0-mac.zip --system
```

macOS user install:

```bash
./install_clipit.sh --source ./Clip-IT-v1.0.0-mac.zip --user
```

## VST3 Target Paths

Windows:
- C:\Program Files\Common Files\VST3\Clip-IT.vst3

macOS system:
- /Library/Audio/Plug-Ins/VST3/Clip-IT.vst3

macOS user:
- ~/Library/Audio/Plug-Ins/VST3/Clip-IT.vst3

## Post-Install Validation
1. Verify plugin bundle exists in the expected VST3 directory.
2. Rescan plugins in target DAW.
3. Open plugin and validate parameter set and audio pass.
4. Confirm no quarantine/code-sign trust issue on macOS.
