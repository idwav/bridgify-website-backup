/* Travel technology · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .te-intro > p'), 3);
    A.zoomFit($('#section-1 .te-visual'), 460);
    A.fold($('#section-2 .th-intro > p'), 3);

    A.scroller($('#section-3 .ad-columns'), {card: '88%'});
  }
  /* Choose how: one whole card at a time behind a switch on phones. */
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();
