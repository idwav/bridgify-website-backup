(() => {
  const section = document.querySelector('.bc-section');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, started = false;
  function update() {
    section.classList.toggle('bc-paused', !visible || document.hidden);
    if (reduced.matches) {
      section.classList.remove('bc-running');
      started = true;
    } else if (visible && !document.hidden && !started) {
      started = true;
      section.classList.add('bc-running');
    }
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { threshold: .15 }).observe(section);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  update();
})();
