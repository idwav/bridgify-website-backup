/* Home opportunity: each diagram is exactly as tall as its content (the stage was taller than the content, which left dead space under it),
   both stages share the taller height, and the panel centres the diagram between the title and the facts. */
(function () {
  var sec = document.getElementById('opportunity-study'); if (!sec) return;
  var stages = [].slice.call(sec.querySelectorAll('.pb-stage'));
  if (!stages.length) return;
  function fit() {
    if (innerWidth < 1024) { stages.forEach(function (s) { s.style.removeProperty('height'); var a = s.querySelector('.pb-app'); if (a) { a.style.removeProperty('top'); a.style.removeProperty('bottom'); } }); return; }
    stages.forEach(function (s) { s.style.removeProperty('height'); var a = s.querySelector('.pb-app'); if (a) { a.style.removeProperty('top'); a.style.removeProperty('bottom'); } });
    var hs = stages.map(function (s) {
      var top = s.getBoundingClientRect().top, bottom = 0;
      [].slice.call(s.children).forEach(function (c) {
        if (c.tagName.toLowerCase() === 'svg') return;
        var r = c.getBoundingClientRect(); if (r.height) bottom = Math.max(bottom, r.bottom - top);
      });
      var firstTop = Math.min.apply(null, [].slice.call(s.querySelectorAll('.pb-sup')).map(function (e) { return e.getBoundingClientRect().top - top; }));
      var padTop = Math.round(parseFloat(getComputedStyle(s.querySelector('.pb-sup')).top) || 12); return Math.ceil(bottom + padTop);
    });
    var h = Math.max.apply(null, hs);
    stages.forEach(function (s) {
      s.style.setProperty('height', h + 'px', 'important');
      /* the YourBrand cards end on the same line, 12px above the bottom of the stage, so the diagram has the same space above and below */
      var app = s.querySelector('.pb-app'), sup = s.querySelector('.pb-sup');
      if (app && sup) {
        var pad = Math.round(parseFloat(getComputedStyle(sup).top) || 12);
        app.style.setProperty('top', (h - Math.round(app.getBoundingClientRect().height) - pad) + 'px', 'important');
        app.style.setProperty('bottom', 'auto', 'important');
        /* correct for any transform the card carries: measure the real gap under it and move it by the difference */
        var gap = Math.round(s.getBoundingClientRect().bottom - app.getBoundingClientRect().bottom);
        if (gap !== pad) app.style.setProperty('top', ((h - Math.round(app.getBoundingClientRect().height) - pad) + (gap - pad)) + 'px', 'important');
      }
    });
  }
  var raf = 0, queue = function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
  addEventListener('resize', queue); addEventListener('load', queue);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  new ResizeObserver(queue).observe(sec);
  queue();
})();
