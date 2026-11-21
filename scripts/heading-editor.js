// Local heading line-break editor (served only by scripts/heading-editor.py, never deployed).
// Click "עריכת כותרות", click a heading, click the gaps between words to set breaks, preview, save.
(() => {
  const FILE = window.__HE_FILE;
  if (!FILE || window.__HE_READY) return;
  window.__HE_READY = true;
  const KINDS = ['', 'all', 'desk', 'wide'];
  const LABEL = { '': '', all: '↵', desk: '↵ D', wide: '↵ T+D', keep: '↵ *', other: '↵ *' };
  const NAME = {
    all: 'שבירה בכל המסכים',
    desk: 'שבירה רק בדסקטופ (1024 ומעלה)',
    wide: 'שבירה בטאבלט ודסקטופ (600 ומעלה)',
    keep: 'שבירה קיימת עם הגדרה של הדף (נשמרת כמו שהיא)'
  };
  const SEL = 'h1,h2,h3,h4';
  let active = false, current = null;

  const css = document.createElement('style');
  css.textContent = `
  .he-ui,.he-ui *{box-sizing:border-box;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;letter-spacing:0!important;text-transform:none!important}
  .he-toggle{position:fixed;left:16px;bottom:16px;z-index:2147483646;padding:10px 16px;border:0;border-radius:999px;background:#180F10;color:#EEE9DE;box-shadow:0 6px 24px #0006;cursor:pointer}
  .he-toggle.on{background:#F46649;color:#180F10}
  body.he-on :is(${SEL}){cursor:pointer!important}
  body.he-on :is(${SEL}):hover{outline:2px dashed #F46649!important;outline-offset:6px}
  .he-target{outline:2px solid #F46649!important;outline-offset:6px}
  .he-panel{position:fixed;right:16px;bottom:16px;z-index:2147483647;width:min(560px,calc(100vw - 32px));max-height:70vh;overflow:auto;padding:18px;border-radius:14px;background:#fff;color:#180F10;box-shadow:0 12px 48px #0007;direction:rtl}
  .he-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;color:#6b5f5c;font-size:12px!important}
  .he-words{direction:ltr;display:flex;flex-wrap:wrap;align-items:center;gap:4px 0;padding:12px;border:1px solid #e6e0d8;border-radius:10px;background:#faf8f4}
  .he-word{padding:2px 4px;font-size:16px!important}
  .he-gap{min-width:18px;height:28px;margin:0 1px;padding:0 4px;border:1px dashed #cfc6bb;border-radius:6px;background:#fff;color:#B83A23;cursor:pointer;font-size:12px!important;font-weight:700!important}
  .he-gap:hover{border-color:#F46649}
  .he-gap.k-all{background:#F46649;color:#fff;border:0}
  .he-gap.k-desk{background:#1b6fd6;color:#fff;border:0}
  .he-gap.k-wide{background:#6a3fc9;color:#fff;border:0}
  .he-gap.k-keep{background:#8a7f78;color:#fff;border:0}
  .he-break{flex-basis:100%;height:0}
  .he-legend{margin:10px 0 0;color:#6b5f5c;font-size:12px!important}
  .he-legend b{display:inline-block;min-width:34px;padding:0 4px;border-radius:4px;color:#fff;text-align:center;font-size:11px!important}
  .he-row{display:flex;gap:8px;margin-top:14px;align-items:center;flex-wrap:wrap}
  .he-btn{padding:8px 16px;border-radius:8px;border:1px solid #cfc6bb;background:#fff;color:#180F10;cursor:pointer}
  .he-btn.primary{background:#F46649;border-color:#F46649;color:#fff}
  .he-msg{margin-top:10px;font-size:13px!important}
  .he-msg.err{color:#b3261e}.he-msg.ok{color:#1f7a3d}
  .he-toast{position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:2147483647;padding:10px 18px;border-radius:10px;background:#1f7a3d;color:#fff;direction:rtl}`;
  document.head.appendChild(css);

  const toggle = document.createElement('button');
  toggle.className = 'he-ui he-toggle';
  toggle.type = 'button';
  toggle.textContent = 'עריכת כותרות';
  document.body.appendChild(toggle);
  toggle.addEventListener('click', () => {
    active = !active;
    toggle.classList.toggle('on', active);
    toggle.textContent = active ? 'עריכת כותרות: פעיל (לחצו על כותרת)' : 'עריכת כותרות';
    document.body.classList.toggle('he-on', active);
    if (!active) close(true);
  });

  const post = (path, body) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json());
  const textOf = el => el.textContent;
  const squash = s => s.replace(/\s+/g, '');
  const occurrence = el => [...document.querySelectorAll(SEL)].filter(h => squash(textOf(h)) === squash(textOf(el))).indexOf(el);

  document.addEventListener('click', event => {
    if (!active || event.target.closest('.he-ui')) return;
    const heading = event.target.closest(SEL);
    if (!heading) return;
    event.preventDefault();
    event.stopPropagation();
    open(heading);
  }, true);

  async function open(heading) {
    close(true);
    const req = { file: FILE, text: textOf(heading), occ: occurrence(heading) };
    const data = await post('/__he/heading', req);
    heading.classList.add('he-target');
    current = { heading, req, original: heading.innerHTML, state: {}, data };
    const panel = document.createElement('div');
    panel.className = 'he-ui he-panel';
    current.panel = panel;
    document.body.appendChild(panel);
    if (!data.ok) {
      panel.innerHTML = `<div class="he-msg err"></div><div class="he-row"><button class="he-btn" type="button">סגירה</button></div>`;
      panel.querySelector('.he-msg').textContent = data.error;
      panel.querySelector('button').onclick = () => close(true);
      return;
    }
    Object.entries(data.breaks).forEach(([gap, kind]) => { current.state[gap] = kind === 'other' ? 'keep' : kind; });
    current.saved = { ...current.state };
    render();
  }

  function render() {
    const { panel, data, state } = current;
    panel.innerHTML = `
      <div class="he-head"><span></span><span class="he-width"></span></div>
      <div class="he-words"></div>
      <p class="he-legend">לחיצה על רווח בין מילים מחליפה: בלי שבירה → <b style="background:#F46649">↵</b> כל המסכים → <b style="background:#1b6fd6">↵ D</b> רק דסקטופ → <b style="background:#6a3fc9">↵ T+D</b> טאבלט ודסקטופ → בלי. <b style="background:#8a7f78">↵ *</b> שבירה קיימת של הדף. התצוגה בדף מתעדכנת מיד; שנו את רוחב החלון כדי לבדוק.</p>
      <div class="he-row">
        <button class="he-btn primary" type="button" data-act="save">שמירה לקובץ</button>
        <button class="he-btn" type="button" data-act="clear">בלי שבירות</button>
        <button class="he-btn" type="button" data-act="reset">ביטול שינויים</button>
        <button class="he-btn" type="button" data-act="close">סגירה</button>
      </div>
      <div class="he-msg"></div>`;
    panel.querySelector('.he-head span').textContent = `${data.file} · ${data.tag.toUpperCase()}`;
    const updateWidth = () => { const w = panel.querySelector('.he-width'); if (w) w.textContent = `רוחב חלון: ${innerWidth}px`; };
    updateWidth();
    window.onresize = updateWidth;
    const row = panel.querySelector('.he-words');
    data.words.forEach((word, i) => {
      const w = document.createElement('span');
      w.className = 'he-word';
      w.textContent = word;
      row.appendChild(w);
      if (i === data.words.length - 1) return;
      const kind = state[i] || '';
      const gap = document.createElement('button');
      gap.type = 'button';
      gap.className = `he-gap k-${kind || 'none'}`;
      gap.textContent = LABEL[kind] || '·';
      gap.title = NAME[kind] || 'בלי שבירה';
      gap.onclick = () => {
        const order = state[i] === 'keep' ? ['keep', ...KINDS] : KINDS;
        state[i] = order[(order.indexOf(state[i] || '') + 1) % order.length];
        if (!state[i]) delete state[i];
        preview();
      };
      row.appendChild(gap);
      if (kind) { const br = document.createElement('span'); br.className = 'he-break'; row.appendChild(br); }
    });
    panel.querySelector('[data-act="save"]').onclick = save;
    panel.querySelector('[data-act="clear"]').onclick = () => { current.state = {}; preview(); };
    panel.querySelector('[data-act="reset"]').onclick = () => { current.state = { ...current.saved }; preview(); };
    panel.querySelector('[data-act="close"]').onclick = () => close(true);
  }

  async function preview() {
    const res = await post('/__he/preview', { ...current.req, breaks: current.state });
    render();
    const msg = current.panel.querySelector('.he-msg');
    if (!res.ok) { msg.className = 'he-msg err'; msg.textContent = res.error; return; }
    current.heading.innerHTML = res.html;
    if (current.data.has_type_css === false && Object.values(current.state).some(k => k === 'desk' || k === 'wide')) {
      msg.className = 'he-msg err';
      msg.textContent = 'הדף הזה לא טוען את brand-typography.css, אז שבירה של דסקטופ/טאבלט תופיע בו בכל המסכים.';
    }
  }

  async function save() {
    const msg = current.panel.querySelector('.he-msg');
    const res = await post('/__he/save', { ...current.req, breaks: current.state });
    if (!res.ok) { msg.className = 'he-msg err'; msg.textContent = res.error; return; }
    try { sessionStorage.setItem('he-toast', res.changed ? `נשמר ב-${res.file}` : 'אין שינוי לשמור'); sessionStorage.setItem('he-y', String(scrollY)); sessionStorage.setItem('he-on', '1'); } catch (e) { /* private mode */ }
    location.reload();
  }

  function close(restore) {
    if (!current) return;
    if (restore && current.original != null) current.heading.innerHTML = current.original;
    current.heading.classList.remove('he-target');
    current.panel?.remove();
    window.onresize = null;
    current = null;
  }

  try {
    const toast = sessionStorage.getItem('he-toast');
    if (toast) {
      const y = Number(sessionStorage.getItem('he-y') || 0);
      sessionStorage.removeItem('he-toast');
      sessionStorage.removeItem('he-y');
      setTimeout(() => scrollTo(0, y), 300);
      const t = document.createElement('div');
      t.className = 'he-ui he-toast';
      t.textContent = toast;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    }
    if (sessionStorage.getItem('he-on') === '1') { sessionStorage.removeItem('he-on'); toggle.click(); }
  } catch (e) { /* private mode */ }
})();
