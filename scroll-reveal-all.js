/* Every section enters with the scroll (owner, 22 Nov 2026), on desktop, tablet and phone.
   Pages already give many sections their own entrance (homepage-v2.js, scroll-entrances.js, page-scroll-motion.js);
   this fills the rest with the same motion those use on the inner pages: the section's heading and its main blocks
   rise into place and fade in (40px; 24px on phones), tied to the scroll position (no time-based tail), one after
   another.
   Left alone: the hero (the first section), any section that already has an entrance, anything the page animates
   itself or brings in with its own transition, and anything fixed (pinned stories keep their own behaviour). */
(() => {
  const phone = matchMedia('(max-width: 599px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate) return;
  const items = [];
  let frame = 0, built = false;

  /* a page's own entrance: marked by the other scripts, or named so in its classes (al-enter, reveal, fade-in …) */
  const OWN = /(^|[\s_-])(enter|entered|reveal|revealed|fade|fade-in|rise|in-view|inview|is-in|animate)([\s_-]|$)/i;
  /* brand-section-fade is the section's edge shading, not an entrance */
  const own = el => typeof el.className === 'string' && el.className.split(/\s+/).some(c => c && c !== 'brand-section-fade' && OWN.test(c));
  const marked = el => el.matches('[data-scroll-enter],[data-rv]') || el.querySelector('[data-scroll-enter],[data-rv]') || [...el.querySelectorAll('*')].slice(0, 2000).some(own);
  const eases = el => { const g = getComputedStyle(el); return g.transitionProperty.split(',').some((p, i) => /^(all|opacity|transform|translate)$/.test(p.trim()) && parseFloat(g.transitionDuration.split(',')[i] || g.transitionDuration) > 0); };
  const moved = el => { const g = getComputedStyle(el); return g.transform !== 'none' || (g.translate && !/^(none|0px( 0px)?)$/.test(g.translate)); };
  const pinned = el => [el, ...el.querySelectorAll('*')].slice(0, 1500).some(e => /sticky|fixed/.test(getComputedStyle(e).position));
  const fixedIn = el => [el, ...el.querySelectorAll('*')].slice(0, 1500).some(e => getComputedStyle(e).position === 'fixed');
  const usable = (el, inPin) => {
    if (!(el instanceof HTMLElement) || /^(SCRIPT|STYLE|TEMPLATE|LINK|BR)$/.test(el.tagName)) return false;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
    /* absolutely placed parts are taken only inside a pinned stage (its copy and its picture) */
    const g = getComputedStyle(el); if (g.display === 'contents' || g.position === 'fixed' || (g.position === 'absolute' && !inPin)) return false;
    return !el.matches('.brand-section-fade') && !own(el) && !eases(el) && !el.getAnimations().length && !el.style.opacity && !el.style.translate && !moved(el) && +getComputedStyle(el).opacity > .99;
  };
  /* The blocks of a section: walk down single wrappers, then take the children; a child that holds something pinned
     gives its own children instead (two levels at most), so the pinned part itself never moves. */
  const blocks = sec => {
    let box = sec;
    for (let i = 0; i < 3; i++) { const kids = [...box.children].filter(c => usable(c, false)); if (kids.length === 1 && kids[0].children.length) box = kids[0]; else break; }
    const out = [];
    const take = (el, depth, inPin) => {
      if (!usable(el, inPin)) return;
      if (pinned(el)) { if (depth < 2) [...el.children].forEach(c => take(c, depth + 1, true)); return; }
      if (fixedIn(el)) return;
      out.push(el);
    };
    /* the walk may have stepped into a pinned stage: its children count as inside the pin */
    let inPin = false; for (let e = box; e && e !== sec.parentElement; e = e.parentElement) if (/sticky/.test(getComputedStyle(e).position)) inPin = true;
    [...box.children].forEach(c => take(c, 0, inPin));
    return out.slice(0, 8);
  };

  const build = () => {
    built = true;
    const secs = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') &&
      !s.closest('header.site-header-common, footer, .bf-footer-shell, .bf-cta-shell') && s.getBoundingClientRect().height > 80);
    secs.slice(1).forEach(sec => {
      if (marked(sec)) return;
      blocks(sec).forEach((el, i) => {
        el.dataset.scrollEnter = 'arrive'; el.dataset.revealAll = '1';
        items.push({el, y: phone.matches ? 24 : 40, delay: Math.min(i, 3) * 0.025, anim: null, shift: 0, progress: -1});
      });
    });
  };

  const render = () => {
    frame = 0;
    const h = innerHeight, tops = items.map(it => it.el.getBoundingClientRect().top - it.shift);
    items.forEach((it, i) => {
      if (!it.anim) return;
      const start = h * 0.94 - it.delay * h, distance = Math.min(h * (phone.matches ? 0.32 : 0.42), 360);
      const p = it.el.contains(document.activeElement) ? 1 : Math.max(0, Math.min(1, (start - tops[i]) / distance));
      if (Math.abs(p - it.progress) < 0.0001) return;
      const e = 1 - Math.pow(1 - p, 3);
      it.anim.currentTime = e * 1000; it.shift = it.y * (1 - e); it.progress = p;
    });
  };
  const schedule = () => { if (!frame && items.some(it => it.anim)) frame = requestAnimationFrame(() => { try { render(); } catch (e) { reset(); } }); };
  const reset = () => { cancelAnimationFrame(frame); frame = 0; items.forEach(it => { it.anim?.cancel(); it.anim = null; it.shift = 0; it.progress = -1; }); };
  const configure = () => {
    reset();
    if (reduced.matches) return;
    if (!built) build();
    items.forEach(it => {
      it.anim = it.el.animate([{opacity: 0, translate: `0px ${it.y}px`}, {opacity: 1, translate: '0px 0px'}], {duration: 1000, fill: 'both'});
      it.anim.pause(); it.anim.currentTime = 0; it.shift = it.y;
    });
    render();
  };

  const start = () => { configure(); addEventListener('scroll', schedule, {passive: true}); addEventListener('resize', schedule); };
  reduced.addEventListener('change', configure);
  /* after the page's own scripts have marked their sections */
  if (document.readyState === 'complete') setTimeout(start, 120); else addEventListener('load', () => setTimeout(start, 120));
})();
