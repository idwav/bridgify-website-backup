(() => {
  const root = document.querySelector('.day-demo');
  if (!root) return;
  const select = root.querySelector('.day-select');
  const stops = [...root.querySelectorAll('.day-stop')];
  const progress = root.querySelector('.day-progress');
  const pause = root.querySelector('.day-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [], visible = false, paused = false;
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function reset() {
    clear();
    root.classList.remove('is-selected');
    stops.forEach(s => { s.classList.add('is-waiting'); s.classList.remove('is-active'); });
    select.setAttribute('aria-expanded', 'false');
    select.innerHTML = 'Choose Louvre Museum <span>→</span>';
    progress.textContent = 'Choose your starting suggestion to build your day.';
  }
  function reveal() {
    root.classList.add('is-selected');
    select.setAttribute('aria-expanded', 'true');
    select.innerHTML = 'Louvre selected <span>✓</span>';
    progress.textContent = 'Building your day around art & culture in Paris…';
    stops.forEach((stop, i) => {
      const show = () => {
        stop.classList.remove('is-waiting');
        stop.classList.add('is-active');
        if (i === stops.length - 1) progress.textContent = 'Morning, afternoon and evening — in order.';
      };
      if (reduced.matches) show(); else later(show, 450 + i * 800);
    });
  }
  function cycle() {
    reset();
    if (reduced.matches) { reveal(); return; }
    later(reveal, 900);
    if (!paused && visible && !document.hidden) later(cycle, 10000);
  }
  function sync() {
    clear();
    if (reduced.matches) { reveal(); pause.hidden = true; return; }
    pause.hidden = false;
    if (visible && !paused && !document.hidden) cycle();
  }
  select.addEventListener('click', () => { reset(); reveal(); if (!paused && visible && !reduced.matches) later(cycle, 9000); });
  root.querySelector('.day-reset').addEventListener('click', cycle);
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Resume animation ▶' : 'Pause animation Ⅱ';
    if (paused) { clear(); stops.forEach(s => { s.classList.remove('is-waiting'); s.classList.add('is-active'); }); root.classList.add('is-selected'); select.setAttribute('aria-expanded', 'true'); select.innerHTML = 'Louvre selected <span>✓</span>'; progress.textContent = 'Morning, afternoon and evening — in order.'; }
    else sync();
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold: .15}).observe(root);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  reset();
  if (reduced.matches) sync();
})();
