#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: create_installer_bundle.sh <version>" >&2
  exit 1
fi

VERSION="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_ROOT="$PROJECT_ROOT/dist"
SOURCE_ZIP="$DIST_ROOT/Clip-IT-v${VERSION}-mac.zip"

if [[ ! -f "$SOURCE_ZIP" ]]; then
  echo "Source package not found: $SOURCE_ZIP" >&2
  exit 1
fi

BUNDLE_DIR="$DIST_ROOT/Clip-IT-Installer-macOS-v${VERSION}"
rm -rf "$BUNDLE_DIR"
mkdir -p "$BUNDLE_DIR"

cp "$SOURCE_ZIP" "$BUNDLE_DIR/"
cp "$SCRIPT_DIR/install_clipit.sh" "$BUNDLE_DIR/"
chmod +x "$BUNDLE_DIR/install_clipit.sh"

cat > "$BUNDLE_DIR/README_INSTALL.txt" <<EOF
Clip-IT macOS Installer Bundle

System install:
  ./install_clipit.sh --source ./Clip-IT-v${VERSION}-mac.zip --system

User install:
  ./install_clipit.sh --source ./Clip-IT-v${VERSION}-mac.zip --user
EOF

ARCHIVE="$BUNDLE_DIR.zip"
rm -f "$ARCHIVE"
cd "$DIST_ROOT"
zip -r "$(basename "$ARCHIVE")" "$(basename "$BUNDLE_DIR")" >/dev/null

echo "Installer bundle folder: $BUNDLE_DIR"
echo "Installer bundle zip:    $ARCHIVE"
