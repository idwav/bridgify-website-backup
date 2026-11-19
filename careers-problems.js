// "The problems you'd work on": the section is pinned from its top and the page's scroll moves through the four problems.
// Clicking one scrolls to it. If the scene cannot fit the screen (or motion is reduced) it is a normal section with taps.
(() => {
  const pin = document.querySelector('.cpp2-pin'); if (!pin) return;
  const sticky = pin.querySelector('.cpp2-sticky'), grid = pin.querySelector('.cpp2-grid'), items = [...pin.querySelectorAll('.cpp2-list li')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let step = 0;
  const fit = () => { const h = sticky.offsetHeight; sticky.style.top = Math.max(0, Math.min(88, innerHeight - h - 12)) + 'px'; return h > innerHeight - 8; };
  const set = n => { if (n === step) return; step = n; grid.dataset.step = n; items.forEach((li, i) => li.setAttribute('aria-pressed', String(i === n - 1))); };
  const geo = () => { const top = parseFloat(sticky.style.top) || 0, r = pin.getBoundingClientRect(); return { top, r, span: Math.max(1, pin.offsetHeight - sticky.offsetHeight - top) }; };
  function fromScroll() {
    if (fit()) { pin.classList.add('is-flat'); return; }
    pin.classList.remove('is-flat');
    const g = geo(), p = Math.max(0, Math.min(.999, -(g.r.top - g.top) / g.span));
    set(Math.min(items.length, Math.floor(p * items.length) + 1));
  }
  items.forEach((li, i) => {
    const pick = () => { if (pin.classList.contains('is-flat')) { set(i + 1); return; } const g = geo(); scrollTo({ top: scrollY + g.r.top - g.top + g.span * (i + .5) / items.length, behavior: reduced.matches ? 'auto' : 'smooth' }); };
    li.addEventListener('click', pick);
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  addEventListener('scroll', fromScroll, { passive: true }); addEventListener('resize', fromScroll);
  set(1); fromScroll();
})();
