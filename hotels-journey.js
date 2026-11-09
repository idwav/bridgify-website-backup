(() => {
 const root = document.querySelector('.hotel-journey');
 if (!root) return;
 const cards = [...root.querySelectorAll('.hj-step')];

 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 let index = 0, stopped = reduce.matches, visible = false, timers = [];
 const clear = () => { timers.forEach(clearTimeout); timers = []; cards.forEach(c => c.classList.remove('is-sending')); };
 const later = (fn, ms) => timers.push(setTimeout(fn, ms));
 const paint = () => cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
 function schedule() { clear(); }
 function alignLinks() {
  cards.slice(0, -1).forEach((card, i) => {
   const link = card.querySelector('.hj-link');
   if (!link) return;
   if (innerWidth <= 760) { link.removeAttribute('style'); return; }
   const stage = card.querySelector('.hj-stage').getBoundingClientRect();
   const from = card.querySelector('.hj-device').getBoundingClientRect();
   const to = cards[i + 1].querySelector('.hj-device').getBoundingClientRect();
   link.style.left = `${from.right - stage.left}px`;
   link.style.top = `${from.top - stage.top + from.height / 2}px`;
   link.style.width = `${Math.max(0, to.left - from.right)}px`;
  });
 }
 paint();
 new ResizeObserver(alignLinks).observe(root.querySelector('.hj-grid'));
 document.fonts.ready.then(alignLinks);
 window.addEventListener('resize', alignLinks, {passive:true});
 new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, {threshold:.15}).observe(root);
 document.addEventListener('visibilitychange', schedule);
 reduce.addEventListener('change', () => { stopped = reduce.matches; schedule(); });
 root.querySelectorAll('.hj-channel button').forEach(button => button.onclick = () => {
  root.querySelectorAll('.hj-channel button').forEach(b => b.setAttribute('aria-selected', String(b === button)));
  root.querySelector('.hj-phone').dataset.channel = button.dataset.channel;
  root.querySelector('.hj-app-context').textContent = button.dataset.channel === 'concierge' ? 'Your concierge recommends' : button.dataset.channel === 'screens' ? 'Discover during your stay' : 'Experiences for your stay';
 });
 root.querySelectorAll('.hj-action').forEach((button, i) => button.onclick = () => {
  index = Math.min(i + 1, cards.length - 1); paint(); schedule();
  root.querySelector('.hj-feedback').textContent = i === 2 ? 'Seine River Cruise · Paris · Evening — illustrative guest experience.' : 'Continue discovering experiences under your hotel brand.';
 });
})();
