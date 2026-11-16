/* Airlines · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .aj-intro > p'), 3);
    const j = $('#section-1 .aj-journey'), line = j && j.querySelector(':scope > svg');
    if (line) { line.classList.add('ad-aj-line'); j.after(line); }   // the connector is decoration; it must not count as a card
    A.scroller(j, {card: '86%'});
    A.fold($('#section-2 .ar-heading > p'), 4);
    A.scroller($('#section-2 .ar-layout'), {card: '90%'});
    A.fold($('#section-3 .al-loyalty > p'), 2);
    A.zoomFit($('#section-3 .al-phone'), 420);
  }
  /* Choose how: the two products are peers, not a sequence. A switch shows one whole card at a time. */
  { const g = $('#section-4 .xc-grid'); if (g && g.children.length > 1) A.tabs($('#section-4'), [...g.children], {when: A.MQ.mobile, before: g, label: 'Choose how'}); }
})();
