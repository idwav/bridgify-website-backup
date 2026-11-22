// Loyalty, "Banks are building travel brands": the three channels feed one point. Our wire (rings, elbows, light pulses) runs from each card into the hub, one after another.
(() => {
  const flow = document.querySelector('.lm3-flow'), F = window.BridgifyFlow; if (!flow || !F) return;
  const cards = [...flow.querySelectorAll('.lm3-card')], hub = flow.querySelector('.lm3-hub');
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); p.append(e); return e; };
  let svg = null, runs = [];
  function build() {
    svg?.remove(); runs = []; const r = flow.getBoundingClientRect(); if (!r.width) return;
    svg = mk('svg', { class: 'lm3-wires', width: r.width, height: r.height, viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, flow);
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }; };
    const h = box(hub), stacked = innerWidth < 1024, seen = new Set();
    const ring = (x, y) => { const k = Math.round(x) + ',' + Math.round(y); if (seen.has(k)) return; seen.add(k); mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg); };
    cards.forEach((c, i) => {
      const b = box(c); let d, x0, y0, x1, y1;
      if (!stacked) {
        x0 = b.x + b.w / 2; y0 = b.y + b.h; x1 = Math.min(Math.max(x0, h.x + 60), h.x + h.w - 60); y1 = h.y;
        const my = y0 + (y1 - y0) * .5, rr = Math.min(10, (y1 - y0) / 4), k = x1 > x0 ? 1 : -1;
        d = Math.abs(x1 - x0) < 1 ? `M${x0} ${y0}V${y1}` : `M${x0} ${y0}V${my - rr}Q${x0} ${my} ${x0 + k * rr} ${my}H${x1 - k * rr}Q${x1} ${my} ${x1} ${my + rr}V${y1}`;
      } else { return; }
      const path = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: .8 }, svg);
      ring(x0, y0); ring(x1, y1);
      const dots = Array.from({ length: 9 }, (_, k) => mk('circle', { r: F.radius(k), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg));
      runs.push({ path, len: path.getTotalLength(), dots, start: 300 + i * 600, dur: 1200 });
    });
  }
  new ResizeObserver(build).observe(flow); document.fonts?.ready.then(build); build();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  F.run(flow, el => { const t = el % 3800; runs.forEach(a => a.dots.forEach((d, i) => { const u = (t - a.start - i * F.delay) / a.dur; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); })); }, () => runs.forEach(a => a.dots.forEach(d => d.setAttribute('opacity', 0))));
})();
