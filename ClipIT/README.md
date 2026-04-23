# Clip-IT

Clip-IT is NoDAW's high-end clipper plugin for mastering and bus control, with:
- Multi-mode clipping (Soft / Hard / Hybrid)
- Oversampling (Off / 2x / 4x / 8x)
- Loudness compensation
- True peak safety
- Per-mode voicing controls
- Hard safety clip and Delta monitoring

## Documentation
- User manual: [docs/CLIPIT_USER_MANUAL.md](docs/CLIPIT_USER_MANUAL.md)
- Windows install guide: [docs/INSTALL_WINDOWS.md](docs/INSTALL_WINDOWS.md)
- macOS install guide: [docs/INSTALL_MACOS.md](docs/INSTALL_MACOS.md)
- Release guide: [docs/RELEASE_GUIDE.md](docs/RELEASE_GUIDE.md)

## Build (Windows)
```powershell
cmake -S . -B build
cmake --build build --config Release --target ClipIT_VST3
```

## Package (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File .\ship_vst3.ps1 -Version 1.0.0
```

## Installers

### Windows Installer Script
```powershell
powershell -ExecutionPolicy Bypass -File .\installers\windows\install_clipit.ps1 -SourcePath .\dist\Clip-IT-v1.0.0-win64.zip -InstallVcRedist
```

### Windows Uninstall Script
```powershell
powershell -ExecutionPolicy Bypass -File .\installers\windows\uninstall_clipit.ps1
```

### macOS Installer Script
```bash
chmod +x ./installers/macos/install_clipit.sh
./installers/macos/install_clipit.sh --source ./dist/Clip-IT-v1.0.0-mac.zip --system
```

### macOS Ship/Package Script
```bash
chmod +x ./installers/macos/ship_vst3_macos.sh
./installers/macos/ship_vst3_macos.sh --version 1.0.0
```

For user-only install on macOS:
```bash
./installers/macos/install_clipit.sh --source ./dist/Clip-IT-v1.0.0-mac.zip --user
```

## Build Installer Bundles

Windows bundle (zip containing plugin package + install/uninstall scripts):
```powershell
powershell -ExecutionPolicy Bypass -File .\installers\windows\create_installer_bundle.ps1 -Version 1.0.0
```

macOS bundle (zip containing plugin package + install script):
```bash
chmod +x ./installers/macos/create_installer_bundle.sh
./installers/macos/create_installer_bundle.sh 1.0.0
```

## One-Command Release

Windows:
```powershell
powershell -ExecutionPolicy Bypass -File .\release.ps1 -Version 1.0.0
```

Produces:
- `dist/Clip-IT-v1.0.0-win64.zip`
- `dist/Clip-IT-Installer-Windows-v1.0.0.zip`
- `dist/Clip-IT-Setup-v1.0.0.exe` (native installer, when Inno Setup 6 is available)

macOS:
```bash
chmod +x ./release.sh
./release.sh --version 1.0.0
```

Produces:
- `dist/Clip-IT-v1.0.0-mac.zip`
- `dist/Clip-IT-Installer-macOS-v1.0.0.zip`
- `dist/Clip-IT-Installer-macOS-v1.0.0.pkg` (native installer)

## CI Release Pipeline (GitHub Actions)

Workflow file:
- `.github/workflows/release.yml`

Automatic release (recommended):
1. Push a version tag (format `vX.Y.Z`)
2. GitHub Actions builds Windows + macOS artifacts
3. Pipeline uploads artifacts and publishes a GitHub Release

Tag command example:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Manual release (workflow_dispatch):
1. Open Actions > Release Clip-IT
2. Run workflow with `version` (example: `1.0.0`)
3. Optional: keep `create_release` enabled to publish release page assets
