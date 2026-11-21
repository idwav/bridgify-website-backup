/* Loyalty hero: the story of one redemption, on its own. A member with 84,000 points looks at a Louvre tour that costs €120,
   moves the slider from cash to points, presses Redeem, and the points balance goes down while the tour lights up as bought.
   It stops for good as soon as the visitor touches the slider or the button. */
(() => {
  const slider = document.querySelector('#lr-share'), button = document.querySelector('#lr-redeem'), win = document.querySelector('.lr-window');
  const bal = document.querySelector('.lr-balance strong'), product = document.querySelector('.lr-product');
  if (!slider || !button || !win || !bal || !product) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const CYCLE = 10400, ease = x => x * x * (3 - 2 * x), clamp = x => Math.max(0, Math.min(1, x));
  const numNode = [...bal.childNodes].find(n => n.nodeType === 3);
  let visible = false, stopped = false, raf = 0, start = 0, shown = -1, synthetic = false, redeemed = false;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const setSlider = v => { v = Math.round(v * 1.2); if (v === shown) return; shown = v; slider.value = v; slider.dispatchEvent(new Event('input', { bubbles: true })); redeemed = false; };
  const setBalance = n => { if (numNode) numNode.textContent = fmt(Math.round(n / 100) * 100) + ' '; };
  const stop = () => { if (synthetic) return; stopped = true; cancelAnimationFrame(raf); win.classList.remove('lr-live'); button.classList.remove('lr-press'); product.classList.remove('lr-bought'); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => slider.addEventListener(e, stop, { passive: true }));
  button.addEventListener('click', stop);
  function frame(now) {
    if (stopped || !visible || document.hidden) { raf = 0; return; }
    if (!start) start = now;
    const t = (now - start) % CYCLE;
    // 0-1200 cash price, 1200-3400 slider glides to points, 3400-4600 hold, 4600-5200 Redeem pressed,
    // 5200-6300 balance counts down and the tour lights up, hold to 9200, 9200-10400 back to cash
    let v = 0;
    if (t < 1200) v = 0;
    else if (t < 3400) v = 100 * ease(clamp((t - 1200) / 2200));
    else if (t < 9200) v = 100;
    else v = 100 * (1 - ease(clamp((t - 9200) / 1200)));
    setSlider(v);
    const pressed = t >= 4700 && t < 5300;
    button.classList.toggle('lr-press', pressed);
    const done = t >= 5300 && t < 9200;
    if (done && !redeemed) { redeemed = true; synthetic = true; button.textContent = 'Demo redeemed'; synthetic = false; }
    product.classList.toggle('lr-bought', done);
    // after Redeem the balance counts down to 72,000; while the slider returns it counts back up to 84,000
    setBalance(done ? 84000 - 12000 * ease(clamp((t - 5300) / 1100)) : t >= 9200 ? 72000 + 12000 * ease(clamp((t - 9200) / 1200)) : 84000);
    win.classList.add('lr-live');
    raf = requestAnimationFrame(frame);
  }
  const resume = () => { cancelAnimationFrame(raf); raf = 0; start = 0; if (visible && !stopped && !document.hidden && !reduced.matches) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume(); }, { threshold: .3 }).observe(win);
  document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', resume);
})();
