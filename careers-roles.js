/* Open roles: one list that feeds both the Careers board and the job page (job.html?role=<slug>).
   To publish a role: add an entry below with published:true. Nothing else needs to change.
   Roles marked sample:true are template content: they only show with ?sample=1 and are never listed publicly. */
window.BRIDGIFY_ROLES = [
  {
    slug: 'senior-backend-engineer',
    published: false,
    sample: true,
    title: 'Senior Backend Engineer',
    team: 'engineering',
    teamLabel: 'Engineering',
    location: 'Tel Aviv · Hybrid',
    type: 'Full-time',
    deck: 'Build the supply and availability layer that banks, airlines and super apps rely on.',
    about: [
      'Sample text: replace with the real description. Describe the team, what it owns and the problem this person will solve in their first year.',
      'Keep it to two short paragraphs. Candidates should understand the impact of the work before they read the requirements.'
    ],
    doing: [
      'Sample: design and ship services that normalize supplier data into one schema.',
      'Sample: own reliability, performance and observability of what you build.',
      'Sample: work with product and partner teams to turn requirements into releases.'
    ],
    bring: [
      'Sample: several years of backend experience with production systems.',
      'Sample: comfort with APIs, data modeling and distributed systems.',
      'Sample: clear written and spoken English.'
    ],
    nice: [
      'Sample: experience in travel, payments or marketplaces.',
      'Sample: experience with search or recommendation systems.'
    ],
    process: ['Intro call', 'Technical conversation', 'Team interview', 'Offer'],
    applyUrl: ''
  }
];

/* Careers board: when published roles exist, they replace the "No open role currently" rows and link to the job page. */
(function () {
  var q = location.search, showSample = /[?&]sample=1/.test(q);
  var roles = (window.BRIDGIFY_ROLES || []).filter(function (r) { return r.published || (r.sample && showSample); });
  window.BRIDGIFY_VISIBLE_ROLES = roles;
  function init() {
    var list = document.querySelector('.jb-list');
    if (!list || !roles.length) return;
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var suffix = showSample ? '&sample=1' : '';
    var vq = /[?&]version=2/.test(q) ? '&version=2' : '';
    list.innerHTML = roles.map(function (r) {
      var href = 'job.html?role=' + encodeURIComponent(r.slug) + suffix + vq;
      return '<li class="jb-row jb-role" data-team="' + esc(r.team) + '"><h3><a href="' + href + '">' + esc(r.title) + '</a></h3>' +
        '<span class="jb-meta">' + esc(r.teamLabel) + ' · ' + esc(r.location) + ' · ' + esc(r.type) + '</span>' +
        '<a class="jb-apply" href="' + href + '">View role <span aria-hidden="true">↗</span></a></li>';
    }).join('');
    var count = document.querySelector('.jb-count');
    if (count) count.innerHTML = '<i></i>' + roles.length + ' open role' + (roles.length === 1 ? '' : 's');
    var intro = document.querySelector('.roles-intro');
    if (intro) intro.hidden = true;
  }
  /* This script sits before careers-motion.js at the end of the body, so the board exists and rows are in place before the filter reads them. */
  if (document.querySelector('.jb-list')) init(); else document.addEventListener('DOMContentLoaded', init);
})();
