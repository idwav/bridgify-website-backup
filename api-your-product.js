/* API · Keep the customer experience in your product (#customer-experience).
   Auto-plays one booking inside the partner's app; the Bridgify base logs each call. Brand changes every loop.
   Ported from output/element-lab/cj.js (approved 14 Nov 2026). Illustrative data, made-up brands. */
(() => {
  const root = document.querySelector('#customer-experience [data-cj]'); if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const BRANDS = ['YourAir', 'YourBank', 'YourApp'];
  const CALLS = [[.7, 1.9, 'search'], [4.5, 5.7, 'availability'], [7.9, 9.1, 'book']];
  const STEPS = [3.6, 6.2, 8.6], DUR = 13;
  const port = $('.cj-port'), call = $('.cj-call'), steps = $$('.cj-steps li'), logs = $$('.cj-log li');
  const pick = $('.cj-row'), slot = $$('.cj-slots span')[1];
  let t = reduce ? DUR : 0, raf = 0, last = 0, playing = !reduce, visible = false, brand = -1, active = null, step = 0;

  const setBrand = i => {
    brand = i % BRANDS.length; root.dataset.brand = brand;
    $$('[data-brand-name]').forEach(el => { el.textContent = BRANDS[brand]; });
  };
  const apply = () => {
    $$('[data-at]').forEach(p => p.classList.toggle('is-on', t >= +p.dataset.at && !(p.dataset.off && t >= +p.dataset.off)));
    const s = 1 + STEPS.filter(x => t >= x).length;
    if (s !== step) {
      step = s; root.dataset.step = s;
      steps.forEach((li, i) => { li.classList.toggle('is-done', i + 1 < s); li.classList.toggle('is-now', i + 1 === s); });
    }
    const c = CALLS.findIndex(([a, b]) => t >= a && t < b);
    if (c !== active) {
      active = c;
      port.classList.toggle('is-up', c >= 0 && !reduce);
      if (c >= 0) call.textContent = `Bridgify API · ${CALLS[c][2]}`;
    }
    logs.forEach((li, i) => { li.classList.toggle('is-now', i === c); li.classList.toggle('is-done', t >= CALLS[i][1]); });
    pick.classList.toggle('is-pick', t >= 2.9 && s === 1);
    slot.classList.toggle('is-on', t >= 5.1);
  };
  const snap = () => { root.classList.add('cj-snap'); apply(); void root.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('cj-snap'))); };
  const live = () => playing && visible && !reduce && !document.hidden;
  const frame = now => {
    raf = 0; if (!live()) return;
    t += Math.min((now - last) / 1000, .1); last = now;
    if (t >= DUR) { t = 0; setBrand(brand + 1); snap(); }
    apply(); raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    root.classList.toggle('is-paused', !live() && !reduce);
    if (live() && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  };

  const ctl = root.querySelector('.cj-controls');
  ctl.querySelector('[data-replay]').addEventListener('click', () => { t = reduce ? DUR : 0; setBrand(brand + 1); snap(); sync(); });
  const pauseBtn = ctl.querySelector('[data-pause]');
  if (reduce) pauseBtn.hidden = true;
  pauseBtn.addEventListener('click', () => {
    playing = !playing;
    pauseBtn.textContent = playing ? 'Pause Ⅱ' : 'Play ▶'; pauseBtn.setAttribute('aria-pressed', String(!playing));
    sync();
  });

  new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, {threshold: .2}).observe(root);
  document.addEventListener('visibilitychange', sync);
  setBrand(0); apply();
})();
