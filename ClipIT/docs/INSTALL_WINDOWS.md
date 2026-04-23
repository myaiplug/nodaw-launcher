# Clip-IT Windows Installation

## Supported Targets
- Windows 10/11 (x64)
- VST3 hosts (Ableton Live, FL Studio, Cubase, Reaper, Studio One, etc.)

## Recommended Method
Run the native installer executable:

```powershell
.\dist\Clip-IT-Setup-v1.0.0.exe
```

Alternative (script installer):

```powershell
powershell -ExecutionPolicy Bypass -File .\installers\windows\install_clipit.ps1 -SourcePath .\dist\Clip-IT-v1.0.0-win64.zip -InstallVcRedist
```

## What It Does
1. Verifies administrator access.
2. Installs Microsoft VC++ Runtime (optional flag, recommended).
3. Extracts or reads the provided Clip-IT package.
4. Copies Clip-IT.vst3 to:
   C:\Program Files\Common Files\VST3\Clip-IT.vst3
5. Writes an uninstall script path in output guidance.

## Uninstall
```powershell
powershell -ExecutionPolicy Bypass -File .\installers\windows\uninstall_clipit.ps1
```

## DAW Rescan
After install, rescan plugins in your DAW.

## Troubleshooting
- If install fails with access denied, run PowerShell as Administrator.
- If plugin does not appear, verify file exists in Common Files VST3 path.
- If host reports missing runtime, rerun installer with -InstallVcRedist.
