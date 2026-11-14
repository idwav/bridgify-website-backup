// Version 2 is the default site. Every internal link keeps the visitor's version:
// 2 (default), 3 (V2 with the tower hero) or 1 (the original reference, only on request).
(() => {
  const current = new URL(location.href);
  const requested = current.searchParams.get('version') ?? current.searchParams.get('v');
  const v2Document = document.documentElement.dataset.homeVersion === '2';
  const homePaths = new Set(['/', '/index.html', '/index-v2.html']);
  const family = ['1', '2', '3'].includes(requested) ? requested : '2';
  const v2 = family !== '1';
  if (family === '3') document.documentElement.dataset.hero = '3';

  if (homePaths.has(current.pathname) && v2 !== v2Document) {
    // Serve the matching homepage document; dev.py and vercel.json normally do this on the server.
    current.pathname = v2 ? '/index-v2.html' : '/';
    current.searchParams.delete('v');
    current.searchParams.set('version', family);
    location.replace(current.href);
    return;
  }
  if (current.searchParams.has('v') || current.searchParams.get('version') !== family) {
    current.searchParams.delete('v');
    current.searchParams.set('version', family);
    history.replaceState(history.state, '', current.pathname + current.search + current.hash);
  }

  function versionedLink(link) {
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || link.hasAttribute('download')) return;
    const target = new URL(raw, location.href);
    if (target.origin !== location.origin || !/^https?:$/.test(target.protocol)) return;
    // An explicit link to the original homepage stays as written.
    if (target.searchParams.get('version') === '1' && family !== '1') return;
    // Keep media, downloads and embedded previews out of page version routing.
    if (/\.[a-z0-9]+$/i.test(target.pathname) && !target.pathname.endsWith('.html')) return;
    if (homePaths.has(target.pathname)) target.pathname = '/';
    target.searchParams.delete('v');
    target.searchParams.set('version', family);
    link.setAttribute('href', target.pathname + target.search + target.hash);
  }
  function connectNavigation() {
    document.querySelectorAll('a[href]').forEach(versionedLink);
    // Run before the existing page-transition handlers capture the destination.
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (link) versionedLink(link);
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connectNavigation, { once: true });
  else connectNavigation();
})();
