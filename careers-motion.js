// Careers: hero release story (approved BridgifyFlow wiring), Why-now scroll spine, stat count-up.
(() => {
  const F = window.BridgifyFlow, ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };

  // ---- Hero: Monday release -> bank / airline / super app, then Tuesday bookings.
  const cv = document.querySelector('[data-cv]');
  if (cv && F) {
    const release = cv.querySelector('.cv-release'), steps = [...cv.querySelectorAll('.cv-steps li')], surfaces = [...cv.querySelectorAll('.cv-surface')];
    let svg = null, paths = [], dots = [];
    const T = { step: 600, stepGap: 520, wire: 2300, stagger: 160, travel: 1600, cycle: 8200 };
    function build() {
      svg?.remove(); svg = null; paths = []; dots = [];
      const box = cv.getBoundingClientRect(), r = release.getBoundingClientRect();
      const sx = r.left + r.width / 2 - box.left, sy = r.bottom - box.top;
      svg = mk('svg', { class: 'cv-wires', width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}`, 'aria-hidden': 'true' }, cv);
      const rad = 10;
      surfaces.forEach(s => {
        const b = s.getBoundingClientRect(), tx = b.left + b.width / 2 - box.left, ty = b.top - box.top, my = sy + (ty - sy) / 2, d = tx > sx ? 1 : tx < sx ? -1 : 0;
        const dd = d ? `M${sx} ${sy}V${my - rad}Q${sx} ${my} ${sx + d * rad} ${my}H${tx - d * rad}Q${tx} ${my} ${tx} ${my + rad}V${ty}` : `M${sx} ${sy}V${ty}`;
        const p = mk('path', { d: dd, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, svg);
        paths.push({ p, len: p.getTotalLength() });
      });
      const g = mk('g', {}, svg);
      dots = paths.map(() => Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
      // fixed contact points at both ends of every connection
      mk('circle', { cx: sx, cy: sy, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      surfaces.forEach(s => { const b = s.getBoundingClientRect(); mk('circle', { cx: b.left + b.width / 2 - box.left, cy: b.top - box.top, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg); });
    }
    function state(done) {
      steps.forEach(li => li.classList.toggle('on', done));
      surfaces.forEach(s => { s.classList.toggle('arrived', done); F.glow(s, 0); s.style.stroke = ''; });
      F.glow(release, 0);
      dots.flat().forEach(d => d.setAttribute('opacity', 0));
    }
    function reset() { state(reduced.matches); }
    function draw(elapsed) {
      const t = elapsed % T.cycle;
      steps.forEach((li, i) => li.classList.toggle('on', t >= T.step + i * T.stepGap));
      const last = T.step + 2 * T.stepGap;
      F.glow(release, F.arrival(t - last));
      surfaces.forEach((s, j) => {
        const start = T.wire + j * T.stagger, arrive = start + T.travel;
        s.classList.toggle('arrived', t >= arrive);
        F.glow(s, F.arrival(t - arrive));
        dots[j]?.forEach((d, i) => {
          const local = t - start - i * F.delay;
          if (local < 0 || local > T.travel) { d.setAttribute('opacity', 0); return; }
          const u = local / T.travel, pt = paths[j].p.getPointAtLength(paths[j].len * F.smooth(u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y);
          d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (1 - i * .065));
        });
      });
    }
    build(); reset();
    new ResizeObserver(() => { build(); reset(); }).observe(cv);
    document.fonts?.ready.then(() => { build(); reset(); });
    F.run(cv, draw, reset);
  }

  // ---- Why now: the coral spine fills and each shift lights as it reaches the reading line.
  const spine = document.querySelector('[data-spine]');
  if (spine) {
    const shifts = [...spine.querySelectorAll('[data-shift]')], fill = spine.querySelector('.cw-rail');
    let ticking = false;
    function update() {
      ticking = false;
      if (reduced.matches) { shifts.forEach(s => s.classList.add('on')); fill.style.setProperty('--p', '100%'); return; }
      const line = innerHeight * .62, top = spine.getBoundingClientRect().top;
      shifts.forEach(s => s.classList.toggle('on', s.getBoundingClientRect().top + 28 < line));
      const first = shifts[0].getBoundingClientRect().top + 28, last = shifts[shifts.length - 1].getBoundingClientRect().top + 28;
      fill.style.setProperty('--p', Math.max(0, Math.min(100, (line - first) / (last - first) * 100)) + '%');
    }
    // The rail stops 12px before each numbered circle and starts again 12px after it (mask built from the real circle positions).
    function cut() {
      const rail = spine.querySelector('.cw-rail'), r = rail.getBoundingClientRect(), gap = 12, stops = [];
      shifts.forEach(s => { const n = s.querySelector('.cw-node i').getBoundingClientRect(); stops.push([n.top - r.top - gap, n.bottom - r.top + gap]); });
      const parts = ['#000 0']; stops.forEach(([a, b]) => parts.push(`#000 ${Math.max(0, a)}px`, `transparent ${Math.max(0, a)}px`, `transparent ${b}px`, `#000 ${b}px`));
      const last = stops[stops.length - 1]; parts.push(`#000 ${last[1]}px`);
      const m = `linear-gradient(to bottom,${parts.join(',')})`;
      // after the last circle there is nothing to connect to
      const g = `${m}`; rail.style.webkitMaskImage = g; rail.style.maskImage = g;
      rail.style.setProperty('--end', (last[0]) + 'px');
    }
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', () => { cut(); req(); }); reduced.addEventListener('change', update);
    cut(); addEventListener('load', cut); document.fonts && document.fonts.ready.then(cut);
    update();
  }

  // ---- Culture: on desktop the stage is sticky and scrolling changes the statement; elsewhere it auto-advances or follows taps.
  document.querySelectorAll('[data-cm]').forEach(root => {
    const items = [...root.querySelectorAll('.cm-list li')], section = root.closest('section');
    const wide = matchMedia('(min-width:1101px)');
    let step = 1, timer = 0, visible = false, manual = false;
    const set = n => { step = n; root.dataset.step = n; };
    const span = () => Math.max(1, section.offsetHeight - innerHeight);
    const fromScroll = () => { if (!wide.matches) return; const p = Math.max(0, Math.min(.999, -section.getBoundingClientRect().top / span())); const n = p < .2 ? 1 : p < .55 ? 2 : 3; if (n !== step) set(n); };
    const schedule = () => { clearTimeout(timer); if (wide.matches || manual || reduced.matches || !visible || document.hidden) return; timer = setTimeout(() => { set(step % items.length + 1); schedule(); }, 5200); };
    items.forEach((li, i) => {
      const pick = () => {
        manual = true; clearTimeout(timer); set(i + 1);
        if (wide.matches) scrollTo({ top: scrollY + section.getBoundingClientRect().top + span() * (i + .5) / items.length, behavior: reduced.matches ? 'auto' : 'smooth' });
      };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    addEventListener('scroll', fromScroll, { passive: true }); addEventListener('resize', () => { fromScroll(); schedule(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, { threshold: .35 }).observe(root);
    document.addEventListener('visibilitychange', schedule); reduced.addEventListener('change', schedule);
    set(1); fromScroll();
  });

  // ---- Culture stage wiring: the same wires as the rest of the site (ring contacts, pulses, light on arrival).
  document.querySelectorAll('[data-cm]').forEach(root => {
    if (!F) return;
    const NS = 'http://www.w3.org/2000/svg', mk = (tag, a, parent) => { const e = document.createElementNS(NS, tag); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); (parent || null)?.append(e); return e; };
    const net = root.querySelector('.cm-net'), pipe = root.querySelector('.cm-pipe');
    if (!net || !pipe) return;
    const sets = [];
    const prep = (host, name) => { const o = { host, svg: null, segs: [], glows: [], name }; sets.push(o); return o; };
    const A = prep(pipe, 2), B = prep(net, 3);
    const ring = (svg, x, y) => mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
    const seg = (o, d, start, duration, target) => {
      const path = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, o.svg);
      const dots = Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, o.svg));
      o.segs.push({ path, dots, len: path.getTotalLength(), start, duration, target });
    };
    const build = () => {
      sets.forEach(o => { o.svg?.remove(); o.svg = null; o.segs = []; });
      // Ownership: Idea -> Build -> Ship -> Measure
      { const o = A, h = o.host.getBoundingClientRect(), nodes = [...o.host.querySelectorAll('.cm-stg i')]; if (h.width && nodes.length) {
        o.svg = mk('svg', { class: 'cm-wires', width: h.width, height: h.height, viewBox: `0 0 ${h.width} ${h.height}`, 'aria-hidden': 'true' }, o.host);
        const c = nodes.map(n => { const b = n.getBoundingClientRect(); return { x: b.left + b.width / 2 - h.left, y: b.top + b.height / 2 - h.top }; });
        const ow = root.querySelector('.cm-owner span'); let lead = 0;
        if (ow) { const b = ow.getBoundingClientRect(), x0 = b.left + b.width / 2 - h.left, y0 = b.bottom - h.top, rr = 10; if (c[0].x - x0 > rr + 2) { seg(o, `M${x0} ${y0}V${c[0].y - rr}Q${x0} ${c[0].y} ${x0 + rr} ${c[0].y}H${c[0].x}`, 200, 900, nodes[0]); lead = 800; ring(o.svg, x0, y0); } }
        for (let i = 0; i < c.length - 1; i++) seg(o, `M${c[i].x} ${c[i].y}H${c[i + 1].x}`, 300 + lead + i * 800, 750, nodes[i + 1]);
        o.glows = nodes; } }
      // Operators: your team -> OTAs, banks, airlines, super apps
      { const o = B, h = o.host.getBoundingClientRect(), core = o.host.querySelector('.cm-core'), ps = [...o.host.querySelectorAll('.cm-p')]; if (h.width && core) {
        o.svg = mk('svg', { class: 'cm-wires', width: h.width, height: h.height, viewBox: `0 0 ${h.width} ${h.height}`, 'aria-hidden': 'true' }, o.host);
        const box = e => { const b = e.getBoundingClientRect(); return { l: b.left - h.left, r: b.right - h.left, t: b.top - h.top, b: b.bottom - h.top, cx: b.left + b.width / 2 - h.left, cy: b.top + b.height / 2 - h.top }; };
        const k = box(core), rr = 10;
        ps.forEach((p, i) => { const q = box(p), left = q.cx < k.cx, up = q.cy < k.cy, x0 = left ? k.l : k.r, y0 = k.cy, k2 = left ? -1 : 1, v = up ? -1 : 1, yEnd = up ? q.b : q.t;
          const d = `M${x0} ${y0}H${q.cx - k2 * rr}Q${q.cx} ${y0} ${q.cx} ${y0 + v * rr}V${yEnd}`;
          seg(o, d, 300 + (i % 2) * 150, 1500, p); ring(o.svg, q.cx, yEnd); });
        ring(o.svg, k.l, k.cy); ring(o.svg, k.r, k.cy); o.glows = ps; } }
    };
    const stage = root.querySelector('.cm-stage');
    let stepAt = 0, prev = 0, built = false;
    const draw = elapsed => {
      const step = +root.dataset.step;
      if (step !== prev) { prev = step; stepAt = elapsed; }
      const t = elapsed - stepAt;
      sets.forEach(o => { if (!o.svg) return; const on = o.name === step, tt = t % 5300;
        o.segs.forEach(a => { a.dots.forEach((d, i) => { const u = on ? (tt - a.start - i * F.delay) / a.duration : -1; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = a.path.getPointAtLength(a.len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); });
          F.glow(a.target, on ? F.arrival(tt - a.start - a.duration + 150) : 0); a.target.style.borderColor = ''; if (!(a.target instanceof SVGElement) && on && F.arrival(tt - a.start - a.duration + 150) > 0) a.target.style.borderColor = '#f46649'; }); });
    };
    const reset = () => { sets.forEach(o => o.segs.forEach(a => { a.dots.forEach(d => d.setAttribute('opacity', 0)); F.glow(a.target, 0); })); };
    new ResizeObserver(() => { build(); }).observe(root); document.fonts?.ready.then(build); build();
    F.run(stage || root, draw, reset);
  });

  // ---- Convergence wiring (approved motion): problems -> platform, departments -> the door.
  function converge(root, sources, target, dir, cycle) {
    if (!F) return;
    let svg = null, paths = [], dots = [];
    const build = () => {
      svg?.remove(); svg = null; paths = []; dots = [];
      if (innerWidth <= 1100) return;
      const box = root.getBoundingClientRect(), t = target.getBoundingClientRect();
      svg = mk('svg', { class: 'cx-wires', width: box.width, height: box.height, viewBox: `0 0 ${box.width} ${box.height}`, 'aria-hidden': 'true' }, root);
      const r = 10;
      sources.forEach(el => {
        const b = el.getBoundingClientRect(); let d, sx, sy, tx, ty;
        if (dir === 'x') { sx = b.right - box.left; sy = b.top + b.height / 2 - box.top; tx = t.left - box.left; ty = t.top + t.height / 2 - box.top; const xb = sx + (tx - sx) / 2, k = ty > sy ? 1 : ty < sy ? -1 : 0;
          d = k ? `M${sx} ${sy}H${xb - r}Q${xb} ${sy} ${xb} ${sy + k * r}V${ty - k * r}Q${xb} ${ty} ${xb + r} ${ty}H${tx}` : `M${sx} ${sy}H${tx}`; }
        else { sx = b.left + b.width / 2 - box.left; sy = b.bottom - box.top; tx = t.left + t.width / 2 - box.left; ty = t.top - box.top; const yb = sy + (ty - sy) / 2, k = tx > sx ? 1 : tx < sx ? -1 : 0;
          d = k ? `M${sx} ${sy}V${yb - r}Q${sx} ${yb} ${sx + k * r} ${yb}H${tx - k * r}Q${tx} ${yb} ${tx} ${yb + r}V${ty}` : `M${sx} ${sy}V${ty}`; }
        const p = mk('path', { d, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .55 }, svg);
        paths.push({ p, len: p.getTotalLength() });
        mk('circle', { cx: sx, cy: sy, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      });
      mk('circle', { cx: dir === 'x' ? t.left - box.left : t.left + t.width / 2 - box.left, cy: dir === 'x' ? t.top + t.height / 2 - box.top : t.top - box.top, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg);
      const g = mk('g', {}, svg);
      dots = paths.map(() => Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, g)));
    };
    const reset = () => { dots.flat().forEach(d => d.setAttribute('opacity', 0)); F.glow(target, 0); sources.forEach(s => { F.glow(s, 0); }); };
    const travel = 1500, gap = 420;
    const draw = elapsed => {
      const t = elapsed % cycle; let arrival = 0;
      paths.forEach((pa, j) => {
        const start = 300 + j * gap, arrive = start + travel; arrival = Math.max(arrival, F.arrival(t - arrive));
        F.glow(sources[j], F.arrival(t - start) * .5);
        dots[j].forEach((d, i) => {
          const local = t - start - i * F.delay;
          if (local < 0 || local > travel) { d.setAttribute('opacity', 0); return; }
          const u = local / travel, pt = pa.p.getPointAtLength(pa.len * F.smooth(u));
          d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y); d.setAttribute('opacity', Math.min(1, u * 10) * Math.min(1, (1 - u) * 8) * (1 - i * .065));
        });
      });
      F.glow(target, arrival);
    };
    build(); new ResizeObserver(() => { build(); reset(); }).observe(root); document.fonts?.ready.then(build);
    F.run(root, draw, reset);
  }
  const cpp = document.querySelector('[data-cpp]');
  if (cpp) converge(cpp, [...cpp.querySelectorAll('[data-row]')], cpp.querySelector('[data-target]'), 'x', 6400);
  const jb = document.querySelector('[data-jb]');
  if (jb) {
    converge(jb, [jb.querySelector('[data-source]')], jb.querySelector('[data-target]'), 'x', 5200);
    const tabs = [...jb.querySelectorAll('.jb-tabs button')], rows = [...jb.querySelectorAll('.jb-row')], count = jb.querySelector('.jb-count');
    const openCount = () => rows.filter(r => r.classList.contains('jb-role') && !r.hidden).length;
    const show = team => { tabs.forEach(t => { const on = t.dataset.team === team; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); }); rows.forEach(r => { r.hidden = team !== 'all' && r.dataset.team !== team; }); const n = openCount(); count.lastChild.textContent = `${n} open role${n === 1 ? '' : 's'}`; };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.team)));
  }

  // ---- Stats count up once when they enter.
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '', final = el.textContent;
    if (reduced.matches) return;
    let done = false;
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting || done) return; done = true; io.disconnect();
      const t0 = performance.now();
      (function step(now) { const p = Math.min(1, (now - t0) / 1400), v = target * (1 - Math.pow(1 - p, 3)); el.textContent = (target === 1 ? v.toFixed(p < 1 ? 1 : 0) : Math.round(v)) + suffix; if (p < 1) requestAnimationFrame(step); else el.textContent = final; })(t0);
    }, { threshold: .6 }).observe(el);
  });
})();
