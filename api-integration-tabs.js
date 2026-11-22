// "Who does what" on iPads (600-1023px): like on the phone, one panel at a time with a two-button switch (You build / Bridgify manages). Phones get the same from the phone layer; wider screens keep both panels and the wiring.
(() => {
  const root = document.querySelector('#integration'); if (!root) return;
  const mq = matchMedia('(min-width:600px) and (max-width:1023px)');
  const panels = [...root.querySelectorAll('.am-build,.am-managed')], anchor = root.querySelector('.am-panel'); if (panels.length < 2 || !anchor) return;
  const bar = document.createElement('div'); bar.className = 'it-seg'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Who does what');
  const labels = panels.map(p => (p.querySelector('h3,h4')?.textContent || '').replace(/:$/, '').replace(/\s+/g, ' ').trim());
  const buttons = labels.map((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = t; bar.append(b); return b; });
  anchor.before(bar);
  let cur = 0;
  const show = i => { cur = i; panels.forEach((p, j) => p.classList.toggle('it-on', j === i)); buttons.forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; }); dispatchEvent(new Event('resize')); };
  buttons.forEach((b, i) => b.addEventListener('click', () => show(i)));
  const apply = () => { root.classList.toggle('it-tabs', mq.matches); if (mq.matches) show(cur); };
  mq.addEventListener('change', apply); apply();
})();
