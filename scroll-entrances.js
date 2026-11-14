// Homepage chapters unfold with the scroll position; no scroll interception or pinning.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const items = [];
  const scope = document.currentScript?.dataset.revealScope;
  const v2Revealed = document.documentElement.dataset.homeVersion === '2' && '#sources, #personalization, #products, #audiences, #partners, #faq';
  let frame = 0;

  function add(selector, { x = 0, y = 48, mask = false, stagger = 0 } = {}) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (scope && !element.closest(scope)) return;
      // The V2 homepage reveals these sections part by part in homepage-v2.js.
      if (v2Revealed && element.closest(v2Revealed)) return;
      element.dataset.scrollEnter = mask ? 'unfold' : 'arrive';
      items.push({ element, x, y, mask, delay: Math.min(index, 2) * stagger, animation: null, shift: 0, progress: -1 });
    });
  }

  if (scope) add(".sc-how .sc-info-heading, .sc-how .sc-info-grid, .sc-section > .sc-eyebrow, .sc-section > .sc-heading, .sc-section > .up-layout, .ys-hero > .ys-copy, .ys-hero > .ys-ticket, .lu-section > .eyebrow, .lu-section > h2, .lu-section > .lu-layout, .loyalty-choice > .ch-eyebrow, .loyalty-choice > h2, .loyalty-choice > .ch-panel, .lm-signal > header, .lm-signal > .lm-flow, .lm-signal > .lm-body, .wl-localization > .wl-heading, .wl-localization > .wl-layout, .market-product-tour > header, .market-product-tour > .tour, .wo-section > .wo-heading, .wo-section > .wo-stack, .bc-section > .bc-heading, .bc-section > .bc-comparison, #section-5 > .launch-heading, #section-5 > .launch-workspace", { y: 16, stagger: 0.02 });
  add('#sources > *', { y: 30, stagger: 0.025 });
  add('.opportunity-heading > *, #global .aggregation-layout > div:first-child > *', { stagger: 0.035 });
  document.querySelectorAll('.opportunity-side').forEach((side, index) => {
    const direction = index % 2 ? 1 : -1;
    side.querySelectorAll('.opportunity-label, figure, .opportunity-copy').forEach(element => {
      element.dataset.scrollEnter = 'unfold';
      items.push({ element, x: direction * 24, y: 44, mask: element.tagName === 'FIGURE', delay: 0, animation: null, shift: 0, progress: -1 });
    });
  });
  add('.aggregation-journey > article', { y: 56, stagger: 0.035 });
  add('#personalization > div:first-child > *', { stagger: 0.025 });
  add('#personalization .v4-intent', { x: 36, y: 56, mask: true });
  add('.solutions-heading > *', { stagger: 0.025 });
  document.querySelectorAll('.solution-row').forEach((row, index) => {
    const direction = index % 2 ? 1 : -1;
    const copy = row.querySelector('.solution-row-copy');
    const stage = row.querySelector('.solution-row-stage');
    for (const [element, x, y, mask] of [[copy, -direction * 40, 32, false], [stage, direction * 56, 64, true]]) {
      if (!element) continue;
      element.dataset.scrollEnter = mask ? 'unfold' : 'arrive';
      items.push({ element, x, y, mask, delay: 0, animation: null, shift: 0, progress: -1 });
    }
  });
  add('.v4-chooser > *, .audiences-head > *, .partner-results-copy > *', { stagger: 0.025 });
  add('.audience-card', { y: 48, stagger: 0.035 });
  add('.partner-metric', { y: 56, stagger: 0.035 });
  add('.v4-partners > *, #faq .copy-inner > *', { y: 30, stagger: 0.015 });
  add('.final-cta-panel > h2, .final-cta-panel > p, .final-cta-panel > a', { y: 56, stagger: 0.04 });
  add('.home-footer-navigation', { y: 24 });

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
      const rawProgress = focused ? 1 : Math.max(0, Math.min(1, (start - positions[index]) / distance));
      const progress = scope ? Math.max(item.progress, rawProgress) : rawProgress;
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
    if (reduced.matches || document.querySelector('.hero')?.classList.contains('paused') || !Element.prototype.animate) return;
    try {
      for (const item of items) {
        const bounds = item.element.getBoundingClientRect();
        const x = compact.matches ? 0 : Math.max(-bounds.left, Math.min(item.x, document.documentElement.clientWidth - bounds.right));
        item.distanceY = compact.matches ? item.y * 0.55 : item.y;
        const from = { opacity: 0, translate: `${x}px ${item.distanceY}px` };
        const to = { opacity: 1, translate: '0px 0px' };
        if (item.mask) {
          from.clipPath = 'inset(12% 0 0 0)';
          to.clipPath = 'inset(0% 0 0 0)';
        }
        item.animation = item.element.animate([from, to], { duration: 1000, fill: 'both' });
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
  document.getElementById('motion')?.addEventListener('click', configure);
  // Layout changes such as an expanded FAQ or a loaded font must keep the reveal aligned.
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  document.fonts?.ready.then(schedule);
  configure();
})();
