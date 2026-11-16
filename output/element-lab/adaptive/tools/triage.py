#!/usr/bin/env python3
"""Element triage: measure every visual block at phone width with the adaptive layer, and shoot it at phone pixel density.

A "block" is a non-heading child of a section: a demo, diagram, card set or scroller.
For each block it records what a reader actually gets on a phone:
  - scale: how much the layer shrank it (CSS zoom)
  - effective text size: font-size × zoom, the size the eye sees
  - cut text: characters inside a clipping box but outside its visible area (not counting scrollers)
  - scroller facts: number of items, whether each item has its own heading, whether items read as a sequence
  - interactive and animated parts, and desktop complexity (text pieces at 1440)

Usage: python3 triage.py --base http://localhost:8081 --out triage.json --shots triage-shots
"""
import argparse, asyncio, io, json, os, re, sys
from PIL import Image
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
LAYER = os.path.join(ROOT, 'output/element-lab/adaptive')
PAGES = ['api.html', 'marketplace.html', 'personalization.html', 'otas.html', 'airlines.html', 'hotels.html',
         'loyalty-finance.html', 'travel-technology.html', 'super-apps.html']

MEASURE = r"""
() => {
  const W = innerWidth, VH = innerHeight;
  const shown = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; } return true; };
  const srOnly = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const r = a.getBoundingClientRect(); if (r.width <= 2 && r.height <= 2) return true; if (/inset\(50%\)/.test(getComputedStyle(a).clipPath)) return true; } return false; };
  const zoomOf = el => el.currentCSSZoom || 1;
  const path = el => { const p = []; for (let a = el; a && a.tagName !== 'SECTION'; a = a.parentElement) { let s = a.tagName.toLowerCase(); const c = [...a.classList].filter(x => !/^(brand-|is-|ad-on|active)/.test(x))[0]; if (c) s += '.' + c; p.unshift(s); } return p.slice(-2).join(' > '); };
  const label = el => { const h = el.querySelector('h2,h3,h4,strong,small,button'); return (h ? h.textContent : el.textContent).replace(/\s+/g, ' ').trim().slice(0, 48); };

  const secs = [...document.querySelectorAll('main section, body > section')].filter(s => !s.parentElement.closest('section') && s.getBoundingClientRect().height > 40 && shown(s) && s.id !== 'faq' && !s.classList.contains('brand-cta'));
  const out = [];
  secs.forEach(sec => {
    // Descend through single wrappers.
    let root = sec;
    while (true) { const kids = [...root.children].filter(k => shown(k) && k.getBoundingClientRect().height > 0 && !/^(SCRIPT|STYLE)$/.test(k.tagName)); if (kids.length === 1 && !kids[0].querySelector(':scope > h2') && kids[0].querySelectorAll('h2').length && kids[0].tagName !== 'HEADER') root = kids[0]; else break; }
    const kids = [...root.children].filter(k => shown(k) && k.getBoundingClientRect().height > 24 && !srOnly(k) && !/^(SCRIPT|STYLE|svg)$/i.test(k.tagName) && !k.classList.contains('ad-dots') && !k.classList.contains('brand-section-fade'));
    kids.forEach(k => {
      const firstH = sec.querySelector('h1,h2'); const isHead = !!firstH && (k === firstH || k.contains(firstH));
      const r = k.getBoundingClientRect();
      const b = { section: sec.id || sec.className.split(' ')[0], block: path(k), label: label(k), heading: isHead, top: Math.round(r.top + scrollY), height: Math.round(r.height), screens: +(r.height / VH).toFixed(2) };
      // Scale.
      let minZ = 1; [k, ...k.querySelectorAll('*')].forEach(e => { const z = zoomOf(e); if (z < minZ) minZ = z; });
      b.scale = +minZ.toFixed(2);
      // Text the eye sees.
      let folded = 0, chars = 0, small12 = 0, small14 = 0, cut = 0, offscreen = 0, minEff = 99; const cutSample = [], smallSample = [];
      const walker = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t.length < 2) continue;
        const el = n.parentElement; if (!el || !shown(el) || srOnly(el) || el.closest('[aria-hidden=true]')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); const rr = rg.getBoundingClientRect(); if (!rr.width || !rr.height) continue;
        const eff = parseFloat(getComputedStyle(el).fontSize) * zoomOf(el);
        chars += t.length; minEff = Math.min(minEff, eff);
        if (eff < 12) { small12 += t.length; if (smallSample.length < 3) smallSample.push(t.slice(0, 24) + ' ' + eff.toFixed(1) + 'px'); }
        if (eff < 14) small14 += t.length;
        // Clipped by an ancestor that is not a scroller.
        for (let a = el; a && a !== sec.parentElement; a = a.parentElement) {
          const cs = getComputedStyle(a); if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
          if ([...a.classList].some(c => /^ad-exp/.test(c)) || cs.webkitLineClamp !== 'none' && cs.webkitLineClamp) { folded += t.length; break; }
          if (a.classList.contains('ad-scroller') || a.scrollWidth > a.clientWidth + 4 && (cs.overflowX === 'auto' || cs.overflowX === 'scroll')) break;
          const ar = a.getBoundingClientRect();
          if (rr.right > ar.right + 3 || rr.left < ar.left - 3 || rr.bottom > ar.bottom + 3 || rr.top < ar.top - 3) { cut += t.length; if (cutSample.length < 3) cutSample.push(t.slice(0, 28)); }
          break;
        }
        if (rr.right > W + 2 || rr.left < -2) offscreen += t.length;
      }
      Object.assign(b, { chars, minEff: minEff === 99 ? null : +minEff.toFixed(1), small12: chars ? +(small12 / chars).toFixed(2) : 0, small14: chars ? +(small14 / chars).toFixed(2) : 0, cutChars: cut, foldedChars: folded, cutSample, smallSample, offscreenChars: offscreen });
      // Scrollers.
      const sc = k.matches('.ad-scroller') ? k : k.querySelector('.ad-scroller');
      if (sc) {
        const items = [...sc.children].filter(shown);
        const heads = items.filter(i => i.querySelector('h3,h4,strong')).length;
        const seq = items.some(i => /^\s*(0?\d|step|day|stage)\b/i.test(i.textContent));
        b.scroller = { items: items.length, withHeading: heads, sequential: seq, cardWidth: items[0] ? Math.round(items[0].getBoundingClientRect().width) : 0 };
      }
      // Interaction and motion.
      b.controls = k.querySelectorAll('button,a[href],input,select,summary,[role=tab]').length;
      b.animated = document.getAnimations().filter(a => a.effect && a.effect.target && k.contains(a.effect.target)).length + k.querySelectorAll('animate,animateMotion,animateTransform').length;
      b.svgPaths = k.querySelectorAll('svg path,svg line,svg circle').length;
      b.images = k.querySelectorAll('img').length;
      out.push(b);
    });
  });
  return out;
}
"""

REVEAL = "[data-rv],[data-scroll-enter],.reveal,.rv{opacity:1!important;translate:none!important;transform:none!important;clip-path:none!important}"

COMPLEXITY = r"""
(sels) => sels.map(s => { const el = document.querySelector(s); if (!el) return null; let n = 0; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let t = w.nextNode(); t; t = w.nextNode()) if (t.textContent.trim().length > 1) n++; return n; })
"""


async def settle(pg):
    h = await pg.evaluate('document.body.scrollHeight')
    for y in range(0, h, 400):
        await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(70)
    await pg.evaluate('scrollTo(0,0)'); await pg.wait_for_timeout(700)


async def inject(pg, name):
    for f in ['layout.css', 'patterns.css', f'pages/{name}.css']:
        p = os.path.join(LAYER, f)
        if os.path.exists(p): await pg.add_style_tag(path=p)
    for f in ['patterns.js', f'pages/{name}.js']:
        p = os.path.join(LAYER, f)
        if os.path.exists(p): await pg.add_script_tag(path=p)
    await pg.wait_for_timeout(500)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:8081')
    ap.add_argument('--out', required=True)
    ap.add_argument('--shots')
    ap.add_argument('--pages', default=','.join(PAGES))
    a = ap.parse_args()
    res = {}
    async with async_playwright() as p:
        br = await p.chromium.launch()
        mob = await br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        desk = await br.new_context(viewport={'width': 1440, 'height': 900})
        pm, pd = await mob.new_page(), await desk.new_page()
        for page in a.pages.split(','):
            name = page.replace('.html', '')
            await pm.goto(f'{a.base}/{page}?version=2', wait_until='networkidle')
            await inject(pm, name); await pm.add_style_tag(content=REVEAL); await settle(pm)
            blocks = await pm.evaluate(MEASURE)
            if a.shots:
                os.makedirs(a.shots, exist_ok=True)
                await pm.add_style_tag(content='header.site-header-common,.ad-menu-btn{opacity:0!important}')
                for i, b in enumerate(blocks):
                    if b['heading'] or b['height'] < 40: continue
                    y = b['top']; h = min(b['height'], 2400)
                    await pm.evaluate(f'scrollTo(0,{max(0, y - 40)})'); await pm.wait_for_timeout(700)
                    off = await pm.evaluate(f'{y} - scrollY')
                    img = Image.new('RGB', (390 * 2, int(h * 2)))
                    done = 0
                    while done < h:
                        await pm.evaluate(f'scrollTo(0,{y + done - 40})'); await pm.wait_for_timeout(350)
                        o = await pm.evaluate(f'{y + done} - scrollY'); ch = min(844 - o, h - done)
                        png = await pm.screenshot(clip={'x': 0, 'y': o, 'width': 390, 'height': ch})
                        img.paste(Image.open(io.BytesIO(png)).convert('RGB'), (0, int(done * 2))); done += ch
                    b['shot'] = f'{name}-{i:02d}.jpg'; img.save(os.path.join(a.shots, b['shot']), quality=70)
            # Desktop complexity of the same sections.
            await pd.goto(f'{a.base}/{page}?version=2', wait_until='networkidle'); await pd.add_style_tag(content=REVEAL); await settle(pd)
            secs = sorted({b['section'] for b in blocks})
            cx = await pd.evaluate(COMPLEXITY, ['#' + s if not s.startswith('.') else s for s in secs])
            cmap = dict(zip(secs, cx))
            for b in blocks: b['deskTextPieces'] = cmap.get(b['section'])
            res[name] = blocks
            print(name, len(blocks), 'blocks', file=sys.stderr)
        await br.close()
    json.dump(res, open(a.out, 'w'), ensure_ascii=False, indent=1)

asyncio.run(main())
