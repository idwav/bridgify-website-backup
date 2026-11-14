// Shared "Choose your path" section: plays the API request, then shows the result in the partner's app,
// and cycles the brand colour of the White-Label store. Starts when the section scrolls into view.
(() => {
  const root = document.querySelector('.xc');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = [...root.querySelectorAll('.xc-code pre>span')];
  const app = root.querySelector('.xc-app');
  const link = root.querySelector('.xc-link');
  const store = root.querySelector('.xc-store');
  const swatches = [...root.querySelectorAll('.xc-swatches i')];
  let timers = [], cycle = 0, played = false;

  const showAll = () => { lines.forEach((l) => l.classList.add('is-on')); app.classList.add('is-on'); };
  function play() {
    if (played) return;
    played = true;
    lines.forEach((l, i) => timers.push(setTimeout(() => l.classList.add('is-on'), 250 + i * 260)));
    const done = 250 + lines.length * 260;
    timers.push(setTimeout(() => link.classList.add('is-run'), done));
    timers.push(setTimeout(() => app.classList.add('is-on'), done + 700));
  }
  let s = 0;
  const setBrand = (i) => {
    swatches.forEach((w, j) => w.classList.toggle('is-on', j === i));
    store.style.setProperty('--brand', swatches[i].style.background);
  };
  const startCycle = () => { if (!cycle) cycle = setInterval(() => { s = (s + 1) % swatches.length; setBrand(s); }, 2400); };
  const stopCycle = () => { clearInterval(cycle); cycle = 0; };

  if (reduced) { showAll(); return; }
  if (!('IntersectionObserver' in window)) { showAll(); startCycle(); return; }
  new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { play(); startCycle(); } else stopCycle();
  }), { threshold: 0.25 }).observe(root);
})();
