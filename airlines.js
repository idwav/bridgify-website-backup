// Airline supply, passenger touchpoints and native disclosures; no animation dependency.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 900px)');
  const hero = document.querySelector('.al-hero');
  const earn = document.querySelector('.al-earn');
  const nav = document.querySelector('#airline-site-nav');
  const header = document.querySelector('.top');
  const menu = document.querySelector('.al-mobile-toggle');
  const entered = new Set();
  const running = new Set();
  document.documentElement.classList.add('al-nav-ready');

  function setMenu(open) {
    header.dataset.menuOpen = String(open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.inert = compact.matches && !open;
  }
  menu.addEventListener('click', () => setMenu(header.dataset.menuOpen !== 'true'));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.dataset.menuOpen === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
  compact.addEventListener('change', () => setMenu(false));
  setMenu(false);

  function animate(element, keyframes, options) {
    if (reduced.matches || !element.animate) return null;
    const animation = element.animate(keyframes, options);
    running.add(animation);
    animation.onfinish = animation.oncancel = () => running.delete(animation);
    return animation;
  }
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const element = entry.target;
      if (element === earn) {
        earn.classList.toggle('is-visible', entry.isIntersecting);
        if (entry.isIntersecting && !entered.has(earn)) {
          entered.add(earn);
          earn.classList.add('has-connected');
        }
        continue;
      }
      if (element === hero) hero.classList.toggle('is-visible', entry.isIntersecting);
      if (!entry.isIntersecting || entered.has(element)) continue;
      entered.add(element);
      if (element === hero) {
        // The source arrives first, then the connecting layer, then the airline product.
        for (const [layer, delay] of [['supply',0],['bridge',120],['airline',240]]) {
          animate(hero.querySelector(`[data-layer="${layer}"]`), [
            { opacity: .4, transform: `translateY(${layer === 'supply' ? 22 : 14}px)` },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 760, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        }
      } else {
        animate(element, [{ opacity: .45, translate: '0 22px' }, { opacity: 1, translate: '0 0' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    }
  }, { threshold: .08 });
  visibility.observe(hero);
  if (earn) visibility.observe(earn);
  document.querySelectorAll('.al-enter').forEach(element => visibility.observe(element));
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('al-motion-paused', document.hidden);
    for (const animation of running) document.hidden ? animation.pause() : animation.play();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) for (const animation of [...running]) animation.finish(); });

  const tabs = [...document.querySelectorAll('[data-touchpoint]')];
  const panels = [...document.querySelectorAll('[data-phone-panel]')];
  const phoneAnimations = new Set();
  let active = 'arrival';
  function selectTouchpoint(key) {
    if (key === active) return;
    for (const animation of phoneAnimations) animation.cancel();
    phoneAnimations.clear();
    const previous = panels.find(panel => panel.dataset.phonePanel === active);
    const next = panels.find(panel => panel.dataset.phonePanel === key);
    active = key;
    tabs.forEach(tab => {
      const selected = tab.dataset.touchpoint === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel === next;
      panel.inert = !selected;
      panel.hidden = panel !== previous && !selected;
      panel.setAttribute('aria-hidden', String(!selected));
    });
    const out = animate(previous, [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -10px' }], { duration: 180, easing: 'ease-out' });
    const incoming = animate(next, [{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    if (out) {
      phoneAnimations.add(out);
      out.addEventListener('finish', () => { previous.hidden = previous.dataset.phonePanel !== active; phoneAnimations.delete(out); });
    } else previous.hidden = true;
    if (incoming) { phoneAnimations.add(incoming); incoming.addEventListener('finish', () => phoneAnimations.delete(incoming)); }
    document.querySelector('.al-phone').dataset.touchpoint = key;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTouchpoint(tab.dataset.touchpoint));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      selectTouchpoint(tabs[next].dataset.touchpoint);
    });
  });
  function orientTabs() { document.querySelector('.al-touchpoints').setAttribute('aria-orientation', compact.matches ? 'horizontal' : 'vertical'); }
  compact.addEventListener('change', orientTabs);
  orientTabs();

  const disclosures = new WeakMap();
  document.querySelectorAll('.al-faq details').forEach(detail => {
    const content = detail.querySelector('.al-faq-answer');
    detail.querySelector('summary').addEventListener('click', event => {
      if (reduced.matches || !content.animate) return;
      event.preventDefault();
      const open = detail.dataset.targetOpen ? detail.dataset.targetOpen === 'false' : !detail.open;
      const from = detail.open ? content.getBoundingClientRect().height : 0;
      disclosures.get(detail)?.cancel();
      detail.dataset.targetOpen = String(open);
      detail.open = true;
      const height = content.querySelector('p').getBoundingClientRect().height;
      const animation = content.animate([{ height: `${from}px`, opacity: from ? 1 : 0 }, { height: `${open ? height : 0}px`, opacity: open ? 1 : 0 }], { duration: open ? 350 : 220, easing: 'cubic-bezier(.16,1,.3,1)' });
      disclosures.set(detail, animation);
      animation.onfinish = () => { if (!open) detail.open = false; delete detail.dataset.targetOpen; disclosures.delete(detail); };
    });
  });

  const dialog = document.querySelector('.al-preview-dialog');
  const title = document.querySelector('#al-preview-title');
  const image = dialog.querySelector('[data-dialog-image]');
  const copy = dialog.querySelector('[data-dialog-copy]');
  const experiences = {
    seine: ['Seine cruise', 'Discover Paris from the river, with a destination experience selected for your passenger’s trip.'],
    louvre: ['Louvre Museum', 'Help passengers make more of their destination with bookable cultural experiences inside your airline’s product.'],
    eiffel: ['Discover Paris', 'Carry the passenger journey beyond arrival with relevant experiences under your airline’s own brand.']
  };
  document.querySelectorAll('[data-experience]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.experience;
    const media = button.querySelector('svg.al-photo, img');
    image.replaceChildren(media.cloneNode(true));
    title.textContent = experiences[key][0];
    copy.textContent = experiences[key][1];
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    animate(dialog, [{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
  }));
  dialog.querySelector('.al-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
})();
