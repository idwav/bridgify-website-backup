#!/usr/bin/env python3
"""Fit check: does each visual block work inside a real phone screen?

The earlier triage measured against the full device height (844 on an iPhone 13). A reader never gets that:
Safari's address bar and toolbar leave about 390×664, and the site's sticky header takes more. This check uses
Playwright's device profiles, whose viewport is the visible area, and subtracts the sticky header.

For every block (same blocks as triage.py) on every device it records:
  - fit: block height ÷ usable screen height. Over 1 means the block can never be seen whole.
  - firstView: for the first section, how much of each block is on screen when the page opens.
  - covered: text with a positioned element painted over it (cursors, badges, fold marks).
  - taps: buttons and links smaller than 44px.
  - tiny: text the eye sees below 12px (font-size × zoom).
  - wide: text past the screen edge.

Usage: python3 fit.py --out triage/fit.json [--pages api.html,...]
"""
import argparse, asyncio, json, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
LAYER = os.path.join(ROOT, 'output/element-lab/adaptive')
PAGES = ['index-v2.html', 'api.html', 'marketplace.html', 'personalization.html', 'otas.html', 'airlines.html', 'hotels.html',
         'loyalty-finance.html', 'travel-technology.html', 'super-apps.html']
# Playwright profiles: the viewport is the area a page gets inside the browser, not the screen.
DEVICES = ['iPhone 13', 'iPhone SE', 'iPhone 15 Pro Max', 'Pixel 7']
INDEX_DEVICE = 'iPhone 13'  # block numbers match triage shots (390 wide)

MEASURE = r"""
() => {
  const W = innerWidth, VH = innerHeight;
  const shown = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; } return true; };
  const srOnly = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const r = a.getBoundingClientRect(); if (r.width <= 2 && r.height <= 2) return true; if (/inset\(50%\)/.test(getComputedStyle(a).clipPath)) return true; } return false; };
  const path = el => { const p = []; for (let a = el; a && a.tagName !== 'SECTION'; a = a.parentElement) { let s = a.tagName.toLowerCase(); const c = [...a.classList].filter(x => !/^(brand-|is-|ad-on|active)/.test(x))[0]; if (c) s += '.' + c; p.unshift(s); } return p.slice(-2).join(' > '); };

  // Usable height: the visible viewport minus whatever stays pinned at the top.
  let pinned = 0;
  document.querySelectorAll('body *').forEach(e => { const cs = getComputedStyle(e); if ((cs.position === 'fixed' || cs.position === 'sticky') && shown(e)) { const r = e.getBoundingClientRect(); if (r.top <= 1 && r.width > W * .6 && r.height < VH * .3) pinned = Math.max(pinned, r.bottom); } });
  const usable = VH - pinned;

  const secs = [...document.querySelectorAll('main section, body > section')].filter(s => !s.parentElement.closest('section') && s.getBoundingClientRect().height > 40 && shown(s) && s.id !== 'faq' && !s.classList.contains('brand-cta'));
  const out = [];
  secs.forEach((sec, si) => {
    let root = sec;
    while (true) { const kids = [...root.children].filter(k => shown(k) && k.getBoundingClientRect().height > 0 && !/^(SCRIPT|STYLE)$/.test(k.tagName)); if (kids.length === 1 && !kids[0].querySelector(':scope > h2') && kids[0].querySelectorAll('h2').length && kids[0].tagName !== 'HEADER') root = kids[0]; else break; }
    const kids = [...root.children].filter(k => shown(k) && k.getBoundingClientRect().height > 24 && !srOnly(k) && !/^(SCRIPT|STYLE|svg)$/i.test(k.tagName) && !k.classList.contains('ad-dots') && !k.classList.contains('brand-section-fade'));
    kids.forEach(k => {
      const firstH = sec.querySelector('h1,h2'); const isHead = !!firstH && (k === firstH || k.contains(firstH));
      // a pinned run (patterns.js pin) is as tall as its stage on screen, not the scroll it adds
      const r = (k.classList.contains('ad-pin') && k.querySelector('.ad-pin-stage') || k).getBoundingClientRect(), top = k.getBoundingClientRect().top + scrollY;
      const b = { section: sec.id || sec.className.split(' ')[0], block: path(k), heading: isHead, height: Math.round(r.height), usable: Math.round(usable), fit: +(r.height / usable).toFixed(2) };
      if (si === 0) b.firstView = +Math.max(0, Math.min(1, (VH - top) / r.height)).toFixed(2);
      b.demo = !!k.querySelector('svg,img,canvas,iframe,[aria-hidden=true],button,[role=tab]') || k.querySelectorAll('*').length > 40;
      if (k.classList.contains('ad-bleed')) b.demo = false;  // a full-bleed stage fills the screen by design (MOBILE-RULES M5)

      // Text: tiny, past the edge, and covered by a positioned element.
      const overlays = [...k.querySelectorAll('*')].filter(e => { if (!shown(e)) return false; const cs = getComputedStyle(e); return (cs.position === 'absolute' || cs.position === 'fixed') && e.tagName.toLowerCase() !== 'svg' && e.getBoundingClientRect().width > 4 && !e.closest('svg'); });  // thin SVG connector lines behind labels are not covers
      let tiny = 0, wide = 0; const covered = [];
      const walker = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t.length < 2) continue;
        const el = n.parentElement; if (!el || !shown(el) || srOnly(el)) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); const lines = [...rg.getClientRects()].filter(x => x.width && x.height); if (!lines.length) continue;
        const eff = parseFloat(getComputedStyle(el).fontSize) * (el.currentCSSZoom || 1);
        if (eff < 11) tiny += t.length;  // labels above titles are 11px by agreement (WORKFLOW.md); below that is too small
        if (lines.some(x => x.right > W + 2 || x.left < -2)) wide += t.length;
        for (const o of overlays) {
          if (o.contains(el) || el.contains(o) && o === el) continue;
          if (o.contains(n)) continue;
          const orr = o.getBoundingClientRect(); const oa = orr.width * orr.height; if (!oa) continue;
          for (const x of lines) {
            const ix = Math.max(0, Math.min(x.right, orr.right) - Math.max(x.left, orr.left)), iy = Math.max(0, Math.min(x.bottom, orr.bottom) - Math.max(x.top, orr.top));
            const ia = ix * iy; if (ia > 0.25 * Math.min(oa, x.width * x.height) && ia > 30) { covered.push(t.slice(0, 30) + ' ← ' + (o.className && typeof o.className === 'string' ? o.className.split(' ')[0] : o.tagName.toLowerCase())); break; }
          }
          if (covered.length > 4) break;
        }
      }
      b.tiny = tiny; b.wide = wide; b.covered = [...new Set(covered)].slice(0, 4);
      b.taps = [...k.querySelectorAll('button,a[href],[role=tab],summary,select,input')].filter(e => { if (!shown(e) || srOnly(e) || e.closest('[aria-hidden=true]')) return false; const q = e.getBoundingClientRect(); return q.width && q.height && Math.min(q.width, q.height) < 44 * 0.999 && q.height < 44; }).length;
      out.push(b);
    });
  });
  // Page-level checks learned from review on the phone.
  const page = {};
  // 1 · The hero must cover the tallest visible area (Safari toolbars collapsed), or the next section shows under it.
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;top:0;height:100lvh;width:1px;visibility:hidden'; document.body.appendChild(probe);
  const lvh = probe.getBoundingClientRect().height; probe.remove();
  if (secs[0]) { const h = secs[0].getBoundingClientRect().height; page.heroFill = +(h / lvh).toFixed(3); page.heroMinHeight = getComputedStyle(secs[0]).minHeight; }
  // 2 · Key figures (1M+, 180+, 3%, $280) must stay large: under 28px they stop doing their job.
  page.smallFigures = [];
  document.querySelectorAll(':is(main,body>section) :is(strong,b,dd,[class*=stat] *,[class*=number] *)').forEach(e => {
    const t = e.textContent.replace(/\s+/g, '').trim(); if (/^0\d$/.test(t) || !/^[$€£]?\d[\d,.]*\s*(%|\+|M\+|K\+|M|K)?\*?$/.test(t) || !shown(e) || srOnly(e)) return;
    const eff = parseFloat(getComputedStyle(e).fontSize) * (e.currentCSSZoom || 1);
    if (eff < 28 && e.getBoundingClientRect().width > 0) page.smallFigures.push(t + ' ' + eff.toFixed(0) + 'px');
  });
  page.smallFigures = [...new Set(page.smallFigures)].slice(0, 12);
  // 3 · Siblings that sit side by side in one row must start their text on one line (labels, captions).
  page.rowMisaligned = [];
  document.querySelectorAll(':is(main,body>section) *').forEach(par => {
    if (par.closest('[aria-hidden=true]')) return;
    const kids = [...par.children].filter(k => shown(k) && k.getBoundingClientRect().height > 0); if (kids.length < 3) return;
    const cls = kids[0].className; if (!cls || typeof cls !== 'string' || kids.some(k => k.className !== cls)) return;
    const rows = {}; kids.forEach(k => { const t = Math.round(k.getBoundingClientRect().top); (rows[t] = rows[t] || []).push(k); });
    Object.values(rows).filter(r => r.length > 1).forEach(r => {
      const lastTops = r.map(k => { const l = k.lastElementChild; return l ? Math.round(l.getBoundingClientRect().top) : null; }).filter(v => v != null);
      if (lastTops.length > 1 && Math.max(...lastTops) - Math.min(...lastTops) > 2) page.rowMisaligned.push((par.closest('section') || {}).id + ' .' + cls.split(' ')[0] + ' Δ' + (Math.max(...lastTops) - Math.min(...lastTops)) + 'px');
    });
  });
  page.rowMisaligned = [...new Set(page.rowMisaligned)].slice(0, 12);
  // 4 · Line breaks: a heading or paragraph whose last line holds a single word (an orphan), or a heading whose
  //     lines are very uneven (one line under 40% of the longest), reads as a broken composition on a phone.
  page.badBreaks = [];
  document.querySelectorAll(':is(main,body>section) :is(h1,h2,h3,h4,p,li,summary)').forEach(el => {
    if (!shown(el) || srOnly(el) || el.closest('[aria-hidden=true],.ad-exp:not(.ad-open)')) return;
    const words = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const q = r.getBoundingClientRect(); if (q.width) words.push({t: m[0], top: Math.round(q.top), l: q.left, r: q.right}); } }
    if (words.length < 4) return;
    const lines = []; words.forEach(x => { const L = lines.find(l => Math.abs(l.top - x.top) < 6); if (L) { L.n++; L.l = Math.min(L.l, x.l); L.r = Math.max(L.r, x.r); L.last = x.t; } else lines.push({top: x.top, n: 1, l: x.l, r: x.r, last: x.t}); });
    if (lines.length < 2) return;
    const tag = el.tagName.toLowerCase(), last = lines[lines.length - 1], sec = (el.closest('section') || {}).id || '';
    if (last.n === 1) page.badBreaks.push(`${sec} ${tag} orphan "${last.last}"`);
    if (/^h/.test(tag)) { const wid = lines.map(l => l.r - l.l), mx = Math.max(...wid); if (wid.some(v => v < mx * .4) && last.n !== 1) page.badBreaks.push(`${sec} ${tag} uneven lines (${wid.map(v => Math.round(v)).join('/')})`); }
  });
  page.badBreaks = [...new Set(page.badBreaks)].slice(0, 40);
  // 5 · Label → title gap: each section's title (first h2) sits 16px under its label (±2px), on layout positions.
  page.labelGaps = [];
  const ltop = el => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  document.querySelectorAll('section').forEach(sec => {
    if (sec.parentElement.closest('section')) return;
    const h = sec.querySelector('h2'); if (!h || !h.offsetHeight || h.closest('[aria-hidden=true]')) return; const ht = ltop(h); let best = null;
    sec.querySelectorAll('*').forEach(e => {
      if (e.contains(h) || h.contains(e) || e.closest('[aria-hidden=true]') || !e.offsetParent) return;
      const first = e.childNodes[0]; const t = (first && first.nodeType === 3 ? e.textContent : '').trim(); if (!t || t.length > 60) return;
      const c = getComputedStyle(e); if (c.textTransform !== 'uppercase' && t !== t.toUpperCase()) return; if (parseFloat(c.fontSize) > 14) return;
      const bt = ltop(e) + e.offsetHeight; if (!e.offsetHeight || bt > ht + 2 || ht - bt > 80) return;
      if (Math.abs(e.getBoundingClientRect().left - h.getBoundingClientRect().left) > 40) return;
      if (!best || bt > best.bt) best = {t, bt};
    });
    if (best) { const g = Math.round(ht - best.bt); if (Math.abs(g - 16) > 2) page.labelGaps.push(`${sec.id} "${best.t.slice(0, 24)}" ${g}px`); }
  });
  // 6 · Title roles: the hero title and every section title use one size and weight (28px, 400 on phones). Found
  //     on what the reader sees (the largest text in the first section, including a same-origin iframe), not on a
  //     class or a tag, because pages put their visible hero title in different elements.
  page.titleRoles = []; page.titles = [];
  const role = (doc, el, name) => { const c = doc.defaultView.getComputedStyle(el); const v = {name, fs: Math.round(parseFloat(c.fontSize) * 10) / 10, fw: +c.fontWeight}; page.titles.push(v); if (v.fs !== 28 || v.fw !== 400) page.titleRoles.push(`${name} ${v.fs}px/${v.fw} "${el.textContent.trim().slice(0, 30)}"`); };
  const biggest = doc => { let best = null; doc.querySelectorAll('h1,h2').forEach(e => { if (/^(SCRIPT|STYLE|svg)$/i.test(e.tagName) || e.closest('[aria-hidden=true]')) return; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return; const c = doc.defaultView.getComputedStyle(e); if (c.visibility === 'hidden' || /inset\(50%\)/.test(c.clipPath)) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2)) return; const fs = parseFloat(c.fontSize); if (!best || fs > best.fs) best = {e, fs}; }); if (!best) return null; let e = best.e; while (e.parentElement && /^(SPAN|EM|STRONG|B|I)$/.test(e.tagName)) e = e.parentElement; return e; };
  const hero = secs[0];
  if (hero) {
    // The hero title may be on the page or inside an embedded frame (AIyelet); other heroes embed a demo frame with
    // small text. Take the larger of the two candidates.
    const laid = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden') return false; } return true; };
    let best = null; hero.querySelectorAll('h1,h2,[data-copy-display]').forEach(e => { if (!laid(e) || srOnly(e) || e.closest('[aria-hidden=true],iframe')) return;  /* headings only: demos inside heroes are often zoomed, so their CSS sizes say nothing */ const fs = parseFloat(getComputedStyle(e).fontSize); if (!best || fs > best.fs) best = {e, fs, doc: document}; });
    if (best) { let e = best.e; while (e.parentElement && /^(SPAN|EM|STRONG|B|I)$/.test(e.tagName)) e = e.parentElement; best.e = e; }
    hero.querySelectorAll('iframe').forEach(fr => { try { const d = fr.contentDocument; if (!d || !d.body) return; const e = biggest(d); if (!e) return; const scale = fr.getBoundingClientRect().width / d.documentElement.clientWidth; const fs = parseFloat(d.defaultView.getComputedStyle(e).fontSize) * scale;  /* a scaled demo frame shows its text smaller than its CSS size */ if (!best || fs > best.fs) best = {e, fs, doc: d}; } catch (x) {} });
    if (best) role(best.doc, best.e, 'hero'); else page.titleRoles.push('hero title not found');
  }
  document.querySelectorAll('section').forEach(sec => { if (sec === hero || sec.parentElement.closest('section') || !shown(sec)) return; const h = [...sec.querySelectorAll('h2')].find(x => shown(x) && !srOnly(x) && !x.closest('[aria-hidden=true]')); if (h) role(document, h, sec.id || 'section'); });
  return { pinned: Math.round(pinned), vh: VH, blocks: out, page };
}
"""

REVEAL = "[data-rv],[data-scroll-enter],.reveal,.rv{opacity:1!important;translate:none!important;transform:none!important;clip-path:none!important}"


async def inject(pg, name):
    for f in ['system/tokens.css', 'layout.css', 'patterns.css', f'pages/{name}.css', 'system/actions.css']:
        p = os.path.join(LAYER, f)
        if os.path.exists(p): await pg.add_style_tag(path=p)
    for f in ['patterns.js', f'pages/{name}.js', f'system/roles/{name}.js', 'system/rhythm.js']:
        p = os.path.join(LAYER, f)
        if os.path.exists(p): await pg.add_script_tag(path=p)
    await pg.wait_for_timeout(600)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:8081')
    ap.add_argument('--out', required=True)
    ap.add_argument('--pages', default=','.join(PAGES))
    ap.add_argument('--engine', default='chromium', choices=['chromium', 'webkit'])
    a = ap.parse_args()
    devices = [d for d in DEVICES if a.engine == 'chromium' or d.startswith('iPhone')]  # Safari's engine only on iPhones
    res = {}
    async with async_playwright() as p:
        br = await getattr(p, a.engine).launch()
        for dev in devices:
            d = dict(p.devices[dev]); d.pop('default_browser_type', None)
            ctx = await br.new_context(**d); pg = await ctx.new_page()
            for page in a.pages.split(','):
                name = page.replace('.html', '')
                sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'system')); from published import route_stripped
                await route_stripped(pg, f'**/{"" if page == "index-v2.html" else page}?*')
                await pg.goto(f'{a.base}/{"" if page == "index-v2.html" else page}?version=2', wait_until='networkidle')
                await inject(pg, name); await pg.add_style_tag(content=REVEAL)
                h = await pg.evaluate('document.body.scrollHeight')
                for y in range(0, h, 500): await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(50)
                await pg.evaluate('scrollTo(0,0)'); await pg.wait_for_timeout(800)
                m = await pg.evaluate(MEASURE)
                for i, b in enumerate(m['blocks']):
                    key = f'{name}-{i:02d}.jpg' if dev == INDEX_DEVICE else None
                    k = key or f"{name}|{b['section']}|{b['block']}"
                    res.setdefault(dev, {'vh': m['vh'], 'pinned': m['pinned'], 'blocks': {}})['blocks'][k] = b
                res[dev].setdefault('pages', {})[name] = m['page']
                print(dev, name, len(m['blocks']), file=sys.stderr)
            await ctx.close()
        await br.close()
    json.dump(res, open(a.out, 'w'), ensure_ascii=False, indent=1)
    # Per-shot summary for the triage page, joined across devices by section + block.
    idx = res[INDEX_DEVICE]['blocks']; summary = {}
    for shot, b in idx.items():
        name = shot.rsplit('-', 1)[0]; sk = f"{name}|{b['section']}|{b['block']}"
        per = {INDEX_DEVICE: b}
        for dev in devices:
            if dev == INDEX_DEVICE: continue
            for kk, bb in res[dev]['blocks'].items():
                if kk == sk: per[dev] = bb
        summary[shot] = {'heading': b['heading'], 'demo': b['demo'],
                         'fit': {dv: x['fit'] for dv, x in per.items()},
                         'height': b['height'], 'usable': b['usable'], 'firstView': b.get('firstView'),
                         'covered': b['covered'], 'taps': b['taps'], 'tiny': b['tiny'], 'wide': b['wide']}
    js = os.path.splitext(a.out)[0] + '.js'
    with open(js, 'w') as f:
        f.write('window.FIT=' + json.dumps({'engine': a.engine, 'devices': {dv: {'vh': res[dv]['vh'], 'pinned': res[dv]['pinned']} for dv in devices}, 'blocks': summary}, ensure_ascii=False) + ';')

asyncio.run(main())
