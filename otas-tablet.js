/* OTAs on a standard tablet (600-900px): "Embed it in your platform or launch a branded store" shows one product at a time with two tabs
   (Experiences API, White-Label Marketplace), switching every 6 seconds until touched. Outside that width the tab bar is hidden by CSS. */
(() => {
  if (window.__otTablet) return; window.__otTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const head = document.querySelector('#section-4 .xc-head'), items = [...document.querySelectorAll('#section-4 .xc-card')];
  if (!head || !items.length || head.querySelector('.ot-tabs')) return;
  const bar = document.createElement('div'); bar.className = 'ot-tabs'; bar.setAttribute('role', 'tablist');
  let cur = 0, timer = 0, visible = false, touched = false;
  const show = i => { cur = i; items.forEach((e, j) => e.classList.toggle('ot-on', j === i)); [...bar.children].forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); };
  ['Experiences API', 'White-Label Marketplace'].slice(0, items.length).forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = t; b.addEventListener('click', () => { touched = true; clearInterval(timer); show(i); }); bar.append(b); });
  head.append(bar); show(0);
  timer = setInterval(() => { if (!touched && MQ.matches && visible && !reduce) show((cur + 1) % items.length); }, 6000);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(document.getElementById('section-4'));
})();
