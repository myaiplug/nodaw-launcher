param(
    [string]$Version = "0.3.1",
    [string]$Config = "Release",
    [switch]$InstallToSystem,
    [switch]$Sign,
    [string]$CertThumbprint,
    [string]$TimestampUrl = "http://timestamp.digicert.com",
    [string]$SignToolPath,
    [switch]$SignZip
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$buildDir = Join-Path $projectRoot "build"
$target = "RepairIT_VST3"
$vstBundleName = "Repair-IT.vst3"
$sourceVst3 = Join-Path $buildDir "RepairIT_artefacts/$Config/VST3/$vstBundleName"

$distRoot = Join-Path $projectRoot "dist"
$releaseName = "Repair-IT-v$Version-win64"
$stageDir = Join-Path $distRoot $releaseName
$zipPath = Join-Path $distRoot "$releaseName.zip"
$stageVst3 = Join-Path $stageDir $vstBundleName
$vstBinaryRelative = "Contents/x86_64-win/Repair-IT.vst3"
$sourceVst3Binary = Join-Path $sourceVst3 $vstBinaryRelative

function Resolve-SignTool {
    param(
        [string]$PreferredPath
    )

    if ($PreferredPath) {
        if (-not (Test-Path $PreferredPath)) {
            throw "Provided SignToolPath does not exist: $PreferredPath"
        }
        return (Resolve-Path $PreferredPath).Path
    }

    $cmd = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $sdkRoots = @(
        "C:\Program Files (x86)\Windows Kits\10\bin",
        "C:\Program Files\Windows Kits\10\bin"
    )

    foreach ($root in $sdkRoots) {
        if (-not (Test-Path $root)) {
            continue
        }

        $candidate = Get-ChildItem -Path $root -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            Select-Object -First 1

        if ($candidate) {
            return $candidate.FullName
        }
    }

    throw "signtool.exe not found. Install Windows SDK or pass -SignToolPath."
}

function Invoke-FileSigning {
    param(
        [string]$FilePath,
        [string]$Thumbprint,
        [string]$TimeServer,
        [string]$ToolPath
    )

    if (-not (Test-Path $FilePath)) {
        throw "Cannot sign missing file: $FilePath"
    }

    & $ToolPath sign /sha1 $Thumbprint /fd SHA256 /tr $TimeServer /td SHA256 "$FilePath"
    if ($LASTEXITCODE -ne 0) {
        throw "SignTool failed for: $FilePath"
    }
}

function Get-Sha256 {
    param(
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        throw "Cannot hash missing file: $FilePath"
    }

    return (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash.ToLowerInvariant()
}

Write-Host "[1/3] Building $target ($Config)..."
cmake --build $buildDir --config $Config --target $target

if (-not (Test-Path $sourceVst3)) {
    throw "Built VST3 not found at: $sourceVst3"
}

if (-not (Test-Path $sourceVst3Binary)) {
    throw "Built VST3 binary not found at: $sourceVst3Binary"
}

if ($Sign) {
    if (-not $CertThumbprint) {
        throw "-Sign requires -CertThumbprint."
    }

    $resolvedSignTool = Resolve-SignTool -PreferredPath $SignToolPath
    Write-Host "Signing source VST3 binary..."
    Invoke-FileSigning -FilePath $sourceVst3Binary -Thumbprint $CertThumbprint -TimeServer $TimestampUrl -ToolPath $resolvedSignTool
}

Write-Host "[2/3] Staging release..."
if (-not (Test-Path $distRoot)) {
    New-Item -ItemType Directory -Path $distRoot | Out-Null
}

if (Test-Path $stageDir) {
    Remove-Item -Path $stageDir -Recurse -Force
}

New-Item -ItemType Directory -Path $stageDir | Out-Null
Copy-Item -Path $sourceVst3 -Destination (Join-Path $stageDir $vstBundleName) -Recurse -Force

if ($Sign) {
    $stageBinary = Join-Path $stageVst3 $vstBinaryRelative
    Write-Host "Signing staged VST3 binary..."
    Invoke-FileSigning -FilePath $stageBinary -Thumbprint $CertThumbprint -TimeServer $TimestampUrl -ToolPath $resolvedSignTool
}

if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Compress-Archive -Path $stageDir -DestinationPath $zipPath -Force

if ($Sign -and $SignZip) {
    Write-Host "Signing release zip..."
    Invoke-FileSigning -FilePath $zipPath -Thumbprint $CertThumbprint -TimeServer $TimestampUrl -ToolPath $resolvedSignTool
}

$stagedBinary = Join-Path $stageVst3 $vstBinaryRelative
$hashEntries = @(
    [PSCustomObject]@{ File = "$releaseName.zip"; SHA256 = (Get-Sha256 -FilePath $zipPath) },
    [PSCustomObject]@{ File = "$releaseName/$vstBundleName/$vstBinaryRelative"; SHA256 = (Get-Sha256 -FilePath $stagedBinary) }
)

$shaPath = Join-Path $distRoot "$releaseName.sha256.txt"
$jsonPath = Join-Path $distRoot "$releaseName.hashes.json"

$shaLines = $hashEntries | ForEach-Object { "{0} *{1}" -f $_.SHA256, $_.File }
Set-Content -Path $shaPath -Value $shaLines -Encoding ascii

$hashEntries | ConvertTo-Json -Depth 3 | Set-Content -Path $jsonPath -Encoding utf8

if ($InstallToSystem) {
    $systemVst3Dir = "C:\Program Files\Common Files\VST3"
    Write-Host "Installing to $systemVst3Dir ..."
    Copy-Item -Path $sourceVst3 -Destination (Join-Path $systemVst3Dir $vstBundleName) -Recurse -Force
}

Write-Host "[3/3] Done"
Write-Host "Staged: $stageDir"
Write-Host "Zip:    $zipPath"
Write-Host "SHA:    $shaPath"
Write-Host "JSON:   $jsonPath"
