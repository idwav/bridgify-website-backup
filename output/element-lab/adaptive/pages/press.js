/* Press · mobile (≤599): the About text folds to three lines. News cards show a two-line summary (CSS) and come six at a
   time: "Show more articles" opens the next six. Filtering or searching starts again at six (owner, 22 Nov 2026). */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  document.querySelectorAll('.nr-about > p').forEach(p => A.fold(p, 3));
  const grid = document.querySelector('.nr-coverage .nr-grid'), count = document.querySelector('.nr-coverage .nr-count');
  if (!grid) return;
  const STEP = 6; let limit = STEP;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ad-show-more';
  grid.after(btn);
  const apply = () => {
    const shown = [...grid.querySelectorAll('.nr-card')].filter(c => !c.hidden);
    shown.forEach((c, i) => c.classList.toggle('ad-later', i >= limit));
    grid.querySelectorAll('.nr-card[hidden]').forEach(c => c.classList.remove('ad-later'));
    const rest = shown.length - limit;
    btn.hidden = rest <= 0;
    btn.textContent = rest > 0 ? `Show more articles (${rest})` : '';
  };
  btn.addEventListener('click', () => {
    const first = grid.querySelector('.nr-card.ad-later');
    limit += STEP; apply();
    if (first) { const a = first.querySelector('a.nr-link, a'); if (a) a.focus({preventScroll: true}); }
  });
  if (count) new MutationObserver(() => { limit = STEP; apply(); }).observe(count, {childList: true, characterData: true, subtree: true});
  apply();
})();
