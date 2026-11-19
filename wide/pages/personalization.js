/* AIyelet page hero on tablets and small desktops (17 Nov 2026; reworked 18 Nov 2026 after the owner's review).
   The hero is its own page (personalization-ai-hero.html) in an iframe, authored as a 1600x900 landscape stage. Up to
   1250px that page stacks itself, but with the visual first (order -1) at its full 790px, so on a tablet or a
   1024-1250 screen the mockup came before the heading, too large, and cut at the right edge. From 600 to 1250 the
   hero now follows the other pages: heading, text and buttons on the content line, then the AIyelet frame under them
   (64), its left and right edges on the content line (the same margin both sides).
   The decision is taken on the outer window, never the iframe's own size: the outer page sets the iframe's height from
   its content, so an iframe on a landscape screen measured as "upright" (18 Nov 2026: the cause of the cut mockup).
   Runs in the outer page; reaches into the same-origin iframe. Above 1250 and on phones nothing is touched. */
(() => {
  const frame = document.querySelector('#section-1 iframe'); if (!frame) return;
  const on = () => innerWidth >= 600 && innerWidth <= 1250;
  const CSS = `
  html.bf-stacked body { overflow: hidden !important; }
  html.bf-stacked main { width: 100% !important; height: auto !important; min-height: 0 !important; transform: none !important;
    box-sizing: border-box !important; padding: 136px var(--bf-m, 32px) 40px !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; }
  html.bf-stacked .copy { order: 0 !important; position: relative !important; left: auto !important; top: auto !important; width: auto !important; max-width: calc((100% + 24px) * 7 / 8 - 24px) !important; }
  html.bf-stacked body main div.copy > h1:not(.bf-x) { font-size: clamp(48px, 5.5vw, 56px) !important; letter-spacing: -.025em !important; margin-bottom: 32px !important; }
  html.bf-stacked body main .copy p { font-size: 16px !important; line-height: 1.55 !important; }
  html.bf-stacked .scene { order: 1 !important; position: relative !important; left: auto !important; top: auto !important; width: 790px !important; height: calc(730px * var(--bf-k, 1)) !important; margin: 64px 0 0 !important; transform: scale(var(--bf-k, 1)) !important; transform-origin: top left !important; flex: none !important; }
  html.bf-stacked .copy button { min-height: 52px !important; }   /* the approved tablet/desktop button height (step 6.1); these buttons live inside the frame page */
  html.bf-stacked .ai-frame { scale: 1 !important; transform: none !important; }   /* square to the content line: no tilt, no inset */`;
  const apply = () => {
    let d; try { d = frame.contentDocument; } catch (e) { return; }
    if (!d || !d.head || !d.querySelector('main')) return;
    if (!d.getElementById('bf-tablet-hero')) { const st = d.createElement('style'); st.id = 'bf-tablet-hero'; st.textContent = CSS; d.head.appendChild(st); }
    const fit = () => {
      const scene = d.querySelector('.scene'), main = d.querySelector('main'); if (!scene || !main) return;
      d.documentElement.classList.toggle('bf-stacked', on());
      if (!on()) return;
      const W = innerWidth;
      const m = W <= 1023 ? 32 : Math.max(Math.min(Math.max(40, .04 * W), 64), (W - 1560) / 2);
      main.style.setProperty('--bf-m', m + 'px');
      const k = (W - 2 * m) / 790;   // the frame runs exactly from the left content line to the right one (owner, 18 Nov 2026)
      main.style.setProperty('--bf-k', k);   // read by the stylesheet above (!important), so the frame page's own resize script cannot rescale it
    };
    fit(); addEventListener('resize', fit); setTimeout(fit, 300);
  };
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') apply();
  frame.addEventListener('load', apply);
})();
