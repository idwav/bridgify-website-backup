/* About · mobile (≤599): the friend's phone design stays (map, hub, mission scenes); this layer only adds the
   site-wide phone rules and folds the long paragraphs (Read more opens them). Folding, not removing (18 Nov 2026). */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  A.fold($('#top .ab-hero-copy > p'), 3);
  document.querySelectorAll('#our-story .ab-story-3 > p').forEach(p => A.fold(p, 3));
  A.fold($('#hbx .ab-hbx-p'), 3);
})();

/* Our mission on phones, option A (about-us.css): each diagram is held just under its chapter (--ab-lih = that
   chapter's height), and a card the next one covers steps back. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const s = document.querySelector('#story'); if (!s) return;
  const lis = [...s.querySelectorAll('.ab-chapters > li')], st = [...s.querySelectorAll('.ms > .ms-s')]; if (lis.length !== st.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  const paint = () => {
    raf = 0;
    const on = A.MQ.mobile.matches && !reduced.matches;
    /* the header hides while scrolling down and comes back on the way up: centre in the whole screen, but never above
       where the header ends when it shows (its height + its 8px offset), so a card never moves when the header does */
    const hd = document.querySelector('header.top'), head = (hd ? hd.offsetHeight : 52) + 8 + 8;
    lis.forEach((li, i) => {
      if (on) {
        st[i].style.setProperty('--ab-lih', li.offsetHeight + 'px'); const sh = st[i].offsetHeight + 'px'; li.style.setProperty('--ab-sh', sh); st[i].style.setProperty('--ab-sh', sh);
        /* centred in the screen: the card (chapter + diagram) gets equal space above and below */
        const card = li.offsetHeight + st[i].offsetHeight, ctop = Math.round(Math.max(head, (innerHeight - card) / 2)) + 'px';
        li.style.setProperty('--ab-ctop', ctop); st[i].style.setProperty('--ab-ctop', ctop);
      }
      else ['--ab-lih', '--ab-sh', '--ab-ctop'].forEach(k => { st[i].style.removeProperty(k); li.style.removeProperty(k); });
    });
    let n = 0;
    if (on) lis.forEach((li, i) => { if (li.getBoundingClientRect().top <= (parseFloat(getComputedStyle(li).top) || 0) + 40) n = i; });
    lis.forEach((li, i) => { const c = on && i < n; li.classList.toggle('ad-covered', c); st[i].classList.toggle('ad-covered', c); });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask); A.MQ.mobile.addEventListener('change', ask);
  ask();
})();
