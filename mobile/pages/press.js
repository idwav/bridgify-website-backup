/* Press · mobile (≤599): each news card's summary folds to two lines (Read more opens it); the About text to three. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  document.querySelectorAll('.nr-coverage .nr-card-copy > p').forEach(p => A.fold(p, 2, {always: true}));
  document.querySelectorAll('.nr-about > p').forEach(p => A.fold(p, 3));
})();
