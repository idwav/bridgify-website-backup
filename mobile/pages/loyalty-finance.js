/* Loyalty and finance · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (A.MQ.mobile.matches) {
    A.fold($('#section-1 .lf-heading > div > p'), 3);
    $$('#section-2 .lp-copy > p').forEach(p => A.fold(p, 3));
    A.scroller($('#section-2 .lp-demo'), {card: '88%'});
    $$('#section-3 .lu-explanation p').forEach(p => A.fold(p, 3));
    A.fold($('#we-started-here > header > p'), 3);
  }
  /* Choose how: the two product cards stack as on the homepage (patterns.js "Product cards as a stack"). */
})();

/* Round 11 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clip = el => { for (let a = el && el.parentElement; a && a !== document.body; a = a.parentElement) {
    const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important'); } };
  /* Hero, as OTAs and White-Label: the copy stays and steps back; the rewards demo rises over it, then the page goes on. */
  const copy = $('#section-1 .lf-heading'), demo = $('#section-1 .lr-demo');
  if (copy && demo) {
    clip(copy); let raf = 0;
    const paint = () => { raf = 0;
      if (reduced.matches) { copy.style.removeProperty('scale'); copy.style.removeProperty('filter'); return; }
      const c = copy.getBoundingClientRect(), d = demo.getBoundingClientRect(), cov = Math.max(0, Math.min(1, (c.bottom - d.top) / c.height));
      copy.style.setProperty('scale', String(1 - cov * .06)); copy.style.setProperty('filter', `brightness(${1 - cov * .5})`); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, {passive: true}); paint();
  }
  /* The redemption problem: points leave the ledger and become a reward. The two cards are a sequence, so the page's
     scroll carries the reader from one to the other (pinned), instead of a sideways swipe. */
  const lp = $('#section-2 .lp-demo');
  if (lp) { const dots = lp.nextElementSibling && lp.nextElementSibling.classList.contains('ad-dots') ? lp.nextElementSibling : null;
    A.pin([lp, dots], {steps: 2, per: .55, className: 'ad-lp-pin', onProgress: p => { lp.scrollLeft = p * (lp.scrollWidth - lp.clientWidth); }}); }
})();

/* Round 20 (17 Nov 2026), phones */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* Hero: as the rewards card arrives, the points fill. The balance counts up to 84,000 and the "pay with points"
     slider runs from cash to points (the page's own slider, so "12,000 pts" and "72,000 pts left" follow it). */
  const demo = $('#section-1 .lr-demo'), bal = $('#section-1 .lr-balance strong'), share = $('#lr-share');
  if (demo && bal && share && !reduced.matches) {
    const txt = [...bal.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.data));
    const target = txt ? parseInt(txt.data.replace(/\D/g, ''), 10) : 0, end = +share.value || 100;
    const set = k => {
      if (txt) txt.data = (Math.round(target * k / 100) * 100).toLocaleString('en-US') + ' ';
      share.value = String(Math.round(end * Math.max(0, (k - .25) / .75) / 5) * 5); share.dispatchEvent(new Event('input', {bubbles: true}));
    };
    set(0); let done = false;
    const go = () => { if (done) return; const r = demo.getBoundingClientRect(); if (r.top > innerHeight * .7) return; done = true;
      const t0 = performance.now(), D = 1600, ease = x => 1 - Math.pow(1 - x, 3);
      const f = now => { const k = Math.min(1, (now - t0) / D); set(ease(k)); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
    addEventListener('scroll', go, {passive: true}); setTimeout(go, 600);
  }

  /* Experiences for cardholders: the three choices sit together, the preview directly under them (so a tap shows
     the preview change on the same screen), and the chosen case's explanation follows the preview. */
  const panels = $('#section-3 .lu-panels'), choices = $$('#section-3 .lu-choice');
  if (panels && choices.length) {
    const box = document.createElement('div'); box.className = 'ad-lu-exp'; panels.after(box);
    // the page's own tab script looks for an explanation inside each choice: an empty stand-in stays there
    const exps = choices.map(c => { const e = $('.lu-explanation', c); if (e) { const k = document.createElement('div'); k.className = 'lu-explanation ad-stand-in'; k.hidden = true; e.before(k); box.append(e); } return e; });
    const sync = () => choices.forEach((c, i) => exps[i] && exps[i].classList.toggle('ad-on', c.classList.contains('is-active')));
    sync(); choices.forEach(c => new MutationObserver(sync).observe(c, {attributes: true, attributeFilter: ['class']}));
  }
})();
