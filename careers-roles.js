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
  },
  {
    slug: 'frontend-engineer',
    published: true,
    sample: true,
    title: 'Frontend Engineer',
    team: 'engineering',
    teamLabel: 'Engineering',
    location: 'Tel Aviv · Hybrid',
    type: 'Full-time',
    deck: 'Build the interfaces partners put in front of millions of travelers.',
    about: [
      'Sample text: replace with the real description. Describe the team, what it owns and what success looks like in the first year.',
      'Keep it to two short paragraphs.'
    ],
    doing: [
      'Sample: the first responsibility of this role.',
      'Sample: the second responsibility of this role.',
      'Sample: the third responsibility of this role.'
    ],
    bring: [
      'Sample: the experience this role needs.',
      'Sample: the skills this role needs.'
    ],
    nice: ['Sample: something that would help.'],
    process: ['Intro call', 'Role conversation', 'Team interview', 'Offer'],
    applyUrl: ''
  },
  {
    slug: 'product-manager',
    published: true,
    sample: true,
    title: 'Product Manager',
    team: 'product',
    teamLabel: 'Product & Design',
    location: 'Tel Aviv · Hybrid',
    type: 'Full-time',
    deck: 'Decide what we build next for the infrastructure behind travel experiences.',
    about: [
      'Sample text: replace with the real description. Describe the team, what it owns and what success looks like in the first year.',
      'Keep it to two short paragraphs.'
    ],
    doing: [
      'Sample: the first responsibility of this role.',
      'Sample: the second responsibility of this role.',
      'Sample: the third responsibility of this role.'
    ],
    bring: [
      'Sample: the experience this role needs.',
      'Sample: the skills this role needs.'
    ],
    nice: ['Sample: something that would help.'],
    process: ['Intro call', 'Role conversation', 'Team interview', 'Offer'],
    applyUrl: ''
  },
  {
    slug: 'customer-success-manager',
    published: true,
    sample: true,
    title: 'Customer Success Manager',
    team: 'commercial',
    teamLabel: 'Commercial',
    location: 'London · Hybrid',
    type: 'Full-time',
    deck: 'Help partners get the most from Bridgify after launch.',
    about: [
      'Sample text: replace with the real description. Describe the team, what it owns and what success looks like in the first year.',
      'Keep it to two short paragraphs.'
    ],
    doing: [
      'Sample: the first responsibility of this role.',
      'Sample: the second responsibility of this role.',
      'Sample: the third responsibility of this role.'
    ],
    bring: [
      'Sample: the experience this role needs.',
      'Sample: the skills this role needs.'
    ],
    nice: ['Sample: something that would help.'],
    process: ['Intro call', 'Role conversation', 'Team interview', 'Offer'],
    applyUrl: ''
  }
];

/* Where "Tell us how" goes. Change this one address to route it somewhere else. */
window.BRIDGIFY_CAREERS_EMAIL = 'contact@bridgify.io';

/* Where the application form posts (multipart POST). Leave empty until it is connected: the form then opens an email draft instead. */
window.BRIDGIFY_APPLY_ENDPOINT = '';

/* Careers list: roles grouped by team, one row each (title, location, Learn more). Teams without a role keep "No open role currently". */
(function () {
  var q = location.search, showSample = /[?&]sample=1/.test(q);
  var roles = (window.BRIDGIFY_ROLES || []).filter(function (r) { return r.published || (r.sample && showSample); });
  window.BRIDGIFY_VISIBLE_ROLES = roles;
  var TEAMS = [['engineering', 'Engineering'], ['product', 'Product & Design'], ['commercial', 'Commercial']];
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function init() {
    var cta = document.querySelector('.rl-more a.career-cta');
    if (cta) cta.href = 'mailto:' + window.BRIDGIFY_CAREERS_EMAIL + '?subject=' + encodeURIComponent('Careers at Bridgify');
    var host = document.getElementById('role-list');
    if (!host || !roles.length) return;
    var suffix = (showSample ? '&sample=1' : '') + (/[?&]version=2/.test(q) ? '&version=2' : '');
    host.innerHTML = TEAMS.map(function (t) {
      var rows = roles.filter(function (r) { return r.team === t[0]; }).map(function (r) {
        var href = 'job.html?role=' + encodeURIComponent(r.slug) + suffix;
        return '<li class="rl-row"><a class="rl-link" href="' + href + '"><span class="rl-title">' + esc(r.title) + '</span><span class="rl-loc">' + esc(r.location) + '</span><span class="rl-go">Learn more</span></a></li>';
      }).join('') || '<li class="rl-row rl-empty"><span class="rl-title">No open role currently</span></li>';
      return '<div class="rl-group" data-team="' + t[0] + '"><h3 class="rl-team">' + t[1] + '</h3><ul class="rl-list">' + rows + '</ul></div>';
    }).join('');
    var intro = document.querySelector('.roles-intro');
    if (intro) intro.hidden = true;
  }
  /* This script sits before careers-motion.js at the end of the body, so the list exists when it runs. */
  if (document.getElementById('role-list')) init(); else document.addEventListener('DOMContentLoaded', init);
})();
