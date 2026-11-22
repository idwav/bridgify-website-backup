/* Careers · mobile (≤599): no page-specific behaviour yet; the shared patterns (menu, rhythm) do the work. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
})();

/* Owner, 22 Nov 2026 (phones): What makes Bridgify Bridgify. The statements are a row of step buttons; the chosen one's
   text is shown under the row (the same words as in the list) and the row keeps the chosen button in view. The page's
   own script (careers-motion.js) still picks the step: taps, and every few seconds until the first tap. */
(() => {
  const A = window.BridgifyAdaptive; if (!A || !A.MQ.mobile.matches) return;
  const root = document.querySelector('#what-makes-bridgify [data-cm]'); if (!root) return;
  const list = root.querySelector('.cm-list'), items = [...root.querySelectorAll('.cm-list > li')]; if (!list || !items.length) return;
  const text = document.createElement('p'); text.className = 'ad-cm-text'; text.setAttribute('aria-live', 'polite');
  list.after(text);
  let cur = 0;
  const paint = () => {
    const n = Math.max(1, Math.min(items.length, +root.dataset.step || 1)) - 1;
    items.forEach((li, i) => { li.classList.toggle('ad-cm-on', i === n); li.setAttribute('aria-pressed', String(i === n)); });
    const p = items[n].querySelector('p'), words = p ? p.textContent.trim() : '';
    if (n !== cur || !text.textContent) {
      cur = n; text.classList.add('is-swap');
      setTimeout(() => { text.textContent = words; text.classList.remove('is-swap'); }, text.textContent ? 200 : 0);
      const li = items[n]; if (list.scrollWidth > list.clientWidth) list.scrollTo({left: li.offsetLeft - list.offsetLeft - (list.clientWidth - li.offsetWidth) / 2, behavior: 'smooth'});
    }
  };
  new MutationObserver(paint).observe(root, {attributes: true, attributeFilter: ['data-step']});
  cur = -1; paint();
})();
