/* Lab only · tablet portrait hero, direction A "vertical story". Companion to hero-portrait.css.
   When the screen is a tablet held upright, the hero diagram is rebuilt on an 800×920 grid from the page's own markup
   (fetched fresh, so the original animation keeps nothing of it) and played with the same timeline as
   hero-funnel-v2.js. Only the geometry differs: 3 × 4 cards across the width, Bridgify and the devices 151 units
   lower. On the live site this becomes a portrait geometry inside hero-funnel-v2.js, not a second script. */
(async () => {
  const MQ = '(min-width: 600px) and (max-width: 1023px), (min-width: 1024px) and (max-width: 1366px) and (orientation: portrait)';
  if (!matchMedia(MQ).matches || window.__bfPortraitHero) return;
  window.__bfPortraitHero = true;
  const hero = document.querySelector('.bv2-hero'), live = hero && hero.querySelector('.bv2-funnel');
  if (!live) return;
  const DY = 151, H = 920;

  // a fresh copy of the scene, straight from the page source
  const src = await fetch(location.pathname, { cache: 'no-store' }).then(r => r.text());
  const doc = new DOMParser().parseFromString(src, 'text/html');
  const scene = doc.querySelector('.bv2-funnel'); if (!scene) return;
  scene.classList.add('fn-portrait');
  const svg = scene.querySelector('.fn-wires'); svg.setAttribute('viewBox', `0 0 800 ${H}`);
  scene.querySelectorAll('.fn-cable-base, .fn-cable').forEach(p => p.setAttribute('d', `M400 ${315 + DY}V${357 + DY}`));
  const B = [`M400 ${357 + DY}C400 ${382 + DY} 99 ${372 + DY} 99 ${402 + DY}`, `M400 ${357 + DY}V${402 + DY}`, `M400 ${357 + DY}C400 ${382 + DY} 701 ${372 + DY} 701 ${402 + DY}`];
  scene.querySelectorAll('.fn-branch-base').forEach((p, i) => p.setAttribute('d', B[i]));
  scene.querySelectorAll('.fn-branch').forEach((p, i) => p.setAttribute('d', B[i]));
  scene.querySelectorAll('.fn-nodes > circle').forEach(c => c.setAttribute('cy', String(+c.getAttribute('cy') + DY)));
  scene.querySelectorAll('.fn-dev').forEach(d => { const y = parseFloat(d.style.getPropertyValue('--dy')); d.style.setProperty('--dy', String(y + DY)); });
  live.replaceWith(document.importNode(scene, true));
  const el = hero.querySelector('.bv2-funnel');

  // ---- the hero-funnel-v2.js timeline, on the portrait geometry ----
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const T = { converge: 1100, spread: 55, tile: 2000, cable: 4300, cableDur: 500, branch: 5000, branchDur: 500, lit: [5500, 6400, 7300], litDur: 450, end: 9300 };
  const START = 600;
  const COLS = [118, 400, 682];            // 3 columns across the full width
  const ROWS = [44, 126, 208, 290];        // 4 rows, 82 units apart (cards are 62 tall)
  const HUB = { y: 249 + DY };
  const HALF = 31;                         // half a card's height: where its feed leaves

  const tileEls = [...el.querySelectorAll('.fn-tile')];
  const parts = [...el.querySelectorAll('[data-at]')].map(e => ({ el: e, at: +e.dataset.at })).sort((a, b) => a.at - b.at);
  const feedsG = el.querySelector('.fn-feeds'), decoysG = el.querySelector('.fn-decoys'), dotsG = el.querySelector('.fn-dots');
  const cableBase = el.querySelector('.fn-cable-base'), cable = el.querySelector('.fn-cable');
  const branchBases = [...el.querySelectorAll('.fn-branch-base')], branches = [...el.querySelectorAll('.fn-branch')];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const slots = [...Array(12).keys()];
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const items = tileEls.map((t, i) => {
    const col = i % 3, row = Math.floor(i / 3), k = slots[i];
    const feed = document.createElementNS(NS, 'path'); feedsG.append(feed);
    return { i, el: t, feed, tx: COLS[col], ty: ROWS[row], slot: col * 4 + row,
      sx: 400 + ((k % 3) - 1) * 262 + (rnd() - .5) * 64, sy: 44 + Math.floor(k / 3) * 82 + (rnd() - .5) * 30,
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
  window.BridgifyPortraitHero = { showFinal };
})();
