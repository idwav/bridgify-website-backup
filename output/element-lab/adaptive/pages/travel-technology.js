/* Travel technology · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .te-intro > p'), 3);
    A.fold($('#section-2 .th-intro > p'), 3);

    A.scroller($('#section-3 .ad-columns'), {card: '88%'});
  }
  /* Choose how: one whole card at a time behind a switch on phones. */
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Round 11 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  /* Hero, as OTAs, White-Label and Loyalty: the copy stays and steps back; the demo rises over it at its own size,
     then the page goes on. */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rise = (copy, demo) => {
    if (!copy || !demo) return;
    for (let a = copy.parentElement; a && a !== document.body; a = a.parentElement) {
      const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important'); }
    let raf = 0;
    const paint = () => { raf = 0;
      if (reduced.matches) { copy.style.removeProperty('scale'); copy.style.removeProperty('filter'); return; }
      const c = copy.getBoundingClientRect(), d = demo.getBoundingClientRect(), cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      copy.style.setProperty('scale', String(1 - cov * .06)); copy.style.setProperty('filter', `brightness(${1 - cov * .5})`); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();
  };

  // the eyebrow and the heading hold together
  const eb = $('#section-1 .te-eyebrow'), hd = $('#section-1 .te-heading');
  if (eb && hd) { const box = document.createElement('div'); box.className = 'ad-te-copy'; eb.before(box); box.append(eb, hd); rise(box, $('#section-1 .te-visual')); }
})();
