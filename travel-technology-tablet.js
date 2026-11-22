/* Travel technology on a standard tablet (600-900px): "Choose how to integrate and distribute experiences" shows one product at a time
   (Experiences API / White-Label Marketplace, every 6 s) until touched. Outside that width the tab bar is hidden by CSS. */
(() => {
  if (window.__ttTablet) return; window.__ttTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const xc = $('section.xc'), cards = xc ? $$('.xc-card', xc) : [], head = xc && $('.xc-head', xc);
  if (!xc || !head || cards.length < 2 || $('.tt-tabs', xc)) return;  // one product: no tabs needed
  const bar = document.createElement('div'); bar.className = 'tt-tabs'; bar.setAttribute('role', 'tablist');
  let cur = 0, timer = 0, visible = false, touched = false;
  const show = i => { cur = i; cards.forEach((e, j) => e.classList.toggle('tt-on', j === i)); $$('button', bar).forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); };
  ['Experiences API', 'White-Label Marketplace'].slice(0, cards.length).forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = t; b.addEventListener('click', () => { touched = true; clearInterval(timer); show(i); }); bar.append(b); });
  head.append(bar); show(0);
  timer = setInterval(() => { if (!touched && MQ.matches && visible && !reduce) show((cur + 1) % cards.length); }, 6000);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(xc);
})();
