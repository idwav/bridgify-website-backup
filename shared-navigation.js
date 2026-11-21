/* Sticky header. It follows the scroll; once the page moves it always gets the same dark surface
   (whatever section is underneath), with a fine coral line on its lower edge. */
(()=>{
const header=document.querySelector('header.site-header-common');if(!header)return;
// Lift the header out of the hero: as a direct child of <body> it stays above every section while it follows the scroll.
if(header.parentElement!==document.body)document.body.prepend(header);
header.classList.add('is-sticky');
let lastY=scrollY,ticking=false;
function update(){
 ticking=false;const y=scrollY,stuck=y>24;
 header.classList.toggle('is-stuck',stuck);
 header.classList.toggle('nav-tone-dark',stuck);
 // Small screens: the two-row header steps aside while reading down and returns on the way up.
 const menuOpen=!!header.querySelector('details[open]');
 if(innerWidth>950||y<=200||menuOpen||y<lastY-2)header.classList.remove('is-tucked');
 else if(y>lastY+2)header.classList.add('is-tucked');
 lastY=y;
}
const ask=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
addEventListener('scroll',ask,{passive:true});addEventListener('resize',ask);
update();
})();

/* Current page in the navigation (owner task, 21 Nov 2026): the link to the page you are on gets aria-current="page",
   and its group (PRODUCTS, SOLUTIONS, ...) is marked too, so both stay highlighted, also after a reload or a direct
   visit. Clean routes (/white-label-marketplace, /solutions/hotels, ...) resolve to their page; job pages belong to
   Careers and articles to Insights. The phone menu copies these marks when it is built. */
(()=>{
const routes={'experiences-api':'api.html','white-label-marketplace':'marketplace.html','aiyelet':'personalization.html',
 'about':'about-us.html','careers':'careers.html','book-a-demo':'demo.html','blog':'insights.html','newsroom':'press.html',
 'solutions/otas':'otas.html','solutions/airlines':'airlines.html','solutions/loyalty-programs':'loyalty-finance.html',
 'solutions/travel-technology':'travel-technology.html','solutions/hotels':'hotels.html','solutions/super-apps':'super-apps.html'};
const fileOf=path=>{const p=path.replace(/^\/+|\/+$/g,'');return routes[p]||p.split('/').pop()||'index.html'};
let page=fileOf(location.pathname);
if(page==='job.html')page='careers.html';
if(/^blog-/.test(page))page='insights.html';
const nav=document.querySelector('header.site-header-common nav');if(!nav)return;
nav.querySelectorAll('a[href]').forEach(a=>{
 const href=a.getAttribute('href');if(!href||href.includes('#'))return;
 const url=new URL(href,location.href);if(url.origin!==location.origin||fileOf(url.pathname)!==page)return;
 a.setAttribute('aria-current','page');
 a.closest('details')?.classList.add('has-current');
});
})();
