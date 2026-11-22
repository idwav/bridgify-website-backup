// Developers, "What good looks like": the story plays box by box. Search types "Rome", cards rise, the prices count up and say Live, Book is pressed on one card; the screen slides to Checkout (price checked, sending, timeout, retry, confirmed); then to Monitoring.
// A box lights up only while its part runs; when a part ends, the site's wire carries a pulse to the next box, which then lights.
(() => {
  const root = document.querySelector('#performance.dp6'); if (!root) return;
  const stage = root.querySelector('.dp6-stage'), beats = [...root.querySelectorAll('.dp6-beat')], typed = root.querySelector('.dp6-typed');
  const boxes = [...root.querySelectorAll('.dp6-box')], boxOf = beats.map(b => boxes.indexOf(b.closest('.dp6-box')));
  const prices = [...root.querySelectorAll('.dp6-price')];
  const STEP = [1100, 2000, 1100, 900, 1900, 1200, 2000], WORD = 'Rome', PULSE = 750;
  let cur = 0, timer = 0, typing = 0, press = 0, visible = false, hold = false, countRaf = 0;
  const type = () => { clearInterval(typing); let i = 0; typed.textContent = ''; typing = setInterval(() => { typed.textContent = WORD.slice(0, ++i); if (i >= WORD.length) clearInterval(typing); }, 130); };
  const countUp = () => { cancelAnimationFrame(countRaf); const t0 = performance.now() + 250; const tick = now => { const u = Math.max(0, Math.min(1, (now - t0) / 700)), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; prices.forEach(p => { p.textContent = '€' + Math.round(+p.dataset.v * e); }); if (u < 1) countRaf = requestAnimationFrame(tick); }; countRaf = requestAnimationFrame(tick); };
  const show = n => {
    cur = n; stage.dataset.beat = n + 1; stage.classList.remove('is-press'); clearTimeout(press);
    beats.forEach((b, i) => b.classList.toggle('is-on', i === n));
    boxes.forEach((b, i) => b.classList.toggle('is-lit', i === boxOf[n]));
    if (n === 0) { type(); prices.forEach(p => p.textContent = '€0'); } else typed.textContent = WORD;
    if (n === 1) { countUp(); press = setTimeout(() => stage.classList.add('is-press'), 1600); }
    if (n > 1) prices.forEach(p => p.textContent = '€' + p.dataset.v);
  };
  // wire between boxes
  const F = window.BridgifyFlow, grid = root.querySelector('.dp6-beats');
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); p.append(e); return e; };
  let svg = null, runs = [];
  function build() {
    svg?.remove(); runs = []; if (!F) return;
    const r = grid.getBoundingClientRect(); if (!r.width) return;
    svg = mk('svg', { class: 'dp6-wires', width: r.width, height: r.height, viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, grid);
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }; };
    for (let i = 0; i < boxes.length - 1; i++) {
      const a = box(boxes[i]), b = box(boxes[i + 1]), x = a.x + 40, y0 = a.y + a.h, y1 = b.y;
      const path = mk('path', { d: `M${x} ${y0}V${y1}`, fill: 'none', stroke: '#f46649', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: .35 }, svg);
      [[x, y0], [x, y1]].forEach(([cx, cy]) => mk('circle', { cx, cy, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg));
      const dots = Array.from({ length: 9 }, (_, k) => mk('circle', { r: F.radius(k), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg));
      runs.push({ path, len: path.getTotalLength(), dots, t0: -1 });
    }
  }
  const fire = i => { const a = runs[i]; if (!a) return; a.t0 = performance.now(); a.path.setAttribute('opacity', 1); a.path.classList.add('dp6-wire-lit'); setTimeout(() => { a.path.setAttribute('opacity', .35); a.path.classList.remove('dp6-wire-lit'); }, PULSE + 500); };
  new ResizeObserver(build).observe(grid); document.fonts?.ready.then(build); build();
  (function loop(now) { requestAnimationFrame(loop); runs.forEach(a => a.dots.forEach((d, i) => { const u = a.t0 < 0 ? -1 : (now - a.t0 - i * F.delay) / PULSE; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); })); })(performance.now());
  // advance: when the last beat of a box ends, the wire carries the light, then the next box takes over
  const next = () => {
    clearTimeout(timer); if (!visible || hold) return;
    timer = setTimeout(() => {
      const n = (cur + 1) % beats.length, crossing = boxOf[n] !== boxOf[cur] && n !== 0;
      if (crossing) { fire(boxOf[cur]); boxes[boxOf[cur]].classList.remove('is-lit'); timer = setTimeout(() => { show(n); next(); }, PULSE); }
      else { show(n); next(); }
    }, STEP[cur]);
  };
  beats.forEach((b, i) => b.addEventListener('click', () => { hold = true; clearTimeout(timer); show(i); setTimeout(() => { hold = false; next(); }, 4000); }));
  show(0);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(6); boxes.forEach(b => b.classList.add('is-lit')); return; }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) next(); else clearTimeout(timer); }, { threshold: .3 }).observe(stage);
})();
