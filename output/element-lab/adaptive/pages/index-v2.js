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
