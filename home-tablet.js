/* Home on a standard tablet (600-900px): tabs for Why Bridgify and Products (one part at a time, switching every 6 seconds until touched),
   and Security + FAQ wrapped to share one screen. Outside that width the tab bars are hidden by CSS and the wrapper is taken apart. */
(() => {
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  function tabs(rootSel, itemSel, hostSel, labels) {
    const root = $(rootSel), items = $$(itemSel, root), host = $(hostSel, root); if (!root || !items.length || !host) return;
    const bar = document.createElement('div'); bar.className = 'ht-tabs'; bar.setAttribute('role', 'tablist');
    let cur = 0, timer = 0, visible = false, touched = false;
    const show = i => { cur = i; items.forEach((e, j) => e.classList.toggle('ht-on', j === i)); $$('button', bar).forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); };
    labels.slice(0, items.length).forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = t; b.addEventListener('click', () => { touched = true; clearInterval(timer); show(i); }); bar.append(b); });
    host.append(bar); show(0);  // last child of the section header: spacing rules count positions, so nothing before it may shift
    const tick = () => { if (!touched && MQ.matches && visible && !reduce) show((cur + 1) % items.length); };
    timer = setInterval(tick, 6000);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(root);
  }
  function merge() {
    const sec = $('#security'), faq = $('#faq'); if (!sec || !faq) return;
    const wrapped = sec.parentElement.classList.contains('ht-merge');
    if (MQ.matches && !wrapped) { const w = document.createElement('div'); w.className = 'ht-merge'; sec.parentElement.insertBefore(w, sec); w.append(sec, faq); }
    else if (!MQ.matches && wrapped) { sec.parentElement.replaceWith(sec, faq); }
  }
  tabs('#why-bridgify', '.wy-step', '.wy-head', ['Aggregate', 'Normalize', 'Distribute', 'Personalize']);
  tabs('#products', '.pr-card', '.pr-head', ['Experiences API', 'White-Label Marketplace', 'AIyelet']);
  merge(); MQ.addEventListener('change', merge);
})();
