// Only the clean connection flow moves; the complete comparison is always visible.
(() => {
  const section = document.querySelector('.v2o-comparison');
  const scene = section?.querySelector('.v2c-with .v2c-diagram');
  if (!scene) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.bv2-hero');
  const dots = [...scene.querySelectorAll('.v2c-flow-dots circle')];
  const tracks = [...scene.querySelectorAll('.v2c-connected-paths path')].map((path, index) => ({ path, length: path.getTotalLength(), dot: dots[index], offset: index * .19 }));
  let visible = false, frame = 0, previous = 0, elapsed = 0;
  const active = () => visible && !reduced.matches && !document.hidden && !hero?.classList.contains('paused');
  function tick(time) {
    frame = 0;
    if (!active()) { previous = 0; return; }
    if (previous) elapsed += Math.min(time - previous, 80);
    previous = time;
    tracks.forEach(({ path, length, dot, offset }) => {
      // Supply travels upward through Bridgify and into the partner's channel.
      const progress = (elapsed / 4200 + offset) % 1;
      const point = path.getPointAtLength((1 - progress) * length);
      dot.setAttribute('transform', `translate(${point.x} ${point.y})`);
    });
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const flowing = active();
    scene.classList.toggle('is-flowing', flowing);
    if (flowing && !frame) frame = requestAnimationFrame(tick);
    else if (!flowing && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .12 }).observe(scene);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  if (hero) new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
})();

// A single, scroll-triggered light handoff: comparison left → right → outcome.
(() => {
  const section = document.querySelector('.v2o-comparison');
  if (!section) return;
  const blocks = [...section.querySelectorAll('.v2c-panel,.v2c-bottom')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.bv2-hero');
  const visible = new Set(), completed = new Set();
  let current = null, history = [];
  const paused = () => document.hidden || hero?.classList.contains('paused');
  blocks.forEach((block, index) => {
    block.dataset.lightIndex = String(index);
    block.dataset.lightState = 'waiting';
    block.addEventListener('animationend', event => {
      if (event.target === block && event.animationName === 'v2c-neon-edge' && current === block) finish();
    });
  });
  function pump() {
    if (current || reduced.matches || paused()) return;
    const next = blocks.find(block => visible.has(block) && !completed.has(block) && block.dataset.v2cReveal !== 'waiting');
    if (!next) return;
    current = next;
    next.dataset.lightState = 'lighting';
    next.classList.add('is-illuminating');
    section.dataset.activeLight = next.dataset.lightIndex;
  }
  function finish() {
    if (!current) return;
    current.classList.remove('is-illuminating');
    current.classList.add('has-illuminated');
    current.dataset.lightState = 'complete';
    completed.add(current);
    history.push(Number(current.dataset.lightIndex));
    section.dataset.lightHistory = history.join(',');
    current = null;
    delete section.dataset.activeLight;
    pump();
  }
  function reset() {
    current = null; history = []; completed.clear();
    delete section.dataset.activeLight;
    section.dataset.lightHistory = '';
    blocks.forEach(block => {
      block.classList.remove('is-illuminating','has-illuminated');
      block.dataset.lightState = 'waiting';
    });
  }
  function sync() {
    section.classList.toggle('v2c-motion-paused', Boolean(paused()));
    if (reduced.matches) {
      current = null;
      blocks.forEach(block => {
        block.classList.remove('is-illuminating');
        block.classList.add('has-illuminated');
        block.dataset.lightState = 'static';
        completed.add(block);
      });
      delete section.dataset.activeLight;
    } else pump();
  }
  const blockObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    // Fast scrolling never leaves an offscreen card holding up the next one.
    if (current && !visible.has(current)) finish();
    sync();
  }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
  blocks.forEach(block => blockObserver.observe(block));
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) { visible.clear(); reset(); sync(); }
  }, { threshold: 0 }).observe(section);
  section.addEventListener('v2c-revealed', sync);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { reset(); sync(); });
  if (hero) new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
  sync();
})();

// Scroll entrance: each block of the comparison rises in after the previous one.
(() => {
  const section = document.querySelector('.v2o-comparison');
  if (!section) return;
  const blocks = [
    section.querySelector('.v2c-heading h2'),
    ...section.querySelectorAll('.v2c-intro-column'),
    section.querySelector('.v2c-bottom'),
    ...section.querySelectorAll('.v2c-panel')
  ].filter(Boolean);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const STEP = 240;
  const intersecting = new Set(), timers = new Set();
  let revealed = 0, last = 0, started = false;
  blocks.forEach(block => { block.dataset.v2cReveal = 'waiting'; });

  function show(block) {
    block.dataset.v2cReveal = 'shown';
    block.classList.add('is-revealed');
    block.addEventListener('transitionend', event => {
      if (event.target === block && event.propertyName === 'transform') block.classList.add('v2c-settled');
    }, { once: true });
    section.dispatchEvent(new CustomEvent('v2c-revealed'));
  }
  function advance() {
    while (revealed < blocks.length) {
      const block = blocks[revealed];
      const rect = block.getBoundingClientRect();
      // Blocks already scrolled past appear at once; blocks below the fold wait their turn.
      if (!intersecting.has(block) && rect.top > 0) return;
      const wait = rect.bottom < 0 ? 0 : Math.max(0, last + STEP - performance.now());
      revealed++;
      if (wait === 0) { last = performance.now(); show(block); continue; }
      last = performance.now() + wait;
      const timer = setTimeout(() => { timers.delete(timer); show(block); }, wait);
      timers.add(timer);
    }
  }
  function reset() {
    timers.forEach(clearTimeout); timers.clear();
    revealed = 0; last = 0;
    blocks.forEach(block => {
      block.dataset.v2cReveal = 'waiting';
      block.classList.remove('is-revealed', 'v2c-settled');
    });
  }
  function enable() {
    if (started) return;
    started = true;
    section.classList.add('v2c-reveal-ready');
    // Settle the hidden state before the first block can transition in.
    void section.offsetWidth;
    advance();
  }
  function disable() {
    started = false;
    timers.forEach(clearTimeout); timers.clear();
    section.classList.remove('v2c-reveal-ready');
    blocks.forEach(block => { block.dataset.v2cReveal = 'shown'; block.classList.add('is-revealed'); });
    section.dispatchEvent(new CustomEvent('v2c-revealed'));
  }
  const blockObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? intersecting.add(entry.target) : intersecting.delete(entry.target));
    if (started) advance();
  }, { threshold: .08, rootMargin: '0px 0px -10% 0px' });
  new IntersectionObserver(entries => {
    // Leaving the section re-arms the entrance for the next visit.
    if (!entries[0].isIntersecting && started) { reset(); void section.offsetWidth; }
  }, { threshold: 0 }).observe(section);
  const apply = () => { reduced.matches ? disable() : (reset(), enable()); };
  blocks.forEach(block => blockObserver.observe(block));
  reduced.addEventListener('change', apply);
  apply();
})();
