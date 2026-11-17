#!/usr/bin/env python3
"""Adaptive check: screenshot every section at the reference widths and flag layout problems.

Usage:
  python3 scripts/adaptive-check.py --base http://localhost:8081 --out output/element-lab/adaptive/checks-baseline.json \
      --shots output/element-lab/adaptive/baseline [--layer] [--pages index-v2.html,api.html] [--widths 390,768,1440]

--layer injects the adaptive layer (output/element-lab/adaptive/*.css + patterns.js) the same way the lab does,
so proposals are measured exactly as they are reviewed.
"""
import argparse, asyncio, io, json, os, re
from PIL import Image
from playwright.async_api import async_playwright

PAGES = ["index-v2.html", "api.html", "marketplace.html", "personalization.html", "developers.html", "otas.html",
         "airlines.html", "loyalty-finance.html", "travel-technology.html", "hotels.html", "super-apps.html",
         "about-us.html", "contact.html", "careers.html", "press.html", "insights.html"]
HEIGHTS = {360: 780, 390: 844, 430: 932, 768: 1024, 820: 1180, 1023: 1366, 1024: 768, 1280: 800, 1440: 900, 1920: 1080}

# Runs inside the page. Returns per-section measurements for the current viewport.
MEASURE = r"""
(sel) => {
  const W = innerWidth, VH = innerHeight, mobile = W < 600, touch = W < 1024;
  const uniq = el => {
    if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) return '#' + el.id;
    for (const c of el.classList) { const s = el.tagName.toLowerCase() + '.' + c; if (document.querySelectorAll(s).length === 1) return s; }
    return null;
  };
  const shown = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') return a; } return null; };
  const logo = document.querySelector('header.site-header-common a[href*="index"], header.site-header-common .brand, header.site-header-common img');
  const gutter = logo ? Math.round(logo.getBoundingClientRect().left) : null;
  const secs = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && !s.closest('header.site-header-common'));
  const page = { width: W, scrollWidth: document.documentElement.scrollWidth, pageOverflow: document.documentElement.scrollWidth > W + 1, gutter };
  const out = secs.map(s => {
    const r = s.getBoundingClientRect();
    const res = { sel: uniq(s), height: Math.round(r.height), screens: +(r.height / VH).toFixed(1), overflow: [], smallTap: [], smallText: { min: 99, count: 0, sample: [] }, edges: [] };
    if (!r.height) return res;
    s.querySelectorAll('*').forEach(el => {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height || !shown(el)) return;
      // Content that escapes the viewport and is not inside a scrolling/clipping box.
      if ((b.right > W + 1 || b.left < -1) && !clipped(el)) { if (res.overflow.length < 6) res.overflow.push((el.className && el.className.baseVal === undefined ? el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase()) + ' ' + Math.round(b.left) + '→' + Math.round(b.right)); }
      // Touch targets.
      if (touch && !el.matches('.ad-rowlink-a') && el.matches('a[href],button,summary,[role=button],input,select,textarea') && (b.width < 44 && b.height < 44 || Math.min(b.width, b.height) < 24)) {
        if (res.smallTap.length < 6) res.smallTap.push((el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30) + ' ' + Math.round(b.width) + '×' + Math.round(b.height));
        res.smallTapCount = (res.smallTapCount || 0) + 1;
      }
      // Text size: direct text only.
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (own && !el.closest('[aria-hidden=true]')) {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 12) { res.smallText.count++; res.smallText.min = Math.min(res.smallText.min, fs); if (res.smallText.sample.length < 4) res.smallText.sample.push(el.textContent.trim().slice(0, 28) + ' ' + fs + 'px'); }
      }
    });
    // Left edges of the editorial column (eyebrow, h2, first paragraph) against the header gutter.
    s.querySelectorAll('h1,h2').forEach((h, i) => { if (i < 2 && shown(h)) res.edges.push(Math.round(h.getBoundingClientRect().left)); });
    if (res.smallText.min === 99) res.smallText.min = null;
    return res;
  });
  return { page, sections: out };
}
"""


async def settle(pg):
    h = await pg.evaluate('document.body.scrollHeight')
    for y in range(0, h, 500):
        await pg.evaluate(f'scrollTo(0,{y})')
        await pg.wait_for_timeout(60)
    await pg.evaluate('scrollTo(0,0)')
    await pg.wait_for_timeout(600)


async def shoot(pg, sel, path, vh):
    """Capture a section screen by screen, so scroll-triggered entrances fire as a visitor would see them."""
    box = await pg.evaluate('(s)=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top+scrollY,h:r.height,w:innerWidth}}', sel)
    top, h, w = box['top'], min(box['h'], 12000), box['w']
    out = Image.new('RGB', (w, max(1, int(h))))
    y = 0
    while y < h:
        await pg.evaluate(f'scrollTo(0,{top + y})')
        await pg.wait_for_timeout(450)
        real = await pg.evaluate('scrollY')
        off = top + y - real                      # page may not scroll that far near the bottom
        clip_h = min(vh - off, h - y)
        png = await pg.screenshot(clip={'x': 0, 'y': off, 'width': w, 'height': clip_h})
        out.paste(Image.open(io.BytesIO(png)).convert('RGB'), (0, int(y)))
        y += clip_h
    out.save(path, quality=62)


async def inject_layer(pg, root):
    d = os.path.join(root, 'output/element-lab/adaptive')
    for f in ['layout.css', 'patterns.css']:
        p = os.path.join(d, f)
        if os.path.exists(p): await pg.add_style_tag(path=p)
    name = (await pg.evaluate('location.pathname')).strip('/').replace('.html', '') or 'index-v2'
    p = os.path.join(d, 'pages', name + '.css')
    if os.path.exists(p): await pg.add_style_tag(path=p)
    for f in ['patterns.js', os.path.join('pages', name + '.js')]:
        p = os.path.join(d, f)
        if os.path.exists(p): await pg.add_script_tag(path=p)
    await pg.wait_for_timeout(400)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:8081')
    ap.add_argument('--out', required=True)
    ap.add_argument('--shots')
    ap.add_argument('--layer', action='store_true')
    ap.add_argument('--pages', default=','.join(PAGES))
    ap.add_argument('--widths', default='390,768,1440')
    a = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    widths = [int(w) for w in a.widths.split(',')]
    data = json.load(open(a.out)) if os.path.exists(a.out) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in widths:
            ctx = await b.new_context(viewport={'width': w, 'height': HEIGHTS.get(w, 900)}, device_scale_factor=1,
                                      is_mobile=w < 600, has_touch=w < 1024)
            pg = await ctx.new_page()
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
            for name in a.pages.split(','):
                errs.clear()
                await pg.goto(f'{a.base}/{name}?version=2', wait_until='networkidle')
                if a.layer: await inject_layer(pg, root)
                await settle(pg)
                m = await pg.evaluate(MEASURE, None)
                m['page']['errors'] = list(errs)
                data.setdefault(name, {})[str(w)] = m
                if a.shots:
                    os.makedirs(a.shots, exist_ok=True)
                    await pg.add_style_tag(content='header.site-header-common{position:absolute!important;opacity:0!important}')
                    for s in m['sections']:
                        if not s['sel'] or not s['height']: continue
                        slug = re.sub(r'[^a-z0-9]+', '-', (name.replace('.html', '') + '-' + s['sel']).lower()).strip('-')
                        try:
                            await shoot(pg, s['sel'], os.path.join(a.shots, f'{slug}-{w}.jpg'), HEIGHTS.get(w, 900))
                        except Exception as e:
                            print('  shot failed', name, s['sel'], w, str(e)[:80])
                flags = sum(1 for s in m['sections'] if s['overflow'] or s.get('smallTapCount') or s['smallText']['count'])
                print(f'{w:>5} {name:24} overflow:{m["page"]["pageOverflow"]} sections-with-flags:{flags}/{len(m["sections"])} errors:{len(errs)}')
            await ctx.close()
        await b.close()
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(data, open(a.out, 'w'), indent=1, ensure_ascii=False)


asyncio.run(main())
