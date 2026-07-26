#!/usr/bin/env bash
# Resize + convert heavy portfolio media to WebP for faster mobile/desktop loads.
# Always -auto-orient before -strip so phone EXIF rotation is baked into pixels.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Recs covers → 400w WebP"
mkdir -p public/images/recs
shopt -s nullglob
for f in public/images/recs/*.{png,jpg,jpeg}; do
  base="$(basename "$f")"
  name="${base%.*}"
  out="public/images/recs/${name}.webp"
  magick "$f" -auto-orient -strip -resize '400x>' -quality 78 "$out"
  echo "  $base → $(du -h "$out" | cut -f1)"
done

echo "==> Blog covers → 1400w WebP (+ compressed JPEG fallback)"
# Prefer untouched original for firstPost when present (safe re-orient)
FIRST_SRC="src/assets/firstPost.jpg"
[ -f "$FIRST_SRC" ] || FIRST_SRC="public/images/firstPost.jpg"
for entry in \
  "public/images/firstPost.jpg|$FIRST_SRC" \
  "public/images/moloch's-bargin.jpeg|public/images/moloch's-bargin.jpeg" \
  "public/images/aiblog-image.jpeg|public/images/aiblog-image.jpeg"
do
  f="${entry%%|*}"
  src="${entry##*|}"
  [ -f "$src" ] || continue
  base="$(basename "$f")"
  name="${base%.*}"
  out="public/images/${name}.webp"
  magick "$src" -auto-orient -strip -resize '1400x>' -quality 80 "$out"
  if [[ "$f" == *.jpg || "$f" == *.jpeg ]]; then
    magick "$src" -auto-orient -strip -resize '1400x>' -quality 82 "$f"
  fi
  echo "  $base → $(du -h "$out" | cut -f1) / jpeg $(du -h "$f" | cut -f1)"
done

echo "==> Project covers in public/images/projects"
for f in public/images/projects/*.{png,jpg,jpeg}; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  name="${base%.*}"
  out="public/images/projects/${name}.webp"
  magick "$f" -auto-orient -strip -resize '1200x>' -quality 80 "$out"
  magick "$f" -auto-orient -strip -resize '1200x>' -quality 82 "$f"
  echo "  $base → $(du -h "$out" | cut -f1)"
done

echo "==> Bundled project logos → WebP (+ shrink PNG)"
for f in src/assets/anidojo-logo.png src/assets/dal-gazette-logo.png src/assets/emotif.png; do
  [ -f "$f" ] || continue
  base="$(basename "$f")"
  name="${base%.*}"
  out="src/assets/${name}.webp"
  magick "$f" -auto-orient -strip -resize '1000x>' -quality 80 "$out"
  magick "$f" -auto-orient -strip -resize '1000x>' -quality 82 "$f"
  echo "  $base → $(du -h "$out" | cut -f1) / png $(du -h "$f" | cut -f1)"
done

echo "==> Photo thumbs (480w) + lightbox (1600w WebP)"
mkdir -p src/assets/photos/thumbs
for f in src/assets/photos/*.{jpg,jpeg,JPG,JPEG}; do
  [ -e "$f" ] || continue
  [[ "$f" == */thumbs/* ]] && continue
  base="$(basename "$f")"
  name="${base%.*}"
  thumb="src/assets/photos/thumbs/${name}.webp"
  full="src/assets/photos/${name}.webp"
  magick "$f" -auto-orient -strip -resize '480x>' -quality 75 "$thumb"
  magick "$f" -auto-orient -strip -resize '1600x>' -quality 82 "$full"
  echo "  $base → thumb $(du -h "$thumb" | cut -f1), full $(du -h "$full" | cut -f1)"
done

echo "==> Done"
du -sh public/images/recs src/assets/photos src/assets/photos/thumbs public/images/firstPost.jpg 2>/dev/null || true
