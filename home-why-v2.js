/* V2 homepage · Why Bridgify (#why-bridgify). Ported from output/element-lab (approved 14 Nov 2026).
   Self-contained copy of the lab timeline engine, cables and the four stage builders; step 5 has no stage yet. */
(() => {
  if (!document.getElementById('why-bridgify')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ?solo=<id>: the gap audit embeds one element at a time; the Why story then renders its steps statically. */
  const SOLO = null;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
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
        const pid = `wyw${id}-${i}`;
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

  /* Layout-only centre of an element relative to the stage (ignores transforms). */
  const centre = (el, stage) => {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
    while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return {x, y};
  };
  const aim = (stage, items, target, px = '--dx', py = '--dy') => {
    const t = centre(target, stage);
    items.forEach(i => { const c = centre(i, stage); i.style.setProperty(px, `${t.x - c.x}px`); i.style.setProperty(py, `${t.y - c.y}px`); });
  };
  const narrow = w => w < 620;

  /* ---------- 4.1 Aggregate ---------- */
  function aggregate(stage) {
    const srcs = $$('.ag-src', stage), bodies = $$('.ag-src-body', stage), funnel = $('.ag-funnel', stage);
    const engine = $('.ag-engine', stage), out = $('.ag-out', stage), count = $('.ag-count', stage);
    let d;
    wires(stage, w => narrow(w)
      ? [...srcs.map((s, i) => ({from: {el: s, side: 'b'}, to: {el: funnel, side: 't', match: 'x', contact: false}, at: .8 + i * .1, dots: 1, dur: 2})),
         {from: {el: funnel, side: 'b', contact: false}, to: {el: engine, side: 't'}, at: 1.6, main: true, dots: 2, dur: 1.4},
         {from: {el: engine, side: 'b'}, to: {el: out, side: 't'}, at: 3.4, main: true, dots: 2, dur: 1.4}]
      : [...srcs.map((s, i) => ({from: {el: s, side: 'r'}, to: {el: funnel, side: 'l', match: 'y', contact: false}, at: .8 + i * .1, dots: 1, dur: 2})),
         {from: {el: funnel, side: 'r', contact: false}, to: {el: engine, side: 'l'}, at: 1.6, main: true, dots: 2, dur: 1.4},
         {from: {el: engine, side: 'r'}, to: {el: out, side: 'l', fy: .3}, at: 3.4, main: true, dots: 2, dur: 1.4}],
      () => { aim(stage, bodies, engine); d && d.refresh(); });
    const fmt = n => n.toLocaleString('en-US');
    d = demo(stage, {dur: 10, loop: true,
      phases: [[.2, 'in'], [1.5, 'funnel'], [3.6, 'out']],
      tick: t => {
        const k = clamp((t - 3.8) / 1.6, 0, 1), e = 1 - Math.pow(1 - k, 3);
        count.textContent = k >= 1 ? '1M+' : fmt(Math.round(e * 1000000));
      }});
    return d;
  }

  /* ---------- 4.2 Normalize ---------- */
  function normalize(stage) {
    const cards = $$('.nm-card', stage), fin = $('.nm-final', stage);
    const place = () => aim(stage, cards, fin, '--mx', '--my');
    new ResizeObserver(place).observe(stage); place();
    return demo(stage, {dur: 10, loop: true, phases: [[.2, 'in'], [1.3, 'flag'], [2.8, 'merge'], [3.5, 'lock'], [4.1, 'done']]});
  }

  /* ---------- 4.3 Distribute ---------- */
  function distribute(stage) {
    const engine = $('.ds-engine', stage), split = $('.ds-split', stage);
    const web = $('.ds-web', stage), phone = $('.ds-phone', stage), kiosk = $('.ds-kiosk', stage);
    let d;
    wires(stage, w => narrow(w)
      ? [{from: {el: engine, side: 'b'}, to: {el: split, side: 't', contact: false}, at: .5, main: true, dots: 2, dur: 1.2},
         {from: {el: split, side: 'l', contact: false}, to: {el: phone, side: 't'}, at: 1.5, dots: 2, dur: 1.6},
         {from: {el: split, side: 'r', contact: false}, to: {el: kiosk, side: 't'}, at: 1.8, dots: 2, dur: 1.6},
         {from: {el: split, side: 'b', contact: false}, to: {el: web, side: 't'}, at: 2.1, dots: 2, dur: 1.8, k: .2}]
      : [{from: {el: engine, side: 'r'}, to: {el: split, side: 'l', contact: false}, at: .5, main: true, dots: 2, dur: 1.2},
         {from: {el: split, side: 'r', contact: false}, to: {el: web, side: 'l'}, at: 1.5, dots: 2, dur: 1.6},
         {from: {el: split, side: 'r', contact: false}, to: {el: phone, side: 'l', fy: .4}, at: 1.8, dots: 2, dur: 1.6},
         {from: {el: split, side: 'r', contact: false}, to: {el: kiosk, side: 't', fx: .3}, at: 2.1, dots: 2, dur: 1.8, k: .03}],
      () => d && d.refresh());
    d = demo(stage, {dur: 4.6});
    return d;
  }

  /* ---------- 4.4 Personalize ---------- */
  function personalize(stage) {
    const grid = $('.ps-grid', stage), cards = $$('.ps-card', stage), profs = $$('.ps-prof', stage), cap = $('.ps-caption', stage);
    const ORDER = {
      all: ['sd', 'ft', 'wp', 'ah', 'ss', 'km'],
      family: ['wp', 'km', 'ft', 'ss', 'ah', 'sd'],
      couple: ['sd', 'ss', 'ft', 'ah', 'wp', 'km'],
      solo: ['ah', 'ft', 'ss', 'sd', 'km', 'wp']
    };
    const MATCH = {
      family: {wp: 'Kids welcome · all day', km: 'Hands-on · ages 4+', ft: 'Easy pace · tastings'},
      couple: {sd: 'Evening · for two', ss: 'Sunset · romantic', ft: 'Small group · wine'},
      solo: {ah: 'Active · join a group', ft: 'Meet travelers', ss: 'Shared sail'}
    };
    const CAP = {
      all: 'Catalog order, before personalization',
      family: '<b>Family</b> · two kids, ages 6 and 9 · top picks move up',
      couple: '<b>Couple</b> · anniversary trip · top picks move up',
      solo: '<b>Solo</b> · active traveler · top picks move up'
    };
    let cur = null, manual = false;
    const set = name => {
      if (name === cur) return;
      const first = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
      cur = name;
      cards.forEach(c => {
        const idx = ORDER[name].indexOf(c.dataset.id);
        c.style.order = idx;
        c.classList.toggle('is-top', name !== 'all' && idx < 3);
        $('.ps-rank', c).textContent = '#' + (idx + 1);
        $('.ps-match', c).textContent = (MATCH[name] || {})[c.dataset.id] || '';
      });
      grid.classList.toggle('is-ranked', name !== 'all');
      profs.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.profile === name)));
      cap.innerHTML = CAP[name];
      if (reduce) return;
      cards.forEach(c => {
        const a = first.get(c), b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) c.animate([{transform: `translate(${dx}px,${dy}px)`}, {transform: 'none'}], {duration: 900, easing: 'cubic-bezier(.16,1,.3,1)'});
      });
    };
    const d = demo(stage, {dur: 14, loop: true,
      tick: t => { if (!manual) set(t < 1.4 ? 'all' : t < 5.6 ? 'family' : t < 9.8 ? 'couple' : 'solo'); },
      reset: () => { manual = false; }});
    if (reduce) set('family');
    profs.forEach(p => p.addEventListener('click', () => { manual = true; d.pause(); set(p.dataset.profile); }));
    const replay = d.replay;
    d.replay = () => { manual = false; replay(); };
    return d;
  }

  /* ---------- 4 · Why Bridgify sticky story ---------- */
  (() => {
    const why = $('[data-why]'); if (!why) return;
    const track = $('.wy-track', why), tabs = $$('.wy-tab', why), steps = $$('.wy-step', why);
    const builders = [aggregate, normalize, distribute, personalize];
    const IDLE = {setEnabled() {}, replay() {}, onPlay() {}, pause() {}, toggle() {}};
    const demos = steps.map((s, i) => { const stage = $('.hm-stage', s), d = builders[i] ? builders[i](stage) : IDLE; controls($('.hm-controls', s), d); return d; });
    const mq = SOLO ? {matches: true, addEventListener() {}} : matchMedia('(max-width: 900px)');
    let active = -1;
    const setActive = (i, restart = true) => {
      if (i === active) return;
      active = i;
      steps.forEach((s, j) => {
        s.classList.toggle('is-active', j === i);
        tabs[j].setAttribute('aria-selected', String(j === i));
        tabs[j].tabIndex = j === i ? 0 : -1;
        if (!mq.matches) { demos[j].setEnabled(j === i); if (j === i && restart) demos[j].replay(); }
      });
    };
    const topBar = $('.lab-top');
    const measureTop = () => {
      labTop = topBar && getComputedStyle(topBar).position === 'sticky' ? topBar.offsetHeight : 0;
      document.documentElement.style.setProperty('--lab-top', labTop + 'px');
    };
    let labTop = 0;
    const span = () => Math.max(1, track.offsetHeight - (innerHeight - labTop));
    const onScroll = () => {
      if (mq.matches) return;
      const q = clamp((labTop - track.getBoundingClientRect().top) / span(), 0, .9999);
      tabs.forEach((tb, j) => tb.style.setProperty('--f', clamp(q * steps.length - j, 0, 1).toFixed(3)));
      setActive(Math.floor(q * steps.length));
    };
    tabs.forEach((tb, i) => {
      tb.addEventListener('click', () => {
        const top = track.getBoundingClientRect().top + scrollY - labTop;
        scrollTo({top: top + span() * (i + .5) / steps.length, behavior: reduce ? 'auto' : 'smooth'});
      });
      tb.addEventListener('keydown', e => {
        const dir = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}[e.key];
        if (!dir) return;
        e.preventDefault();
        const n = (i + dir + tabs.length) % tabs.length;
        tabs[n].focus(); tabs[n].click();
      });
    });
    const mode = () => {
      measureTop();
      if (mq.matches) { active = -1; steps.forEach(s => s.classList.add('is-active')); demos.forEach(d => d.setEnabled(true)); }
      else { steps.forEach(s => s.classList.remove('is-active')); active = -1; onScroll(); }
    };
    mq.addEventListener('change', mode);
    addEventListener('resize', measureTop);
    addEventListener('scroll', onScroll, {passive: true});
    mode();
  })();

})();

/* brand-consistency.js frames bordered elements and adds contact dots to SVG paths; this section keeps its own chrome */
(() => {
  const scope = document.getElementById('why-bridgify'); if (!scope) return;
  const CLS = ['brand-coral-frame', 'brand-action', 'brand-action-primary', 'brand-outer-frame'];
  const clean = () => {
    [scope, ...scope.querySelectorAll('*')].forEach(el => el.classList && el.classList.remove(...CLS));
    scope.querySelectorAll('.brand-wire-contact,[data-brand-contact]').forEach(n => n.remove());
  };
  const later = () => setTimeout(clean, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
  addEventListener('load', later);
})();
