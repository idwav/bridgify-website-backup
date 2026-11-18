#!/usr/bin/env python3
"""Copy the approved phone layer from the lab into the published `mobile/` folder.

The lab (output/element-lab/adaptive/) stays the one source: edit there, then run this. Vercel does not deploy
`output/`, so the live pages load their copy from `mobile/`.

  python3 scripts/sync-mobile.py                      # copy the shared files and every page listed in PAGES
  python3 scripts/sync-mobile.py --check              # fail if mobile/ differs from the lab (run before publishing)

A page is published only once it is listed in PAGES and its HTML links the layer (see mobile/load.js).
"""
import argparse, filecmp, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAB = os.path.join(ROOT, 'output', 'element-lab', 'adaptive')
OUT = os.path.join(ROOT, 'mobile')

# Pages whose phone layer is live. Add one at a time, after it has been checked on a phone.
PAGES = ['travel-technology', 'marketplace', 'personalization', 'loyalty-finance', 'api', 'otas', 'airlines', 'hotels', 'super-apps', 'index-v2', 'developers', 'about-us', 'contact', 'press', 'insights']

SHARED = {
    'tokens.css': 'system/tokens.css',
    'layout.css': 'layout.css',
    'patterns.css': 'patterns.css',
    'actions.css': 'system/actions.css',
    'patterns.js': 'patterns.js',
    'rhythm.js': 'system/rhythm.js',
}


def pairs():
    out = dict(SHARED)
    for p in PAGES:
        out[f'pages/{p}.css'] = f'pages/{p}.css'
        out[f'pages/{p}.js'] = f'pages/{p}.js'
        out[f'roles/{p}.js'] = f'system/roles/{p}.js'
    return [(os.path.join(LAB, src), os.path.join(OUT, dst)) for dst, src in out.items()]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); a = ap.parse_args()
    bad = []
    for src, dst in pairs():
        if not os.path.exists(src): bad.append(f'missing in lab: {os.path.relpath(src, ROOT)}'); continue
        if a.check:
            if not os.path.exists(dst) or not filecmp.cmp(src, dst, shallow=False): bad.append(f'out of date: {os.path.relpath(dst, ROOT)}')
        else:
            os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copyfile(src, dst)
    if bad: print('\n'.join(bad)); sys.exit(1)
    print(('mobile/ matches the lab' if a.check else 'copied to mobile/') + f' ({len(PAGES)} page(s): {", ".join(PAGES)})')


if __name__ == '__main__':
    main()
