#!/usr/bin/env bash
# Create a small offline-first bundle for the site or Android WebView.
set -euo pipefail
if [ "$#" -lt 1 ]; then echo "Usage: bash scripts/package-little-46.sh dist|android/app/src/main/assets" >&2; exit 2; fi
dest="$1"
case "$dest" in
  dist|android/app/src/main/assets) ;;
  *) echo "Choose dist or android/app/src/main/assets" >&2; exit 2 ;;
esac
rm -rf "$dest"
mkdir -p "$dest/assets/scenes"
cp index.html little-46.css little-46.js little-46-data.js service-worker.js manifest.webmanifest "$dest/"
cp assets/icon.svg assets/icon-192.png assets/icon-512.png "$dest/assets/"
cp assets/scenes/little-garden.svg "$dest/assets/scenes/"
echo "Bundled Little Learners 4–6 into $dest"
du -sh "$dest"
