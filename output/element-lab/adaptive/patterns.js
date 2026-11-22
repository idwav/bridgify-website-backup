/* Bridgify adaptive layer · pattern behaviour
   Exposes window.BridgifyAdaptive. Page files (pages/<page>.js) call these helpers with real selectors.
   Nothing here writes new copy: tab labels, menu items and links are taken from the page itself. */
(() => {
  if (window.BridgifyAdaptive) return;
  const MQ = {
    mobile: matchMedia('(max-width:599px)'),
    tablet: matchMedia('(min-width:600px) and (max-width:1023px)'),
    compact: matchMedia('(max-width:1023px)')
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Compact header with a full-height menu built from the existing navigation. */
  function menu() {
    const header = $('header.site-header-common'); if (!header || $('.ad-menu-btn', header)) return;
    const nav = $('nav', header), actions = $('.nav-actions', header);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ad-menu-btn'; btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'ad-menu');
    btn.innerHTML = '<i aria-hidden="true"></i>';
    (actions || header).after(btn);
    const sheet = document.createElement('div');
    sheet.className = 'ad-menu'; sheet.id = 'ad-menu'; sheet.tabIndex = -1; sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Menu');
    [...(nav ? nav.children : [])].forEach(item => {
      if (item.matches('details')) {
        const d = document.createElement('details'); d.className = 'ad-menu-group'; if (item.classList.contains('has-current')) { d.classList.add('has-current'); d.open = true; }
        const s = document.createElement('summary'); s.textContent = $('summary', item).textContent.trim(); d.append(s);
        const box = document.createElement('div'); box.className = 'ad-menu-links';
        $$('a', item).forEach(a => { const c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); if (a.getAttribute('aria-current')) c.setAttribute('aria-current', 'page'); box.append(c); });
        d.append(box); sheet.append(d);
      } else if (item.matches('a')) {
        const c = document.createElement('a'); c.className = 'ad-menu-row'; c.href = item.getAttribute('href'); c.textContent = item.textContent.trim(); if (item.getAttribute('aria-current')) c.setAttribute('aria-current', 'page'); sheet.append(c);
      }
    });
    if (actions) {
      const box = document.createElement('div'); box.className = 'ad-menu-actions';
      $$('a', actions).forEach(a => { const c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); box.append(c); });
      sheet.append(box);
    }
    document.body.append(sheet);
    // One group open at a time keeps the list short.
    $$('.ad-menu-group', sheet).forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.ad-menu-group', sheet).forEach(o => o !== d && (o.open = false)); }));
    const set = on => {
      sheet.classList.toggle('is-open', on); btn.setAttribute('aria-expanded', String(on));
      document.documentElement.classList.toggle('ad-menu-lock', on);
      if (on) sheet.focus({preventScroll: true}); else btn.focus({preventScroll: true});
    };
    btn.addEventListener('click', () => set(!sheet.classList.contains('is-open')));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) set(false); });
    MQ.compact.addEventListener('change', () => { if (!MQ.compact.matches) set(false); });
    return {open: () => set(true), close: () => set(false)};
  }

  /* 2. Horizontal scroller with peek and a position indicator. */
  function scroller(el, opts = {}) {
    if (!el || el.classList.contains('ad-scroller')) return;
    el.classList.add('ad-scroller');
    if (opts.card) el.style.setProperty('--ad-card', opts.card);
    if (opts.tablet) el.style.setProperty('--ad-card-tablet', opts.tablet);
    const items = [...el.children];
    const dots = document.createElement('div'); dots.className = 'ad-dots'; dots.setAttribute('aria-hidden', 'true');
    items.forEach(() => dots.append(document.createElement('i')));
    el.after(dots);
    const sync = () => {
      const x = el.scrollLeft, w = el.clientWidth;
      let best = 0, bd = Infinity;
      items.forEach((it, i) => { const d = Math.abs(it.offsetLeft - el.offsetLeft - x - parseFloat(getComputedStyle(el).paddingLeft || 0)); if (d < bd) { bd = d; best = i; } });
      if (x + w >= el.scrollWidth - 4) best = items.length - 1;
      [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i === best));
    };
    el.addEventListener('scroll', () => requestAnimationFrame(sync), {passive: true});
    addEventListener('resize', sync); sync();
    return el;
  }

  /* 3. Segmented tabs: show one panel at a time on mobile and tablet.
     labels: strings taken from the panels' own headings. existing: reuse buttons already in the markup. */
  function tabs(root, panels, opts = {}) {
    if (!root || !panels.length || root.classList.contains('ad-tabs-ready')) return;
    root.classList.add('ad-tabs-ready');
    const when = opts.when || MQ.compact;
    let bar, buttons;
    if (opts.existing && opts.existing.length) {
      bar = opts.existing[0].parentElement; buttons = opts.existing;
      bar.classList.add('ad-seg-existing');
    } else {
      bar = document.createElement('div'); bar.className = 'ad-seg'; bar.setAttribute('role', 'tablist');
      if (opts.label) bar.setAttribute('aria-label', opts.label);
      buttons = panels.map((p, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab');
        b.textContent = (opts.labels && opts.labels[i]) || (($('h3,h4', p) || {}).textContent || String(i + 1)).trim().replace(/:$/, '');
        bar.append(b); return b;
      });
      (opts.before || panels[0]).before(bar);
    }
    panels.forEach((p, i) => { p.dataset.adPanel = i; if (!p.id) p.id = 'ad-panel-' + Math.random().toString(36).slice(2, 8); buttons[i].setAttribute('aria-controls', p.id); });
    let cur = opts.start || 0;
    const show = (i, focus) => {
      cur = i;
      panels.forEach((p, j) => p.classList.toggle('ad-on', j === i));
      buttons.forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
      if (focus) buttons[i].focus();
      opts.onShow && opts.onShow(i, panels[i]);
      dispatchEvent(new Event('resize'));
    };
    const apply = () => { root.classList.toggle('ad-tabs-on', when.matches); if (when.matches) show(cur); };
    // Capture phase, so on mobile and tablet the tabs switch panels instead of running the desktop scroll story.
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !when.matches) return;
      const i = buttons.indexOf(b); if (i < 0) return;
      e.stopPropagation(); e.preventDefault(); show(i);
    }, true);
    bar.addEventListener('keydown', e => {
      if (!when.matches) return;
      const d = {ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1}[e.key]; if (!d) return;
      e.preventDefault(); e.stopPropagation(); show((cur + d + panels.length) % panels.length, true);
    }, true);
    // A sideways swipe on the panel moves to the next or previous one.
    let sx = 0, sy = 0;
    panels.forEach(p => {
      p.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
      p.addEventListener('touchend', e => {
        if (!when.matches) return;
        const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(Math.min(panels.length - 1, Math.max(0, cur + (dx < 0 ? 1 : -1))));
      }, {passive: true});
    });
    when.addEventListener('change', apply); apply();
    return {show};
  }

  /* 4. Whole card is the tap target, using the card's own link. */
  function rowLinks(cards, linkSel = 'a') {
    cards.forEach(c => { const a = $(linkSel, c); if (a) { c.classList.add('ad-rowlink'); a.classList.add('ad-rowlink-a'); } });
  }

  /* 5. Footer link groups as an accordion on mobile. */
  function footer() {
    const nav = $('.bf-footer-nav'); if (!nav || nav.classList.contains('ad-acc')) return;
    nav.classList.add('ad-acc');
    $$('.bf-footer-group', nav).forEach(g => {
      const h = $('h3', g); if (!h) return;
      h.tabIndex = 0; h.setAttribute('role', 'button'); h.setAttribute('aria-expanded', 'false');
      const t = () => { const on = g.classList.toggle('is-open'); h.setAttribute('aria-expanded', String(on)); };
      h.addEventListener('click', () => MQ.mobile.matches && t());
      h.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && MQ.mobile.matches) { e.preventDefault(); t(); } });
    });
  }


  /* 6. Fit a fixed-size illustration into a height budget on mobile by scaling it down (centered). */
  function fit(wrap, maxH, opts = {}) {
    if (!wrap) return;
    const when = opts.when || MQ.mobile;
    const child = opts.child ? wrap.querySelector(opts.child) : wrap.firstElementChild; if (!child) return;
    const apply = () => {
      child.style.transform = ''; wrap.style.height = '';
      if (!when.matches || !wrap.offsetParent) return;
      const nat = child.offsetHeight; if (!nat) return;
      const s = Math.min(1, (typeof maxH === 'function' ? maxH() : maxH) / nat);
      if (s >= 1) return;
      child.style.transformOrigin = 'top center'; child.style.transform = `scale(${s})`;
      wrap.style.height = Math.ceil(nat * s) + 'px';
    };
    apply(); addEventListener('resize', apply); when.addEventListener('change', apply);
    return apply;
  }


  /* 6b. Zoom-fit: like fit(), but with CSS zoom, so layout, overlays and pointer input stay correct. */
  function zoomFit(el, maxH, opts = {}) {
    if (!el) return;
    const when = opts.when || MQ.mobile;
    const apply = () => {
      el.style.zoom = '';
      if (!when.matches || !el.offsetParent) return;
      const nat = el.offsetHeight; if (!nat) return;
      const s = Math.min(1, (typeof maxH === 'function' ? maxH() : maxH) / nat);
      if (s < 1) el.style.zoom = s.toFixed(3);
    };
    apply(); addEventListener('resize', apply); when.addEventListener('change', apply); addEventListener('load', apply);
    return apply;
  }

  /* 7. Tap to expand: a clamped block opens on tap (copy stays in the page, only folded). */
  function expander(el, opts = {}) {
    if (!el || el.classList.contains('ad-exp')) return;
    el.classList.add('ad-exp'); el.style.setProperty('--ad-lines', opts.lines || 2);
    if (!opts.trigger) { el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-expanded', 'false'); }
    const t = opts.trigger || el;
    const toggle = e => {
      if (!(opts.when || MQ.mobile).matches) return;
      if (e && e.target.closest('a') && el.classList.contains('ad-open')) return;
      const on = el.classList.toggle('ad-open'); (opts.trigger || el).setAttribute('aria-expanded', String(on));
    };
    t.addEventListener('click', toggle);
    if (!opts.trigger) el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }

  /* 7c. Fold with a visible + on the section's own background colour. */
  function fold(el, lines, o = {}) {
    if (!el || el.classList.contains('ad-exp')) return;
    /* A "Read more +" link under the folded text (the control the homepage already uses), not a + over the last word.
       Mobile only; tablet and desktop show the full text. */
    if (!MQ.mobile.matches) return;
    /* Fold only when it saves more than two lines; one or two extra lines just stay visible. Cards pass
       {always: true}: a card shows its first lines and Read more whenever there is more (user, 18 Nov 2026). */
    const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.5;
    const extra = Math.round(el.getBoundingClientRect().height / lh) - lines;
    if (o.always ? extra < 1 : extra <= 2) return;
    const more = document.createElement('button');
    more.type = 'button'; more.className = 'ad-more'; more.setAttribute('aria-expanded', 'false');
    more.innerHTML = 'Read more <span aria-hidden="true">+</span>';
    let bg = 'rgb(16,10,8)';
    for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; } }
    const [r, g, b] = (bg.match(/\d+/g) || [16, 10, 8]).map(Number);
    if (0.299 * r + 0.587 * g + 0.114 * b > 140) more.classList.add('ad-more-light');
    el.after(more);
    /* Same distance under every paragraph: cancel the parent's flex/grid gap, if it has one. */
    const pcs = getComputedStyle(el.parentElement), gap = /flex|grid/.test(pcs.display) ? parseFloat(pcs.rowGap) || 0 : 0;
    if (gap) more.style.setProperty('margin-top', `${-10 - gap}px`, 'important');
    expander(el, {lines, trigger: more});
  }

  /* 11. Pinned stations (phones): the stage stays on screen while the page scrolls, and the scroll moves the reader
     through its stations one by one (a trip, a passenger journey). The page's own height grows by one "step" per
     station, so the reader is never trapped: scrolling past the last station simply carries on. Off with reduced
     motion and on wider screens, where the stage is an ordinary block. els: the elements that form the stage. */
  function pin(els, o = {}) {
    els = [].concat(els).filter(Boolean); if (!els.length || els[0].closest('.ad-pin')) return null;
    const w = document.createElement('div'); w.className = 'ad-pin';
    const st = document.createElement('div'); st.className = 'ad-pin-stage';
    els[0].before(w); w.append(st); els.forEach(e => st.append(e));
    if (o.className) w.classList.add(o.className);
    // sticky needs every ancestor to let it stick: hidden/auto overflow becomes clip (same clipping, no scroll box)
    for (let a = w.parentElement; a && a !== document.body; a = a.parentElement) {
      const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important');
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    /* o.vh: the height to lay out against (default innerHeight); a page can pass the small viewport so Safari's moving
       toolbar does not move the stage or change the scroll per step */
    const VH = () => (o.vh ? o.vh() : innerHeight);
    const steps = o.steps || 2, per = () => Math.round(VH() * (o.per || .5));
    const head = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ad-header-h')) || 64;
    let last = -1, raf = 0, top = 0;
    const layout = () => {
      const on = MQ.mobile.matches && !reduced.matches;
      w.classList.toggle('is-on', on);
      if (!on) { w.style.height = ''; st.style.top = ''; return; }
      top = Math.max(head() + 12, Math.round((VH() - st.offsetHeight) / 2));
      st.style.top = top + 'px';
      w.style.height = (st.offsetHeight + per() * (steps - 1)) + 'px';
      tick();
    };
    const tick = () => {
      raf = 0; if (!w.classList.contains('is-on')) return;
      const run = Math.max(1, w.offsetHeight - st.offsetHeight);
      const p = Math.max(0, Math.min(1, (top - w.getBoundingClientRect().top) / run));
      if (o.onProgress) o.onProgress(p);
      const i = Math.min(steps - 1, Math.round(p * (steps - 1)));
      if (i !== last) { last = i; if (o.onStep) o.onStep(i); }
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, {passive: true});
    addEventListener('resize', layout); MQ.mobile.addEventListener('change', layout); reduced.addEventListener('change', layout);
    if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(layout)).observe(st);
    layout();
    return {wrap: w, stage: st, go: i => scrollTo({top: w.getBoundingClientRect().top + scrollY - top + per() * i, behavior: 'smooth'})};
  }

  /* 12. Hold and rise (phones): the first scroll does not move the section; only `mover` rises (its negative top
     margin grows one pixel per pixel scrolled) over what is above it, `run` pixels in all; then the page goes on.
     `els` are the elements that hold (they go into a holder of fixed height with a sticky stage inside, so the stage
     shrinks exactly as fast as the holder scrolls away). base(): the overlap at rest; run(): how far mover rises. */
  function hold(els, mover, o = {}) {
    els = [].concat(els).filter(Boolean); if (!els.length || !mover || els[0].closest('.ad-hold')) return null;
    for (let a = els[0].parentElement; a && a !== document.body; a = a.parentElement) {
      const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important');
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const w = document.createElement('div'); w.className = 'ad-hold' + (o.className ? ' ' + o.className : '');
    const st = document.createElement('div'); st.className = 'ad-hold-stage';
    els[0].before(w); w.append(st); els.forEach(e => st.append(e));
    let base = 0, run = 0, top = 0;
    const on = () => MQ.mobile.matches && !reduced.matches;
    const set = v => mover.style.setProperty('margin-top', -Math.round(v) + 'px', 'important');
    const measure = () => {
      w.style.height = ''; st.style.position = ''; st.style.top = '';
      base = o.base ? o.base() : 0; set(base);
      if (!on()) { mover.style.removeProperty('margin-top'); return; }
      run = Math.max(0, o.run ? o.run() : 0);
      w.style.height = st.offsetHeight + 'px';
      top = Math.round(w.getBoundingClientRect().top + scrollY);
      st.style.position = 'sticky'; st.style.top = top + 'px';
      tick();
    };
    const tick = () => { if (!on() || !run) return; const s = Math.max(0, Math.min(run, top - w.getBoundingClientRect().top)); set(base + s); };
    let raf = 0; addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); }, {passive: true});
    const rest = () => { if (scrollY < 2 || top - w.getBoundingClientRect().top < 1) measure(); };
    addEventListener('resize', measure); addEventListener('bf-shown', measure); addEventListener('load', () => setTimeout(measure, 200));
    if (window.ResizeObserver) els.filter(e => e !== mover).forEach(e => new ResizeObserver(() => requestAnimationFrame(rest)).observe(e));
    measure();
    return {wrap: w, stage: st, measure};
  }

  window.BridgifyAdaptive = {MQ, menu, scroller, tabs, rowLinks, footer, fit, zoomFit, expander, reduce, fold, pin, hold};
  const boot = () => { menu(); footer(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* Line breaks (mobile + tablet): the coloured phrase in a title ("enterprise security", "the right book.") stays on
   one line whenever it fits the title's width, so a title never ends on one stray accent word. */
(() => {
  const mq = matchMedia('(max-width:1023px)');
  const keep = () => document.querySelectorAll(':is(h1,h2,h3) em, :is(h1,h2,h3) .v2-ink').forEach(e => {
    e.style.whiteSpace = '';
    if (!mq.matches) return;
    const box = e.closest('h1,h2,h3'); e.style.whiteSpace = 'nowrap';
    const cs = getComputedStyle(box), inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    // it must fit inside the title's column and inside the page's side margin (a title box can be wider than the
    // column it sits in); a phrase 4px past the margin broke the grid
    const gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ad-gutter')) || 24;
    const r = e.getBoundingClientRect(), right = Math.min(box.getBoundingClientRect().right - parseFloat(cs.paddingRight), document.documentElement.clientWidth - gut);
    if (r.width > inner + 1 || r.right > right + 0.5) e.style.whiteSpace = '';
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', keep); else keep();
  addEventListener('load', keep); addEventListener('resize', keep);
  if (document.fonts) document.fonts.ready.then(keep);
})();

/* Label → title gap (mobile + tablet): every section's small uppercase label sits exactly 16px above its title,
   whatever margins, gaps or flex rules each page brought. Measured on layout positions (entrance animations move
   things with transforms, which must not count), then corrected on the title's top margin. Section titles only:
   the first h2 of each section, never a heading inside a demo. */
(() => {
  const mq = matchMedia('(max-width:1023px)'), GAP = 16;
  const top = el => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  const labelFor = h => {
    const ht = top(h); let best = null;
    h.closest('section').querySelectorAll('*').forEach(e => {
      if (e.contains(h) || h.contains(e) || e.closest('[aria-hidden=true]') || !e.offsetParent) return;
      const first = e.childNodes[0]; const t = (first && first.nodeType === 3 ? e.textContent : '').trim();
      if (!t || t.length > 60) return;
      const c = getComputedStyle(e); if (c.textTransform !== 'uppercase' && t !== t.toUpperCase()) return;
      if (parseFloat(c.fontSize) > 14) return;
      const b = top(e) + e.offsetHeight; if (!e.offsetHeight || b > ht + 2 || ht - b > 80) return;
      if (Math.abs(e.getBoundingClientRect().left - h.getBoundingClientRect().left) > 40) return;
      if (!best || b > best.b) best = {e, b};
    });
    return best && best.e;
  };
  const run = () => {
    // pages with a role map get all their spacing from system/rhythm.js on phones
    if (window.BridgifyRoles && matchMedia('(max-width:599px)').matches) return;
    document.querySelectorAll('section').forEach(sec => {
      if (sec.parentElement.closest('section')) return;
      const h = sec.querySelector('h2'); if (!h) return;
      h.style.removeProperty('margin-top');
      if (!mq.matches || !h.offsetHeight || h.closest('[aria-hidden=true]')) return;
      const lab = labelFor(h); if (!lab) return;
      lab.style.setProperty('margin-bottom', '0px', 'important');  // stop margin collapsing from hiding the correction
      for (let i = 0; i < 3; i++) {
        const d = top(h) - (top(lab) + lab.offsetHeight) - GAP;
        if (Math.abs(d) < 1) break;
        const m = parseFloat(getComputedStyle(h).marginTop) || 0;
        h.style.setProperty('margin-top', `${m - d}px`, 'important');
      }
    });
  };
  const later = () => setTimeout(run, 60);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
  addEventListener('load', later); addEventListener('resize', later);
  if (document.fonts) document.fonts.ready.then(later);
})();

/* Hero title tag: the visible hero title is a different element on each page (h1, or a display h2 when the h1 is
   visually hidden). Tag the one a reader sees so one shared rule (patterns.css .ad-hero-title) sizes every hero alike. */
(() => {
  const seen = el => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; for (let a = el; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || /inset\(50%\)/.test(c.clipPath)) return false; } return true; };
  const tag = () => {
    const hero = [...document.querySelectorAll('main section, body > section')].find(s => !s.parentElement.closest('section') && s.offsetHeight > 100);
    if (!hero) return;
    const t = [...hero.querySelectorAll('h1, [data-copy-display], h2')].find(seen);
    if (t) t.classList.add('ad-hero-title');
  };
  tag();  // at once, before the first paint; again when the document is complete
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tag);
})();

/* Product cards as a stack (solutions pages, phones): the covered card steps back, as on the homepage products. */
(() => {
  const grid = document.querySelector('.xc .xc-grid'); if (!grid) return;
  const mq = matchMedia('(max-width:599px)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...grid.children]; let raf = 0;
  for (let a = grid.parentElement; a && a !== document.body; a = a.parentElement) {
    const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important');
  }
  const paint = () => { raf = 0;
    cards.forEach((c, i) => { const n = cards[i + 1];
      if (!mq.matches || reduced.matches || !n) { c.style.removeProperty('scale'); c.style.removeProperty('filter'); return; }
      const r = c.getBoundingClientRect(), q = n.getBoundingClientRect(), p = Math.max(0, Math.min(1, (r.bottom - q.top) / r.height));
      c.style.setProperty('scale', String(1 - p * .08)); c.style.setProperty('filter', `brightness(${1 - p * .45})`); });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); addEventListener('resize', paint); paint();
})();

/* One heading style (see patterns.css): every coloured word in a section heading that is not already the moving
   gradient gets it, in the dark-section or the light-section colours, decided by the heading's own text colour. */
(() => {
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return 1; const [r, g, b] = m.map(Number); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const run = () => document.querySelectorAll('section h1:not(.copy-seo), section h2').forEach(h => {
    const hc = getComputedStyle(h);
    [...h.querySelectorAll('span, em')].forEach(a => {
      if (a.closest('.ad-ink') || a.querySelector('span, em')) return;
      const c = getComputedStyle(a);
      if (c.animationName && c.animationName !== 'none') return;              // already the moving gradient
      const coloured = c.backgroundImage !== 'none' || c.color !== hc.color;
      if (!coloured || !a.textContent.trim()) return;
      a.classList.add('ad-ink'); if (lum(hc.color) < .5) a.classList.add('ad-ink-light');
    });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
