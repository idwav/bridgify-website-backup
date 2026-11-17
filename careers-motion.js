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
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); reduced.addEventListener('change', update);
    update();
  }

  // ---- Culture: on desktop the stage is sticky and scrolling changes the statement; elsewhere it auto-advances or follows taps.
  document.querySelectorAll('[data-cm]').forEach(root => {
    const items = [...root.querySelectorAll('.cm-list li')], section = root.closest('section');
    const wide = matchMedia('(min-width:1101px)');
    let step = 1, timer = 0, visible = false, manual = false;
    const set = n => { step = n; root.dataset.step = n; };
    const span = () => Math.max(1, section.offsetHeight - innerHeight);
    const fromScroll = () => { if (!wide.matches) return; const p = Math.max(0, Math.min(.999, -section.getBoundingClientRect().top / span())); const n = Math.floor(p * items.length) + 1; if (n !== step) set(n); };
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
