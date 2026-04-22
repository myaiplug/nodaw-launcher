$ErrorActionPreference = 'Stop'

$filesToStage = @(
    '.gitignore',
    'electron/main.cjs',
    'electron/preload.cjs',
    'index.html',
    '.github/workflows/build.yml',
    '.github/workflows/security-gates.yml',
    'scripts/release-safety-check.ps1',
    'scripts/stage-security-hardening.ps1',
    'docs/SECURITY_RELEASE_RUNBOOK.md',
    'package.json'
)

Write-Host '[stage-security-hardening] Staging security-focused files only...'
foreach ($file in $filesToStage) {
    if (Test-Path $file) {
        git add -- $file
    } else {
        Write-Host "[stage-security-hardening] Skipped missing file: $file"
    }
}

Write-Host '[stage-security-hardening] Staged files:'
git status --short -- $filesToStage

Write-Host '[stage-security-hardening] Suggested commit message:'
Write-Host 'security: harden Electron runtime, add CI gates, and enforce release safety checks'
