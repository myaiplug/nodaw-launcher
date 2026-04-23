# NoDAW Online Resources Master Index

Complete index of all GitHub repositories, deployed versions, and third-party resources used across the NoDAW ecosystem.

---

## Primary GitHub Repositories

### Core Projects

| Project | Repository | URL | Branch | Purpose |
|---------|-----------|-----|--------|---------|
| **NoDAW Launcher** | nodaw-launcher | https://github.com/myaiplug/nodaw-launcher | master | Electron launcher shell for NoDAW suite |
| **StemSplit** | StemSplit1 | https://github.com/myaiplug/StemSplit1 | main | Audio stem separation & processing (Tauri + Next.js) |

### Clone URLs
```bash
# NoDAW Launcher
git clone https://github.com/myaiplug/nodaw-launcher.git

# StemSplit
git clone https://github.com/myaiplug/StemSplit1.git
```

---

## Local Subprojects (Bundled in NoDAW Suite)

Maintained locally in `i:\Projects\NoDAW - 5 in 1\` workspace:

| Project | Path | Type | Status |
|---------|------|------|--------|
| **TrimIt** | `/TrimIt` | Electron App | Active |
| **IconGenius** | `/IconGenius` | Electron App | Active |
| **ClipIT** | `/ClipIT` | JUCE Plugin | Active |
| **TimeStretchX** | `/TimeStretchX` | JUCE Plugin + VST3 | Active |
| **RepairIT** | `/RepairIT` | JUCE Plugin | Development |
| **ScrewAI** | `/ScrewAI` | Electron App | Active |
| **SmartPromptIt** | `/` | React Component | Development |

---

## Third-Party Dependencies

### Frontend & UI

| Library | Version | Purpose | Docs |
|---------|---------|---------|------|
| **React** | 19.2.3 / 18.3.1 | UI framework | https://react.dev |
| **React DOM** | 19.2.3 / 18.3.1 | React rendering | https://react.dev/reference/react-dom |
| **Next.js** | 16.2.2 | React framework (StemSplit) | https://nextjs.org/docs |
| **Vite** | 6.2.0 | Build tool & dev server | https://vitejs.dev |
| **TypeScript** | 5.4.5–5.8.2 | Type safety | https://www.typescriptlang.org |
| **Tailwind CSS** | 3.4.3 | Utility CSS | https://tailwindcss.com |
| **Framer Motion** | 12.38.0 | Animation library | https://www.framer.com/motion |

### Audio Processing

| Library | Version | Purpose | Docs |
|---------|---------|---------|------|
| **Three.js** | 0.183.2 | 3D visualization | https://threejs.org |
| **@react-three/fiber** | 9.5.0 / 8.17.6 | React+Three bridge | https://docs.pmnd.rs/react-three-fiber |
| **@react-three/drei** | 10.7.7 / 9.112.0 | Three.js helpers | https://github.com/pmndrs/drei |
| **Wavesurfer.js** | 7.12.5 | Audio waveform display | https://wavesurfer.xyz |
| **Howler.js** | 2.2.4 | Audio playback | https://howlerjs.com |
| **FFT.js** | 4.0.4 | Fast Fourier Transform | https://github.com/indutny/fft.js |
| **LAME JS** | 1.2.1 | MP3 encoding | https://github.com/zhuker/lamejs |
| **libFLAC.js** | 5.4.0 | FLAC codec | https://github.com/jsmreese/libflac.js |
| **Web Audio API** | Native | Audio context & DSP | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API |

### Desktop & Native

| Library | Version | Purpose | Docs |
|---------|---------|---------|------|
| **Electron** | 40.2.1 | Desktop framework | https://www.electronjs.org/docs |
| **Electron Builder** | 26.7.0 | Release packaging | https://www.electron.build |
| **Tauri** | 2.0.0+ | Lightweight desktop | https://tauri.app/docs |
| **@tauri-apps/api** | 2.0.0+ | Tauri runtime API | https://tauri.app/docs/api |
| **@tauri-apps/cli** | 2.0.0+ | Tauri CLI | https://tauri.app/docs/getting-started/setup |
| **JUCE** | 8.0.12 | Audio plugin framework | https://juce.com/discover/juce |

### State Management & Utilities

| Library | Version | Purpose | Docs |
|---------|---------|---------|------|
| **Zustand** | 5.0.12 | State management | https://github.com/pmndrs/zustand |
| **Lucide React** | 1.7.0 | Icon library | https://lucide.dev |
| **Concurrently** | 9.2.1 | Multi-process runner | https://github.com/open-cli-tools/concurrently |
| **Cross-Env** | 10.1.0 | Cross-platform env vars | https://github.com/kentcdodds/cross-env |

### Build & Development Tools

| Tool | Version | Purpose | Docs |
|------|---------|---------|------|
| **ESLint** | 9.39.1 | Code linting | https://eslint.org |
| **Autoprefixer** | 10.4.19 | CSS vendor prefixes | https://autoprefixer.github.io |
| **PostCSS** | 8.5.8 | CSS transformation | https://postcss.org |

### CI/CD & Security

| Tool | Purpose | Docs |
|------|---------|------|
| **GitHub Actions** | Workflow automation | https://github.com/features/actions |
| **gitleaks** | Secret scanning | https://github.com/gitleaks/gitleaks-action |
| **npm audit** | Dependency audit | https://docs.npmjs.com/cli/v10/commands/npm-audit |

### Type Definitions

| Library | Version | Purpose | Docs |
|---------|---------|---------|------|
| **@types/node** | 20.12.11–22.14.0 | Node.js types | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **@types/react** | 18.3.1 | React types | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **@types/react-dom** | 18.3.0 | React DOM types | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **@types/three** | 0.183.1 | Three.js types | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **@types/howler** | 2.2.12 | Howler.js types | https://github.com/DefinitelyTyped/DefinitelyTyped |

---

## Online Documentation & Resources

### Official Docs
- **React**: https://react.dev
- **Next.js**: https://nextjs.org
- **Vite**: https://vitejs.dev
- **Tauri**: https://tauri.app
- **Electron**: https://www.electronjs.org
- **JUCE**: https://juce.com
- **Three.js**: https://threejs.org
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org

### NPM Packages
- Search any package: https://www.npmjs.com/search?q={package-name}
- Package security info: https://www.npmjs.com/advisories

### Audio & DSP
- Web Audio API Spec: https://www.w3.org/TR/webaudio/
- MDN Web Audio: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- JUCE Plugin Format Guide: https://juce.com/learn/tutorials/getting-started-with-the-projucer

### Security & Best Practices
- OWASP Top 10: https://owasp.org/Top10/
- Electron Security: https://www.electronjs.org/docs/tutorial/security
- npm Security Advisories: https://github.com/advisories

---

## Development Environment Setup

### Prerequisites
- **Node.js**: 20.x LTS (https://nodejs.org)
- **Python**: 3.11+ (for StemSplit)
- **.NET SDK**: 8+ (if building certain tools)
- **CMake**: 3.20+ (for JUCE plugins)
- **Git**: https://git-scm.com

### Quick Start

#### Clone all repositories
```bash
# NoDAW Launcher (primary)
git clone https://github.com/myaiplug/nodaw-launcher.git
cd nodaw-launcher

# StemSplit (desktop version)
git clone https://github.com/myaiplug/StemSplit1.git
cd StemSplit1
```

#### Install dependencies
```bash
npm install
```

#### Run development servers
```bash
# NoDAW Launcher (Electron dev)
npm run electron:dev

# StemSplit (Next.js dev + Tauri)
npm run dev
npm run tauri dev
```

---

## Release & Distribution

### Installer Downloads

| Product | Platform | Download Link | Status |
|---------|----------|---------------|--------|
| **NoDAW Launcher** | Windows / macOS / Linux | https://github.com/myaiplug/nodaw-launcher/releases | ⚠️ No release published yet |
| **StemSplit Desktop** | Windows (.exe) | https://github.com/myaiplug/StemSplit1/releases/latest | ✅ Available |
| **StemSplit Desktop** | macOS (.dmg) | https://github.com/myaiplug/StemSplit1/releases/latest | ✅ Available |

> **NoDAW Launcher** has no published releases yet. To publish one, tag a commit and push — the `build.yml` CI workflow will build and attach the installers automatically:
> ```bash
> git tag v1.0.0
> git push origin v1.0.0
> ```

### Build Artifacts Hosting
- GitHub Releases: https://github.com/myaiplug/nodaw-launcher/releases
- GitHub Releases: https://github.com/myaiplug/StemSplit1/releases

### Release Process
See [docs/SECURITY_RELEASE_RUNBOOK.md](docs/SECURITY_RELEASE_RUNBOOK.md) for security gates and signing requirements.

---

## Security & Compliance

### Audit Commands
```bash
# Check production dependencies for vulnerabilities
npm run security:audit

# Full security pre-release check
npm run security:release-check

# Secret scanning in CI
# Runs automatically via .github/workflows/security-gates.yml
```

### License & Attribution
- All projects are maintained under the repository license
- See individual `LICENSE` files in each repository

---

## Support & Issues

- **NoDAW Launcher Issues**: https://github.com/myaiplug/nodaw-launcher/issues
- **StemSplit Issues**: https://github.com/myaiplug/StemSplit1/issues
- **npm Advisories**: https://github.com/advisories

---

## Last Updated
April 22, 2026

For the most current information, check each repository's README and documentation.
