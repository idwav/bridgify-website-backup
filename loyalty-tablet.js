/* Loyalty on a standard tablet (600-900px): two sections show one part at a time, with tab bars that switch by themselves until touched:
   "Choose a marketplace or integrate" (Experiences API / White-Label Marketplace, every 6 s) and the Market signal (Travel sites / apps / cards, every 4 s).
   Outside that width the tab bars are hidden by CSS. */
(() => {
  if (window.__lyTablet) return; window.__lyTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  function tabs(o) {
    const root = $(o.root), items = root ? $$(o.items, root) : [], anchor = root ? $(o.anchor, root) : null;
    if (!root || !items.length || !anchor || $('.ly-tabs', root)) return;
    const bar = document.createElement('div'); bar.className = 'ly-tabs'; bar.dataset.for = o.id; bar.setAttribute('role', 'tablist');
    let cur = 0, timer = 0, visible = false, touched = false;
    const show = i => { cur = i; items.forEach((e, j) => e.classList.toggle('ly-on', j === i)); $$('button', bar).forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); };
    o.labels.slice(0, items.length).forEach((t, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab');
      if (o.numbered) { b.innerHTML = '<i>0' + (i + 1) + '</i><span></span>'; $('span', b).textContent = t; } else b.textContent = t;
      b.addEventListener('click', () => { touched = true; clearInterval(timer); show(i); }); bar.append(b);
    });
    o.place(bar, anchor); show(0);
    timer = setInterval(() => { if (!touched && MQ.matches && visible && !reduce) show((cur + 1) % items.length); }, o.every);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(root);
  }
  tabs({id: 'xc', root: 'section.xc', items: '.xc-card', anchor: '.xc-head', labels: ['Experiences API', 'White-Label Marketplace'], every: 6000, place: (b, a) => a.append(b)});
  tabs({id: 'ms', root: '#market-signal', items: '.lm4-col', anchor: '.lm4-stage', labels: ['Travel sites', 'Travel apps', 'Travel cards'], every: 4000, numbered: true, place: (b, a) => a.before(b)});
})();
