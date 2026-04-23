#!/usr/bin/env bash
set -euo pipefail

SOURCE=""
MODE="system"
ADHOC_SIGN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE="$2"; shift 2 ;;
    --system)
      MODE="system"; shift ;;
    --user)
      MODE="user"; shift ;;
    --adhoc-sign)
      ADHOC_SIGN="true"; shift ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1 ;;
  esac
done

if [[ -z "$SOURCE" ]]; then
  echo "Usage: install_clipit.sh --source <zip|Clip-IT.vst3> [--system|--user] [--adhoc-sign]" >&2
  exit 1
fi

if [[ ! -e "$SOURCE" ]]; then
  echo "Source not found: $SOURCE" >&2
  exit 1
fi

TMPDIR_CLIPIT="$(mktemp -d)"
cleanup() {
  rm -rf "$TMPDIR_CLIPIT"
}
trap cleanup EXIT

resolve_bundle() {
  local src="$1"
  if [[ "$src" == *.vst3 ]]; then
    echo "$src"
    return
  fi

  if [[ "$src" == *.zip ]]; then
    ditto -x -k "$src" "$TMPDIR_CLIPIT"
    local found
    found="$(find "$TMPDIR_CLIPIT" -type d -name "Clip-IT.vst3" | head -n 1 || true)"
    if [[ -z "$found" ]]; then
      echo "Clip-IT.vst3 not found in archive." >&2
      exit 1
    fi
    echo "$found"
    return
  fi

  echo "Unsupported source format. Use .zip or .vst3" >&2
  exit 1
}

BUNDLE_PATH="$(resolve_bundle "$SOURCE")"

if [[ "$MODE" == "system" ]]; then
  TARGET_ROOT="/Library/Audio/Plug-Ins/VST3"
else
  TARGET_ROOT="$HOME/Library/Audio/Plug-Ins/VST3"
fi

TARGET_PATH="$TARGET_ROOT/Clip-IT.vst3"

if [[ "$MODE" == "system" ]]; then
  sudo mkdir -p "$TARGET_ROOT"
  if [[ -d "$TARGET_PATH" ]]; then
    sudo rm -rf "$TARGET_PATH"
  fi
  sudo cp -R "$BUNDLE_PATH" "$TARGET_PATH"
  sudo xattr -dr com.apple.quarantine "$TARGET_PATH" || true
  if [[ "$ADHOC_SIGN" == "true" ]]; then
    sudo codesign --force --deep --sign - "$TARGET_PATH"
  fi
else
  mkdir -p "$TARGET_ROOT"
  if [[ -d "$TARGET_PATH" ]]; then
    rm -rf "$TARGET_PATH"
  fi
  cp -R "$BUNDLE_PATH" "$TARGET_PATH"
  xattr -dr com.apple.quarantine "$TARGET_PATH" || true
  if [[ "$ADHOC_SIGN" == "true" ]]; then
    codesign --force --deep --sign - "$TARGET_PATH"
  fi
fi

echo "Clip-IT installed to: $TARGET_PATH"
echo "Rescan plugins in your DAW."
