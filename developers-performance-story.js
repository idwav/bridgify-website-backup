// Developers, "What good looks like": seven quick beats on repeat while on screen. Search types "Rome", results rise, prices land, Book is pressed, the price is checked (green), sent, timed out and retried, confirmed, and watched. The screen never changes size.
(() => {
  const root = document.querySelector('#performance.dp6'); if (!root) return;
  const stage = root.querySelector('.dp6-stage'), beats = [...root.querySelectorAll('.dp6-beat')], typed = root.querySelector('.dp6-typed');
  const STEP = [1400, 2400, 1700, 1100, 2400, 1500, 2200], WORD = 'Rome';
  let cur = 0, timer = 0, typing = 0, press = 0, visible = false, hold = false;
  const type = () => { clearInterval(typing); let i = 0; typed.textContent = ''; typing = setInterval(() => { typed.textContent = WORD.slice(0, ++i); if (i >= WORD.length) clearInterval(typing); }, 160); };
  const show = n => {
    cur = n; stage.dataset.beat = n + 1; stage.classList.remove('is-press'); clearTimeout(press);
    beats.forEach((b, i) => b.classList.toggle('is-on', i === n));
    if (n === 0) type(); else typed.textContent = WORD;
    if (n === 1) press = setTimeout(() => stage.classList.add('is-press'), 1900);
  };
  const next = () => { clearTimeout(timer); if (!visible || hold) return; timer = setTimeout(() => { show((cur + 1) % beats.length); next(); }, STEP[cur]); };
  beats.forEach((b, i) => b.addEventListener('click', () => { hold = true; clearTimeout(timer); show(i); setTimeout(() => { hold = false; next(); }, 4000); }));
  // the site's wire between the three boxes: rings at the contacts, light pulses running down
  const F = window.BridgifyFlow, grid = root.querySelector('.dp6-beats'), boxes = [...root.querySelectorAll('.dp6-box')];
  let svg = null, runs = [];
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); p.append(e); return e; };
  function build() {
    svg?.remove(); runs = []; if (!F) return;
    const r = grid.getBoundingClientRect(); if (!r.width) return;
    svg = mk('svg', { class: 'dp6-wires', width: r.width, height: r.height, viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, grid);
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }; };
    for (let i = 0; i < boxes.length - 1; i++) {
      const a = box(boxes[i]), b = box(boxes[i + 1]), x = a.x + 40, y0 = a.y + a.h, y1 = b.y;
      const path = mk('path', { d: `M${x} ${y0}V${y1}`, fill: 'none', stroke: '#f46649', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: .8 }, svg);
      [[x, y0], [x, y1]].forEach(([cx, cy]) => mk('circle', { cx, cy, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg));
      const dots = Array.from({ length: 9 }, (_, k) => mk('circle', { r: F.radius(k), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg));
      runs.push({ path, len: path.getTotalLength(), dots, start: i * 700, dur: 900 });
    }
  }
  new ResizeObserver(build).observe(grid); document.fonts?.ready.then(build); build();
  if (F && !matchMedia('(prefers-reduced-motion: reduce)').matches) F.run(grid, el => { const t = el % 2200; runs.forEach(a => a.dots.forEach((d, i) => { const u = (t - a.start - i * F.delay) / a.dur; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); })); }, () => runs.forEach(a => a.dots.forEach(d => d.setAttribute('opacity', 0))));
  show(0);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(6); return; }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) next(); else clearTimeout(timer); }, { threshold: .3 }).observe(stage);
})();
