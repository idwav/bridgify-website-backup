#!/usr/bin/env python3
"""Spacing check against the role map. No guessing: it reads the same map the engine uses (system/roles/<page>.js)
and the same tokens (system/tokens.css), measures what the reader sees, and reports:

  - gaps:         every gap between consecutive mapped elements vs. its token (±1px)
  - frame:        section top and bottom padding (64; the hero starts 48 under the header bar)
  - unclassified: any visible block in a mapped section that has no role, so nothing slips through unchecked
  - buttons:      the space between buttons in a button row (12)

With --shots it also writes an annotated screenshot per section (green = matches, red = off, orange = no role).

Usage: python3 check.py --page api [--engine webkit|chromium] [--device "iPhone 13"] [--shots DIR]
Exit code 1 when anything is off, so it can gate a commit.
"""
import argparse, asyncio, json, os, re, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
LAYER = os.path.dirname(HERE)
REVEAL = "[data-rv],[data-scroll-enter],.reveal,.rv{opacity:1!important;translate:none!important;transform:none!important}"

MEASURE = r"""(MAP) => {
  const R = window.BridgifyRhythm, root = document.documentElement;
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let a = el; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || /inset\(50%\)/.test(c.clipPath)) return false; } return true; };
  const Y = el => {
    // a button row is where its buttons are; padding or a divider inside the row must not hide extra space
    if (el.dataset && el.dataset.bfRole === 'actions') { const bs = [...el.querySelectorAll('a,button')].filter(vis).map(x => x.getBoundingClientRect()); if (bs.length) return {t: Math.min(...bs.map(r => r.top)) + scrollY, b: Math.max(...bs.map(r => r.bottom)) + scrollY, l: Math.min(...bs.map(r => r.left)), r: Math.max(...bs.map(r => r.right))}; }
    const r = el.getBoundingClientRect(); let t = r.top + scrollY, b = r.bottom + scrollY;
    if (el.classList.contains('ad-more') || (el.dataset && el.dataset.bfRole === 'link')) { const c = getComputedStyle(el); t += parseFloat(c.paddingTop); b -= parseFloat(c.paddingBottom); }
    return {t, b, l: r.left, r: r.right}; };
  const px = n => parseFloat(R.tok(n));
  const out = {sections: [], issues: []};
  // a section that is not in the map is not checked at all: say so
  const mappedSecs = MAP.sections.map(S => document.querySelector(S.section)).filter(Boolean);
  [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && !s.closest('header,footer,.ad-menu') && vis(s) && s.offsetHeight > 120 && !mappedSecs.includes(s))
    .forEach(s => out.issues.push(`${s.id ? '#' + s.id : '.' + s.classList[0]}: section not in the role map (nothing in it is checked)`));
  MAP.sections.forEach(S => {
    const sec = document.querySelector(S.section); if (!sec) { out.issues.push(`${S.section}: section not found`); return; }
    const frame = S.frame ? sec.querySelector(S.frame) : sec;
    const items0 = S.items.filter(([role, sel]) => !(role === 'more' && /ad-more/.test(sel))).map(([role, sel, opt]) => ({role, sel, opt, els: [...frame.querySelectorAll(sel)].filter(vis)}));
    const items = []; items0.forEach(i => { items.push(i); const el = i.els[i.els.length - 1], m = el && el.nextElementSibling; if (i.role === 'text' && m && m.classList.contains('ad-more') && vis(m)) items.push({role: 'more', sel: '(found)', els: [m]}); });
    items.filter(i => !i.els.length && i.opt !== 'optional').forEach(i => out.issues.push(`${S.section}: ${i.role} "${i.sel}" not found or hidden`));
    const deco = items.filter(i => i.role === 'deco').flatMap(i => i.els);   // art behind content: ends the section, no gaps
    const live = items.filter(i => i.els.length && i.role !== 'deco');
    const rec = {section: S.section, top: Y(sec).t, bottom: Y(sec).b, gaps: [], frame: [], unclassified: [], buttons: [], boxes: []};
    live.forEach(i => i.els.forEach(el => { const y = Y(el); rec.boxes.push({role: i.role, ...y}); }));
    for (let k = 1; k < live.length; k++) {
      const A = live[k - 1], B = live[k], a = A.els[A.els.length - 1], b = B.els[0];
      const want = px(R.pair(A.role, B.role, S.hero)), got = Math.round((Y(b).t - Y(a).b) * 10) / 10;
      const g = {from: A.role, to: B.role, want, got, y0: Y(a).b, y1: Y(b).t, ok: Math.abs(got - want) <= 1};
      rec.gaps.push(g); if (!g.ok) out.issues.push(`${S.section}: ${A.role} → ${B.role} ${got}px (want ${want})`);
    }
    if (!S.frame && live.length) {
      const f = live[0].els[0], l = live[live.length - 1].els.slice(-1)[0];
      const hdr = [...document.querySelectorAll('header, .site-header-common')].find(h => { const c = getComputedStyle(h); return (c.position === 'fixed' || c.position === 'sticky') && vis(h); });
      const topRef = S.hero && hdr ? hdr.getBoundingClientRect().bottom + scrollY : Y(sec).t;
      const endY = Math.max(Y(l).b, ...deco.map(e => Y(e).b)); const wantTop = S.hero ? px('hero-top') : px('section-y'), gotTop = Math.round(Y(f).t - topRef), gotBot = Math.round(Y(sec).b - endY);
      rec.frame.push({edge: S.hero ? 'header → first' : 'section top → first', want: wantTop, got: gotTop, y0: topRef, y1: Y(f).t, ok: Math.abs(gotTop - wantTop) <= 1});
      // a hero that fills the first screen may have more room below its last item, never less
      const fills = S.hero && sec.getBoundingClientRect().height >= innerHeight - 1;
      rec.frame.push({edge: 'last → section end', want: px('section-y'), got: gotBot, y0: endY, y1: Y(sec).b, ok: fills ? gotBot >= px('section-y') - 1 : Math.abs(gotBot - px('section-y')) <= 1});
      rec.frame.filter(x => !x.ok).forEach(x => out.issues.push(`${S.section}: ${x.edge} ${x.got}px (want ${x.want})`));
    }
    // every visible block must be a mapped element or contain one; decoration (positioned, aria-hidden) is skipped
    const mapped = new Set([...live.flatMap(i => i.els), ...deco]);
    const walk = el => [...el.children].forEach(k => {
      if (!vis(k) || k.getAttribute('aria-hidden') === 'true') return;
      const c = getComputedStyle(k); if (c.position === 'absolute' || c.position === 'fixed' || /^(SCRIPT|STYLE)$/.test(k.tagName)) return;
      if (mapped.has(k)) return;
      if ([...mapped].some(m => k.contains(m))) return walk(k);
      if (S.frame && !frame.contains(k) && !k.contains(frame)) return;
      const y = Y(k); rec.unclassified.push({tag: k.tagName.toLowerCase() + (k.className && typeof k.className === 'string' ? '.' + k.className.trim().split(/\s+/)[0] : ''), ...y});
      out.issues.push(`${S.section}: no role for ${rec.unclassified.slice(-1)[0].tag} "${k.textContent.trim().slice(0, 30)}"`);
    });
    walk(S.frame ? frame : sec);
    // grid: heading-group text and buttons stay inside the side margins (measured on the glyphs, not the boxes)
    // the grid is the page's side margins, or the card's inner edges for a section drawn as a card
    const fc = S.frame ? getComputedStyle(frame) : null, fr = frame.getBoundingClientRect();
    const G0 = S.frame ? fr.left + parseFloat(fc.paddingLeft) : px('gutter'), G1 = S.frame ? fr.right - parseFloat(fc.paddingRight) : document.documentElement.clientWidth - px('gutter');
    live.filter(i => /^(label|title|text|more|actions|link)$/.test(i.role)).forEach(i => i.els.forEach(el => {
      let lo = Infinity, hi = -Infinity; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) { if (!n.textContent.trim() || !vis(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n); [...rg.getClientRects()].forEach(r => { if (r.width) { lo = Math.min(lo, r.left); hi = Math.max(hi, r.right); } }); }
      if (i.role === 'actions') [...(el.matches('a,button') ? [el] : el.querySelectorAll('a,button'))].filter(vis).forEach(b => { const r = b.getBoundingClientRect(); lo = Math.min(lo, r.left); hi = Math.max(hi, r.right); });
      if (lo < G0 - 1 || hi > G1 + 1) out.issues.push(`${S.section}: ${i.role} outside the side margins (${Math.round(lo)}–${Math.round(hi)}, grid ${Math.round(G0)}–${Math.round(G1)})`);
      if (i.role === 'actions' && !S.frame && lo > G0 + 1) out.issues.push(`${S.section}: buttons start at ${Math.round(lo)}, not on the ${Math.round(G0)}px margin`);
    }));
    // a group's first row starts on one line (a tile pushed down alone breaks the grid)
    live.filter(i => i.els.length > 1).forEach(i => { const rs = i.els.map(e => e.getBoundingClientRect()); const t0 = Math.min(...rs.map(r => r.top));
      const top = rs.find(r => r.top === t0); const row = rs.filter(r => r.top < top.bottom && r.bottom > top.top && (r.left >= top.right - 1 || r.right <= top.left + 1 || r === top)); const off = row.filter(r => Math.abs(r.top - t0) > 1);
      if (off.length) out.issues.push(`${S.section}: ${i.role} tiles on the first row do not start on one line (${row.map(r => Math.round(r.top - t0)).join('/')})`); });
    // buttons and links: one primary and one secondary at most, equal size; a link has no frame
    live.filter(i => i.role === 'actions').forEach(i => i.els.forEach(row => {
      const bs = (row.matches('a,button') ? [row] : [...row.querySelectorAll(':scope > a, :scope > button')]).filter(vis);
      const kinds = bs.map(b => b.dataset.bfKind || '?'); const rs = bs.map(b => b.getBoundingClientRect());
      if (kinds.filter(k => k === 'primary').length > 1) out.issues.push(`${S.section}: more than one primary button`);
      if (kinds.includes('?')) out.issues.push(`${S.section}: a button has no kind (primary / secondary)`);
      bs.forEach(b => { const c = getComputedStyle(b); const w = ['Top', 'Right', 'Bottom', 'Left'].map(s => parseFloat(c['border' + s + 'Width'])); if (b.dataset.bfKind === 'secondary' && new Set(w).size > 1) out.issues.push(`${S.section}: button "${b.textContent.trim().slice(0, 24)}" has an uneven frame (${w.join('/')})`); });
      rs.forEach((r, j) => { if (Math.abs(r.height - 40) > 0.5) out.issues.push(`${S.section}: button "${bs[j].textContent.trim().slice(0, 24)}" is ${Math.round(r.height)}px tall (want 40)`); });
      if (rs.length > 1 && Math.max(...rs.map(r => r.width)) - Math.min(...rs.map(r => r.width)) > 1) out.issues.push(`${S.section}: buttons in one row differ in width (${rs.map(r => Math.round(r.width)).join(' / ')})`);
    }));
    live.filter(i => i.role === 'link').forEach(i => i.els.forEach(a => { const c = getComputedStyle(a);
      if (parseFloat(c.borderTopWidth) + parseFloat(c.borderLeftWidth) > 0 || c.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)) out.issues.push(`${S.section}: link "${a.textContent.trim().slice(0, 24)}" is drawn as a button`); }));
    // button rows: neighbouring buttons sit 12 apart
    live.filter(i => i.role === 'actions').forEach(i => i.els.forEach(row => {
      const bs = [...row.querySelectorAll(':scope > a, :scope > button')].filter(vis);
      for (let j = 1; j < bs.length; j++) { const p = bs[j - 1].getBoundingClientRect(), q = bs[j].getBoundingClientRect();
        const got = Math.round(q.top >= p.bottom - 1 ? q.top - p.bottom : q.left - p.right), want = px('gap-actions-inner');
        rec.buttons.push({got, want, ok: Math.abs(got - want) <= 1}); if (Math.abs(got - want) > 1) out.issues.push(`${S.section}: button ↔ button ${got}px (want ${want})`); }
    }));
    out.sections.push(rec);
  });
  return out;
}"""

OVERLAY = r"""(rec) => {
  document.querySelectorAll('.bf-overlay').forEach(e => e.remove());
  const L = document.createElement('div'); L.className = 'bf-overlay'; L.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:0;z-index:2147483647;pointer-events:none;font:600 11px/1.2 -apple-system,system-ui,sans-serif';
  document.body.appendChild(L);
  const box = (x, y, w, h, css) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}`; L.appendChild(d); return d; };
  const tag = (x, y, t, bg) => { const d = box(x, y, 0, 0, ''); d.style.cssText += `;width:auto;height:auto;background:${bg};color:#111;padding:2px 5px;border-radius:4px;white-space:nowrap;transform:translateY(-50%)`; d.textContent = t; };
  const G = '#3DDC97', RED = '#FF4D6D', OR = '#FF9F0A';
  rec.boxes.forEach(b => { box(b.l, b.t, b.r - b.l, b.b - b.t, 'outline:1px dashed #5AC8FA'); tag(b.l, b.t + 1, b.role, '#5AC8FA'); });
  rec.unclassified.forEach(b => { box(b.l, b.t, b.r - b.l, b.b - b.t, `outline:2px solid ${OR}`); tag(b.l + 4, b.t + 10, 'no role · ' + b.tag, OR); });
  const bar = (g, label) => { const c = g.ok ? G : RED, h = Math.max(1, g.y1 - g.y0); box(354, g.y0, 6, h, `background:${c}aa;border-top:1px solid ${c};border-bottom:1px solid ${c}`); tag(300, g.y0 + h / 2, label + (g.ok ? '' : ` ≠${g.want}`), c); };
  rec.gaps.forEach(g => bar(g, `${g.got}`));
  rec.frame.forEach(g => bar(g, `${g.got}`));
}"""


def load_map(page):
    src = open(os.path.join(HERE, 'roles', f'{page}.js')).read()
    return json.loads(re.sub(r'^\s*window\.BridgifyRoles\s*=\s*', '', src).rstrip().rstrip(';'))


async def open_page(pg, base, page):
    await pg.goto(f'{base}/{"" if page == "index-v2" else page + ".html"}?version=2', wait_until='networkidle')
    for f in ['system/tokens.css', 'layout.css', 'patterns.css', f'pages/{page}.css', 'system/actions.css']:
        p = os.path.join(LAYER, f)
        if os.path.exists(p): await pg.add_style_tag(path=p)
    for f in ['patterns.js', f'pages/{page}.js', f'system/roles/{page}.js', 'system/rhythm.js']:
        p = os.path.join(LAYER, f)
        if os.path.exists(p): await pg.add_script_tag(path=p)
    await pg.add_style_tag(content=REVEAL)
    h = await pg.evaluate('document.body.scrollHeight')
    for y in range(0, h, 500): await pg.evaluate(f"scrollTo({{top:{y},behavior:'instant'}})"); await pg.wait_for_timeout(40)
    await pg.evaluate("scrollTo({top:0,behavior:'instant'})"); await pg.wait_for_timeout(1200)
    await pg.evaluate('window.BridgifyRhythm && window.BridgifyRhythm.apply()'); await pg.wait_for_timeout(300)


async def shoot(pg, rec, path, vh):
    from PIL import Image
    await pg.evaluate(OVERLAY, rec)
    top, bot = int(rec['top']) - 8, int(rec['bottom']) + 8
    sc = await pg.evaluate('devicePixelRatio'); parts = []; y = top
    while y < bot:
        await pg.evaluate(f"scrollTo({{top:{y},behavior:'instant'}})"); await pg.wait_for_timeout(350)
        sy = await pg.evaluate('scrollY'); f = path + f'.{len(parts)}.png'; await pg.screenshot(path=f); parts.append((sy, f)); y += vh - 120
    w = int(await pg.evaluate('innerWidth') * sc); out = Image.new('RGB', (w, int((bot - top) * sc)), 'white')
    for sy, f in parts:
        out.paste(Image.open(f), (0, int((sy - top) * sc))); os.remove(f)
    out.save(path)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--page', required=True); ap.add_argument('--engine', default='webkit')
    ap.add_argument('--device', default='iPhone 13'); ap.add_argument('--base', default='http://localhost:8081')
    ap.add_argument('--shots'); ap.add_argument('--json')
    a = ap.parse_args(); MAP = load_map(a.page)
    async with async_playwright() as p:
        br = await getattr(p, a.engine).launch(); d = dict(p.devices[a.device]); d.pop('default_browser_type', None)
        pg = await (await br.new_context(**d)).new_page()
        await open_page(pg, a.base, a.page)
        res = await pg.evaluate(MEASURE, MAP)
        if a.shots:
            os.makedirs(a.shots, exist_ok=True)
            for i, rec in enumerate(res['sections']):
                await shoot(pg, rec, os.path.join(a.shots, f"{a.page}-{i:02d}-{rec['section'].strip('#.')}.png"), d['viewport']['height'])
        await br.close()
    if a.json: json.dump(res, open(a.json, 'w'), indent=1)
    print(f"{a.page} · {a.device} · {a.engine}: {len(res['issues'])} issue(s)")
    for s in res['sections']:
        print(f"  {s['section']:22} " + '  '.join(f"{g['from'][:5]}→{g['to'][:5]} {g['got']:g}{'' if g['ok'] else '✗'}" for g in s['gaps'])
              + ('  | ' + ' '.join(f"{g['got']}{'' if g['ok'] else '✗'}" for g in s['frame']) if s['frame'] else ''))
    for i in res['issues']: print('  ✗', i)
    sys.exit(1 if res['issues'] else 0)

asyncio.run(main())
