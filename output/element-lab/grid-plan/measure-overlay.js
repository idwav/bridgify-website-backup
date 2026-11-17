/* Lab only · measurements overlay for the live viewer ("מידות").
   Draws every gap the spacing table sets, with its value in px: green = the table's value, amber = a documented
   exception, red = off. Also each section's top and bottom padding. Reads BridgifyRhythmWide.report() (rhythm-wide.js);
   needs the step 3 spacing on. Exposes window.BridgifyMeasure = {show, hide}. */
(() => {
  const KNOWN = new Set(['#sources content→foot', '#sources sub→content', '#opportunity-study more→text', '#audiences label→title']);
  let layer = null;
  const css = `
    .bfm-layer{position:absolute;left:0;top:0;width:100%;pointer-events:none;z-index:9000}
    .bfm-gap{position:absolute;border-left:2px solid var(--c);background:color-mix(in srgb,var(--c) 16%,transparent)}
    .bfm-gap b{position:absolute;left:6px;top:50%;transform:translateY(-50%);font:700 12px/1 -apple-system,system-ui,sans-serif;color:#100A08;background:var(--c);padding:3px 6px;border-radius:5px;white-space:nowrap;direction:ltr}
    .bfm-pad{position:absolute;background:repeating-linear-gradient(135deg,rgba(90,140,220,.22) 0 6px,transparent 6px 12px);border-top:1px dashed rgba(90,140,220,.9);border-bottom:1px dashed rgba(90,140,220,.9)}
    .bfm-pad b{position:absolute;right:8px;top:50%;transform:translateY(-50%);font:700 12px/1 -apple-system,system-ui,sans-serif;color:#fff;background:rgb(70,110,190);padding:3px 6px;border-radius:5px;direction:ltr}`;
  const show = () => {
    if (layer) layer.remove(); layer = null;
    const R = window.BridgifyRhythmWide; if (!R) return;
    if (!document.getElementById('bfm-style')) { const s = document.createElement('style'); s.id = 'bfm-style'; s.textContent = css; document.head.appendChild(s); }
    layer = document.createElement('div'); layer.className = 'bfm-layer'; layer.style.height = document.documentElement.scrollHeight + 'px';
    const y = scrollY, x = scrollX;
    // section padding (top and bottom), where the section is not a full-screen stage
    document.querySelectorAll('section').forEach(s => {
      if (s.parentElement.closest('section') || s.id === 'home') return;
      const r = s.getBoundingClientRect(), c = getComputedStyle(s), pt = parseFloat(c.paddingTop), pb = parseFloat(c.paddingBottom);
      if (r.height < 2) return;
      [[r.top, pt], [r.bottom - pb, pb]].forEach(([t, h]) => { if (h < 4) return;
        const d = document.createElement('div'); d.className = 'bfm-pad';
        Object.assign(d.style, { left: r.left + x + 'px', width: r.width + 'px', top: t + y + 'px', height: h + 'px' });
        d.innerHTML = `<b>section ${Math.round(h)}</b>`; layer.appendChild(d); });
    });
    // every gap from the spacing table
    R.report().forEach(p => {
      const key = p.section + ' ' + p.pair, ok = Math.abs(p.got - p.want) <= 1, known = !ok && KNOWN.has(key);
      const d = document.createElement('div'); d.className = 'bfm-gap';
      d.style.setProperty('--c', ok ? '#4CC38A' : known ? '#E0B04B' : '#F0503A');
      Object.assign(d.style, { left: p.x - 14 + 'px', width: '10px', top: p.y - p.got + 'px', height: Math.max(2, p.got) + 'px' });
      d.innerHTML = `<b>${p.got}${ok ? '' : ' / ' + p.want}</b>`; d.title = `${p.section} ${p.pair} · ${p.token}`;
      layer.appendChild(d);
    });
    document.body.appendChild(layer);
  };
  function hide() { if (layer) layer.remove(); layer = null; }
  // sections fade and slide in as they reach the screen; re-measure once the scrolling stops so the numbers are final
  let on = false, t; addEventListener('scroll', () => { if (!on) return; clearTimeout(t); t = setTimeout(show, 450); }, { passive: true });
  window.BridgifyMeasure = { show: () => { on = true; show(); }, hide: () => { on = false; hide(); } };
})();
