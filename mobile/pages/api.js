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
  // phones: the slider stays as on desktop (portrait layout from the site's own CSS); tablet keeps the fitted slider
  if (!A.MQ.mobile.matches) A.fit($('#network .nz-wrap'), 400, {child: '.nz-stage'});

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

/* Round 9: hero holds while the code rises over the app card (see api.css "Round 9").
   The copy and the visual go into a holder of fixed height; inside it they stick where they start, and every pixel
   scrolled raises the code one pixel (its negative top margin grows), so the stage shrinks exactly as fast as the
   holder scrolls away: nothing moves but the code. When the card is covered the holder's end is reached and the
   page carries on. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const hero = document.querySelector('#top'), copy = hero && hero.querySelector('.hero-copy'), vis = hero && hero.querySelector('.ahc-visual');
  const code = vis && vis.querySelector('.ahc-code'), card = code && code.querySelector('.ahc-card');
  if (!copy || !card) return;
  for (let a = card.parentElement; a && a !== document.body; a = a.parentElement) {
    const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important');
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let w = null, st = null, base = 96, run = 0, top = 0;
  const on = () => A.MQ.mobile.matches && !reduced.matches;
  const build = () => {
    if (w) return; w = document.createElement('div'); w.className = 'ad-hold'; st = document.createElement('div'); st.className = 'ad-hold-stage';
    copy.before(w); w.append(st); st.append(copy, vis);
  };
  const measure = () => {
    if (!A.MQ.mobile.matches) return;
    const meta = card.querySelector('.ahc-card-meta'); if (!meta) return;
    code.style.setProperty('--ad-overlap', '0px');
    const keep = meta.getBoundingClientRect().bottom - card.getBoundingClientRect().top + 6;
    base = Math.max(0, Math.round(card.offsetHeight - keep));
    run = Math.round(keep + 22);                       // the rest of the card, its tag included
    code.style.setProperty('--ad-overlap', base + 'px');
    if (!on()) return;
    build(); w.style.height = ''; st.style.position = 'relative'; st.style.top = '';
    const sy = scrollY; w.style.height = st.offsetHeight + 'px';
    top = Math.round(w.getBoundingClientRect().top + sy) - sy * 0;  // where the stage starts on the first screen
    top = Math.round(w.getBoundingClientRect().top + sy);
    st.style.position = 'sticky'; st.style.top = top + 'px';
    tick();
  };
  const tick = () => {
    if (!w || !on()) return;
    const s = Math.max(0, Math.min(run, top - w.getBoundingClientRect().top));
    code.style.setProperty('--ad-overlap', (base + s) + 'px');
  };
  let raf = 0; addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); }, {passive: true});
  addEventListener('resize', measure); addEventListener('bf-shown', measure); addEventListener('load', () => setTimeout(measure, 200));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  // the spacing layer and late images change the stage's natural height: measure again whenever it changes at rest
  let lastS = 0;
  const rest = () => { if (!w) return; const s = Math.max(0, top - w.getBoundingClientRect().top); if (s < 1) measure(); };
  if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(rest)).observe(copy);
  if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(rest)).observe(card);
  addEventListener('scroll', () => { if (scrollY < 2) requestAnimationFrame(rest); }, {passive: true});
})();
