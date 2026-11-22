// QA audit, run inside a page by scripts/qa/review.py. Returns the page's sections and every problem it can see.
// Problems carry: type, level (error | warn), section key, a short selector, a text snippet and a document rect.
(opts) => {
  const W = innerWidth, phone = W < 600, sy = scrollY;
  const R = e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top + sy, w: b.width, h: b.height, r: b.right, b: b.bottom + sy }; };
  const vis = e => { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
    const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const hiddenUp = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p);
    if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05 || p.hidden || p.getAttribute('aria-hidden') === 'true' && p.closest('svg')) return true; } return false; };
  const sel = e => { let s = e.tagName.toLowerCase(); if (e.id) return s + '#' + e.id;
    const c = [...e.classList].filter(x => !/^(is-|active|visible|in-view)/.test(x)).slice(0, 2); if (c.length) s += '.' + c.join('.');
    const p = e.parentElement; if (p && !e.id) { const pc = p.id ? '#' + p.id : (p.classList[0] ? '.' + p.classList[0] : p.tagName.toLowerCase()); s = pc + ' > ' + s; } return s; };
  const txt = e => (e.innerText || e.getAttribute('aria-label') || e.alt || '').replace(/\s+/g, ' ').trim().slice(0, 60);

  // sections: the header, every top-level section, the shared CTA and the footer
  const secEls = [];
  const hd = document.querySelector('body > header, header.top, header.site-header-common'); if (hd) secEls.push(hd);
  [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section')).forEach(s => secEls.push(s));
  const ft = document.querySelector('footer.bf-footer, body > footer, .bf-site-footer, footer'); if (ft && !secEls.includes(ft) && !ft.closest('section')) secEls.push(ft);
  const keyOf = (s, i) => s.id ? '#' + s.id : (s.tagName.toLowerCase() + (s.classList[0] ? '.' + s.classList[0] : '') + ':' + i);
  const sections = secEls.filter(vis).map((s, i) => ({ key: keyOf(s, i), el: s, rect: R(s) }));
  const secOf = e => { const s = sections.find(x => x.el.contains(e)); return s ? s.key : '(page)'; };

  const issues = []; const add = (type, level, e, msg, extra) => issues.push({ type, level, section: e ? secOf(e) : '(page)', sel: e ? sel(e) : '', text: e ? txt(e) : '', msg, rect: e ? R(e) : null, ...(extra || {}) });

  // 1 sideways scroll
  const sw = document.documentElement.scrollWidth;
  if (sw > W + 1) add('hscroll', 'error', null, `page scrolls sideways by ${sw - W}px`);

  // text leaves: visible elements with their own text
  const all = [...document.body.querySelectorAll('*')].filter(e => !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'svg', 'path'].includes(e.tagName));
  const leaves = all.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1) && vis(e) && !hiddenUp(e)).slice(0, 2500);
  const clips = e => { for (let p = e.parentElement; p && p !== document.documentElement; p = p.parentElement) { const c = getComputedStyle(p);
    if (/(hidden|clip|auto|scroll)/.test(c.overflowX + c.overflowY)) return p; } return null; };

  for (const e of leaves) {
    const c = getComputedStyle(e), b = e.getBoundingClientRect();
    // 2 text past the screen edge (and not inside a clipping/scrolling box, e.g. a carousel)
    if ((b.right > W + 1 || b.left < -1) && !clips(e)) add('offscreen', 'error', e, `text runs past the screen edge (${Math.round(b.left)}…${Math.round(b.right)} of ${W})`);
    // 3 text cut by its own box
    const ov = c.overflowX + c.overflowY;
    if (/(hidden|clip)/.test(ov) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2) && e.clientHeight > 0) {
      const intended = c.textOverflow === 'ellipsis' || (c.webkitLineClamp && c.webkitLineClamp !== 'none');
      add('clipped', intended ? 'warn' : 'error', e, intended ? 'text shortened with … / line clamp' : `text cut: content ${e.scrollWidth}×${e.scrollHeight} in a ${e.clientWidth}×${e.clientHeight} box`);
    }
    // 4 text cut by a clipping parent
    const cp = clips(e);
    if (cp && !/(auto|scroll)/.test(getComputedStyle(cp).overflowX + getComputedStyle(cp).overflowY)) {
      const pb = cp.getBoundingClientRect();
      const out = Math.max(pb.left - b.left, b.right - pb.right, pb.top - b.top, b.bottom - pb.bottom);
      if (out > 2 && out < Math.max(b.width, b.height) && b.width > 4) add('cut-by-parent', 'warn', e, `text partly hidden by ${sel(cp)} (${Math.round(out)}px outside)`);
    }
    // 5 tiny text, 6 fonts outside the brand
    const fs = parseFloat(c.fontSize);
    if (fs < (phone ? 11 : 10)) add('tiny-text', 'warn', e, `text ${fs}px`);
    const fam = c.fontFamily.toLowerCase();
    if (!/(sofia|chillax|mono|courier|menlo|sf mono)/.test(fam)) add('font', 'warn', e, `font: ${c.fontFamily.split(',')[0]}`);
  }

  // 7 overlapping text (two text leaves on top of each other, neither inside the other)
  const boxes = leaves.map(e => ({ e, b: e.getBoundingClientRect(), s: secOf(e) })).filter(x => x.b.width > 2 && x.b.height > 2);
  const seen = new Set();
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j]; if (A.s !== B.s) continue;
    if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    const ix = Math.min(A.b.right, B.b.right) - Math.max(A.b.left, B.b.left), iy = Math.min(A.b.bottom, B.b.bottom) - Math.max(A.b.top, B.b.top);
    if (ix <= 3 || iy <= 3) continue;
    const small = Math.min(A.b.width * A.b.height, B.b.width * B.b.height);
    if (ix * iy < 0.2 * small) continue;
    const k = sel(A.e) + '|' + sel(B.e); if (seen.has(k)) continue; seen.add(k);
    add('overlap', 'warn', A.e, `overlaps "${txt(B.e).slice(0, 30)}" (${sel(B.e)})`, { rect2: R(B.e) });
  }

  // 8 images that did not load
  for (const im of document.images) if (im.complete && im.naturalWidth === 0 && vis(im) && !hiddenUp(im)) add('image', 'error', im, `image failed: ${im.currentSrc || im.src}`);

  // 9 tap targets on phones (MOBILE-RULES L1/B3: buttons 40, tabs and links 44 tap area)
  if (phone) for (const e of document.querySelectorAll('a[href], button, [role=button], [role=tab], input, select, summary')) {
    if (!vis(e) || hiddenUp(e)) continue;
    const b = e.getBoundingClientRect(), p = e.parentElement;
    const inline = e.tagName === 'A' && p && (p.innerText || '').trim().length > (e.innerText || '').trim().length + 20;
    if (!inline && b.height < 40 && b.width < 300) add('tap', 'warn', e, `tap target ${Math.round(b.width)}×${Math.round(b.height)}`);
  }

  // 10 headings off the content line (--try-margin from 600 up, 24px on phones), unless centred
  const m = phone ? 24 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--try-margin')) || null;
  if (m) for (const s of sections) {
    const h = [...s.el.querySelectorAll('h1, h2')].find(vis); if (!h) continue;
    const b = h.getBoundingClientRect(), c = getComputedStyle(h);
    const centred = c.textAlign === 'center' || Math.abs((b.left + b.right) / 2 - W / 2) < 6;
    // the heading's own left edge, or its first line of text
    const r = document.createRange(); r.selectNodeContents(h); const rs = [...r.getClientRects()].filter(x => x.width > 0); const left = rs.length ? Math.min(...rs.map(x => x.left)) : b.left;
    if (!centred && Math.abs(left - m) > 2 && left < W / 2) add('content-line', 'warn', h, `heading starts at ${Math.round(left)}px, content line is ${Math.round(m)}px`);
  }

  // 11 the same id twice (anchors and labels break)
  const ids = {}; for (const e of document.querySelectorAll('[id]')) ids[e.id] = (ids[e.id] || 0) + 1;
  for (const [k, n] of Object.entries(ids)) if (n > 1) add('duplicate-id', 'warn', null, `id "${k}" is used ${n} times`);

  const links = [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith(location.origin) && !/\.(pdf|zip)$/.test(h)).map(h => h.split('#')[0]))];
  return { W, H: document.documentElement.scrollHeight, sections: sections.map(s => ({ key: s.key, rect: s.rect })), issues, links };
}
