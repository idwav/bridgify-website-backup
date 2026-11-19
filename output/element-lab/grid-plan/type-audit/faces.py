#!/usr/bin/env python3
"""Which font face each visible text really uses on desktop (1440), per page: the family alias, the weight asked for,
and whether a face with that weight exists (else the browser synthesizes bold = blurry, heavier text). Writes faces.json."""
import json, os
from playwright.sync_api import sync_playwright
PAGES = ['index-v2','api','marketplace','personalization','otas','airlines','hotels','loyalty-finance','super-apps',
         'travel-technology','developers','insights','press','about-us','careers','contact','demo','blog-infrastructure']
J = r"""async () => { await document.fonts.ready;
const faces = [...document.fonts].filter(f => f.status === 'loaded').map(f => ({fam: f.family.replace(/["']/g,''), w: f.weight}));
const has = (fam, w) => faces.some(f => f.fam === fam && (f.w.includes(' ') ? (+w >= +f.w.split(' ')[0] && +w <= +f.w.split(' ')[1]) : f.w === String(w)));
const m = {};
document.querySelectorAll('body *').forEach(e => { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
  const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return; const c = getComputedStyle(e); if (c.visibility === 'hidden') return;
  const fam = c.fontFamily.split(',')[0].replace(/["']/g,'').trim(); const w = c.fontWeight;
  const k = fam + ' ' + w + (has(fam, w) ? '' : (faces.some(f => f.fam === fam) ? ' SYNTH' : ' MISSING'));
  (m[k] = m[k] || {n: 0, ex: []}).n++; if (m[k].ex.length < 3) m[k].ex.push(e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' “' + e.textContent.trim().slice(0, 28) + '”'); });
return m; }"""
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900})
    for page in PAGES:
        pg.goto(f'http://127.0.0.1:8084/{page}.html?version=2', wait_until='networkidle', timeout=60000); pg.wait_for_timeout(800)
        out[page] = pg.evaluate(J)
    b.close()
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'faces.json'), 'w'), indent=1, ensure_ascii=False)
for page, m in out.items():
    bad = {k: v for k, v in m.items() if 'SYNTH' in k or 'MISSING' in k or not (k.startswith('Chillax 300') or k.startswith('Sofia '))}
    print(page, json.dumps({k: [v['n']] + v['ex'][:2] for k, v in bad.items()}, ensure_ascii=False))
