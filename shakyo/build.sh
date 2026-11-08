#!/usr/bin/env bash
# src/shakyo.html（アーティファクト用の中身）→ dist/ に単体で開ける HTML を作る
set -euo pipefail
cd "$(dirname "$0")"
VER=$(grep -o 'version: "[0-9.]*"' src/shakyo.html | head -1 | grep -o '[0-9.]*')
BUILD=$(date '+%Y-%m-%d %H:%M')
OUT="dist/usausa-shakyo-dojo_v${VER}.html"
sed "s/__BUILD__/${BUILD}/" src/shakyo.html > dist/artifact.html
{ printf '<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
  cat dist/artifact.html
  printf '\n</body>\n</html>\n'; } > "$OUT"
echo "$OUT"
