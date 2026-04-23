<div align="center">

# 🎛️ NoDAW Studio Suite

**One App. Eight Tools. Zero Limits.**

Professional audio toolkit for creators, producers, and audio engineers.

[![GitHub release](https://img.shields.io/github/v/release/myaiplug/nodaw-launcher?style=flat-square)](https://github.com/myaiplug/nodaw-launcher/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](#installation)

</div>

---

## ✨ Features

| Tool | Description | Tier |
|------|-------------|------|
| ✂️ **TrimIt** | Precision audio trimming with waveform visualization | Free |
| 🔄 **ConvertIt** | Convert between MP3, WAV, FLAC, OGG & more | Free |
| 🔀 **TestIt** | A/B comparison with instant switching | Free |
| 🎵 **SplitIt** | AI-powered stem separation (vocals, drums, bass) | Pro |
| 🔩 **ScrewIt** | Pitch & tempo manipulation with precision | Pro |
| ✨ **FXit** | One-click professional effect chains | Pro |
| 🎨 **IconIt** | Generate app icons for all platforms | Pro |
| 🎛️ **NoDAW Workstation** | Full-featured multitrack DAW | Pro+ |

## 🚀 Installation

### Download Pre-built Installers

| Platform | Download |
|----------|----------|
| Windows | [NoDAW Studio Suite Setup.exe](https://github.com/myaiplug/nodaw-launcher/releases/latest) |
| macOS | [NoDAW Studio Suite.dmg](https://github.com/myaiplug/nodaw-launcher/releases/latest) |
| Linux | [NoDAW Studio Suite.AppImage](https://github.com/myaiplug/nodaw-launcher/releases/latest) |

### Build from Source

```bash
# Clone the repository
git clone https://github.com/myaiplug/nodaw-launcher.git
cd nodaw-launcher

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for your platform
npm run electron:build        # Windows (default)
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
npm run electron:build:all    # All platforms
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `1-8` | Quick launch tools |
| `Ctrl+T` | Toggle theme |
| `Ctrl+,` | Open settings |
| `Escape` | Close panel / Go back |
| `F11` | Toggle fullscreen |

## 🎨 Screenshots

<div align="center">
<i>Coming soon...</i>
</div>

## 📦 Tech Stack

- **Frontend:** React 19, TypeScript, Framer Motion
- **3D Graphics:** Three.js, @react-three/fiber
- **Desktop:** Electron 40
- **State:** Zustand
- **Build:** Vite 6, electron-builder

## 🔒 License Tiers

| Tier     | Tools Included |
|----------|----------------|
| **Free** | TrimIt, ConvertIt, TestIt |
| **Pro**  | + SplitIt, ScrewIt, FXit, IconIt |
| **Pro+** | + NoDAW Workstation |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/myaiplug">b33zy</a>
</div>
