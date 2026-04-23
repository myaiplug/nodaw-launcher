param(
    [string]$TargetRoot = "C:\Program Files\Common Files\VST3"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$targetPath = Join-Path $TargetRoot "Time Stretch X.vst3"

if (Test-Path $targetPath)
{
    Remove-Item -Path $targetPath -Recurse -Force
    Write-Host "Removed: $targetPath"
}
else
{
    Write-Host "No installation found at: $targetPath"
}
