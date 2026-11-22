/* Bridgify spacing system · rhythm engine (lab version).
   Reads the page's role map (system/roles/<page>.js) and gives every gap its value from tokens.css, by the pair of
   roles it sits between. Nothing else sets spacing: the page's own margins, paddings and gaps between the mapped
   elements are cleared first, whatever DOM nesting they come from.

   On the live site the same map becomes classes (.bf-label, .bf-title ...) and these rules become plain CSS in
   @layer system. In the lab the old CSS still fights back with !important, so the engine writes inline
   !important values, and removes them when the screen leaves the mobile range. */
(() => {
  const MAP = window.BridgifyRoles; if (!MAP) return;
  const MQ = matchMedia('(max-width:599px)');
  const root = document.documentElement;
  const tok = n => getComputedStyle(root).getPropertyValue('--bf-' + n).trim();

  /* gap between two roles → token name */
  const pair = (a, b, hero) => {
    if (a === 'more') a = 'text';                       // Read more belongs to its paragraph
    if (a === 'title' && b === 'sub') return 'gap-title-sub'; // a one-line subtitle belongs to its title
    if (a === 'sub') a = 'text';
    if (b === 'foot') return 'gap-to-foot';             // closing lines under figures or cards (sentence, link, note)
    if (b === 'visual' || (hero && b === 'content')) return 'gap-to-visual';
    if (a === 'label') return 'gap-label-title';
    if (a === 'title' && b === 'text') return 'gap-title-text';
    if (a === 'text' && b === 'text') return 'gap-text-text';
    if (b === 'more') return 'gap-text-more';
    if (b === 'dots') return 'gap-control-content';     // scroller → its position dots
    if (a === 'dots') a = 'content';
    if (b === 'link') return /^(text|actions|link)$/.test(a) ? 'gap-to-link' : 'gap-to-content';
    if (b === 'actions') return 'gap-to-actions';
    if (b === 'control') return 'gap-to-control';
    if (a === 'control') return 'gap-control-content';   // whatever the tabs show starts 16 under them
    return 'gap-to-content';
  };

  // a paragraph folds only on phones where it saves lines, so "Read more" exists on some widths and not others:
  // it is never mapped, it is found next to its paragraph
  const withMore = items => { const out = []; items.forEach(i => { out.push(i); if (i.role !== 'text') return; const el = i.els[i.els.length - 1], m = el && el.nextElementSibling;
    if (m && m.classList.contains('ad-more') && shown(m)) out.push({role: 'more', els: [m]}); }); return out; };
  const touched = [];
  const set = (el, prop, val) => {
    touched.push([el, prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
    el.style.setProperty(prop, val, 'important');
  };
  const clear = () => { while (marks.length) { const [el, k] = marks.pop(); delete el.dataset[k]; } while (touched.length) { const [el, p, v, pr] = touched.pop(); if (v) el.style.setProperty(p, v, pr); else el.style.removeProperty(p); } };
  const shown = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const c = getComputedStyle(el); return c.display !== 'none' && c.visibility !== 'hidden'; };
  const chain = (el, stop) => { const out = []; for (let a = el.parentElement; a && a !== stop; a = a.parentElement) out.push(a); return out; };
  const common = (a, b) => { for (let x = a.parentElement; x; x = x.parentElement) if (x.contains(b)) return x; return null; };
  // the "Read more" link's tap area is 44px; spacing is measured to its visible text
  const textLink = el => el.classList.contains('ad-more') || el.dataset.bfRole === 'link';
  const padTop = el => textLink(el) ? parseFloat(getComputedStyle(el).paddingTop) : 0;
  const padBot = el => textLink(el) ? parseFloat(getComputedStyle(el).paddingBottom) : 0;
  const tone = el => { let bg = 'rgb(16,10,8)'; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; } }
    const [r, g, b] = (bg.match(/\d+/g) || [16, 10, 8]).map(Number); return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? 'light' : 'dark'; };
  const marks = [];
  const mark = (el, k, v) => { marks.push([el, k]); el.dataset[k] = v; };
  // buttons in a row: one primary at most, the rest secondary; equal widths, side by side only if both labels fit
  const buttons = el => el.matches('a,button') ? [el] : [...el.querySelectorAll(':scope > a, :scope > button')].filter(shown);
  const arrange = (row, hero) => {
    const bs = buttons(row); bs.forEach((b, i) => mark(b, 'bfKind', /primary/.test(b.className) || (i === 0 && bs.length > 1 && !/secondary|alt/.test(b.className)) ? 'primary' : 'secondary'));
    /* hero buttons (owner, 22 Nov 2026): short, as wide as their label, side by side when the pair fits the row;
       a pair that does not fit stacks, still short */
    if (hero) {
      mark(row, 'bfHero', '1');
      if (bs.length < 2 || row.matches('a,button')) return;
      const nat = bs.map(b => b.getBoundingClientRect().width), cs = getComputedStyle(row);
      /* room up to the content line (24px gutter), whatever the row's own box is (some rows run the full screen) */
      const edge = document.documentElement.clientWidth - (parseFloat(tok('gutter')) || 24) - bs[0].getBoundingClientRect().left;
      const inner = Math.min(row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), edge), gap = parseFloat(tok('gap-actions-hero')) || 8;
      mark(row, 'bfStack', nat.reduce((x, y) => x + y, 0) + gap * (bs.length - 1) <= inner + .5 ? 'row' : 'column');
      return;
    }
    if (bs.length < 2 || row.matches('a,button')) return;
    const nat = bs.map(b => { const w = b.style.width; b.style.setProperty('width', 'max-content', 'important'); const n = b.getBoundingClientRect().width; b.style.width = w; return n; });
    const cs = getComputedStyle(row), inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), gap = parseFloat(tok('gap-actions-inner'));
    mark(row, 'bfStack', Math.max(...nat) * bs.length + gap * (bs.length - 1) <= inner ? 'row' : 'column');
  };

  const apply = () => {
    clear(); if (!MQ.matches) return;
    root.dataset.bfRhythm = MAP.page;
    MAP.sections.forEach(S => {
      const sec = document.querySelector(S.section); if (!sec) return;
      const frame = S.frame ? (sec.matches(S.frame) ? sec : sec.querySelector(S.frame)) : sec;  // a section can be its own frame
      // resolve each item to its visible elements (a group such as FAQ rows counts as one block)
      const items = withMore(S.items.filter(([role, sel]) => role !== 'deco' && !(role === 'more' && /ad-more/.test(sel))).map(([role, sel]) => ({role, els: [...frame.querySelectorAll(sel)].filter(shown)})).filter(i => i.els.length));
      if (!items.length) return;
      items.forEach(i => i.els.forEach(el => {
        el.dataset.bfRole = i.role; if (i.role === 'link') mark(el, 'bfTone', tone(el));
        const d = getComputedStyle(el).display;
        // an inline label sits on a line box taller than itself; make it a block of its own width
        if (/^inline/.test(d) && i.role !== 'more') { set(el, 'display', d === 'inline-flex' ? 'flex' : 'block'); set(el, 'width', 'fit-content'); }
      }));
      // frame edges: section padding is the only space above the first and below the last item
      const first = items[0].els[0], lastI = items[items.length - 1], last = lastI.els[lastI.els.length - 1];
      [first, ...chain(first, frame)].forEach(w => { set(w, 'margin-top', '0px'); if (w !== first) set(w, 'padding-top', '0px'); });
      [last, ...chain(last, frame)].forEach(w => { set(w, 'margin-bottom', '0px'); if (w !== last) set(w, 'padding-bottom', '0px'); });
      // empty or invisible leftovers after the last item (an emptied paragraph, a hidden note) add no space
      [last, ...chain(last, frame)].forEach(w => { for (let n = w.nextElementSibling; n; n = n.nextElementSibling) { const r = n.getBoundingClientRect(), c = getComputedStyle(n); if (c.position !== 'absolute' && c.position !== 'fixed' && r.height < 2) { set(n, 'margin-top', '0px'); set(n, 'margin-bottom', '0px'); set(n, 'padding-top', '0px'); set(n, 'padding-bottom', '0px'); } } });
      // a text link's tap padding must not add to the section's own padding
      if (padTop(first)) set(first, 'margin-top', -padTop(first) + 'px');
      if (padBot(last)) set(last, 'margin-bottom', -padBot(last) + 'px');
      if (!S.frame) {
        set(sec, 'padding-top', S.hero ? `calc(var(--ad-header-h) + 8px + ${tok('hero-top')})` : tok('section-y'));
        // ...and so does every layout box between the hero and its first item (the homepage centred its copy)
        if (S.hero) [sec, ...chain(first, sec)].forEach(w => { const c = getComputedStyle(w); if (!/flex|grid/.test(c.display)) return;
          set(w, 'align-content', 'start'); if (!/column/.test(c.flexDirection) && /flex/.test(c.display)) set(w, 'align-items', 'flex-start'); else if (/grid/.test(c.display)) set(w, 'align-items', 'start'); else set(w, 'justify-content', 'flex-start'); });
        // a full-bleed stage that ends the section (MOBILE-RULES M5) meets the next section directly
        set(sec, 'padding-bottom', last.classList && last.classList.contains('ad-bleed') ? '0px' : tok('section-y'));
      }
      // inside a group (FAQ rows): no extra space between members beyond their own borders
      items.forEach(i => i.els.slice(1).forEach(el => set(el, 'margin-top', '0px')));
      // button rows
      items.filter(i => i.role === 'actions').forEach(i => i.els.forEach(el => {
        // a row of buttons has no padding, divider or side offset of its own (a single button keeps its frame)
        if (!el.matches('a,button')) {
          ['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width', 'margin-left', 'margin-right'].forEach(p => set(el, p, '0px'));
          set(el, 'row-gap', tok('gap-actions-inner')); set(el, 'column-gap', tok('gap-actions-inner'));
          set(el, 'justify-content', 'flex-start'); set(el, 'margin-left', '0px');
        } else ['margin-left', 'margin-right'].forEach(p => set(el, p, '0px'));
        arrange(el, S.hero);
        if (S.hero && !el.matches('a,button')) { set(el, 'row-gap', tok('gap-actions-hero')); set(el, 'column-gap', tok('gap-actions-hero')); }
      }));
      // each gap between consecutive items
      for (let k = 1; k < items.length; k++) {
        const A = items[k - 1], B = items[k];
        const a = A.els[A.els.length - 1], b = B.els[0];
        const ca = common(a, b); if (!ca) continue;
        // a group laid out as a grid (stat tiles, cards) keeps its own rows: only clear the gap of a plain stack
        const grid = [A, B].some(I => I.els.length > 1 && I.els.filter(e => e.parentElement === ca).length > 1);
        if (!grid) set(ca, 'row-gap', '0px');
        // a button and a link in one flex row (hero "Book a demo" + "See the …"): stack them, both on the margin
        const cd = getComputedStyle(ca); if (/flex/.test(cd.display) && !/column/.test(cd.flexDirection)) { set(ca, 'flex-direction', 'column'); set(ca, 'align-items', 'flex-start'); set(ca, 'justify-content', 'flex-start'); }
        [a, ...chain(a, ca)].forEach(w => { set(w, 'margin-bottom', '0px'); if (w !== a) set(w, 'padding-bottom', '0px'); });
        // wrappers between two mapped elements are structure only: no space, divider or side offset of their own
        chain(b, ca).forEach(w => { ['margin-top', 'padding-top', 'border-top-width', 'margin-left', 'margin-right'].forEach(p => set(w, p, '0px')); });
        const g = parseFloat(tok(pair(A.role, B.role, S.hero)));
        // a scaled element (CSS zoom, used to fit wide demos) scales its own margin too
        let z = 1; for (let w = b; w && w !== ca; w = w.parentElement) z *= parseFloat(getComputedStyle(w).zoom) || 1;
        // a grid group starts with a whole row: every tile on the first row moves down together
        const t0 = b.getBoundingClientRect().top, row = B.els.length > 1 ? B.els.filter(e => Math.abs(e.getBoundingClientRect().top - t0) < 4 || e.getBoundingClientRect().top < t0) : [b];
        row.forEach(e => set(e, 'margin-top', ((g - padBot(a) - padTop(e)) / z) + 'px'));
      }
    });
  };

  const run = () => requestAnimationFrame(apply);
  // apply at once (a script at the end of <body> sees the whole page), before the first paint; re-run when fonts and
  // late content settle. Waiting for a frame here showed the old spacing for one paint (system/stability.py).
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  addEventListener('load', run);
  if (document.fonts) document.fonts.ready.then(run);
  MQ.addEventListener('change', run);
  window.BridgifyRhythm = {apply, clear, pair, tok};
})();
