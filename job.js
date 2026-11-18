/* Job page: renders one role from careers-roles.js. URL: job.html?role=<slug> (add &sample=1 to preview template roles). */
(function () {
  var q = new URLSearchParams(location.search), slug = q.get('role'), sample = q.get('sample') === '1', v2 = q.get('version') === '2';
  var all = window.BRIDGIFY_ROLES || [];
  var visible = all.filter(function (r) { return r.published || (r.sample && sample); });
  var role = visible.filter(function (r) { return r.slug === slug; })[0];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var suffix = (sample ? '&sample=1' : '') + (v2 ? '&version=2' : '');
  var careersHref = 'careers.html' + (v2 ? '?version=2' : '') + '#open-roles';
  document.querySelectorAll('[data-keep-version]').forEach(function (a) { a.href = careersHref; });

  if (!role) {
    $('#job-split').hidden = true; $('[data-job=bar]').hidden = true;
    $('#job-missing').hidden = false; document.title = 'Role not found | Careers at Bridgify';
    return;
  }
  document.title = role.title + ' | Careers at Bridgify';
  if (role.published && !role.sample) { var r = document.querySelector('meta[name=robots]'); if (r) r.remove(); }

  $('[data-job=team]').textContent = role.teamLabel;
  $('[data-job=title]').textContent = role.title;
  $('[data-job=meta]').textContent = role.type + ' (' + role.location + ')';
  if (role.sample) $('[data-job=sample]').hidden = false;

  var applyHref = role.applyUrl || '#apply';
  ['apply', 'apply3'].forEach(function (k) { $('[data-job=' + k + ']').href = applyHref; });

  function list(items, ordered) { var tag = ordered ? 'ol' : 'ul'; return '<' + tag + (ordered ? ' class="job-steps"' : '') + '>' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</' + tag + '>'; }
  var html = '';
  if (role.about && role.about.length) html += '<h2 id="s-about">About the role</h2>' + role.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  if (role.doing && role.doing.length) html += '<h2 id="s-do">What you\'ll do</h2>' + list(role.doing);
  if (role.bring && role.bring.length) html += '<h2 id="s-bring">What you bring</h2>' + list(role.bring);
  if (role.nice && role.nice.length) html += '<h2 id="s-nice">Nice to have</h2>' + list(role.nice);
  if (role.process && role.process.length) html += '<h2 id="s-hire">How we hire</h2>' + list(role.process, true);
  $('[data-job=prose]').innerHTML = html;

  var others = visible.filter(function (r) { return r.slug !== role.slug; });
  if (others.length) {
    $('#job-more').hidden = false;
    $('[data-job=more]').innerHTML = others.map(function (r) { return '<li class="rl-row"><a class="rl-link" href="job.html?role=' + encodeURIComponent(r.slug) + suffix + '"><span class="rl-title">' + esc(r.title) + '</span><span class="rl-loc">' + esc(r.location) + '</span><span class="rl-go">Learn more</span></a></li>'; }).join('');
  }

  var bar = $('[data-job=bar]'), actions = document.querySelector('.jl-side');
  if (bar && actions) {
    var formEl = document.getElementById('apply');
    var sync = function () { var f = formEl ? formEl.getBoundingClientRect() : null; bar.classList.toggle('show', actions.getBoundingClientRect().bottom < 80 && !(f && f.top < innerHeight * .6)); };
    addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  }

  var share = $('[data-job=share]');
  share.addEventListener('click', function () {
    var done = function () { share.textContent = 'Link copied'; setTimeout(function () { share.textContent = 'Copy link'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
  });

  // ---- Application form, under the description. Apply buttons scroll to it.
  var formSec = document.getElementById('apply'), form = document.getElementById('apply-form');
  if (!formSec || !form) return;
  if (role.applyUrl) { formSec.hidden = true; return; }
  var A = function (k) { return document.querySelector('[data-apply=' + k + ']'); };
  form.elements.role.value = role.title;
  document.querySelectorAll('a[href="#apply"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      formSec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      var first = form.hidden ? null : form.elements.name; if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 600);
    });
  });
  A('doneLink').href = careersHref;
  var cv = document.getElementById('af-cv'), status = document.getElementById('af-status'), MAX = 5 * 1024 * 1024;
  // Preview mode (template roles, localhost, or ?preview=1): Submit works without filling the fields and sends nothing.
  var preview = role.sample || q.get('preview') === '1' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (preview) { var pb = document.createElement('p'); pb.className = 'job-sample'; pb.textContent = 'Preview mode: Submit works without filling the fields and sends nothing.'; document.querySelector('.af-actions').appendChild(pb); }
  cv.addEventListener('change', function () { A('cvname').textContent = cv.files[0] ? cv.files[0].name : 'Upload your CV'; cv.closest('.af-field').classList.toggle('has-file', !!cv.files[0]); showErr('cv', ''); });
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
    form.hidden = true; document.getElementById('apply-done').hidden = false; A('doneTitle').textContent = title; A('doneText').textContent = text;
    document.getElementById('apply-title').hidden = true;
    formSec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); status.textContent = '';
    if (preview) { var nm = cv.files[0] ? ' (' + cv.files[0].name + ')' : ''; done('One more step', 'Your email is ready. Attach your CV' + nm + ' and send it to complete your application for ' + role.title + '.'); return; }
    var bad = validate();
    if (bad.length) { var first = form.elements[bad[0]]; if (first && first.focus) first.focus(); status.textContent = 'Please check the highlighted fields.'; return; }
    var btn = document.getElementById('af-submit'), endpoint = window.BRIDGIFY_APPLY_ENDPOINT;
    if (endpoint) {
      btn.disabled = true; status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done('Thank you', 'Your application for ' + role.title + ' was sent.'); })
        .catch(function () { btn.disabled = false; status.textContent = 'Something went wrong. Please try again, or email us at ' + window.BRIDGIFY_CAREERS_EMAIL + '.'; });
      return;
    }
    var g = function (n) { return (form.elements[n].value || '').trim(); };
    var body = ['Role: ' + role.title, 'Name: ' + g('name'), 'Email: ' + g('email'), 'Phone: ' + g('phone'), 'Based in: ' + g('location'), 'Current or most recent role: ' + g('current_role'), 'Years of experience: ' + g('years'), 'Link: ' + g('link'), '', g('note'), '', '(Please attach your CV: ' + cv.files[0].name + ')'].join('\n');
    location.href = 'mailto:' + window.BRIDGIFY_CAREERS_EMAIL + '?subject=' + encodeURIComponent('Application: ' + role.title) + '&body=' + encodeURIComponent(body);
    done('One more step', 'Your email is ready. Attach your CV (' + cv.files[0].name + ') and send it to complete your application for ' + role.title + '.');
  });
  // Preview of the confirmation: job.html?role=<slug>&done=1
  if (q.get('done') === '1' && preview) done('One more step', 'Your email is ready. Attach your CV and send it to complete your application for ' + role.title + '.');
})();
