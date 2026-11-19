#!/usr/bin/env python3
"""Desktop type audit (owner, 18 Nov 2026): every editorial text role on every V2 page at 1280/1440/1920, measured as
the site serves it, against the approved scale in TYPOGRAPHY.md / brand-typography.css. Writes type-audit.json.
Demo and mock UI text (windows, phones, tickets, diagrams) is left out, as TYPOGRAPHY.md says."""
import json, sys, os
from playwright.sync_api import sync_playwright
PAGES = ['index-v2','api','marketplace','personalization','otas','airlines','hotels','loyalty-finance','super-apps',
         'travel-technology','developers','insights','press','about-us','careers','contact','demo','blog-infrastructure']
WIDTHS = [1280, 1440, 1920]
J = r"""() => {
const MOCK = '[class*=window],[class*=mock],[class*=demo],[class*=stage],[class*=browser],[class*=phone],[class*=screen],[class*=ticket],[class*=preview],[class*=widget],[class*=visual],[class*=-vis],[class*=diagram],[class*=card-ui],[class*=device],[class*=sim],[class*=terminal],[class*=code],[class*=map],svg,[aria-hidden=true],header.site-header,nav,footer,.bf-footer,[class*=marquee],[class*=logo]';
const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 2 && r.height > 2 && c.visibility !== 'hidden' && c.display !== 'none'; };
const ok = e => vis(e) && !e.closest(MOCK);
const st = e => { const c = getComputedStyle(e); const fam = c.fontFamily.split(',')[0].replace(/["']/g,'').trim();
  const grad = (c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text') ? c.backgroundImage.slice(0,120) : '';
  return {t: e.textContent.trim().replace(/\s+/g,' ').slice(0,60), fam, size: +parseFloat(c.fontSize).toFixed(1), w: c.fontWeight,
    lh: +(parseFloat(c.lineHeight)/parseFloat(c.fontSize)).toFixed(2) || c.lineHeight, ls: c.letterSpacing === 'normal' ? 0 : +(parseFloat(c.letterSpacing)/parseFloat(c.fontSize)).toFixed(3),
    color: c.color, grad, tt: c.textTransform, sel: e.tagName.toLowerCase() + (e.id ? '#'+e.id : '') + (e.className && typeof e.className === 'string' ? '.'+e.className.trim().split(/\s+/).slice(0,2).join('.') : '')}; };
const secs = [...document.querySelectorAll('main > section, body > section, main section[id], body > div > section')].filter(s => !s.parentElement.closest('section') && vis(s));
return secs.map((s, i) => {
  const out = {id: s.id || ('#'+i), roles: {}};
  const add = (k, e) => { (out.roles[k] = out.roles[k] || []).push(st(e)); };
  const hs = [...s.querySelectorAll('h1,h2')].filter(ok);
  const title = hs[0];
  if (title) {
    add(title.tagName === 'H1' ? 'hero' : 'section', title);
    title.querySelectorAll('em,span,strong,b,i').forEach(x => { if (vis(x) && x.textContent.trim()) add('title-accent', x); });
    // label: the nearest uppercase text before the title in the section
    const all = [...s.querySelectorAll('*')].filter(e => ok(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
    const ti = all.indexOf(title);
    const before = all.slice(0, ti < 0 ? 0 : ti).reverse().find(e => getComputedStyle(e).textTransform === 'uppercase' || /eyebrow|kicker|label/.test(e.className));
    if (before) add('label', before);
    // intro: paragraphs after the title until the next heading
    const tr = title.getBoundingClientRect();
    [...s.querySelectorAll('p')].filter(ok).filter(p => { const r = p.getBoundingClientRect(); return r.top >= tr.top - 40 && r.top < tr.bottom + 420 && !p.closest('article,li,details,[class*=card],[class*=step],[class*=item]'); }).slice(0,3).forEach(p => add('intro', p));
  }
  hs.slice(1).forEach(h => add(h.tagName === 'H1' ? 'hero' : 'section-2nd', h));
  [...s.querySelectorAll('h3,h4,summary')].filter(ok).slice(0,6).forEach(h => add('card', h));
  [...s.querySelectorAll('article p, li p, [class*=card] p, details p')].filter(ok).slice(0,3).forEach(p => add('card-text', p));
  [...s.querySelectorAll('a,button')].filter(ok).filter(a => { const r = a.getBoundingClientRect(), c = getComputedStyle(a); return r.height >= 40 && r.height <= 64 && (parseFloat(c.borderTopWidth) > 0 || c.backgroundImage !== 'none' || c.backgroundColor !== 'rgba(0, 0, 0, 0)'); }).slice(0,4).forEach(a => add('button', a));
  return out; });
}"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in WIDTHS:
        ctx = b.new_context(viewport={'width': w, 'height': 900}, reduced_motion='reduce')
        pg = ctx.new_page()
        for page in PAGES:
            try:
                pg.goto(f'http://127.0.0.1:8084/{page}.html?version=2', wait_until='networkidle', timeout=60000)
                pg.wait_for_timeout(600)
                res.setdefault(page, {})[w] = pg.evaluate(J)
            except Exception as e:
                res.setdefault(page, {})[w] = {'error': str(e)[:200]}
            print(page, w, file=sys.stderr)
        ctx.close()
    b.close()
json.dump(res, open(os.path.join(os.path.dirname(__file__), 'type-audit.json'), 'w'), indent=1, ensure_ascii=False)
