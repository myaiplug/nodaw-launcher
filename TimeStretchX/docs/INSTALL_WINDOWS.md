# Time Stretch X Installation (Windows)

## Preferred: Native EXE Installer

1. Download `TimeStretchX-Setup-vX.Y.Z.exe`.
2. Right-click and Run as administrator.
3. Follow the wizard to install into `C:\Program Files\Common Files\VST3\Time Stretch X.vst3`.
4. Rescan plugins in your DAW.

## Script-based Installation

Use this when running from a local build or CI artifact.

```powershell
./installers/windows/install_timestretchx.ps1 -SourceBundle "./dist/TimeStretchX-v1.0.0-win64/Time Stretch X.vst3"
```

## Uninstall

```powershell
./installers/windows/uninstall_timestretchx.ps1
```

## Troubleshooting

- If your DAW does not detect the plugin, confirm folder permissions and trigger a manual plugin rescan.
- If SmartScreen warns, verify file hash from the release checksums.
