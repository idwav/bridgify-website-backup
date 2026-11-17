/* Hotels · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .hm-intro > p'), 3);
    A.fold($('#section-2 .hr-heading > p'), 3);
    A.fold($('#section-2 .hr-footer > p'), 2);
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Round 11 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  /* Hero: the map used to stretch (its drawing was squeezed into the phone's frame); it now keeps its proportions and
     is cropped instead. Round 12: from the first scroll, "Your hotel" and the map rise together, as one block, over
     the heading, which stays and steps back (as on OTAs and White-Label). */
  const svg = $('#section-1 .hm-map-stage > svg'); if (svg) svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  const head = $('#section-1 .hm-heading'), lay = $('#section-1 .hm-layout'), stay = $('#section-1 .hm-stay'), map = $('#section-1 .hm-map');
  if (head && lay) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'); let raf = 0;
    const paint = () => { raf = 0;
      if (reduced.matches) { head.style.removeProperty('scale'); head.style.removeProperty('filter'); return; }
      const c = head.getBoundingClientRect(), d = lay.getBoundingClientRect(), cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      head.style.setProperty('scale', String(1 - cov * .06)); head.style.setProperty('filter', `brightness(${1 - cov * .5})`); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();
  }
  /* Make experiences part of the stay: the three moments are stations. The preview leads and stays on screen; the
     steps run above it as one row, and the page's scroll moves from one to the next. */
  const steps = $('#section-3 .hs-steps'), prev = $('#section-3 .hs-preview');
  if (steps && prev) {
    const tabs = $$('button', steps);
    A.pin([steps, prev], {steps: tabs.length, per: .5, className: 'ad-hs-pin', onStep: i => {
      tabs[i].click();
      steps.scrollTo({left: tabs[i].offsetLeft - steps.offsetLeft - (steps.clientWidth - tabs[i].offsetWidth) / 2, behavior: 'smooth'});
    }});
  }
})();
