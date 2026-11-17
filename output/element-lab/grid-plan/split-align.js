/* Lab only · companion to split-align.css. Puts the top of each split heading's intro level with the top of the
   title (window.BridgifySplit.mode = 'top'), or its bottom level with the title's last line ('bottom').
   On the live site this becomes structure, not script: the label gets its own grid row, so the title and the intro
   share the second row. Exposes window.BridgifySplit = {apply, clear, report, mode}. */
(() => {
  // the page can name its own split headings (window.BridgifySplitPairs); these are the homepage's
  const PAIRS = window.BridgifySplitPairs || [
    ['#opportunity-study', 'h2', 'div.pb-intro'],
    ['#products', 'h2', 'p.pr-guide'],
    ['#personalization', 'h2', 'div.home-intent-copy'],
  ];
  const MQ = matchMedia('(min-width:1024px)');
  const touched = [];
  const clear = () => { while (touched.length) { const [el, v, pr] = touched.pop(); if (v) el.style.setProperty('margin-top', v, pr); else el.style.removeProperty('margin-top'); } };
  const API = { mode: 'top' };
  // the visible text of the intro (its first and last lines), not the box around it
  const textBox = el => { const ks = [...el.querySelectorAll('p, a, button')].filter(e => e.getBoundingClientRect().height > 1);
    const rs = (ks.length ? ks : [el]).map(e => e.getBoundingClientRect()); return { top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom)) }; };
  API.apply = () => {
    clear(); if (!MQ.matches) return;
    PAIRS.forEach(([s, ts, rs]) => {
      const sec = document.querySelector(s); if (!sec) return;
      const t = sec.querySelector(ts), r = sec.querySelector(rs); if (!t || !r) return;
      touched.push([r, r.style.getPropertyValue('margin-top'), r.style.getPropertyPriority('margin-top')]);
      r.style.setProperty('margin-top', '0px', 'important');
      const tr = t.getBoundingClientRect(), rb = textBox(r);
      let d = tr.top - rb.top;
      if (API.mode === 'bottom' && rb.bottom - rb.top <= tr.bottom - tr.top) d = tr.bottom - rb.bottom;
      r.style.setProperty('margin-top', d + 'px', 'important');
    });
  };
  API.report = () => PAIRS.map(([s, ts, rs]) => { const sec = document.querySelector(s); if (!sec) return null;
    const t = sec.querySelector(ts).getBoundingClientRect(), r = sec.querySelector(rs), rb = textBox(r), rr = r.getBoundingClientRect();
    return { section: s, introLeft: Math.round(rr.left), introWidth: Math.round(rr.width), dTop: Math.round(rb.top - t.top), dBottom: Math.round(rb.bottom - t.bottom) }; }).filter(Boolean);
  API.clear = clear;
  window.BridgifySplit = API;
  // after the rhythm engine (it re-runs 150ms after a resize)
  let tm; const later = () => { clearTimeout(tm); tm = setTimeout(API.apply, 400); };
  addEventListener('resize', later); MQ.addEventListener('change', later);
  if (document.fonts) document.fonts.ready.then(later);
  later();
})();
