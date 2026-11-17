// About: hero scene (approved BridgifyFlow wiring), chaos-to-order story, and the pinned mission scroll story.
(() => {
  const F = window.BridgifyFlow, ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };

  // Hero: experiences from around the world flow into Bridgify, then out to the brands people use (approved BridgifyFlow wiring).
  const wm = document.querySelector('[data-wm]');
  if (wm && F) {
    const pins = [...wm.querySelectorAll('.wm-pin')], hub = wm.querySelector('[data-hub]'), brands = [...wm.querySelectorAll('[data-brand]')];
    let svg = null, paths = [], dots = [];
    const T = { cycle: 8200, travel: 1500, gap: 130, second: 2600, gap2: 260 };
    const build = () => {
      svg?.remove(); svg = null; paths = []; dots = [];
      if (innerWidth <= 1100) return;
      const box = wm.getBoundingClientRect(), r = 10, h = hub.getBoundingClientRect();
      svg = mk('svg', { class: 'wm-wires', width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}`, 'aria-hidden': 'true' }, svg ? null : wm);
      const hx = h.left + h.width / 2 - box.left, ht = h.top - box.top, hb = h.bottom - box.top;
      pins.forEach(pin => {
        const b = pin.getBoundingClientRect(), sx = b.left + b.width / 2 - box.left, sy = b.top + b.height / 2 - box.top;
        const d = `M${sx} ${sy}C${sx} ${sy + (ht - sy) * .55},${hx} ${ht - (ht - sy) * .45},${hx} ${ht}`;
        const p = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .5 }, svg);
        paths.push({ p, len: p.getTotalLength(), stage: 0 });
      });
      brands.forEach(card => {
        const b = card.getBoundingClientRect(), tx = b.left + b.width / 2 - box.left, ty = b.top - box.top, my = hb + (ty - hb) / 2, k = tx > hx + 1 ? 1 : tx < hx - 1 ? -1 : 0;
        const d = k ? `M${hx} ${hb}V${my - r}Q${hx} ${my} ${hx + k * r} ${my}H${tx - k * r}Q${tx} ${my} ${tx} ${my + r}V${ty}` : `M${hx} ${hb}V${ty}`;
        const p = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, svg);
        paths.push({ p, len: p.getTotalLength(), stage: 1 });
        mk('circle', { cx: tx, cy: ty, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      });
      mk('circle', { cx: hx, cy: ht, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      mk('circle', { cx: hx, cy: hb, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      const g = mk('g', {}, svg);
      dots = paths.map(() => Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
    };
    const reset = () => { dots.flat().forEach(d => d.setAttribute('opacity', 0)); F.glow(hub, 0); brands.forEach(b => F.glow(b, 0)); };
    const draw = elapsed => {
      const t = elapsed % T.cycle; let gh = 0; const gb = brands.map(() => 0);
      paths.forEach((pa, j) => {
        const bi = j - pins.length, start = pa.stage === 0 ? 300 + j * T.gap : T.second + bi * T.gap2, arrive = start + T.travel;
        if (pa.stage === 0) gh = Math.max(gh, F.arrival(t - arrive)); else gb[bi] = F.arrival(t - arrive);
        dots[j].forEach((d, i) => {
          const local = t - start - i * F.delay;
          if (local < 0 || local > T.travel) { d.setAttribute('opacity', 0); return; }
          const u = local / T.travel, pt = pa.p.getPointAtLength(pa.len * F.smooth(u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (1 - i * .065));
        });
      });
      F.glow(hub, gh); brands.forEach((b, i) => F.glow(b, gb[i]));
    };
    build(); new ResizeObserver(() => { build(); reset(); }).observe(wm); document.fonts?.ready.then(build);
    F.run(wm, draw, reset);
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
