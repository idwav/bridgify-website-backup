/* OTAs · Supply (#section-2): wires from the three source types into Bridgify and down to the experiences;
   pins drop across the map one by one and each lights its experience. Loops while on screen; no controls row. */
(() => {
  const sc = document.querySelector('[data-sc]'); if (!sc) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const svg = sc.querySelector('.sc-wires'), hub = sc.querySelector('.sc-hub'), nodes = [...sc.querySelectorAll('.sc-node')], grid = sc.querySelector('.sc-exps');
  const exps = [...sc.querySelectorAll('.sc-exp')], pins = [...sc.querySelectorAll('.sc-pin')], rings = [...sc.querySelectorAll('.sc-ring')];
  let paths = [];
  const layout = () => {
    const r = sc.getBoundingClientRect(); svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`); svg.replaceChildren(); paths = [];
    const box = e => { const b = e.getBoundingClientRect(); return {x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height}; };
    const h = box(hub), hx = h.x + h.w / 2, top = h.y;
    nodes.forEach(n => {
      const b = box(n), x = b.x + b.w / 2, y = b.y + b.h, mid = (y + top) / 2;
      const d = `M${x} ${y}C${x} ${mid} ${hx} ${mid} ${hx} ${top}`;
      const p = mk('path', {d}); svg.append(p, mk('circle', {class: 'end', cx: x, cy: y, r: 3}));
      paths.push(p);
    });
    svg.append(mk('circle', {class: 'end', cx: hx, cy: top, r: 3}));
    const g = box(grid), d2 = `M${hx} ${h.y + h.h}V${g.y}`;
    const p2 = mk('path', {d: d2}); svg.append(p2, mk('circle', {class: 'end', cx: hx, cy: h.y + h.h, r: 3}));
    paths.push(p2);
    paths.forEach(p => { p.dot = mk('circle', {class: 'flow', r: 2.6, opacity: 0}); svg.append(p.dot); });
  };
  /* flow dots */
  let t0 = performance.now(), on = false, raf = 0;
  const frame = now => {
    raf = 0; if (!on) return;
    const t = (now - t0) / 1000;
    paths.forEach((p, i) => {
      const last = i === paths.length - 1, period = 2.2, off = last ? 1.1 : i * .25;
      const u = ((t + period - off) % period) / (last ? .9 : 1.1);
      if (u > 1) { p.dot.setAttribute('opacity', 0); return; }
      const pt = p.getPointAtLength(p.getTotalLength() * (1 - Math.pow(1 - u, 2)));
      p.dot.setAttribute('cx', pt.x); p.dot.setAttribute('cy', pt.y); p.dot.setAttribute('opacity', Math.min(1, u * 8, (1 - u) * 8));
    });
    raf = requestAnimationFrame(frame);
  };
  /* pins and experiences */
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const light = i => { pins[i].classList.add('is-on'); rings[i].classList.remove('is-on'); void rings[i].getBBox(); rings[i].classList.add('is-on'); exps[i].classList.add('is-on'); };
  const reset = () => { sc.classList.remove('is-done'); pins.forEach(p => p.classList.remove('is-on')); rings.forEach(p => p.classList.remove('is-on')); exps.forEach(e => e.classList.remove('is-on')); };
  const cycle = () => {
    reset();
    exps.forEach((_, i) => timers.push(setTimeout(() => light(i), 1400 + i * 750)));
    timers.push(setTimeout(() => sc.classList.add('is-done'), 1400 + exps.length * 750));
    timers.push(setTimeout(() => on && cycle(), 1400 + exps.length * 750 + 4200));
  };
  /* brand-consistency.js adds coral frames to bordered elements; this stage keeps its own quiet chrome */
  const strip = () => sc.querySelectorAll('.brand-coral-frame,.brand-outer-frame').forEach(e => e.classList.remove('brand-coral-frame', 'brand-outer-frame'));
  setTimeout(strip, 0); addEventListener('load', () => setTimeout(strip, 0));
  layout(); new ResizeObserver(layout).observe(sc); document.fonts && document.fonts.ready.then(layout);
  if (reduce) { exps.forEach((_, i) => { pins[i].classList.add('is-on'); exps[i].classList.add('is-on'); }); sc.classList.add('is-done'); return; }
  new IntersectionObserver(([e]) => { on = e.isIntersecting; clear(); if (on) { cycle(); if (!raf) raf = requestAnimationFrame(frame); } }, {threshold: .3}).observe(sc);
})();
