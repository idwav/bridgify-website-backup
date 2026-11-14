/* API · checklist (#api-features) and Enterprise (#enterprise): reveal on entry and copy the checklist.
   Ported from output/element-lab (approved 14 Nov 2026). */
(() => {
  const reveal = el => {
    if (!el) return;
    new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }), {threshold: .25}).observe(el);
  };
  const ck = document.querySelector('#api-features.ck-section');
  if (ck) { ck.classList.add('ck-js'); reveal(ck); }
  reveal(document.querySelector('#enterprise.en-section'));

  const btn = ck && ck.querySelector('[data-copy-list]');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const rows = [...ck.querySelectorAll('.ck-row:not(.ck-th)')].map(r => {
      const [c, ask] = [...r.querySelectorAll('[role="cell"]')].map(x => x.textContent.replace(/^\d+/, '').trim());
      return `[ ] ${c}: ${ask}`;
    });
    const label = btn.textContent;
    try { await navigator.clipboard.writeText(`What features should a tours and activities API include?\n${rows.join('\n')}`); btn.textContent = 'Copied ✓'; }
    catch (e) { btn.textContent = 'Select and copy'; }
    btn.classList.add('is-done');
    setTimeout(() => { btn.textContent = label; btn.classList.remove('is-done'); }, 1600);
  });
})();
