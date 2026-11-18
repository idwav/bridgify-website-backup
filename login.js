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

// The octopus follows the pointer: eyes shift towards it, the left arm tilts towards it. Fine pointers only, no reduced motion.
(() => {
  const mascot = document.querySelector('.login-mascot');
  if (!mascot || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const eyes = [...mascot.querySelectorAll('.login-eye')];
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const frame = () => {
    x += (tx - x) * .14; y += (ty - y) * .14;
    mascot.style.setProperty('--arm', (-y * 7).toFixed(2) + 'deg');
    const closed = mascot.dataset.eyes === 'closed';
    eyes.forEach(e => { e.style.setProperty('--ex', (closed ? 0 : x * 2.4).toFixed(2) + 'px'); e.style.setProperty('--ey', (closed ? 0 : y * 2).toFixed(2) + 'px'); });
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > .002) ? requestAnimationFrame(frame) : 0;
  };
  addEventListener('pointermove', e => {
    const r = mascot.getBoundingClientRect(), cx = r.left + r.width * .5, cy = r.top + r.height * .6;
    tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (innerWidth * .45)));
    ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (innerHeight * .45)));
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(frame); });
})();
