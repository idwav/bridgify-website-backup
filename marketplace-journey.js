(()=>{
const root=document.querySelector('.market-product-tour');if(!root)return;
const names=['Search','Experience','Reviews','Checkout'],descriptions=['Find the right experience.','See what makes it special.','Book with confidence.','Make it yours.'];
const photo='<img style="object-position:58% 65%" src="assets/v2/02-louvre-1600.jpg" alt="Louvre Museum, Paris">';
const content=[`<div class="search-scene">${photo}<div class="search-copy"><small>PARIS, YOUR WAY</small><h2>What will you discover?</h2><div class="search-box"><span class="typed">Louvre Museum</span><span>⌕</span></div></div></div><div class="result"><div><small>RECOMMENDED FOR YOU</small><h3>Louvre Museum</h3><p>Discover Paris’s art and landmarks</p></div><button data-forward>View experience ↗</button></div>`,
`<div class="experience-photo">${photo}<span class="photo-tag">PARIS · MUSEUM</span></div><div class="detail"><div><p class="crumbs">Home / France / Paris</p><small>★★★★★ · 4.8</small><h2>Paris: Louvre Museum Entry Ticket</h2><p>Explore the art and culture of Paris.</p><div class="pills"><span>2 hours</span><span>Mobile ticket</span></div></div><div class="buy"><small>From €18.00 per adult</small><button data-forward>Read reviews →</button></div></div>`,
`<div class="review-layout"><div class="review-summary"><small>LOUVRE MUSEUM</small><h2>Worth the visit.</h2><strong>4.8</strong><div class="stars">★★★★★</div><p>Traveler rating</p></div><div class="review-list"><small>ILLUSTRATIVE REVIEW PREVIEW</small><article><span>★★★★★</span><p>“Skip the lines and spend the time on the art.”</p><small>Example traveler review</small></article><article><span>★★★★★</span><p>“Easy to book. A day to remember.”</p><small>Example traveler review</small></article><button data-forward>Choose your tickets →</button></div></div>`,
`<div class="co-steps"><span>✓ Cart</span><span>✓ Details</span><b>Payment</b><span>Confirmation</span></div><div class="checkout-layout"><div class="order">${photo}<small>YOUR EXPERIENCE</small><h2>Louvre Museum</h2><p>2 adults · 12 Dec 2026, 18:00</p><div class="order-line"><span>Tickets</span><span>Mobile delivery</span></div><div class="order-line"><span>Booking</span><span>Under your brand</span></div></div><div class="payment"><small>SECURE CHECKOUT</small><h2>One last step.</h2><label>Email address<span>traveler@example.com</span></label><label>Payment details<span>••••  ••••  ••••  4242</span></label><button class="confirm">Confirm booking →</button><div class="success" hidden><b>✓</b><h3>Booking confirmed</h3><p>You’re going to Paris. Your tickets are ready.</p></div></div></div>`];
let sticky=null,track=null,stuckTop=0;let current=0;const nav=root.querySelector('.stages'),screens=root.querySelector('.screens');track=root;sticky=document.createElement('div');sticky.className='mpt-sticky';while(root.firstChild)sticky.append(root.firstChild);root.append(sticky);
nav.innerHTML=names.map((s,i)=>`<button data-stage="${i}" aria-pressed="${i===0}"><span class="contact"></span><b>0${i+1}</b><span>${s}</span></button>`).join('');
screens.innerHTML=content.map((html,i)=>`<article class="screen" aria-label="${names[i]}"><div class="chrome"><span>● ● ●</span><small>experiences.yourbrand.com</small><b>YOUR BRAND</b></div><div class="pnav"><strong>YOUR BRAND</strong><span>Destinations&nbsp; Experiences&nbsp; ♡&nbsp; EUR · EN</span></div>${html}</article>`).join('');
const panels=[...screens.children],motion=matchMedia('(prefers-reduced-motion:reduce)'),buttons=[...nav.querySelectorAll('button')];
const ns='http://www.w3.org/2000/svg',wire=document.createElementNS(ns,'svg');wire.classList.add('tour-flow');wire.setAttribute('data-managed-contacts','true');wire.setAttribute('aria-hidden','true');
wire.innerHTML='<path class="tour-flow-base"/><path class="tour-flow-fill"/><circle r="4" fill="#fff8f1" stroke="#f46649"/>';nav.append(wire);
const base=wire.children[0],fill=wire.children[1],bead=wire.children[2],trail=[bead,...Array.from({length:8},()=>{const d=bead.cloneNode();wire.append(d);return d})],cursor=document.createElement('i');cursor.className='tour-action-dot';cursor.setAttribute('aria-hidden','true');screens.append(cursor);
let points=[],visible=false,raf=0,last=0,elapsed=0,lastStage=-1;
const starts=[0,5200,10000,15400],cycle=22000;
const F=window.BridgifyFlow;
const smooth=F.smooth;
const transit=1550+8*F.delay;
function layout(){const r=nav.getBoundingClientRect();wire.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);points=buttons.map(b=>{const q=b.querySelector('.contact').getBoundingClientRect();return {x:q.left-r.left+q.width/2,y:q.top-r.top+q.height/2}});base.setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' '));}
function progress(value,travel=null){if(!points.length)return;const i=Math.min(2,Math.floor(value)),u=value-i,p={x:points[i].x+(points[i+1].x-points[i].x)*u,y:points[i].y+(points[i+1].y-points[i].y)*u};fill.setAttribute('d',points.slice(0,i+1).map((q,n)=>`${n?'L':'M'}${q.x} ${q.y}`).join(' ')+` L${p.x} ${p.y}`);trail.forEach((dot,n)=>{const q=travel===null?-1:(travel-n*F.delay)/1550,k=smooth(q),a=points[Math.min(current,2)],b=points[Math.min(current+1,3)];dot.setAttribute('cx',a.x+(b.x-a.x)*k);dot.setAttribute('cy',a.y+(b.y-a.y)*k);dot.setAttribute('r',F.radius(n)*(.8+.3*Math.sin(Math.PI*Math.max(0,Math.min(1,q)))));dot.style.opacity=q>0&&q<1?String((1-n*.045)*Math.min(1,q*10,(1-q)*16)):'0'});}

function show(i){current=i;buttons.forEach((b,n)=>{b.setAttribute('aria-pressed',n===i);b.classList.toggle('stage-complete',n<i)});panels.forEach((p,n)=>{p.classList.toggle('active',n===i);p.inert=n!==i;p.setAttribute('aria-hidden',n!==i)});layout();}
function confirm(done){root.querySelector('.payment').classList.toggle('complete',done);root.querySelector('.success').hidden=!done;}
function draw(){const t=elapsed%cycle,stage=t<5200?0:t<10000?1:t<15400?2:3,local=t-starts[stage];if(stage!==lastStage){show(stage);lastStage=stage;confirm(false)}
const end=stage<3?starts[stage+1]:cycle,moveStart=end-transit;
progress(stage<3?stage+smooth((t-moveStart)/1550):3,stage<3?t-moveStart:null);buttons.forEach((b,n)=>b.style.setProperty('--f',n<stage?1:n===stage?Math.max(0,Math.min(1,local/Math.max(1,end-starts[stage]))):0));
const target=panels[stage].querySelector(stage===3?'.confirm':'[data-forward]');
const pressAt=stage===3?3000:end-starts[stage]-transit-350;
root.querySelectorAll('.auto-press').forEach(b=>b.classList.remove('auto-press'));
if(local>=pressAt&&local<pressAt+350)target.classList.add('auto-press');
cursor.style.opacity=local>pressAt-1100&&local<pressAt+450?1:0;
if(local>pressAt-1100&&local<pressAt+450){const r=screens.getBoundingClientRect(),b=target.getBoundingClientRect(),u=smooth((local-pressAt+1100)/900);cursor.style.transform=`translate(${b.left-r.left+b.width*.72-4-48*(1-u)}px,${b.top-r.top+b.height*.5-4-35*(1-u)}px)`;cursor.classList.toggle('clicking',local>=pressAt)}
root.classList.toggle('tour-results-ready',stage!==0||local>2100);
const query=root.querySelector('.typed');query.textContent=stage===0?'Louvre Museum'.slice(0,Math.max(0,Math.min(13,Math.floor((local-350)/90)))):'Louvre Museum';
confirm(stage===3&&local>3450);
const arrival=F.arrival(local);
buttons.forEach((button,i)=>button.style.setProperty('--tour-arrival',i===stage?arrival:0));
panels.forEach((panel,i)=>panel.style.setProperty('--tour-arrival',i===stage?arrival:0));
}
const wide=matchMedia('(min-width:801px)');

function span(){return Math.max(1,track.offsetHeight-sticky.offsetHeight)}
function timeAt(p){const s=Math.min(3,Math.floor(p*4)),f=p*4-s,end=s<3?starts[s+1]:cycle;return starts[s]+f*(end-starts[s])}
function place(){if(!wide.matches||!sticky){return}stuckTop=Math.round(64+Math.max(24,(innerHeight-64-sticky.offsetHeight)/2));sticky.style.setProperty('top',stuckTop+'px','important')}
function fromScroll(){if(!sticky||!wide.matches){return}const r=track.getBoundingClientRect(),p=Math.max(0,Math.min(.999,(-r.top+stuckTop)/span()));elapsed=timeAt(p);draw()}
let sraf=0;addEventListener('scroll',()=>{if(!sraf)sraf=requestAnimationFrame(()=>{sraf=0;fromScroll()})},{passive:true});
function tick(now){raf=0;if(!visible||document.hidden||motion.matches||(sticky&&wide.matches)){last=0;return}if(last)elapsed+=Math.min(64,now-last);last=now;draw();raf=requestAnimationFrame(tick)}
function resume(){cancelAnimationFrame(raf);raf=0;last=0;root.classList.toggle('tour-paused',!visible||document.hidden||motion.matches);if(visible&&!document.hidden&&!motion.matches)raf=requestAnimationFrame(tick);else if(motion.matches){trail.forEach(dot=>dot.style.opacity=0);cursor.style.opacity=0;[...panels,...buttons].forEach(el=>el.style.setProperty('--tour-arrival',0))}}
function select(i){i=Math.max(0,Math.min(3,i));if(sticky&&wide.matches&&!motion.matches){const y=scrollY+track.getBoundingClientRect().top-stuckTop+span()*(i+.5)/4;scrollTo({top:y,behavior:'smooth'});return}elapsed=starts[i];lastStage=-1;draw();if(motion.matches){root.classList.add('tour-results-ready');root.querySelector('.typed').textContent='Louvre Museum';cursor.style.opacity=0}resume();}
buttons.forEach((b,i)=>{b.onclick=()=>select(i);b.onkeydown=e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(current+1)%4;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(current+3)%4;else return;e.preventDefault();select(n);buttons[n].focus()}});
root.querySelectorAll('[data-forward]').forEach(b=>b.onclick=()=>select(current+1));root.querySelector('.confirm').onclick=()=>{elapsed=starts[3]+3500;draw()};
new IntersectionObserver(es=>{visible=es[0].isIntersecting;resume()},{threshold:.1}).observe(root);document.addEventListener('visibilitychange',resume);motion.addEventListener('change',()=>{if(motion.matches){cursor.style.opacity=0;root.classList.add('tour-results-ready');root.querySelector('.typed').textContent='Louvre Museum'}resume()});new ResizeObserver(()=>{layout();progress(current);place();fromScroll()}).observe(nav);addEventListener('resize',()=>{place();fromScroll()});addEventListener('load',()=>{place();fromScroll()});document.fonts.ready.then(layout);show(0);lastStage=0;root.classList.toggle('tour-results-ready',motion.matches);progress(0);
})();