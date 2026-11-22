// Loyalty, "Banks are building travel brands": one short story on repeat while on screen.
// The cursor redeems on the site, a finger taps Redeem in the app, the card gets the redemption and its points count down.
(() => {
  const stage = document.querySelector('#market-signal .lm4-stage'); if (!stage) return;
  const n = stage.querySelector('.lm4-n'), CYCLE = 9200;
  let timers = [], visible = false, raf = 0;
  const set = (...k) => { const cur = new Set((stage.dataset.s || '').split(' ').filter(Boolean)); k.forEach(x => cur.add(x)); stage.dataset.s = [...cur].join(' '); };
  const count = (from, to, dur) => { cancelAnimationFrame(raf); const t0 = performance.now(); const tick = now => { const u = Math.min(1, (now - t0) / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; n.textContent = Math.round(from + (to - from) * e).toLocaleString('en-US'); if (u < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  function play() {
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
