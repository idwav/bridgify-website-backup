/* Insights · mobile (≤599): long paragraphs fold (Read more), so a card shows its point and stays small. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  /* About the Bridgify Blog (owner, 22 Nov 2026): one Read more only, the bottom one. The first paragraph reads in
     full; the second folds. */
  const aboutPs = [...document.querySelectorAll('.blog-about div > p')]; if (aboutPs.length) A.fold(aboutPs[aboutPs.length - 1], 3, {always: true});
  /* the Latest article's summary shows two lines, so the whole hero fits the first screen (owner, 22 Nov 2026) */
  const fp = document.querySelector('.blog-feature .blog-feature-copy > p'); if (fp) A.fold(fp, 2, {always: true});
  document.querySelectorAll('.blog-card .blog-card-copy > p').forEach(p => A.fold(p, 2, {always: true}));
})();

/* Owner, 22 Nov 2026 (phones): the Latest article's author line and "Read article" sit on one row. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const copy = document.querySelector('.blog-feature .blog-feature-copy'); if (!copy) return;
  const meta = copy.querySelector(':scope > .blog-meta'), link = copy.querySelector(':scope > .blog-link'); if (!meta || !link) return;
  const row = document.createElement('div'); row.className = 'ad-feature-foot';
  row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap';
  meta.before(row); row.append(meta, link);
  [meta, link].forEach(e => e.style.setProperty('margin', '0', 'important'));
})();
