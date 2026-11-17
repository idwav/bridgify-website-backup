// About: chaos-to-order story chips, and the wired mission flow (approved BridgifyFlow motion).
(() => {
  const F = window.BridgifyFlow, ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };

  // Story: suppliers start scattered and settle into one infrastructure when the section is reached.
  const order = document.querySelector('[data-order]');
  if (order && !reduced.matches) {
    order.classList.add('chaos');
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => order.classList.remove('chaos'), 700); } }, { threshold: .45 }).observe(order);
  }

  // Mission: sources -> one schema -> one integration (partner channel) -> AIyelet -> the right few.
  const flow = document.querySelector('[data-flow]');
  if (flow && F) {
    const col = n => flow.querySelector('.am-c' + n);
    const srcs = [...flow.querySelectorAll('[data-src]')], nodes = [...flow.querySelectorAll('[data-node]')];
    let svg = null, links = [], dots = [];
    const T = { start: 300, gap: 1500, travel: 1400, cycle: 8600 };
    const build = () => {
      svg?.remove(); svg = null; links = []; dots = [];
      if (innerWidth <= 1100) return;
      const box = flow.getBoundingClientRect(), r = 10;
      svg = mk('svg', { class: 'am-wires', width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}`, 'aria-hidden': 'true' }, flow);
      const mid = el => { const b = el.getBoundingClientRect(); return { l: b.left - box.left, r: b.right - box.left, y: b.top + b.height / 2 - box.top }; };
      const pairs = [...srcs.map(s => [s, nodes[0], 0]), [nodes[0], nodes[1], 1], [nodes[1], nodes[2], 2], [nodes[2], nodes[3], 3]];
      pairs.forEach(([a, b, stage]) => {
        const A = mid(a), B = mid(b), k = B.y > A.y ? 1 : B.y < A.y ? -1 : 0, xb = A.r + (B.l - A.r) / 2;
        const d = k ? `M${A.r} ${A.y}H${xb - r}Q${xb} ${A.y} ${xb} ${A.y + k * r}V${B.y - k * r}Q${xb} ${B.y} ${xb + r} ${B.y}H${B.l}` : `M${A.r} ${A.y}H${B.l}`;
        const p = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, svg);
        links.push({ p, len: p.getTotalLength(), stage, to: b });
        mk('circle', { cx: A.r, cy: A.y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
        mk('circle', { cx: B.l, cy: B.y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      });
      const g = mk('g', {}, svg);
      dots = links.map(() => Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
    };
    const reset = () => { dots.flat().forEach(d => d.setAttribute('opacity', 0)); nodes.forEach(n => F.glow(n, 0)); };
    const draw = elapsed => {
      const t = elapsed % T.cycle, glow = new Map();
      links.forEach((l, j) => {
        const start = T.start + l.stage * T.gap + (l.stage === 0 ? j * 160 : 0), arrive = start + T.travel;
        glow.set(l.to, Math.max(glow.get(l.to) || 0, F.arrival(t - arrive)));
        dots[j].forEach((d, i) => {
          const local = t - start - i * F.delay;
          if (local < 0 || local > T.travel) { d.setAttribute('opacity', 0); return; }
          const u = local / T.travel, pt = l.p.getPointAtLength(l.len * F.smooth(u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (1 - i * .065));
        });
      });
      nodes.forEach(n => F.glow(n, glow.get(n) || 0));
    };
    build(); new ResizeObserver(() => { build(); reset(); }).observe(flow); document.fonts?.ready.then(build);
    F.run(flow, draw, reset);
  }
})();
