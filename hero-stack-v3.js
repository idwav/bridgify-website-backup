// Hero version 3: the brand plug drops into the strip, the beam rises, four infrastructure layers lock in,
// then the branded app arrives on top. Runs once per replay; afterwards the beam keeps pulsing.
(() => {
  const hero = document.querySelector('.bv2-hero');
  const scene = hero?.querySelector('.bv2-stack');
  if (!scene || document.documentElement.dataset.hero !== '3') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const parts = [...scene.querySelectorAll('[data-at]')].map(el => ({ el, at: +el.dataset.at })).sort((a, b) => a.at - b.at);
  const stages = [['st-plugged', 900], ['st-landed', 1380], ['st-beaming', 1500], ['st-locked', 3400], ['st-flowing', 5600]];
  let t = 0, next = 0, frame = 0, previous = 0, visible = false, started = false;
  const paused = () => hero.classList.contains('paused');
  const canRun = () => visible && started && !document.hidden && !reduced.matches && !paused();

  function reset() {
    t = -400; next = 0;
    parts.forEach(({ el }) => el.classList.remove('is-on'));
    stages.forEach(([name]) => scene.classList.remove(name));
  }
  function render() {
    while (next < parts.length && parts[next].at <= t) parts[next++].el.classList.add('is-on');
    stages.forEach(([name, at]) => { if (t >= at && !scene.classList.contains(name)) scene.classList.add(name); });
  }
  function tick(now) {
    frame = 0;
    if (!canRun()) { previous = 0; return; }
    if (previous) t += Math.min(now - previous, 80);
    previous = now;
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (reduced.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      scene.classList.remove('st-live');
      return;
    }
    scene.classList.add('st-live');
    if (canRun() && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
    if (!canRun() && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }

  reset();
  if (!reduced.matches) scene.classList.add('st-live');
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !started) {
      started = true;
      t = document.querySelector('.page-wipe')?.getBoundingClientRect().top < innerHeight ? -1000 : -400;
    }
    sync();
  }, { threshold: .15 }).observe(scene);
  document.getElementById('fn-replay')?.addEventListener('click', () => {
    if (reduced.matches) return;
    reset();
    started = true;
    render();
    sync();
  });
  new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { reset(); sync(); });
})();
