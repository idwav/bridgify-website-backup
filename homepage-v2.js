// V2 capability chapters: native scroll and keyboard selection share one state.
(() => {
  const section = document.querySelector('.bv2-why');
  const story = section?.querySelector('.opx-scroll-story');
  const stage = story?.querySelector('.opx-capabilities');
  if (!stage) return;
  const list = stage.querySelector('.opx-tabs');
  const tabs = [...list.querySelectorAll('button')];
  const panels = [...stage.querySelectorAll('.opx-panel')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1, pinned = false, step = 1, stickyTop = 32, frame = 0, resizeFrame = 0, visible = false;
  const paused = () => document.querySelector('.hero')?.classList.contains('paused');
  const clamp = value => Math.max(0, Math.min(1, value));

  stage.querySelectorAll('.opx-input-wires path:not(.opx-flow-arrow), .opx-output-wires path:not(.opx-flow-arrow)').forEach(path => {
    const trace = path.cloneNode(true);
    trace.classList.add('opx-wire-trace');
    trace.setAttribute('pathLength', '1');
    path.parentNode.append(trace);
  });

  function activate(index) {
    if (index === active) return;
    active = index;
    stage.dataset.active = tabs[index].dataset.capability;
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
    if (!pinned) return;
    const progress = Math.max(0, Math.min(3.999, (stickyTop - story.getBoundingClientRect().top) / step));
    const index = Math.floor(progress);
    activate(index);
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
    panels.forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); });
    pinned = innerWidth > 900 && innerHeight >= 640 && !reduced.matches && !paused();
    if (pinned) {
      story.dataset.mode = 'scroll';
      stickyTop = Math.max(24, Math.min(44, innerHeight * .045));
      stage.style.setProperty('--opx-sticky-top', `${stickyTop}px`);
      const height = Math.ceil(stage.getBoundingClientRect().height);
      if (height + stickyTop + 24 <= innerHeight) {
        step = Math.max(420, innerHeight * .72);
        story.style.height = `${height + step * 4}px`;
      } else {
        pinned = false;
        story.dataset.mode = 'reading';
      }
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
      const top = story.getBoundingClientRect().top + scrollY - stickyTop + step * (index + .15);
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
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) schedule();
  }, { rootMargin: '120px' }).observe(story);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(configure);
  }, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', configure);
  document.getElementById('motion')?.addEventListener('click', configure);
  document.fonts?.ready.then(configure);
  configure();
})();
