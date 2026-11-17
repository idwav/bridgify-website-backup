/* Super apps · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .sc-hero-copy > p'), 3);
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Round 11 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
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

  rise($('#section-1 .sc-hero-copy'), $('#section-1 .sc-preview'));
  /* Connect experiences to what users are planning: the three moments are stations. The steps, the words for the
     chosen one and the phone stay on screen; the page's scroll moves from one to the next. */
  const steps = $('#section-3 .up-story-steps'), phone = $('#section-3 .up-story-phone');
  if (steps && phone) {
    const tabs = $$('button', steps), copies = $$('#section-3 .up-story-copy');
    A.pin([steps, ...copies, phone], {steps: tabs.length, per: .5, className: 'ad-up-pin', onStep: i => {
      tabs[i].click();
      steps.scrollTo({left: tabs[i].offsetLeft - steps.offsetLeft - (steps.clientWidth - tabs[i].offsetWidth) / 2, behavior: 'smooth'});
    }});
  }
})();
