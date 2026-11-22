// Loyalty, "Banks are building travel brands": one short story on repeat while on screen.
// The cursor redeems on the site, a finger taps Redeem in the app, the card gets the redemption and its points count down.
(() => {
  const stage = document.querySelector('#market-signal .lm4-stage'); if (!stage) return;
  const n = stage.querySelector('.lm4-n'), CYCLE = 9200;
  let timers = [], visible = false, raf = 0;
  const set = (...k) => { const cur = new Set((stage.dataset.s || '').split(' ').filter(Boolean)); k.forEach(x => cur.add(x)); stage.dataset.s = [...cur].join(' '); };
  const count = (from, to, dur) => { cancelAnimationFrame(raf); const t0 = performance.now(); const tick = now => { const u = Math.min(1, (now - t0) / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; n.textContent = Math.round(from + (to - from) * e).toLocaleString('en-US'); if (u < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  // aim the cursor and the finger at the real buttons
  const aim = () => {
    const lap = stage.querySelector('.lm4-lscreen'), cur = stage.querySelector('.lm4-cursor'), b1 = lap?.querySelector('.lm4-btn');
    if (lap && cur && b1) { const L = lap.getBoundingClientRect(), r = b1.getBoundingClientRect(), z = parseFloat(getComputedStyle(lap.closest('.lm4-col')).getPropertyValue('--z')) || 1; cur.style.setProperty('--tx', ((r.left - L.left + r.width * .5) / z) + 'px'); cur.style.setProperty('--ty', ((r.top - L.top + r.height * .55) / z) + 'px'); cur.style.setProperty('--sx', ((r.left - L.left - 80) / z) + 'px'); cur.style.setProperty('--sy', ((r.top - L.top + 90) / z) + 'px'); }
    const ph = stage.querySelector('.lm4-phone'), tap = stage.querySelector('.lm4-tap'), b2 = ph?.querySelector('.lm4-btn');
    if (ph && tap && b2) { const P = ph.getBoundingClientRect(), r = b2.getBoundingClientRect(), z = parseFloat(getComputedStyle(ph.closest('.lm4-col')).getPropertyValue('--z')) || 1; tap.style.left = ((r.left - P.left + r.width * .5) / z) + 'px'; tap.style.top = ((r.top - P.top + r.height * .5) / z) + 'px'; }
  };
  addEventListener('resize', aim);
  function play() {
    aim();
    timers.forEach(clearTimeout); timers = []; stage.dataset.s = ''; n.textContent = '84,000';
    at(500, () => set('site-move')); at(1700, () => set('site-click')); at(1900, () => set('site-done'));
    at(3000, () => set('app-tap')); at(3300, () => set('app-done'));
    at(4600, () => set('card-toast')); at(5100, () => { set('card-pay'); count(84000, 72000, 1200); });
    at(8400, () => { stage.dataset.s = ''; });
    at(CYCLE, () => { if (visible) play(); });
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { stage.dataset.s = 'site-done app-done card-toast'; n.textContent = '72,000'; return; }
  new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) play(); else if (!visible) { timers.forEach(clearTimeout); timers = []; } }, { threshold: .35 }).observe(stage);
})();
