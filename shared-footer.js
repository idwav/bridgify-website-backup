// Enhance the shared static footer; navigation and CTA links work without JS.
(() => {
  const footer = document.querySelector('.bf-footer');
  if (!footer) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  footer.querySelector('[data-footer-year]').textContent = String(new Date().getFullYear());
  footer.querySelector('.bf-footer-top-link').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
    document.querySelector('header a, .top a, h1')?.focus({ preventScroll: true });
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  });
  const hero = document.querySelector('.hero');
  function syncMotion() { footer.classList.toggle('bf-motion-paused', reduced.matches || Boolean(hero?.classList.contains('paused'))); }
  syncMotion();
  reduced.addEventListener('change', syncMotion);
  if (hero) new MutationObserver(syncMotion).observe(hero, { attributes: true, attributeFilter: ['class'] });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { footer.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: .05 });
    observer.observe(footer);
  }
})();
