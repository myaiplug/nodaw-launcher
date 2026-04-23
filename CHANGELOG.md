# NoDAW Studio Suite - Changelog

All notable changes to NoDAW Studio Suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-04-15

### Added
- Native TimeStretchX graph runtime now emits per-connection meter levels for cable activity monitoring
- Lock-free profiling sample ring buffer for real-time thread performance telemetry
- Graph editor cable pulse animation driven by live per-cable activity levels

### Changed
- TimeStretchX native processing chain migrated from manual node-dispatch to JUCE `AudioProcessorGraph` execution
- Native graph now rebuilds deterministic node order into graph IO + processor nodes and reconnects entry/exit channels automatically
- TimeStretchX plugin lifecycle now explicitly prepares/resets the native graph backend during `prepareToPlay`/`releaseResources`

### Fixed
- Prevented stale runtime node parameter state by pushing graph parameter updates into live processor nodes after rebuild
- Improved graph runtime stability by preserving cycle-guard behavior while rebuilding native graph internals

---

## [1.3.0] - 2026-04-14

### Changed
- **UI Layout**: Moved Theme Toggle (sun/moon icon) to the top-right corner - now always visible
- **UI Layout**: Moved Dev Mode indicator to the right side, positioned under the Pro badge
- **UI Layout**: Top-left area now contains only Settings and utility buttons (Bulk Upload, Effect Chain, PromptGenius)
- **UI Layout**: Adjusted TierBadge positioning to accommodate new theme toggle location

### Fixed
- Dev mode indicator now has hover state for better interactivity feedback

---

## [1.2.0] - 2026-04-13

### Added
- DevConsole secret tool for developer debugging
- TimeStretchX secret tool for advanced tempo manipulation
- AudioRepair secret tool for audio restoration
- ProGate component for Pro license gating
- AutomationLane component for DAW-style automation
- TransportBar component for audio playback control
- Workstation placeholder panel with comprehensive feature list
- Secret tools keyboard shortcut system (Ctrl+Alt+Insert×3)

### Changed
- Updated ScrewItPanel with improved usage tracking API
- Enhanced PlaceholderPanels with all placeholder tool panels

### Fixed
- Fixed truncated WorkstationPanel arrow function closure
- Fixed PlaceholderPanels.tsx missing closing tags
- Fixed DevConsole toggleDevMode() missing secret argument
- Fixed ScrewItPanel usageStore API compatibility

---

## [1.1.2] - 2026-04-12

### Added
- Bulk processing system with BulkUploadManager
- BulkProgressModal for tracking batch operations
- EffectChainBuilder for custom effect chains
- PromptGenius AI prompt enhancement tool

### Changed
- Enhanced LauncherApp with bulk processing integration
- Improved theme toggle styling

---

## [1.1.0] - 2026-04-10

### Added
- ShatterUnlockModal with glass-breaking animation
- FeatureTile3D with perspective hover effects
- ParticleField WebGL background
- Achievement badge system

### Changed
- Complete UI overhaul to Awwwards-quality design
- Improved onboarding sequence with animations

---

## [1.0.0] - 2026-04-01

### Added
- Initial release of NoDAW Studio Suite
- TrimIt - Audio trimming tool
- ConvertIt - Audio format conversion
- TestIt - Audio testing and analysis
- SplitIt/StemSplit - AI-powered stem separation (Tauri/Rust + embedded Python)
- ScrewIt - Pitch/tempo manipulation
- FXit - Audio effects processing
- IconIt - Icon generation tool
- License tier system (Free, Pro, Pro+)
- Dark/Light theme support
- Global file drop zone
- Keyboard shortcuts

---

## Version History Summary

| Version | Date       | Major Changes |
|---------|------------|---------------|
| 1.4.0   | 2026-04-15 | JUCE AudioProcessorGraph backend, RT profiling ring buffer, cable meter pulse flow |
| 1.3.0   | 2026-04-14 | Theme toggle moved to top-right, dev button repositioned |
| 1.2.0   | 2026-04-13 | Secret tools (DevConsole, TimeStretchX, AudioRepair), Workstation |
| 1.1.2   | 2026-04-12 | Bulk processing, PromptGenius |
| 1.1.0   | 2026-04-10 | Awwwards-quality UI redesign |
| 1.0.0   | 2026-04-01 | Initial release |

---

## Updating This Changelog

When making changes to the application:

1. **Increment the version number** in `package.json`
2. **Add a new section** at the top of this changelog following the format:
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD

   ### Added
   - New features

   ### Changed
   - Changes to existing features

   ### Fixed
   - Bug fixes

   ### Removed
   - Removed features

   ### Security
   - Security fixes
   ```

3. **Update the version** displayed in `LauncherApp.tsx` footer
4. **Update the Version History Summary** table above

### Version Number Guidelines

- **Major (X)**: Breaking changes or major feature overhauls
- **Minor (Y)**: New features, significant improvements
- **Patch (Z)**: Bug fixes, small UI tweaks
