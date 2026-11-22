#!/bin/bash
# Opens one page of the site on 5 screens at once: phone, iPad upright, iPad Pro upright, iPad on its side, desktop.
#   Double-click it in Finder (opens the home page), or:  bash scripts/qa/open-preview.command hotels
# Uses a local server for this folder: reuses one that already serves it, otherwise starts one on the first free port
# from 8765 (a port another app is using is skipped), then opens the browser.
cd "$(dirname "$0")/../.." || exit 1
PAGE="${1:-index-v2}"
ME="scripts/qa/preview.html"
serves_us() { curl -s --max-time 2 "http://localhost:$1/$ME" 2>/dev/null | cmp -s - "$ME"; }
PORT=""
for p in $(seq 8765 8785); do
  if lsof -iTCP:$p -sTCP:LISTEN >/dev/null 2>&1; then
    serves_us $p && { PORT=$p; break; }
  else
    nohup python3 -m http.server $p --bind 127.0.0.1 >/dev/null 2>&1 &
    for i in $(seq 1 25); do serves_us $p && break; sleep 0.2; done
    serves_us $p && { PORT=$p; break; }
  fi
done
[ -z "$PORT" ] && { echo "No free port between 8765 and 8785."; exit 1; }
URL="http://localhost:$PORT/$ME?page=$PAGE"
open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null
echo "Every screen at once: $URL"
