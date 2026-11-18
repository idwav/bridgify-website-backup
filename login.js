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
  const segs = [...mascot.querySelectorAll('.login-arm')];
  const N = segs.length, DEG = 180 / Math.PI;
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
    for (let i = 0; i < N; i++) segs[i].style.setProperty('--a', ((ang[i] - (i ? ang[i - 1] : 0)) * (i ? 1.6 : 1)).toFixed(2) + 'deg');
    raf = requestAnimationFrame(step);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(step); } }, { threshold: .05 }).observe(mascot);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf && visible) { last = 0; raf = requestAnimationFrame(step); } });
  raf = requestAnimationFrame(step);
})();
