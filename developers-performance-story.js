// Developers, "What good looks like": seven quick beats on repeat while on screen. Search types "Rome", results rise, prices land, Book is pressed, the price is checked (green), sent, timed out and retried, confirmed, and watched. The screen never changes size.
(() => {
  const root = document.querySelector('#performance.dp6'); if (!root) return;
  const stage = root.querySelector('.dp6-stage'), beats = [...root.querySelectorAll('.dp6-beat')], typed = root.querySelector('.dp6-typed');
  const STEP = [1400, 2400, 1700, 1100, 2400, 1500, 2200], WORD = 'Rome';
  let cur = 0, timer = 0, typing = 0, press = 0, visible = false, hold = false;
  const type = () => { clearInterval(typing); let i = 0; typed.textContent = ''; typing = setInterval(() => { typed.textContent = WORD.slice(0, ++i); if (i >= WORD.length) clearInterval(typing); }, 160); };
  const show = n => {
    cur = n; stage.dataset.beat = n + 1; stage.classList.remove('is-press'); clearTimeout(press);
    beats.forEach((b, i) => b.classList.toggle('is-on', i === n));
    if (n === 0) type(); else typed.textContent = WORD;
    if (n === 1) press = setTimeout(() => stage.classList.add('is-press'), 1900);
  };
  const next = () => { clearTimeout(timer); if (!visible || hold) return; timer = setTimeout(() => { show((cur + 1) % beats.length); next(); }, STEP[cur]); };
  beats.forEach((b, i) => b.addEventListener('click', () => { hold = true; clearTimeout(timer); show(i); setTimeout(() => { hold = false; next(); }, 4000); }));
  show(0);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(6); return; }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) next(); else clearTimeout(timer); }, { threshold: .3 }).observe(stage);
})();
