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
  // owner, 19 Nov 2026: level the tops of the letters, not the line boxes. A 43px Chillax title and a 16px Sofia intro
  // have different leading and ascent, so equal box tops left the intro's letters 3-5px above the title's.
  const cvs = document.createElement('canvas').getContext('2d');
  const inkTop = el => { const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 }); const n = tw.nextNode(); if (!n) return null;
    const rg = document.createRange(); const i0 = n.textContent.search(/\S/); rg.setStart(n, i0); rg.setEnd(n, i0 + 1); const r0 = rg.getClientRects()[0]; if (!r0) return null;
    let s = ''; for (let k = i0; k < n.length; k++) { rg.setStart(n, k); rg.setEnd(n, k + 1); const rr = rg.getClientRects()[0]; if (!rr || Math.abs(rr.top - r0.top) > 2) break; s += n.textContent[k]; }
    const c = getComputedStyle(n.parentElement); cvs.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`; const m = cvs.measureText(s.trim() || 'H');
    return r0.top + (m.fontBoundingBoxAscent - m.actualBoundingBoxAscent) * (r0.height / (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)); };
  API.apply = () => {
    clear(); if (!MQ.matches || window.__bfMeasureOnly) return;
    PAIRS.forEach(([s, ts, rs]) => {
      const sec = document.querySelector(s); if (!sec) return;
      const t = sec.querySelector(ts), r = sec.querySelector(rs); if (!t || !r) return;
      touched.push([r, r.style.getPropertyValue('margin-top'), r.style.getPropertyPriority('margin-top')]);
      r.style.setProperty('margin-top', '0px', 'important');
      const tr = t.getBoundingClientRect(), rb = textBox(r);
      const ti = inkTop(t), ri = inkTop(r);
      let d = (ti != null && ri != null) ? ti - ri : tr.top - rb.top;
      if (API.mode === 'bottom' && rb.bottom - rb.top <= tr.bottom - tr.top) d = tr.bottom - rb.bottom;
      r.style.setProperty('margin-top', d + 'px', 'important');
    });
  };
  API.report = () => PAIRS.map(([s, ts, rs]) => { const sec = document.querySelector(s); if (!sec) return null;
    const t = sec.querySelector(ts).getBoundingClientRect(), r = sec.querySelector(rs), rb = textBox(r), rr = r.getBoundingClientRect();
    return { section: s, inkTop: Math.round((inkTop(r) - inkTop(sec.querySelector(ts))) * 10) / 10, introLeft: Math.round(rr.left), introWidth: Math.round(rr.width), dTop: Math.round(rb.top - t.top), dBottom: Math.round(rb.bottom - t.bottom) }; }).filter(Boolean);
  API.clear = clear;
  window.BridgifySplit = API;
  // after the rhythm engine (it re-runs 150ms after a resize)
  let tm; const later = () => { clearTimeout(tm); tm = setTimeout(API.apply, 400); };
  addEventListener('resize', later); MQ.addEventListener('change', later);
  if (document.fonts) document.fonts.ready.then(later);
  later();
})();
