/* Application page: apply.html?role=<slug>. Validates, then sends to window.BRIDGIFY_APPLY_ENDPOINT (POST, multipart).
   Until an endpoint is set it falls back to an email draft (the CV has to be attached by the applicant). */
(function () {
  var q = new URLSearchParams(location.search), slug = q.get('role'), sample = q.get('sample') === '1', v2 = q.get('version') === '2';
  var all = window.BRIDGIFY_ROLES || [];
  var role = all.filter(function (r) { return r.slug === slug && (r.published || (r.sample && sample)); })[0];
  var $ = function (s) { return document.querySelector(s); };
  var A = function (k) { return document.querySelector('[data-apply=' + k + ']'); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var suffix = (sample ? '&sample=1' : '') + (v2 ? '&version=2' : '');
  var careersHref = 'careers.html' + (v2 ? '?version=2' : '') + '#open-roles';
  document.querySelectorAll('[data-keep-version]').forEach(function (a) { a.href = careersHref; });

  if (!role) { $('#apply-hero').hidden = true; $('#apply-body').hidden = true; $('#apply-missing').hidden = false; document.title = 'Role not found | Careers at Bridgify'; return; }
  document.title = 'Apply: ' + role.title + ' | Careers at Bridgify';
  var roleHref = 'job.html?role=' + encodeURIComponent(role.slug) + suffix;
  A('back').href = roleHref; A('cancel').href = roleHref; A('doneLink').href = careersHref;
  A('team').textContent = role.teamLabel; A('title').textContent = role.title;
  A('meta').innerHTML = [role.location, role.type, role.teamLabel].map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');
  A('roleField').value = role.title;
  if (role.sample || !window.BRIDGIFY_APPLY_ENDPOINT) A('sample').hidden = !(role.sample || !window.BRIDGIFY_APPLY_ENDPOINT);

  var form = $('#apply-form'), cv = $('#af-cv'), status = $('#af-status');
  var MAX = 5 * 1024 * 1024;
  cv.addEventListener('change', function () { A('cvname').textContent = cv.files[0] ? cv.files[0].name : 'Upload your CV'; $('#af-cv').closest('.af-field').classList.toggle('has-file', !!cv.files[0]); showErr('cv', ''); });

  function showErr(name, msg) { var el = document.querySelector('[data-err=' + name + ']'); if (el) el.textContent = msg; var f = form.elements[name]; if (f && f.setAttribute) f.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function validate() {
    var bad = [], v = function (n) { return (form.elements[n].value || '').trim(); };
    ['name', 'location', 'current_role'].forEach(function (n) { var ok = v(n).length > 1; showErr(n, ok ? '' : 'Please fill this in.'); if (!ok) bad.push(n); });
    var em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')); showErr('email', em ? '' : 'Enter a valid email address.'); if (!em) bad.push('email');
    var yr = !!v('years'); showErr('years', yr ? '' : 'Choose one.'); if (!yr) bad.push('years');
    var ln = !v('link') || /^https?:\/\/\S+\.\S+/.test(v('link')); showErr('link', ln ? '' : 'Enter a full link starting with https://'); if (!ln) bad.push('link');
    var f = cv.files[0], cm = '';
    if (!f) cm = 'Please upload your CV.'; else if (!/\.(pdf|docx?)$/i.test(f.name)) cm = 'Use a PDF, DOC or DOCX file.'; else if (f.size > MAX) cm = 'The file is larger than 5 MB.';
    showErr('cv', cm); if (cm) bad.push('cv');
    var co = form.elements.consent.checked; showErr('consent', co ? '' : 'Please confirm to continue.'); if (!co) bad.push('consent');
    return bad;
  }
  function done(title, text) {
    $('#apply-form').hidden = true; var d = $('#apply-done'); d.hidden = false; A('doneTitle').textContent = title; A('doneText').textContent = text;
    d.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); status.textContent = '';
    var bad = validate();
    if (bad.length) { var first = form.elements[bad[0]]; if (first && first.focus) first.focus(); status.textContent = 'Please check the highlighted fields.'; return; }
    var btn = $('#af-submit'), endpoint = window.BRIDGIFY_APPLY_ENDPOINT;
    if (endpoint) {
      btn.disabled = true; status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done('Thank you', 'Your application for ' + role.title + ' was sent.'); })
        .catch(function () { btn.disabled = false; status.textContent = 'Something went wrong. Please try again, or email us at ' + window.BRIDGIFY_CAREERS_EMAIL + '.'; });
      return;
    }
    // No endpoint yet: open an email draft with everything except the file.
    var g = function (n) { return (form.elements[n].value || '').trim(); };
    var body = ['Role: ' + role.title, 'Name: ' + g('name'), 'Email: ' + g('email'), 'Phone: ' + g('phone'), 'Based in: ' + g('location'), 'Current or most recent role: ' + g('current_role'), 'Years of experience: ' + g('years'), 'Link: ' + g('link'), '', g('note'), '', '(Please attach your CV: ' + cv.files[0].name + ')'].join('\n');
    location.href = 'mailto:' + window.BRIDGIFY_CAREERS_EMAIL + '?subject=' + encodeURIComponent('Application: ' + role.title) + '&body=' + encodeURIComponent(body);
    done('Your email app is open', 'Attach your CV (' + cv.files[0].name + ') to the email and send it. Online submission is not connected yet.');
  });
})();
