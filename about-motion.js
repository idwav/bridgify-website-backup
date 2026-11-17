// About: hero scene (approved BridgifyFlow wiring), chaos-to-order story, and the pinned mission scroll story.
(() => {
  const F = window.BridgifyFlow, ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };

  // Story: two panels. "One by one": every supplier format wires to the partner separately. "As one": they converge through one infrastructure.
  document.querySelectorAll('[data-as]').forEach(panel => {
    if (!F) return;
    const stage = panel.querySelector('.as-stage'), W = 600, H = 360, one = panel.dataset.as === 'one';
    const svg = mk('svg', { class: 'as-wires', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' }, stage);
    const cx = [85, 221, 357, 493], top = 68, bottom = 292, hubTop = 142, hubBottom = 198, hx = 300;
    const defs = one
      ? cx.map(x => `M${x} ${top}C${x} ${top + 50},${hx} ${hubTop - 50},${hx} ${hubTop}`).concat([`M${hx} ${hubBottom}V${bottom}`])
      : [[3, 0], [0, 1], [2, 2], [1, 3]].map(([port, i]) => { const px = 120 + port * 120; return `M${cx[i]} ${top}C${cx[i]} ${top + 130},${px} ${bottom - 150},${px} ${bottom}`; });
    const paths = defs.map(d => { const p = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: one ? .6 : .4, 'vector-effect': 'non-scaling-stroke' }, svg); return { p, len: p.getTotalLength() }; });
    const g = mk('g', {}, svg);
    const dots = paths.map(() => Array.from({ length: one ? 9 : 5 }, (_, i) => mk('circle', { r: one ? F.radius(i) : 2.2, fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
    const target = one ? stage.querySelector('[data-hub]') : null, box = stage.querySelector('.as-box');
    const cycle = one ? 6400 : 7600;
    const reset = () => { dots.flat().forEach(d => d.setAttribute('opacity', 0)); if (target) F.glow(target, 0); F.glow(box, 0); };
    if (reduced.matches) { paths.forEach(pa => pa.p.setAttribute('opacity', one ? .8 : .5)); return; }
    const draw = elapsed => {
      const t = elapsed % cycle; let gh = 0, gb = 0;
      paths.forEach((pa, j) => {
        const merge = one && j === paths.length - 1;
        const start = one ? (merge ? 2300 : 200 + j * 120) : 200 + j * 650, dur = one ? 1500 : 2600 + j * 300, arrive = start + dur;
        if (one) { if (merge) gb = F.arrival(t - arrive); else gh = Math.max(gh, F.arrival(t - arrive)); } else gb = Math.max(gb, F.arrival(t - arrive) * .5);
        dots[j].forEach((d, i) => {
          const local = t - start - i * (one ? F.delay : 520);
          if (local < 0 || local > dur) { d.setAttribute('opacity', 0); return; }
          const u = local / dur, pt = pa.p.getPointAtLength(pa.len * (one ? F.smooth(u) : u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (one ? 1 - i * .065 : .85));
        });
      });
      if (target) F.glow(target, gh); F.glow(box, gb);
    };
    F.run(panel, draw, reset);
  });

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
