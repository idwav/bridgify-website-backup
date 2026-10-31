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
    visuals.forEach((visual, i) => { visual.hidden = pinned && i !== index; });
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

  // Align the category baseline with the visible diagram, not the viewport floor.
  // Layout offsets exclude the temporary entrance transforms on cards and tags.
  function alignCategories() {
    const scene = visuals[active].querySelector('.cv-scene');
    const sceneBox = scene.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const bottom = Math.max(...[...scene.querySelectorAll('.cv-node')].map(node => {
      const tags = [...node.querySelectorAll('.cv-tag')];
      return node.offsetTop + Math.max(node.offsetHeight,
        ...tags.map(tag => tag.offsetTop + tag.offsetHeight));
    }));
    const target = sceneBox.top + bottom * sceneBox.height / scene.offsetHeight - stageBox.top;
    const minimum = panels[active].offsetHeight + list.offsetHeight + 12;
    copy.style.setProperty('--copy-height', `${Math.max(minimum, Math.min(stageBox.height, target))}px`);
  }

  function update() {
    frame = 0;
    syncMotion();
    if (!pinned) return;
    const distance = stickyTop - story.getBoundingClientRect().top;
    const intro = clamp(distance / 300);
    stickyFrame.style.setProperty('--intro', String(intro));
    const height = stage.getBoundingClientRect().height;
    stickyFrame.style.setProperty('--scene-height', `${height}px`);
    const progress = Math.max(0, Math.min(3.999, (distance - 300) / step));
    const index = Math.floor(progress);
    activate(index);
    alignCategories();
    stage.style.setProperty('--opx-phase', String(clamp((progress - index) / .8)));
    story.dataset.progress = (progress / 4).toFixed(3);
  }
  function schedule() { if (visible && !frame && !document.hidden) frame = requestAnimationFrame(update); }

  function configure() {
    cancelAnimationFrame(frame);
    frame = 0;
    active = -1;
    story.style.height = '';
    story.dataset.mode = 'reading';
    copy.style.removeProperty('--copy-height');
    panels.forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); });
    pinned = innerWidth > 900 && innerHeight >= 700 && !reduced.matches && !paused();
    stickyFrame.style.setProperty('--intro', '0');
    visuals.forEach((visual, index) => { visual.hidden = false; (pinned ? gallery : panels[index]).append(visual); });
    gallery.hidden = !pinned;
    if (pinned) {
      story.dataset.mode = 'scroll';
      stickyTop = 24;
      const heading = story.querySelector('.opx-heading');
      const titleHeight = heading.querySelector('h2').getBoundingClientRect().height;
      stickyFrame.style.setProperty('--heading-height', `${Math.ceil(titleHeight + 48)}px`);
      stickyFrame.style.setProperty('--heading-drop', `${titleHeight * .2}px`);
      step = Math.max(440, innerHeight * .72);
      story.style.height = `${innerHeight - 48 + 300 + step * 4}px`;
    }
    list.hidden = !pinned;
    list.setAttribute('role', pinned ? 'tablist' : 'navigation');
    if (pinned) list.setAttribute('aria-orientation', 'vertical');
    else list.removeAttribute('aria-orientation');
    tabs.forEach(tab => { if (pinned) tab.setAttribute('role', 'tab'); else tab.removeAttribute('role'); });
    panels.forEach((panel, index) => {
      panel.setAttribute('role', pinned ? 'tabpanel' : 'region');
      panel.setAttribute('aria-labelledby', tabs[index].id);
    });
    activate(0);
    stage.style.setProperty('--opx-phase', '1');
    update();
  }

  function goTo(index) {
    if (pinned) {
      const top = story.getBoundingClientRect().top + scrollY - stickyTop + 300 + step * (index + .15);
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
