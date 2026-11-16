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
  /* Choose how: the two products are peers, not a sequence. A switch shows one whole card at a time. */
  { const g = $('#section-4 .xc-grid'); if (g && g.children.length > 1) A.tabs($('#section-4'), [...g.children], {when: A.MQ.mobile, before: g, label: 'Choose how'}); }
})();
