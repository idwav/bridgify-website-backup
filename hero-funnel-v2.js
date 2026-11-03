// Hero visual: a tangle of suppliers is pulled into order, passes through Bridgify as one
// integration, then the client's app, site and rewards program light up part by part.
(() => {
  const hero = document.querySelector('.bv2-hero');
  const scene = hero?.querySelector('.bv2-funnel');
  if (!scene) return;
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOut = p => 1 - Math.pow(1 - p, 3);

  const T = { converge: 1100, spread: 55, tile: 2000, cable: 4300, cableDur: 500, branch: 5000, branchDur: 500, lit: [5500, 6400, 7300], litDur: 450, end: 9300 };
  const COLS = [154, 318, 482, 646];
  const ROWS = [52, 100, 148];
  const HUB = { y: 249 };

  const tileEls = [...scene.querySelectorAll('.fn-tile')];
  const parts = [...scene.querySelectorAll('[data-at]')].map(el => ({ el, at: +el.dataset.at })).sort((a, b) => a.at - b.at);
  const feedsG = scene.querySelector('.fn-feeds');
  const decoysG = scene.querySelector('.fn-decoys');
  const dotsG = scene.querySelector('.fn-dots');
  const cableBase = scene.querySelector('.fn-cable-base');
  const cable = scene.querySelector('.fn-cable');
  const branchBases = [...scene.querySelectorAll('.fn-branch-base')];
  const branches = [...scene.querySelectorAll('.fn-branch')];

  // Deterministic scatter, so the chaos looks the same on every visit.
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const slots = [...Array(12).keys()];
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }

  const items = tileEls.map((el, i) => {
    const col = i % 4, row = Math.floor(i / 4), k = slots[i];
    const feed = document.createElementNS(NS, 'path');
    feedsG.append(feed);
    return {
      i, el, feed,
      tx: COLS[col], ty: ROWS[row], slot: col * 3 + row,
      sx: 400 + ((k % 4) - 1.5) * 188 + (rnd() - .5) * 64,
      sy: 46 + Math.floor(k / 4) * 74 + (rnd() - .5) * 30,
      sr: (rnd() - .5) * 30, ph: rnd() * 6.28,
      o1x: (rnd() - .5) * 340, o1y: (rnd() - .5) * 220, o2x: (rnd() - .5) * 340, o2y: (rnd() - .5) * 220,
      x: 0, y: 0, p: 0
    };
  });
  const decoys = Array.from({ length: 14 }, () => {
    let a = Math.floor(rnd() * 12), b = Math.floor(rnd() * 12);
    if (a === b) b = (b + 5) % 12;
    const path = document.createElementNS(NS, 'path');
    decoysG.append(path);
    return { a: items[a], b: items[b], path, c1x: (rnd() - .5) * 220, c1y: (rnd() - .5) * 160, c2x: (rnd() - .5) * 220, c2y: (rnd() - .5) * 160 };
  });

  const flow = [
    ...items.map(it => ({ path: it.feed, dur: 4200, off: it.slot / 12 })),
    { path: cable, dur: 1500, off: 0 },
    ...branches.map((path, i) => ({ path, dur: 2100, off: i * .31 }))
  ].map(f => {
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '3');
    dotsG.append(dot);
    return { ...f, dot, len: 0 };
  });

  const feedD = (it, x, y, c) => {
    const ax = x, ay = y + 14, ex = 400 + (it.slot - 5.5) * 6.4, ey = HUB.y, dy = ey - ay;
    const f = n => n.toFixed(1);
    return `M${f(ax)} ${f(ay)}C${f(ax + c * it.o1x)} ${f(ay + dy * .45 + c * it.o1y)} ${f(ex + c * it.o2x)} ${f(ey - dy * .45 + c * it.o2y)} ${f(ex)} ${ey}`;
  };
  const decoyD = d => {
    const f = n => n.toFixed(1);
    return `M${f(d.a.x)} ${f(d.a.y)}C${f(d.a.x + d.c1x)} ${f(d.a.y + d.c1y)} ${f(d.b.x + d.c2x)} ${f(d.b.y + d.c2y)} ${f(d.b.x)} ${f(d.b.y)}`;
  };
  const draw = (el, p) => { el.style.strokeDashoffset = String(1 - p); el.style.opacity = p > 0 ? '1' : '0'; };

  let t = -600, partIndex = 0, settled = false, flowing = false;
  let visible = false, started = false, frame = 0, previous = 0;
  const paused = () => hero.classList.contains('paused');
  const canRun = () => visible && started && !document.hidden && !reduced.matches && !paused();

  function setFlowing(on) {
    if (flowing === on) return;
    flowing = on;
    scene.classList.toggle('fn-flowing', on);
    if (on) flow.forEach(f => { f.len = f.path.getTotalLength(); });
  }

  function render() {
    const now = Math.max(t, 0);
    if (!settled) {
      let sum = 0;
      items.forEach(it => {
        const p = ease(clamp((now - T.converge - it.i * T.spread) / T.tile));
        const c = 1 - p;
        it.p = p; sum += p;
        it.x = lerp(it.sx, it.tx, p) + Math.sin(now / 900 + it.ph) * 5 * c;
        it.y = lerp(it.sy, it.ty, p) + Math.cos(now / 1100 + it.ph) * 4 * c;
        it.el.style.setProperty('--x', it.x.toFixed(2));
        it.el.style.setProperty('--y', it.y.toFixed(2));
        it.el.style.setProperty('--r', (lerp(it.sr, 0, p) + Math.sin(now / 1300 + it.ph) * 2 * c).toFixed(2));
        it.feed.setAttribute('d', feedD(it, it.x, it.y, c));
      });
      scene.style.setProperty('--o', (sum / items.length).toFixed(3));
      decoys.forEach(d => {
        d.path.setAttribute('d', decoyD(d));
        d.path.style.opacity = String(((1 - d.a.p + 1 - d.b.p) / 2) * .8);
      });
      if (now > T.converge + 11 * T.spread + T.tile + 50) settled = true;
    }
    draw(cableBase, easeOut(clamp((now - T.cable) / T.cableDur)));
    draw(cable, easeOut(clamp((now - T.cable) / T.cableDur)));
    branchBases.forEach(b => draw(b, easeOut(clamp((now - T.branch) / T.branchDur))));
    branches.forEach((b, i) => draw(b, easeOut(clamp((now - T.lit[i]) / T.litDur))));
    while (partIndex < parts.length && parts[partIndex].at <= now) parts[partIndex++].el.classList.add('is-on');
    if (now >= T.end) {
      setFlowing(true);
      const s = now - T.end;
      flow.forEach(({ path, dot, dur, off, len }) => {
        const pt = path.getPointAtLength((((s / dur) + off) % 1) * len);
        dot.setAttribute('cx', pt.x.toFixed(1));
        dot.setAttribute('cy', pt.y.toFixed(1));
      });
    }
  }

  function reset(from = -600) {
    t = from; partIndex = 0; settled = false;
    setFlowing(false);
    parts.forEach(({ el }) => el.classList.remove('is-on'));
    scene.style.setProperty('--o', '0');
  }
  function showFinal() {
    t = T.end + 100;
    settled = false;
    render();
    scene.style.setProperty('--o', '1');
    setFlowing(false);
  }

  function tick(time) {
    frame = 0;
    if (!canRun()) { previous = 0; return; }
    if (previous) t += Math.min(time - previous, 80);
    previous = time;
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (reduced.matches) { if (frame) cancelAnimationFrame(frame); frame = 0; showFinal(); return; }
    if (canRun() && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
    if (!canRun() && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }

  reset();
  render();
  scene.classList.add('fn-live');
  if (reduced.matches) showFinal();

  const wipe = document.querySelector('.page-wipe');
  const lead = wipe && wipe.getBoundingClientRect().top < innerHeight ? 1250 : 600;
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !started) { started = true; t = -lead; }
    sync();
  }, { threshold: .15 }).observe(scene);

  document.getElementById('fn-replay')?.addEventListener('click', () => {
    if (reduced.matches) return;
    reset(-200);
    render();
    started = true;
    sync();
  });
  new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { if (reduced.matches) showFinal(); else { reset(-200); render(); } sync(); });
})();
