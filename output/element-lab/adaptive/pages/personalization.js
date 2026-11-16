/* AIyelet · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1 · Hero lives in its own document: tighten it there and size the section to its content. */
  const hero = $('#section-1'), fr = hero && $('iframe', hero);
  const CSS = `@media(max-width:599px){
    main{padding:88px 24px 28px!important;min-height:0!important}
    html,body{min-height:0!important}
    h1{font-size:34px!important;line-height:1.12!important;text-wrap:balance}
    .copy p{margin-top:16px!important;font-size:15px!important;line-height:24px!important;text-wrap:pretty}
    .copy button{min-height:40px!important;height:40px!important;font-size:15px!important;padding:0 16px!important;border-radius:10px!important}
    .scene{margin-top:28px!important}}`;
  const tune = () => {
    let d; try { d = fr.contentDocument; } catch (e) { return; }
    if (!d || !d.head) return;
    if (!d.getElementById('ad-hero')) { const s = d.createElement('style'); s.id = 'ad-hero'; s.textContent = CSS; d.head.appendChild(s); }
    hero.style.height = '';
    if (A.MQ.mobile.matches) {
      const m = d.querySelector('main');
      setTimeout(() => { hero.style.setProperty('height', Math.ceil(m.getBoundingClientRect().height) + 'px', 'important'); hero.style.setProperty('min-height', '0', 'important'); }, 80);
    }
  };
  if (fr) { fr.addEventListener('load', tune); tune(); addEventListener('resize', tune); }

  /* 3 · Matching: intro folds; the traveler context reads as a 2×2 grid; the card photos are shorter. */
  A.fold($('#section-3 .match-head > p'), 3);

  /* 4 · Where it runs: intro folds; the product preview fits 420px under its switch. */
  A.fold($('#section-4 .embed-heading > p'), 3);
  A.zoomFit($('#section-4 .embed-browser'), 340);

  /* 5 · A full day: intro folds; the three stops scroll sideways. */
  A.fold($('#day-itinerary > header > p'), 3);
  const plan = $('#day-itinerary .day-plan');
  if (plan) {
    const stops = $$('.day-stop', plan);
    if (stops.length) {
      const track = document.createElement('div'); track.className = 'ad-day-track';
      stops[0].before(track); stops.forEach(s => track.append(s));
      /* The three stops are a sequence (morning, afternoon, evening): they stack as a list, no sideways scroll. */
    }
  }
})();
