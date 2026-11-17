/* Lab only · AIyelet page hero on tablets held upright (17 Nov 2026).
   The hero is its own page (personalization-ai-hero.html) in an iframe. It is authored as a 1600×900 landscape stage
   scaled to fit, so on a tall tablet it shrinks to a small strip in an empty screen. It already has a stacked layout
   for phones (≤700px: copy, then the AIyelet frame scaled to the width). Upright tablets get that stacked recipe,
   with the tablet rules: content line (32 tablet, the desktop margin on an iPad Pro), title clamp(48px, 5.5vw, 56px),
   body 16, 64 between copy and frame, the frame across the content width. Runs in the outer page; reaches into the
   same-origin iframe. Landscape and desktop are not touched. */
(() => {
  const frame = document.querySelector('#section-1 iframe'); if (!frame) return;
  const CSS = `
  @media (min-width: 600px) and (orientation: portrait) {
    body { overflow: hidden !important; }
    main { width: 100% !important; height: auto !important; min-height: 100vh !important; transform: none !important;
      box-sizing: border-box !important; padding: 136px var(--bf-m, 32px) 40px !important; display: flex !important; flex-direction: column !important; justify-content: center !important; }
    .copy { position: relative !important; left: auto !important; top: auto !important; width: auto !important; max-width: calc((100% + 24px) * 7 / 8 - 24px) !important; }
    html body main div.copy > h1:not(.bf-x) { font-size: clamp(48px, 5.5vw, 56px) !important; letter-spacing: -.025em !important; margin-bottom: 32px !important; }
    html body main .copy p { font-size: 16px !important; line-height: 1.55 !important; }
    .scene { position: relative !important; left: auto !important; top: auto !important; width: 790px !important; height: 730px; margin-top: 64px !important; transform-origin: top left !important; }
    .ai-frame { scale: .95; }
  }`;
  const apply = () => {
    let d, w; try { d = frame.contentDocument; w = frame.contentWindow; } catch (e) { return; }
    if (!d || !d.head || !d.querySelector('main')) return;
    if (!d.getElementById('bf-tablet-hero')) { const st = d.createElement('style'); st.id = 'bf-tablet-hero'; st.textContent = CSS; d.head.appendChild(st); }
    const fit = () => {
      const W = w.innerWidth, H = w.innerHeight, upright = W >= 600 && H > W;
      const scene = d.querySelector('.scene'), main = d.querySelector('main'); if (!scene || !main) return;
      if (!upright) { scene.style.removeProperty('transform'); return; }
      const m = W <= 1023 ? 32 : Math.max(Math.min(Math.max(40, .04 * W), 64), (W - 1560) / 2);
      main.style.setProperty('--bf-m', m + 'px');
      const k = (W - 2 * m) / 790;
      scene.style.setProperty('transform', `scale(${k})`, 'important'); scene.style.setProperty('height', (730 * k) + 'px', 'important');
    };
    fit(); w.addEventListener('resize', fit); setTimeout(fit, 300);
  };
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') apply();
  frame.addEventListener('load', apply);
})();
