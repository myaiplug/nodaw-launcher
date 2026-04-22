# NoDAW Security Release Runbook

This runbook defines minimum security gates for NoDAW builds and releases.

## 1) Scope and intent

- Protect desktop users from unsigned or tampered release artifacts.
- Block known production dependency vulnerabilities before shipping.
- Detect accidental secret leakage during normal CI.
- Keep security changes isolated in dedicated commits.

## 2) Required CI gates

The following workflows must pass:

- `.github/workflows/security-gates.yml`
  - Production dependency audit: `npm audit --omit=dev`
  - Secret scan: gitleaks
- `.github/workflows/build.yml`
  - `security-gates` job must pass before any platform build jobs run.

## 3) Local pre-release checks

Run these from repository root:

```powershell
npm run security:release-check
```

For signed Windows release verification against built artifacts:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/release-safety-check.ps1 -RequireWindowsSignatureEvidence
```

## 4) Signing and evidence requirements

For tagged releases (`v*`), Windows installers must be Authenticode signed.

- Build workflow verifies signature validity for all `release/*.exe` artifacts.
- Build workflow emits evidence file:
  - `release/signing/windows-signatures.txt`
- Release creation job fails if signing evidence is missing.

## 5) Commit hygiene for security work

Use targeted staging to avoid mixing unrelated files:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/stage-security-hardening.ps1
```

Review staged files before commit:

```powershell
git diff --cached
```

## 6) Packaged runtime controls

Packaged Electron runtime must preserve these controls:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- navigation and popup restrictions
- default deny for permission prompts
- strict CSP response headers in packaged mode

## 7) Emergency response checklist

If a gate fails:

1. Stop release publication.
2. Triage the exact failing gate and capture logs.
3. Fix vulnerability/signing/secret issue.
4. Re-run checks locally and in CI.
5. Publish only after all gates are green.
