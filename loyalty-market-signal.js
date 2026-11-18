(() => {
  const grid = document.querySelector('.lm2-grid'), F = window.BridgifyFlow;
  if (!grid) return;
  const items = [...grid.querySelectorAll('.lm2-list li')], stage = grid.querySelector('.lm2-stage'), hub = grid.querySelector('.lm2-hub');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), NS = 'http://www.w3.org/2000/svg';
  let step = 1, timer = 0, visible = false, manual = false, stepAt = 0, svg = null, path = null, dots = [], rings = [];
  const mk = (tag, a, parent) => { const e = document.createElementNS(NS, tag); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); parent.append(e); return e; };
  const tileOf = () => grid.querySelector('.lm2-view.v' + step + ' .lm2-tile');
  function build() {
    svg?.remove(); svg = null; dots = []; path = null;
    const r = stage.getBoundingClientRect(), t = tileOf(); if (!r.width || !t) return;
    const a = t.getBoundingClientRect(), h = hub.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - r.left, y0 = a.bottom - r.top, x1 = h.left + h.width / 2 - r.left, y1 = h.top - r.top;
    svg = mk('svg', { class: 'lm2-wire', viewBox: `0 0 ${r.width} ${r.height}`, 'aria-hidden': 'true' }, stage);
    path = mk('path', { d: `M${x0} ${y0}V${y1}`, fill: 'none', stroke: '#f46649', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .6 }, svg);
    [[x0, y0], [x1, y1]].forEach(([x, y]) => mk('circle', { cx: x, cy: y, r: 3.5, fill: '#eee9de', stroke: '#f46649', 'stroke-width': 1.2 }, svg));
    dots = F ? Array.from({ length: 9 }, (_, i) => mk('circle', { r: F.radius(i), fill: '#fff8f1', stroke: '#f46649', 'stroke-width': .7, opacity: 0 }, svg)) : [];
  }
  const pin = grid.closest('.lm2-pin'), sticky = grid.closest('.lm2-sticky');
  const fit = () => { const h = sticky.offsetHeight; sticky.style.top = Math.max(0, Math.min(88, innerHeight - h - 12)) + 'px'; return h > innerHeight - 8; };
  const flat = () => fit();
  function set(n) {
    if (n === step && grid.classList.contains('is-live')) return;
    step = n; grid.dataset.step = n; stepAt = -1; grid.classList.add('is-live');
    items.forEach((li, i) => li.setAttribute('aria-pressed', String(i === n - 1)));
    requestAnimationFrame(build);
  }
  function fromScroll() {
    if (flat()) { pin.classList.add('is-flat'); return; } pin.classList.remove('is-flat');
    const r = pin.getBoundingClientRect(), span = Math.max(1, pin.offsetHeight - sticky.offsetHeight - parseFloat(getComputedStyle(sticky).top));
    const p = Math.max(0, Math.min(.999, -(r.top - parseFloat(getComputedStyle(sticky).top)) / span)), n = Math.min(items.length, Math.floor(p * items.length) + 1);
    items.forEach((li, i) => li.style.setProperty('--p', i + 1 < n ? 1 : i + 1 === n ? (p * items.length - i) : 0));
    set(n);
  }
  items.forEach((li, i) => { const pick = () => { if (flat()) { set(i + 1); return; } const r = pin.getBoundingClientRect(), span = pin.offsetHeight - sticky.offsetHeight - parseFloat(getComputedStyle(sticky).top); scrollTo({ top: scrollY + r.top - parseFloat(getComputedStyle(sticky).top) + span * (i + .5) / items.length, behavior: 'smooth' }); }; li.addEventListener('click', pick); li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }); });
  addEventListener('scroll', fromScroll, { passive: true }); addEventListener('resize', fromScroll); reduced.addEventListener('change', fromScroll);
  new ResizeObserver(build).observe(stage); document.fonts?.ready.then(build);
  set(1); fromScroll();
  if (F) F.run(stage, elapsed => {
    if (stepAt < 0) stepAt = elapsed; const t = (elapsed - stepAt) % 4200, tile = tileOf();
    if (path) { const len = path.getTotalLength(); dots.forEach((d, i) => { const u = (t - 700 - i * F.delay) / 1400; if (u < 0 || u > 1) { d.setAttribute('opacity', 0); return; } const q = path.getPointAtLength(len * F.smooth(u)); d.setAttribute('cx', q.x); d.setAttribute('cy', q.y); d.setAttribute('opacity', Math.max(0, Math.min(1, u * 10, (1 - u) * 18)) * (1 - i * .065)); }); }
    if (tile) { const g = F.arrival(t - 400); tile.style.boxShadow = `0 0 ${g * 20}px rgba(244,102,73,${g * .6})`; tile.style.borderColor = g > .02 ? '#f46649' : ''; }
    const ga = F.arrival(t - 700 - 1400 - 8 * F.delay + 200); hub.style.setProperty('--arrival', ga); hub.style.borderColor = ga > .02 ? '#ffb594' : '';
  }, () => { dots.forEach(d => d.setAttribute('opacity', 0)); });
})();
