// Developers, "What good looks like": one looping story, never stopping while the section is on screen.
// Search: the cached parts light, then the live parts. Checkout: the stages light one after another, the booking retries once.
// Then the three promises light in turn, everything eases out, and it starts again.
(() => {
  const root = document.querySelector('#performance.dp4'); if (!root) return;
  const q = s => [...root.querySelectorAll(s)];
  const top = q('.dp4-mock-top'), n1 = q('.dp4-note.n1'), bottom = q('.dp4-mock-bottom'), n2 = q('.dp4-note.n2');
  const st = q('.dp4-stage'), sf = q('.dp4-safe li');
  const all = [...top, ...n1, ...bottom, ...n2, ...st, ...sf];
  all.forEach(e => e.classList.add('dp4-item'));
  const CYCLE = 11000;
  const plan = [[300, top], [900, n1], [2300, bottom], [2900, n2], [4800, [st[0]]], [6000, [st[1]]], [6600, 'retry'], [8200, [st[2]]], [8900, [sf[0]]], [9500, [sf[1]]], [10100, [sf[2]]]];
  let timers = [], visible = false, running = false;
  const on = (list, v) => list.forEach(e => e.classList.toggle('is-on', v));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  function play() {
    clear(); on(all, false); st[1]?.classList.remove('is-retry');
    plan.forEach(([t, what]) => timers.push(setTimeout(() => {
      if (what === 'retry') { st[1]?.classList.add('is-retry'); timers.push(setTimeout(() => st[1]?.classList.remove('is-retry'), 1400)); } else on(what, true);
    }, t)));
    timers.push(setTimeout(() => on(all, false), CYCLE - 700));
    timers.push(setTimeout(() => { if (visible) play(); else running = false; }, CYCLE));
    running = true;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { on(all, true); return; }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !running) play(); else if (!visible) { clear(); running = false; } }, { threshold: .25 }).observe(root);
})();
