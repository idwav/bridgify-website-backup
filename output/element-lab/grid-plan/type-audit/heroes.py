#!/usr/bin/env python3
"""The page hero title (first visible h1) on every page at 1280 / 1440 / 1920, against --type-hero clamp(40px,3.6vw,60px)."""
import json, os
from playwright.sync_api import sync_playwright
PAGES = ['index-v2','api','marketplace','personalization','otas','airlines','hotels','loyalty-finance','super-apps',
         'travel-technology','developers','insights','press','about-us','careers','contact','demo','blog-infrastructure']
J = r"""() => { const h = [...document.querySelectorAll('h1')].find(e => e.getBoundingClientRect().width > 2 && getComputedStyle(e).visibility !== 'hidden'); if (!h) return null;
 const c = getComputedStyle(h); return {t: h.textContent.trim().replace(/\s+/g,' ').slice(0, 50), fam: c.fontFamily.split(',')[0].replace(/["']/g,''), size: +parseFloat(c.fontSize).toFixed(1), w: c.fontWeight,
 lh: +(parseFloat(c.lineHeight) / parseFloat(c.fontSize)).toFixed(2), ls: c.letterSpacing === 'normal' ? 0 : +(parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(3), color: c.color, lines: Math.round(h.getBoundingClientRect().height / parseFloat(c.lineHeight))}; }"""
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (1280, 1440, 1920):
        pg = b.new_page(viewport={'width': w, 'height': 900})
        for page in PAGES:
            pg.goto(f'http://127.0.0.1:8084/{page}.html?version=2', wait_until='networkidle', timeout=60000); pg.wait_for_timeout(500)
            out.setdefault(page, {})[w] = pg.evaluate(J)
        pg.close()
    b.close()
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'heroes.json'), 'w'), indent=1, ensure_ascii=False)
exp = {1280: 46.1, 1440: 51.8, 1920: 60}
for page, ws in out.items():
    print(page.ljust(20), ' '.join(f"{w}:{(r or {}).get('size')}{'' if r and abs(r['size']-exp[w])<.3 else '✗'}" for w, r in ws.items()), '|', (ws[1440] or {}).get('fam'), (ws[1440] or {}).get('w'), (ws[1440] or {}).get('lh'), (ws[1440] or {}).get('ls'), (ws[1440] or {}).get('color'), '|', (ws[1440] or {}).get('t'))
