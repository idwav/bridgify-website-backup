/* Lab only · tablet portrait hero. Companion to hero-portrait.css.
   When a tablet is held upright, the hero diagram is rebuilt from the page's own markup (fetched fresh, so the
   original animation keeps nothing of it) on a portrait geometry, and played with the timeline of hero-funnel-v2.js.
   Variations (window.__bfHeroVariant, set by live.html):
   - "a" vertical story: 800×920 grid, 3×4 cards 1.55× larger, Bridgify and devices below. Too tall for one screen.
   - "b" wide band (default, 17 Nov 2026): 800×540 grid. The 12 cards sit in one band on top (6×2), the feeds pour down
     into Bridgify, and the cable spreads out at the bottom to the app, the site and the rewards program (devices at
     0.75×). The visual is then sized so the whole hero fits one screen: its width is the content width or the
     height left under the copy × 800/540, whichever is smaller.
   On the live site this becomes a portrait geometry inside hero-funnel-v2.js, not a second script. */
(async () => {
  const MQ = '(min-width: 600px) and (max-width: 1023px), (min-width: 1024px) and (max-width: 1366px) and (orientation: portrait)';
  if (!matchMedia(MQ).matches || window.__bfPortraitHero) return;
  window.__bfPortraitHero = true;
  const hero = document.querySelector('.bv2-hero'), live = hero && hero.querySelector('.bv2-funnel');
  if (!live) return;
  const V = (window.__bfHeroVariant || 'b').toLowerCase();

  // ---- geometries (units of the 800-wide grid) ----
  const GEO = {
    a: { H: 920, cls: 'fn-portrait', cols: [118, 400, 682], rows: [44, 126, 208, 290], ncol: 3, half: 31, hub: 400,
         scatter: (k, r) => [400 + ((k % 3) - 1) * 262 + (r() - .5) * 64, 44 + Math.floor(k / 3) * 82 + (r() - .5) * 30],
         cable: [466, 508], dev: { scale: 1, top: 553, cx: [99, 400, 701] } },
    b: { H: 540, cls: 'fn-band', cols: [70, 202, 334, 466, 598, 730], rows: [28, 76], ncol: 6, half: 18.5, hub: 158,
         scatter: (k, r) => [400 + ((k % 6) - 2.5) * 118 + (r() - .5) * 50, 30 + Math.floor(k / 6) * 50 + (r() - .5) * 24],
         cable: [224, 254], dev: { scale: .75, top: 290, cx: [131, 400, 669] } }
  };
  const g = GEO[V] || GEO.b;

  // a fresh copy of the scene, straight from the page source
  const src = await fetch(location.pathname, { cache: 'no-store' }).then(r => r.text());
  const doc = new DOMParser().parseFromString(src, 'text/html');
  const scene = doc.querySelector('.bv2-funnel'); if (!scene) return;
  scene.classList.add(g.cls);
  scene.querySelector('.fn-wires').setAttribute('viewBox', `0 0 800 ${g.H}`);
  const [c0, c1] = g.cable, top = g.dev.top, [xl, xm, xr] = g.dev.cx, mid = (c1 + top) / 2;
  scene.querySelectorAll('.fn-cable-base, .fn-cable').forEach(p => p.setAttribute('d', `M400 ${c0}V${c1}`));
  const B = [`M400 ${c1}C400 ${mid + 6} ${xl} ${mid - 4} ${xl} ${top}`, `M400 ${c1}V${top}`, `M400 ${c1}C400 ${mid + 6} ${xr} ${mid - 4} ${xr} ${top}`];
  scene.querySelectorAll('.fn-branch-base').forEach((p, i) => p.setAttribute('d', B[i]));
  scene.querySelectorAll('.fn-branch').forEach((p, i) => p.setAttribute('d', B[i]));
  // nodes: hub bottom, the split, and the three device tops
  const N = [[400, c0], [400, c1], [xl, top], [xm, top], [xr, top]];
  scene.querySelectorAll('.fn-nodes > circle').forEach((c, i) => { if (!N[i]) return; c.setAttribute('cx', String(N[i][0])); c.setAttribute('cy', String(N[i][1])); });
  // devices: centred on their branch, scaled by a local unit (positions are written in that unit)
  const s = g.dev.scale;
  scene.querySelectorAll('.fn-dev').forEach((d, i) => {
    const w = parseFloat(d.style.getPropertyValue('--dw')), cx = g.dev.cx[i];
    const dy = d.classList.contains('fn-tablet') ? top + 8 * s : top;
    d.style.setProperty('--u', `calc(.125cqw * ${s})`);
    d.style.setProperty('--dx', String((cx - w * s / 2) / s)); d.style.setProperty('--dy', String(dy / s));
  });
  scene.querySelectorAll('.fn-cap, .fn-feat').forEach((c, i) => c.style.setProperty('--cx', String(g.dev.cx[Math.floor(i / 2)])));
  live.replaceWith(document.importNode(scene, true));
  const el = hero.querySelector('.bv2-funnel');

  // ---- fit: the whole hero on one screen (variation b) ----
  const vis = el.closest('.bv2-hero-visual');
  const fit = () => {
    if (V !== 'b' || !vis) return;
    vis.style.removeProperty('width');
    const cw = vis.getBoundingClientRect().width;
    const free = innerHeight - (vis.getBoundingClientRect().top + scrollY) - 24;   // to the bottom of the first screen
    // fit when that keeps the diagram readable (≥ 75% of the content width); on a small iPad, where the copy alone
    // fills half the screen, the diagram keeps the full width and its lower part needs a short scroll
    let w = Math.min(cw, free * 800 / g.H); if (w < cw * .75) w = cw;
    vis.style.setProperty('width', w + 'px', 'important'); vis.style.setProperty('margin-inline', 'auto', 'important');
  };
  fit(); addEventListener('resize', fit); if (document.fonts) document.fonts.ready.then(fit);

  // ---- the hero-funnel-v2.js timeline, on the portrait geometry ----
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const T = { converge: 1100, spread: 55, tile: 2000, cable: 4300, cableDur: 500, branch: 5000, branchDur: 500, lit: [5500, 6400, 7300], litDur: 450, end: 9300 };
  const START = 600;
  const COLS = g.cols, ROWS = g.rows, HUB = { y: g.hub }, HALF = g.half;

  const tileEls = [...el.querySelectorAll('.fn-tile')];
  const parts = [...el.querySelectorAll('[data-at]')].map(e => ({ el: e, at: +e.dataset.at })).sort((a, b) => a.at - b.at);
  const feedsG = el.querySelector('.fn-feeds'), decoysG = el.querySelector('.fn-decoys'), dotsG = el.querySelector('.fn-dots');
  const cableBase = el.querySelector('.fn-cable-base'), cable = el.querySelector('.fn-cable');
  const branchBases = [...el.querySelectorAll('.fn-branch-base')], branches = [...el.querySelectorAll('.fn-branch')];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const slots = [...Array(12).keys()];
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const items = tileEls.map((t, i) => {
    const col = i % g.ncol, row = Math.floor(i / g.ncol), k = slots[i];
    const feed = document.createElementNS(NS, 'path'); feedsG.append(feed);
    const [sx, sy] = g.scatter(k, rnd);
    return { i, el: t, feed, tx: COLS[col], ty: ROWS[row], slot: col * ROWS.length + row, sx, sy,
      sr: (rnd() - .5) * 30, ph: rnd() * 6.28,
      o1x: (rnd() - .5) * 340, o1y: (rnd() - .5) * 220, o2x: (rnd() - .5) * 340, o2y: (rnd() - .5) * 220, x: 0, y: 0, p: 0 };
  });
  const decoys = Array.from({ length: 14 }, () => { let a = Math.floor(rnd() * 12), b = Math.floor(rnd() * 12); if (a === b) b = (b + 5) % 12;
    const path = document.createElementNS(NS, 'path'); decoysG.append(path);
    return { a: items[a], b: items[b], path, c1x: (rnd() - .5) * 220, c1y: (rnd() - .5) * 160, c2x: (rnd() - .5) * 220, c2y: (rnd() - .5) * 160 }; });
  const portsG = el.querySelector('.fn-ports');
  items.forEach(it => { const port = document.createElementNS(NS, 'circle'); port.setAttribute('cx', (400 + (it.slot - 5.5) * 6.4).toFixed(1)); port.setAttribute('cy', String(HUB.y)); port.setAttribute('r', '2.2'); portsG && portsG.append(port); });
  const flow = [...items.map(it => ({ path: it.feed, dur: 4200, off: it.slot / 12 })), { path: cable, dur: 1500, off: 0 }, ...branches.map((path, i) => ({ path, dur: 2100, off: i * .31 }))]
    .map((f, i) => { const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', '3'); dot.style.animationDelay = `${-((i * .37) % 1.8).toFixed(2)}s`; dotsG.append(dot); return { ...f, dot, len: 0 }; });
  const feedD = (it, x, y, c) => { const ax = x, ay = y + HALF, ex = 400 + (it.slot - 5.5) * 6.4, ey = HUB.y, dy = ey - ay, f = n => n.toFixed(1);
    return `M${f(ax)} ${f(ay)}C${f(ax + c * it.o1x)} ${f(ay + dy * .45 + c * it.o1y)} ${f(ex + c * it.o2x)} ${f(ey - dy * .45 + c * it.o2y)} ${f(ex)} ${ey}`; };
  const decoyD = d => { const f = n => n.toFixed(1); return `M${f(d.a.x)} ${f(d.a.y)}C${f(d.a.x + d.c1x)} ${f(d.a.y + d.c1y)} ${f(d.b.x + d.c2x)} ${f(d.b.y + d.c2y)} ${f(d.b.x)} ${f(d.b.y)}`; };
  const draw = (e, p) => { e.style.strokeDashoffset = String(1 - p); e.style.opacity = p > 0 ? '1' : '0'; };
  let t = START, partIndex = 0, settled = false, flowing = false, visible = false, started = false, frame = 0, previous = 0;
  const canRun = () => visible && started && !document.hidden && !reduced.matches && !hero.classList.contains('paused');
  const setFlowing = on => { if (flowing === on) return; flowing = on; el.classList.toggle('fn-flowing', on); if (on) flow.forEach(f => { f.len = f.path.getTotalLength(); }); };
  function render() {
    const now = Math.max(t, 0);
    if (!settled) {
      let sum = 0;
      items.forEach(it => { const p = ease(clamp((now - T.converge - it.i * T.spread) / T.tile)), c = 1 - p; it.p = p; sum += p;
        it.x = lerp(it.sx, it.tx, p) + Math.sin(now / 900 + it.ph) * 5 * c; it.y = lerp(it.sy, it.ty, p) + Math.cos(now / 1100 + it.ph) * 4 * c;
        it.el.style.setProperty('--x', it.x.toFixed(2)); it.el.style.setProperty('--y', it.y.toFixed(2));
        it.el.style.setProperty('--r', (lerp(it.sr, 0, p) + Math.sin(now / 1300 + it.ph) * 2 * c).toFixed(2));
        it.feed.setAttribute('d', feedD(it, it.x, it.y, c)); });
      el.style.setProperty('--o', (sum / items.length).toFixed(3));
      decoys.forEach(d => { d.path.setAttribute('d', decoyD(d)); d.path.style.opacity = String(((1 - d.a.p + 1 - d.b.p) / 2) * .8); });
      if (now > T.converge + 11 * T.spread + T.tile + 50) settled = true;
    }
    draw(cableBase, easeOut(clamp((now - T.cable) / T.cableDur))); draw(cable, easeOut(clamp((now - T.cable) / T.cableDur)));
    branchBases.forEach(b => draw(b, easeOut(clamp((now - T.branch) / T.branchDur))));
    branches.forEach((b, i) => draw(b, easeOut(clamp((now - T.lit[i]) / T.litDur))));
    while (partIndex < parts.length && parts[partIndex].at <= now) parts[partIndex++].el.classList.add('is-on');
    if (now >= T.end) { setFlowing(true); const s = now - T.end;
      flow.forEach(({ path, dot, dur, off, len }) => { const pt = path.getPointAtLength((((s / dur) + off) % 1) * len); dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1)); }); }
  }
  function showFinal() { t = T.end + 100; settled = false; render(); el.style.setProperty('--o', '1'); setFlowing(false); }
  function tick(time) { frame = 0; if (!canRun()) { previous = 0; return; } if (previous) t += Math.min(time - previous, 80); previous = time; render(); frame = requestAnimationFrame(tick); }
  function sync() { if (reduced.matches) { if (frame) cancelAnimationFrame(frame); frame = 0; showFinal(); return; }
    if (canRun() && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
    if (!canRun() && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; } }
  render(); el.classList.add('fn-live');
  if (reduced.matches) showFinal();
  const box = el.getBoundingClientRect(); if (box.bottom > 0 && box.top < innerHeight) { visible = true; started = true; sync(); }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !started) started = true; sync(); }, { threshold: .15 }).observe(el);
  new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  window.BridgifyPortraitHero = { showFinal, fit, variant: V };
})();
