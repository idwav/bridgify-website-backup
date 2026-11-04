// The hero copy arrives in sequence. The visual runs its own timeline in hero-funnel-v2.js.
(() => {
  const hero = document.querySelector('.bv2-hero');
  if (!hero) return;
  const copy = hero.querySelector('.bv2-hero-copy');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const entrances = [];
  const paused = () => hero.classList.contains('paused');

  function sync() {
    entrances.forEach(animation => {
      if (reduced.matches) animation.finish();
      else if (paused() || document.hidden) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
  }
  function enter() {
    if (entrances.length || reduced.matches || !copy?.animate) return;
    const delay = document.querySelector('.page-wipe')?.getBoundingClientRect().top < innerHeight ? 650 : 0;
    copy.querySelectorAll(':scope>*').forEach((element, i) => {
      entrances.push(element.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: getComputedStyle(element).transform }], {
        duration: 750, delay: delay + i * 100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'
      }));
    });
    sync();
  }
  if (copy) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) enter();
    }, { threshold: .12 }).observe(copy);
  }
  new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
})();
