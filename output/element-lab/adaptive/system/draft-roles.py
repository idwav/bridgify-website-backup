#!/usr/bin/env python3
"""Draft a role map for a page (system/roles/<page>.js). Only a draft: it guesses each element's role from what it
looks like; check.py and the marked screenshots decide, and the map is corrected by hand where the guess is wrong.

Guesses: h1/h2 → title · small uppercase line → label · paragraph → text · .ad-more → more · a row of 1–3 framed
buttons → actions · a lone link whose words send the reader elsewhere (Read, See, How, Prefer, Learn, Explore) →
link · tabs (.ad-seg) → control · anything else → content (visual in the hero) · FAQ rows → one content group.

Usage: python3 draft-roles.py --page otas [--write]
"""
import argparse, asyncio, json, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

DRAFT = r"""() => {
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 3 || r.height < 3) return false; for (let a = e; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || /inset\(50%\)/.test(c.clipPath)) return false; } return true; };
  const deco = e => { const c = getComputedStyle(e); return c.position === 'absolute' || c.position === 'fixed' || e.getAttribute('aria-hidden') === 'true' || /^(SCRIPT|STYLE)$/i.test(e.tagName); };
  const framed = e => { const c = getComputedStyle(e); return parseFloat(c.borderTopWidth) > 0 || c.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor); };
  const LINKY0 = /^(read|see|how|prefer|learn|explore|why|discover)\b/i;
  // a filled primary button stays a button whatever its words ("See a demo store" is the page's main action)
  const primary = e => /primary/.test(e.className) || (e.getAttribute && /gradient/.test(getComputedStyle(e).backgroundImage) && getComputedStyle(e).backgroundImage.includes('244'));
  const LINKY = {test: t => LINKY0.test(t)};
  const btns = e => [...e.children].filter(k => vis(k) && (!deco(k) || k.classList.contains('ad-dots')));
  const isLabel = e => { const c = getComputedStyle(e), t = e.textContent.trim(); return t.length > 1 && t.length < 140 && parseFloat(c.fontSize) <= 13 && (c.textTransform === 'uppercase' || t === t.toUpperCase()) && !e.querySelector('h1,h2,h3,p,img,a,button'); };
  const isText = e => (e.tagName === 'P' && parseFloat(getComputedStyle(e).fontSize) >= 14) || (e.tagName === 'DIV' && e.children.length && [...e.children].every(k => k.tagName === 'P'));
  // a call to action is a link (a[href]); <button>s outside Read more and tabs are controls of a demo, i.e. content
  const isAct = e => e.matches('a[href]') && e.getBoundingClientRect().height >= 32 && e.getBoundingClientRect().height <= 64;
  const role = (e, hero) => {
    if (/^H[12]$/.test(e.tagName)) return 'title';
    if (e.classList.contains('ad-more')) return 'more';
    if (e.classList.contains('ad-seg')) return 'control';
    if (e.classList.contains('ad-dots')) return 'dots';                 // a scroller's position dots belong to it
    if (e.classList.contains('ad-scroller')) return hero ? 'visual' : 'content';  // a scroller is one block, never split
    if (isLabel(e)) return 'label';
    if (isText(e)) return 'text';
    if (isAct(e)) return LINKY.test(e.textContent.trim()) && !primary(e) ? 'link' : 'actions';
    const k = btns(e); if (k.length && k.length <= 3 && k.every(isAct) && !e.querySelector('h1,h2,h3,p,img')) return k.every(x => LINKY.test(x.textContent.trim()) && !primary(x)) ? 'links' : (k.some(x => LINKY.test(x.textContent.trim()) && !primary(x)) ? 'mixed' : 'actions');
    return null;
  };
  const holds = e => [...e.querySelectorAll('*')].some(x => vis(x) && !deco(x) && role(x) && role(x) !== 'content');
  // a stable selector: the full path from the section, then trimmed from the left while it still finds only e
  const sel = (e, root) => {
    if (e.id && !/^ad-/.test(e.id)) return '#' + CSS.escape(e.id);
    const parts = [];
    for (let a = e; a && a !== root; a = a.parentElement) {
      if (a !== e && a.id && !/^ad-/.test(a.id)) { parts.unshift('#' + CSS.escape(a.id)); break; }
      let s = a.tagName.toLowerCase(); const c = [...a.classList].filter(x => !/^(brand-|is-|ad-on|ad-open|ad-acc|active|visible|revealed|scroll-|reveal|in-view)/.test(x))[0];
      if (c) s += '.' + CSS.escape(c);
      const same = a.parentElement ? [...a.parentElement.children].filter(x => x.matches(s)) : [];
      if (same.length > 1) s += `:nth-child(${[...a.parentElement.children].indexOf(a) + 1})`;
      parts.unshift(s);
    }
    for (let i = 0; i < parts.length - 1; i++) { const q = parts.slice(i + 1).join(' > '); const m = root.querySelectorAll(q); if (!(m.length === 1 && m[0] === e)) { return parts.slice(Math.min(i, parts.length - 2)).join(' > '); } }
    return parts.slice(-2).join(' > ');  // keep the parent for context even when the last step alone is unique
  };
  const out = [];
  const secs = [...document.querySelectorAll('main section, body > section, .bf-cta-shell')].filter(s => !s.parentElement.closest('section') && vis(s) && s.offsetHeight > 120);
  secs.forEach((sec, si) => {
    // a section drawn as one card (CTA, security box): the card is the frame and keeps its own padding
    const only = btns(sec).filter(k => !k.classList.contains('brand-section-fade'));
    const frame = sec.classList.contains('bf-cta-shell') ? sec.querySelector('.bf-cta-card') : (only.length === 1 && framed(only[0]) && holds(only[0]) ? only[0] : sec);
    const hero = si === 0, items = [];
    const walk = el => btns(el).forEach(k => {
      if (k.tagName === 'DETAILS') { if (!items.some(i => i[2] === 'faq')) items.push(['content', sel(k, frame).replace(/:nth-of-type\(\d+\)$/, ''), 'faq']); return; }
      const r = role(k, hero);
      if (r === 'links' || r === 'mixed') { btns(k).forEach(b => items.push([LINKY.test(b.textContent.trim()) && !primary(b) ? 'link' : 'actions', sel(b, frame)])); return; }
      if (r) { items.push([r, sel(k, frame)]); return; }
      if (k.querySelector('.ad-scroller')) { const sc = k.querySelector('.ad-scroller'); if (!framed(k) && [...k.children].some(c => c.contains(sc))) return walk(k); }
      if (holds(k) && !framed(k)) return walk(k);
      items.push([hero ? 'visual' : 'content', sel(k, frame)]);
    });
    walk(frame);
    // merge runs of content/visual siblings that share a parent and a class into one group selector
    const merged = [];
    items.forEach(it => {
      const prev = merged[merged.length - 1];
      const base = s => s.replace(/:nth-child\(\d+\)$/, '');
      if (prev && /^(content|visual)$/.test(it[0]) && prev[0] === it[0] && base(prev[1]) === base(it[1]) && base(it[1]) !== it[1]) { prev[1] = base(it[1]); return; }
      merged.push(it.slice());
    });
    items.length = 0; merged.forEach(m => items.push(m));
    // the panel after tabs changes with the tab: select every panel, the visible one is used
    items.forEach((it, j) => { if (j && items[j - 1][0] === 'control' && it[0] === 'content') it[1] = it[1].replace(/:nth-child\(\d+\)$/, ''); });
    const S = {section: sec.id ? '#' + sec.id : '.' + [...sec.classList][0], items: items.map(i => i.slice(0, 2))};
    if (items.some(i => i[2] === 'faq')) S.items = S.items.map(i => i[0] === 'content' && /details/.test(i[1]) ? ['content', 'details'] : i);
    if (hero) S.hero = true; if (frame !== sec) S.frame = frame.classList.contains('bf-cta-card') ? '.bf-cta-card' : sel(frame, sec);
    out.push(S);
  });
  return out;
}"""


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', required=True); ap.add_argument('--write', action='store_true')
    ap.add_argument('--base', default='http://localhost:8081'); a = ap.parse_args()
    import importlib.util
    spec = importlib.util.spec_from_file_location('chk', os.path.join(HERE, 'check.py'))
    src = open(os.path.join(HERE, 'check.py')).read(); src = src[:src.index('async def main')]; ns = {'__file__': os.path.join(HERE, 'check.py'), '__name__': 'chk'}; exec(src, ns)
    async with async_playwright() as p:
        br = await p.webkit.launch(); d = dict(p.devices['iPhone 13']); d.pop('default_browser_type', None)
        pg = await (await br.new_context(**d)).new_page()
        # draft against the page without a map (a stale map would already have moved things)
        path = os.path.join(HERE, 'roles', f'{a.page}.js'); hidden = path + '.off'
        if os.path.exists(path): os.rename(path, hidden)
        try:
            await ns['open_page'](pg, a.base, a.page)
            secs = await pg.evaluate(DRAFT)
        finally:
            if os.path.exists(hidden): os.rename(hidden, path)
        await br.close()
    body = 'window.BridgifyRoles = ' + json.dumps({'page': a.page, 'sections': secs}, indent=1, ensure_ascii=False) + ';\n'
    if a.write:
        open(path, 'w').write(body); print('wrote', path)
    else: print(body)

asyncio.run(main())
