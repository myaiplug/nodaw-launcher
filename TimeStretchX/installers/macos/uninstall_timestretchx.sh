#!/usr/bin/env bash
set -euo pipefail

VST3_TARGET="/Library/Audio/Plug-Ins/VST3/Time Stretch X.vst3"
AU_TARGET="/Library/Audio/Plug-Ins/Components/Time Stretch X.component"

sudo rm -rf "$VST3_TARGET"
sudo rm -rf "$AU_TARGET"

echo "Removed Time Stretch X plugin bundles"
