/* Travel technology · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .te-intro > p'), 3);
    A.fold($('#section-2 .th-intro > p'), 3);

    A.scroller($('#section-3 .ad-columns'), {card: '88%'});
  }
  /* Choose how: one whole card at a time behind a switch on phones. */
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Round 11 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  /* Hero, as OTAs, White-Label and Loyalty: the copy stays and steps back; the demo rises over it at its own size,
     then the page goes on. */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rise = (copy, demo) => {
    if (!copy || !demo) return;
    for (let a = copy.parentElement; a && a !== document.body; a = a.parentElement) {
      const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important'); }
    let raf = 0;
    const paint = () => { raf = 0;
      if (reduced.matches) { copy.style.removeProperty('scale'); copy.style.removeProperty('filter'); return; }
      const c = copy.getBoundingClientRect(), d = demo.getBoundingClientRect(), cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      copy.style.setProperty('scale', String(1 - cov * .06)); copy.style.setProperty('filter', `brightness(${1 - cov * .5})`); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();
  };

  // the eyebrow and the heading hold together
  const eb = $('#section-1 .te-eyebrow'), hd = $('#section-1 .te-heading');
  if (eb && hd) { const box = document.createElement('div'); box.className = 'ad-te-copy'; eb.before(box); box.append(eb, hd); rise(box, $('#section-1 .te-visual')); }
})();

/* Round 13 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* Headings: the moving accent sits only on the words the user chose ("platform you're building", "your product").
     Same words, same order; only the span moves. */
  const accent = (h, words) => {
    if (!h || !h.textContent.includes(words)) return;
    h.querySelectorAll('span').forEach(s => s.replaceWith(...s.childNodes));
    h.normalize();
    const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const i = n.data.indexOf(words); if (i < 0) continue;
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + words.length);
      const s = document.createElement('span'); s.className = 'brand-coral-ink ad-ink'; r.surroundContents(s); break;
    }
  };
  accent($('#te-title'), "platform you're building");
  accent($('#ad-title'), 'your product');

  /* How do I avoid integrating: the copy holds once the eyebrow reaches the top; the comparison rises over it
     (as in the hero). Inside, the two ways are one switch with the chosen way's points under it; the page's
     scroll moves the stage from one to the other (Round 14 below). */
  const eb = $('#section-2 .th-eyebrow'), hd = $('#th-title'), intro = $('#section-2 .th-intro'), ti = $('#section-2 .ti');
  if (eb && hd && intro && ti) {
    const box = document.createElement('div'); box.className = 'ad-th-copy'; eb.before(box); box.append(eb, hd, intro);
    for (let a = box.parentElement; a && a !== document.body; a = a.parentElement) {
      const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important'); }
    let raf = 0;
    const paint = () => { raf = 0;
      if (reduced.matches) { box.style.removeProperty('scale'); box.style.removeProperty('opacity'); return; }
      const c = box.getBoundingClientRect(), d = ti.getBoundingClientRect(), cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      box.style.setProperty('scale', String(1 - cov * .06)); box.style.setProperty('opacity', String(1 - cov * .6)); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();

    const copy = $('.ti-copy', ti), opts = $$('.ti-opt', ti);
    const fitList = () => copy && copy.style.setProperty('--ad-list-h', Math.max(...opts.map(b => { const u = $('ul', b); return u ? u.offsetHeight : 0; })) + 'px');
    fitList(); addEventListener('resize', fitList); if (document.fonts) document.fonts.ready.then(fitList);

    /* Round 14: the comparison opens as it rises. It starts inside the margins and grows until it fills the
       screen edge to edge (the light ground is gone); then it holds, and the next stretch of scroll turns
       "Integrating suppliers yourself" into "With Bridgify". Scrolling back turns it back; a tap still works. */
    if (!reduced.matches) {
      const hold = document.createElement('div'); hold.className = 'ad-ti-hold ad-hold-space'; ti.classList.add('ad-bleed'); hold.setAttribute('aria-hidden', 'true'); ti.after(hold);
      const press = to => { const b = opts.find(x => x.dataset.to === to); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); };
      press('diy');                                                    // the reader meets the problem first
      const clamp = x => Math.max(0, Math.min(1, x));
      let side = 'diy', raf2 = 0;
      const step = () => { raf2 = 0;
        const H = innerHeight, top = parseFloat(getComputedStyle(ti).top) || 0, r = ti.getBoundingClientRect();
        const open = clamp(1 - (r.top - top) / (H * .55));               // 0 as it enters, 1 when it reaches the header
        // the stage really widens (its side margins shrink to 0), so the page's own script re-measures its map
        ti.style.setProperty('--ad-ti-open', open.toFixed(3));
        const held = clamp((H - hold.getBoundingClientRect().top) / hold.offsetHeight);  // how far into the hold
        const want = held > .3 ? 'bridgify' : 'diy';
        if (want !== side) { side = want; press(want); }
      };
      addEventListener('scroll', () => { if (!raf2) raf2 = requestAnimationFrame(step); }, {passive: true});
      addEventListener('resize', step); step();
    }
  }

  /* Add experience discovery: the three products line up row by row (title, words, label, preview) whatever
     their length; the network ends in the Experiences API with its own link under it, and the AIyelet line
     and its button close the section on their own. */
  const net = $('#section-3 .ad-network'), foot = $('#section-3 .ad-foot');
  const link = foot && $$('a', foot).find(a => /Experiences API/.test(a.textContent));
  if (net && link) { link.classList.add('ad-net-link'); link.dataset.bfRole = 'link'; net.append(link); }
})();

/* Round 15 (17 Nov 2026), phones: Add experience discovery. The three products are stations (MOBILE-RULES M4): once
   the cards' titles reach the top, the page's scroll carries the row sideways through all three, then goes on down. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches || !A.pin) return;
  const row = document.querySelector('#section-3 .ad-columns'); if (!row) return;
  const dots = row.nextElementSibling && row.nextElementSibling.classList.contains('ad-dots') ? row.nextElementSibling : null;
  const n = row.children.length;
  A.pin([row, dots], {steps: n, per: .6, className: 'ad-ac-pin', onProgress: p => { row.scrollLeft = p * (row.scrollWidth - row.clientWidth); }});
})();
