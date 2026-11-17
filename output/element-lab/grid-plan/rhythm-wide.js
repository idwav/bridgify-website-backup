/* Lab only · step 3 trial: the approved phone rhythm engine (PR #9 system/rhythm.js) run on tablet and desktop.
   Same role map (roles-index-v2.js), same pair → token rule, values from tokens-wide.css. Differences for wide layouts:
   - only gaps between items stacked one under the other are set; items side by side (copy column | visual column,
     button | link) keep the layout they have, and nothing is restacked into a column;
   - the hero keeps its own height and vertical placement (only the gaps inside its copy change);
   - phones (≤599) are never touched.
   Exposes window.BridgifyRhythmWide = {apply, clear, report}. */
(() => {
  const MAP = window.BridgifyRoles; if (!MAP) return;
  // elements that exist only from tablet up (the phone map never sees them): the step title in "Why Bridgify" sits
  // between the tabs and the step's paragraph; as a "sub" it gets control→sub 32 and sub→text 16
  // On wide screens all four steps sit in the page at once (the active one shows), so its items are read from the
  // active step, and the same gaps are then given to the other steps (mirrorSteps).
  const ACT = 'article.wy-step.is-active ';
  const WIDE = {'#why-bridgify': {after: 'control', item: ['sub', ACT + 'div.wy-copy > h4'], scope: ['div.wy-copy > p', 'div.wy-copy > a.wy-more']}};
  MAP.sections.forEach(S => { const x = WIDE[S.section]; if (!x || S.items.some(i => i[1] === x.item[1])) return;
    S.items.forEach(i => { if (x.scope.includes(i[1])) i[1] = ACT + i[1]; });
    const k = S.items.findIndex(i => i[0] === x.after); if (k >= 0) S.items.splice(k + 1, 0, x.item); });
  const MQ = matchMedia('(min-width:600px)');
  const root = document.documentElement;
  const tok = n => getComputedStyle(root).getPropertyValue('--bf-' + n).trim();

  const pair = (a, b, hero) => {
    if (a === 'more') a = 'text';
    if (a === 'title' && b === 'sub') return 'gap-title-sub';
    if (a === 'sub') a = 'text';
    if (b === 'foot') return 'gap-to-foot';
    if (b === 'visual' || (hero && b === 'content')) return 'gap-to-visual';
    if (a === 'label') return 'gap-label-title';
    if (a === 'title' && b === 'text') return 'gap-title-text';
    if (a === 'text' && b === 'text') return 'gap-text-text';
    if (b === 'more') return 'gap-text-more';
    if (b === 'dots') return 'gap-control-content';
    if (a === 'dots') a = 'content';
    if (b === 'link') return /^(text|actions|link)$/.test(a) ? 'gap-to-link' : 'gap-to-content';
    if (b === 'actions') return 'gap-to-actions';
    if (b === 'control') return 'gap-to-control';
    if (a === 'control') return 'gap-control-content';
    return 'gap-to-content';
  };

  const touched = [];
  const set = (el, prop, val) => { touched.push([el, prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]); el.style.setProperty(prop, val, 'important'); };
  const clear = () => { while (touched.length) { const [el, p, v, pr] = touched.pop(); if (v) el.style.setProperty(p, v, pr); else el.style.removeProperty(p); } root.removeAttribute('data-bf-rhythm-wide'); last = []; };
  const shown = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const c = getComputedStyle(el); return c.display !== 'none' && c.visibility !== 'hidden'; };
  const chain = (el, stop) => { const out = []; for (let a = el.parentElement; a && a !== stop; a = a.parentElement) out.push(a); return out; };
  const common = (a, b) => { for (let x = a.parentElement; x; x = x.parentElement) if (x.contains(b)) return x; return null; };
  const textLink = el => el.classList.contains('ad-more') || el.dataset.bfRole === 'link';
  const padTop = el => textLink(el) ? parseFloat(getComputedStyle(el).paddingTop) : 0;
  const padBot = el => textLink(el) ? parseFloat(getComputedStyle(el).paddingBottom) : 0;
  // b sits under a (not beside it): its top is at or below a's bottom, give or take a few px of overlap
  const below = (a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return rb.top >= ra.bottom - 8 && rb.left < ra.right && rb.right > ra.left - 1 || rb.top >= ra.bottom + 1; };

  let last = [];   // the pairs set on the last run, for report()
  const apply = () => {
    clear(); if (!MQ.matches) return;
    root.dataset.bfRhythmWide = MAP.page;
    MAP.sections.forEach(S => {
      const sec = document.querySelector(S.section); if (!sec) return;
      const frame = S.frame ? sec.querySelector(S.frame) : sec; if (!frame) return;
      const items = S.items.filter(([role]) => role !== 'deco').map(([role, sel]) => ({role, els: [...frame.querySelectorAll(sel)].filter(shown)})).filter(i => i.els.length);
      // a "link" that renders as a framed button on wider screens (API "Read more" in #network) is spaced as a button
      items.forEach(i => { if (i.role === 'link' && i.els.every(e => parseFloat(getComputedStyle(e).borderTopWidth) > 0)) i.role = 'actions'; });
      if (!items.length) return;
      items.forEach(i => i.els.forEach(el => { el.dataset.bfRole = i.role; }));
      // which consecutive items are stacked: measured on the page as it is, before anything moves
      const stacked = items.map((B, k) => k > 0 && below(items[k - 1].els[items[k - 1].els.length - 1], B.els[0]));
      // frame edges: on non-hero sections the section padding is the only space above the first item and below the last
      if (!S.hero) {
        const first = items[0].els[0], lastI = items[items.length - 1], lastEl = lastI.els[lastI.els.length - 1];
        [first, ...chain(first, frame)].forEach(w => { set(w, 'margin-top', '0px'); if (w !== first) set(w, 'padding-top', '0px'); });
        [lastEl, ...chain(lastEl, frame)].forEach(w => { set(w, 'margin-bottom', '0px'); if (w !== lastEl) set(w, 'padding-bottom', '0px'); });
        if (!S.frame) { set(sec, 'padding-top', tok('section-y')); set(sec, 'padding-bottom', tok('section-y')); }
      }
      items.forEach(i => i.els.slice(1).forEach(el => { if (below(i.els[0], el) && el.parentElement === i.els[0].parentElement) set(el, 'margin-top', '0px'); }));
      // button rows: the gap between buttons
      items.filter(i => i.role === 'actions').forEach(i => i.els.forEach(el => { if (!el.matches('a,button')) { set(el, 'row-gap', tok('gap-actions-inner')); set(el, 'column-gap', tok('gap-actions-inner')); } }));
      for (let k = 1; k < items.length; k++) {
        if (!stacked[k]) continue;
        const A = items[k - 1], B = items[k];
        const a = A.els[A.els.length - 1], b = B.els[0];
        const ca = common(a, b); if (!ca) continue;
        const grid = [A, B].some(I => I.els.length > 1 && I.els.filter(e => e.parentElement === ca).length > 1);
        if (!grid) set(ca, 'row-gap', '0px');
        [a, ...chain(a, ca)].forEach(w => { set(w, 'margin-bottom', '0px'); if (w !== a) set(w, 'padding-bottom', '0px'); });
        chain(b, ca).forEach(w => { ['margin-top', 'padding-top', 'border-top-width'].forEach(p => set(w, p, '0px')); });
        const name = pair(A.role, B.role, S.hero), g = parseFloat(tok(name));
        let z = 1; for (let w = b; w && w !== ca; w = w.parentElement) z *= parseFloat(getComputedStyle(w).zoom) || 1;
        const t0 = b.getBoundingClientRect().top, row = B.els.length > 1 ? B.els.filter(e => Math.abs(e.getBoundingClientRect().top - t0) < 4 || e.getBoundingClientRect().top < t0) : [b];
        // a button that shares a row with a link (hero "Book a demo" + "See how it works"): the gap goes on the row,
        // so both stay on one centre line instead of the button dropping below the link
        const rowBox = B.els.length === 1 && chain(b, ca).find(w => { const c = getComputedStyle(w); return /flex/.test(c.display) && !/column/.test(c.flexDirection) && [...w.children].filter(x => x.getBoundingClientRect().width > 1).length > 1; });
        if (rowBox) { set(b, 'margin-top', '0px'); set(rowBox, 'margin-top', ((g - padBot(a)) / z) + 'px'); }
        else row.forEach(e => set(e, 'margin-top', ((g - padBot(a) - padTop(e)) / z) + 'px'));
        last.push({section: S.section, a: A.role, b: B.role, token: name, want: g, aEl: a, bEl: b, above: items.slice(0, k).flatMap(I => I.els)});
      }
    });
  };
  // give every "Why Bridgify" step the gaps measured on the active one, so changing step never needs a re-run
  const mirrorSteps = () => {
    const steps = [...document.querySelectorAll('#why-bridgify article.wy-step')], act = steps.find(x => x.classList.contains('is-active')); if (!act) return;
    ['div.wy-copy', 'div.wy-copy > h4', 'div.wy-copy > p', 'div.wy-copy > a.wy-more'].forEach(sel => { const src = act.querySelector(sel); if (!src) return;
      ['margin-top', 'padding-top', 'border-top-width', 'margin-bottom', 'padding-bottom'].forEach(prop => { const v = src.style.getPropertyValue(prop); if (!v) return;
        steps.forEach(st => { if (st === act) return; const el = st.querySelector(sel); if (el) set(el, prop, v); }); }); });
  };
  const applyAll = () => { apply(); if (MQ.matches) mirrorSteps(); };
  // the gaps as they render now, against the token each one should have
  const report = () => last.map(p => ({section: p.section, pair: p.a + '→' + p.b, token: p.token, want: p.want,
    x: Math.round(p.bEl.getBoundingClientRect().left + scrollX), y: Math.round(p.bEl.getBoundingClientRect().top + padTop(p.bEl) + scrollY),
    // measured from the lowest thing above it in its column: under a split heading that is the longer column
    got: Math.round((p.bEl.getBoundingClientRect().top + padTop(p.bEl)) - Math.max(p.aEl.getBoundingClientRect().bottom - padBot(p.aEl), ...p.above.filter(e => { const r = e.getBoundingClientRect(), b = p.bEl.getBoundingClientRect();
      // only what sits in b's own column (starts within b's horizontal span) and above it
      return r.height > 1 && r.top < b.top && r.left >= b.left - 2 && r.left < b.right; }).map(e => e.getBoundingClientRect().bottom)))}));

  const run = () => requestAnimationFrame(applyAll);
  applyAll();
  if (document.fonts) document.fonts.ready.then(run);
  MQ.addEventListener('change', run);
  // No re-run while scrolling: re-spacing the page mid-scroll shifted the layout above the reader and made the
  // scroll jump (up to 774px per wheel step in "Why Bridgify"). The four steps share one structure, so the active
  // step's gaps are copied to the other three once (see mirrorSteps).
  addEventListener('resize', (() => { let t; return () => { clearTimeout(t); t = setTimeout(run, 150); }; })());
  window.BridgifyRhythmWide = {apply: applyAll, clear, report};
})();
