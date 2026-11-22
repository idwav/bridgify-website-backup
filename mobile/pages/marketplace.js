/* White-Label Marketplace · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1 · Hero: copy first; the live store demo takes whatever is left of the first screen. */
  /* Concept · one responsive component: below 1024 the brand settings sit above the store as their own panel,
     and the store keeps its natural size. No zoom. */

  /* Round 2 · the hero lead folds so the store demo gets the rest of the screen. */
  if (A.MQ.mobile.matches) A.fold($('#section-1 .block-copy > p.lead'), 4);

  /* 2 · Discovery to checkout: intro folds; the four-stage store fits a 420px budget. */
  A.fold($('#section-2 header > p'), 3);
  A.zoomFit($('#section-2 .presentation'), 420);

  /* 3 · Branding: intro folds; the preview fits under the three control rows. */
  A.fold($('#section-3 .wl-heading > p'), 3);
  A.zoomFit($('#section-3 .wl-preview-stage'), 330);

  /* 4 · What runs underneath: intro folds. */
  A.fold($('#section-4 .wo-heading > p'), 3);

  /* 5 · Live in 3 days: lead folds; the days scroll sideways; the store preview fits 360px. */
  A.fold($('#section-5 .launch-heading p.lead'), 3);
  /* The three days are a sequence: they stack as a list on phones (no sideways scroll). */
  A.zoomFit($('#section-5 .launch-store'), 300);

  /* 6 · Build or buy: one side at a time. */
  const bb = $('#build-or-buy');
  if (bb) A.tabs(bb, $$('.bc-card', bb), {when: A.MQ.mobile, before: $('.bc-comparison', bb), label: 'Build or buy', start: 1});
})();

/* Round 7 */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  /* Hero: the copy behind the rising store steps back (down to 94%, dimmer) by how much of it is covered. */
  const copy = $('#section-1 .block-copy'), demo = $('#section-1 .market-demo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (copy && demo) {
    let raf = 0;
    const paint = () => { raf = 0;
      if (!A.MQ.mobile.matches || reduced.matches) { copy.style.removeProperty('scale'); copy.style.removeProperty('filter'); return; }
      const c = copy.getBoundingClientRect(), d = demo.getBoundingClientRect();
      const cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      copy.style.setProperty('scale', String(1 - cov * .06)); copy.style.setProperty('filter', `brightness(${1 - cov * .5})`);
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();
  }
  /* Live in 3 days: the timeline overlaps half of the store, whatever the store's height. */
  const store = $('#section-5 .launch-store');
  if (store) { const set = () => document.documentElement.style.setProperty('--ad-store-h', store.offsetHeight + 'px'); set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(store); }
  /* Discovery to checkout: on phones the tour moves on to the next screen after 3.6s instead of 5–6.5s. It presses the
     tour's own next button, so the tour's animation and state stay its own. */
  const tour = $('.market-product-tour'), nav = tour && [...tour.querySelectorAll('.stages button')];
  if (tour && nav && nav.length > 1 && A.MQ.mobile.matches && !reduced.matches) {
    let seen = false, at = performance.now(), cur = -1;
    new IntersectionObserver(es => { seen = es[0].isIntersecting; at = performance.now(); }, {threshold: .3}).observe(tour);
    setInterval(() => {
      const i = nav.findIndex(b => b.getAttribute('aria-pressed') === 'true');
      if (i !== cur) { cur = i; at = performance.now(); }
      if (seen && !document.hidden && performance.now() - at > 3600) { nav[(i + 1) % nav.length].click(); at = performance.now(); }
    }, 200);
  }
})();

/* Round 8: the store in "Live in 3 days" sticks while the timeline passes over it; touch shows the pressed rows. */
(() => {
  const st = document.querySelector('#section-5 .launch-store');
  if (st) for (let a = st.parentElement; a && a !== document.body; a = a.parentElement) {
    const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important');
  }
  document.addEventListener('touchstart', () => {}, {passive: true});
})();

/* Round 19 (17 Nov 2026), phones: Your brand, your markets, your currencies. The settings are not for tapping on a
   phone: they change by themselves while the section is on screen, and the store under them follows, both in view
   at once (the card and the preview fit one screen together). */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const lay = document.querySelector('#section-3 .wl-layout'); if (!lay) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const btn = (g, i) => { const grp = lay.querySelector(`.wl-group[data-group="${g}"]`); return grp && grp.querySelectorAll('button')[i]; };
  const seq = [['mode', 1], ['lang', 1], ['currency', 1], ['mode', 2], ['lang', 2], ['currency', 2], ['mode', 0], ['lang', 0], ['currency', 0]];
  lay.querySelectorAll('.wl-group button').forEach(b => b.setAttribute('tabindex', '-1'));
  let vis = false, k = 0;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, {threshold: .6}).observe(lay);
  setInterval(() => {
    if (!vis || document.hidden || reduced.matches) return;
    const [g, i] = seq[k % seq.length]; k++; const b = btn(g, i); if (b) b.click();
  }, 2200);
})();

/* Owner, 22 Nov 2026 (phones): the store window in "From discovery to checkout" is as tall as its tallest screen, and the
   phone preview's background in "Your brand, your markets" runs the width of the settings card above it. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const root = document.documentElement;
  const screens = document.querySelector('#section-2 .screens');
  const tourFit = () => {
    if (!screens || !A.MQ.mobile.matches) return;
    let hi = 0;
    screens.querySelectorAll('article.screen').forEach(a => {
      const t = a.getBoundingClientRect().top;
      a.querySelectorAll('*').forEach(e => { const g = getComputedStyle(e); if (g.display === 'none') return;
        const r = e.getBoundingClientRect(); if (r.height) hi = Math.max(hi, r.bottom - t); });
    });
    if (hi) root.style.setProperty('--ad-tour-h', Math.ceil(hi + 20) + 'px');
  };
  const stage = document.querySelector('#section-3 .wl-preview-stage'), card = document.querySelector('#section-3 .wl-controls');
  const stageFit = () => {
    if (!stage || !card || !A.MQ.mobile.matches) return;
    const z = parseFloat(getComputedStyle(stage).zoom) || 1, cs = getComputedStyle(card);
    /* lengths on the zoomed stage are multiplied by its zoom: divide, so it renders at the card's width and radius */
    root.style.setProperty('--ad-stage-w', (card.getBoundingClientRect().width / z).toFixed(1) + 'px');
    root.style.setProperty('--ad-stage-r', (parseFloat(cs.borderTopLeftRadius) / z).toFixed(1) + 'px');
    root.style.setProperty('--ad-stage-mt', (24 / z).toFixed(1) + 'px');
  };
  const fit = () => { tourFit(); stageFit(); };
  fit(); addEventListener('load', () => setTimeout(fit, 300)); addEventListener('resize', fit);
})();
