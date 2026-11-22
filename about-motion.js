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
      if (innerWidth < 600 || (innerWidth > 900 && innerWidth <= 1100)) return;  // wires also on the iPad (600-900)
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
    const fills = p => items.forEach((li, i) => { const t = [0, .2, .55, 1]; li.style.setProperty('--f', Math.max(0, Math.min(1, (p - t[i]) / (t[i + 1] - t[i])))); });
    const set = n => { step = n; pin.dataset.step = n; if (!wide.matches) items.forEach((li, i) => li.style.setProperty('--f', i < n - 1 ? 1 : i === n - 1 ? .6 : 0)); };
    const span = () => Math.max(1, section.offsetHeight - innerHeight);
    const fromScroll = () => { if (!wide.matches) return; const p = Math.max(0, Math.min(.999, -section.getBoundingClientRect().top / span())); fills(p); const n = p < .2 ? 1 : p < .55 ? 2 : 3; if (n !== step) set(n); };
    items.forEach((li, i) => {
      const pick = () => { set(i + 1); if (wide.matches) scrollTo({ top: scrollY + section.getBoundingClientRect().top + span() * (i + .5) / items.length, behavior: reduced.matches ? 'auto' : 'smooth' }); };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    addEventListener('scroll', fromScroll, { passive: true }); addEventListener('resize', fromScroll);
    set(1); fromScroll();
  }

  // Mission wiring: the same BridgifyFlow wires as the hero (orthogonal path, contacts, nine-point trail, arrival glow).
  const ms = document.querySelector('.ms');
  if (ms && F) {
    const pinEl = document.querySelector('[data-pin]'), wideQ = matchMedia('(min-width:1101px)');
    const SETS = [
      { q: 'Paris · Art & culture', r: [['assets/v2/02-louvre-1600.jpg', 'Louvre Museum'], ['assets/v2/04-eiffel-night-480.jpg', 'Eiffel Tower by night'], ['assets/v2/07-seine-dinner-480.jpg', 'Seine dinner cruise']] },
      { q: 'Italy · History & food', r: [['assets/v2/08-colosseum-960.jpg', 'Colosseum guided tour'], ['assets/v2/09-florence-960.jpg', 'Florence walking tour'], ['assets/v2/05-paris-food-tour-960.jpg', 'Roman food tour']] },
      { q: 'Alps · Outdoors', r: [['assets/v2/10-alps-960.jpg', 'Alpine hike'], ['assets/v2/11-catamaran-960.jpg', 'Lake sailing day'], ['assets/v2/15-maldives-960.jpg', 'Island escape']] }
    ];
    const sc = { 1: { el: ms.querySelector('.ms-s1') }, 2: { el: ms.querySelector('.ms-s2') }, 3: { el: ms.querySelector('.ms-s3') } };
    const pathD = (sx, sy, tx, ty, r = 10) => { if (Math.abs(tx - sx) < 1) return `M${sx} ${sy}V${ty}`; const my = sy + (ty - sy) / 2, k = tx > sx ? 1 : -1; return `M${sx} ${sy}V${my - r}Q${sx} ${my} ${sx + k * r} ${my}H${tx - k * r}Q${tx} ${my} ${tx} ${my + r}V${ty}`; };
    const conns = n => {
      const e = sc[n].el, q = s => [...e.querySelectorAll(s)];
      if (n === 1) { const pill = e.querySelector('.ms-pill'); return q('.ms-srcs figure').map((f, i) => ({ from: f, to: pill, start: 300 + i * 130, glow: pill })); }
      if (n === 2) { const top = e.querySelector('.ms-top'); return q('.ms-ch').map((c, i) => ({ from: top, to: c.firstElementChild, start: 300 + i * 200, glow: c.firstElementChild })); }
      const all = e.querySelector('.ms-all'), search = e.querySelector('.ms-search');
      return [{ from: all, to: search, start: 300, glow: search }, ...q('.ms-few figure').map((f, i) => ({ from: search, to: f, start: 3100 + i * 140, glow: f }))];
    };
    const build = () => {
      [1, 2, 3].forEach(n => {
        const s = sc[n]; s.svg?.remove(); s.paths = []; s.dots = [];
        const box = s.el.getBoundingClientRect(); if (!box.width) return;
        s.svg = mk('svg', { class: 'ms-wires', width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}`, 'aria-hidden': 'true' }, s.el);
        const cs = conns(n), contacts = new Set();
        cs.forEach(c => {
          const a = c.from.getBoundingClientRect(), b = c.to.getBoundingClientRect(), sx = a.left + a.width / 2 - box.left, sy = a.bottom - box.top, tx = b.left + b.width / 2 - box.left, ty = b.top - box.top;
          const p = mk('path', { d: pathD(sx, sy, tx, ty), fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, s.svg);
          s.paths.push({ p, len: p.getTotalLength(), c });
          [[sx, sy], [tx, ty]].forEach(([x, y]) => { const key = Math.round(x) + ',' + Math.round(y); if (!contacts.has(key)) { contacts.add(key); mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, s.svg); } });
        });
        const g = mk('g', {}, s.svg);
        s.dots = s.paths.map(() => Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
      });
    };
    const Q = ms.querySelector('.ms-q'), PTR = ms.querySelector('.ms-ptr'), GO = ms.querySelector('.ms-go'), FEW = [...ms.querySelectorAll('.ms-few figure')], CHIPS = [...ms.querySelectorAll('.ms-fields span')], OKS = [...ms.querySelectorAll('.ms-ok')];
    let lastSet = -1;
    const fillSet = i => { if (lastSet === i) return; lastSet = i; FEW.forEach((f, k) => { const [src, name] = SETS[i].r[k]; const img = f.querySelector('img'); if (img.getAttribute('src') !== src) img.setAttribute('src', src); img.alt = name; f.querySelector('figcaption').innerHTML = (k === 0 ? '<span>Best match</span>' : '') + name; f.classList.toggle('ms-best', k === 0); }); };
    const showAll = () => { fillSet(0); Q.textContent = SETS[0].q; FEW.forEach(f => f.classList.add('on')); CHIPS.forEach(c => c.classList.add('on')); OKS.forEach(o => o.classList.add('on')); };
    const reset = () => { Object.values(sc).forEach(s => s.dots?.flat().forEach(d => d.setAttribute('opacity', 0))); };
    const CYC = { 1: 7000, 2: 7000, 3: 9600 };
    let prevStep = 0, stepAt = 0;
    const drawScene = (n, t) => {
      const s = sc[n]; if (!s.paths) return;
      const tt = t % CYC[n], gl = new Map();
      s.paths.forEach((pa, j) => {
        const start = pa.c.start, arrive = start + 1500;
        gl.set(pa.c.glow, Math.max(gl.get(pa.c.glow) || 0, F.arrival(tt - arrive)));
        s.dots[j].forEach((d, i) => {
          const local = tt - start - i * F.delay; if (local < 0 || local > 1500) { d.setAttribute('opacity', 0); return; }
          const u = local / 1500, pt = pa.p.getPointAtLength(pa.len * F.smooth(u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (1 - i * .065));
        });
      });
      gl.forEach((v, el) => F.glow(el, v));
      if (n === 1) CHIPS.forEach((c, i) => c.classList.toggle('on', tt > 2000 + i * 140));
      if (n === 2) OKS.forEach((o, i) => o.classList.toggle('on', tt > 2200 + i * 200));
      if (n === 3) {
        const k = Math.floor(t / CYC[3]) % SETS.length; fillSet(k);
        const type = Math.max(0, Math.min(SETS[k].q.length, Math.floor((tt - 1400) / 60)));
        Q.textContent = tt < 1400 ? '' : SETS[k].q.slice(0, type);
        ms.querySelector('.ms-caret').style.opacity = tt < 2900 ? 1 : 0;
        PTR.classList.toggle('show', tt > 2500 && tt < 3300); GO.classList.toggle('pressed', tt > 2900 && tt < 3150);
        FEW.forEach((f, i) => f.classList.toggle('on', tt > 3250 + i * 130 && tt < 9000));
      }
    };
    const draw = elapsed => {
      const step = +(pinEl?.dataset.step || 1), wide = wideQ.matches;
      if (step !== prevStep) { prevStep = step; stepAt = elapsed; reset(); }
      [1, 2, 3].forEach(n => { if (!wide || n === step) drawScene(n, wide ? elapsed - stepAt : elapsed); });
    };
    build(); new ResizeObserver(() => { build(); reset(); }).observe(ms); document.fonts?.ready.then(build);
    if (reduced.matches) showAll();
    F.run(ms, draw, reset);
  }
})();
