// Developers, "What good looks like": the site's wiring. Rings at the contacts, rounded elbows, light pulses (the same wire as Careers and the docs flow). Heading to steps inside each moment, Search down to Checkout, and Checkout fanning out to the three promises.
(() => {
  const root = document.querySelector('#performance.dp3'); const F = window.BridgifyFlow; if (!root || !F) return;
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); p.append(e); return e; };
  const cards = [...root.querySelectorAll('.dp3-card')], safe = [...root.querySelectorAll('.dp3-safe li')];
  let svg = null, runs = [];
  function build() {
    svg?.remove(); runs = [];
    const r = root.getBoundingClientRect(); if (!r.width) return;
    svg = mk('svg', { class: 'dp3-wires', width: r.width, height: r.height, viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, root);
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }; };
    const seen = new Set();
    const ring = (x, y) => { const k = Math.round(x) + ',' + Math.round(y); if (seen.has(k)) return; seen.add(k); mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg); };
    const route = (d, x0, y0, x1, y1, start, dur, glow) => {
      const path = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: .7 }, svg);
      ring(x0, y0); ring(x1, y1);
      const dots = Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg));
      runs.push({ path, len: path.getTotalLength(), dots, start, dur });
    };
    const vertical = innerWidth <= 700;
    let t0 = 300;
    cards.forEach(c => {
      const steps = [...c.querySelectorAll('.dp3-step')].map(box), h = box(c.querySelector('header'));
      if (!vertical) {
        const hx = h.x + h.w + 8, hy = h.y + h.h / 2;
        route(`M${hx} ${hy}H${steps[0].x}`, hx, hy, steps[0].x, steps[0].y + steps[0].h / 2, t0, 900);
        for (let i = 0; i < steps.length - 1; i++) { const a = steps[i], b = steps[i + 1], y = a.y + a.h / 2; route(`M${a.x + a.w} ${y}H${b.x}`, a.x + a.w, y, b.x, y, t0 + 700 + i * 700, 900); }
      } else {
        for (let i = 0; i < steps.length - 1; i++) { const a = steps[i], b = steps[i + 1], x = a.x + a.w / 2; route(`M${x} ${a.y + a.h}V${b.y}`, x, a.y + a.h, x, b.y, t0 + i * 600, 800); }
      }
      t0 += 2200;
    });
    if (cards.length > 1) { const a = box(cards[0]), b = box(cards[1]), x = a.x + a.w / 2; route(`M${x} ${a.y + a.h}V${b.y}`, x, a.y + a.h, x, b.y, 2400, 800); }
    const last = box(cards[cards.length - 1]), cx = last.x + last.w / 2, y0 = last.y + last.h;
    safe.forEach((s, i) => {
      const b = box(s), tx = b.x + b.w / 2, my = y0 + (b.y - y0) * .5, rr = Math.min(10, (b.y - y0) / 4), k = tx > cx ? 1 : -1;
      const d = Math.abs(tx - cx) < 1 ? `M${cx} ${y0}V${b.y}` : `M${cx} ${y0}V${my - rr}Q${cx} ${my} ${cx + k * rr} ${my}H${tx - k * rr}Q${tx} ${my} ${tx} ${my + rr}V${b.y}`;
      route(d, cx, y0, tx, b.y, 4400 + i * 450, 1000);
    });
  }
  const CYCLE = 8200;
  new ResizeObserver(build).observe(root); document.fonts?.ready.then(build); build();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  F.run(root, elapsed => {
    const t = elapsed % CYCLE;
    runs.forEach(a => a.dots.forEach((d, i) => { const u = (t - a.start - i * F.delay) / a.dur; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); }));
  }, () => runs.forEach(a => a.dots.forEach(d => d.setAttribute('opacity', 0))));
})();
