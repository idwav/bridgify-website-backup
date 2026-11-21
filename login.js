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

// Shy octopus: while the password is being typed (hidden), the right arm curls up over one eye and the other eye closes.
// When typing pauses, that eye peeks open for a moment and closes again. Back down on blur or when the password is shown.
// The motion is one sheet of 48 frames (assets/login-octopus-shy.webp): 45 frames of the arm, made from a Higgsfield clip
// between the page's own picture and the covering pose and colour-matched to the picture, then 3 frames of the eye closing.
// At rest the live picture (with its moving eyes) is shown; the switch is a short crossfade.
// Reduced motion: jumps between poses without playing the frames.
(() => {
  const mascot = document.querySelector('.login-mascot');
  const password = document.getElementById('login-password');
  if (!mascot || !password) return;
  const COLS = 9, ROWS = 6, OPEN = 44, SHUT = 47;            // OPEN: arm over one eye, other eye open. SHUT: that eye closed.
  const stepFor = (from, to) => (from > OPEN || (from === OPEN && to > OPEN) ? 45 : to > from ? 25 : 16);   // ms per frame: eye frames slower
  const flip = document.createElement('div'); flip.className = 'login-flip'; flip.setAttribute('aria-hidden', 'true'); mascot.append(flip);
  const sheet = new Image(); let ready = false; sheet.onload = () => { ready = true; update(); }; sheet.src = 'assets/login-octopus-shy.webp?v=3';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let f = 0, target = 0, last = 0, raf = 0, hold = 0, peekTimer = 0, closeTimer = 0;
  const show = n => {
    flip.style.backgroundPosition = `${(n % COLS) / (COLS - 1) * 100}% ${Math.floor(n / COLS) / (ROWS - 1) * 100}%`;
    mascot.dataset.arm = n || target ? 'up' : 'down';
  };
  // Timed by the clock, not by screen refreshes: on a slow screen frames are skipped, the duration stays the same.
  function tick(now) {
    if (!last) last = now;
    if (f === OPEN && target === SHUT && hold) { if (now - last < hold) { raf = requestAnimationFrame(tick); return; } hold = 0; last = now; }
    const step = stepFor(f, target), n = Math.floor((now - last) / step);
    if (n > 0) {
      const d = target - f; let move = Math.sign(d) * Math.min(n, Math.abs(d));
      if (target === SHUT && f < OPEN && f + move > OPEN) move = OPEN - f;   // stop at OPEN for a beat before the eye closes
      f += move; last += n * step; show(f);
      if (f === OPEN && target === SHUT) { hold = 160; last = now; }
    }
    raf = f !== target ? requestAnimationFrame(tick) : 0;
  }
  function go(t) {
    if (t === target) return;
    target = t; show(f);
    if (reduce.matches) { cancelAnimationFrame(raf); raf = 0; f = target; show(f); return; }
    if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
  }
  const hiding = () => document.activeElement === password && password.type === 'password';
  function update() {
    clearTimeout(peekTimer); clearTimeout(closeTimer);
    if (password.type !== 'password') mascot.dataset.eyes = 'open';
    if (!ready) return;
    if (hiding()) mascot.dataset.eyes = 'open';                  // the live eyes stay as they are under the crossfade
    go(hiding() ? SHUT : 0);
  }
  // A pause in typing: the closed eye peeks open for a moment, then closes again.
  password.addEventListener('input', () => {
    update();
    if (!ready || !hiding() || reduce.matches) return;
    peekTimer = setTimeout(() => { go(OPEN); closeTimer = setTimeout(() => { if (hiding()) go(SHUT); }, 650); }, 900);
  });
  password.addEventListener('focus', update);
  password.addEventListener('blur', update);
  // The Show/Hide button changes the field type and puts focus back in the field.
  new MutationObserver(update).observe(password, { attributes: true, attributeFilter: ['type'] });
  mascot.dataset.arm = 'down';
})();
