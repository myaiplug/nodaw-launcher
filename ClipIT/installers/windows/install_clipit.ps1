param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [switch]$InstallVcRedist
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-Admin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "This installer must run as Administrator."
    }
}

function Install-VcRedist {
    $vcRuntime = Join-Path $env:WINDIR "System32\\vcruntime140.dll"
    if (Test-Path $vcRuntime) {
        Write-Host "VC++ runtime detected."
        return
    }

    $url = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
    $tmp = Join-Path $env:TEMP "vc_redist.x64.exe"
    Write-Host "Downloading VC++ runtime..."
    Invoke-WebRequest -Uri $url -OutFile $tmp

    Write-Host "Installing VC++ runtime..."
    $p = Start-Process -FilePath $tmp -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru
    if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 3010) {
        throw "VC++ runtime installer failed with exit code $($p.ExitCode)."
    }
}

function Expand-OrResolveVst3 {
    param([string]$Path)

    $resolved = (Resolve-Path $Path).Path
    if ($resolved.ToLowerInvariant().EndsWith(".vst3")) {
        return $resolved
    }

    if ($resolved.ToLowerInvariant().EndsWith(".zip")) {
        $tempDir = Join-Path $env:TEMP ("clipit-install-" + [guid]::NewGuid().ToString("N"))
        New-Item -ItemType Directory -Path $tempDir | Out-Null
        Expand-Archive -Path $resolved -DestinationPath $tempDir -Force

        $vst = Get-ChildItem -Path $tempDir -Filter "Clip-IT.vst3" -Recurse -Directory | Select-Object -First 1
        if (-not $vst) {
            throw "Clip-IT.vst3 not found inside zip package."
        }
        return $vst.FullName
    }

    throw "Unsupported SourcePath format. Use .zip package or .vst3 bundle."
}

Assert-Admin
if ($InstallVcRedist) {
    Install-VcRedist
}

if (-not (Test-Path $SourcePath)) {
    throw "SourcePath not found: $SourcePath"
}

$bundlePath = Expand-OrResolveVst3 -Path $SourcePath
$targetRoot = "C:\Program Files\Common Files\VST3"
$targetPath = Join-Path $targetRoot "Clip-IT.vst3"

if (-not (Test-Path $targetRoot)) {
    New-Item -ItemType Directory -Path $targetRoot | Out-Null
}

if (Test-Path $targetPath) {
    Remove-Item -Path $targetPath -Recurse -Force
}

Copy-Item -Path $bundlePath -Destination $targetPath -Recurse -Force

Write-Host "Clip-IT installed to: $targetPath"
Write-Host "Rescan plugins in your DAW to detect Clip-IT."
