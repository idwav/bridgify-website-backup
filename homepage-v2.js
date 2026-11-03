// V2 capability chapters: native scroll and keyboard selection share one state.
(() => {
  const section = document.querySelector('.bv2-why');
  const story = section?.querySelector('.opx-scroll-story');
  const stage = story?.querySelector('.opx-capabilities');
  if (!stage) return;
  const list = stage.querySelector('.opx-tabs');
  const tabs = [...list.querySelectorAll('button')];
  const panels = [...stage.querySelectorAll('.opx-panel')];
  const gallery = stage.querySelector('.v2-capability-gallery');
  const copy = stage.querySelector('.opx-capability-copy');
  const stickyFrame = story.querySelector('.v2-story-frame');
  const visuals = panels.map(panel => panel.querySelector('.v2-capability-visual'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1, pinned = false, step = 1, stickyTop = 32, frame = 0, resizeFrame = 0, visible = false;
  let selectionTarget = null;
  // The perimeter is a scroll meter: one complete outline equals one chapter.
  const rings = tabs.map(tab => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('opx-progress-ring');
    svg.setAttribute('aria-hidden', 'true');
    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    // Stroke centre sits on the 1px border centre line, so the meter rides the outline itself.
    rect.setAttribute('x', '.5');
    rect.setAttribute('y', '.5');
    rect.setAttribute('rx', '10.5');
    rect.setAttribute('pathLength', '100');
    svg.append(rect);
    tab.append(svg);
    return { tab, svg, rect };
  });
  const sizeRings = () => rings.forEach(({ tab, svg, rect }) => {
    const width = tab.offsetWidth, height = tab.offsetHeight;
    if (!width || !height) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    rect.setAttribute('width', String(width - 1));
    rect.setAttribute('height', String(height - 1));
  });
  const ringObserver = new ResizeObserver(sizeRings);
  tabs.forEach(tab => ringObserver.observe(tab));
  const paused = () => document.querySelector('.hero')?.classList.contains('paused');
  const clamp = value => Math.max(0, Math.min(1, value));

  function syncMotion() {
    const running = visible && !document.hidden && !reduced.matches && !paused();
    section.dataset.motion = reduced.matches || paused() ? 'paused' : 'active';
    visuals.forEach((visual, index) => {
      const rect = visual.getBoundingClientRect();
      visual.dataset.running = String(running && (pinned ? index === active : rect.bottom > 0 && rect.top < innerHeight));
    });
  }

  function activate(index) {
    if (index === active) return;
    active = index;
    stage.dataset.active = tabs[index].dataset.capability;
    visuals.forEach((visual, i) => {
      visual.dataset.current = String(i === index);
      if (pinned) visual.setAttribute('aria-hidden', String(i !== index));
      else visual.removeAttribute('aria-hidden');
    });
    syncMotion();
    tabs.forEach((tab, i) => {
      tab.dataset.passed = String(i < index);
      if (pinned) tab.setAttribute('aria-selected', String(i === index));
      else tab.removeAttribute('aria-selected');
      tab.tabIndex = pinned && i !== index ? -1 : 0;
    });
    panels.forEach((panel, i) => {
      panel.inert = pinned && i !== index;
      if (pinned) panel.setAttribute('aria-hidden', String(i !== index));
      else panel.removeAttribute('aria-hidden');
    });
  }

  function update() {
    frame = 0;
    syncMotion();
    if (!pinned) return;
    const distance = stickyTop - story.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(3.999, distance / step));
    if (selectionTarget !== null && Math.abs(scrollY - selectionTarget) < 5) selectionTarget = null;
    if (selectionTarget === null) activate(Math.floor(progress));
    const chapterProgress = selectionTarget === null ? progress - Math.floor(progress) : .18;
    stage.style.setProperty('--opx-phase', String(clamp(chapterProgress / .8)));
    stage.style.setProperty('--opx-slide-progress', String(clamp(chapterProgress)));
    story.dataset.progress = (progress / 4).toFixed(3);
  }
  function schedule() { if (visible && !frame && !document.hidden) frame = requestAnimationFrame(update); }

  function configure() {
    cancelAnimationFrame(frame);
    frame = 0;
    active = -1;
    selectionTarget = null;
    story.style.height = '';
    story.dataset.mode = 'reading';
    copy.style.removeProperty('--copy-height');
    panels.forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); });
    pinned = innerWidth > 900 && innerHeight >= 650 && !reduced.matches && !paused();

    visuals.forEach((visual, index) => { visual.hidden = false; (pinned ? gallery : panels[index]).append(visual); });
    gallery.hidden = !pinned;
    if (pinned) {
      story.dataset.mode = 'scroll';
      stickyTop = 32;
      stickyFrame.style.setProperty('--scene-height', `${gallery.clientWidth * 780 / 1100}px`);
      stickyFrame.style.setProperty('--nav-height', `${list.offsetHeight || 208}px`);
      step = Math.max(540, innerHeight * .86);
      story.style.height = `${stickyFrame.offsetHeight + step * 4}px`;
    }
    list.hidden = !pinned;
    if (pinned) stickyFrame.style.setProperty('--nav-height', `${list.offsetHeight}px`);
    list.setAttribute('role', pinned ? 'tablist' : 'navigation');
    if (pinned) list.setAttribute('aria-orientation', 'vertical');
    else list.removeAttribute('aria-orientation');
    tabs.forEach(tab => { if (pinned) tab.setAttribute('role', 'tab'); else tab.removeAttribute('role'); });
    panels.forEach((panel, index) => {
      panel.setAttribute('role', pinned ? 'tabpanel' : 'region');
      panel.setAttribute('aria-labelledby', tabs[index].id);
    });
    sizeRings();
    activate(0);
    stage.style.setProperty('--opx-phase', '1');
    update();
  }

  function goTo(index) {
    if (pinned) {
      const top = story.getBoundingClientRect().top + scrollY - stickyTop + step * (index + .18);
      activate(index);
      stage.style.setProperty('--opx-slide-progress', '.18');
      selectionTarget = top;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      panels[index].scrollIntoView({ block: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => goTo(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      tabs[next].focus({ preventScroll: true });
      goTo(next);
    });
  });
  ['wheel', 'touchstart', 'pointerdown'].forEach(type => window.addEventListener(type, () => { selectionTarget = null; }, { passive: true }));
  window.addEventListener('keydown', event => {
    if (['PageDown', 'PageUp', ' '].includes(event.key)) selectionTarget = null;
  });
  const preload = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    visuals.forEach(visual => { visual.querySelectorAll('img').forEach(img => { img.loading = 'eager'; }); });
    preload.disconnect();
  }, { rootMargin: '800px' });
  preload.observe(story);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotion();
    if (visible) schedule();
  }, { rootMargin: '120px' }).observe(story);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(configure);
  }, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => { syncMotion(); schedule(); });
  reduced.addEventListener('change', configure);
  document.getElementById('motion')?.addEventListener('click', configure);
  document.fonts?.ready.then(configure);
  configure();
})();


// Reveal each homepage section on entry, without hiding content or wrapping sticky stories.
(() => {
  const sections = [...document.querySelectorAll('section:not(.hero), footer')]
    .filter(section => !section.parentElement.closest('section, footer'));
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const seen = new WeakSet();
  let firstDelivery = true;
  const paused = () => document.querySelector('.hero')?.classList.contains('paused');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio === 0 || seen.has(entry.target)) return;
      const section = entry.target;
      seen.add(section);
      observer.unobserve(section);
      if (firstDelivery || reduced.matches || paused()) {
        section.dataset.entrance = 'visible';
        return;
      }
      section.dataset.entrance = 'entering';
      // Animate the sticky element itself, never a new containing wrapper.
      const target = section.querySelector('.v2-story-frame, .v2p-shell') || section;
      const animation = target.animate([
        { opacity: .15, translate: '0 38px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.set(section, animation);
      animation.finished.catch(() => {}).finally(() => {
        animations.delete(section);
        section.dataset.entrance = 'complete';
      });
    });
    firstDelivery = false;
  }, { threshold: .001 });
  sections.forEach(section => observer.observe(section));
  const finish = () => animations.forEach(animation => animation.finish());
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  document.getElementById('motion')?.addEventListener('click', () => { if (paused()) finish(); });
  document.addEventListener('focusin', event => {
    const section = sections.find(candidate => candidate.contains(event.target));
    animations.get(section)?.finish();
  });
})();

// Aggregate scene: build the diagram layer by layer whenever the chapter is reached.
(() => {
  const scene = document.querySelector('.cv-aggregate');
  const visual = scene?.closest('.v2-capability-visual');
  const section = document.querySelector('.bv2-why');
  if (!scene || !visual || !section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  function sync() {
    if (reduced.matches) { scene.classList.remove('cv-build-ready'); delete scene.dataset.build; return; }
    scene.classList.add('cv-build-ready');
    const stage = section.querySelector('.opx-scroll-story');
    const pinned = stage?.dataset.mode === 'scroll';
    const want = inView && (!pinned || visual.dataset.current === 'true');
    if (!want) scene.dataset.build = 'idle';
    else if (scene.dataset.build !== 'play') {
      // Commit the idle frame first so the transitions have a start state.
      void scene.offsetWidth;
      scene.dataset.build = 'play';
    }
  }
  scene.dataset.build = 'idle';
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, { threshold: .4 }).observe(scene);
  new MutationObserver(sync).observe(visual, { attributes: true, attributeFilter: ['data-current'] });
  const storyEl = section.querySelector('.opx-scroll-story');
  if (storyEl) new MutationObserver(sync).observe(storyEl, { attributes: true, attributeFilter: ['data-mode'] });
  reduced.addEventListener('change', sync);
  sync();
})();
