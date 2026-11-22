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
      /* One stage height for all four steps (the screen under the header), so nothing jumps between steps; a step's
         diagram is zoomed down only when it would not fit under its copy. */
      const head = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ad-header-h')) || 64;
      const H = () => innerHeight - head() - 24;
      const fitStep = () => {
        const s = steps.find(e => e.offsetHeight > 0), v = s && $('.wy-visual', s);
        if (!v) return;
        const on = p && p.wrap.classList.contains('is-on');
        /* scale (not zoom): the diagrams size parts of themselves from their own width, so zoom does not shrink them evenly */
        v.style.scale = ''; v.style.transformOrigin = ''; v.style.marginBottom = '';
        const room = body.getBoundingClientRect().bottom - 8 - v.getBoundingClientRect().top, nat = v.offsetHeight;
        if (on && nat > room) {
          const k = room / nat;
          v.style.scale = k.toFixed(3); v.style.transformOrigin = 'top center';
          v.style.setProperty('margin-bottom', -Math.ceil(nat * (1 - k)) + 'px', 'important');
        }
      };
      let scrollStep = 0, p = null;
      body.style.setProperty('--wy-stage-h', H() + 'px');
      p = A.pin([body], {steps: tabs.length, per: .5, className: 'ad-wy-pin', onStep: i => {
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
        addEventListener('resize', () => { body.style.setProperty('--wy-stage-h', H() + 'px'); fitStep(); });
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

/* Hero visual on phones: experiences → Bridgify → your app (see index-v2.css "Hero visual on phones").
   Only words already in the desktop hero: "Bridgify", "YourBrand". Wires are drawn from the boxes' real
   positions; dots travel along them. Still with reduced motion. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const copy = document.querySelector('#home .bv2-hero-copy'); if (!copy || copy.querySelector('.ad-hero-flow')) return;
  const src = ['assets/v2/08-colosseum-480.jpg', 'assets/v2/05-paris-food-tour-960.jpg', 'assets/v2/11-catamaran-480.jpg', 'assets/v2/16-live-music-960.jpg'].map(n => `<img src="${n}" alt="" width="48" height="48" decoding="async">`).join('');
  const label = document.querySelector('#home .bv2-funnel')?.getAttribute('aria-label') || '';
  const el = document.createElement('div');
  el.className = 'ad-hero-flow'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', label);
  el.innerHTML = `<svg class="hf-wires" aria-hidden="true"></svg><div class="hf-src" aria-hidden="true">${src}</div>
    <div class="hf-hub" aria-hidden="true"><i><img src="assets/bridgify-icon.svg" alt=""></i><span>Bridgify</span></div>
    <div class="hf-app" aria-hidden="true"><b>YourBrand</b><i><img src="assets/v2/08-colosseum-960.jpg" alt=""><u></u></i><i><img src="assets/v2/13-santorini-960.jpg" alt=""><u></u></i></div>`;
  copy.appendChild(el);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const draw = () => {
    const svg = el.querySelector('svg'), o = el.getBoundingClientRect(); if (!o.width) return;
    const R = e => { const r = e.getBoundingClientRect(); return {l: r.left - o.left, r: r.right - o.left, t: r.top - o.top, b: r.bottom - o.top, cx: (r.left + r.right) / 2 - o.left, cy: (r.top + r.bottom) / 2 - o.top}; };
    const imgs = [...el.querySelectorAll('.hf-src img')].map(R), hub = R(el.querySelector('.hf-hub i')), app = R(el.querySelector('.hf-app'));
    const sx = imgs[1].r, hx = hub.l - 2, hy = hub.cy;
    const ys = [imgs[1].t + 12, imgs[1].b - 12, imgs[3].t + 12, imgs[3].b - 12];
    const paths = ys.map(y => `M${sx} ${y}C${(sx + hx) / 2} ${y} ${(sx + hx) / 2} ${hy} ${hx} ${hy}`);
    paths.push(`M${hub.r + 2} ${hy}L${app.l} ${hy}`);
    svg.setAttribute('viewBox', `0 0 ${o.width} ${o.height}`); svg.innerHTML = '';
    paths.forEach((d, i) => {
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.id = 'hf-p' + i; svg.appendChild(p);
      if (reduced) return;
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', i === 4 ? '2.6' : '2');
      c.innerHTML = `<animateMotion dur="${i === 4 ? 1.4 : 2.2}s" begin="${i === 4 ? 2.0 : i * 0.55}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#hf-p${i}"/></animateMotion>`;
      svg.appendChild(c);
    });
  };
  requestAnimationFrame(draw); addEventListener('resize', () => requestAnimationFrame(draw));
  el.querySelectorAll('img').forEach(i => i.complete || i.addEventListener('load', draw, {once: true}));
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
