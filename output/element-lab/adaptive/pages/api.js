/* Experiences API · mobile (≤599): one section ≈ one screen. Folding, not removing: every line stays in the page. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Folded paragraphs get a coral + on the section's own background colour. */
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c; } return '#100A08'; };
  const fold = (el, lines) => A.fold(el, lines);  // shared: Read more + under the text

  /* 2 · Network: intro folds to three lines; the before/after slider fits a 400px budget. */
  fold($('#network .an-heading > p'), 3);
  A.fit($('#network .nz-wrap'), 400, {child: '.nz-stage'});

  /* 3 · What's inside: intro folds to three lines. */
  fold($('#whats-inside .ex-head > p'), 3);

  /* Round 2 · hero lead and the product intro fold too, so each fits one screen. */
  if (A.MQ.mobile.matches) { fold($('#top .hero-copy > p'), 3); fold($('#customer-experience .cj-copy > p'), 3); }

  /* 5 · Who does what: "You build" and "Bridgify manages" become a two-way switch. */
  const am = $('#integration');
  if (am) A.tabs(am, $$('.am-build, .am-managed', am), {when: A.MQ.mobile, before: $('.am-panel', am), label: 'Who does what', start: 0});

  /* 6 · What to check: five rows become an accordion, the first one open. */
  $$('#api-features .ck-row').forEach((row, i, rows) => {
    const head = row.firstElementChild;
    row.classList.add('ad-acc-row'); if (i === 0) row.classList.add('ad-open');
    head.setAttribute('role', 'button'); head.tabIndex = 0; head.setAttribute('aria-expanded', String(i === 0));
    const t = () => {
      if (!A.MQ.mobile.matches) return;
      const on = !row.classList.contains('ad-open');
      rows.forEach(r => { r.classList.remove('ad-open'); r.firstElementChild.setAttribute('aria-expanded', 'false'); });
      row.classList.toggle('ad-open', on); head.setAttribute('aria-expanded', String(on));
    };
    head.addEventListener('click', t);
    head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
  });
})();
