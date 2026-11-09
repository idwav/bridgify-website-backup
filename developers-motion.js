/* Responsive contacts and the shared Experiences API motion cadence. */
(()=>{const N='http://www.w3.org/2000/svg',F=window.BridgifyFlow;if(!F)return;
const svg=(tag,a={})=>{const e=document.createElementNS(N,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e};
const arrow='<svg class="dev-mini-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
document.querySelectorAll('.dev-icon').forEach(s=>{const p=s.querySelector('path,circle,rect');if(!p)return;let q;try{q=p.getPointAtLength(0)}catch{return}s.append(svg('circle',{cx:q.x,cy:q.y,r:1.1,class:'dev-icon-light'}))});
document.querySelectorAll('.dev-booking-flow>b,.dev-experience>span').forEach(e=>e.innerHTML=arrow);
document.querySelectorAll('.dev-chip.live').forEach(e=>e.insertAdjacentHTML('afterbegin','<svg class="dev-mini-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m14 2-9 12h7l-2 8 9-13h-7Z"/></svg>'));
function controls(panel){let paused=false,offset=0,previous=0,clock=0;const c=document.createElement('div');c.className='dev-motion-controls';const replay=document.createElement('button'),pause=document.createElement('button');replay.type=pause.type='button';replay.textContent='Replay';pause.textContent='Pause animation';c.append(replay,pause);panel.after(c);replay.onclick=()=>{clock=0};pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Play animation':'Pause animation';pause.setAttribute('aria-pressed',paused)};return t=>{if(previous&&!paused)clock+=t-previous;previous=t;return clock}}
function glow(e,g){F.glow(e,g);e.style.borderColor='#f46649'}
const panel=document.querySelector('.dev-system'),hub=panel.querySelector('.dev-hub'),product=panel.querySelector('.dev-product'),sources=[...panel.querySelectorAll('.dev-slab')];const layer=svg('svg',{class:'dev-flow-svg','aria-hidden':'true'});panel.append(layer);let routes=[];
function layout(){layer.replaceChildren();const r=panel.getBoundingClientRect();layer.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);const box=e=>{const b=e.getBoundingClientRect();return{x:b.left-r.left,y:b.top-r.top,w:b.width,h:b.height}},h=box(hub),p=box(product),mobile=innerWidth<=760,contacts=new Set();routes=[];
function route(d,target,start,duration){const path=svg('path',{d});layer.append(path);[0,path.getTotalLength()].forEach(l=>{const q=path.getPointAtLength(l),key=q.x.toFixed(1)+','+q.y.toFixed(1);if(contacts.has(key))return;contacts.add(key);layer.append(svg('circle',{cx:q.x,cy:q.y,r:3,fill:'#fff8f1',stroke:'#f46649','stroke-width':1}))});const dots=Array.from({length:9},(_,i)=>{const c=svg('circle',{r:F.radius(i),fill:'#fff8f1',stroke:'#f46649','stroke-width':.7,class:'dev-flow-particle',opacity:0});layer.append(c);return c});routes.push({path,dots,target,start,duration})}
sources.forEach(e=>{const a=box(e);if(mobile){const x=a.x+a.w,y=a.y+a.h/2,rail=x+12,tx=h.x+h.w,ty=h.y+h.h/2;route(`M${x} ${y}H${rail}V${ty-8}Q${rail} ${ty} ${rail-8} ${ty}H${tx}`,hub,0,1600)}else{const x=a.x+a.w,y=a.y+a.h/2,tx=h.x,ty=h.y+h.h/2;route(`M${x} ${y}C${x+(tx-x)*.5} ${y} ${x+(tx-x)*.5} ${ty} ${tx} ${ty}`,hub,0,1600)}});
if(mobile)route(`M${h.x+h.w/2} ${h.y+h.h}V${p.y}`,product,1800,900);else route(`M${h.x+h.w} ${h.y+h.h/2}C${h.x+h.w+20} ${h.y+h.h/2} ${p.x-20} ${p.y+p.h/2} ${p.x} ${p.y+p.h/2}`,product,1800,900)
}
new ResizeObserver(layout).observe(panel);[hub,product,...sources].forEach(e=>new ResizeObserver(layout).observe(e));layout();const clock=controls(panel);
F.run(panel,t=>{const time=clock(t)%F.cycle;routes.forEach(a=>{const length=a.path.getTotalLength();a.dots.forEach((d,i)=>{const u=(time-a.start-i*F.delay)/a.duration;if(u<0||u>1){d.style.opacity=0;return}const q=a.path.getPointAtLength(length*F.smooth(u));d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.style.opacity=Math.max(0,Math.min(1,u*10,(1-u)*18))*(1-i*.065)});glow(a.target,F.arrival(time-a.start-a.duration))})},()=>{routes.forEach(a=>a.dots.forEach(d=>d.style.opacity=0));glow(hub,0);glow(product,0)});
const perf=document.querySelector('.dev-performance-panel'),chips=[...perf.querySelectorAll('.dev-chip.live'),...perf.querySelectorAll('.dev-booking-flow .dev-chip:not(.live)')],pc=controls(perf);const track=svg('svg',{class:'dev-flow-svg dev-performance-wires','aria-hidden':'true'});perf.append(track);let performanceRoutes=[];
function performanceLayout(){
 track.replaceChildren();performanceRoutes=[];const r=perf.getBoundingClientRect();track.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
 const box=e=>{const b=e.getBoundingClientRect();return{x:b.left-r.left,y:b.top-r.top,w:b.width,h:b.height}};
 const add=(d,start,duration)=>{const path=svg('path',{d});track.append(path);[0,path.getTotalLength()].forEach(l=>{const q=path.getPointAtLength(l);track.append(svg('circle',{cx:q.x,cy:q.y,r:3,fill:'#fff8f1',stroke:'#f46649','stroke-width':1}))});const dots=Array.from({length:9},(_,i)=>{const d=svg('circle',{r:F.radius(i),fill:'#fff8f1',stroke:'#f46649','stroke-width':.7,opacity:0,class:'dev-flow-particle'});track.append(d);return d});performanceRoutes.push({path,dots,start,duration})};
 chips.slice(0,-1).forEach((el,i)=>{const a=box(el),b=box(chips[i+1]);let d;
 if(i===0&&innerWidth>1000){const base=box(perf.querySelector('.dev-timeline')).y,x=a.x+a.w/2,y=a.y+a.h,tx=b.x+b.w/2,ty=b.y+b.h;d=`M${x} ${y}V${base-10}Q${x} ${base} ${x+10} ${base}H${tx-10}Q${tx} ${base} ${tx} ${base-10}V${ty}`}
 else if(i===0){const x=a.x+a.w,y=a.y+a.h/2,rail=r.width-10,tx=b.x+b.w,ty=b.y+b.h/2;d=`M${x} ${y}H${rail-8}Q${rail} ${y} ${rail} ${y+8}V${ty-8}Q${rail} ${ty} ${rail-8} ${ty}H${tx}`}
 else if(Math.abs(a.y-b.y)<a.h/2){d=`M${a.x+a.w} ${a.y+a.h/2}H${b.x}`}
 else{const x=a.x+a.w/2,y=a.y+a.h,tx=b.x+b.w/2,ty=b.y;d=`M${x} ${y}C${x} ${(y+ty)/2} ${tx} ${(y+ty)/2} ${tx} ${ty}`}
 add(d,[0,1700,2600][i],[1600,800,800][i]);
 });
}
new ResizeObserver(performanceLayout).observe(perf);chips.forEach(e=>new ResizeObserver(performanceLayout).observe(e));performanceLayout();
F.run(perf,t=>{const time=pc(t)%F.cycle;chips.forEach((e,i)=>glow(e,F.arrival(time-[0,1600,2500,3400][i])));performanceRoutes.forEach(a=>a.dots.forEach((d,i)=>{const u=(time-a.start-i*F.delay)/a.duration;if(u<0||u>1){d.style.opacity=0;return}const q=a.path.getPointAtLength(a.path.getTotalLength()*F.smooth(u));d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.style.opacity=Math.max(0,Math.min(1,u*10,(1-u)*18))*(1-i*.065)}))},()=>{chips.forEach(e=>glow(e,0));performanceRoutes.forEach(a=>a.dots.forEach(d=>d.style.opacity=0))});
})();
