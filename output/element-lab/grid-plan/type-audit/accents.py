#!/usr/bin/env python3
"""Coral ink in titles (DESIGN.md §5 .v2-ink), desktop 1440, motion on: what each emphasised word in a hero/section
title is painted with, grouped against the two approved inks (dark / cream). Writes accents.json."""
import json, os
from playwright.sync_api import sync_playwright
PAGES = ['index-v2','api','marketplace','personalization','otas','airlines','hotels','loyalty-finance','super-apps',
         'travel-technology','developers','insights','press','about-us','careers','contact','demo','blog-infrastructure']
DARK = 'linear-gradient(110deg, rgb(244, 102, 73) 0%, rgb(255, 150, 123) 23%, rgb(255, 226, 198) 43%, rgb(248, 139, 114) 60%, rgb(244, 102, 73) 78%, rgb(255, 180, 154) 100%)'
CREAM = 'linear-gradient(110deg, rgb(207, 63, 37) 0%, rgb(229, 87, 58) 30%, rgb(232, 96, 63) 50%, rgb(217, 72, 44) 72%, rgb(207, 63, 37) 100%)'
J = r"""() => { const bg = e => { for (let a = e; a; a = a.parentElement) { const c = getComputedStyle(a).backgroundColor; const m = c.match(/\d+(\.\d+)?/g); if (m && (m.length < 4 || +m[3] > .5)) return (+m[0] + +m[1] + +m[2]) / 3 > 128 ? 'cream' : 'dark'; } return 'dark'; };
 return [...document.querySelectorAll('h1, h2')].filter(h => h.getBoundingClientRect().width > 2 && !h.closest('nav,footer,.bf-footer,[class*=window],[class*=mock]')).flatMap(h =>
  [...h.querySelectorAll('em,span,strong,b,i')].filter(x => x.textContent.trim() && x.getBoundingClientRect().width > 2).map(x => { const c = getComputedStyle(x);
   const g = (c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text') && c.backgroundImage !== 'none' ? c.backgroundImage : '';
   return {sec: (h.closest('section') || {}).id || '', t: x.textContent.trim().slice(0, 30), on: bg(h), ink: g || 'flat ' + c.color, w: c.fontWeight, cls: String(x.className)}; })); }"""
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900})
    for page in PAGES:
        pg.goto(f'http://127.0.0.1:8084/{page}.html?version=2', wait_until='networkidle', timeout=60000); pg.wait_for_timeout(800)
        out[page] = pg.evaluate(J)
    b.close()
for page, rows in out.items():
    for r in rows: r['ok'] = r['ink'] == (DARK if r['on'] == 'dark' else CREAM)
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'accents.json'), 'w'), indent=1, ensure_ascii=False)
tot = sum(len(v) for v in out.values()); ok = sum(r['ok'] for v in out.values() for r in v)
print(f'{ok}/{tot} title accents use the approved ink')
for page, rows in out.items():
    bad = [r for r in rows if not r['ok']]
    print(page, f"{len(rows)-len(bad)}/{len(rows)}", ' | '.join(f"{r['sec']} “{r['t'][:22]}” {r['on']}: {r['ink'][:70]}" for r in bad[:4]))
