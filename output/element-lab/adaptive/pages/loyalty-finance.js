/* Loyalty and finance · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .lf-heading > div > p'), 3);
    $$('#section-2 .lp-copy > p').forEach(p => A.fold(p, 3));
    A.scroller($('#section-2 .lp-demo'), {card: '88%'});
    $$('#section-3 .lu-explanation p').forEach(p => A.fold(p, 3));
    A.fold($('#we-started-here > header > p'), 3);
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Round 11 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clip = el => { for (let a = el && el.parentElement; a && a !== document.body; a = a.parentElement) {
    const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important'); } };
  /* Hero, as OTAs and White-Label: the copy stays and steps back; the rewards demo rises over it, then the page goes on. */
  const copy = $('#section-1 .lf-heading'), demo = $('#section-1 .lr-demo');
  if (copy && demo) {
    clip(copy); let raf = 0;
    const paint = () => { raf = 0;
      if (reduced.matches) { copy.style.removeProperty('scale'); copy.style.removeProperty('filter'); return; }
      const c = copy.getBoundingClientRect(), d = demo.getBoundingClientRect(), cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      copy.style.setProperty('scale', String(1 - cov * .06)); copy.style.setProperty('filter', `brightness(${1 - cov * .5})`); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();
  }
  /* The redemption problem: points leave the ledger and become a reward. The two cards are a sequence, so the page's
     scroll carries the reader from one to the other (pinned), instead of a sideways swipe. */
  const lp = $('#section-2 .lp-demo');
  if (lp) { const dots = lp.nextElementSibling && lp.nextElementSibling.classList.contains('ad-dots') ? lp.nextElementSibling : null;
    A.pin([lp, dots], {steps: 2, per: .55, className: 'ad-lp-pin', onProgress: p => { lp.scrollLeft = p * (lp.scrollWidth - lp.clientWidth); }}); }
})();
