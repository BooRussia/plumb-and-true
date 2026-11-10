#!/bin/sh
# Assembles the single-file site from src/. Usage: sh build.sh
set -e
cd "$(dirname "$0")"
frag=dist/plumb-and-true.html
mkdir -p dist
{
  cat src/head.html
  echo '<style>'; cat src/styles.css; echo '</style>'
  cat src/body.html
  echo '<script>'
  echo '(function () {'
  echo '"use strict";'
  echo 'if (!window.THREE) { document.getElementById("stage").insertAdjacentHTML("beforeend", "<p style=\"position:absolute;inset:40% 10% auto;text-align:center\">The 3D model could not load. Check your connection and reload.</p>"); return; }'
  cat src/core.js src/lib.js src/lib2.js src/doors1.js src/doors2.js src/app.js
  echo '})();'
  echo '</script>'
} > "$frag"
{
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<style>body{margin:0}[hidden]{display:none!important}</style>'
  cat "$frag"
  echo '</body></html>'
} > index.html
wc -c "$frag" index.html
