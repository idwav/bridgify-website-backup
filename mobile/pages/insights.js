/* Insights · mobile (≤599): long paragraphs fold (Read more), so a card shows its point and stays small. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  document.querySelectorAll('.blog-about div > p').forEach(p => A.fold(p, 3));
  const fp = document.querySelector('.blog-feature .blog-feature-copy > p'); if (fp) A.fold(fp, 3);
  document.querySelectorAll('.blog-card .blog-card-copy > p').forEach(p => A.fold(p, 2, {always: true}));
})();
