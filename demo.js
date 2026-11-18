/* Book a demo: validates, then opens an email draft (same recipient and subject as the contact page).
   Product is preselected from ?context= (marketplace, api, personalization). */
(function () {
  var q = new URLSearchParams(location.search), ctx = (q.get('context') || q.get('product') || '').toLowerCase();
  var map = { marketplace: 'White-Label Marketplace', 'white-label': 'White-Label Marketplace', api: 'Experiences API', developers: 'Experiences API', personalization: 'AIyelet', aiyelet: 'AIyelet' };
  var form = document.getElementById('demo-form'), status = document.getElementById('df-status');
  // Preview mode (localhost, or ?preview=1): Submit works without filling the fields and opens no email, so the confirmation can be reviewed.
  var preview = /[?&]preview=1/.test(location.search) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (preview) { var note = document.createElement('p'); note.className = 'af-preview'; note.textContent = 'Preview mode: Submit works without filling the fields and opens no email.'; document.querySelector('.af-actions').appendChild(note); }
  if (map[ctx]) form.elements.product.value = map[ctx];

  function showErr(name, msg) { var el = document.querySelector('[data-err=' + name + ']'); if (el) el.textContent = msg; var f = form.elements[name]; if (f) f.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function validate() {
    var bad = [], v = function (n) { return (form.elements[n].value || '').trim(); };
    ['name', 'company'].forEach(function (n) { var ok = v(n).length > 1; showErr(n, ok ? '' : 'Please fill this in.'); if (!ok) bad.push(n); });
    var em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')); showErr('email', em ? '' : 'Enter a valid email address.'); if (!em) bad.push('email');
    ['industry', 'product'].forEach(function (n) { var ok = !!v(n); showErr(n, ok ? '' : 'Choose one.'); if (!ok) bad.push(n); });
    return bad;
  }
  function showConfirmation() { form.hidden = true; document.getElementById('apply-done').hidden = false; document.getElementById('apply-root').classList.add('is-done'); document.getElementById('demo-hero').hidden = true; window.scrollTo(0, 0); }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); status.textContent = '';
    if (preview) { showConfirmation(); return; }
    var bad = validate();
    if (bad.length) { form.elements[bad[0]].focus(); status.textContent = 'Please check the highlighted fields.'; return; }
    var g = function (n) { return (form.elements[n].value || '').trim(); };
    var body = ['Name: ' + g('name'), 'Email: ' + g('email'), 'Company: ' + g('company'), 'Role: ' + g('role'), 'Industry: ' + g('industry'), 'Product: ' + g('product'), 'Markets: ' + g('markets'), '', g('message')].join('\n');
    location.href = 'mailto:hello@bridgify.io?subject=' + encodeURIComponent('Bridgify demo request') + '&body=' + encodeURIComponent(body);
    showConfirmation();
  });
  // Preview of the confirmation screen: demo.html?done=1
  if (q.get('done') === '1') { form.hidden = true; document.getElementById('apply-done').hidden = false; document.getElementById('apply-root').classList.add('is-done'); document.getElementById('demo-hero').hidden = true; }
})();
