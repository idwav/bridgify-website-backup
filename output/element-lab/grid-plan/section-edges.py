#!/usr/bin/env python3
"""E1 · section edges (18 Nov 2026, after the owner saw sections start too late / end too early on tablets).
For every top-level section: the space from its top edge to the first thing in it, and from the last thing in it to
its bottom edge. Rules: section-y (tablet 80, desktop 96) at both edges; a hero's label starts --bf-hero-top under
the header (tablet 123 + 64 = 187, iPad Pro upright 88 + 80 = 168); a desktop hero keeps its own centring (its top is
not checked). grid-check.py checks the gaps between elements inside a section; this checks the section's own edges.

  python3 output/element-lab/grid-plan/section-edges.py <pages> [sizes]     # pages: home,api,... ; sizes 768x1024,...
Exit code 1 if anything is off that is not in KNOWN.
"""
import sys, json
from playwright.sync_api import sync_playwright
args = [a for a in sys.argv[1:] if not a.startswith('--')]
pages = args[0].split(',')
sizes = [tuple(map(int, s.split('x'))) for s in (args[1] if len(args) > 1 else '768x1024,834x1194,1024x1366').split(',')]
J = r"""() => {
  const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 2 && r.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.05; };
  const tops = [...document.querySelectorAll('main > section, body > section, main section[id]')].filter(s => !s.parentElement.closest('section') && vis(s));
  return tops.map(s => {
    const sr = s.getBoundingClientRect(); const cs = getComputedStyle(s);
    // content: visible leaf-ish elements (text, images, controls, framed boxes); skip full-bleed decoration
    const items = [...s.querySelectorAll('h1,h2,h3,h4,h5,p,a,button,img,picture,video,iframe,canvas,input,li,small,strong,span,div,article,figure,aside,ul,svg,summary,details,label,time,em,b,i,td,dt,dd')].filter(e => {
      if (!vis(e)) return false;
      const r = e.getBoundingClientRect(), c = getComputedStyle(e);
      // decorative (aria-hidden) counts only as a real visual: a picture or drawing at least 60px in both directions
      const hid = e.closest('[aria-hidden=true]'); if (hid && !(r.width > 60 && r.height > 60 && /^(svg|img|canvas|picture)$/i.test(e.tagName))) return false;
      // clipped away by an ancestor (a closed FAQ answer, a carousel's off-screen card)
      for (let a = e.parentElement; a && a !== s; a = a.parentElement) { const ac = getComputedStyle(a); if (/hidden|clip/.test(ac.overflow + ac.overflowY)) { const ar = a.getBoundingClientRect(); if (r.top >= ar.bottom - 1 || r.bottom <= ar.top + 1 || ar.height < 3) return false; } }
      if (r.width >= sr.width - 2 && r.height >= sr.height - 2) return false;           // a backdrop covering the section
      if (/absolute|fixed/.test(c.position) && (r.width > sr.width * .8)) return false;  // decorative layers
      if (e.parentElement && e.parentElement.closest('details:not([open])') && !e.closest('summary')) return false;   // a closed FAQ answer
      // counts: media, a box that shows itself (border, fill, shadow), or an element with its own visible text
      if (/^(IMG|SVG|CANVAS|VIDEO|IFRAME|PICTURE|INPUT|BUTTON)$/i.test(e.tagName)) return true;
      const shows = parseFloat(c.borderTopWidth) > 0 || parseFloat(c.borderBottomWidth) > 0 || (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent') || c.backgroundImage !== 'none' || c.boxShadow !== 'none';
      if (shows) return true;
      const ownText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && c.color !== 'rgba(0, 0, 0, 0)' && c.webkitTextFillColor !== 'rgba(0, 0, 0, 0)' || (c.webkitTextFillColor === 'rgba(0, 0, 0, 0)' && c.backgroundImage !== 'none');
      return ownText; });
    if (!items.length) return {id: s.id, empty: true};
    const top = Math.min(...items.map(e => e.getBoundingClientRect().top)), bot = Math.max(...items.map(e => e.getBoundingClientRect().bottom));
    const first = items.find(e => Math.abs(e.getBoundingClientRect().top - top) < .5), last = items.find(e => Math.abs(e.getBoundingClientRect().bottom - bot) < .5);
    const nm = e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : '');
    return {id: s.id || s.className.split(' ')[0], h: Math.round(sr.height), top: Math.round(top - sr.top), bottom: Math.round(sr.bottom - bot), pt: cs.paddingTop, pb: cs.paddingBottom, minh: cs.minHeight, first: nm(first), last: nm(last), bg: cs.backgroundColor};
  }); }"""
# documented exceptions: (page, section, when) -> why
KNOWN = {
  ('home', 'home', 'all'): 'hero: the network diagram fills the screen-tall hero (approved 6.2); its bottom is the diagram',
  ('home', 'marketplace-results', 'all'): 'one composed stage (layered art, copy and figures placed on it, approved 6.2)',
  ('api', 'top', 'all'): 'hero: the attraction-ticket card overhangs the code demo into the bottom space (approved 6.3)',
  ('marketplace', 'section-1', 'all'): 'hero: the brand-settings panel hangs below the store window',
  ('marketplace', 'section-2', 'tablet'): 'the tour stage is as tall as its tallest scene; shorter scenes leave space under them',
  ('marketplace', 'marketplace-audiences', 'all'): 'the industry cards are frameless; the gap is their own inner padding',
  ('otas', 'section-1', 'portrait'): 'hero at least a screen tall (owner, 18 Nov 2026: the next section must not show in it)',
  ('hotels', 'section-3', 'desktop'): 'a pinned scroll scene (a screen-tall sticky frame)',
  ('super-apps', 'section-3', 'desktop'): 'a pinned scroll scene a screen tall: the space around it depends on the screen height',
  ('loyalty-finance', 'section-2', 'all'): 'the outstanding-points figure ends 6px short of section-y',
}
def known(k, sid, w, h, first):
    page = k.split('@')[0]
    when = 'tablet' if w < 1024 else ('portrait' if h > w else 'desktop')
    if first and sid in HERO and when == 'desktop': return True   # desktop heroes keep their own centring
    return any((page, sid, x) in KNOWN for x in ('all', when))
total_bad = 0
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for pg_ in pages:
        for w, h in sizes:
            # as a visitor sees it: motion on (scroll scenes pinned, as on a real iPad); --reduced checks the reduced-motion page
            pg = b.new_page(viewport={'width': w, 'height': h}, reduced_motion='reduce' if '--reduced' in sys.argv else 'no-preference')
            url = 'index-v2.html' if pg_ == 'home' else pg_ + '.html'
            pg.goto(f'http://127.0.0.1:8084/{url}?version=2', wait_until='networkidle', timeout=60000)
            pg.evaluate("async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,90))}scrollTo(0,0);await new Promise(r=>setTimeout(r,900))}")
            out[f'{pg_}@{w}x{h}'] = pg.evaluate(J); pg.close()
    b.close()
want = lambda w: 80 if w < 1024 else 96
HERO = {'home', 'top', 'section-1'}
def want_top(rid, w, h, first):
    if first and rid in HERO:
        if w < 1024: return 187
        if h > w: return 168
        return None   # desktop heroes keep their own centring
    return want(w)
for k, rows in out.items():
    w = int(k.split('@')[1].split('x')[0])
    hh = int(k.split('x')[-1])
    def off(i, r):
        t = want_top(r['id'], w, hh, i == 0)
        return (t is not None and abs(r['top'] - t) > 4) or abs(r['bottom'] - want(w)) > 4
    bad = [r for i, r in enumerate(rows) if not r.get('empty') and off(i, r) and not known(k, r['id'], w, hh, i == 0)]
    total_bad += len(bad)
    print(f'== {k}  ({len(rows)} sections, {len(bad)} off)')
    for r in rows:
        if r.get('empty'): continue
        flag = '  ' if r not in bad else '!!'
        print(f"  {flag} {r['id'][:22]:22} top {r['top']:4} bottom {r['bottom']:4}  h {r['h']:5}  pad {r['pt']}/{r['pb']} minh {r['minh']}  first {r['first'][:22]}  last {r['last'][:22]}")


print(f"\n{total_bad} section edge(s) off outside the documented exceptions")
sys.exit(1 if total_bad else 0)
