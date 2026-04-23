param(
    [string]$Version = "1.0.0",
    [string]$InputBundle,
    [string]$OutputDir,
    [string]$InnoSetupCompiler = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
if (-not $InputBundle)
{
    $InputBundle = Join-Path $projectRoot "build\TimeStretchX_artefacts\Release\VST3\Time Stretch X.vst3"
}
if (-not $OutputDir)
{
    $OutputDir = Join-Path $projectRoot "dist"
}

if (-not (Test-Path $InnoSetupCompiler))
{
    throw "Inno Setup compiler not found at $InnoSetupCompiler"
}
if (-not (Test-Path $InputBundle))
{
    throw "Input bundle not found: $InputBundle"
}

$stageRoot = Join-Path $projectRoot "dist\_native-installer-stage"
$stageBundle = Join-Path $stageRoot "Time Stretch X.vst3"
if (Test-Path $stageRoot)
{
    Remove-Item -Path $stageRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $stageRoot -Force | Out-Null
Copy-Item -Path $InputBundle -Destination $stageBundle -Recurse -Force

$issPath = Join-Path $stageRoot "TimeStretchXInstaller.iss"
$iss = @"
[Setup]
AppId={{5DDB0F2A-AB6A-4A6D-B0E2-0FD3A40EBAA1}
AppName=Time Stretch X
AppVersion=$Version
DefaultDirName={commoncf}\VST3
DisableDirPage=yes
DefaultGroupName=Time Stretch X
UninstallDisplayIcon={app}\Time Stretch X.vst3
OutputDir=$OutputDir
OutputBaseFilename=TimeStretchX-Setup-v$Version
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
Source: "$stageBundle\*"; DestDir: "{app}\Time Stretch X.vst3"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{group}\Uninstall Time Stretch X"; Filename: "{uninstallexe}"
"@

Set-Content -Path $issPath -Value $iss -Encoding ascii

& $InnoSetupCompiler $issPath
if ($LASTEXITCODE -ne 0)
{
    throw "Inno Setup failed with exit code $LASTEXITCODE"
}

Write-Host "Native installer generated in: $OutputDir"
