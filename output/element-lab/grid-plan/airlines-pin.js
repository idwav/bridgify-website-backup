/* Airlines "Help passengers plan what to do when they land" (owner, 19 Nov 2026): while the scene is pinned it stops in
   the middle of the screen under the header (64px), then the steps scroll. CSS alone cannot centre a sticky box of
   unknown height, so this sets its top from its own height. Where the scene is taller than the space it stays at 64px.
   Only from 1024px and 800px of height, where the page pins; elsewhere nothing changes. */
(() => {
  const mq = matchMedia('(min-width: 1024px) and (min-height: 800px)');
  const HEADER = 64;
  const set = () => {
    const pin = document.querySelector('#section-3 .jp-sticky');
    if (!pin) return;
    if (!mq.matches) { pin.style.removeProperty('top'); return; }
    const top = Math.max(HEADER, HEADER + (innerHeight - HEADER - pin.offsetHeight) / 2);
    pin.style.setProperty('top', Math.round(top) + 'px', 'important');
  };
  addEventListener('resize', set);
  mq.addEventListener('change', set);
  if (document.fonts) document.fonts.ready.then(set);
  addEventListener('load', set);
  set();
})();
