/* Tablet menu (owner, 22 Nov 2026): on tablets only (600-1023px) the header is the logo, "Book a demo" and a hamburger.
   The menu opens full height: Log in and Book a demo at the top, then each group as a large title that slides open to its links.
   Built from the existing navigation. Phones get their menu from the phone layer; this script does nothing there or on desktop. */
(() => {
  if (window.__tmTablet) return; window.__tmTablet = true;
  const MQ = matchMedia('(min-width:600px) and (max-width:1023px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let api = null;
  const cur = (src, el) => { if (src.getAttribute('aria-current')) el.setAttribute('aria-current', src.getAttribute('aria-current')); };

  function menu() {
    const header = $('header.site-header-common'); if (!header || $('.ad-menu-btn', header)) return;
    const nav = $('nav', header), actions = $('.nav-actions', header);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ad-menu-btn'; btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'ad-menu');
    btn.innerHTML = '<i aria-hidden="true"></i>';
    (actions || header).after(btn);

    const sheet = document.createElement('div');
    sheet.className = 'ad-menu tm-sheet'; sheet.id = 'ad-menu'; sheet.tabIndex = -1; sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Menu');

    // Log in and Book a demo first, side by side
    if (actions) {
      const box = document.createElement('div'); box.className = 'tm-actions';
      $$('a', actions).forEach(a => { const c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); box.append(c); });
      sheet.append(box);
    }

    // Groups: a large title that slides open to its links
    [...(nav ? nav.children : [])].forEach(item => {
      if (item.matches('details')) {
        const g = document.createElement('div'); g.className = 'tm-group';
        if (item.classList.contains('has-current')) g.classList.add('has-current', 'is-open');
        const t = document.createElement('button'); t.type = 'button'; t.className = 'tm-title';
        t.setAttribute('aria-expanded', String(g.classList.contains('is-open')));
        t.innerHTML = '<span></span><i aria-hidden="true"></i>'; t.firstChild.textContent = $('summary', item).textContent.trim();
        const panel = document.createElement('div'); panel.className = 'tm-panel';
        const links = document.createElement('div'); links.className = 'tm-links';
        $$('a', item).forEach(a => { const c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); cur(a, c); links.append(c); });
        panel.append(links); g.append(t, panel); sheet.append(g);
      } else if (item.matches('a')) {
        const c = document.createElement('a'); c.className = 'tm-row'; c.href = item.getAttribute('href'); c.textContent = item.textContent.trim(); cur(item, c); sheet.append(c);
      }
    });
    document.body.append(sheet);

    // one group open at a time
    $$('.tm-title', sheet).forEach(t => t.addEventListener('click', () => {
      const g = t.parentElement, open = !g.classList.contains('is-open');
      $$('.tm-group', sheet).forEach(o => { o.classList.remove('is-open'); $('.tm-title', o).setAttribute('aria-expanded', 'false'); });
      if (open) { g.classList.add('is-open'); t.setAttribute('aria-expanded', 'true'); }
    }));

    const set = on => {
      sheet.classList.toggle('is-open', on); btn.setAttribute('aria-expanded', String(on));
      document.documentElement.classList.toggle('ad-menu-lock', on);
      if (on) sheet.focus({preventScroll: true}); else btn.focus({preventScroll: true});
    };
    btn.addEventListener('click', () => set(!sheet.classList.contains('is-open')));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) set(false); });
    MQ.addEventListener('change', () => { if (!MQ.matches) set(false); });
    return {open: () => set(true), close: () => set(false)};
  }

  const start = () => { if (MQ.matches && !api) api = menu(); };
  if (!document.querySelector('link[href*="tablet-menu.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = (document.currentScript && document.currentScript.src || 'tablet-menu.js').replace(/tablet-menu\.js/, 'tablet-menu.css'); document.head.append(l); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  MQ.addEventListener('change', start);
})();
