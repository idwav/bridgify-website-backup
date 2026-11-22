/* Super apps on a standard tablet (600-900px): the three numbered steps of "Connect experiences to what users are planning" advance by themselves (every 5 s) until touched.
   Outside that width nothing changes. */
(() => {
  if (window.__saTablet) return; window.__saTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:900px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.querySelector('#section-3'), steps = sec ? [...sec.querySelectorAll('.up-story-steps > *')] : [];
  if (!sec || steps.length < 2) return;
  let cur = 0, visible = false, touched = false;
  const id = setInterval(() => { if (!touched && MQ.matches && visible && !reduce) { cur = (cur + 1) % steps.length; steps[cur].click(); } }, 5000);
  steps.forEach(b => b.addEventListener('pointerdown', () => { touched = true; clearInterval(id); }));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {threshold: .3}).observe(sec);
})();
