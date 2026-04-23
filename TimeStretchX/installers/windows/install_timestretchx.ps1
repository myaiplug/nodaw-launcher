param(
    [string]$SourceBundle,
    [string]$TargetRoot = "C:\Program Files\Common Files\VST3",
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$pluginName = "Time Stretch X.vst3"
$targetPath = Join-Path $TargetRoot $pluginName

if (-not $SourceBundle)
{
    $projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
    $candidate = Join-Path $projectRoot "build\TimeStretchX_artefacts\Release\VST3\$pluginName"
    if (-not (Test-Path $candidate))
    {
        throw "Source bundle not found. Pass -SourceBundle or build Release first."
    }
    $SourceBundle = $candidate
}

if (-not (Test-Path $SourceBundle))
{
    throw "Source bundle not found: $SourceBundle"
}

if (-not (Test-Path $TargetRoot))
{
    New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null
}

if ((Test-Path $targetPath) -and -not $Force)
{
    throw "Existing installation found at $targetPath. Use -Force to overwrite."
}

if (Test-Path $targetPath)
{
    Remove-Item -Path $targetPath -Recurse -Force
}

Copy-Item -Path $SourceBundle -Destination $targetPath -Recurse -Force
Write-Host "Installed: $targetPath"
