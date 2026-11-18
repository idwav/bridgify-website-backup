/* Developers · mobile (≤599): one section ≈ one screen. Folding, not removing (18 Nov 2026). */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  /* What good looks like: the long paragraph folds to three lines (Read more opens it). */
  A.fold($('#performance .dev-heading > div > p'), 3);
  /* The two moments (Search, Checkout) side by side as a scroller; the reliability rows stay under it. */
  A.scroller($('#performance .dev-moments'), {card: '88%'});
})();
