param(
    [Parameter(Mandatory = $true)]
    [string]$Version,
    [string]$SourceZip,
    [string]$OutputDir,
    [switch]$InstallVcRedistByDefault
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$distRoot = if ($OutputDir) { $OutputDir } else { Join-Path $projectRoot "dist" }
$sourceZipPath = if ($SourceZip) { $SourceZip } else { Join-Path $distRoot ("Clip-IT-v{0}-win64.zip" -f $Version) }

if (-not (Test-Path $sourceZipPath)) {
    throw "Source package not found: $sourceZipPath"
}

$zipAbs = (Resolve-Path $sourceZipPath).Path
$outAbs = (Resolve-Path $distRoot).Path
if (-not (Test-Path $outAbs)) {
    New-Item -ItemType Directory -Path $outAbs | Out-Null
    $outAbs = (Resolve-Path $outAbs).Path
}

$iscc = Get-Command iscc.exe -ErrorAction SilentlyContinue
if (-not $iscc) {
    $defaultIscc = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    if (Test-Path $defaultIscc) {
        $isccPath = $defaultIscc
    }
    else {
        throw "Inno Setup compiler not found (iscc.exe). Install Inno Setup 6."
    }
}
else {
    $isccPath = $iscc.Source
}

$defaultVcFlag = if ($InstallVcRedistByDefault) { "1" } else { "0" }
$tempIss = Join-Path $env:TEMP ("clipit-installer-{0}.iss" -f [guid]::NewGuid().ToString("N"))

$issContent = @"
#define MyAppName "Clip-IT"
#define MyAppVersion "$Version"
#define MyOutputDir "$($outAbs -replace '\\','\\\\')"
#define MySourceZip "$($zipAbs -replace '\\','\\\\')"
#define DefaultInstallVcRedist "$defaultVcFlag"

[Setup]
AppId={{D96D0D0A-6C54-4D3A-88C6-C6C7A9F14201}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=NoDAW Studio
DefaultDirName={autopf}\Clip-IT
DisableDirPage=yes
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\install_clipit.ps1
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
Compression=lzma2
SolidCompression=yes
OutputDir={#MyOutputDir}
OutputBaseFilename=Clip-IT-Setup-v{#MyAppVersion}
WizardStyle=modern

[Files]
Source: "{#MySourceZip}"; DestDir: "{app}"; Flags: ignoreversion
Source: "$($PSScriptRoot -replace '\\','\\\\')\\install_clipit.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "$($PSScriptRoot -replace '\\','\\\\')\\uninstall_clipit.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\\install_clipit.ps1"" -SourcePath ""{app}\\Clip-IT-v{#MyAppVersion}-win64.zip"" {code:GetVcFlag}"; Flags: runhidden waituntilterminated

[Code]
function GetVcFlag(Param: String): String;
begin
  if ExpandConstant('{#DefaultInstallVcRedist}') = '1' then
    Result := '-InstallVcRedist'
  else
    Result := '';
end;
"@

Set-Content -Path $tempIss -Value $issContent -Encoding ascii

try {
    & "$isccPath" "$tempIss"
    if ($LASTEXITCODE -ne 0) {
        throw "Inno Setup compilation failed with exit code $LASTEXITCODE"
    }
}
finally {
    Remove-Item -Path $tempIss -Force -ErrorAction SilentlyContinue
}

$outExe = Join-Path $outAbs ("Clip-IT-Setup-v{0}.exe" -f $Version)
if (-not (Test-Path $outExe)) {
    throw "Installer executable not found after compile: $outExe"
}

Write-Host "Native Windows installer created: $outExe"
