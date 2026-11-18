/* OTAs · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const m = A.MQ.mobile.matches;
  if (m) {
    const copy = $('#section-1 .ys-copy');
    A.fold($('#section-1 .ys-copy > p'), 3);
    A.zoomFit($('#section-1 .ys-ticket'), () => Math.max(560, innerHeight - (copy ? copy.offsetHeight : 420) - 60 - 28 - 24 - 28));
    A.fold($('#section-2 .ms-head > p:not(.sp-sub)'), 3);
    A.zoomFit($("#section-2 .sc"), 470);
    A.scroller($('#section-3 .rc-screens'), {card: '88%', tablet: '48%'});
    /* Round 6: Through the trip is pinned. The page's scroll steps through the four moments; the stage bar marks the
       one you are on (dot filled and ringed, label lit) and the screens below move with it. */
    const bar = $('#section-3 .rc-stages'), scr = $('#section-3 .rc-screens');
    if (bar && scr) {
      const stops = [...bar.children].filter(e => e.tagName === 'DIV');
      const dots = scr.nextElementSibling && scr.nextElementSibling.classList.contains('ad-dots') ? scr.nextElementSibling : null;
      // Round 10: the context lines (London · dates · party, and AIyelet matching) stay on screen with the bar
      A.pin([$('#section-3 .rc-context'), bar, scr, dots], {steps: stops.length, per: .5, className: 'ad-rc-pin',
        onProgress: p => { scr.scrollLeft = p * (scr.scrollWidth - scr.clientWidth); },
        onStep: i => stops.forEach((d, k) => { d.classList.toggle('ad-on', k === i); d.classList.toggle('ad-past', k < i); })});
      bar.classList.add('ad-stops');
    }
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Trip ticket on phones: rises over the hero copy and opens to the screen edges (see otas.css "Trip ticket on phones").
   --ys-open goes 0 → 1 while the ticket's top travels from the bottom of the screen to 45% up it. The copy behind
   steps back (down to 94%, dimmer) by how much of it the ticket covers. The photo labels keep only their word. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const t = document.querySelector('#section-1 .ys-ticket'), c = document.querySelector('#section-1 .ys-copy'); if (!t || !c) return;
  document.querySelectorAll('#section-1 .ys-photo > span').forEach(s => {
    if (!s.dataset.full) s.dataset.full = s.textContent;
    const word = s.dataset.full.replace(/[^A-Za-z]+/g, ' ').trim();
    s.textContent = A.MQ.mobile.matches ? word : s.dataset.full;
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  const paint = () => {
    raf = 0;
    if (!A.MQ.mobile.matches || reduced.matches) { t.style.removeProperty('--ys-open'); c.style.removeProperty('scale'); c.style.removeProperty('filter'); return; }
    const tr = t.getBoundingClientRect(), cr = c.getBoundingClientRect(), h = innerHeight;
    const open = Math.max(0, Math.min(1, (h - tr.top) / (h * 0.55)));
    t.style.setProperty('--ys-open', open.toFixed(3));
    const cov = Math.max(0, Math.min(1, (cr.bottom - tr.top) / cr.height));
    c.style.setProperty('scale', String(1 - cov * 0.06));
    c.style.setProperty('filter', `brightness(${1 - cov * 0.5})`);
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask); A.MQ.mobile.addEventListener('change', ask); ask();
})();
