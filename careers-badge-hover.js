// Careers hero: the team badge is a real pendulum. It follows the pointer with spring physics (a quick move gives it a push, it overshoots and settles), leans in 3D as it swings, and breathes gently when left alone. Desktop with a mouse only.
(() => {
  const cb = document.querySelector('.cb'), swing = cb && cb.querySelector('.cb-swing');
  if (!swing || !matchMedia('(hover:hover) and (min-width:1101px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const MAX = 15, K = 38, C = 3.1;           // max angle (deg), spring stiffness, damping: lively, 2-3 visible swings
  let theta = 0, omega = 0, target = 0, hover = false, lastX = null, last = 0, visible = true;
  cb.addEventListener('pointermove', e => {
    const r = cb.getBoundingClientRect(), x = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    if (lastX !== null) omega += clamp(-(e.clientX - lastX) * .3, -26, 26);   // a fast pass pushes the badge
    lastX = e.clientX; hover = true; target = -x * MAX;
  });
  cb.addEventListener('pointerleave', () => { hover = false; target = 0; lastX = null; });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(cb);
  const tick = now => {
    requestAnimationFrame(tick);
    if (!visible) { last = now; return; }
    const dt = Math.min(.033, (now - (last || now)) / 1000); last = now;
    const idle = hover ? 0 : Math.sin(now / 1900) * 1.1;                          // soft breathing at rest
    const acc = -K * (theta - (target + idle)) - C * omega;
    omega += acc * dt; theta += omega * dt;
    const lean = clamp(theta * -.9, -14, 14);                                      // 3D lean with the swing
    swing.style.transform = `rotate(${theta.toFixed(3)}deg) rotateY(${lean.toFixed(3)}deg)`;
    cb.style.setProperty('--sheen', (theta / MAX).toFixed(3));
  };
  requestAnimationFrame(tick);
})();
