/* Super apps · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .sc-hero-copy > p'), 3);
    A.zoomFit($('#section-1 .sc-preview'), 440);
    A.zoomFit($('#section-3 .up-story-phone'), 400);
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();
