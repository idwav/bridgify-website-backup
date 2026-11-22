/* Airlines on a standard tablet (600-900px): "Offer experiences through your own channels" shows one product at a time (Experiences API / White-Label Marketplace, every 6 s),
   and the passenger-journey steps advance by themselves (every 5 s) until touched. Outside that width the tab bar is hidden by CSS. */
(() => {
  if (window.__atTablet) return; window.__atTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const watch = (root, tick, ms) => { let visible = false, touched = false; const id = setInterval(() => { if (!touched && MQ.matches && visible && !reduce) tick(); }, ms); new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(root); return () => { touched = true; clearInterval(id); }; };
  const xc = $('section.xc'), cards = xc ? $$('.xc-card', xc) : [], head = xc && $('.xc-head', xc);
  if (xc && head && cards.length && !$('.at-tabs', xc)) {
    const bar = document.createElement('div'); bar.className = 'at-tabs'; bar.setAttribute('role', 'tablist'); let cur = 0, stop = () => {};
    const show = i => { cur = i; cards.forEach((e, j) => e.classList.toggle('at-on', j === i)); $$('button', bar).forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); };
    ['Experiences API', 'White-Label Marketplace'].slice(0, cards.length).forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = t; b.addEventListener('click', () => { stop(); show(i); }); bar.append(b); });
    head.append(bar); show(0); stop = watch(xc, () => show((cur + 1) % cards.length), 6000);
  }
  const jr = $('#section-3'), steps = jr ? $$('.al-touchpoints > button', jr) : [];
  if (jr && steps.length) { let cur = 0; const stop = watch(jr, () => { cur = (cur + 1) % steps.length; steps[cur].click(); }, 5000); steps.forEach(b => b.addEventListener('pointerdown', stop)); }
})();
