/* V2 homepage · Products (#products). Ported from output/element-lab (approved 14 Nov 2026). */
(() => {
  if (!document.getElementById('products')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
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

  /* ---------- 6 · Products ---------- */
  (() => {
    const grid = $('[data-demo="products"]'); if (!grid) return;
    const store = $('.pr-store', grid), sw = $$('.pr-swatches i', grid), pills = $$('.pr-ai-field span', grid);
    const BRANDS = ['#F46649', '#2F6B4F', '#7A3E62'];
    let bi = -1;
    const d = demo(grid, {dur: 7.8, loop: true, tick: t => {
      const i = Math.floor(t / 2.6) % 3;
      if (i === bi) return; bi = i;
      store.style.setProperty('--brand', BRANDS[i]);
      sw.forEach((s, j) => s.classList.toggle('is-on', j === i));
      pills.forEach((p, j) => p.classList.toggle('is-on', j === i));
    }});
  })();

  /* brand-consistency.js frames bordered elements; the cards keep their own chrome */
  const scope = document.getElementById('products');
  const CLS = ['brand-coral-frame', 'brand-action', 'brand-action-primary', 'brand-outer-frame'];
  const clean = () => [scope, ...scope.querySelectorAll('*')].forEach(el => el.classList && el.classList.remove(...CLS));
  const later = () => setTimeout(clean, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
  addEventListener('load', later);
})();
