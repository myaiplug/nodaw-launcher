#!/usr/bin/env bash
set -euo pipefail

VERSION="1.0.0"
CONFIG="Release"
PROJECT_ROOT=""
CODESIGN_IDENTITY=""
ADHOC_SIGN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"; shift 2 ;;
    --config)
      CONFIG="$2"; shift 2 ;;
    --project-root)
      PROJECT_ROOT="$2"; shift 2 ;;
    --codesign-identity)
      CODESIGN_IDENTITY="$2"; shift 2 ;;
    --adhoc-sign)
      ADHOC_SIGN="true"; shift ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: ship_vst3_macos.sh [--version X.Y.Z] [--config Release] [--project-root /path/to/ClipIT] [--codesign-identity \"Developer ID Application: ...\"] [--adhoc-sign]" >&2
      exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -z "$PROJECT_ROOT" ]]; then
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

BUILD_DIR="$PROJECT_ROOT/build"
DIST_ROOT="$PROJECT_ROOT/dist"
TARGET="ClipIT_VST3"
VST_BUNDLE_NAME="Clip-IT.vst3"
SOURCE_VST3="$BUILD_DIR/ClipIT_artefacts/$CONFIG/VST3/$VST_BUNDLE_NAME"
RELEASE_NAME="Clip-IT-v${VERSION}-mac"
STAGE_DIR="$DIST_ROOT/$RELEASE_NAME"
ZIP_PATH="$DIST_ROOT/$RELEASE_NAME.zip"
STAGE_VST3="$STAGE_DIR/$VST_BUNDLE_NAME"

sign_bundle() {
  local bundle="$1"

  if [[ -n "$CODESIGN_IDENTITY" ]]; then
    echo "Signing bundle with identity: $CODESIGN_IDENTITY"
    codesign --force --deep --timestamp --options runtime --sign "$CODESIGN_IDENTITY" "$bundle"
    return
  fi

  if [[ "$ADHOC_SIGN" == "true" ]]; then
    echo "Applying ad-hoc signature"
    codesign --force --deep --sign - "$bundle"
  fi
}

hash_file() {
  local file="$1"
  shasum -a 256 "$file" | awk '{print $1}'
}

echo "[1/3] Building $TARGET ($CONFIG)..."
cmake --build "$BUILD_DIR" --config "$CONFIG" --target "$TARGET"

if [[ ! -d "$SOURCE_VST3" ]]; then
  echo "Built VST3 not found: $SOURCE_VST3" >&2
  exit 1
fi

echo "[2/3] Staging release..."
mkdir -p "$DIST_ROOT"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"

# Preserve bundle metadata/resource forks during copy.
ditto "$SOURCE_VST3" "$STAGE_VST3"

xattr -dr com.apple.quarantine "$STAGE_VST3" || true
sign_bundle "$STAGE_VST3"

rm -f "$ZIP_PATH"
(
  cd "$DIST_ROOT"
  ditto -c -k --sequesterRsrc --keepParent "$RELEASE_NAME" "$(basename "$ZIP_PATH")"
)

ZIP_HASH="$(hash_file "$ZIP_PATH")"
BUNDLE_HASH="$(hash_file "$STAGE_VST3/Contents/MacOS/Clip-IT")"

SHA_PATH="$DIST_ROOT/$RELEASE_NAME.sha256.txt"
JSON_PATH="$DIST_ROOT/$RELEASE_NAME.hashes.json"

{
  echo "$ZIP_HASH *$RELEASE_NAME.zip"
  echo "$BUNDLE_HASH *$RELEASE_NAME/$VST_BUNDLE_NAME/Contents/MacOS/Clip-IT"
} > "$SHA_PATH"

/usr/bin/python3 - <<PY
import json
from pathlib import Path

out = [
    {"file": "${RELEASE_NAME}.zip", "sha256": "${ZIP_HASH}"},
    {"file": "${RELEASE_NAME}/${VST_BUNDLE_NAME}/Contents/MacOS/Clip-IT", "sha256": "${BUNDLE_HASH}"}
]
Path("${JSON_PATH}").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
PY

echo "[3/3] Done"
echo "Staged: $STAGE_DIR"
echo "Zip:    $ZIP_PATH"
echo "SHA:    $SHA_PATH"
echo "JSON:   $JSON_PATH"
