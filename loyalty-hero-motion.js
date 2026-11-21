/* Loyalty hero: the story of one redemption, on its own. A member with 84,000 points looks at a Louvre tour that costs €120,
   moves the slider from cash to points, presses Redeem, and the points balance goes down while the tour lights up as bought.
   It stops for good as soon as the visitor touches the slider or the button. */
(() => {
  const slider = document.querySelector('#lr-share'), button = document.querySelector('#lr-redeem'), win = document.querySelector('.lr-window');
  const bal = document.querySelector('.lr-balance strong'), product = document.querySelector('.lr-product');
  if (!slider || !button || !win || !bal || !product) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const CYCLE = 11000, ease = x => x * x * (3 - 2 * x), clamp = x => Math.max(0, Math.min(1, x));
  const numNode = [...bal.childNodes].find(n => n.nodeType === 3);
  let visible = false, stopped = false, raf = 0, start = 0, shown = -1, synthetic = false, redeemed = false;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const setSlider = v => { v = Math.round(v * 1.2); if (v === shown) return; shown = v; slider.value = v; slider.dispatchEvent(new Event('input', { bubbles: true })); redeemed = false; };
  const setBalance = n => { if (numNode) numNode.textContent = fmt(Math.round(n / 100) * 100) + ' '; };
  const stop = () => { if (synthetic) return; stopped = true; win.classList.remove('lr-fade'); cancelAnimationFrame(raf); win.classList.remove('lr-live'); button.classList.remove('lr-press'); product.classList.remove('lr-bought'); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => slider.addEventListener(e, stop, { passive: true }));
  button.addEventListener('click', stop);
  function frame(now) {
    if (stopped || !visible || document.hidden) { raf = 0; return; }
    if (!start) start = now;
    const t = (now - start) % CYCLE;
    // 0-1200 cash price, 1200-4000 slider glides to points, 4000-5200 hold, 5200-5800 Redeem pressed,
    // 5800-7600 balance counts down and the tour lights up, hold to 10000, then the card fades (10000-10300),
    // resets while hidden and fades back in at the cash price. The balance never climbs back: points are only spent.
    const reset = t >= 10300;
    let v = 0;
    if (t < 1200 || reset) v = 0;
    else if (t < 4000) v = 100 * ease(clamp((t - 1200) / 2800));
    else v = 100;
    setSlider(v);
    const pressed = !reset && t >= 5200 && t < 5800;
    button.classList.toggle('lr-press', pressed);
    const done = !reset && t >= 5800 && t < 10300;
    if (done && !redeemed) { redeemed = true; synthetic = true; button.textContent = 'Demo redeemed'; synthetic = false; }
    if (product.classList.contains('lr-bought') !== done) { product.classList.toggle('lr-bought', done); if (window.__lrUpdate) window.__lrUpdate(); }
    win.classList.toggle('lr-fade', t >= 10000 && t < 10300);
    setBalance(done ? 84000 - 12000 * ease(clamp((t - 5800) / 1800)) : 84000);
    win.classList.add('lr-live');
    raf = requestAnimationFrame(frame);
  }
  const resume = () => { cancelAnimationFrame(raf); raf = 0; start = 0; if (visible && !stopped && !document.hidden && !reduced.matches) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume(); }, { threshold: .3 }).observe(win);
  document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', resume);
})();
