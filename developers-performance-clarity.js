// Developers, "What good looks like": make live and cached readable at a glance.
// Cached parts are wired with a still line; live parts carry moving light (the site's wire pulses) and the price visibly changes.
(() => {
  const root = document.querySelector('#performance.dp4'); const F = window.BridgifyFlow; if (!root) return;
  const price = root.querySelector('[data-live-price]'), prices = ['€39', '€42', '€39', '€36'];
  if (price && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let i = 0, vis = false;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: .2 }).observe(root);
    setInterval(() => { if (!vis) return; price.classList.add('is-swap'); setTimeout(() => { price.textContent = prices[++i % prices.length]; price.classList.remove('is-swap'); }, 350); }, 2600);
  }
  if (!F) return;
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); p.append(e); return e; };
  let svg = null, runs = [];
  function build() {
    svg?.remove(); runs = [];
    const r = root.getBoundingClientRect(); if (!r.width) return;
    svg = mk('svg', { class: 'dp4-wires', width: r.width, height: r.height, viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, root);
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }; };
    const seen = new Set();
    const ring = (x, y) => { const k = Math.round(x) + ',' + Math.round(y); if (seen.has(k)) return; seen.add(k); mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg); };
    const route = (d, x0, y0, x1, y1, live, start) => {
      const path = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: live ? .85 : .4 }, svg);
      ring(x0, y0); ring(x1, y1);
      if (!live) return;
      const dots = Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg));
      runs.push({ path, len: path.getTotalLength(), dots, start, dur: 1100 });
    };
    const top = root.querySelector('.dp4-mock-top'), bot = root.querySelector('.dp4-mock-bottom'), n1 = root.querySelector('.dp4-note.n1'), n2 = root.querySelector('.dp4-note.n2');
    if (top && n1 && n1.getBoundingClientRect().left > top.getBoundingClientRect().right) {
      [[top, n1, false, 0], [bot, n2, true, 0]].forEach(([a, b, live, st]) => { const A = box(a), B = box(b), y = B.y + B.h / 2; route(`M${A.x + A.w} ${y}H${B.x}`, A.x + A.w, y, B.x, y, live, st); });
    }
    const stages = [...root.querySelectorAll('.dp4-stage')].map(box);
    for (let i = 0; i < stages.length - 1; i++) { const a = stages[i], b = stages[i + 1], x = a.x + 39; route(`M${x} ${a.y + a.h}V${b.y}`, x, a.y + a.h, x, b.y, i === 0, 300 + i * 900); }
    const cards = [...root.querySelectorAll('.dp4-card')];
    if (cards.length > 1 && box(cards[1]).y > box(cards[0]).y + box(cards[0]).h / 2) { /* stacked: no cross-card wire */ }
    const last = box(cards[cards.length - 1]), cx = last.x + last.w / 2, y0 = last.y + last.h;
    [...root.querySelectorAll('.dp4-safe li')].forEach(sf => {
      const b = box(sf), tx = b.x + b.w / 2, my = y0 + (b.y - y0) * .5, rr = Math.min(10, (b.y - y0) / 4), k = tx > cx ? 1 : -1;
      const d = Math.abs(tx - cx) < 1 ? `M${cx} ${y0}V${b.y}` : `M${cx} ${y0}V${my - rr}Q${cx} ${my} ${cx + k * rr} ${my}H${tx - k * rr}Q${tx} ${my} ${tx} ${my + rr}V${b.y}`;
      route(d, cx, y0, tx, b.y, false, 0);
    });
  }
  new ResizeObserver(build).observe(root); document.fonts?.ready.then(build); build();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  F.run(root, elapsed => {
    const t = elapsed % 2400;
    runs.forEach(a => a.dots.forEach((d, i) => { const u = (t - a.start - i * F.delay) / a.dur; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); }));
  }, () => runs.forEach(a => a.dots.forEach(d => d.setAttribute('opacity', 0))));
})();
