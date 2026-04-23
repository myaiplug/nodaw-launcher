#!/usr/bin/env bash
set -euo pipefail

VERSION=""
CONFIG="Release"
CODESIGN_IDENTITY=""
ADHOC_SIGN="false"
SKIP_INSTALLER_BUNDLE="false"
SKIP_NATIVE_INSTALLER="false"
PKG_SIGN_IDENTITY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"; shift 2 ;;
    --config)
      CONFIG="$2"; shift 2 ;;
    --codesign-identity)
      CODESIGN_IDENTITY="$2"; shift 2 ;;
    --adhoc-sign)
      ADHOC_SIGN="true"; shift ;;
    --skip-installer-bundle)
      SKIP_INSTALLER_BUNDLE="true"; shift ;;
    --skip-native-installer)
      SKIP_NATIVE_INSTALLER="true"; shift ;;
    --pkg-sign-identity)
      PKG_SIGN_IDENTITY="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: release.sh --version X.Y.Z [--config Release] [--codesign-identity \"Developer ID Application: ...\"] [--adhoc-sign] [--skip-installer-bundle] [--skip-native-installer] [--pkg-sign-identity \"Developer ID Installer: ...\"]" >&2
      exit 1 ;;
  esac
done

if [[ -z "$VERSION" ]]; then
  echo "--version is required" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHIP_SCRIPT="$SCRIPT_DIR/installers/macos/ship_vst3_macos.sh"
BUNDLE_SCRIPT="$SCRIPT_DIR/installers/macos/create_installer_bundle.sh"
PKG_SCRIPT="$SCRIPT_DIR/installers/macos/create_pkg_installer.sh"

if [[ ! -f "$SHIP_SCRIPT" ]]; then
  echo "Missing ship script: $SHIP_SCRIPT" >&2
  exit 1
fi

if [[ ! -f "$BUNDLE_SCRIPT" ]]; then
  echo "Missing bundle script: $BUNDLE_SCRIPT" >&2
  exit 1
fi

if [[ ! -f "$PKG_SCRIPT" ]]; then
  echo "Missing native installer script: $PKG_SCRIPT" >&2
  exit 1
fi

echo "[1/2] Building and packaging macOS VST3 release..."
SHIP_ARGS=(--version "$VERSION" --config "$CONFIG" --project-root "$SCRIPT_DIR")

if [[ -n "$CODESIGN_IDENTITY" ]]; then
  SHIP_ARGS+=(--codesign-identity "$CODESIGN_IDENTITY")
fi

if [[ "$ADHOC_SIGN" == "true" ]]; then
  SHIP_ARGS+=(--adhoc-sign)
fi

bash "$SHIP_SCRIPT" "${SHIP_ARGS[@]}"

if [[ "$SKIP_INSTALLER_BUNDLE" != "true" ]]; then
  echo "[2/3] Creating macOS installer bundle..."
  bash "$BUNDLE_SCRIPT" "$VERSION"
else
  echo "[2/3] Skipped installer bundle creation by request."
fi

if [[ "$SKIP_NATIVE_INSTALLER" != "true" ]]; then
  echo "[3/3] Creating native macOS installer (.pkg)..."
  PKG_ARGS=(--version "$VERSION")
  if [[ -n "$PKG_SIGN_IDENTITY" ]]; then
    PKG_ARGS+=(--sign-identity "$PKG_SIGN_IDENTITY")
  fi
  bash "$PKG_SCRIPT" "${PKG_ARGS[@]}"
else
  echo "[3/3] Skipped native installer creation by request."
fi

echo "Release complete. Artifacts are in dist/."
echo "Note: For Windows packaging, run ./release.ps1 on Windows."
