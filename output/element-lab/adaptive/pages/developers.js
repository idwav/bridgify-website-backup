/* Developers · mobile (≤599): one section ≈ one screen. Folding, not removing (18 Nov 2026). */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  /* What good looks like: the long paragraph folds to three lines (Read more opens it). */
  A.fold($('#performance .dev-heading > div > p'), 3);
  /* The two moments (Search, Checkout) are two plain blocks, one above the other (the user's choice, 18 Nov 2026). */
})();

/* Hero on phones: as the reader scrolls, the code window rises over the hero copy (which stays and steps back, as on
   OTAs) and opens to the screen edges; then the page goes on. --dv-open goes 0 → 1 while the window's top travels
   from the bottom of the screen to 45% up it. With reduced motion the window simply sits full width. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const v = document.querySelector('#section-1 .ahc-visual'), c = document.querySelector('#section-1 .dev-code-copy'); if (!v || !c) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  const paint = () => {
    raf = 0;
    if (!A.MQ.mobile.matches || reduced.matches) { v.style.removeProperty('--dv-open'); c.style.removeProperty('scale'); c.style.removeProperty('filter'); return; }
    const vr = v.getBoundingClientRect(), cr = c.getBoundingClientRect(), h = innerHeight;
    v.style.setProperty('--dv-open', Math.max(0, Math.min(1, (h - vr.top) / (h * 0.55))).toFixed(3));
    const cov = Math.max(0, Math.min(1, (cr.bottom - vr.top) / cr.height));
    c.style.setProperty('scale', String(1 - cov * 0.06));
    c.style.setProperty('filter', `brightness(${1 - cov * 0.5})`);
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask); A.MQ.mobile.addEventListener('change', ask); ask();
})();
