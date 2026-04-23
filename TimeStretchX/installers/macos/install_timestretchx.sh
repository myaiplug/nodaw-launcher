#!/usr/bin/env bash
set -euo pipefail

SOURCE_BUNDLE="${1:-}"
VST3_TARGET="/Library/Audio/Plug-Ins/VST3"
PLUGIN_NAME="Time Stretch X.vst3"

if [[ -z "$SOURCE_BUNDLE" ]]; then
  SOURCE_BUNDLE="$(cd "$(dirname "$0")/../.." && pwd)/build/TimeStretchX_artefacts/Release/VST3/$PLUGIN_NAME"
fi

if [[ ! -d "$SOURCE_BUNDLE" ]]; then
  echo "Source bundle not found: $SOURCE_BUNDLE" >&2
  exit 1
fi

sudo mkdir -p "$VST3_TARGET"
sudo rm -rf "$VST3_TARGET/$PLUGIN_NAME"
sudo cp -R "$SOURCE_BUNDLE" "$VST3_TARGET/$PLUGIN_NAME"

echo "Installed: $VST3_TARGET/$PLUGIN_NAME"
