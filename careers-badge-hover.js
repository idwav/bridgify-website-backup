// Careers hero: the team badge swings left and right with the pointer (desktop with a mouse only) and settles with a small overshoot.
(() => {
  const cb = document.querySelector('.cb'), swing = cb && cb.querySelector('.cb-swing');
  if (!swing || !matchMedia('(hover:hover) and (min-width:1101px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  cb.addEventListener('pointermove', e => {
    const r = cb.getBoundingClientRect(), x = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    swing.classList.add('is-moving');
    swing.style.setProperty('--r', (-x * 6).toFixed(2) + 'deg');
  });
  cb.addEventListener('pointerleave', () => { swing.classList.remove('is-moving'); swing.style.setProperty('--r', '0deg'); });
})();
