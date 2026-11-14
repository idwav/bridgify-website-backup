/* API · What's inside (#whats-inside): categories cycle on their own while visible; a click picks one and stops the cycle.
   Ported from output/element-lab (approved 14 Nov 2026). Results are illustrative. */
(() => {
  const box = document.querySelector('#whats-inside [data-explorer]'); if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = box) => r.querySelector(s), $$ = (s, r = box) => [...r.querySelectorAll(s)];
  const ICON = {
    flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
    spark: '<path d="M12 3l1.7 4.6L18.3 9l-4.6 1.7L12 15.3l-1.7-4.6L5.7 9l4.6-1.4z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
    store: '<path d="M3 9.5 4.6 4h14.8L21 9.5M4.5 9.5V20h15V9.5M3 9.5h18M9.5 20v-5h5v5"/>'
  };
  const CATS = [
    ['tours_activities', [['food-tour', 'Rome', 'Rome food tour', '€65'], ['alps', 'Zermatt', 'Alpine day hike', '€54'], ['santorini', 'Santorini', 'Santorini sunset sail', '€48']]],
    ['attraction_tickets', [['colosseum', 'Rome', 'Colosseum entry', '€39'], ['louvre', 'Paris', 'Louvre timed entry', '€22'], ['london-eye', 'London', 'London Eye', '€36']]],
    ['live_events', [['concert', 'London', 'Live concert', '€79'], ['#flag', 'Madrid', 'Football match tickets', '€60'], ['#spark', 'Paris', 'Cabaret evening show', '€110']]],
    ['vouchers_gift_cards', [['#card', 'Anywhere', 'Experience gift card', 'from €50'], ['#heart', 'Barcelona', 'Spa day voucher', '€120'], ['#store', 'Lisbon', 'Dining voucher', '€80']]],
    ['guided_experiences', [['florence', 'From Rome', 'Day trip to Florence', '€29'], ['eiffel', 'Paris', 'Eiffel Tower guided summit', '€42'], ['seine-dinner', 'Paris', 'Seine dinner cruise', '€95']]]
  ];
  const tabs = $$('[data-cat]'), cards = $$('.ex-card'), call = $('.ex-call b');
  let cur = 0, swap = 0, timer = 0, playing = !reduce, visible = false;
  const fill = i => {
    call.textContent = `category=${CATS[i][0]}`;
    CATS[i][1].forEach(([img, city, name, price], j) => {
      const c = cards[j];
      $('.ex-img', c).innerHTML = img[0] === '#'
        ? `<svg class="ex-ico" viewBox="0 0 24 24" aria-hidden="true">${ICON[img.slice(1)]}</svg>`
        : `<img src="assets/hero-experiences/${img}.jpg" alt="">`;
      $('small', c).textContent = city; $('b', c).textContent = name; $('em', c).textContent = price;
    });
  };
  const set = i => {
    if (i === cur) return; cur = i;
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
    clearTimeout(swap); box.classList.add('is-swap');
    swap = setTimeout(() => { fill(i); box.classList.remove('is-swap'); }, reduce ? 0 : 360);
  };
  const run = () => {
    clearInterval(timer); timer = 0;
    if (playing && visible && !reduce && !document.hidden) timer = setInterval(() => set((cur + 1) % CATS.length), 3400);
  };
  const pauseBtn = box.parentElement.querySelector('.ex-controls [data-pause]');
  const setPlaying = p => {
    playing = p;
    if (pauseBtn) { pauseBtn.textContent = p ? 'Pause Ⅱ' : 'Play ▶'; pauseBtn.setAttribute('aria-pressed', String(!p)); }
    run();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => { setPlaying(false); set(i); }));
  $('.ex-cats').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement), s = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}[e.key];
    if (i < 0 || !s) return;
    e.preventDefault(); const n = (i + s + tabs.length) % tabs.length; tabs[n].focus(); setPlaying(false); set(n);
  });
  if (pauseBtn) { if (reduce) pauseBtn.hidden = true; pauseBtn.addEventListener('click', () => setPlaying(!playing)); }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; run(); }, {threshold: .25}).observe(box);
  document.addEventListener('visibilitychange', run);
})();
