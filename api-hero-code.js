/* Experiences API hero: request → response → rendered card, with field highlighting.
   Ported from output/element-lab (approved 14 Nov 2026). Illustrative request; endpoint and fields to follow the API documentation. */
(() => {
  const box = document.querySelector('[data-api-hero-code]'); if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = box) => r.querySelector(s), $$ = (s, r = box) => [...r.querySelectorAll(s)];

  const URL = '$BRIDGIFY_API_URL/experiences';
  const REQ = {
    curl: [
      `<b class="m">curl</b> <i class="s">"${URL}"</i> \\`,
      `  <b class="k">-G</b> <b class="k">-d</b> destination=paris \\`,
      `  <b class="k">-d</b> category=attraction_ticket \\`,
      `  <b class="k">-d</b> date=2026-11-20 \\`,
      `  <b class="k">-H</b> <i class="s">"Authorization: Bearer $BRIDGIFY_KEY"</i>`
    ],
    node: [
      `<b class="m">const</b> res = <b class="m">await</b> fetch(`,
      `  <i class="s">\`\${process.env.BRIDGIFY_API_URL}/experiences?destination=paris\`</i>,`,
      `  { headers: { Authorization: <i class="s">\`Bearer \${process.env.BRIDGIFY_KEY}\`</i> } }`,
      `);`,
      `<b class="m">const</b> { data } = <b class="m">await</b> res.json();`
    ],
    python: [
      `<b class="m">import</b> os, requests`,
      `r = requests.get(`,
      `    <i class="s">f"{os.environ['BRIDGIFY_API_URL']}/experiences"</i>,`,
      `    params={<i class="s">"destination"</i>: <i class="s">"paris"</i>, <i class="s">"category"</i>: <i class="s">"attraction_ticket"</i>},`,
      `    headers={<i class="s">"Authorization"</i>: <i class="s">f"Bearer {os.environ['BRIDGIFY_KEY']}"</i>},`,
      `)`
    ]
  };

  /* Timeline: elements with data-at get .is-on once the clock passes them; runs only while visible. */
  const KEYS = ['title', 'category', 'city', 'rating', 'price', 'slots', 'cancel', 'merged'];
  const START = 4.4, STEP = 1.6, DUR = START + STEP * KEYS.length * 2;
  let t = reduce ? DUR : 0, raf = 0, last = 0, playing = !reduce, visible = false, manual = false, current;
  const hl = k => { if (k === current) return; current = k; $$('[data-k]').forEach(el => el.classList.toggle('is-hl', el.dataset.k === k)); };
  const apply = () => {
    $$('[data-at]').forEach(p => p.classList.toggle('is-on', t >= +p.dataset.at));
    if (!manual) hl(t >= START && !reduce ? KEYS[Math.floor((t - START) / STEP) % KEYS.length] : null);
  };
  const live = () => playing && visible && !reduce && !document.hidden;
  const frame = now => {
    raf = 0; if (!live()) return;
    t += Math.min((now - last) / 1000, .1); last = now;
    if (t >= DUR) { t = 0; hl(null); snap(); }
    apply(); raf = requestAnimationFrame(frame);
  };
  const sync = () => { if (live() && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const snap = () => { box.classList.add('ahc-snap'); apply(); void box.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => box.classList.remove('ahc-snap'))); };

  /* Request language tabs */
  const pre = $('.ahc-req'), tabs = $$('[data-lang]');
  let lang = 'curl';
  const render = () => { pre.innerHTML = REQ[lang].map((l, i) => `<span data-at="${(.15 + i * .18).toFixed(2)}">${l}</span>`).join(''); apply(); };
  const select = i => {
    lang = tabs[i].dataset.lang;
    tabs.forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    render();
  };
  tabs.forEach((b, i) => b.addEventListener('click', () => select(i)));
  $('.ahc-tabs').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement), s = {ArrowRight: 1, ArrowLeft: -1}[e.key];
    if (i < 0 || !s) return;
    e.preventDefault(); const n = (i + s + tabs.length) % tabs.length; tabs[n].focus(); select(n);
  });

  /* Copy the request */
  $('[data-copy]').addEventListener('click', async e => {
    const b = e.currentTarget, label = b.textContent;
    try { await navigator.clipboard.writeText(pre.textContent); b.textContent = 'Copied'; } catch (err) { b.textContent = 'Select and copy'; }
    b.classList.add('is-done'); setTimeout(() => { b.textContent = label; b.classList.remove('is-done'); }, 1600);
  });

  /* Pointer over a field highlights it in the JSON and in the card */
  $$('[data-k]').forEach(el => {
    el.addEventListener('pointerenter', () => { manual = true; hl(el.dataset.k); });
    el.addEventListener('pointerleave', () => { manual = false; });
  });

  /* Controls */
  const ctl = box.parentElement.querySelector('.ahc-controls');
  const pauseBtn = ctl && ctl.querySelector('[data-pause]');
  ctl && ctl.querySelector('[data-replay]')?.addEventListener('click', () => { t = reduce ? DUR : 0; hl(null); snap(); sync(); });
  if (pauseBtn) {
    if (reduce) pauseBtn.hidden = true;
    pauseBtn.addEventListener('click', () => {
      playing = !playing;
      pauseBtn.textContent = playing ? 'Pause Ⅱ' : 'Play ▶'; pauseBtn.setAttribute('aria-pressed', String(!playing));
      sync();
    });
  }

  new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, {threshold: .2}).observe(box);
  document.addEventListener('visibilitychange', sync);
  render();
})();

/* brand-consistency.js turns every bordered element into a coral brand frame/button on DOMContentLoaded and load.
   The code window and the normalization slider keep their own quiet chrome, so undo that inside them. */
(() => {
  const CLS = ['brand-coral-frame', 'brand-action', 'brand-action-primary', 'brand-outer-frame'];
  const clean = () => document.querySelectorAll('.ahc-visual, #network .nz-wrap, #customer-experience').forEach(root =>
    [root, ...root.querySelectorAll('*')].forEach(el => el.classList && el.classList.remove(...CLS)));
  const later = () => setTimeout(clean, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
  addEventListener('load', later);
})();
