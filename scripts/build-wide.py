#!/usr/bin/env python3
"""Build the published tablet + desktop layer (`wide/`) from the lab (output/element-lab/grid-plan/).

The lab stays the one source, as for the phone layer (scripts/sync-mobile.py). The difference: on tablet and desktop
nothing is computed while the page runs. The spacing engine (rhythm-wide.js) and the split-heading offset
(split-align.js) run here, once per page and per device class, in a headless browser; what they set is written out
as plain CSS. Re-spacing at run time made the page jump while scrolling (SPACING-GRID-PLAN.md, step 4).

  python3 scripts/build-wide.py              # rebuild wide/ for every page in PAGES (needs the dev server on :8084)
  python3 scripts/build-wide.py --check      # fail if wide/ differs from a fresh build (run before publishing)

Output:
  wide/grid.css · tokens.css · type.css · header.css · split.css     shared
  wide/interim.css · buttons.css · shared.css                        shared (step 6.1; interim.css goes after 6.5)
  wide/pages/<page>.css                                              the page's layer + its baked spacing
  wide/pages/<page>.js                                               only where a page needs geometry (hero visuals)
A page is published only once its HTML links these files with media="(min-width:600px)" (see SPACING-GRID-PLAN.md,
"Publishing a page"). Linking nothing changes nothing: this build alone has no visible effect.
"""
import argparse, filecmp, json, os, shutil, sys, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAB = os.path.join(ROOT, 'output', 'element-lab', 'grid-plan')
OUT = os.path.join(ROOT, 'wide')
BASE = 'http://127.0.0.1:8084/'

SHARED = {'grid.css': 'grid-vars.css', 'tokens.css': 'tokens-wide.css', 'type.css': 'type-wide.css',
          'header.css': 'header-compact.css', 'split.css': 'split-align.css',
          'interim.css': 'line-interim.css', 'buttons.css': 'buttons-wide.css', 'shared.css': 'shared-wide.css'}
# title ink and font faces (19 Nov 2026): one lab file, baked after each page's own layers
INK = 'ink-fonts.css'
# page: (url, role map, page layers in order, split pairs, page script)
PAGES = {
    'index-v2': ('index-v2.html?version=2', 'roles-index-v2.js', ['home-trial.css', 'tablet-hero.css', 'hero-portrait.css'],
                 None, 'hero-portrait.js'),
    'api': ('api.html?version=2', 'roles-api.js', ['api-trial.css'],
            [['#whats-inside', 'h2', 'header.ex-head > p'], ['#api-features', 'h2', 'header.ck-head > p']], None),
    'marketplace': ('marketplace.html?version=2', 'roles-marketplace.js', ['marketplace-trial.css'],
                    [['#section-2', 'h2.tour-title', 'header > p'], ['#section-3', 'h2', 'header.wl-heading > p'], ['#section-4', '#commerce-title', 'header.wo-heading > p'], ['#section-5', 'h2', 'div.launch-heading > p'], ['#build-or-buy', 'h2', 'header.bc-heading > p']], None),
    'personalization': ('personalization.html?version=2', 'roles-personalization.js', ['personalization-trial.css'], [['#section-2', 'h2', 'div.intent-heading > p'], ['#section-4', 'h2', 'div.embed-heading > p']], 'personalization-hero.js'),
    # step 6.5: the six solution pages
    'otas': ('otas.html?version=2', 'roles-otas.js', ['otas-trial.css'], [['#section-3', 'h2', 'header.rc-head > div']], None),
    'airlines': ('airlines.html?version=2', 'roles-airlines.js', ['airlines-trial.css'], [['#section-2', 'h2', 'header.ar-heading > p'], ['#section-4', 'h2', 'header.xc-head > p']], 'airlines-pin.js'),
    'hotels': ('hotels.html?version=2', 'roles-hotels.js', ['hotels-trial.css'], [['#section-1', 'h1', 'div.hm-intro'], ['#section-4', 'h2', 'header.xc-head > p']], None),
    'loyalty-finance': ('loyalty-finance.html?version=2', 'roles-loyalty-finance.js', ['loyalty-finance-trial.css'], [['#section-2', 'h2', 'header > div.lp-copy']], None),
    'super-apps': ('super-apps.html?version=2', 'roles-super-apps.js', ['super-apps-trial.css'], [['#section-4', 'h2', 'header.xc-head > p']], None),
    'travel-technology': ('travel-technology.html?version=2', 'roles-travel-technology.js', ['travel-technology-trial.css'], [['#section-1', 'h1', 'div.te-intro'], ['#section-4', 'h2', 'header.xc-head > p']], None),
}
# Each device class is baked at several widths, because a page's own layout changes inside a class (a section that
# stacks below 800, a grid that gains a column at 1280). A value that is the same at every width of a class is written
# once for the class; a value that differs is written for the width band its sample stands for.
CLASSES = [('(min-width: 600px) and (max-width: 1023px)', [(768, 1024, 600, 800), (834, 1194, 801, 1023)]),
           ('(min-width: 1024px)', [(1024, 768, 1024, 1151), (1280, 800, 1152, 1359), (1440, 900, 1360, 1679), (1920, 1080, 1680, None)])]
PROPS = ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'border-top-width', 'row-gap', 'column-gap',
         'display', 'width', 'flex-direction', 'align-items', 'align-content', 'justify-content', 'margin-left', 'margin-right']

R = lambda n: open(os.path.join(LAB, n)).read()

SNAP = r"""() => { window.__bfSnap = new Map(); document.querySelectorAll('body *').forEach(e => window.__bfSnap.set(e, e.getAttribute('style') || '')); }"""
DIFF = r"""(props) => {
  // a unique path for an element: from the nearest ancestor with an id, by child position
  const path = el => { const parts = []; let e = el;
    while (e && e !== document.body) { if (e.id && document.querySelectorAll('#' + CSS.escape(e.id)).length === 1) { parts.unshift('#' + CSS.escape(e.id)); break; }
      const i = [...e.parentElement.children].indexOf(e) + 1; parts.unshift(`${e.tagName.toLowerCase()}:nth-child(${i})`); e = e.parentElement; }
    return parts.join(' > '); };
  const out = [];
  document.querySelectorAll('body *').forEach(e => { const before = window.__bfSnap.get(e) || ''; const now = e.getAttribute('style') || ''; if (now === before) return;
    const set = props.filter(p => e.style.getPropertyPriority(p) === 'important').map(p => [p, e.style.getPropertyValue(p)]);
    if (set.length) out.push([path(e), set]); });
  return out; }"""


def bake(b, page, cfg):
    url, roles, layers, pairs, _ = cfg
    css = [R('grid-vars.css'), R('header-compact.css'), R('type-wide.css'), R('tokens-wide.css'), R('buttons-wide.css'), R('shared-wide.css'), R('split-align.css')] + [R(l) for l in layers] + [R(INK)]
    js = R(roles) + '\n' + R('rhythm-wide.js')
    sj = (f'window.BridgifySplitPairs = {json.dumps(pairs)};\n' if pairs else '') + R('split-align.js')
    blocks = []
    for media, samples in CLASSES:
        per = []   # [(lo, hi, {selector: {prop: value}})]
        for w, h, lo, hi in samples:
            pg = b.new_page(viewport={'width': w, 'height': h}, reduced_motion='reduce')
            # bake against the page without its published layer: once a page links wide/, the previous build would
            # otherwise be in the page while it is measured, and a wrong earlier value could carry into the new one
            pg.route('**/wide/**', lambda route: route.abort())
            pg.goto(BASE + url, wait_until='networkidle', timeout=60000)
            for c in css: pg.add_style_tag(content=c)
            pg.evaluate("async () => { await document.fonts.ready; for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 500)); }")
            pg.evaluate(SNAP)
            pg.add_script_tag(content=js); pg.add_script_tag(content=sj)
            pg.evaluate("async () => { await new Promise(r => setTimeout(r, 300)); BridgifyRhythmWide.apply(); await new Promise(r => setTimeout(r, 300)); if (window.BridgifySplit) { BridgifySplit.apply(); await new Promise(r => setTimeout(r, 200)); /* the split moves the intro down to the title: space what follows it again */ BridgifyRhythmWide.apply(); await new Promise(r => setTimeout(r, 300)); BridgifySplit.apply(); } await new Promise(r => setTimeout(r, 200)); }")
            rows = pg.evaluate(DIFF, PROPS); pg.close()
            per.append((lo, hi, {sel: dict(decl) for sel, decl in rows}))
            print(f'  {page} @{w}: {len(rows)} elements', file=sys.stderr)
        sels = list(dict.fromkeys(sel for _, _, d in per for sel in d))
        common, bands = [], {i: [] for i in range(len(per))}
        for sel in sels:
            props = list(dict.fromkeys(p for _, _, d in per for p in d.get(sel, {})))
            same = {p: per[0][2].get(sel, {}).get(p) for p in props if all(d.get(sel, {}).get(p) == per[0][2].get(sel, {}).get(p) for _, _, d in per)}
            if same and all(v is not None for v in same.values()): common.append((sel, same))
            for i, (_, _, d) in enumerate(per):
                rest = {p: v for p, v in d.get(sel, {}).items() if p not in same}
                if rest: bands[i].append((sel, rest))
        rule = lambda sel, decl: f'  html body {sel} {{ ' + ' '.join(f'{p}: {v} !important;' for p, v in decl.items()) + ' }'
        blocks.append(f'@media {media} {{\n' + '\n'.join(rule(*r) for r in common) + '\n}')
        for i, (lo, hi, _) in enumerate(per):
            if not bands[i]: continue
            q = f'(min-width: {lo}px)' + (f' and (max-width: {hi}px)' if hi else '')
            blocks.append(f'@media {q} {{\n' + '\n'.join(rule(*r) for r in bands[i]) + '\n}')
    return blocks


def build(dest, only=None):
    os.makedirs(os.path.join(dest, 'pages'), exist_ok=True)
    for dst, src in SHARED.items():
        shutil.copyfile(os.path.join(LAB, src), os.path.join(dest, dst))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for page, cfg in PAGES.items():
            if only and page not in only: continue
            head = f'/* Bridgify tablet + desktop layer · {page} · built by scripts/build-wide.py from output/element-lab/grid-plan/. Do not edit; edit the lab and rebuild. */\n'
            body = '\n'.join(f'/* ---- {l} ---- */\n' + R(l) for l in cfg[2] + [INK])
            baked = '\n'.join(bake(b, page, cfg))
            open(os.path.join(dest, 'pages', f'{page}.css'), 'w').write(head + body + '\n/* ---- spacing and split headings, baked from rhythm-wide.js and split-align.js ---- */\n' + baked + '\n')
            if cfg[4]: shutil.copyfile(os.path.join(LAB, cfg[4]), os.path.join(dest, 'pages', f'{page}.js'))
        b.close()


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true')
    ap.add_argument('--only', help='comma-separated pages to rebuild (while working on them; run a full build before publishing)')
    a = ap.parse_args()
    if not a.check:
        only = a.only.split(',') if a.only else None
        build(OUT, only); print(f'built wide/ ({", ".join(only or PAGES)})'); return
    tmp = tempfile.mkdtemp(); build(tmp)
    bad = []
    for r, _, fs in os.walk(tmp):
        for f in fs:
            n = os.path.relpath(os.path.join(r, f), tmp); o = os.path.join(OUT, n)
            if not os.path.exists(o) or not filecmp.cmp(os.path.join(r, f), o, shallow=False): bad.append(f'out of date: wide/{n}')
    shutil.rmtree(tmp)
    if bad: print('\n'.join(bad)); sys.exit(1)
    print('wide/ matches the lab')


if __name__ == '__main__':
    main()
