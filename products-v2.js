// Native scrolling scrubs the product story. Buttons offer direct access too.
(() => {
  const section = document.querySelector('.v2p-products');
  if (!section) return;
  const shell = section.querySelector('.v2p-shell');
  const host = section.querySelector('.v2p-previews');
  const items = [...section.querySelectorAll('.v2p-item')];
  const previews = [...section.querySelectorAll('.v2p-preview')];
  const buttons = [...section.querySelectorAll('.v2p-trigger')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width:981px) and (min-height:650px)');
  const hero = document.querySelector('.bv2-hero');
  const clamp = value => Math.max(0, Math.min(1, value));
  let enhanced = false, active = -1, frame = 0;
  const paused = () => document.hidden || hero?.classList.contains('paused');

  function activate(index) {
    if (index === active) return;
    active = index;
    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      const detail = item.querySelector('.v2p-detail');
      detail.inert = enhanced && i !== index;
      detail.setAttribute('aria-hidden', String(enhanced && i !== index));
      buttons[i].setAttribute('aria-expanded', String(!enhanced || i === index));
      item.querySelector('.v2p-toggle').textContent = i === index ? '−' : '+';
      previews[i].classList.toggle('is-current', i === index);
      previews[i].inert = enhanced && i !== index;
      previews[i].setAttribute('aria-hidden', String(enhanced && i !== index));
    });
    section.dataset.activeProduct = String(index);
    section.querySelector('.v2p-step').textContent = `0${index + 1} / 03`;
  }
  function render() {
    frame = 0;
    if (!enhanced || paused()) return;
    const rect = section.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(1, section.offsetHeight - shell.offsetHeight));
    // Hold each product long enough to read; crossfade only between the holds.
    const position = progress < .28 ? 0 : progress < .39 ? (progress - .28) / .11 : progress < .62 ? 1 : progress < .73 ? 1 + (progress - .62) / .11 : 2;
    activate(Math.round(position));
    previews.forEach((preview, i) => {
      const distance = Math.abs(position - i);
      const opacity = clamp(1 - distance);
      preview.style.opacity = String(opacity);
      preview.style.transform = `translateY(${(i - position) * 22}px) scale(${.985 + opacity * .015})`;
      preview.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
    });
    section.dataset.scrollProgress = progress.toFixed(3);
  }
  function queue() { if (!frame) frame = requestAnimationFrame(render); }
  function configure() {
    enhanced = desktop.matches && !reduced.matches;
    section.classList.toggle('v2p-ready', enhanced);
    previews.forEach((preview, i) => {
      (enhanced ? host : items[i]).append(preview);
      if (!enhanced) {
        preview.removeAttribute('style');
        preview.inert = false;
        preview.setAttribute('aria-hidden', 'false');
      }
      buttons[i].disabled = !enhanced;
    });
    active = -1;
    activate(0);
    queue();
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    if (!enhanced) return;
    const start = scrollY + section.getBoundingClientRect().top;
    const travel = section.offsetHeight - shell.offsetHeight;
    window.scrollTo({ top: start + [0, .5, .86][i] * travel, behavior: 'smooth' });
  }));
  section.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => {
    const interest = button.dataset.interest;
    section.querySelectorAll('[data-interest]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
    const first = section.querySelector('.v2p-culture');
    const food = interest === 'food';
    first.querySelector('img').src = food ? 'assets/hero-food.jpg' : 'assets/api-card-colosseum.jpg';
    first.querySelector('h4').textContent = food ? 'Local Cooking Class' : 'Colosseum & Ancient Rome';
    first.querySelector('p').textContent = food ? 'Food experience · Rome, Italy' : 'Guided tour · Rome, Italy';
    first.querySelector('.v2p-tag').textContent = food ? '♧  Food' : '♜  Culture';
    first.classList.toggle('is-selected', interest !== 'nature');
    section.querySelector('.v2p-nature').classList.toggle('is-selected', interest === 'nature');
  }));
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  document.addEventListener('visibilitychange', queue);
  desktop.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  if (hero) new MutationObserver(queue).observe(hero, { attributes: true, attributeFilter: ['class'] });
  new ResizeObserver(queue).observe(shell);
  configure();
  document.fonts?.ready.then(queue);
})();
