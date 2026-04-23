param(
    [string]$Version = "1.0.0",
    [string]$Config = "Release",
    [switch]$SkipNativeInstaller
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "[1/4] Building TimeStretchX ($Config)..."
cmake --build build --config $Config --target TimeStretchX_VST3

Write-Host "[2/4] Creating release zip..."
./ship_vst3.ps1 -Version $Version -Config $Config

if (-not $SkipNativeInstaller)
{
    Write-Host "[3/4] Creating native EXE installer..."
    ./installers/windows/create_native_installer.ps1 -Version $Version
}

Write-Host "[4/4] Running quality gate..."
./scripts/score_release_readiness.ps1 -BuildDir ./build -DistDir ./dist

Write-Host "Release complete"
