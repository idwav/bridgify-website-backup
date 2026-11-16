/* OTAs · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const m = A.MQ.mobile.matches;
  if (m) {
    const copy = $('#section-1 .ys-copy');
    A.fold($('#section-1 .ys-copy > p'), 3);
    A.zoomFit($('#section-1 .ys-ticket'), () => Math.max(560, innerHeight - (copy ? copy.offsetHeight : 420) - 60 - 28 - 24 - 28));
    A.fold($('#section-2 .ms-head > p:not(.sp-sub)'), 3);
    A.zoomFit($("#section-2 .sc"), 470);
    A.scroller($('#section-3 .rc-screens'), {card: '88%', tablet: '48%'});
  }
  /* Choose how: the two products are peers, not a sequence. A switch shows one whole card at a time. */
  { const g = $('#section-4 .xc-grid'); if (g && g.children.length > 1) A.tabs($('#section-4'), [...g.children], {when: A.MQ.mobile, before: g, label: 'Choose how'}); }
})();
