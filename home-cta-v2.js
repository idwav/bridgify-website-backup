/* V2 homepage · CTA (#home-cta). Ported from output/element-lab (12 · CTA).
   Auto-rotates the audience every 3.2s while on screen; a click picks one and stops the rotation. No controls row. */
(() => {
  const box = document.querySelector('[data-hc2]'); if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUD = [
    ['Passengers landing in Rome would book', [['assets/v2/08-colosseum-480.jpg', 'Colosseum entry', '€39'], ['assets/v2/rome-food-tour-960.jpg', 'Rome food tour', '€65'], ['assets/v2/09-florence-480.jpg', 'Day trip to Florence', '€29']]],
    ['Hotel guests in Paris would book', [['assets/v2/07-seine-dinner-480.jpg', 'Seine dinner cruise', '€95'], ['assets/v2/04-eiffel-night-480.jpg', 'Eiffel Tower summit', '€42'], ['assets/v2/02-louvre-480.jpg', 'Louvre entry', '€22']]],
    ['Cardholders would spend their points on', [['assets/v2/13-santorini-480.jpg', 'Santorini sunset sail', '4,800 pts'], ['assets/v2/10-alps-480.jpg', 'Alpine day hike', '5,400 pts'], ['assets/v2/12-london-eye-480.jpg', 'London Eye', '3,600 pts']]],
    ['App users would book this weekend', [['assets/v2/14-beach-club-480.jpg', 'Beach club day', '€70'], ['assets/v2/live-concert-960.jpg', 'Live concert', '€79'], ['assets/v2/11-catamaran-480.jpg', 'Catamaran sail', '€120']]]
  ];
  const btns = [...box.querySelectorAll('[data-aud]')], cards = [...box.querySelectorAll('.hc2-card')], cap = box.querySelector('.hc2-cap span');
  let cur = 0, swap = 0, loop = 0, picked = false, seen = false;
  const set = i => {
    if (i === cur) return; cur = i;
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    clearTimeout(swap);
    box.classList.add('is-swap');
    swap = setTimeout(() => {
      cap.textContent = AUD[i][0];
      AUD[i][1].forEach(([img, name, price], j) => {
        const c = cards[j];
        c.querySelector('img').src = `${img}`;
        c.querySelector('b').textContent = name; c.querySelector('small').textContent = price;
      });
      box.classList.remove('is-swap');
    }, reduce ? 0 : 380);
  };
  const run = () => { clearInterval(loop); if (!picked && seen && !reduce) loop = setInterval(() => set((cur + 1) % AUD.length), 3200); };
  btns.forEach((b, j) => b.addEventListener('click', () => { picked = true; clearInterval(loop); set(j); }));
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : clearInterval(loop); }, {threshold: .35}).observe(box);
  /* brand-consistency.js frames bordered elements; the CTA and the security card keep their own chrome */
  const scopes = ['home-cta', 'security', 'marketplace-results'].map(id => document.getElementById(id)).filter(Boolean);
  const CLS = ['brand-coral-frame', 'brand-action', 'brand-action-primary', 'brand-outer-frame'];
  const clean = () => scopes.forEach(scope => [scope, ...scope.querySelectorAll('*')].forEach(el => el.classList && !el.matches('.hc2-btn') && el.classList.remove(...CLS)));
  const later = () => setTimeout(clean, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
  addEventListener('load', later);
})();
