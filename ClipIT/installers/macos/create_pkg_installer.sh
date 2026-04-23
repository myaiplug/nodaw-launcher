#!/usr/bin/env bash
set -euo pipefail

VERSION=""
SOURCE_ZIP=""
OUTPUT_DIR=""
IDENTITY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"; shift 2 ;;
    --source-zip)
      SOURCE_ZIP="$2"; shift 2 ;;
    --output-dir)
      OUTPUT_DIR="$2"; shift 2 ;;
    --sign-identity)
      IDENTITY="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: create_pkg_installer.sh --version X.Y.Z [--source-zip /path/to/Clip-IT-vX.Y.Z-mac.zip] [--output-dir /path/to/dist] [--sign-identity \"Developer ID Installer: ...\"]" >&2
      exit 1 ;;
  esac
done

if [[ -z "$VERSION" ]]; then
  echo "--version is required" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_ROOT="${OUTPUT_DIR:-$PROJECT_ROOT/dist}"
SOURCE_ZIP="${SOURCE_ZIP:-$DIST_ROOT/Clip-IT-v${VERSION}-mac.zip}"

if [[ ! -f "$SOURCE_ZIP" ]]; then
  echo "Source package not found: $SOURCE_ZIP" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
PAYLOAD_ROOT="$WORK_DIR/payload"
SCRIPTS_DIR="$WORK_DIR/scripts"
PKG_COMPONENT="$WORK_DIR/Clip-IT-component.pkg"
PKG_FINAL="$DIST_ROOT/Clip-IT-Installer-macOS-v${VERSION}.pkg"

cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

mkdir -p "$PAYLOAD_ROOT/Library/Audio/Plug-Ins/VST3"
mkdir -p "$SCRIPTS_DIR"

ditto -x -k "$SOURCE_ZIP" "$WORK_DIR/unpacked"
BUNDLE_SRC="$(find "$WORK_DIR/unpacked" -type d -name "Clip-IT.vst3" | head -n 1 || true)"
if [[ -z "$BUNDLE_SRC" ]]; then
  echo "Clip-IT.vst3 was not found in $SOURCE_ZIP" >&2
  exit 1
fi

ditto "$BUNDLE_SRC" "$PAYLOAD_ROOT/Library/Audio/Plug-Ins/VST3/Clip-IT.vst3"

cat > "$SCRIPTS_DIR/postinstall" <<'POST'
#!/usr/bin/env bash
set -euo pipefail
TARGET="/Library/Audio/Plug-Ins/VST3/Clip-IT.vst3"
if [[ -d "$TARGET" ]]; then
  /usr/bin/xattr -dr com.apple.quarantine "$TARGET" || true
fi
exit 0
POST
chmod +x "$SCRIPTS_DIR/postinstall"

pkgbuild_args=(
  --root "$PAYLOAD_ROOT"
  --identifier "com.nodaw.clipit.vst3"
  --version "$VERSION"
  --install-location "/"
  --scripts "$SCRIPTS_DIR"
  "$PKG_COMPONENT"
)

pkgbuild "${pkgbuild_args[@]}"

if [[ -n "$IDENTITY" ]]; then
  productbuild --package "$PKG_COMPONENT" --sign "$IDENTITY" "$PKG_FINAL"
else
  productbuild --package "$PKG_COMPONENT" "$PKG_FINAL"
fi

echo "Native macOS installer created: $PKG_FINAL"
