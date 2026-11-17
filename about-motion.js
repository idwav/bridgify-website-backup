// About: hero scene (approved BridgifyFlow wiring), chaos-to-order story, and the pinned mission scroll story.
(() => {
  const F = window.BridgifyFlow, ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };

  // Hero: photos converge into Bridgify, then the result reaches the partner's own app.
  const hs = document.querySelector('[data-hs]');
  if (hs && F) {
    const srcs = [...hs.querySelectorAll('.hs-src img')], core = hs.querySelector('[data-core]'), app = hs.querySelector('[data-app]');
    let svg = null, paths = [], dots = [];
    const T = { cycle: 6800, travel: 1500, gap: 140, second: 2500 };
    const build = () => {
      svg?.remove(); svg = null; paths = []; dots = [];
      const box = hs.getBoundingClientRect(), r = 10, c = core.getBoundingClientRect(), a = app.getBoundingClientRect();
      svg = mk('svg', { class: 'hs-wires', width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}`, 'aria-hidden': 'true' }, hs);
      const tx = c.left + c.width / 2 - box.left, ty = c.top - box.top;
      srcs.forEach(img => {
        const b = img.getBoundingClientRect(), sx = b.left + b.width / 2 - box.left, sy = b.bottom - box.top, my = sy + (ty - sy) / 2, k = tx > sx ? 1 : tx < sx ? -1 : 0;
        const d = k ? `M${sx} ${sy}V${my - r}Q${sx} ${my} ${sx + k * r} ${my}H${tx - k * r}Q${tx} ${my} ${tx} ${my + r}V${ty}` : `M${sx} ${sy}V${ty}`;
        const p = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, svg);
        paths.push({ p, len: p.getTotalLength(), stage: 0 });
        mk('circle', { cx: sx, cy: sy, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      });
      const ax = a.left + a.width / 2 - box.left, p2 = mk('path', { d: `M${tx} ${c.bottom - box.top}V${a.top - box.top}`, fill: 'none', stroke: '#f46649', 'stroke-width': 1, opacity: .55 }, svg);
      paths.push({ p: p2, len: p2.getTotalLength(), stage: 1 });
      [[tx, ty], [tx, c.bottom - box.top], [ax, a.top - box.top]].forEach(([x, y]) => mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg));
      const g = mk('g', {}, svg);
      dots = paths.map(() => Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
    };
    const reset = () => { dots.flat().forEach(d => d.setAttribute('opacity', 0)); F.glow(core, 0); F.glow(app, 0); };
    const draw = elapsed => {
      const t = elapsed % T.cycle; let gc = 0, ga = 0;
      paths.forEach((pa, j) => {
        const start = pa.stage === 0 ? 300 + j * T.gap : T.second, arrive = start + T.travel;
        if (pa.stage === 0) gc = Math.max(gc, F.arrival(t - arrive)); else ga = F.arrival(t - arrive);
        dots[j].forEach((d, i) => {
          const local = t - start - i * F.delay;
          if (local < 0 || local > T.travel) { d.setAttribute('opacity', 0); return; }
          const u = local / T.travel, pt = pa.p.getPointAtLength(pa.len * F.smooth(u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (1 - i * .065));
        });
      });
      F.glow(core, gc); F.glow(app, ga);
    };
    build(); new ResizeObserver(() => { build(); reset(); }).observe(hs); document.fonts?.ready.then(build);
    F.run(hs, draw, reset);
  }

  // Story: suppliers start scattered and settle into one infrastructure.
  const order = document.querySelector('[data-order]');
  if (order) {
    if (reduced.matches) order.classList.remove('chaos');
    else new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => order.classList.remove('chaos'), 600); } }, { threshold: .45 }).observe(order);
  }

  // Mission: the scene stays pinned while the chapter follows the scroll; chapters are also clickable.
  const pin = document.querySelector('[data-pin]');
  if (pin) {
    const section = pin.closest('section'), items = [...pin.querySelectorAll('.ab-chapters li')], wide = matchMedia('(min-width:1101px)');
    let step = 1;
    const set = n => { step = n; pin.dataset.step = n; };
    const span = () => Math.max(1, section.offsetHeight - innerHeight);
    const fromScroll = () => { if (!wide.matches) return; const p = Math.max(0, Math.min(.999, -section.getBoundingClientRect().top / span())); const n = p < .2 ? 1 : p < .55 ? 2 : 3; if (n !== step) set(n); };
    items.forEach((li, i) => {
      const pick = () => { set(i + 1); if (wide.matches) scrollTo({ top: scrollY + section.getBoundingClientRect().top + span() * (i + .5) / items.length, behavior: reduced.matches ? 'auto' : 'smooth' }); };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    addEventListener('scroll', fromScroll, { passive: true }); addEventListener('resize', fromScroll);
    set(1); fromScroll();
  }
})();
