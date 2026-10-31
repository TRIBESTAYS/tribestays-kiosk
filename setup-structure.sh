#!/usr/bin/env bash
# Creates the TribeStays kiosk files that `npm create vite --template react` doesn't.
# Usage (from the project root):
#   bash setup-structure.sh           create missing folders and empty files
#   bash setup-structure.sh --clean   same, and also remove Vite's demo files
set -euo pipefail

if [[ ! -f package.json || ! -f vite.config.js ]]; then
  echo "Run this from the Vite project root (the folder with package.json and vite.config.js)." >&2
  exit 1
fi

dirs=(
  src/lib
  src/hooks
  src/components
)

files=(
  vercel.json
  .env.example
  src/data.js
  src/lib/confetti.js
  src/hooks/useCarousel.js
  src/hooks/useLayout.js
  src/components/icons.jsx
  src/components/Background.jsx
  src/components/Header.jsx
  src/components/Nav.jsx
  src/components/EventCard.jsx
  src/components/FeaturedPanel.jsx
  src/components/Keypad.jsx
  src/components/ScanAll.jsx
  src/components/RegisterSheet.jsx
)

mkdir -p "${dirs[@]}"

for f in "${files[@]}"; do
  if [[ -e "$f" ]]; then
    echo "skip     $f (already exists)"
  else
    touch "$f"
    echo "created  $f"
  fi
done

if [[ "${1:-}" == "--clean" ]]; then
  rm -f src/App.css src/assets/react.svg public/vite.svg
  rmdir src/assets 2>/dev/null || true
  echo "removed  Vite demo files (src/App.css, src/assets/react.svg, public/vite.svg)"
fi

[[ -f public/logo.jpg ]]    || echo "reminder: add public/logo.jpg"
[[ -f public/favicon.ico ]] || echo "reminder: add public/favicon.ico"

echo
echo "Done. Also replace the contents of these existing Vite files:"
echo "  index.html, vite.config.js, src/main.jsx, src/App.jsx, src/index.css"