// Separate suppliers lead away; one connected layer keeps experiences in your channel.
(() => {
  const section = document.querySelector('.bv2-opportunity');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const disclosure = section.querySelector('.v2o-more');
  let disclosureAnimation;
  disclosure?.querySelector('summary').addEventListener('click', event => {
    if (reduced.matches || !disclosure.animate) return;
    event.preventDefault();
    const body = disclosure.querySelector('.v2o-more-body');
    const opening = disclosure.dataset.expanded !== 'true';
    const height = disclosure.open ? body.getBoundingClientRect().height : 0;
    disclosureAnimation?.cancel();
    disclosure.dataset.expanded = String(opening);
    disclosure.open = true;
    const target = opening ? body.firstElementChild.getBoundingClientRect().height : 0;
    disclosureAnimation = body.animate([{ height: `${height}px`, opacity: opening ? 0 : 1 }, { height: `${target}px`, opacity: opening ? 1 : 0 }], {
      duration: opening ? 340 : 230, easing: 'cubic-bezier(.16,1,.3,1)'
    });
    disclosureAnimation.onfinish = () => { disclosure.open = opening; disclosureAnimation = null; };
  });
  const scenes = [...section.querySelectorAll('.v2o-scene')].map(element => ({
    element, visible: false, entered: false, animations: [],
    tracks: [...element.querySelectorAll('.v2o-paths path')].map((path, i) => ({
      path, length: path.getTotalLength(), dot: element.querySelectorAll('.v2o-dots circle')[i], offset: i * .3
    }))
  }));
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const panels = [...section.querySelectorAll('.v2o-panel')];
  function select(mode, animate = true) {
    tabs.forEach(tab => { const selected = tab.dataset.mode === mode; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
    panels.forEach(panel => {
      const selected = panel.dataset.mode === mode;
      panel.hidden = !selected;
      if (selected && animate && !reduced.matches && panel.animate) panel.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
    });
  }
  panels.forEach(panel => { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `v2o-tab-${panel.dataset.mode}`); panel.tabIndex = 0; });
  section.classList.add('v2o-switch-ready');
  section.querySelector('.v2o-tabs').hidden = false;
  select('with', false);
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.mode));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[next].focus(); select(tabs[next].dataset.mode);
    });
  });
  const paused = () => document.querySelector('.bv2-hero')?.classList.contains('paused');
  let frame = 0, previous = 0, elapsed = 0;
  function active(scene) { return scene.visible && !scene.element.closest('.v2o-panel').hidden && !reduced.matches && !document.hidden && !paused(); }
  function tick(now) {
    frame = 0;
    if (!scenes.some(active)) { previous = 0; return; }
    if (previous) elapsed += Math.min(now - previous, 80);
    previous = now;
    scenes.filter(active).forEach(scene => scene.tracks.forEach(({ path, length, dot, offset }) => {
      const point = path.getPointAtLength(((elapsed / 4200 + offset) % 1) * length);
      dot.setAttribute('transform', `translate(${point.x} ${point.y})`);
    }));
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    scenes.forEach(scene => {
      const flowing = active(scene) && scene.entered;
      if (scene.element.classList.contains('is-flowing') !== flowing) scene.element.classList.toggle('is-flowing', flowing);
      scene.animations.forEach(animation => {
        if (reduced.matches) animation.finish();
        else if (!active(scene)) animation.pause();
        else if (animation.playState === 'paused') animation.play();
      });
    });
    if (scenes.some(active) && !frame) frame = requestAnimationFrame(tick);
    else if (!scenes.some(active) && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }
  function enter(scene) {
    if (scene.entered || scene.animations.length) return;
    if (reduced.matches || !scene.element.animate) { scene.entered = true; return; }
    scene.element.querySelectorAll('.v2o-node').forEach((node, i) => {
      scene.animations.push(node.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], {
        duration: 700, delay: i * 110, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)'
      }));
    });
    scene.tracks.forEach(({ path, length }, i) => scene.animations.push(path.animate([
      { strokeDasharray: `${length}`, strokeDashoffset: `${length}`, opacity: 0 },
      { strokeDasharray: `${length}`, strokeDashoffset: 0, opacity: 1 }
    ], { duration: 1000, delay: 180 + i * 120, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' })));
    Promise.all(scene.animations.map(animation => animation.finished.catch(() => {}))).then(() => { scene.entered = true; sync(); });
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const scene = scenes.find(item => item.element === entry.target);
      scene.visible = entry.isIntersecting;
      if (scene.visible) enter(scene);
    });
    sync();
  }, { threshold: .2 });
  scenes.forEach(scene => observer.observe(scene.element));
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  const hero = document.querySelector('.bv2-hero');
  if (hero) new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
})();
