// "The problems you'd work on": the four problems light up and send a pulse into the Bridgify card; the card then serves Banks, Airlines and Super apps.
(() => {
  const root = document.querySelector('[data-cpp3]'); if (!root) return;
  const F = window.BridgifyFlow, NS = 'http://www.w3.org/2000/svg';
  const cells = [...root.querySelectorAll('.cpp3-cell')], hub = root.querySelector('[data-hub]'), partners = [...root.querySelectorAll('[data-partner]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), wide = matchMedia('(min-width:1001px)');
  const mk = (tag, a, p) => { const e = document.createElementNS(NS, tag); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); p.append(e); return e; };
  let svg = null, runs = [];
  const CYCLE = 9200;
  function build() {
    svg?.remove(); svg = null; runs = [];
    if (!wide.matches || !F) return;
    const r = root.getBoundingClientRect(); if (!r.width) return;
    svg = mk('svg', { class: 'cpp3-wires', width: r.width, height: r.height, viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, root);
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }; };
    const h = box(hub), contacts = new Set();
    const ring = (x, y) => { const k = Math.round(x) + ',' + Math.round(y); if (contacts.has(k)) return; contacts.add(k); mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg); };
    const route = (x0, y0, x1, y1, start, dur, to, glowHub) => {
      const my = y0 + (y1 - y0) * .55, rr = Math.min(10, Math.abs(y1 - y0) / 4), k = x1 > x0 ? 1 : -1;
      const d = Math.abs(x1 - x0) < 1 ? `M${x0} ${y0}V${y1}` : `M${x0} ${y0}V${my - rr}Q${x0} ${my} ${x0 + k * rr} ${my}H${x1 - k * rr}Q${x1} ${my} ${x1} ${my + rr}V${y1}`;
      const path = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .5 }, svg);
      ring(x0, y0); ring(x1, y1);
      const dots = Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg));
      runs.push({ path, len: path.getTotalLength(), dots, start, dur, to, glowHub });
    };
    // hub -> partners, then partners -> the problems
    const hc = h.x + h.w / 2;
    partners.forEach((p, i) => { const b = box(p); route(hc + (i - 1) * Math.min(80, h.w / 8), h.y + h.h, b.x + b.w / 2, b.y, 500 + i * 450, 1200, p, false); });
    cells.forEach((c, i) => { const j = [0, 1, 1, 2][i], pb = box(partners[j]), b = box(c); route(pb.x + pb.w / 2 + (i === 1 ? -18 : i === 2 ? 18 : 0), pb.y + pb.h, b.x + b.w / 2, b.y, 2700 + i * 700, 1300, c, false); });
  }
  const reset = () => { cells.forEach(c => c.classList.remove('is-lit')); partners.forEach(p => p.classList.remove('is-lit')); hub.style.setProperty('--arrival', 0); runs.forEach(a => a.dots.forEach(d => d.setAttribute('opacity', 0))); };
  new ResizeObserver(build).observe(root); document.fonts?.ready.then(build); build();
  if (reduced.matches || !F) { cells.forEach(c => c.classList.add('is-lit')); partners.forEach(p => p.classList.add('is-lit')); return; }
  F.run(root, elapsed => {
    const t = elapsed % CYCLE;
    cells.forEach((c, i) => c.classList.toggle('is-lit', t >= 2700 + i * 700 + 1100 && t < 8200));
    let arrival = 0;
    runs.forEach(a => {
      a.dots.forEach((d, i) => { const u = (t - a.start - i * F.delay) / a.dur; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); });
    });
    hub.style.setProperty('--arrival', F.arrival(t - 100));
    partners.forEach((p, i) => p.classList.toggle('is-lit', t >= 500 + i * 450 + 1000 && t < 8200));
  }, reset);
})();
