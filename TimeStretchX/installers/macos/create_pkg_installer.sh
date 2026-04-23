#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-1.0.0}"
PKG_SIGN_IDENTITY="${PKG_SIGN_IDENTITY:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist"
STAGE_DIR="$DIST_DIR/_pkg_stage"
PAYLOAD_DIR="$STAGE_DIR/payload"
SCRIPTS_DIR="$STAGE_DIR/scripts"

VST3_SOURCE="$PROJECT_ROOT/build/TimeStretchX_artefacts/Release/VST3/Time Stretch X.vst3"
AU_SOURCE="$PROJECT_ROOT/build/TimeStretchX_artefacts/Release/AU/Time Stretch X.component"

if [[ ! -d "$VST3_SOURCE" ]]; then
  echo "Missing VST3 bundle: $VST3_SOURCE" >&2
  exit 1
fi

rm -rf "$STAGE_DIR"
mkdir -p "$PAYLOAD_DIR/Library/Audio/Plug-Ins/VST3"
mkdir -p "$PAYLOAD_DIR/Library/Audio/Plug-Ins/Components"
mkdir -p "$SCRIPTS_DIR"

cp -R "$VST3_SOURCE" "$PAYLOAD_DIR/Library/Audio/Plug-Ins/VST3/"
if [[ -d "$AU_SOURCE" ]]; then
  cp -R "$AU_SOURCE" "$PAYLOAD_DIR/Library/Audio/Plug-Ins/Components/"
fi

cat > "$SCRIPTS_DIR/postinstall" <<'POST'
#!/bin/bash
set -e
if [[ -d "/Library/Audio/Plug-Ins/VST3/Time Stretch X.vst3" ]]; then
  xattr -dr com.apple.quarantine "/Library/Audio/Plug-Ins/VST3/Time Stretch X.vst3" >/dev/null 2>&1 || true
fi
if [[ -d "/Library/Audio/Plug-Ins/Components/Time Stretch X.component" ]]; then
  xattr -dr com.apple.quarantine "/Library/Audio/Plug-Ins/Components/Time Stretch X.component" >/dev/null 2>&1 || true
fi
exit 0
POST
chmod +x "$SCRIPTS_DIR/postinstall"

mkdir -p "$DIST_DIR"
COMPONENT_PKG="$DIST_DIR/TimeStretchX-v$VERSION-component.pkg"
FINAL_PKG="$DIST_DIR/TimeStretchX-v$VERSION-macOS.pkg"

pkgbuild \
  --root "$PAYLOAD_DIR" \
  --scripts "$SCRIPTS_DIR" \
  --identifier "com.nodaw.timestretchx.plugin" \
  --version "$VERSION" \
  "$COMPONENT_PKG"

if [[ -n "$PKG_SIGN_IDENTITY" ]]; then
  productbuild \
    --package "$COMPONENT_PKG" \
    --sign "$PKG_SIGN_IDENTITY" \
    "$FINAL_PKG"
else
  productbuild \
    --package "$COMPONENT_PKG" \
    "$FINAL_PKG"
fi

rm -f "$COMPONENT_PKG"

echo "Created: $FINAL_PKG"
