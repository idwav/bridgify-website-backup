/* Hotels · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .hm-intro > p'), 3);
    A.zoomFit($('#section-1 .hm-map'), 400);
    A.fold($('#section-2 .hr-heading > p'), 3);
    A.fold($('#section-2 .hr-footer > p'), 2);
    A.zoomFit($('#section-3 .hs-preview'), 440);
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();
