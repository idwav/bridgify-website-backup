#!/bin/sh
# Every mapped page on the five reference phones (WebKit iPhones, Chromium iPhone 13 and Pixel 7). Prints one line per run
# and the deviations; exits 1 if any run fails. Usage: sh check-all.sh [page ...]
cd "$(dirname "$0")"
PAGES="${*:-index-v2 api marketplace personalization otas airlines hotels loyalty-finance travel-technology super-apps}"
fail=0
for p in $PAGES; do
  for d in "webkit|iPhone SE" "webkit|iPhone 13" "webkit|iPhone 15 Pro Max" "chromium|iPhone 13" "chromium|Pixel 7"; do
    e=${d%%|*}; dev=${d#*|}
    out=$(python3 check.py --page "$p" --engine "$e" --device "$dev" 2>&1) || fail=1
    echo "$out" | grep -E "issue\(s\)|  ✗|Error" | head -6
  done
done
exit $fail
