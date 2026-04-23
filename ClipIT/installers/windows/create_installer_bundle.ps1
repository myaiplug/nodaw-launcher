param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\\..")
$distRoot = Join-Path $projectRoot "dist"
$sourceZip = Join-Path $distRoot ("Clip-IT-v{0}-win64.zip" -f $Version)

if (-not (Test-Path $sourceZip)) {
    throw "Source package not found: $sourceZip"
}

$bundleRoot = Join-Path $distRoot ("Clip-IT-Installer-Windows-v{0}" -f $Version)
if (Test-Path $bundleRoot) {
    Remove-Item -Path $bundleRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $bundleRoot | Out-Null

Copy-Item -Path $sourceZip -Destination (Join-Path $bundleRoot (Split-Path $sourceZip -Leaf)) -Force
Copy-Item -Path (Join-Path $PSScriptRoot "install_clipit.ps1") -Destination (Join-Path $bundleRoot "install_clipit.ps1") -Force
Copy-Item -Path (Join-Path $PSScriptRoot "uninstall_clipit.ps1") -Destination (Join-Path $bundleRoot "uninstall_clipit.ps1") -Force

$readmePath = Join-Path $bundleRoot "README_INSTALL.txt"
@"
Clip-IT Windows Installer Bundle

Install:
  powershell -ExecutionPolicy Bypass -File .\\install_clipit.ps1 -SourcePath .\\Clip-IT-v$Version-win64.zip -InstallVcRedist

Uninstall:
  powershell -ExecutionPolicy Bypass -File .\\uninstall_clipit.ps1
"@ | Set-Content -Path $readmePath -Encoding ascii

$zipOut = "$bundleRoot.zip"
if (Test-Path $zipOut) {
    Remove-Item -Path $zipOut -Force
}
Compress-Archive -Path $bundleRoot -DestinationPath $zipOut -Force

Write-Host "Installer bundle folder: $bundleRoot"
Write-Host "Installer bundle zip:    $zipOut"
