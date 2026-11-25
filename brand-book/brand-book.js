/* Bridgify brand book: interactions. No dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

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
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { say('Copy not available here'); }
      document.body.removeChild(ta);
    }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-copy]');
    if (el) {
      var v = el.getAttribute('data-copy');
      var label = el.dataset.name ? el.dataset.name + ' SVG' : (v.length > 40 ? 'to the clipboard' : v);
      copy(v, label);
      return;
    }
    var from = e.target.closest('[data-copy-from]');
    if (from) { copy($('#' + from.dataset.copyFrom).textContent, 'the CSS'); }
  });

  /* ---------- downloads inside a claude.ai artifact (plain links work everywhere else) */
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (dl) {
      if (!dl) return;
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[download]');
        if (!a) return;
        e.preventDefault();
        var href = a.getAttribute('href');
        fetch(href).then(function (r) { return r.blob(); }).then(function (blob) {
          return dl.save({ filename: href.split('/').pop(), data: blob });
        }).then(function () { say('Saved ' + href.split('/').pop()); }, function (err) {
          if (err && err.code === 'declined') return;
          say('This file can’t be saved here');
        });
      });
    });
  }

  /* ---------- chapter menu (tablet and phone) */
  var btn = $('#menu-btn'), toc = $('#toc');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    toc.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  toc.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- active chapter */
  var links = {};
  $$('.toc a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        $$('.toc a.is-active').forEach(function (a) { a.classList.remove('is-active'); });
        var a = links[en.target.id];
        if (a) a.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section.ch').forEach(function (s) { spy.observe(s); });

  /* ---------- entrance */
  if (reduce || !('IntersectionObserver' in window)) {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  } else {
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) { rev.observe(el); });
  }
  var ed = $('#entrance-demo');
  if (ed && !reduce) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { ed.classList.remove('play'); void ed.offsetWidth; ed.classList.add('play'); }
        else { ed.classList.remove('play'); }
      });
    }, { threshold: 0.6 }).observe(ed);
  }
  if (reduce) { $$('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); }); }

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
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        var n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); n.click();
      });
    });
  }
  seg($('#logo .seg'), function (t) { $('#logo-grid').setAttribute('data-logobg', t.dataset.bg); });
  seg($('#type-seg'), function (t) { $('#type-list').setAttribute('data-dev', t.dataset.dev); });
  seg($('#icons .seg'), function (t) { $('#icons-grid').style.setProperty('--isize', t.dataset.isize + 'px'); });
  seg($('.seg-demo'));
  seg($('#pat-seg'), function (t) {
    var w = t.dataset.w;
    $('#pats').classList.toggle('w390', w === '390');
    $$('#pats img[data-pat]').forEach(function (img) { img.src = 'assets/patterns/' + img.dataset.pat + '-' + w + '.jpg'; });
  });

  /* ---------- chips, stepper */
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.chip', c.parentNode).forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
    });
  });
  $$('#stepper button').forEach(function (b, _, all) {
    b.addEventListener('click', function () {
      all.forEach(function (o) { if (o === b) o.setAttribute('aria-current', 'step'); else o.removeAttribute('aria-current'); });
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
    var avail = screen.clientWidth - 32;
    var scale = Math.min(1, avail / 1920);
    page.style.width = (w * scale) + 'px';
    c.style.left = c.style.right = (m * scale) + 'px';
    c.style.gap = (gap * scale) + 'px';
    c.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    if (c.children.length !== cols) {
      c.innerHTML = '';
      for (var i = 0; i < cols; i++) c.appendChild(document.createElement('span'));
    }
  }
  if (gw) { gw.addEventListener('input', grid); window.addEventListener('resize', grid); grid(); }

  /* ---------- easing curves */
  $$('.curves figure').forEach(function (f) {
    var b = f.dataset.bez.split(',').map(Number);
    var p = $('path', f), dot = $('circle', f);
    p.setAttribute('d', 'M0 100 C' + b[0] * 100 + ' ' + (100 - b[1] * 100) + ' ' + b[2] * 100 + ' ' + (100 - b[3] * 100) + ' 100 0');
    if (reduce) { dot.setAttribute('cx', 100); dot.setAttribute('cy', 0); return; }
    var len = p.getTotalLength(), t0 = null;
    function bez(t, a, c) { var u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * c + t * t * t; }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var t = ((ts - t0) % 2400) / 1600; if (t > 1) t = 1;
      // x is time; find point on curve whose x == t
      var lo = 0, hi = 1, s;
      for (var k = 0; k < 20; k++) { s = (lo + hi) / 2; if (bez(s, b[0], b[2]) < t) lo = s; else hi = s; }
      dot.setAttribute('cx', t * 100);
      dot.setAttribute('cy', 100 - bez(s, b[1], b[3]) * 100);
      requestAnimationFrame(frame);
    }
    void len;
    requestAnimationFrame(frame);
  });
})();
