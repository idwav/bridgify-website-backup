// Pixel audit: classify visible editorial elements by role and measure them against the approved spec.
(() => {
  const W = innerWidth, dev = W < 600 ? 'phone' : W < 1024 ? 'tablet' : 'desktop';
  const cv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const px = v => parseFloat(v);
  const clamp = (a, v, b) => Math.min(Math.max(a, v), b);
  const SPEC = dev === 'tablet'
    ? { hero: [40, 56], section: [36, 36], card: [24, 24] }
    : { hero: [clamp(40, .036 * W, 60) - .5, clamp(40, .036 * W, 60) + .5], section: [clamp(36, .03 * W, 44) - .5, clamp(36, .03 * W, 44) + .5], card: [clamp(24, .019 * W, 28) - .5, clamp(24, .019 * W, 28) + .5] };
  const GAP = { label_title: px(cv('--bf-gap-label-title')), title_text: px(cv('--bf-gap-title-text')), to_actions: px(cv('--bf-gap-to-actions')), to_content: px(cv('--bf-gap-to-content')), section_y: px(cv('--bf-section-y')) };
  const margin = (() => { const t = document.createElement('div'); t.style.cssText = 'position:absolute;width:var(--try-margin)'; document.body.appendChild(t); const m = t.getBoundingClientRect().width; t.remove(); return m; })();
  const DEMO = '[aria-hidden="true"], svg, [role="img"], footer, .site-header-common, header.top, .bf-cta-shell, [class*="demo"], [class*="-vis"], [class*="mock"], [class*="stage"], [class*="screen"], [class*="browser"], [class*="window"], [class*="phone"], [class*="device"], [class*="app-"], [class*="-app"], [class*="code"], [class*="ticket"], [class*="map"], [class*="chat"], [class*="inbox"], [class*="email"], [class*="panel"], [class*="preview"], [class*="widget"], [class*="scene"], .copy-seo:not(#section-1 .copy-seo)';
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let a = e; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05) return false; } return true; };
  const inDemo = e => !!e.closest(DEMO);
  const R = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const firstLine = e => { const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 }); const n = tw.nextNode(); if (!n) return null; const rg = document.createRange(); rg.setStart(n, 0); rg.setEnd(n, Math.min(1, n.length)); const r = rg.getClientRects()[0]; return r ? r.top + scrollY : null; };
  const cvs = document.createElement('canvas').getContext('2d');
  // top of the inked glyphs of the first line (cap/x-height tops), in page px
  const inkTop = e => { const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 }); const n = tw.nextNode(); if (!n) return null; const rg = document.createRange(); const i0 = n.textContent.search(/\S/); rg.setStart(n, i0); rg.setEnd(n, Math.min(n.length, i0 + 1)); const r0 = rg.getClientRects()[0]; if (!r0) return null;
    // collect the first line's text (same top as the first character)
    let s = ''; for (let k = i0; k < n.length; k++) { rg.setStart(n, k); rg.setEnd(n, k + 1); const rr = rg.getClientRects()[0]; if (!rr || Math.abs(rr.top - r0.top) > 2) break; s += n.textContent[k]; }
    const c = getComputedStyle(n.parentElement); cvs.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`; const m = cvs.measureText(s.trim() || 'H');
    return r0.top + scrollY + (m.fontBoundingBoxAscent - m.actualBoundingBoxAscent) * (r0.height / (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)); };
  const typo = e => { const c = getComputedStyle(e); return { fam: c.fontFamily.split(',')[0].replace(/"/g, ''), wt: c.fontWeight, fs: +px(c.fontSize).toFixed(2), lh: c.lineHeight === 'normal' ? 'normal' : +(px(c.lineHeight) / px(c.fontSize)).toFixed(2), ls: c.letterSpacing, col: c.color, tt: c.textTransform }; };
  const txt = e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 48);
  const sec = e => { const s = e.closest('section'); return s ? (s.id || String(s.className).split(' ')[0]) : '-'; };
  const issues = [], items = [];
  const flag = (kind, e, msg, extra = {}) => issues.push({ kind, sec: sec(e), text: txt(e), box: R(e), msg, ...extra });
  const sections = [...document.querySelectorAll('main section, body > section')].filter(s => !s.parentElement.closest('section') && !s.closest('footer') && vis(s));
  sections.forEach((s, si) => {
    const isHero = si === 0;
    const title = [...s.querySelectorAll(isHero ? 'h1, h2' : 'h2, h1')].find(h => vis(h) && !inDemo(h) && !(h.classList.contains('copy-seo') && !vis(h)));
    if (!title) return;
    const role = isHero ? 'hero' : 'section';
    const t = typo(title); items.push({ role, sec: sec(title), text: txt(title), ...t, box: R(title) });
    const [lo, hi] = SPEC[role];
    if (t.fs < lo - .01 || t.fs > hi + .01) flag('type', title, `${role} title ${t.fs}px (spec ${lo.toFixed(1)}–${hi.toFixed(1)})`);
    if (t.fam !== 'Chillax' || t.wt !== '300') flag('type', title, `${role} title ${t.fam} ${t.wt} (spec Chillax 300)`);
    // eyebrow above the title
    const hb = title.getBoundingClientRect();
    const eb = [...s.querySelectorAll('div, span, p')].filter(x => vis(x) && !inDemo(x) && x.children.length <= 1 && x.textContent.trim().length > 2 && x.textContent.trim().length < 90 && getComputedStyle(x).textTransform === 'uppercase').map(x => [x, x.getBoundingClientRect()]).filter(([x, r]) => r.bottom <= hb.top + 1 && hb.top - r.bottom < 80 && Math.abs(r.left - hb.left) < 40).sort((a, b) => b[1].bottom - a[1].bottom)[0];
    if (eb) {
      const et = typo(eb[0]); items.push({ role: 'eyebrow', sec: sec(eb[0]), text: txt(eb[0]), ...et, box: R(eb[0]) });
      if (et.fs !== 12 || et.fam !== 'Sofia' || +et.wt < 500) flag('type', eb[0], `eyebrow ${et.fam} ${et.wt} ${et.fs}px (spec Sofia 550 12px)`);
      const g = Math.round(hb.top - eb[1].bottom);
      // visual gap: label box bottom to title first-line box top
      const g2 = Math.round(firstLine(title) - scrollY - eb[1].bottom);
      if (Math.abs(g - GAP.label_title) > 2) flag('space', title, `eyebrow→title ${g}px (table ${GAP.label_title})`);
    }
    // intro paragraph and split alignment
    const intro = [...s.querySelectorAll('p')].filter(p => vis(p) && !inDemo(p) && p.textContent.trim().length > 30).map(p => [p, p.getBoundingClientRect()]).filter(([p, r]) => r.top < hb.bottom + 200 && r.top > hb.top - 200)[0];
    if (intro) {
      const [p, pr] = intro; const it = typo(p); items.push({ role: 'intro', sec: sec(p), text: txt(p), ...it, box: R(p) });
      if (Math.abs(it.fs - 16) > .01 || it.fam !== 'Sofia') flag('type', p, `intro ${it.fam} ${it.wt} ${it.fs}px (spec Sofia 400 16px)`);
      const split = pr.left > hb.right - 4;
      if (split) {
        const d = Math.round(inkTop(p) - inkTop(title));
        // compare cap tops: shift by half-leading difference of the two first lines
        if (Math.abs(d) > 1) flag('align', p, `split intro text top ${d > 0 ? d + 'px below' : -d + 'px above'} the title's text top`, { d });
        if (dev === 'tablet') flag('align', p, 'split heading on tablet (rule: stack title → intro)');
      } else {
        const g = Math.round(pr.top - hb.bottom);
        if (pr.top > hb.bottom && Math.abs(g - GAP.title_text) > 2) flag('space', p, `title→intro ${g}px (table ${GAP.title_text})`);
      }
    }
    // content line
    const lx = Math.round(hb.left), want = Math.round(margin);
    if (Math.abs(lx - want) > 1 && getComputedStyle(title).textAlign !== 'center') flag('line', title, `title starts at x=${lx}, content line ${want}`);
  });
  // inner headings (cards)
  document.querySelectorAll('main h3, section h3').forEach(h => { if (!vis(h) || inDemo(h) || h.closest('details, .faq, #faq')) return; const t = typo(h); items.push({ role: 'card', sec: sec(h), text: txt(h), ...t, box: R(h) }); const [lo, hi] = SPEC.card; if (t.fs < lo - .01 || t.fs > hi + .01) flag('type', h, `card title ${t.fam} ${t.wt} ${t.fs}px (spec ${lo.toFixed(1)}–${hi.toFixed(1)})`); });
  // body text
  document.querySelectorAll('main p, section p').forEach(p => { if (!vis(p) || inDemo(p) || p.textContent.trim().length < 40) return; const t = typo(p); if (!['rgb(215, 201, 189)', 'rgb(84, 68, 64)'].includes(t.col)) flag('color', p, `text colour ${t.col} (spec #D7C9BD on dark, #544440 on cream)`); if (t.fs < 14 || t.fs > 18 || t.fam !== 'Sofia') flag('type', p, `body ${t.fam} ${t.wt} ${t.fs}px (spec Sofia 400 16px, secondary 14–16)`); });
  // buttons
  document.querySelectorAll('main a, section a').forEach(a => { if (!vis(a) || inDemo(a)) return; const c = getComputedStyle(a), r = a.getBoundingClientRect(); const boxed = c.borderStyle !== 'none' && px(c.borderTopWidth) > 0 && r.height >= 36 && r.height <= 90; if (!boxed) return;
    const bg = c.backgroundImage !== 'none' ? c.backgroundImage : c.backgroundColor; const coralBorder = /244, 102, 73|238, 154, 114|255, 167, 109|224, 87, 59/.test(c.borderColor);
    const stops = (bg.match(/rgba?\([^)]*\)/g) || []); const alpha = c2 => { const m = c2.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/); return m ? +m[1] : 1; };
    const transparent = stops.length === 0 || stops.every(c2 => alpha(c2) < .2);
    const primary = /255, 152, 98|244, 102, 73|236, 149, 94/.test(bg) && !transparent;
    const kind = primary ? 'primary' : (coralBorder && transparent ? 'secondary' : 'other');
    const t = typo(a); items.push({ role: 'button-' + kind, sec: sec(a), text: txt(a), ...t, h: Math.round(r.height), radius: c.borderTopLeftRadius, box: R(a) });
    if (kind === 'other') flag('button', a, `button is neither primary nor secondary (bg ${bg.slice(0, 40)}, border ${c.borderColor})`);
    if (Math.round(r.height) !== 52 && W >= 600) flag('button', a, `button height ${Math.round(r.height)} (spec 52)`);
    if (t.fs !== 16 || t.fam !== 'Sofia') flag('button', a, `button text ${t.fam} ${t.wt} ${t.fs}px (spec Sofia 550 16px)`);
  });
  return { dev, W, margin: Math.round(margin), gap: GAP, sw: document.documentElement.scrollWidth, issues, items };
})()
