// Developers, "What good looks like": the story plays as six beats, each about 2.4 seconds, on repeat while on screen. Clicking a beat jumps to it.
(() => {
  const root = document.querySelector('#performance.dp5'); if (!root) return;
  const stage = root.querySelector('.dp5-stage'), beats = [...root.querySelectorAll('.dp5-beat')], list = root.querySelector('.dp5-beats');
  const wire = document.createElement('i'); wire.className = 'dp5-wire'; list.prepend(wire);
  const STEP = [2300, 2500, 2300, 3200, 2300, 2500], price = stage.querySelector('.dp5-sprice em');
  let cur = 0, timer = 0, visible = false, manual = false;
  const show = n => {
    cur = n; stage.dataset.beat = n + 1;
    beats.forEach((b, i) => b.classList.toggle('is-on', i === n));
    if (n === 2 && price) { price.style.opacity = 0; price.style.transform = 'translateY(-6px)'; setTimeout(() => { price.textContent = '€39'; price.style.opacity = 1; price.style.transform = 'none'; }, 350); }
  };
  const next = () => { clearTimeout(timer); if (!visible || manual) return; timer = setTimeout(() => { show((cur + 1) % beats.length); next(); }, STEP[cur]); };
  beats.forEach((b, i) => b.addEventListener('click', () => { manual = true; clearTimeout(timer); show(i); setTimeout(() => { manual = false; next(); }, 6000); }));
  show(0);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) next(); else clearTimeout(timer); }, { threshold: .3 }).observe(stage);
})();
