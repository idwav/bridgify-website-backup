/* Tablet menu (owner, 22 Nov 2026): hamburger and full-height menu built from the existing navigation, on tablets only (600-1023px).
   Copied from mobile/patterns.js (pattern 1). Phones get the same menu from the phone layer; this script does nothing there or on desktop. */
(() => {
  const MQ = {tablet: matchMedia('(min-width:600px) and (max-width:1023px)')};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let api = null;
  /* 1. Compact header with a full-height menu built from the existing navigation. */
  function menu() {
    const header = $('header.site-header-common'); if (!header || $('.ad-menu-btn', header)) return;
    const nav = $('nav', header), actions = $('.nav-actions', header);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ad-menu-btn'; btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'ad-menu');
    btn.innerHTML = '<i aria-hidden="true"></i>';
    (actions || header).after(btn);
    const sheet = document.createElement('div');
    sheet.className = 'ad-menu'; sheet.id = 'ad-menu'; sheet.tabIndex = -1; sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Menu');
    [...(nav ? nav.children : [])].forEach(item => {
      if (item.matches('details')) {
        const d = document.createElement('details'); d.className = 'ad-menu-group'; if (item.classList.contains('has-current')) { d.classList.add('has-current'); d.open = true; }
        const s = document.createElement('summary'); s.textContent = $('summary', item).textContent.trim(); d.append(s);
        const box = document.createElement('div'); box.className = 'ad-menu-links';
        $$('a', item).forEach(a => { const c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); if (a.getAttribute('aria-current')) c.setAttribute('aria-current', 'page'); box.append(c); });
        d.append(box); sheet.append(d);
      } else if (item.matches('a')) {
        const c = document.createElement('a'); c.className = 'ad-menu-row'; c.href = item.getAttribute('href'); c.textContent = item.textContent.trim(); if (item.getAttribute('aria-current')) c.setAttribute('aria-current', 'page'); sheet.append(c);
      }
    });
    if (actions) {
      const box = document.createElement('div'); box.className = 'ad-menu-actions';
      $$('a', actions).forEach(a => { const c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); box.append(c); });
      sheet.append(box);
    }
    document.body.append(sheet);
    // One group open at a time keeps the list short.
    $$('.ad-menu-group', sheet).forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.ad-menu-group', sheet).forEach(o => o !== d && (o.open = false)); }));
    const set = on => {
      sheet.classList.toggle('is-open', on); btn.setAttribute('aria-expanded', String(on));
      document.documentElement.classList.toggle('ad-menu-lock', on);
      if (on) sheet.focus({preventScroll: true}); else btn.focus({preventScroll: true});
    };
    btn.addEventListener('click', () => set(!sheet.classList.contains('is-open')));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) set(false); });
    MQ.tablet.addEventListener('change', () => { if (!MQ.tablet.matches) set(false); });
    return {open: () => set(true), close: () => set(false)};
  }


  const start = () => { if (MQ.tablet.matches && !api) api = menu(); };
  if (!document.querySelector('link[href*="tablet-menu.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = (document.currentScript && document.currentScript.src || 'tablet-menu.js').replace(/tablet-menu\.js.*$/, 'tablet-menu.css'); document.head.append(l); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  MQ.tablet.addEventListener('change', start);
})();
