// Scroll controls the distance between independent planes. The card wave resolves to 3.
(() => {
  const section = document.querySelector('.v2e-enterprise');
  if (!section || !Element.prototype.animate) return;
  const art = section.querySelector('.v2e-art');
  const proof = section.querySelector('.v2e-proof');
  const planes = [...section.querySelectorAll('.v2e-plane-unit')];
  const dots = [...section.querySelectorAll('.v2e-proof-dots i')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const batches = {
    art: { visible: false, started: false, animations: [], floats: [] },
    proof: { visible: false, started: false, animations: [] }
  };
  const paused = () => document.hidden || document.querySelector('.bv2-hero')?.classList.contains('paused');

  function sync() {
    section.dataset.motionState = reduced.matches ? 'reduced' : paused() ? 'paused' : (batches.art.visible || batches.proof.visible) ? 'active' : 'offscreen';
    Object.values(batches).forEach(batch => {
      const active = batch.visible && !paused() && !reduced.matches;
      [...batch.animations, ...(batch.floats || [])].forEach(animation => {
        if (reduced.matches) {
          if (animation.effect.getTiming().iterations === Infinity) { animation.pause(); animation.currentTime = 0; }
          else if (animation.playState !== 'finished') animation.finish();
        } else if (!active) {
          if (animation.playState === 'running') animation.pause();
        } else if (animation.playState === 'paused') animation.play();
      });
    });
  }

  // Paused tracks are scrubbed by native scroll, never played on a timer.
  const stage = section.querySelector('.v2e-stage');
  let tracks = [], frame = 0, stageHeight = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function renderLayers() {
    frame = 0;
    if (!tracks.length || paused()) return;
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
    const progress = clamp(-rect.top / travel);
    const eased = progress * progress * (3 - 2 * progress);
    tracks.forEach(track => { track.currentTime = eased * 1000; });
    section.style.setProperty('--v2e-assembled-opacity', String(clamp((progress - .8) / .2)));
    section.dataset.scrollProgress = progress.toFixed(3);
    section.dataset.layerState = progress <= .01 ? 'separated' : progress >= .99 ? 'assembled' : 'converging';
  }
  function queueLayers() { if (!frame) frame = requestAnimationFrame(renderLayers); }
  function setupLayers() {
    tracks.forEach(track => track.cancel());
    tracks = [];
    section.classList.toggle('v2e-scroll-ready', !reduced.matches);
    if (reduced.matches) { section.dataset.layerState = 'assembled'; return; }
    const fromX = [-30, 22, -8], fromY = [140, 55, -34];
    tracks = planes.map((plane, i) => {
      const track = plane.animate([
        { transform: `translate(${fromX[i]}px,${fromY[i]}px)` },
        { transform: 'translate(0,0)' }
      ], { duration: 1000, fill: 'both', easing: 'linear' });
      track.id = `v2e-scroll-plane-${i}`;
      track.pause();
      track.currentTime = 0;
      return track;
    });
    queueLayers();
  }
  new ResizeObserver(() => {
    const height = stage.getBoundingClientRect().height;
    if (Math.abs(height - stageHeight) > .5) {
      stageHeight = height;
      section.style.setProperty('--v2e-stage-h', `${height}px`);
    }
    queueLayers();
  }).observe(stage);
  addEventListener('scroll', queueLayers, { passive: true });
  addEventListener('resize', queueLayers, { passive: true });
  setupLayers();

  function magnetizeDots() {
    if (reduced.matches) { section.dataset.dotAccentState = 'complete'; return; }
    section.dataset.dotAccentState = 'running';
    const accents = dots.slice(0, 3).map((dot, i) => {
      const restingShadow = getComputedStyle(dot).boxShadow;
      const animation = dot.animate([
        { transform: 'perspective(160px) translate3d(0,0,0) scale(1)', boxShadow: restingShadow, offset: 0, easing: 'cubic-bezier(.2,.8,.2,1)' },
        { transform: 'perspective(160px) translate3d(0,-1.5px,18px) scale(1.65)', boxShadow: '0 2px 13px #f4664980', offset: .38, easing: 'cubic-bezier(.4,0,.2,1)' },
        { transform: 'perspective(160px) translate3d(0,.25px,-2px) scale(.96)', boxShadow: restingShadow, offset: .79, easing: 'cubic-bezier(.16,1,.3,1)' },
        { transform: 'perspective(160px) translate3d(0,0,0) scale(1)', boxShadow: restingShadow, offset: 1 }
      ], { duration: 860, delay: 120 + i * 950, fill: 'backwards' });
      animation.id = `v2e-dot-magnet-${i}`;
      batches.proof.animations.push(animation);
      return animation;
    });
    Promise.all(accents.map(animation => animation.finished.catch(() => {}))).then(() => {
      section.dataset.dotAccentState = 'complete';
    });
    sync();
  }

  function wave() {
    const batch = batches.proof;
    if (batch.started || reduced.matches) return;
    batch.started = true;
    section.dataset.waveState = 'running';
    const dim = getComputedStyle(dots[dots.length - 1]).backgroundColor;
    const coral = getComputedStyle(dots[0]).backgroundColor;
    const duration = 2200;
    dots.forEach((dot, i) => {
      const row = Math.floor(i / 9), col = i % 9;
      const start = 90 + (row + col) * 45;
      const still = { backgroundColor: dim, boxShadow: '0 0 0px transparent', transform: 'scale(1)' };
      const bright = { backgroundColor: coral, boxShadow: '0 0 11px #f46649aa', transform: 'scale(1.55)' };
      const frames = [
        { ...still, offset: 0 },
        { ...still, offset: start / duration },
        { ...bright, offset: (start + 180) / duration },
        { ...still, offset: (start + 480) / duration }
      ];
      if (i < 3) {
        frames.push({ ...still, offset: (1660 + i * 60) / duration });
        frames.push({ backgroundColor: coral, boxShadow: '0 0 6px #f4664940', transform: 'scale(1)', offset: 1 });
      } else frames.push({ ...still, offset: 1 });
      batch.animations.push(dot.animate(frames, { duration, easing: 'linear', fill: 'backwards' }));
    });
    Promise.all(batch.animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      section.dataset.waveState = 'complete';
      magnetizeDots();
    });
    sync();
  }

  // The card and art each start when their own content can actually be seen.
  new IntersectionObserver(entries => {
    batches.proof.visible = entries[0].isIntersecting;
    if (batches.proof.visible) wave();
    sync();
  }, { threshold: .4 }).observe(proof);
  new IntersectionObserver(entries => {
    batches.art.visible = entries[0].isIntersecting;
    if (batches.art.visible) queueLayers();
    sync();
  }, { threshold: .2 }).observe(art);
  document.addEventListener('visibilitychange', () => { sync(); queueLayers(); });
  reduced.addEventListener('change', () => {
    setupLayers();
    if (!reduced.matches) {
      if (batches.proof.visible) wave();
      if (batches.art.visible) queueLayers();
    }
    sync();
  });
  const hero = document.querySelector('.bv2-hero');
  if (hero) new MutationObserver(() => { sync(); queueLayers(); }).observe(hero, { attributes: true, attributeFilter: ['class'] });
})();
