// Inner pages that follow the Version 2 homepage: eased wheel scrolling, and chapters that
// unfold with the scroll position (no scroll interception beyond easing, no pinning).
(() => {
  // ---- Eased wheel input, without interfering with touch, keyboard, zoom or nested scrollers.
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let scrollTarget = window.scrollY, scrollFrame = 0, scrollTime = 0, scrollVelocity = 0, scrollPosition = window.scrollY;
  function stopSmoothWheel() {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = 0; scrollTime = 0; scrollVelocity = 0;
    scrollPosition = window.scrollY;
    document.documentElement.classList.remove('wheel-smoothing');
    scrollTarget = window.scrollY;
  }
  function animateSmoothWheel(time) {
    const dt = scrollTime ? Math.min(time - scrollTime, 50) : 16.67;
    scrollTime = time;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    scrollTarget = Math.max(0, Math.min(scrollTarget, max));
    // A slightly underdamped spring adds a restrained overshoot on settling.
    const steps = Math.ceil(dt / 8), step = dt / steps / 1000;
    for (let i = 0; i < steps; i++) {
      const acceleration = 180 * (scrollTarget - scrollPosition) - 23 * scrollVelocity;
      scrollVelocity += acceleration * step;
      scrollPosition += scrollVelocity * step;
      if (scrollPosition < 0 || scrollPosition > max) { scrollPosition = Math.max(0, Math.min(scrollPosition, max)); scrollVelocity = 0; }
    }
    if (Math.abs(scrollTarget - scrollPosition) < .5 && Math.abs(scrollVelocity) < 3) { window.scrollTo(0, scrollTarget); stopSmoothWheel(); return; }
    window.scrollTo(0, scrollPosition);
    scrollFrame = requestAnimationFrame(animateSmoothWheel);
  }
  window.addEventListener('wheel', event => {
    if (motionPreference.matches || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    for (let element = event.target instanceof Element ? event.target : null; element && element !== document.body; element = element.parentElement) {
      if (element.tagName === 'DIALOG' || element.matches('input,textarea,select,[contenteditable="true"]')) return;
      const style = getComputedStyle(element);
      if (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight) return;
    }
    if (!event.cancelable) return;
    const amount = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    event.preventDefault();
    if (!scrollFrame) { scrollTarget = window.scrollY; scrollPosition = window.scrollY; scrollVelocity = 0; }
    scrollTarget = Math.max(0, Math.min(scrollTarget + amount, document.documentElement.scrollHeight - window.innerHeight));
    if (!scrollFrame) { document.documentElement.classList.add('wheel-smoothing'); scrollTime = 0; scrollFrame = requestAnimationFrame(animateSmoothWheel); }
  }, { passive: false });
  window.addEventListener('keydown', e => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) stopSmoothWheel(); });
  window.addEventListener('pointerdown', stopSmoothWheel, { passive: true });
  window.addEventListener('touchstart', stopSmoothWheel, { passive: true });
  window.addEventListener('blur', stopSmoothWheel);
  motionPreference.addEventListener('change', stopSmoothWheel);

  // ---- Chapters unfold with the scroll position, as on the homepage.
  const reduced = motionPreference;
  const compact = matchMedia('(max-width: 760px)');
  const items = [];
  let frame = 0;

  function add(selector, { y = 48, stagger = 0 } = {}) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.dataset.scrollEnter) return;
      element.dataset.scrollEnter = 'arrive';
      items.push({ element, x: 0, y, delay: Math.min(index, 2) * stagger, animation: null, shift: 0, progress: -1 });
    });
  }

  // White-label marketplace
  add('.journey-heading > *, .mr-heading > *, .commerce-heading > *, .launch-heading > *', { y: 30, stagger: 0.025 });
  add('.journey-demo, .mr-columns, .commerce-order, .launch-workspace', { y: 56 });
  add('.mr-footer, .commerce-caption, .launch-caption', { y: 30 });
  add('#build-or-buy > header > *', { y: 30, stagger: 0.025 });
  add('.bb-comparison, .bb-note', { y: 48, stagger: 0.035 });
  add('.ma-inner > *, .results-inner > *', { y: 44, stagger: 0.03 });
  // AIyelet personalization
  add('.intent-heading > *, .match-head > *, .embed-heading > *, .day-demo > header > *', { y: 30, stagger: 0.025 });
  add('.intent-stage, .match-workspace, .embed-shell, .day-layout', { y: 56 });
  add('.match-footer, .embed-links, .day-demo > footer', { y: 30 });
  // Shared
  add('#faq .copy-inner > *', { y: 30, stagger: 0.015 });

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    for (const item of items) {
      item.animation?.cancel();
      item.animation = null;
      item.shift = 0;
      item.progress = -1;
      item.element.classList.remove('scroll-enter-active');
    }
  }

  function render() {
    frame = 0;
    const height = window.innerHeight;
    // Read together, then write: the previous translation is excluded from layout geometry.
    const positions = items.map(item => item.element.getBoundingClientRect().top - item.shift);
    items.forEach((item, index) => {
      if (!item.animation) return;
      const start = height * 0.94 - item.delay * height;
      const distance = Math.min(height * (compact.matches ? 0.32 : 0.42), 360);
      const focused = item.element.contains(document.activeElement);
      const progress = focused ? 1 : Math.max(0, Math.min(1, (start - positions[index]) / distance));
      if (Math.abs(progress - item.progress) < 0.0001) return;
      // Smooth deceleration, with no time-based tail after scrolling stops.
      const eased = 1 - Math.pow(1 - progress, 3);
      item.animation.currentTime = eased * 1000;
      item.shift = item.distanceY * (1 - eased);
      item.progress = progress;
      item.element.classList.toggle('scroll-enter-active', progress > 0 && progress < 1);
    });
  }

  function schedule() {
    if (!frame && items.some(item => item.animation)) {
      frame = requestAnimationFrame(() => {
        try { render(); } catch (error) { reset(); console.warn('Scroll entrances disabled:', error); }
      });
    }
  }

  function configure() {
    reset();
    if (reduced.matches || !Element.prototype.animate) return;
    try {
      for (const item of items) {
        // Leave anything the page already animates itself alone.
        if (item.element.getAnimations().length || item.element.style.opacity || item.element.style.translate) continue;
        item.distanceY = compact.matches ? item.y * 0.55 : item.y;
        item.animation = item.element.animate(
          [{ opacity: 0, translate: `0px ${item.distanceY}px` }, { opacity: 1, translate: '0px 0px' }],
          { duration: 1000, fill: 'both' }
        );
        item.animation.pause();
        item.animation.currentTime = 0;
        item.shift = item.distanceY;
      }
      render();
    } catch (error) {
      reset();
      console.warn('Scroll entrances unavailable:', error);
    }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', configure, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  document.addEventListener('load', schedule, true);
  reduced.addEventListener('change', configure);
  compact.addEventListener('change', configure);
  // Layout changes such as an expanded FAQ or a loaded font must keep the reveal aligned.
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  document.fonts?.ready.then(schedule);
  configure();
})();
