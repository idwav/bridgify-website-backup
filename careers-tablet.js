/* Careers on a standard tablet (600-900px): in "What makes Bridgify Bridgify" the three statements become numbered buttons
   (01 Hard problems, 02 Ownership, 03 Operators), same language as the other pages; the active statement's text sits under them and the demo below.
   The existing script keeps switching the steps by itself and on tap (data-step); the buttons only press the original items. Outside that width the bar is hidden by CSS. */
(() => {
  if (window.__crTablet) return; window.__crTablet = true;
  const root = document.querySelector('#what-makes-bridgify [data-cm]'); if (!root || root.querySelector('.cr-tabs')) return;
  const lis = [...root.querySelectorAll('.cm-list li')], list = root.querySelector('.cm-list'); if (lis.length < 2) return;
  const short = ['Hard problems', 'Ownership', 'Operators'];
  const bar = document.createElement('div'); bar.className = 'cr-tabs'; bar.setAttribute('role', 'tablist');
  const cap = document.createElement('p'); cap.className = 'cr-cap';
  const btns = lis.map((l, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.innerHTML = '<i></i><span></span>'; b.firstChild.textContent = '0' + (i + 1); b.lastChild.textContent = short[i] || ('Step ' + (i + 1)); b.addEventListener('click', () => l.click()); bar.append(b); return b; });
  const texts = lis.map(l => (l.querySelector('p') || l).textContent.trim());
  let last = 0;
  const sync = () => { const n = (+root.dataset.step || 1) - 1; btns.forEach((b, j) => b.setAttribute('aria-selected', String(j === n))); if (n !== last || !cap.textContent) { last = n; cap.style.opacity = 0; setTimeout(() => { cap.textContent = texts[n]; cap.style.opacity = 1; }, 200); } };
  list.after(bar); bar.after(cap); cap.textContent = texts[0]; sync();
  new MutationObserver(sync).observe(root, {attributes: true, attributeFilter: ['data-step']});
})();
