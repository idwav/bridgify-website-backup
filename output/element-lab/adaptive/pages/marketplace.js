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
