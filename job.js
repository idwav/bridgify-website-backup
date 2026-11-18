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
    $('#job-hero').hidden = true; $('#job-body').hidden = true; $('[data-job=bar]').hidden = true;
    $('#job-missing').hidden = false; document.title = 'Role not found | Careers at Bridgify';
    return;
  }
  document.title = role.title + ' | Careers at Bridgify';
  if (role.published) { var r = document.querySelector('meta[name=robots]'); if (r) r.remove(); }

  $('[data-job=team]').textContent = role.teamLabel;
  $('[data-job=title]').textContent = role.title;
  $('[data-job=deck]').textContent = role.deck || '';
  $('[data-job=deck]').hidden = !role.deck;
  $('[data-job=meta]').innerHTML = [role.location, role.type, role.teamLabel].map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');
  $('[data-job=facts]').innerHTML = [['Team', role.teamLabel], ['Location', role.location], ['Type', role.type]].map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('');
  if (role.sample) $('[data-job=sample]').hidden = false;

  var applyHref = role.applyUrl || ('contact.html?topic=careers&role=' + encodeURIComponent(role.slug) + (v2 ? '&version=2' : ''));
  ['apply', 'apply2', 'apply3'].forEach(function (k) { $('[data-job=' + k + ']').href = applyHref; });

  function list(items, ordered) { var tag = ordered ? 'ol' : 'ul'; return '<' + tag + (ordered ? ' class="job-steps"' : '') + '>' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</' + tag + '>'; }
  var html = '';
  if (role.about && role.about.length) html += '<h2>About the role</h2>' + role.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  if (role.doing && role.doing.length) html += '<h2>What you\'ll do</h2>' + list(role.doing);
  if (role.bring && role.bring.length) html += '<h2>What you bring</h2>' + list(role.bring);
  if (role.nice && role.nice.length) html += '<h2>Nice to have</h2>' + list(role.nice);
  if (role.process && role.process.length) html += '<h2>How we hire</h2>' + list(role.process, true);
  $('[data-job=prose]').innerHTML = html;

  var others = visible.filter(function (r) { return r.slug !== role.slug; });
  if (others.length) {
    $('#job-more').hidden = false;
    $('[data-job=more]').innerHTML = others.map(function (r) { return '<li><a href="job.html?role=' + encodeURIComponent(r.slug) + suffix + '"><b>' + esc(r.title) + '</b><span>' + esc(r.teamLabel) + ' · ' + esc(r.location) + '</span><i aria-hidden="true">↗</i></a></li>'; }).join('');
  }

  var bar = $('[data-job=bar]'), actions = document.querySelector('.job-actions');
  if (bar && actions) {
    var sync = function () { bar.classList.toggle('show', actions.getBoundingClientRect().bottom < 0); };
    addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  }

  var share = $('[data-job=share]');
  share.addEventListener('click', function () {
    var done = function () { share.textContent = 'Link copied'; setTimeout(function () { share.textContent = 'Copy link'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
  });
})();
