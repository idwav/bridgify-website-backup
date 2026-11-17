/* White-Label Marketplace · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1 · Hero: copy first; the live store demo takes whatever is left of the first screen. */
  /* Concept · one responsive component: below 1024 the brand settings sit above the store as their own panel,
     and the store keeps its natural size. No zoom. */

  /* Round 2 · the hero lead folds so the store demo gets the rest of the screen. */
  if (A.MQ.mobile.matches) A.fold($('#section-1 .block-copy > p.lead'), 4);

  /* 2 · Discovery to checkout: intro folds; the four-stage store fits a 420px budget. */
  A.fold($('#section-2 header > p'), 3);
  A.zoomFit($('#section-2 .presentation'), 420);

  /* 3 · Branding: intro folds; the preview fits under the three control rows. */
  A.fold($('#section-3 .wl-heading > p'), 3);
  A.zoomFit($('#section-3 .wl-preview-stage'), 330);

  /* 4 · What runs underneath: intro folds. */
  A.fold($('#section-4 .wo-heading > p'), 3);

  /* 5 · Live in 3 days: lead folds; the days scroll sideways; the store preview fits 360px. */
  A.fold($('#section-5 .launch-heading p.lead'), 3);
  /* The three days are a sequence: they stack as a list on phones (no sideways scroll). */
  A.zoomFit($('#section-5 .launch-store'), 300);

  /* 6 · Build or buy: one side at a time. */
  const bb = $('#build-or-buy');
  if (bb) A.tabs(bb, $$('.bc-card', bb), {when: A.MQ.mobile, before: $('.bc-comparison', bb), label: 'Build or buy', start: 1});
})();
