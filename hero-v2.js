// One sequence: supply arrives, connections draw, then the branded product arrives.
(() => {
  const hero = document.querySelector('.bv2-hero');
  if (!hero) return;
  const scene = hero.querySelector('.bv2-hero-scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const paths = [...hero.querySelectorAll('.bv2-wire-paths path')];
  const dots = [...hero.querySelectorAll('.bv2-wire-particles circle')];
  const tracks = paths.map((path, i) => ({ path, dot: dots[i], length: path.getTotalLength(), offset: i * .21 }));
  const entrances = [];
  let visible = false;
  let entered = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let entryDelay = 0;
  const paused = () => hero.classList.contains('paused');
  const canRun = () => visible && entered && !document.hidden && !reduced.matches && !paused();

  function tick(now) {
    if (!canRun()) { frame = 0; previous = 0; return; }
    if (previous) elapsed += Math.min(now - previous, 80);
    previous = now;
    tracks.forEach(({ path, dot, length, offset }, index) => {
      const progress = (elapsed / (index === 4 ? 2100 : 5200) + offset) % 1;
      const point = path.getPointAtLength(progress * length);
      dot.setAttribute('transform', `translate(${point.x} ${point.y})`);
    });
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const running = canRun();
    if (hero.classList.contains('is-flowing') !== running) hero.classList.toggle('is-flowing', running);
    if (running && !frame) frame = requestAnimationFrame(tick);
    if (!running && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    entrances.forEach(animation => {
      if (reduced.matches) animation.finish();
      else if (paused() || document.hidden || !visible) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
  }
  function arrive(element, delay, from, duration = 850) {
    if (!element.animate) return;
    const animation = element.animate([from, { opacity: 1, transform: getComputedStyle(element).transform }], {
      duration, delay: delay + entryDelay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'
    });
    entrances.push(animation);
    return animation;
  }
  function enter() {
    if (entered || entrances.length) return;
    entryDelay = document.querySelector('.page-wipe')?.getBoundingClientRect().top < innerHeight ? 650 : 0;
    if (reduced.matches || !scene.animate) { entered = true; sync(); return; }
    hero.querySelectorAll('.bv2-hero-copy>*').forEach((element, i) => arrive(element, i * 100, { opacity: 0, transform: 'translateY(20px)' }, 750));
    hero.querySelectorAll('.bv2-hero-source').forEach((element, i) => arrive(element, 160 + i * 140, { opacity: 0, transform: 'translateX(-22px)' }));
    paths.forEach((path, i) => {
      const animation = path.animate([{ strokeDasharray: `${tracks[i].length}`, strokeDashoffset: `${tracks[i].length}`, opacity: 0 }, { strokeDasharray: `${tracks[i].length}`, strokeDashoffset: 0, opacity: 1 }], {
        duration: 950, delay: entryDelay + (i === 4 ? 1350 : 460 + i * 130), easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards'
      });
      entrances.push(animation);
    });
    arrive(hero.querySelector('.bv2-wire-halo'), 1350, { opacity: 0 }, 1200);
    arrive(hero.querySelector('.bv2-wire-ports'), 600, { opacity: 0 });
    arrive(hero.querySelector('.bv2-hero-hub'), 1050, { opacity: 0, transform: 'scale(.84)' });
    const last = arrive(hero.querySelector('.bv2-hero-phone'), 1550, { opacity: 0, transform: 'translateX(24px) rotateY(-16deg) rotateZ(-1deg)' }, 1000);
    Promise.all(entrances.map(animation => animation.finished.catch(() => {}))).then(() => { entered = true; sync(); });
    if (!last) { entered = true; sync(); }
    sync();
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) enter();
    sync();
  }, { threshold: .12 }).observe(scene);
  new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
})();
