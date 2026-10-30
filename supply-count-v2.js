// The printed metrics remain readable without JS and unchanged for screen readers.
(() => {
  const section = document.querySelector('html[data-home-version="2"] #sources');
  if (!section || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const records = [];
  const animations = new Set();
  let visible = false;
  let started = false;
  let completed = false;

  section.querySelectorAll('.trust-stat strong').forEach((element, metricIndex) => {
    const final = element.textContent.trim();
    const accessible = document.createElement('span');
    accessible.className = 'bv2-counter-accessible';
    accessible.textContent = final;
    const visual = document.createElement('span');
    visual.className = 'bv2-counter-visual';
    visual.setAttribute('aria-hidden', 'true');
    let digitIndex = 0;
    [...final].forEach(character => {
      if (!/\d/.test(character)) { visual.append(document.createTextNode(character)); return; }
      const digit = document.createElement('span');
      digit.className = 'bv2-counter-digit';
      const reel = document.createElement('span');
      reel.className = 'bv2-counter-reel';
      const target = 20 + Number(character);
      for (let i = 0; i <= target; i++) {
        const cell = document.createElement('span');
        cell.textContent = String(i % 10);
        reel.append(cell);
      }
      reel.style.transform = `translateY(-${target * 1.12}em)`;
      digit.append(reel);
      visual.append(digit);
      records.push({ reel, target, delay: metricIndex * 65 + digitIndex++ * 55 });
    });
    element.replaceChildren(accessible, visual);
  });

  const paused = () => document.querySelector('.bv2-hero')?.classList.contains('paused');
  function finish() {
    animations.forEach(animation => animation.finish());
    completed = true;
    section.dataset.countState = 'complete';
  }
  function sync() {
    if (completed) return;
    if (reduced.matches) { finish(); return; }
    animations.forEach(animation => {
      if (!visible || document.hidden || paused()) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
  }
  function start() {
    if (started || completed) return;
    started = true;
    section.dataset.countState = 'running';
    records.forEach(({ reel, target, delay }) => {
      const animation = reel.animate([
        { transform: 'translateY(0)' },
        { transform: `translateY(-${target * 1.12}em)` }
      ], { duration: 1550, delay, fill: 'backwards', easing: 'cubic-bezier(.16,.7,.2,1)' });
      animations.add(animation);
    });
    Promise.all([...animations].map(animation => animation.finished.catch(() => {}))).then(finish);
    sync();
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    sync();
    if (completed) observer.disconnect();
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  observer.observe(section);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  const hero = document.querySelector('.bv2-hero');
  if (hero) new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
})();
