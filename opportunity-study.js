// Scroll through one persistent architecture, with a readable fallback on small screens.
(() => {
  const scope = document.querySelector('.opx-scope');
  const story = scope?.querySelector('.opx-scroll-story');
  const stage = story?.querySelector('.opx-capabilities');
  const list = stage?.querySelector('.opx-tabs');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[data-capability]')];
  const panels = [...stage.querySelectorAll('[data-panel]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1, pinned = false, step = 1, stickyTop = 32, frame = 0, resizeFrame = 0;

  // Trace overlays preserve the complete, readable connections underneath.
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
      if (pinned) {
        tab.setAttribute('aria-selected', String(i === index));
        tab.removeAttribute('aria-current');
        tab.tabIndex = i === index ? 0 : -1;
      } else {
        tab.removeAttribute('aria-selected');
        tab.setAttribute('aria-current', i === index ? 'step' : 'false');
        tab.tabIndex = 0;
      }
    });
    panels.forEach((panel, i) => { panel.hidden = pinned && i !== index; });
  }

  function update() {
    frame = 0;
    if (pinned) {
      const progress = Math.max(0, Math.min(3.999, (stickyTop - story.getBoundingClientRect().top) / step));
      const index = Math.floor(progress);
      activate(index);
      stage.style.setProperty('--opx-phase', String(Math.min(1, (progress - index) / 0.8)));
    } else {
      let nearest = 0;
      panels.forEach((panel, index) => { if (panel.getBoundingClientRect().top < innerHeight * 0.5) nearest = index; });
      activate(nearest);
      stage.style.setProperty('--opx-phase', '1');
    }
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(update); }

  function configure() {
    const previous = Math.max(0, active);
    active = -1;
    story.style.height = '';
    stage.style.removeProperty('--opx-panel-space');
    pinned = innerWidth > 900 && !reduced.matches && !document.querySelector('.hero')?.classList.contains('paused');
    story.dataset.mode = pinned ? 'scroll' : 'reading';
    panels.forEach(panel => { panel.hidden = false; });
    if (pinned) {
      const panelSpace = Math.ceil(Math.max(...panels.map(panel => panel.getBoundingClientRect().height)));
      stage.style.setProperty('--opx-panel-space', `${panelSpace}px`);
      panels.forEach((panel, index) => { panel.hidden = index !== previous; });
      stickyTop = Math.max(24, Math.min(56, innerHeight * 0.045));
      stage.style.setProperty('--opx-sticky-top', `${stickyTop}px`);
      const stageHeight = Math.ceil(stage.getBoundingClientRect().height);
      if (stageHeight + stickyTop + 24 <= innerHeight) {
        step = Math.max(480, innerHeight * 0.82);
        story.style.height = `${stageHeight + step * 4}px`;
      } else {
        pinned = false;
        story.dataset.mode = 'reading';
        stage.style.removeProperty('--opx-panel-space');
      }
    }
    list.setAttribute('role', pinned ? 'tablist' : 'navigation');
    if (pinned) list.setAttribute('aria-orientation', 'vertical');
    else list.removeAttribute('aria-orientation');
    tabs.forEach(tab => {
      if (pinned) tab.setAttribute('role', 'tab');
      else tab.removeAttribute('role');
    });
    panels.forEach((panel, index) => {
      panel.setAttribute('role', pinned ? 'tabpanel' : 'region');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.tabIndex = pinned ? 0 : -1;
      panel.hidden = false;
    });
    activate(previous);
    update();
  }

  function goTo(index) {
    activate(index);
    if (pinned) {
      const top = story.getBoundingClientRect().top + scrollY - stickyTop + step * (index + 0.15);
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

  list.hidden = false;
  stage.classList.add('opx-enhanced');
  const explanation = scope.querySelector('.opx-explanation');
  if (explanation) explanation.open = false;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(configure);
  }, { passive: true });
  window.addEventListener('pageshow', schedule);
  reduced.addEventListener('change', configure);
  document.getElementById('motion')?.addEventListener('click', configure);
  document.fonts?.ready.then(configure);
  configure();
})();
