/* Open roles: one list that feeds both the Careers board and the job page (job.html?role=<slug>).
   To publish a role: add an entry below with published:true. Nothing else needs to change.
   Roles marked sample:true are template content: they are listed so the team can see how roles look, carry a "Sample role" note and stay noindex. Set published:false to hide them, or replace them with real roles. */
window.BRIDGIFY_ROLES = [
  {
    slug: 'senior-backend-engineer',
    published: true,
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
  },
  {
    slug: 'product-designer',
    published: true,
    sample: true,
    title: 'Product Designer',
    team: 'product',
    teamLabel: 'Product & Design',
    location: 'Tel Aviv · Hybrid',
    type: 'Full-time',
    deck: 'Shape how millions of travelers find and book experiences across our partners\' products.',
    about: [
      'Sample text: replace with the real description. Describe the design team, the products it shapes and how designers work with product and engineering.',
      'Keep it to two short paragraphs, and say what the first project would be.'
    ],
    doing: [
      'Sample: design search, discovery and checkout flows used inside partner apps.',
      'Sample: build and evolve the design system that partners can brand.',
      'Sample: run research with travelers and partners, then turn it into decisions.'
    ],
    bring: [
      'Sample: a portfolio of shipped product work, end to end.',
      'Sample: strong interaction and visual craft.',
      'Sample: comfort working with data and constraints.'
    ],
    nice: ['Sample: experience designing marketplaces or booking flows.'],
    process: ['Intro call', 'Portfolio conversation', 'Design exercise', 'Team interview', 'Offer'],
    applyUrl: ''
  },
  {
    slug: 'partnerships-manager',
    published: true,
    sample: true,
    title: 'Partnerships Manager',
    team: 'commercial',
    teamLabel: 'Commercial',
    location: 'Remote · Europe',
    type: 'Full-time',
    deck: 'Bring banks, airlines and super apps onto the infrastructure behind travel experiences.',
    about: [
      'Sample text: replace with the real description. Describe the partners this person will work with and what success looks like in the first year.',
      'Keep it to two short paragraphs.'
    ],
    doing: [
      'Sample: own relationships with strategic partners from first call to launch.',
      'Sample: work with product and engineering to turn partner needs into releases.',
      'Sample: report on partner performance and growth opportunities.'
    ],
    bring: [
      'Sample: experience in B2B partnerships or enterprise sales.',
      'Sample: clear communication with senior stakeholders.',
      'Sample: a structured way of managing complex deals.'
    ],
    nice: ['Sample: background in travel, banking or loyalty.'],
    process: ['Intro call', 'Role conversation', 'Case discussion', 'Team interview', 'Offer'],
    applyUrl: ''
  }
];

/* Where "Tell us how" goes. Change this one address to route it somewhere else. */
window.BRIDGIFY_CAREERS_EMAIL = 'contact@bridgify.io';

/* Where the application form posts (multipart POST). Leave empty until it is connected: the form then opens an email draft instead. */
window.BRIDGIFY_APPLY_ENDPOINT = '';

/* Careers board: when published roles exist, they replace the "No open role currently" rows and link to the job page. */
(function () {
  var q = location.search, showSample = /[?&]sample=1/.test(q);
  var roles = (window.BRIDGIFY_ROLES || []).filter(function (r) { return r.published || (r.sample && showSample); });
  window.BRIDGIFY_VISIBLE_ROLES = roles;
  function wireCta() {
    var a = document.querySelector('.jb-cta a.career-cta');
    if (a) a.href = 'mailto:' + window.BRIDGIFY_CAREERS_EMAIL + '?subject=' + encodeURIComponent('Careers at Bridgify');
  }
  function init() {
    wireCta();
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
