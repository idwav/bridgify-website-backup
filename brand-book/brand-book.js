/* Bridgify brand book v2: interactions. No dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- toast + copy */
  var toast = $('#toast'), toastT;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('show'); }, 1600);
  }
  function copy(text, label) {
    var done = function () { say('Copied ' + (label || text)); };
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { say('Copy not available here'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-copy]');
    if (el) {
      var v = el.getAttribute('data-copy');
      copy(v, el.dataset.name ? el.dataset.name + ' SVG' : (v.length > 40 ? 'to the clipboard' : v));
      return;
    }
    var from = e.target.closest('[data-copy-from]');
    if (from) copy($('#' + from.dataset.copyFrom).textContent, from.dataset.copyFrom === 'css-tokens' ? 'tokens.css' : 'the CSS');
  });

  /* ---------- downloads inside a claude.ai artifact (plain links work everywhere else) */
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (dl) {
      if (!dl) return;
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[download]');
        if (!a) return;
        e.preventDefault();
        var href = a.getAttribute('href'), name = href.split('/').pop();
        fetch(href).then(function (r) { return r.blob(); })
          .then(function (blob) { return dl.save({ filename: name, data: blob }); })
          .then(function () { say('Saved ' + name); }, function (err) {
            if (err && err.code === 'declined') return;
            say('This file can’t be saved here');
          });
      });
    });
  }

  /* ---------- spreads: folios, contents, bar */
  var spreads = $$('section.spread');
  function label(s) {
    var ch = s.dataset.chapter || 'Brand book', t = s.dataset.title || '', bare = ch.replace(/^\d+\s·\s/, '');
    return t && t !== ch && t !== bare ? ch + ' · ' + t : ch;
  }
  var total = spreads.length;
  var list = $('#toc-list'), groups = {}, order = [];
  spreads.forEach(function (s, i) {
    var ch = s.dataset.chapter || 'Brand book', title = s.dataset.title || '';
    s.dataset.n = i + 1;
    if (s.id !== 'color') {
      var f = document.createElement('div');
      f.className = 'folio t-caption';
      f.setAttribute('aria-hidden', 'true');
      f.innerHTML = '<span></span><span></span>';
      f.children[0].textContent = label(s);
      f.children[1].textContent = pad(i + 1) + ' / ' + total;
      s.appendChild(f);
    }
    if (!groups[ch]) { groups[ch] = []; order.push(ch); }
    groups[ch].push(s);
  });
  order.forEach(function (ch) {
    var li = document.createElement('li');
    var h = document.createElement('h3');
    var m = ch.match(/^(\d+)\s·\s(.*)$/);
    if (m) { h.innerHTML = '<span></span>'; h.firstChild.textContent = m[1]; h.appendChild(document.createTextNode(m[2])); }
    else h.textContent = ch;
    li.appendChild(h);
    var ol = document.createElement('ol');
    groups[ch].forEach(function (s) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.innerHTML = '<span class="t-index"></span>';
      a.firstChild.textContent = pad(+s.dataset.n);
      a.appendChild(document.createTextNode(s.dataset.title || ''));
      var item = document.createElement('li'); item.appendChild(a); ol.appendChild(item);
    });
    li.appendChild(ol);
    list.appendChild(li);
  });

  var btn = $('#menu-btn'), toc = $('#toc');
  function setMenu(open) { btn.setAttribute('aria-expanded', String(open)); toc.classList.toggle('open', open); }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  toc.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  var barCh = $('#bar-chapter'), barFolio = $('#bar-folio'), barProg = $('#bar-progress'), current = spreads[0];
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      current = en.target;
      barCh.textContent = label(current);
      barFolio.textContent = pad(+current.dataset.n) + ' / ' + total;
      $$('.toc a.is-active').forEach(function (a) { a.classList.remove('is-active'); });
      var a = $('.toc a[href="#' + current.id + '"]'); if (a) a.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spreads.forEach(function (s) { spy.observe(s); });
  function progress() {
    var max = doc.scrollHeight - innerHeight;
    barProg.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
  }
  addEventListener('scroll', progress, { passive: true }); progress();

  /* keyboard page turning */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); return; }
    var t = e.target;
    if (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    var d = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : (e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0;
    if (!d) return;
    var i = spreads.indexOf(current) + d;
    if (i < 0 || i >= total) return;
    e.preventDefault();
    spreads[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- living visuals: play when a spread is in view */
  function whenSeen(el, onIn, onOut, threshold) {
    if (!el) return;
    if (reduce) { onIn(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) onIn(); else if (onOut) onOut(); });
    }, { threshold: threshold || 0.45 }).observe(el);
  }
  ['#the-line', '#voice'].forEach(function (sel) {
    var el = $(sel);
    whenSeen(el, function () { el.classList.add('play'); }, function () { el.classList.remove('play'); });
  });
  var col = $('#collapse');
  whenSeen(col, function () { setTimeout(function () { col.classList.add('play'); }, 500); }, function () { col.classList.remove('play'); });
  var sym = $('#symbol-draw');
  whenSeen(sym && sym.parentNode, function () { sym.classList.add('play'); }, function () { sym.classList.remove('play'); });

  /* counters */
  $$('.big-stat').forEach(function (el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || '', ran = false;
    whenSeen(el, function () {
      if (ran || reduce || to < 2) return;
      ran = true;
      var t0 = null;
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, null, 0.6);
  });

  /* intent typing */
  var intent = $('#intent'), typed = $('#intent-typed'), sentence = 'I want to do something romantic in Paris.', typeT;
  whenSeen(intent, function () {
    clearInterval(typeT); intent.classList.remove('done');
    if (reduce) { typed.textContent = sentence; intent.classList.add('done'); return; }
    var i = 0; typed.textContent = '';
    typeT = setInterval(function () {
      typed.textContent = sentence.slice(0, ++i);
      if (i >= sentence.length) { clearInterval(typeT); setTimeout(function () { intent.classList.add('done'); }, 350); }
    }, 55);
  }, function () { clearInterval(typeT); });

  /* positioning map */
  var note = $('#pmap-note');
  $$('.pdot').forEach(function (d) {
    var show = function () {
      $$('.pdot.is-on').forEach(function (o) { o.classList.remove('is-on'); });
      d.classList.add('is-on');
      note.textContent = d.textContent + ': ' + d.dataset.note;
    };
    d.addEventListener('mouseenter', show); d.addEventListener('focus', show); d.addEventListener('click', show);
  });

  /* ---------- segmented controls */
  function seg(group, onPick) {
    if (!group) return;
    var tabs = $$('[role="tab"]', group);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { o.setAttribute('aria-selected', String(o === t)); });
        if (onPick) onPick(t);
      });
      t.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault(); e.stopPropagation();
        var n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); n.click();
      });
    });
  }
  seg($('.logo-hero-seg'), function (t) { $('#logo').setAttribute('data-bg', t.dataset.bg); });
  seg($('#type-seg'), function (t) { $('#type-list').setAttribute('data-dev', t.dataset.dev); });
  seg($('#icons .seg'), function (t) { $('#icons-grid').style.setProperty('--isize', t.dataset.isize + 'px'); });
  seg($('.seg-demo'));
  seg($('#tester-font'), function (t) {
    var tx = $('#tester-text');
    tx.classList.toggle('f-display', t.dataset.font === 'display');
    tx.classList.toggle('f-text', t.dataset.font === 'text');
  });
  seg($('#pat-seg'), function (t) {
    var w = t.dataset.w;
    $('#pats').classList.toggle('w390', w === '390');
    $$('#pats img[data-pat]').forEach(function (img) { img.src = 'assets/patterns/' + img.dataset.pat + '-' + w + '.jpg'; });
  });
  var ts = $('#tester-size');
  if (ts) ts.addEventListener('input', function () { $('#tester-text').style.fontSize = ts.value + 'px'; $('#tester-size-out').textContent = ts.value; });

  /* ---------- four capabilities */
  var stage = $('#pl-stage'), plTabs = $$('.pl-tabs [role="tab"]'), plTimer = null, plManual = false;
  function setPillar(n) {
    stage.dataset.p = n;
    plTabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.p === String(n))); });
  }
  plTabs.forEach(function (t) { t.addEventListener('click', function () { plManual = true; clearInterval(plTimer); setPillar(t.dataset.p); }); });
  whenSeen($('#pillars'), function () {
    if (plManual || reduce) return;
    clearInterval(plTimer);
    plTimer = setInterval(function () { setPillar((+stage.dataset.p % 4) + 1); }, 4200);
  }, function () { clearInterval(plTimer); }, 0.5);

  var ORDER = { family: ['wp', 'km', 'ft', 'ss', 'ah', 'sd'], couple: ['sd', 'ss', 'ft', 'ah', 'wp', 'km'], solo: ['ah', 'ft', 'ss', 'sd', 'km', 'wp'] };
  var psList = $('#ps-list');
  function rank(p) {
    var items = $$('li', psList), first = new Map(items.map(function (li) { return [li, li.getBoundingClientRect().top]; }));
    ORDER[p].forEach(function (id, i) {
      var li = $('li[data-id="' + id + '"]', psList);
      psList.appendChild(li);
      $('.ps-rank', li).textContent = '#' + (i + 1);
      li.classList.toggle('top', i < 3);
    });
    $$('.ps-profiles .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.prof === p)); });
    if (reduce) return;
    items.forEach(function (li) {
      var dy = first.get(li) - li.getBoundingClientRect().top;
      if (!dy) return;
      li.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  }
  if (psList) {
    rank('couple');
    $$('.ps-profiles .chip').forEach(function (c) { c.addEventListener('click', function () { rank(c.dataset.prof); }); });
  }

  /* ---------- chips */
  $$('.chips .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.chip', c.parentNode).forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
    });
  });

  /* ---------- icon search */
  var q = $('#icon-q');
  if (q) q.addEventListener('input', function () {
    var v = q.value.trim().toLowerCase();
    $$('.icon-tile').forEach(function (t) { t.hidden = v && t.dataset.name.indexOf(v) === -1; });
  });

  /* ---------- grid lab: same rules as wide/grid.css and the mobile layer */
  var gw = $('#gw');
  function grid() {
    var w = +gw.value, bp, m, cols;
    if (w < 600) { bp = 'Phone'; m = 24; cols = 4; }
    else if (w < 1024) { bp = 'Tablet'; m = 32; cols = 8; }
    else { bp = 'Desktop'; m = Math.max(Math.min(Math.max(40, w * 0.04), 64), (w - 1560) / 2); cols = 12; }
    var gap = w < 600 ? 16 : w < 1024 ? 24 : 32;
    $('#gw-out').textContent = w;
    $('#gw-info').textContent = bp + ' · margin ' + Math.round(m) + 'px · ' + cols + ' columns · content ' + Math.round(w - 2 * m) + 'px';
    var screen = $('#gw-screen'), page = $('#gw-page'), c = $('#gw-cols');
    var scale = Math.min(1, (screen.clientWidth - 32) / 1920);
    page.style.width = (w * scale) + 'px';
    c.style.left = c.style.right = (m * scale) + 'px';
    c.style.gap = (gap * scale) + 'px';
    c.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    if (c.children.length !== cols) { c.innerHTML = ''; for (var i = 0; i < cols; i++) c.appendChild(document.createElement('span')); }
  }
  if (gw) { gw.addEventListener('input', grid); addEventListener('resize', grid); grid(); }

  /* ---------- easing curves */
  $$('.curves figure').forEach(function (f) {
    var b = f.dataset.bez.split(',').map(Number), p = $('path', f), dot = $('circle', f);
    p.setAttribute('d', 'M0 100 C' + b[0] * 100 + ' ' + (100 - b[1] * 100) + ' ' + b[2] * 100 + ' ' + (100 - b[3] * 100) + ' 100 0');
    if (reduce) { dot.setAttribute('cx', 100); dot.setAttribute('cy', 0); return; }
    function bez(t, a, c) { var u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * c + t * t * t; }
    var t0 = null;
    (function frame(ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, ((ts - t0) % 2400) / 1600), lo = 0, hi = 1, s = 0;
      for (var k = 0; k < 20; k++) { s = (lo + hi) / 2; if (bez(s, b[0], b[2]) < t) lo = s; else hi = s; }
      dot.setAttribute('cx', t * 100); dot.setAttribute('cy', 100 - bez(s, b[1], b[3]) * 100);
      requestAnimationFrame(frame);
    })(performance.now());
  });

  if (reduce) $$('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
})();
