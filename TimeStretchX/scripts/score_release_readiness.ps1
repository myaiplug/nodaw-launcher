param(
    [string]$BuildDir = "./build",
    [string]$DistDir = "./dist"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-PathScore {
    param(
        [string]$Path,
        [int]$Points,
        [string]$Label,
        [ref]$Score,
        [ref]$Rows
    )

    if (Test-Path $Path)
    {
        $Score.Value += $Points
        $Rows.Value += "PASS  +$Points  $Label"
    }
    else
    {
        $Rows.Value += "FAIL  +0   $Label (missing: $Path)"
    }
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$buildRoot = Resolve-Path (Join-Path $root $BuildDir) -ErrorAction SilentlyContinue
$distRoot = Resolve-Path (Join-Path $root $DistDir) -ErrorAction SilentlyContinue

$score = 0
$rows = @()

# DSP + frontend implementation checks (60 points)
Test-PathScore -Path (Join-Path $root "Source\DSP\TimeStretchEngine.cpp") -Points 25 -Label "DSP engine present" -Score ([ref]$score) -Rows ([ref]$rows)
Test-PathScore -Path (Join-Path $root "Source\UI\LookAndFeel\Colours.h") -Points 15 -Label "Frontend palette present" -Score ([ref]$score) -Rows ([ref]$rows)
Test-PathScore -Path (Join-Path $root "Source\PluginEditor.cpp") -Points 20 -Label "Editor implementation present" -Score ([ref]$score) -Rows ([ref]$rows)

# Build and distribution checks (20 points)
if ($buildRoot)
{
    Test-PathScore -Path (Join-Path $buildRoot "TimeStretchX_artefacts\Release\VST3\Time Stretch X.vst3") -Points 15 -Label "Release VST3 artifact" -Score ([ref]$score) -Rows ([ref]$rows)
}
else
{
    $rows += "FAIL  +0   Build directory not resolved: $BuildDir"
}

if ($distRoot)
{
    Test-PathScore -Path (Join-Path $distRoot "TimeStretchX-v1.0.0-win64.zip") -Points 5 -Label "Windows distribution zip" -Score ([ref]$score) -Rows ([ref]$rows)
}
else
{
    $rows += "FAIL  +0   Dist directory not resolved: $DistDir"
}

# Docs and installers (20 points)
Test-PathScore -Path (Join-Path $root "docs\RELEASE_GUIDE.md") -Points 4 -Label "Release guide" -Score ([ref]$score) -Rows ([ref]$rows)
Test-PathScore -Path (Join-Path $root "docs\INSTALL_WINDOWS.md") -Points 4 -Label "Windows install guide" -Score ([ref]$score) -Rows ([ref]$rows)
Test-PathScore -Path (Join-Path $root "docs\INSTALL_MACOS.md") -Points 4 -Label "macOS install guide" -Score ([ref]$score) -Rows ([ref]$rows)
Test-PathScore -Path (Join-Path $root "installers\windows\create_native_installer.ps1") -Points 4 -Label "Windows native installer script" -Score ([ref]$score) -Rows ([ref]$rows)
Test-PathScore -Path (Join-Path $root "installers\macos\create_pkg_installer.sh") -Points 4 -Label "macOS native installer script" -Score ([ref]$score) -Rows ([ref]$rows)

$rows | ForEach-Object { Write-Host $_ }
Write-Host "TOTAL_SCORE=$score"

if ($score -lt 91)
{
    throw "Quality gate failed: score must be > 90"
}

Write-Host "Quality gate passed"
