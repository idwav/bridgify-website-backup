/* API · #network: raw supplier feeds → one Bridgify object → one bookable experience.
   Ported from output/element-lab/normalize.js (variant A, approved 14 Nov 2026). Illustrative data only (no real supplier names). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MARK = 'assets/bridgify-icon.svg';

  // Five raw supplier payloads for the same experience. [key, value, inconsistent?]
  const RAW = [
    [['tour_name', '"COLOSSEUM TICKET"', 1], ['price', '"39.00 EUR"', 1], ['city', '"Roma"', 1], ['dur', '"1h"', 0]],
    [['title', '"Colosseum – entry"', 0], ['amount', '3900', 1], ['location', '"Rome, IT"', 0], ['duration_min', '60', 0]],
    [['productName', '"Colosseo ticket"', 1], ['priceFrom', '"€39"', 1], ['geo', '"41.89,12.49"', 1], ['freeCancel', '"24 hours"', 0]],
    [['name', '"Colosseum Entry"', 0], ['cost', '"39"', 1], ['destination', '"ROM"', 1], ['cxl', '"1 day"', 1]],
    [['activity', '"Kolosseum Eintritt"', 1], ['rate', '"39,00"', 1], ['town', '"Rom"', 1], ['hours', '1', 0]]
  ];
  const LETTERS = 'ABCDE';
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const rawCard = (i, pos) => {
    const lines = RAW[i].map(([k, v, odd], n, a) =>
      `  <span class="k">"${k}"</span>: <span class="${odd ? 'odd' : ''}">${esc(v)}</span>${n < a.length - 1 ? ',' : ''}`).join('\n');
    return `<div class="nz-raw" style="--i:${i};--x:${pos.d[0]}%;--y:${pos.d[1]}%;--mx:${pos.m[0]}%;--my:${pos.m[1]}%;--r:${pos.r}deg">
      <span class="nz-raw-label">Supplier ${LETTERS[i]}</span><pre>{\n${lines}\n}</pre></div>`;
  };
  const deck = (shift = 0, mshift = 0) => [
    {d: [3, 15], m: [4, 8], r: -4}, {d: [35, 10], m: [34, 24], r: 2.5}, {d: [66, 17], m: [6, 40], r: -2},
    {d: [13, 55], m: [32, 56], r: 3}, {d: [52, 57], m: [10, 72], r: -3}
  ].map((p, i) => rawCard(i, {d: [p.d[0], p.d[1] + shift], m: [p.m[0], p.m[1] + mshift], r: p.r})).join('');

  const CLEAN = [
    ['id', '"exp_rome_colosseum"'], ['title', '"Colosseum entry"'], ['category', '"Attraction"'],
    ['location', '{ "city": "Rome", "country": "IT" }'], ['price', '{ "amount": 39.00, "currency": "EUR" }'],
    ['duration', '"PT1H"'], ['cancellation', '"free_24h"'], ['availability', '"live"']
  ];
  const cleanCard = () => `<div class="nz-clean">
    <div class="nz-clean-head"><img src="${MARK}" alt="">Bridgify · one schema<em>5 listings → 1</em></div>
    <pre>{\n${CLEAN.map(([k, v], n) => `  <span class="k">"${k}"</span>: ${esc(v)}${n < CLEAN.length - 1 ? ',' : ''}`).join('\n')}\n}</pre>
    <div class="nz-clean-foot"><span class="nz-chip">Ready to book</span><span class="nz-chip">Live availability</span></div>
  </div>`;

  const inView = (el, on, off) => new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? on() : off && off()), {threshold: .35}).observe(el);

  /* ---------- A: before / after slider ---------- */
  document.querySelectorAll('[data-nz="slider"]').forEach(stage => {
    stage.innerHTML = `
      <div class="nz-ba-layer nz-before"><span class="nz-ba-tag">Before · 5 supplier feeds</span>${deck()}</div>
      <div class="nz-ba-layer nz-after"><span class="nz-ba-tag">After · 1 Bridgify object</span>${cleanCard()}
        <div class="nz-book nz-ba-book" aria-hidden="true">
          <div class="nz-book-bar">YourBrand<span>Experiences</span></div>
          <img src="assets/hero-experiences/colosseum.jpg" alt="">
          <div class="nz-book-body"><small>Attraction · Rome</small><h5>Colosseum entry</h5><p>1 hour · Free cancellation up to 24h</p>
            <div class="nz-book-buy"><strong>€39 <small>per person</small></strong><span>Book now</span></div></div>
        </div></div>
      <div class="nz-ba-handle"><span class="nz-ba-knob" aria-hidden="true">‹ ›</span></div>
      <input class="nz-ba-range" type="range" min="0" max="100" value="50" aria-label="Compare raw supplier data with the normalized Bridgify object">`;
    const range = stage.querySelector('input');
    const set = v => { stage.style.setProperty('--pos', v + '%'); range.value = v; };
    let hintRaf = 0, hinted = false;
    const stopHint = () => { cancelAnimationFrame(hintRaf); hintRaf = 0; };
    const ready = () => stage.classList.add('is-ready');
    range.addEventListener('input', () => { stopHint(); set(+range.value); if (+range.value < 60) ready(); });
    const hint = () => {
      if (reduce) { set(34); ready(); return; }
      stopHint(); stage.classList.remove('is-ready');
      const keys = [[0, 50], [700, 74], [1500, 22], [2300, 34]], t0 = performance.now();
      const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const tick = now => {
        const t = Math.max(0, now - t0);
        const k = Math.max(1, keys.findIndex(([at]) => at > t));
        if (t >= keys[keys.length - 1][0]) { set(34); ready(); hintRaf = 0; return; }
        const [a, va] = keys[k - 1], [b, vb] = keys[k];
        set(va + (vb - va) * ease((t - a) / (b - a)));
        hintRaf = requestAnimationFrame(tick);
      };
      hintRaf = requestAnimationFrame(tick);
    };
    inView(stage, () => { if (!hinted) { hinted = true; setTimeout(hint, 300); } });
    stage.closest('.nz-wrap')?.querySelector('[data-nz-replay]')?.addEventListener('click', hint);
  });

})();
