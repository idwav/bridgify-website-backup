/* Responsive contacts and the shared Experiences API motion cadence. */
(()=>{const N='http://www.w3.org/2000/svg',F=window.BridgifyFlow;if(!F)return;
const svg=(tag,a={})=>{const e=document.createElementNS(N,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e};
const arrow='<svg class="dev-mini-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
document.querySelectorAll('.dev-icon').forEach(s=>{const p=s.querySelector('path,circle,rect');if(!p)return;let q;try{q=p.getPointAtLength(0)}catch{return}s.append(svg('circle',{cx:q.x,cy:q.y,r:1.1,class:'dev-icon-light'}))});
document.querySelectorAll('.dev-booking-flow>b,.dev-experience>span').forEach(e=>e.innerHTML=arrow);
document.querySelectorAll('.dev-chip.live').forEach(e=>e.insertAdjacentHTML('afterbegin','<svg class="dev-mini-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m14 2-9 12h7l-2 8 9-13h-7Z"/></svg>'));
function controls(panel){let paused=false,offset=0,previous=0,clock=0;const c=document.createElement('div');c.className='dev-motion-controls';const replay=document.createElement('button'),pause=document.createElement('button');replay.type=pause.type='button';replay.textContent='Replay';pause.textContent='Pause animation';c.append(replay,pause);panel.after(c);replay.onclick=()=>{clock=0};pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Play animation':'Pause animation';pause.setAttribute('aria-pressed',paused)};return t=>{if(previous&&!paused)clock+=t-previous;previous=t;return clock}}
function glow(e,g){F.glow(e,g);e.style.borderColor='#f46649'}
if(document.querySelector('.dev-system')){const panel=document.querySelector('.dev-system'),hub=panel.querySelector('.dev-hub'),product=panel.querySelector('.dev-product'),sources=[...panel.querySelectorAll('.dev-slab')];const layer=svg('svg',{class:'dev-flow-svg','aria-hidden':'true'});panel.append(layer);let routes=[];
function layout(){layer.replaceChildren();const r=panel.getBoundingClientRect();layer.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);const box=e=>{const b=e.getBoundingClientRect();return{x:b.left-r.left,y:b.top-r.top,w:b.width,h:b.height}},h=box(hub),p=box(product),mobile=innerWidth<=760,contacts=new Set();routes=[];
function route(d,target,start,duration){const path=svg('path',{d});layer.append(path);[0,path.getTotalLength()].forEach(l=>{const q=path.getPointAtLength(l),key=q.x.toFixed(1)+','+q.y.toFixed(1);if(contacts.has(key))return;contacts.add(key);layer.append(svg('circle',{cx:q.x,cy:q.y,r:3,fill:'#fff8f1',stroke:'#f46649','stroke-width':1}))});const dots=Array.from({length:9},(_,i)=>{const c=svg('circle',{r:F.radius(i),fill:'#fff8f1',stroke:'#f46649','stroke-width':.7,class:'dev-flow-particle',opacity:0});layer.append(c);return c});routes.push({path,dots,target,start,duration})}
sources.forEach(e=>{const a=box(e);if(mobile){const x=a.x+a.w,y=a.y+a.h/2,rail=x+12,tx=h.x+h.w,ty=h.y+h.h/2;route(`M${x} ${y}H${rail}V${ty-8}Q${rail} ${ty} ${rail-8} ${ty}H${tx}`,hub,0,1600)}else{const x=a.x+a.w,y=a.y+a.h/2,tx=h.x,ty=h.y+h.h/2;route(`M${x} ${y}C${x+(tx-x)*.5} ${y} ${x+(tx-x)*.5} ${ty} ${tx} ${ty}`,hub,0,1600)}});
if(mobile)route(`M${h.x+h.w/2} ${h.y+h.h}V${p.y}`,product,1800,900);else route(`M${h.x+h.w} ${h.y+h.h/2}C${h.x+h.w+20} ${h.y+h.h/2} ${p.x-20} ${p.y+p.h/2} ${p.x} ${p.y+p.h/2}`,product,1800,900)
}
new ResizeObserver(layout).observe(panel);[hub,product,...sources].forEach(e=>new ResizeObserver(layout).observe(e));layout();const clock=controls(panel);
F.run(panel,t=>{const time=clock(t)%F.cycle;routes.forEach(a=>{const length=a.path.getTotalLength();a.dots.forEach((d,i)=>{const u=(time-a.start-i*F.delay)/a.duration;if(u<0||u>1){d.style.opacity=0;return}const q=a.path.getPointAtLength(length*F.smooth(u));d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.style.opacity=Math.max(0,Math.min(1,u*10,(1-u)*18))*(1-i*.065)});glow(a.target,F.arrival(time-a.start-a.duration))})},()=>{routes.forEach(a=>a.dots.forEach(d=>d.style.opacity=0));glow(hub,0);glow(product,0)});}
const perf=document.querySelector('.dev-performance-panel');
if(perf){
 // A request waterfall. The panel is pinned; scrolling switches the moment (Search, Checkout). Bars grow (cached, live, retried),
 // then the three promises light up on the chart. Without pinning (reduced motion, short screens) the tabs auto-play instead.
 const tabs=[...perf.querySelectorAll('.dp2-tabs button')],order=tabs.map(t=>t.dataset.tab),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const pin=perf.closest('.dp2-pin'),sticky=perf.closest('.dp2-sticky');
 let timers=[],current=null,visible=false,manual=false;
 const clear=()=>{timers.forEach(clearTimeout);timers=[]};
 const at=(ms,fn)=>timers.push(setTimeout(fn,ms));
 const flat=()=>reducedMotion.matches||innerHeight<620||sticky.offsetHeight+(parseFloat(getComputedStyle(sticky).top)||0)>innerHeight-16;
 function play(tab){clear();current=tab;perf.dataset.tab=tab;tabs.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  perf.classList.remove('is-run','hl-timeout','hl-retry','hl-monitor');void perf.offsetWidth;
  if(reducedMotion.matches){perf.classList.add('is-run','hl-timeout','hl-retry','hl-monitor');return}
  at(150,()=>perf.classList.add('is-run'));at(2600,()=>perf.classList.add('hl-timeout'));at(3300,()=>perf.classList.add('hl-retry'));at(4000,()=>perf.classList.add('hl-monitor'));
  if(flat()&&!manual&&visible)at(8200,()=>play(order[(order.indexOf(tab)+1)%order.length]))}
 const top=()=>parseFloat(getComputedStyle(sticky).top)||0;
 function fromScroll(){if(flat()){pin.classList.add('is-flat');return}pin.classList.remove('is-flat');
  const r=pin.getBoundingClientRect(),span=Math.max(1,pin.offsetHeight-sticky.offsetHeight-top());
  const p=Math.max(0,Math.min(.999,-(r.top-top())/span)),tab=order[Math.min(order.length-1,Math.floor(p*order.length))];
  if(tab!==current)play(tab)}
 tabs.forEach(b=>b.addEventListener('click',()=>{manual=true;if(flat()){play(b.dataset.tab);return}const i=order.indexOf(b.dataset.tab),r=pin.getBoundingClientRect(),span=pin.offsetHeight-sticky.offsetHeight-top();scrollTo({top:scrollY+r.top-top()+span*(i+.5)/order.length,behavior:'smooth'})}));
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&current===null)play('search')},{threshold:.2}).observe(perf);
 addEventListener('scroll',fromScroll,{passive:true});addEventListener('resize',fromScroll);reducedMotion.addEventListener('change',fromScroll);fromScroll();
 if(current===null)play('search');
}
// Find what you need: the five guides are one journey; a pulse travels card to card on the site's wiring.
const docsRoot=document.querySelector('#section-2 .dev-docs');
if(docsRoot){const cards=[...docsRoot.querySelectorAll('article')],layer=svg('svg',{class:'dev-flow-svg dev-docs-wires','aria-hidden':'true'});docsRoot.append(layer);let segs=[];
 function docsLayout(){layer.replaceChildren();segs=[];const r=docsRoot.getBoundingClientRect();layer.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
  const box=e=>{const b=e.getBoundingClientRect();return{x:b.left-r.left,y:b.top-r.top,w:b.width,h:b.height}};const contacts=new Set();
  const ring=(x,y)=>{const k=Math.round(x)+','+Math.round(y);if(contacts.has(k))return;contacts.add(k);layer.append(svg('circle',{cx:x,cy:y,r:3.5,fill:'#eee9de',stroke:'#f46649','stroke-width':1.2}))};
  for(let i=0;i<cards.length-1;i++){const a=box(cards[i]),b=box(cards[i+1]);if(Math.abs(a.y-b.y)>a.h/2)continue;const x=a.x+a.w/2,tx=b.x+b.w/2,y=a.y+a.h,drop=Math.min(30,r.height-y-6),m=y+drop,rr=Math.min(10,drop-1);
   const d=`M${x} ${y}V${m-rr}Q${x} ${m} ${x+rr} ${m}H${tx-rr}Q${tx} ${m} ${tx} ${m-rr}V${y}`;
   const path=svg('path',{d,fill:'none',stroke:'#f46649','stroke-width':1,'stroke-linecap':'round',opacity:.55});layer.append(path);ring(x,y);ring(tx,y);
   const dots=Array.from({length:9},(_,k)=>{const c=svg('circle',{r:F.radius(k),fill:'#fff8f1',stroke:'#f46649','stroke-width':.7,opacity:0});layer.append(c);return c});
   segs.push({path,dots,len:path.getTotalLength(),start:300+i*1050,duration:1000,to:cards[i+1]});}}
 new ResizeObserver(docsLayout).observe(docsRoot);cards.forEach(c=>new ResizeObserver(docsLayout).observe(c));docsLayout();
 F.run(docsRoot,t=>{const time=t%(F.cycle+700);glow(cards[0],F.arrival(time-100));segs.forEach(a=>{a.dots.forEach((d,i)=>{const u=(time-a.start-i*F.delay)/a.duration;if(u<0||u>1){d.setAttribute('opacity',0);return}const q=a.path.getPointAtLength(a.len*F.smooth(u));d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.setAttribute('opacity',Math.max(0,Math.min(1,u*10,(1-u)*18))*(1-i*.065))});glow(a.to,F.arrival(time-a.start-a.duration+150))})},()=>{cards.forEach(c=>glow(c,0));segs.forEach(a=>a.dots.forEach(d=>d.setAttribute('opacity',0)))});}
})();
