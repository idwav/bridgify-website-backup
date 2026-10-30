// One V2 entry point, including navigation through the shared product pages.
(() => {
  const current = new URL(location.href);
  const version = current.searchParams.get('version') ?? current.searchParams.get('v');
  const v2Document = document.documentElement.dataset.homeVersion === '2';
  const homePaths = new Set(['/', '/index.html', '/index-v2.html']);
  const v2 = version === '2' || (version !== '1' && v2Document);

  if (v2 && homePaths.has(current.pathname) && !v2Document) {
    // Static hosts fall back to the V2 document; dev.py serves it at /?version=2.
    current.pathname = '/index-v2.html';
    current.searchParams.delete('v');
    current.searchParams.set('version', '2');
    location.replace(current.href);
    return;
  }
  if (!v2) return;
  if (current.searchParams.has('v') || current.searchParams.get('version') !== '2') {
    current.searchParams.delete('v');
    current.searchParams.set('version', '2');
    history.replaceState(history.state, '', current.pathname + current.search + current.hash);
  }

  function versionedLink(link) {
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || link.hasAttribute('download')) return;
    const target = new URL(raw, location.href);
    if (target.origin !== location.origin || !/^https?:$/.test(target.protocol)) return;
    if (target.searchParams.get('version') === '1') return;
    // Keep media, downloads and embedded previews out of page version routing.
    if (/\.[a-z0-9]+$/i.test(target.pathname) && !target.pathname.endsWith('.html')) return;
    if (homePaths.has(target.pathname)) target.pathname = '/';
    target.searchParams.delete('v');
    target.searchParams.set('version', '2');
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
