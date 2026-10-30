// The V2 copy is independent of V1; disclosures retain their native keyboard behavior.
(() => {
  const section = document.querySelector('.bv2-why');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new WeakMap();
  const paused = () => document.querySelector('.hero')?.classList.contains('paused');

  document.querySelector('.opx-explanation')?.removeAttribute('open');
  section.querySelectorAll('.bv2-tile').forEach(tile => {
    const summary = tile.querySelector('summary');
    const reveal = tile.querySelector('.bv2-reveal');
    const inner = tile.querySelector('.bv2-reveal-inner');
    tile.dataset.open = String(tile.open);
    summary.addEventListener('click', event => {
      event.preventDefault();
      const open = tile.dataset.open !== 'true';
      const fromHeight = tile.open ? reveal.getBoundingClientRect().height : 0;
      const fromOpacity = tile.open ? getComputedStyle(reveal).opacity : 0;
      animations.get(tile)?.cancel();
      animations.delete(tile);
      tile.dataset.open = String(open);
      if (reduced.matches || paused() || !reveal.animate) {
        tile.open = open;
        return;
      }
      tile.open = true;
      const toHeight = open ? inner.getBoundingClientRect().height : 0;
      const animation = reveal.animate([
        { height: `${fromHeight}px`, opacity: fromOpacity },
        { height: `${toHeight}px`, opacity: open ? 1 : 0 }
      ], { duration: open ? 460 : 300, easing: 'cubic-bezier(.16,1,.3,1)' });
      animations.set(tile, animation);
      animation.onfinish = () => {
        if (animations.get(tile) !== animation) return;
        tile.open = open;
        animations.delete(tile);
      };
    });
    tile.addEventListener('toggle', () => {
      if (!animations.has(tile)) tile.dataset.open = String(tile.open);
    });
    // A link in a disclosure must be visible before keyboard focus reaches it.
    tile.addEventListener('focusin', () => tile.closest('.bv2-row').classList.add('is-visible'));
  });

  const rows = [...section.querySelectorAll('.bv2-row')];
  const ready = new Set();
  let pairEntering = false;
  let pairTimer = 0;
  function revealNextPair() {
    if (pairEntering || reduced.matches || paused()) return;
    const row = rows.find(item => ready.has(item) && !item.classList.contains('is-visible'));
    if (!row) return;
    ready.delete(row);
    pairEntering = true;
    row.classList.add('is-visible');
    // Finish one pair's entrance before beginning another, even after a fast scroll.
    pairTimer = setTimeout(() => {
      pairEntering = false;
      revealNextPair();
    }, 1000);
  }
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('is-visible')) ready.add(entry.target);
        else ready.delete(entry.target);
      });
      revealNextPair();
    }, { threshold: 0.05, rootMargin: '0px 0px -25% 0px' });
    rows.forEach(row => { row.classList.add('is-pending'); observer.observe(row); });
  }
  function syncMotion() {
    section.classList.toggle('bv2-motion-paused', Boolean(paused()));
    if (reduced.matches || paused()) {
      clearTimeout(pairTimer);
      pairEntering = false;
      ready.clear();
      rows.forEach(row => row.classList.add('is-visible'));
      section.querySelectorAll('.bv2-tile').forEach(tile => {
        animations.get(tile)?.cancel();
        animations.delete(tile);
        tile.open = tile.dataset.open === 'true';
      });
    }
  }
  reduced.addEventListener('change', syncMotion);
  document.getElementById('motion')?.addEventListener('click', syncMotion);
  syncMotion();
})();
