// Partner login: inline validation, password reveal, Caps Lock hint and a guarded submit.
// Set data-auth-endpoint on the form to the real sign-in URL; until then the form says sign-in is not connected.
(() => {
  const form = document.getElementById('login-form');
  if (!form) return;
  const email = form.elements.email;
  const password = form.elements.password;
  const status = document.getElementById('login-status');
  const submit = form.querySelector('.login-submit');
  const reveal = form.querySelector('.login-reveal');
  const caps = document.getElementById('login-caps');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
  function check(input) {
    const value = input.value.trim();
    if (input === email) {
      if (!value) return 'Enter your work email.';
      if (!emailPattern.test(value)) return 'Enter an email address like name@company.com.';
    }
    if (input === password && !input.value) return 'Enter your password.';
    return '';
  }
  function showStatus(message, tone = 'error') {
    status.textContent = message;
    status.dataset.tone = tone;
    status.hidden = false;
    status.focus();
  }

  // Validate on leaving a field, then live once the field has shown an error.
  [email, password].forEach(input => {
    input.addEventListener('blur', () => { if (input.value) setError(input, check(input)); });
    input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) setError(input, check(input)); });
  });

  reveal.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    reveal.setAttribute('aria-pressed', String(show));
    reveal.firstChild.textContent = show ? 'Hide' : 'Show';
    password.focus();
  });

  const capsCheck = event => { if (event.getModifierState) caps.hidden = !event.getModifierState('CapsLock'); };
  password.addEventListener('keydown', capsCheck);
  password.addEventListener('keyup', capsCheck);
  password.addEventListener('blur', () => { caps.hidden = true; });

  form.addEventListener('submit', event => {
    status.hidden = true;
    const errors = [email, password].map(input => { const message = check(input); setError(input, message); return [input, message]; });
    const first = errors.find(([, message]) => message);
    if (first) {
      event.preventDefault();
      first[0].focus();
      return;
    }
    if (submit.getAttribute('aria-busy') === 'true') { event.preventDefault(); return; }
    const endpoint = form.dataset.authEndpoint;
    if (!endpoint) {
      event.preventDefault();
      showStatus('Partner sign-in is not connected on this site yet. Please contact your Bridgify account manager.', 'info');
      return;
    }
    form.action = endpoint;
    submit.setAttribute('aria-busy', 'true');
    submit.querySelector('.login-submit-label').textContent = 'Logging in…';
  });

  // Returning with the browser's back button must not leave the button stuck in its busy state.
  addEventListener('pageshow', () => {
    submit.removeAttribute('aria-busy');
    submit.querySelector('.login-submit-label').textContent = 'Log in';
  });
})();

// Octopus mascot: closes its eyes while the password is being entered, peeks with one eye after a pause in typing.
(() => {
  const mascot = document.querySelector('.login-mascot');
  const password = document.getElementById('login-password');
  if (!mascot || !password) return;
  let peek;
  const close = () => { clearTimeout(peek); mascot.dataset.eyes = 'closed'; };
  password.addEventListener('focus', close);
  password.addEventListener('input', () => {
    close();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) peek = setTimeout(() => { mascot.dataset.eyes = 'peek'; }, 850);
  });
  password.addEventListener('blur', () => { clearTimeout(peek); mascot.dataset.eyes = 'open'; });
})();

// The octopus is alive. Eyes: springs with a little overshoot, a lagging second eye, tiny idle glances and blinks.
// Right arm: a chain of four segments, each pulled by the one above it with inertia, so it trails, whips and settles like a tentacle.
(() => {
  const mascot = document.querySelector('.login-mascot');
  if (!mascot || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const eyes = [...mascot.querySelectorAll('.login-eye')];
  // Build the right arm from K thin slices. Each slice is a masked copy of the picture rotating about the centre line of the arm.
  const body = mascot.querySelector('.login-body'), root = mascot.querySelector('.login-arms');
  if (!body || !root) return;
  const K = 12, Y0 = 60.5, Y1 = 100, N = 4;
  const centre = [[56, 70], [66.3, 73.2], [75.2, 73.4], [81.5, 71.3], [88, 69.9], [97.6, 72.1], [100, 72.4]];
  const cx = y => { for (let i = 1; i < centre.length; i++) if (y <= centre[i][0]) { const [ya, xa] = centre[i - 1], [yb, xb] = centre[i]; return xa + (xb - xa) * (y - ya) / (yb - ya); } return centre[centre.length - 1][1]; };
  const slices = []; let parent = root;
  for (let k = 0; k < K; k++) {
    const ya = Y0 + (Y1 - Y0) * k / K, yb = Y0 + (Y1 - Y0) * (k + 1) / K, last = k === K - 1;
    const arm = document.createElement('div'); arm.className = 'login-arm'; arm.style.transformOrigin = cx(ya).toFixed(2) + '% ' + ya.toFixed(2) + '%';
    const im = document.createElement('img'); im.src = body.currentSrc || body.src; im.alt = ''; im.className = 'login-seg'; im.draggable = false;
    const band = 'linear-gradient(to bottom,transparent ' + (ya - 1.2).toFixed(2) + '%,#000 ' + ya.toFixed(2) + '%' + (last ? ')' : ',#000 ' + (yb + .8).toFixed(2) + '%,transparent ' + (yb + .8).toFixed(2) + '%)');
    const gate = 'linear-gradient(to right,transparent 48%,#000 48%)';
    im.style.webkitMaskImage = im.style.maskImage = band + ',' + gate;
    arm.append(im); parent.append(arm); parent = arm; slices.push(arm);
  }
  mascot.classList.add('is-live');
  const segs = slices, DEG = 180 / Math.PI;
  let px = 0, py = 0;                       // pointer, -1..1 around the octopus
  const eye = eyes.map((_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, k: i ? .16 : .22, c: i ? .5 : .56, blink: 1 }));
  const ang = Array(N).fill(0), vel = Array(N).fill(0);
  let baseT = 0, nextGlance = 1.5, gx = 0, gy = 0, nextBlink = 3, blinkT = -1, last = 0, visible = true, raf = 0, clock = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  addEventListener('pointermove', e => {
    const r = mascot.getBoundingClientRect(), cx = r.left + r.width * .5, cy = r.top + r.height * .6;
    px = clamp((e.clientX - cx) / (innerWidth * .45), -1, 1);
    py = clamp((e.clientY - cy) / (innerHeight * .45), -1, 1);
    idle = 0;
  }, { passive: true });
  let idle = 0;
  document.addEventListener('pointerleave', () => { px = 0; py = 0; });
  function step(now) {
    raf = 0; if (!visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((now - last) / 16.667, 3) : 1; last = now; clock += dt / 60; idle += dt / 60;
    // ---- eyes
    if (clock > nextGlance && idle > 2) { gx = (Math.random() - .5) * .9; gy = (Math.random() - .5) * .6; nextGlance = clock + 1.6 + Math.random() * 3; setTimeout(() => { gx = 0; gy = 0; }, 450 + Math.random() * 500); }
    const closed = mascot.dataset.eyes === 'closed';
    const lookX = closed ? 0 : (idle > 2 ? gx : px), lookY = closed ? 0 : (idle > 2 ? gy : py);
    if (clock > nextBlink && blinkT < 0 && !closed) { blinkT = clock; nextBlink = clock + 2.5 + Math.random() * 5; }
    let blinkV = 1; if (blinkT >= 0) { const u = (clock - blinkT) / .22; if (u >= 1) blinkT = -1; else blinkV = 1 - .9 * Math.sin(Math.PI * u); }
    eyes.forEach((el, i) => {
      const s = eye[i], tx = lookX * 2.6, ty = lookY * 2.1;
      s.vx += ((tx - s.x) * s.k - s.vx * (1 - s.c) * .5) * dt; s.vy += ((ty - s.y) * s.k - s.vy * (1 - s.c) * .5) * dt;
      s.vx *= Math.pow(.86, dt); s.vy *= Math.pow(.86, dt); s.x += s.vx * dt; s.y += s.vy * dt;
      el.style.setProperty('--ex', s.x.toFixed(2) + 'px'); el.style.setProperty('--ey', s.y.toFixed(2) + 'px'); el.style.setProperty('--blink', blinkV.toFixed(3));
    });
    // ---- arm: segment 0 follows the pointer (plus a slow idle sway), every next one is dragged by the motion of the one above
    const sway = Math.sin(clock * 1.3) * 1.4 + Math.sin(clock * 2.1 + 1) * .7;
    const T = -px * 6 + sway * .7 + py * 1.2;
    // Each segment is a damped spring towards the (already lagging) angle of the segment above: a cascade, so motion travels
    // down the arm with a delay, overshoots a little and settles. The rotation applied to a segment is its bend relative to its parent.
    for (let i = 0; i < N; i++) {
      const target = i === 0 ? T : ang[i - 1];
      const k = [.05, .06, .055, .05][i], c = [.2, .17, .15, .13][i];
      vel[i] += ((target - ang[i]) * k - c * vel[i]) * dt;
      ang[i] = clamp(ang[i] + vel[i] * dt, -14, 14);
    }
    // Smooth bend: the four spring angles are control points along the arm; every slice gets the difference of the interpolated angle.
    const ctl = [0, ang[1] * 1.15, ang[2] * 1.15, ang[3] * 1.15];
    const A = s => { const t = clamp(s, 0, 1) * 3, i = Math.min(2, Math.floor(t)), f0 = t - i, f = f0 * f0 * (3 - 2 * f0); return ctl[i] + (ctl[i + 1] - ctl[i]) * f; };
    for (let k = 0; k < K; k++) segs[k].style.setProperty('--a', clamp(A((k + 1) / K) - A(k / K), -3, 3).toFixed(3) + 'deg');
    raf = requestAnimationFrame(step);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(step); } }, { threshold: .05 }).observe(mascot);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf && visible) { last = 0; raf = requestAnimationFrame(step); } });
  raf = requestAnimationFrame(step);
})();

// Shy octopus: while the password is being typed (hidden), the hanging right arm lifts from its base, curls up round the
// side of the head and lies across the eyes, its tip curling up. It goes back down when the field loses focus or the
// password is shown. The moving arm is drawn on a canvas in picture coordinates (1536 x 1024) and passes through the same
// matte filter as the picture, so it takes the same colours. At rest the picture's own arm is shown.
// Reduced motion: the arm changes pose without the swing.
(() => {
  const mascot = document.querySelector('.login-mascot');
  const password = document.getElementById('login-password');
  if (!mascot || !password || !mascot.querySelector('.login-body')) return;
  const W = 1536, H = 1024, N = 40;
  // Centre lines (picture px) and half-widths along the arm (0 = base, 1 = tip).
  const REST = [[1040, 535], [1075, 573], [1124, 679], [1127, 770], [1095, 835], [1074, 901], [1107, 999], [1112, 1022]];
  const COVER = [[1046, 566], [1112, 508], [1132, 448], [1108, 409], [1031, 399], [933, 399], [834, 404], [735, 409], [636, 409], [560, 399], [530, 360], [548, 322], [580, 312]];
  const R_REST = [[0, 70], [.25, 52], [.45, 36], [.6, 28], [.75, 20], [.93, 8], [1, 3]];
  const R_COVER = [[0, 66], [.18, 62], [.5, 56], [.72, 46], [.86, 28], [1, 7]];
  const table = (tb, t) => { for (let i = 1; i < tb.length; i++) if (t <= tb[i][0]) { const [a, va] = tb[i - 1], [b, vb] = tb[i]; return va + (vb - va) * (t - a) / (b - a); } return tb[tb.length - 1][1]; };
  // Resample a polyline to N equal segments: total length and the direction of each segment (unwrapped, so it is continuous).
  function pose(pts) {
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = cum[cum.length - 1], at = d => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
    const p = Array.from({ length: N + 1 }, (_, i) => at(L * i / N)), ang = [];
    for (let i = 0; i < N; i++) { let a = Math.atan2(p[i + 1][1] - p[i][1], p[i + 1][0] - p[i][0]); if (i) { while (a - ang[i - 1] > Math.PI) a -= 2 * Math.PI; while (a - ang[i - 1] < -Math.PI) a += 2 * Math.PI; } ang.push(a); }
    return { root: p[0], L, ang };
  }
  const rest = pose(REST), cover = pose(COVER);
  // The arm lifts outwards (anticlockwise), never through the head: keep every lifted direction anticlockwise of the resting one.
  const shift = Math.ceil((cover.ang[0] - rest.ang[0]) / (2 * Math.PI)); cover.ang = cover.ang.map(a => a - shift * 2 * Math.PI);

  const wrap = document.createElement('div'); wrap.className = 'login-fig login-cover'; wrap.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas'); wrap.append(canvas); mascot.append(wrap);
  const ctx = canvas.getContext('2d');
  const grey = v => { const c = Math.round(v * 255); return `rgb(${c},${c},${c})`; };

  function draw(u) {   // u: 0 = resting, 1 = covering the eyes; each segment follows the one before it with a small delay
    const box = canvas.getBoundingClientRect(); if (!box.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), cw = Math.round(box.width * dpr), ch = Math.round(box.height * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cw, ch);
    const k = cw / W; ctx.setTransform(k, 0, 0, k, 0, 0);
    const P = [[rest.root[0] + (cover.root[0] - rest.root[0]) * u, rest.root[1] + (cover.root[1] - rest.root[1]) * u]], R = [], Nm = [];
    const seg = (rest.L + (cover.L - rest.L) * u) / N;
    for (let i = 0; i < N; i++) {
      const lag = i / N * .35, v = Math.max(0, Math.min(1, (u - lag * (1 - u)) / (1 - lag * (1 - u) || 1)));
      const a = rest.ang[i] + (cover.ang[i] - rest.ang[i]) * v;
      P.push([P[i][0] + Math.cos(a) * seg, P[i][1] + Math.sin(a) * seg]);
    }
    for (let i = 0; i <= N; i++) {
      const t = i / N; R.push(table(R_REST, t) + (table(R_COVER, t) - table(R_REST, t)) * u);
      const a = P[Math.min(i + 1, N)], b = P[Math.max(i - 1, 0)], dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1;
      Nm.push([-dy / l, dx / l]);
    }
    // Outline of the tapered arm.
    const outline = new Path2D();
    for (let i = 0; i <= N; i++) outline[i ? 'lineTo' : 'moveTo'](P[i][0] + Nm[i][0] * R[i], P[i][1] + Nm[i][1] * R[i]);
    const tip = P[N], tn = Nm[N]; outline.arc(tip[0], tip[1], R[N], Math.atan2(tn[1], tn[0]), Math.atan2(-tn[1], -tn[0]));
    for (let i = N; i >= 0; i--) outline.lineTo(P[i][0] - Nm[i][0] * R[i], P[i][1] - Nm[i][1] * R[i]);
    outline.closePath();
    // Once lifted, the arm stands on the card edge like the body (flat at the line the picture is cut at).
    const cut = 539 + 560 * (1 - Math.min(1, Math.max(0, (u - .3) / .5)));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, cut); ctx.clip();
    ctx.fillStyle = grey(.56); ctx.fill(outline);
    ctx.save(); ctx.clip(outline);
    // Shade: darker on the underside, a soft light band on the top side, lit from above.
    const band = (side, width, shade, blur) => {
      ctx.filter = `blur(${blur * k * dpr / dpr}px)`; ctx.strokeStyle = grey(shade); ctx.lineCap = 'round';
      for (let i = 0; i < N; i++) {
        const s = Nm[i][1] > 0 ? side : -side;   // side > 0: towards the bottom of the screen
        ctx.lineWidth = R[i] * width; ctx.beginPath();
        ctx.moveTo(P[i][0] + Nm[i][0] * s * R[i] * .62, P[i][1] + Nm[i][1] * s * R[i] * .62);
        ctx.lineTo(P[i + 1][0] + Nm[i + 1][0] * s * R[i + 1] * .62, P[i + 1][1] + Nm[i + 1][1] * s * R[i + 1] * .62); ctx.stroke();
      }
      ctx.filter = 'none';
    };
    band(1, .9, .36, 14); band(-1, .5, .8, 10);
    // Suckers along the underside: they turn from the body side (resting) to the bottom edge (lifted).
    let next = R[0] * .5;
    const cum = [0]; for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    for (let i = 1; i < N; i++) {
      if (cum[i] < next) continue;
      const rs = R[i] * .27; if (rs < 3) break;
      const restSide = -1, coverSide = Nm[i][1] > 0 ? 1 : -1, s = restSide + (coverSide - restSide) * u;
      const x = P[i][0] + Nm[i][0] * s * R[i] * .66, y = P[i][1] + Nm[i][1] * s * R[i] * .66;
      ctx.fillStyle = grey(.78); ctx.beginPath(); ctx.arc(x, y, rs, 0, 7); ctx.fill();
      ctx.fillStyle = grey(.5); ctx.beginPath(); ctx.arc(x, y, rs * .5, 0, 7); ctx.fill();
      next = cum[i] + rs * 2.5;
    }
    ctx.restore(); ctx.restore();
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const easeUp = x => 1 - Math.pow(1 - x, 4), easeDown = x => 1 - Math.pow(1 - x, 3);
  let u = 0, from = 0, to = 0, start = 0, dur = 1, raf = 0;
  function frame(now) {
    const x = Math.min(1, (now - start) / dur); u = from + (to - from) * (to > from ? easeUp(x) : easeDown(x)); draw(u);
    if (x < 1) raf = requestAnimationFrame(frame); else { raf = 0; if (!to) mascot.dataset.arm = 'down'; }
  }
  function go(target) {
    if (target === to && (raf || u === target)) return;
    if (target) mascot.dataset.arm = 'up'; else if (mascot.dataset.arm === 'up') mascot.dataset.arm = 'returning';
    from = u; to = target;
    if (reduce.matches) { u = target; draw(u); if (!target) mascot.dataset.arm = 'down'; return; }
    start = performance.now(); dur = target ? 900 : 650; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  const update = () => {
    if (password.type !== 'password') mascot.dataset.eyes = 'open';
    go(document.activeElement === password && password.type === 'password' ? 1 : 0);
  };
  password.addEventListener('focus', update);
  password.addEventListener('blur', update);
  password.addEventListener('input', update);
  // The Show/Hide button changes the field type and puts focus back in the field.
  new MutationObserver(update).observe(password, { attributes: true, attributeFilter: ['type'] });
  addEventListener('resize', () => { if (mascot.dataset.arm !== 'down') draw(u); });
  mascot.dataset.arm = 'down';
  update();
})();
