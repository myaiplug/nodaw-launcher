# Time Stretch X Release Guide

## Release Outputs

- Windows zip: `dist/TimeStretchX-vX.Y.Z-win64.zip`
- Windows native installer: `dist/TimeStretchX-Setup-vX.Y.Z.exe`
- macOS zip: `dist/TimeStretchX-vX.Y.Z-macos.zip`
- macOS native installer: `dist/TimeStretchX-vX.Y.Z-macOS.pkg`
- Checksums: `dist/*.sha256.txt`

## Windows Release

```powershell
./release.ps1 -Version 1.0.0
```

## macOS Release

```bash
./release.sh --version 1.0.0
```

## Quality Gate

```powershell
./scripts/score_release_readiness.ps1 -BuildDir ./build -DistDir ./dist
```

The gate must report a total score above 90.

## CI Automation

GitHub Actions workflow:

- `.github/workflows/release.yml`

Triggers:

- Push tags matching `v*`
- Manual dispatch with version input

CI assertions fail the run if expected artifacts are missing:

- Windows: zip, checksums/json, native EXE installer
- macOS: zip and native PKG installer
