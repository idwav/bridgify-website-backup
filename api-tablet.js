/* API on a standard tablet (600-900px): "Your team builds the interface. We manage the supply layer." shows one part at a time with two tabs
   (the names are read from the two headings), switching after 3.5 seconds and then every 6, until touched. Outside that width the tab bar is hidden by CSS. */
(() => {
  if (window.__apTablet) return; window.__apTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.getElementById('integration'), head = sec && sec.querySelector('.am-panel'), items = sec ? [...sec.querySelectorAll('.am-build,.am-managed')] : [];
  if (!head || !items.length || head.querySelector('.ap-tabs')) return;
  const bar = document.createElement('div'); bar.className = 'ap-tabs'; bar.setAttribute('role', 'tablist');
  let cur = 0, timer = 0, visible = false, touched = false;
  const show = i => { cur = i; bar.dataset.i = i; items.forEach((e, j) => e.classList.toggle('ap-on', j === i)); [...bar.children].forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); };
  items.forEach((e, i) => { const h = e.querySelector('h3'), b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = h ? h.textContent.trim() : ''; b.addEventListener('click', () => { touched = true; clearTimeout(timer); show(i); }); bar.append(b); });
  head.prepend(bar); show(0);
  const next = d => { timer = setTimeout(() => { if (!touched && MQ.matches && visible && !reduce) { show((cur + 1) % items.length); next(6000); } else if (!touched) next(d); }, d); };
  next(3500);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(sec);
})();
