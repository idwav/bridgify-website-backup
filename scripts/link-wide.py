#!/usr/bin/env python3
"""Link the tablet + desktop layer (wide/) into the site's pages, the way mobile/ is linked for phones.

  python3 scripts/link-wide.py            # write the wide/ block into every page in PAGES
  python3 scripts/link-wide.py --check    # fail if a page's block is missing or out of date

Every page gets the shared files (step 6.1). A page listed in OWN also gets the approved content line (grid.css),
its split headings and its own baked layer (wide/pages/<page>.css/.js); that happens in the page's own step (6.2–6.5),
after a check and the owner's approval. All links carry media="(min-width:600px)", so phones (≤599) load nothing new.
index.html (Version 1) is never linked.
"""
import argparse, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = '15'
PAGES = ['index-v2', 'api', 'marketplace', 'personalization', 'otas', 'airlines', 'hotels', 'loyalty-finance',
         'super-apps', 'travel-technology', 'developers', 'insights', 'press', 'about-us', 'careers', 'contact']
SHARED = ['interim.css', 'tokens.css', 'type.css', 'header.css', 'buttons.css', 'shared.css']
OWN = {'index-v2': True, 'api': True, 'marketplace': True, 'personalization': True,
       'otas': True, 'airlines': True, 'hotels': True, 'loyalty-finance': True, 'super-apps': True, 'travel-technology': True}   # page: True once its own step is approved (adds grid.css, split.css, pages/<page>.css and .js)
START, END = '<!-- wide: tablet + desktop layer -->', '<!-- /wide -->'


def block(page):
    files = list(SHARED)
    if OWN.get(page):
        files += ['grid.css', 'split.css', f'pages/{page}.css']
    links = ''.join(f'<link rel="stylesheet" href="wide/{f}?v={V}" media="(min-width:600px)">' for f in files)
    js = f'pages/{page}.js'
    if OWN.get(page) and os.path.exists(os.path.join(ROOT, 'wide', js)):
        links += f'<script src="wide/{js}?v={V}" defer></script>'
    return START + links + END


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); a = ap.parse_args()
    bad = []
    for page in PAGES:
        p = os.path.join(ROOT, f'{page}.html'); s = open(p, encoding='utf-8').read()
        want = block(page)
        cur = re.search(re.escape(START) + '.*?' + re.escape(END), s, re.S)
        if a.check:
            if not cur or cur.group(0) != want: bad.append(f'out of date: {page}.html')
            continue
        s = s.replace(cur.group(0), want) if cur else s.replace('</head>', want + '</head>', 1)
        open(p, 'w', encoding='utf-8').write(s)
    if bad: print('\n'.join(bad)); sys.exit(1)
    print(('wide/ links are current' if a.check else 'linked wide/') + f' ({len(PAGES)} pages)')


if __name__ == '__main__':
    main()
