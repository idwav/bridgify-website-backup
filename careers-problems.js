// The problems light up one by one (quiet, loops slowly); the glass card on the right warms up at the end of each round.
(() => {
  const root = document.querySelector('#problems'); if (!root) return;
  const rows = [...root.querySelectorAll('.cpp-row')], target = root.querySelector('.cpp-target');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!rows.length) return;
  let i = -1, timer = 0, visible = false;
  const paint = () => { rows.forEach((r, k) => r.classList.toggle('is-lit', k <= i)); target?.classList.toggle('is-glow', i >= rows.length - 1); };
  const tick = () => { i = i >= rows.length ? -1 : i + 1; if (i >= rows.length) { i = rows.length - 1; paint(); timer = setTimeout(() => { i = -1; paint(); timer = setTimeout(tick, 900); }, 3200); return; } paint(); timer = setTimeout(tick, 1500); };
  const start = () => { clearTimeout(timer); if (reduced.matches) { i = rows.length - 1; paint(); return; } if (visible) { i = -1; paint(); timer = setTimeout(tick, 600); } else clearTimeout(timer); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: .35 }).observe(root);
  reduced.addEventListener('change', start);
})();
