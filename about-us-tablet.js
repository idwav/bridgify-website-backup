/* About us on a standard tablet (600-900px): in "From fragmented supply to the right experience for every customer" three numbered buttons (01 Connect, 02 Usable, 03 Relevant)
   show one step at a time: its text under the buttons and its demo below, switching by themselves every 5 s until touched. Outside that width the tab bar is hidden by CSS. */
(() => {
  if (window.__abTablet) return; window.__abTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.querySelector('#story'), lis = sec ? [...sec.querySelectorAll('.ab-chapters > li')] : [], items = sec ? [...sec.querySelectorAll('.ms-s')] : [];
  if (!sec || lis.length < 2 || lis.length !== items.length || sec.querySelector('.ab-tabs')) return;
  const list = lis[0].parentElement, short = ['Connect', 'Usable', 'Relevant'];
  const bar = document.createElement('div'); bar.className = 'ab-tabs'; bar.setAttribute('role', 'tablist');
  const cap = document.createElement('p'); cap.className = 'ab-cap';
  const texts = lis.map(l => { const p = l.querySelector('p'); return (p || l).textContent.trim(); });
  let cur = 0, timer = 0, visible = false, touched = false;
  const btns = lis.map((l, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.innerHTML = '<i></i><span></span>'; b.firstChild.textContent = '0' + (i + 1); b.lastChild.textContent = short[i] || ('Step ' + (i + 1)); b.addEventListener('click', () => { touched = true; clearInterval(timer); show(i); }); bar.append(b); return b; });
  function show(i) { cur = i; btns.forEach((b, j) => b.setAttribute('aria-selected', String(j === i))); items.forEach((e, j) => e.classList.toggle('ab-on', j === i)); cap.style.opacity = 0; setTimeout(() => { cap.textContent = texts[i]; cap.style.opacity = 1; }, reduce ? 0 : 220); }
  list.classList.add('ab-hidden'); list.after(bar); bar.after(cap); show(0);
  timer = setInterval(() => { if (!touched && MQ.matches && visible && !reduce) show((cur + 1) % items.length); }, 5000);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(sec);
})();
