#!/usr/bin/env bash
set -euo pipefail

VERSION="1.0.0"
SKIP_NATIVE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --skip-native-installer)
      SKIP_NATIVE="true"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "[1/4] Building TimeStretchX Release..."
cmake --build build --config Release --target TimeStretchX_VST3

echo "[2/4] Creating macOS zip..."
mkdir -p dist
ZIP_ROOT="dist/TimeStretchX-v${VERSION}-macos"
rm -rf "$ZIP_ROOT"
mkdir -p "$ZIP_ROOT"
cp -R "build/TimeStretchX_artefacts/Release/VST3/Time Stretch X.vst3" "$ZIP_ROOT/"
if [[ -d "build/TimeStretchX_artefacts/Release/AU/Time Stretch X.component" ]]; then
  cp -R "build/TimeStretchX_artefacts/Release/AU/Time Stretch X.component" "$ZIP_ROOT/"
fi
(cd dist && zip -rq "TimeStretchX-v${VERSION}-macos.zip" "TimeStretchX-v${VERSION}-macos")

if [[ "$SKIP_NATIVE" != "true" ]]; then
  echo "[3/4] Creating PKG installer..."
  ./installers/macos/create_pkg_installer.sh "$VERSION"
fi

echo "[4/4] Release artifacts generated"
