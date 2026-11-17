/* Loyalty and finance · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .lf-heading > div > p'), 3);
    A.zoomFit($('#section-1 .lr-demo'), 440);
    $$('#section-2 .lp-copy > p').forEach(p => A.fold(p, 3));
    A.scroller($('#section-2 .lp-demo'), {card: '88%'});
    $$('#section-3 .lu-explanation p').forEach(p => A.fold(p, 3));
    A.zoomFit($('#section-3 .lu-panels'), 380);
    A.fold($('#we-started-here > header > p'), 3);
  }
  /* Choose how: the two products are peers, not a sequence. A switch shows one whole card at a time. */
  { const g = $('#section-4 .xc-grid'); if (g && g.children.length > 1) A.tabs($('#section-4'), [...g.children], {when: A.MQ.mobile, before: g, label: 'Choose how'}); }
})();
