/* Airlines · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .aj-intro > p'), 3);
    const j = $('#section-1 .aj-journey'), line = j && j.querySelector(':scope > svg');
    if (line) { line.classList.add('ad-aj-line'); j.after(line); }   // the connector is decoration; it must not count as a card
    A.scroller(j, {card: '86%'});
    /* Round 6: the trip is pinned and the page's scroll carries the reader from one moment to the next
       (flight confirmed → discover → booked), sideways, as on desktop's journey. */
    if (j) A.pin([j, j.nextElementSibling && j.nextElementSibling.classList.contains('ad-dots') ? j.nextElementSibling : null],
      {steps: j.children.length, per: .45, onProgress: p => { j.scrollLeft = p * (j.scrollWidth - j.clientWidth); }});
    A.fold($('#section-2 .ar-heading > p'), 4);
    A.scroller($('#section-2 .ar-layout'), {card: '90%'});
    A.fold($('#section-3 .al-loyalty > p'), 2);
    /* Round 6: Passenger journey as on desktop: the phone leads and stays on screen; the four touchpoints run above it
       and the page's scroll moves from one to the next, the phone showing each in turn. */
    const tp = $('#section-3 .al-touchpoints'), ph = $('#section-3 .al-phone');
    if (tp && ph) {
      const tabs = [...tp.querySelectorAll('button')];
      A.pin([tp, ph], {steps: tabs.length, per: .5, className: 'ad-jp-pin', onStep: i => {
        tabs[i].click();
        const c = tabs[i]; tp.scrollTo({left: c.offsetLeft - tp.offsetLeft - (tp.clientWidth - c.offsetWidth) / 2, behavior: 'smooth'});
      }});
    }
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();
