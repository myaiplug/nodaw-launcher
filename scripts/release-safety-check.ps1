param(
    [switch]$RequireWindowsSignatureEvidence
)

$ErrorActionPreference = 'Stop'

Write-Host '[release-safety-check] Running production dependency audit...'
npm audit --omit=dev
if ($LASTEXITCODE -ne 0) {
    throw 'npm audit --omit=dev failed. Resolve vulnerabilities before release.'
}

if ($RequireWindowsSignatureEvidence) {
    $releaseDir = Join-Path $PSScriptRoot '..\release'
    $releaseDir = [System.IO.Path]::GetFullPath($releaseDir)

    if (-not (Test-Path $releaseDir)) {
        throw "Release directory not found: $releaseDir"
    }

    $installers = Get-ChildItem -Path $releaseDir -Filter *.exe -File
    if (-not $installers) {
        throw "No Windows installer artifacts found in $releaseDir"
    }

    $reportDir = Join-Path $releaseDir 'signing'
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
    $reportPath = Join-Path $reportDir 'windows-signatures.txt'
    if (Test-Path $reportPath) {
        Remove-Item $reportPath -Force
    }

    Write-Host '[release-safety-check] Verifying Windows code signatures...'
    foreach ($installer in $installers) {
        $sig = Get-AuthenticodeSignature -FilePath $installer.FullName
        if ($sig.Status -ne 'Valid') {
            throw "Unsigned or invalid signature: $($installer.Name) [$($sig.Status)]"
        }

        $subject = if ($sig.SignerCertificate) { $sig.SignerCertificate.Subject } else { 'Unknown signer' }
        "$($installer.Name) :: $($sig.Status) :: $subject" | Add-Content -Path $reportPath
    }

    Write-Host "[release-safety-check] Signature evidence written: $reportPath"
}

Write-Host '[release-safety-check] All release safety checks passed.'
