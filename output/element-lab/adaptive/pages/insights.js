/* Insights · mobile (≤599): long intro paragraphs fold to three lines. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  document.querySelectorAll(".blog-about div > p").forEach(p => A.fold(p, 3));
})();
