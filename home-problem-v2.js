/* V2 homepage · Problem (#opportunity-study). Ported from output/element-lab (approved 14 Nov 2026).
   Self-contained copy of the lab timeline engine and cable drawing; runs only while the section is visible. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const scope = document.getElementById('opportunity-study'); if (!scope) return;
  const $ = (s, r = scope) => r.querySelector(s);
  const $$ = (s, r = scope) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const svgEl = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };
  let uid = 0;
  /* ---------- Timeline engine ---------- */
  function demo(root, {dur, loop = false, phases = [], tick, reset}) {
    let t = 0, raf = 0, last = 0, playing = !reduce, visible = false, enabled = true;
    const listeners = [];
    const apply = () => {
      $$('[data-at]', root).forEach(p => p.classList.toggle('is-on', t >= +p.dataset.at && !(p.dataset.off && t >= +p.dataset.off)));
      phases.forEach(([at, name]) => root.classList.toggle('p-' + name, t >= at));
      tick && tick(t);
    };
    const live = () => playing && visible && enabled && !reduce;
    const snap = () => {
      root.classList.add('is-snap'); apply(); void root.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-snap')));
    };
    const frame = now => {
      raf = 0; if (!live()) return;
      t += Math.min((now - last) / 1000, .1); last = now;
      if (t >= dur) { if (loop) { t = 0; reset && reset(); snap(); } else { t = dur; apply(); return; } }
      apply(); raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const on = live();
      root.classList.toggle('is-paused', !(playing && visible && enabled) && !reduce);
      $$('svg', root).forEach(s => { try { on ? s.unpauseAnimations() : s.pauseAnimations(); } catch (e) {} });
      if (on && !raf && (loop || t < dur)) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, {threshold: .2}).observe(root);
    const api = {
      root,
      get t() { return t; },
      refresh: apply,
      replay() { t = 0; reset && reset(); if (reduce) t = dur; snap(); sync(); },
      toggle() { playing = !playing; sync(); listeners.forEach(f => f(playing)); return playing; },
      pause() { if (playing) api.toggle(); },
      setEnabled(v) { enabled = v; sync(); },
      onPlay(f) { listeners.push(f); f(playing); }
    };
    if (reduce) t = dur;
    apply();
    return api;
  }

  /* Pause / Replay buttons that sit next to a stage */
  function controls(box, d) {
    if (!box) return;
    $$('[data-replay]', box).forEach(b => b.addEventListener('click', () => d.replay()));
    $$('[data-pause]', box).forEach(b => {
      if (reduce) { b.hidden = true; return; }
      d.onPlay(p => { b.textContent = p ? 'Pause Ⅱ' : 'Play ▶'; b.setAttribute('aria-pressed', String(!p)); });
      b.addEventListener('click', () => d.toggle());
    });
  }

  /* Coral cables between DOM elements, redrawn on resize. Specs come from a function so they can depend on layout. */
  const NORMAL = {l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1]};
  function wires(stage, specs, after) {
    const id = ++uid;
    const svg = svgEl('svg', {class: 'hm-wires', 'aria-hidden': 'true', 'data-wire-contacts': 'off'}, stage);
    const anchor = (box, a, other) => {
      const q = a.el.getBoundingClientRect();
      const x0 = q.left - box.left, y0 = q.top - box.top;
      let x = x0 + q.width * (a.fx ?? {l: 0, r: 1}[a.side] ?? .5);
      let y = y0 + q.height * (a.fy ?? {t: 0, b: 1}[a.side] ?? .5);
      if (a.match === 'y' && other) y = clamp(other.y, y0 + q.height * .1, y0 + q.height * .9);
      if (a.match === 'x' && other) x = clamp(other.x, x0 + q.width * .1, x0 + q.width * .9);
      return {x, y, side: a.side};
    };
    const draw = () => {
      const box = stage.getBoundingClientRect();
      if (!box.width) return;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      svg.innerHTML = '';
      specs(box.width).forEach((s, i) => {
        const p1 = anchor(box, s.from), p2 = anchor(box, s.to, p1);
        const k = s.k != null ? s.k * box.width : Math.max(24, Math.hypot(p2.x - p1.x, p2.y - p1.y) * .42);
        const [ax, ay] = NORMAL[p1.side], [bx, by] = NORMAL[p2.side];
        const d = `M${p1.x} ${p1.y}C${p1.x + ax * k} ${p1.y + ay * k} ${p2.x + bx * k} ${p2.y + by * k} ${p2.x} ${p2.y}`;
        const g = svgEl('g', {class: 'hm-wg', 'data-at': s.at ?? 0}, svg);
        const pid = `hmw${id}-${i}`;
        svgEl('path', {d, id: pid, class: 'hm-wire' + (s.main ? ' is-main' : ''), pathLength: 1}, g);
        if (s.from.contact !== false) svgEl('circle', {cx: p1.x, cy: p1.y, r: 3, class: 'hm-contact'}, g);
        if (s.to.contact !== false) svgEl('circle', {cx: p2.x, cy: p2.y, r: 3, class: 'hm-contact'}, g);
        if (!reduce) {
          const n = s.dots ?? 2, dur = s.dur ?? 2.4;
          for (let j = 0; j < n; j++) {
            const c = svgEl('circle', {r: s.main ? 3 : 2.6, class: 'hm-pulse'}, g);
            const m = svgEl('animateMotion', {dur: dur + 's', repeatCount: 'indefinite', begin: `${-(j * dur / n).toFixed(2)}s`}, c);
            svgEl('mpath', {href: '#' + pid}, m);
          }
        }
      });
      after && after();
    };
    new ResizeObserver(draw).observe(stage);
    draw();
    return {draw, svg};
  }

  /* ---------- 3 · Problem: chaos vs order ---------- */
  (() => {
    const root = $('[data-demo="problem"]'); if (!root) return;
    const [chaos, order] = $$('.pb-stage', root);
    const cs = $$('.pb-sup', chaos), capp = $('.pb-app', chaos);
    const os = $$('.pb-sup', order), node = $('.pb-node', order), oapp = $('.pb-app', order);
    const PERM = [3, 0, 4, 1, 2];
    let d;
    const after = () => d && d.refresh();
    wires(chaos, () => [
      ...cs.map((s, i) => ({from: {el: s, side: 'b'}, to: {el: capp, side: 't', fx: .1 + .2 * i}, at: 1 + i * .12, dots: 1, dur: 2.8})),
      ...cs.map((s, i) => ({from: {el: s, side: 'b', fx: .7}, to: {el: capp, side: 't', fx: .14 + .18 * PERM[i]}, at: 1.4 + i * .12, dots: 0}))
    ], after);
    wires(order, () => [
      ...os.map((s, i) => ({from: {el: s, side: 'b'}, to: {el: node, side: 't', fx: .18 + .16 * i}, at: 1 + i * .08, dots: 1, dur: 2})),
      {from: {el: node, side: 'b'}, to: {el: oapp, side: 't'}, at: 2.4, main: true, dots: 2, dur: 1.4}
    ], after);
    d = demo(root, {dur: 9, loop: true, phases: [[3.7, 'flag']],
      tick: t => root.classList.toggle('p-err', t >= 4.4 && t < 6.4)});
    controls(root.parentElement.querySelector('.hm-controls'), d);
  })();


  /* Keep one intro paragraph visible, the second on demand */
  $$('.pb-toggle').forEach(b => {
    const more = document.getElementById(b.getAttribute('aria-controls')); if (!more) return;
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open)); more.hidden = !open;
      b.firstChild.textContent = open ? 'Read less ' : 'Read more ';
    });
  });
  /* brand-consistency.js frames every bordered element on DOMContentLoaded and load; this section keeps its own chrome */
  const CLS = ['brand-coral-frame', 'brand-action', 'brand-action-primary', 'brand-outer-frame'];
  const clean = () => [scope, ...scope.querySelectorAll('*')].forEach(el => el.classList && el.classList.remove(...CLS));
  const later = () => setTimeout(clean, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
  addEventListener('load', later);
})();
