/* About · mobile (≤599): the friend's phone design stays (map, hub, mission scenes); this layer only adds the
   site-wide phone rules and folds the long paragraphs (Read more opens them). Folding, not removing (18 Nov 2026). */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  A.fold($('#top .ab-hero-copy > p'), 3);
  document.querySelectorAll('#our-story .ab-story-3 > p').forEach(p => A.fold(p, 3));
  A.fold($('#hbx .ab-hbx-p'), 3);
})();
