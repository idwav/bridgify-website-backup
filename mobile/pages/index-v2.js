/* Homepage V2 · adaptive behaviour (mobile ≤599, tablet 600–1023). Labels come from the page's own headings. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 3 · The problem: "Building it yourself:" and "With Bridgify:" become a two-way switch on mobile.
     Tablet keeps both panels side by side (CSS), so the switch is mobile-only. */
  const pb = $('#opportunity-study');
  if (pb) {
    const panels = $$('.pb-panel', pb);
    A.tabs(pb, panels, {when: A.MQ.mobile, before: $('.pb-panels', pb), label: 'Compare', start: 0});
  }

  /* 4 · Why Bridgify: the four steps already have tabs (hidden on small screens). Reuse them, one step at a time.
     Runs up to 900px, where home-why-v2.js stops its desktop scroll story. */
  const wy = $('#why-bridgify');
  if (wy) {
    const steps = $$('.wy-step', wy), tabs = $$('.wy-tab', wy);
    A.tabs(wy, steps, {existing: tabs, when: matchMedia('(max-width:900px)')});
    /* Phones: the step boxes sit in one sideways row; keep the active one centred. */
    const row = $('.wy-tabs', wy);
    if (row) new MutationObserver(() => {
      const c = tabs.find(t => t.getAttribute('aria-selected') === 'true');
      if (c && row.scrollWidth > row.clientWidth) row.scrollTo({left: c.offsetLeft - row.offsetLeft - (row.clientWidth - c.offsetWidth) / 2, behavior: 'smooth'});
    }).observe(row, {subtree: true, attributes: true, attributeFilter: ['aria-selected']});

    /* Phones: scroll-driven (owner decisions 21 and 22 Nov 2026, design system pattern.pinned-steps; replaces the
       automatic 2s steps of PR #107). The step row and the active step hold on screen and the page's scroll moves
       through the four steps; after the last the page goes on. A tap on a step scrolls to it. */
    const body = $('.wy-body', wy);
    if (body && row && A.MQ.mobile.matches) {
      /* One stage height for all four steps (the screen under the header), so nothing jumps between steps. One frame for
         all four diagrams (owner, 22 Nov 2026): the frame starts and ends on the same lines in every step, edge to edge;
         it is drawn on the diagram's holder (.wy-visual) in the diagram's own frame style, and only the diagram inside
         is scaled, when it would not fit. */
      const head = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ad-header-h')) || 64;
      /* The stage height comes from the small viewport (100svh): on an iPhone the visible height changes whenever
         Safari's toolbar shrinks or grows during the scroll, and a stage sized from innerHeight changed size between
         steps (owner, 22 Nov 2026). */
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
      document.body.append(probe);
      const H = () => (probe.offsetHeight || innerHeight) - head() - 24;
      const FRAME = ['border', 'border-radius', 'background-image', 'background-color', 'box-shadow'];
      const visuals = steps.map(s => $('.wy-visual', s)), stages = visuals.map(v => v && $('.hm-stage', v));
      const copies = steps.map(s => $('.wy-copy', s));
      let line = 0, measured = false;
      const unframe = () => visuals.forEach((v, i) => {
        if (!v) return; const st = stages[i];
        FRAME.concat(['height', 'display', 'align-items', 'justify-content']).forEach(k => v.style.removeProperty(k));
        if (copies[i]) copies[i].style.removeProperty('padding-bottom');
        if (st) {
          st.classList.remove('ad-wy-bare'); ['scale', 'translate', 'flex'].forEach(k => st.style.removeProperty(k));
          if ('adMt' in st.dataset) { st.style.removeProperty('margin-top'); if (st.dataset.adMt) st.style.setProperty('margin-top', st.dataset.adMt, 'important'); delete st.dataset.adMt; }
        }
        delete v.dataset.adFramed;
      });
      /* Same top line: every frame starts 24px under the longest step text (Aggregate, with its link), measured from
         the top of the stage. */
      const GAP = 24, PAD = 8;
      /* layout positions (offsetTop chain), not getBoundingClientRect: the step's fade-in moves it with a transform
         while it is being measured */
      const Y = el => { let t = 0; for (let e = el; e; e = e.offsetParent) t += e.offsetTop; return t; };
      /* 24px between the step row and every step's text (owner, 22 Nov 2026); the spacing script writes the first
         step's gap on the element itself, so it is set here too */
      const textGap = () => copies.forEach(c => { const t = c && c.querySelector(':scope > p'); if (t) t.style.setProperty('margin-top', '24px', 'important'); });
      const measure = () => {
        unframe(); textGap(); const off = [];
        /* each step in turn, in its real place (synchronous, so nothing is painted in between) */
        steps.forEach((s, i) => {
          steps.forEach((t, j) => t.style.setProperty('display', j === i ? 'block' : 'none', 'important'));
          const kids = copies[i] ? [...copies[i].children].filter(e => e.offsetHeight) : [];
          if (kids.length) off.push(Math.max(...kids.map(e => Y(e) + e.offsetHeight)) - Y(body));
        });
        steps.forEach(t => t.style.removeProperty('display'));
        line = Math.max(...off) + GAP; measured = true;
      };
      const fitStep = () => {
        const on = p && p.wrap.classList.contains('is-on');
        if (!on) { if (measured) { unframe(); measured = false; } return; }
        if (!measured) measure();
        soften();
        visuals.forEach((v, i) => {
          const st = stages[i]; if (!v || !st || v.dataset.adFramed) return;
          const g = getComputedStyle(st);
          FRAME.forEach(k => v.style.setProperty(k, g.getPropertyValue(k), 'important'));
          /* the spacing script puts the gap under the text on the diagram (inline): the frame holds that gap now */
          st.dataset.adMt = st.style.getPropertyValue('margin-top'); st.style.setProperty('margin-top', '0px', 'important');
          st.classList.add('ad-wy-bare'); v.dataset.adFramed = '1';
        });
        const i = steps.findIndex(e => e.offsetHeight > 0), s = steps[i], v = visuals[i], st = stages[i], c = copies[i];
        if (!v || !st) return;
        /* the spacing script re-applies its own inline gaps on every resize (Safari's toolbar sends one while it moves):
           put the text gap and the diagram's zero margin back first */
        textGap(); stages.forEach(x => x && x.classList.contains('ad-wy-bare') && x.style.setProperty('margin-top', '0px', 'important'));
        if (c) for (let n = 0; n < 3; n++) { /* move the frame to the shared line (margins may stop collapsing: repeat) */
          const cur = parseFloat(c.style.paddingBottom) || 0, gap = line - (Y(v) - Y(body));
          if (Math.abs(gap) <= .5) break;
          c.style.setProperty('padding-bottom', Math.max(0, cur + gap) + 'px', 'important');
        }
        const h = Math.floor(Y(body) + body.offsetHeight - 8 - Y(v));
        v.style.setProperty('height', h + 'px', 'important');
        v.style.setProperty('display', 'flex', 'important'); v.style.setProperty('align-items', 'flex-start', 'important');
        v.style.setProperty('justify-content', 'center', 'important');
        st.style.setProperty('flex', 'none', 'important');
        /* the diagram's visible extent (labels that hang below its box included), read through its current scale */
        const k0 = parseFloat(st.style.scale) || 1, sTop = st.getBoundingClientRect().top; let hi = Infinity, lo = -Infinity;
        st.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (r.height && r.width && getComputedStyle(e).visibility !== 'hidden') { hi = Math.min(hi, r.top); lo = Math.max(lo, r.bottom); } });
        if (!isFinite(hi)) { hi = sTop; lo = sTop + st.offsetHeight * k0; }
        hi = (hi - sTop) / k0; lo = (lo - sTop) / k0;
        const natH = lo - hi, room = h - 2 - PAD * 2;
        const k = Math.min(1, room / natH, v.clientWidth / st.offsetWidth);
        st.style.setProperty('scale', k.toFixed(3), 'important');
        /* the stage scales from its top edge; move it so the content's top lands where centring puts it */
        const dy = (h - 2 - natH * k) / 2 - hi * k;
        st.style.setProperty('translate', '0 ' + dy.toFixed(1) + 'px', 'important');
        /* diagrams finish their entrance and fill in (Personalize adds lines to its cards): fit again as they settle */
        if (!fitStep.again) {
          (fitStep.t || []).forEach(clearTimeout);
          fitStep.t = [700, 1800, 3600].map(ms => setTimeout(() => { fitStep.again = 1; fitStep(); fitStep.again = 0; }, ms));
        }
      };
      /* The frames inside the four diagrams take the site's 30% frame too (owner, 22 Nov 2026): the light line and the
         edge highlights × 0.22, worked out from each element's own frame; coral accents, fills and drop shadows stay. */
      const SOFT = '.nm-card,.nm-final,.ag-engine,.ag-out,.ds-engine,.ds-dev,.ds-tile,.ps-prof,.ps-card';
      const alpha = (c, k) => c.replace(/rgba?\(([^)]+)\)/g, (m, v) => { const p = v.split(',').map(x => parseFloat(x));
        return `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${((p.length > 3 ? p[3] : 1) * k).toFixed(3)})`; });
      const light = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return false; const p = m[1].split(',').map(parseFloat); return p[0] > 200 && p[1] > 150; };
      const parts = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
      const soften = () => wy.querySelectorAll(SOFT).forEach(e => {
        if (e.dataset.adSoft) return; const g = getComputedStyle(e); let done = false;
        ['top', 'right', 'bottom', 'left'].forEach(side => { const c = g.getPropertyValue(`border-${side}-color`);
          if (parseFloat(g.getPropertyValue(`border-${side}-width`)) && light(c)) { e.style.setProperty(`border-${side}-color`, alpha(c, .22), 'important'); done = true; } });
        /* a frame that is not drawn yet (it comes in with the diagram's animation) is tried again on the next fit */
        if (!done) return;
        if (g.boxShadow && g.boxShadow !== 'none') e.style.setProperty('box-shadow', parts(g.boxShadow).map(x => {
          const m = x.match(/^(rgba?\([^)]+\))\s+(.*)$/); if (!m) return x; const n = (m[2].match(/-?[\d.]+px/g) || []).map(parseFloat);
          return (/inset/.test(m[2]) || (n[2] || 0) <= 2) && light(m[1]) ? `${alpha(m[1], .22)} ${m[2]}` : x; }).join(', '), 'important');
        e.dataset.adSoft = '1';
      });
      let scrollStep = 0, p = null;
      body.style.setProperty('--wy-stage-h', H() + 'px');
      p = A.pin([body], {steps: tabs.length, per: .5, className: 'ad-wy-pin', vh: () => probe.offsetHeight || innerHeight, onStep: i => {
        scrollStep = i; tabs[i].click(); fitStep();
      }});
      if (p) {
        /* A tap is handled before it reaches the buttons (capture listener elsewhere), so follow the selection: a step
           chosen by tap, not by scroll, scrolls the page to that step. */
        new MutationObserver(() => {
          const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
          if (i > -1 && i !== scrollStep && p.wrap.classList.contains('is-on')) p.go(i);
          requestAnimationFrame(fitStep);
        }).observe(row, {subtree: true, attributes: true, attributeFilter: ['aria-selected']});
        let lastH = H(), lastW = innerWidth;
        addEventListener('resize', () => {
          /* Safari's toolbar moving fires resize without changing the small viewport: keep everything as it is then */
          const h = H(); if (h === lastH && innerWidth === lastW) { setTimeout(() => { fitStep.again = 1; fitStep(); fitStep.again = 0; }, 80); return; }
          lastH = h; lastW = innerWidth;
          body.style.setProperty('--wy-stage-h', h + 'px'); measured = false; unframe(); fitStep();
        });
        addEventListener('load', fitStep); fitStep();
      }
    }

    /* Phones: each supply source in the Aggregate step shows a small photo instead of its icon, frameless and without
       a background behind it (owner, 22 Nov 2026). Photos are decorative; the words stay as they are. */
    const SRC_IMG = {marketplaces: 'assets/v2/02-louvre-480.jpg', aggregators: 'assets/v2/08-colosseum-480.jpg',
      'ticketing systems': 'assets/v2/16-live-music-960.jpg', 'direct suppliers': 'assets/v2/06-wine-cheese-480.jpg',
      'your suppliers': 'assets/v2/07-seine-dinner-480.jpg'};
    $$('.ag-src-body', wy).forEach(b => {
      if ($('.ad-src-photo', b)) return;
      const name = (($('b', b) || {}).textContent || '').trim().toLowerCase(), src = SRC_IMG[name]; if (!src) return;
      const i = document.createElement('i'); i.className = 'ad-src-photo'; i.setAttribute('aria-hidden', 'true');
      i.style.backgroundImage = `url(${src})`; b.prepend(i);
    });
  }

  /* 6 · Products: three cards in a horizontal scroller with a peek of the next one. */
  const pr = $('#products .pr-grid');
  if (pr) A.scroller(pr, {card: '86%', tablet: '58%'});

  /* 7 · Who it's for: the whole row opens the audience page. */
  A.rowLinks($$('#audiences .audience-card'));
})();

/* Mobile · one section ≈ one screen (390×844). Folding, not removing: every line stays in the page. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1 · Hero: copy first, the funnel scaled into whatever height is left on the first screen. */
  const hv = $('#home .bv2-hero-visual'), hc = $('#home .bv2-hero-copy');
  if (hv && hc) {
    const budget = () => Math.max(150, innerHeight - hc.offsetHeight - 60 - 56);
    A.fit(hv, budget, {child: '.bv2-funnel'});
    setTimeout(() => dispatchEvent(new Event('resize')), 600);
  }

  /* 3 · The problem: intro folds to three lines (Read more opens it), the connecting line folds to its title. */
  const pb = $('#opportunity-study');
  if (pb) {
    const p1 = $('.pb-intro > p:first-child', pb), more = $('.pb-toggle', pb);
    if (p1 && more) A.expander(p1, {lines: 3, trigger: more});
    A.expander($('.pb-bar', pb), {lines: 3});
    $$('.pb-panel .hm-wrap', pb).forEach(w => A.fit(w, 135));
  }

  /* 4 · Why: each step keeps its illustration at natural size. Below 620px the stages already draw their
     narrow, top-to-bottom layout; shrinking them made the labels unreadable. */

  /* 6 · Products: the guide shows three lines, then a "Read more +" link under it — the same control the
     problem section already uses — so it is clear the text continues and where to tap. */
  A.fold($('#products .pr-guide'), 3);
})();

/* Who it's for (mobile): the six icons are drawn at different sizes inside the same 72×72 box, so the gap to the text
   looked uneven. Crop each icon to its own drawing, centred in a square, so every glyph fills its 36px box alike. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  document.querySelectorAll('#audiences .audience-icon svg').forEach(s => {
    try {
      const b = s.getBBox(); if (!b.width) return;
      const size = Math.max(b.width, b.height) + 4, cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      s.dataset.adViewBox = s.getAttribute('viewBox') || '';
      s.setAttribute('viewBox', `${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`);
    } catch (e) {}
  });
})();

/* Hero entrance on phones: the copy arrives in sequence, as on desktop (hero-v2.js: rise 20px and fade in, 750ms,
   100ms apart). The phone preview keeps the page hidden until the layer has run, and the entrance had already played
   behind it; it now plays when the page is shown (event "bf-shown" from phone.html). On the live site the layer is
   in the page from the start, so hero-v2.js's own entrance is the one the reader sees. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const copy = document.querySelector('#home .bv2-hero-copy');
  if (!copy || !copy.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let played = false;
  addEventListener('bf-shown', () => {
    if (played || !A.MQ.mobile.matches || scrollY > innerHeight / 2) return;
    played = true;
    // one entrance only: drop whatever ran (or is still running) behind the curtain
    [...copy.children].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    [...copy.children].filter(e => e.offsetHeight).forEach((el, i) => el.animate(
      [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}],
      {duration: 750, delay: 80 + i * 100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'}));
  });
})();

/* Products stack (phones): the card being covered by the next one steps back: down to 92% and dimmer, by how much
   of it is covered. Uses `scale` and `filter`, so the card's own transforms stay as they are. Off with reduced motion. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const grid = document.querySelector('#products .pr-grid'); if (!grid) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...grid.children];
  let raf = 0;
  const paint = () => {
    raf = 0;
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!A.MQ.mobile.matches || reduced.matches || !next) { c.style.removeProperty('scale'); c.style.removeProperty('filter'); return; }
      const r = c.getBoundingClientRect(), n = next.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (r.bottom - n.top) / r.height));   // share of this card covered by the next
      c.style.setProperty('scale', String(1 - p * 0.08));
      c.style.setProperty('filter', `brightness(${1 - p * 0.45})`);
    });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask); A.MQ.mobile.addEventListener('change', ask); ask();
})();

/* Hero visual on phones: Hub (index-v2.css "Hero visual on phones: Hub"). The cards are the desktop tangle's own
   (.fn-tile: photo, name, type · price), so no words are added; "Bridgify", "1 integration" and "YourBrand" are the
   desktop hero's too. The element keeps one size from the first paint, so nothing below it moves. It starts as the
   tangle and settles into order once, shortly after the page shows; dots then run along the wires. Reduced motion:
   ordered at once, no dots. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const copy = document.querySelector('#home .bv2-hero-copy'); if (!copy || copy.querySelector('.ad-hero-flow')) return;
  const tiles = [...document.querySelectorAll('#home .fn-tile')].slice(0, 8); if (tiles.length < 4) return;
  const label = document.querySelector('#home .bv2-funnel')?.getAttribute('aria-label') || '';
  const el = document.createElement('div');
  el.className = 'ad-hero-flow'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', label);
  const cards = tiles.map(t => `<div class="hf-card" aria-hidden="true"><img src="${t.querySelector('img').getAttribute('src')}" alt="" decoding="async"><span>${t.querySelector('span').innerHTML}</span></div>`).join('');
  const pick = [0, 2, 4, 6].map(i => tiles[i] && tiles[i].querySelector('img').getAttribute('src')).filter(Boolean);
  el.innerHTML = `<svg class="hf-wires" aria-hidden="true"></svg>${cards}
    <div class="hf-hub" aria-hidden="true"><img src="assets/bridgify-icon.svg" alt=""><span>Bridgify</span></div>
    <div class="hf-chip" aria-hidden="true">1 integration</div>
    <div class="hf-app" aria-hidden="true"><b>YourBrand</b>${pick.slice(0, 3).map(s => `<i><img src="${s}" alt=""><u></u></i>`).join('')}</div>`;
  const p = copy.querySelector(':scope > p'); (p ? p.after(el) : copy.appendChild(el));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg', H = 176, cs = [...el.querySelectorAll('.hf-card')];
  const hub = el.querySelector('.hf-hub'), chip = el.querySelector('.hf-chip'), app = el.querySelector('.hf-app'), svg = el.querySelector('svg');
  let org = false, geo = null;
  const layout = () => {
    const w = el.clientWidth; if (!w) return;
    const t = Math.min(64, Math.floor((w * .42 - 8) / 2)), aw = Math.round(w * .25), tx = 2 * t + 8, mid = (tx + (w - aw)) / 2;
    geo = {w, t, tiles: [[0, 4], [t + 8, 4], [0, t + 12], [t + 8, t + 12]], hub: {x: mid - 36, y: (2 * t + 16) / 2 + 4 - 44, w: 72, h: 88}, app: {x: w - aw, y: 0, w: aw, h: 150}};
    const r = (i, a, b) => { const x = Math.sin(i * 12.9898 + a) * 43758.5453; return b * (x - Math.floor(x)); };
    geo.chaos = cs.map((c, i) => ({x: (i % 3) * (w - 128) / 2 + r(i, 1, 24) - 12, y: i * (H - 40) / (cs.length - 1) + r(i, 2, 14) - 7, rot: r(i, 3, 22) - 11}));
    Object.assign(hub.style, {left: geo.hub.x + 'px', top: geo.hub.y + 'px', width: geo.hub.w + 'px', height: geo.hub.h + 'px'});
    Object.assign(app.style, {left: geo.app.x + 'px', top: geo.app.y + 'px', width: geo.app.w + 'px', height: geo.app.h + 'px'});
    chip.style.left = Math.round(mid - 46) + 'px'; chip.style.top = (geo.hub.y + geo.hub.h + 16) + 'px';
    place();
  };
  const place = () => {
    if (!geo) return;
    el.classList.toggle('hf-org', org);
    cs.forEach((c, i) => {
      const tl = org && i < 4 ? geo.tiles[i] : null, ch = geo.chaos[i];
      c.classList.toggle('hf-tile', !!tl); c.classList.toggle('hf-out', org && !tl);
      c.style.transform = tl ? `translate(${tl[0]}px,${tl[1]}px)` : `translate(${ch.x}px,${ch.y}px) rotate(${ch.rot}deg)${org ? ' scale(.85)' : ''}`;
      c.style.width = tl ? geo.t + 'px' : ''; c.style.height = tl ? geo.t + 'px' : '';
    });
    wires();
  };
  const wires = () => {
    svg.replaceChildren(); svg.setAttribute('viewBox', `0 0 ${geo.w} ${H}`);
    const P = (d, o, id) => { const e = document.createElementNS(NS, 'path'); e.setAttribute('d', d); if (o) e.setAttribute('class', 'hf-o'); if (id) e.id = id; svg.append(e); return e; };
    if (!org) {   // the tangle: every card wired to two others and to a knot under the middle
      const ch = geo.chaos, kx = geo.w / 2, ky = H * .82;
      ch.forEach((c, i) => { const a = ch[(i * 3 + 2) % ch.length], b = ch[(i + 5) % ch.length];
        P(`M${c.x + 60} ${c.y + 18}C${c.x + 150} ${c.y + 90} ${a.x - 30} ${a.y + 110} ${kx + (i - 4) * 5} ${ky}`);
        P(`M${c.x + 60} ${c.y + 18}C${c.x - 40} ${c.y + 70} ${b.x + 120} ${b.y - 30} ${b.x + 60} ${b.y + 18}`); });
      return;
    }
    const t = geo.t, hx = geo.hub.x, hy = geo.hub.y + geo.hub.h / 2, ax = geo.app.x, ay = geo.app.y + 75;
    const paths = [[t * 2 + 8, 4 + t / 2], [t * 2 + 8, t + 12 + t / 2]].map(([x, y]) => `M${x} ${y}C${(x + hx) / 2} ${y} ${(x + hx) / 2} ${hy} ${hx} ${hy}`);
    paths.push(`M${hx + geo.hub.w} ${hy}C${(hx + geo.hub.w + ax) / 2} ${hy} ${(hx + geo.hub.w + ax) / 2} ${ay} ${ax} ${ay}`);
    paths.forEach((d, i) => { P(d, true, 'hf-p' + i);
      if (reduced) return;
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', i === 2 ? '2.6' : '2');
      c.innerHTML = `<animateMotion dur="${i === 2 ? 1.4 : 2.2}s" begin="${i === 2 ? 1.2 : i * .6}s" repeatCount="indefinite"><mpath href="#hf-p${i}"/></animateMotion>`;
      svg.append(c); });
  };
  if (reduced) org = true;
  requestAnimationFrame(layout); addEventListener('resize', () => requestAnimationFrame(layout));
  /* order: the cards move first; the tidy wires and their dots come in once the cards have settled */
  if (!reduced) setTimeout(() => {
    svg.style.opacity = '0';
    setTimeout(() => { org = true; place(); svg.style.opacity = '0'; setTimeout(() => { svg.style.opacity = '1'; }, 750); }, 250);
  }, 1400);
})();

/* Round 4: option 2 of the Global supply strip is on unless the link asks for the previous one (&src1).
   Touch screens only show :active while a touch listener exists. */
(() => {
  let q = location.search; try { q += top.location.search; } catch (e) {}
  if (!/[?&]src1\b/.test(q)) document.documentElement.classList.add('ad-src2');
  document.addEventListener('touchstart', () => {}, {passive: true});
})();

/* Round 5: hero title on phones in four lines: "One connection." / "A million+" / "travel experiences, matched" /
   "to every customer." "A million+" stands on its own line, as the figure it is. Text unchanged. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const h = document.querySelector('#home #hero-title'); if (!h || h.querySelector('.ad-br')) return;
  const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const i = n.data.indexOf('million+'); if (i < 0) continue;
    const after = n.splitText(i + 'million+'.length);
    const br = document.createElement('br'); br.className = 'ad-br'; after.parentNode.insertBefore(br, after);
    after.data = after.data.replace(/^\s+/, '');
    break;
  }
})();
