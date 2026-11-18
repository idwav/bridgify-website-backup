/* AIyelet · mobile (≤599): one section ≈ one screen. Folding, not removing. */
(() => {
  const A = window.BridgifyAdaptive; if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1 · Hero lives in its own document (an iframe). Round 9 (17 Nov 2026): on phones the frame is exactly as tall as
     its content and never scrolls by itself, so a swipe on it scrolls the page (it used to scroll inside the frame,
     a box inside the section). The eyebrow starts where every other hero's does (the section's own top padding; the
     frame adds none). Scrolling, the copy stays and fades back while the finder rises over it and grows a little,
     edge to edge, so its request reads larger; then the page goes on. */
  const hero = $('#section-1'), fr = hero && $('iframe', hero);
  const CSS = `@media(max-width:599px){
    html,body{min-height:0!important;height:auto!important;overflow:hidden!important;background:transparent!important}
    .scene:not(#ad-x){width:auto!important;height:auto!important;max-width:none!important;transform:none!important}
    main:not(#ad-x){transform:none!important}
    .scene .panel.ai-frame:not(#ad-x){position:relative!important;inset:auto!important;left:auto!important;top:auto!important;width:100%!important;height:auto!important;min-height:0!important;transform:none!important;box-sizing:border-box}
    .scene .frame-content{height:auto!important;min-height:0!important}
    .scene .result-grid{grid-template-columns:1fr 1fr!important;gap:10px!important}
    .scene .prompt:not(#ad-x){display:flex!important;flex-wrap:wrap!important;align-items:center;white-space:normal!important;height:auto!important;min-height:0!important;gap:10px 6px;padding-block:12px!important}
    .scene .prompt #typed-request{flex:1 1 calc(100% - 24px);white-space:normal!important;overflow-wrap:anywhere}
    .scene .prompt .search-action{position:static!important;margin-left:auto!important;transform:none!important}
    .scene .detected{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
    .scene .result-grid article{min-width:0!important}
    main{padding:0 24px 0!important;min-height:0!important;height:auto!important}
    html body .copy h1:not(#ad-x),html body .copy h1:not(#ad-x) em{font-size:28px!important;line-height:1.15!important;font-weight:400!important;letter-spacing:-.7px!important;text-wrap:balance}
    .copy .eyebrow{margin:0 0 16px!important}
    .copy h1{margin:0!important}
    .copy p{margin:24px 0 0!important;font-size:15px!important;line-height:24px!important;text-wrap:pretty}
    .copy button{margin-top:32px!important;vertical-align:top}
    .copy button{min-height:40px!important;height:40px!important;font-size:15px!important;padding:0 16px!important;border-radius:10px!important}
    .copy{position:relative;z-index:0;transform-origin:50% 0;will-change:transform,opacity}
    /* (17 Nov) one primary action, as on every other hero: "Try it" filled in the brand coral, "Talk to us" outlined */
    .copy button:not(.alt):not(#ad-x){background:linear-gradient(110deg,#ff9862,#f46649)!important;color:#180f10!important;border-color:transparent!important;box-shadow:0 6px 18px #f4664940!important;font-weight:600!important}
    .scene{margin-top:48px!important;position:relative;z-index:1;transform-origin:50% 100%;will-change:transform}
    /* Round 19 (17 Nov 2026): the hero is now a chat (product-skin-ai.css). Built for a fixed desktop panel, it was
       381px wide in a 323px frame with desktop type. On phones it fits the frame, reads at 14px and grows with its
       messages (no box that scrolls inside); the two matches stack as rows of photo and words. */
    .chat-mode:not(#ad-x),.ai-split:not(#ad-x){display:block!important;height:auto!important;overflow:visible!important}
    .ai-chat:not(#ad-x){width:100%!important;max-width:none!important;min-width:0!important;height:auto!important;margin:0!important}
    .chat-head:not(#ad-x){padding:12px 16px!important;gap:12px!important}
    .chat-head>span:not(#ad-x){width:34px!important;height:34px!important;font-size:17px!important;border-radius:10px!important}
    .chat-head b:not(#ad-x){font-size:15px!important}.chat-head small:not(#ad-x){font-size:12px!important}
    .chat-thread:not(#ad-x){display:grid!important;grid-template-columns:minmax(0,1fr);align-items:start;height:auto!important;overflow:visible!important;gap:8px!important;padding:12px 16px!important}
    .chat-thread>.msg.bot:not(#ad-x){justify-self:start}.chat-thread>.msg.user:not(#ad-x){justify-self:end}
    /* "Finding experiences" and the results take turns in one place, so the chat never changes height */
    .chat-thread>.m-think:not(#ad-x),.chat-thread>.m-results:not(#ad-x){grid-row:4;grid-column:1}
    .chat-thread:has(.m-results.show)>.m-think:not(#ad-x){display:flex!important;visibility:hidden}
    .msg:not(#ad-x){max-width:88%!important;padding:10px 14px!important;font-size:14px!important;line-height:1.4!important;border-radius:14px}
    .m-chips:not(#ad-x){display:block!important}.m-chips small:not(#ad-x){display:block;margin:0 0 8px!important;font-size:11px!important}
    .chat-chips:not(#ad-x){display:flex!important;flex-wrap:wrap!important;gap:6px!important}
    .chat-chips span:not(#ad-x){padding:5px 10px!important;font-size:13px!important}.chat-chips i:not(#ad-x){font-size:10px!important}
    .m-think:not(#ad-x){min-width:0!important;gap:12px!important}.m-think .loading-ring:not(#ad-x){width:36px!important;height:36px!important;font-size:18px!important}
    .m-think strong:not(#ad-x){font-size:14px!important}.m-think small:not(#ad-x){font-size:12px!important}
    .m-results:not(#ad-x){width:100%!important;max-width:100%!important;box-sizing:border-box}.m-results>strong:not(#ad-x){font-size:14px!important;margin:0 0 8px!important}
    .chat-cards:not(#ad-x){display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
    .chat-cards article:not(#ad-x){display:flex!important;align-items:center;gap:12px;padding:8px!important;min-width:0}
    .chat-cards article img:not(#ad-x){width:56px!important;height:56px!important;flex:none;object-fit:cover;border-radius:8px}
    .chat-cards article div:not(#ad-x){display:grid;gap:2px;min-width:0}
    .chat-cards article small:not(#ad-x){font-size:10px!important;line-height:1.2!important}.chat-cards article b:not(#ad-x){font-size:14px!important;line-height:1.25!important}
    .chat-composer:not(#ad-x){margin:4px 16px 16px!important;min-height:48px!important;padding:4px 4px 4px 16px!important;font-size:14px!important}
    .chat-composer .chat-send:not(#ad-x){width:40px!important;height:40px!important;min-width:40px!important;font-size:18px!important}}`;
  let doc = null, main = null, copyEl = null, scene = null;
  const fit = () => { if (!main || !fr) return; fr.style.setProperty('height', Math.ceil(main.getBoundingClientRect().height) + 'px', 'important'); };
  const tune = () => {
    let d; try { d = fr.contentDocument; } catch (e) { return; }
    if (!d || !d.head || !d.querySelector('main')) return;
    if (!d.getElementById('ad-hero')) { const s = d.createElement('style'); s.id = 'ad-hero'; s.textContent = CSS; d.head.appendChild(s); }
    doc = d; main = d.querySelector('main'); copyEl = d.querySelector('.copy'); scene = d.querySelector('.scene');
    fr.setAttribute('scrolling', 'no');
    hero.style.removeProperty('height');
    if (A.MQ.mobile.matches) {
      hero.style.setProperty('min-height', '0', 'important'); hero.style.setProperty('height', 'auto', 'important');
      fit(); if (window.ResizeObserver && !main.__adRO) { main.__adRO = new ResizeObserver(() => requestAnimationFrame(fit)); main.__adRO.observe(main);  /* next frame: resizing the frame inside the observer looped */ }
      paint();
    }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const paint = () => {
    if (!copyEl || !scene) return;
    if (!A.MQ.mobile.matches || reduced.matches) { copyEl.style.translate = ''; copyEl.style.scale = ''; copyEl.style.opacity = ''; scene.style.scale = ''; return; }
    const r = fr.getBoundingClientRect(), head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ad-header-h')) || 64;
    const run = Math.max(1, scene.offsetTop - copyEl.offsetTop);                // scroll it takes the finder to reach the copy's top
    const y = Math.max(0, Math.min(run, head + 12 - (r.top + copyEl.offsetTop)));  // how far the copy has been carried
    const p = y / run;
    copyEl.style.translate = `0 ${y}px`; copyEl.style.scale = String(1 - .06 * p);
    copyEl.style.opacity = String(1 - .9 * p);
    const w = scene.offsetWidth || 1, g = Math.min(1.14, (w + 48) / w);       // edge to edge: 24px each side
    scene.style.scale = String(1 + (g - 1) * p);   // `scale`, not `transform`: the frame's own fitAI() rewrites transform on resize
  };
  let raf = 0; addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }, {passive: true});
  if (fr) { fr.addEventListener('load', tune); tune(); addEventListener('resize', tune); }
  // the section's padding is set later by the spacing layer: measure again once the page is shown
  addEventListener('bf-shown', paint); addEventListener('load', () => setTimeout(paint, 300)); setTimeout(paint, 800);

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

/* Round 9–10: Match experiences. The title breaks as "Match experiences / to what travelers are / looking for".
   The workspace: what the traveler gave (context), then the AIyelet box, then the experience found; the AIyelet box
   is layered over the top of the photo card, covering most of its upper part. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const h = document.querySelector('#section-3 .match-head > h2');
  if (h && !h.querySelector('.ad-br'))
    h.innerHTML = h.innerHTML.replace(/Match experiences\s+to what\s*<br>\s*travelers are\s*/, 'Match experiences<br class="ad-br">to what travelers are<br class="ad-br">');
  const ws = document.querySelector('#section-3 .match-workspace'), eng = ws && ws.querySelector('.match-engine'), deck = ws && ws.querySelector('.match-deck');
  if (!eng || !deck) return;
  ws.classList.add('ad-match-stack');
  // Round 10: the AIyelet box sits between the two blocks and covers most of the top of the photo card under it
  const place = () => { deck.style.setProperty('margin-top', -Math.round(eng.offsetHeight - 12) + 'px', 'important'); };
  place(); addEventListener('resize', place); if (window.ResizeObserver) new ResizeObserver(place).observe(eng);
})();

/* Round 10 (17 Nov 2026) */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const $ = (q, r = document) => r.querySelector(q);
  /* Where it runs: "Without recommendations" shows your product alone, its trip photo filling the frame; "With
     AIyelet" makes the matched experience jump up over that photo, just under "Your brand". Same height both ways,
     so nothing below moves when it switches. */
  const br = $('#section-4 .embed-browser'), rec = br && $('.embed-recommendation', br);
  if (br && rec) {
    br.classList.add('ad-embed-over');
    // (17 Nov) the page now draws a browser bar above "Your brand": the card starts under whatever sits above it
    const nav = $('.embed-nav', br);
    const size = () => { br.style.setProperty('--ad-rec-h', rec.offsetHeight + 'px');
      if (nav) br.style.setProperty('--ad-nav-h', Math.round(nav.getBoundingClientRect().bottom - br.getBoundingClientRect().top) + 'px'); };
    size(); addEventListener('resize', size); if (window.ResizeObserver) new ResizeObserver(size).observe(rec);
  }
  /* A full day: your starting suggestion stays; "Your day in Paris" rises over it as you scroll, then the page goes on. */
  const start = $('#day-itinerary .day-start');
  if (start) for (let a = start.parentElement; a && a !== document.body; a = a.parentElement) {
    const c = getComputedStyle(a); if (/hidden|auto|scroll/.test(c.overflowX + c.overflowY)) a.style.setProperty('overflow', 'clip', 'important');
  }
})();
