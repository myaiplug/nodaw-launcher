Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$targetPath = "C:\Program Files\Common Files\VST3\Clip-IT.vst3"

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Uninstall requires Administrator permissions."
}

if (Test-Path $targetPath) {
    Remove-Item -Path $targetPath -Recurse -Force
    Write-Host "Removed: $targetPath"
} else {
    Write-Host "Clip-IT is not installed at: $targetPath"
}
