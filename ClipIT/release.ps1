param(
    [Parameter(Mandatory = $true)]
    [string]$Version,
    [string]$Config = "Release",
    [switch]$Sign,
    [string]$CertThumbprint,
    [string]$TimestampUrl = "http://timestamp.digicert.com",
    [string]$SignToolPath,
    [switch]$SignZip,
    [switch]$SkipInstallerBundle,
    [switch]$SkipNativeInstaller,
    [switch]$InstallVcRedistByDefault
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$shipScript = Join-Path $projectRoot "ship_vst3.ps1"
$bundleScript = Join-Path $projectRoot "installers\\windows\\create_installer_bundle.ps1"
$nativeInstallerScript = Join-Path $projectRoot "installers\\windows\\create_native_installer.ps1"

if (-not (Test-Path $shipScript)) {
    throw "Missing ship script: $shipScript"
}

if (-not (Test-Path $bundleScript)) {
    throw "Missing installer bundle script: $bundleScript"
}

if (-not (Test-Path $nativeInstallerScript)) {
    throw "Missing native installer script: $nativeInstallerScript"
}

Write-Host "[1/2] Building and packaging Windows VST3 release..."
$shipArgs = @(
    "-Version", $Version,
    "-Config", $Config
)

if ($Sign) {
    if (-not $CertThumbprint) {
        throw "-Sign requires -CertThumbprint."
    }

    $shipArgs += @("-Sign", "-CertThumbprint", $CertThumbprint, "-TimestampUrl", $TimestampUrl)
    if ($SignToolPath) {
        $shipArgs += @("-SignToolPath", $SignToolPath)
    }
    if ($SignZip) {
        $shipArgs += "-SignZip"
    }
}

& powershell -ExecutionPolicy Bypass -File $shipScript @shipArgs
if ($LASTEXITCODE -ne 0) {
    throw "Windows ship script failed with exit code $LASTEXITCODE"
}

if (-not $SkipInstallerBundle) {
    Write-Host "[2/3] Creating Windows installer bundle..."
    & powershell -ExecutionPolicy Bypass -File $bundleScript -Version $Version
    if ($LASTEXITCODE -ne 0) {
        throw "Windows installer bundle script failed with exit code $LASTEXITCODE"
    }
}
else {
    Write-Host "[2/3] Skipped installer bundle creation by request."
}

if (-not $SkipNativeInstaller) {
    Write-Host "[3/3] Creating native Windows installer (.exe via Inno Setup)..."
    try {
        $nativeArgs = @("-Version", $Version)
        if ($InstallVcRedistByDefault) {
            $nativeArgs += "-InstallVcRedistByDefault"
        }

        & powershell -ExecutionPolicy Bypass -File $nativeInstallerScript @nativeArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Windows native installer script failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Warning "Native installer step skipped/failed: $($_.Exception.Message)"
        Write-Warning "Install Inno Setup 6 and rerun release without -SkipNativeInstaller to generate Clip-IT-Setup-v$Version.exe"
    }
}
else {
    Write-Host "[3/3] Skipped native installer creation by request."
}

Write-Host "Release complete. Artifacts are in dist/."
Write-Host "Note: For macOS packaging, run ./release.sh on a macOS machine."
