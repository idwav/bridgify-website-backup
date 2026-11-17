// Marketplace: embed the real product screens (workflow-preview.html) inside the site's existing frames.
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const base = 'workflow-preview.html?view=screen&embed=1&chrome=0&controls=0&theme=dark&version=2&part=';
  const frame = (part, title) => { const f = document.createElement('iframe'); f.className = 'pui-frame'; f.title = title; f.loading = 'lazy'; f.dataset.src = base + part; return f; };

  // Hero: a branded store in the glass window.
  const demo = q('#section-1 .market-demo');
  if (demo) {
    const win = document.createElement('div'); win.className = 'pui-window';
    const f = frame('city', 'Illustrative branded marketplace: top picks for a city'); f.src = f.dataset.src; win.append(f); demo.prepend(win);
  }

  // From discovery to checkout: the stage list drives which product screen shows.
  const tour = q('.market-product-tour');
  if (tour) {
    const screens = q('.screens', tour), stack = document.createElement('div'); stack.className = 'pui-stack';
    const parts = ['search', 'tickets', 'tickets', 'checkout'], names = ['Search', 'Experience', 'Reviews', 'Checkout'];
    const frames = parts.map((p, i) => { const f = frame(p, 'Marketplace screen: ' + names[i]); stack.append(f); return f; });
    screens.append(stack);
    const panels = [...screens.querySelectorAll('.screen')]; let shown = -1;
    const sync = () => {
      const i = panels.findIndex(p => p.classList.contains('active')); if (i < 0 || i === shown) return; shown = i;
      frames.forEach((f, n) => { const on = n === i; f.classList.toggle('on', on); if (on) f.src = f.dataset.src; });
    };
    panels.forEach(p => new MutationObserver(sync).observe(p, { attributes: true, attributeFilter: ['class'] }));
    sync(); setTimeout(sync, 400);
  }

  // Live in 3 days: the store sits under the domain bar.
  const store = q('#section-5 .launch-store');
  if (store) {
    const wrap = document.createElement('div'); wrap.className = 'pui-store';
    const f = frame('city', 'Illustrative branded store, live'); f.src = f.dataset.src; wrap.append(f);
    q('.launch-domain', store).after(wrap);
  }
})();
