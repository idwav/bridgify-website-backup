/* Measured multi-particle sequence using the Experiences API easing and arrival envelope. */
(()=>{
 const root=document.querySelector('.bh-hero'),F=window.BridgifyFlow;
 if(!root||!F)return;
 const ns='http://www.w3.org/2000/svg',visual=root.querySelector('.bh-visual'),svg=root.querySelector('.bh-connector');
 const selected=root.querySelector('.bh-selected'),supply=root.querySelector('.bh-supply'),cards=[...root.querySelectorAll('.bh-step-card')];
 const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};
 root.querySelectorAll('.bh-icon').forEach(icon=>{const shape=icon.querySelector('path,rect,circle');if(!shape)return;const p=shape.getPointAtLength(0);icon.append(make('circle',{class:'bh-icon-light',cx:p.x,cy:p.y,r:1.1}))});
 let routes=[],pending=0;
 function layout(){
  svg.replaceChildren();routes=[];
  const rect=visual.getBoundingClientRect(),mobile=matchMedia('(max-width:760px)').matches;
  svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  const box=e=>{const r=e.getBoundingClientRect();return{x:r.left-rect.left,y:r.top-rect.top,w:r.width,h:r.height}};
  const port=(e,side)=>{const b=box(e);return{x:b.x+(side==='left'?0:side==='right'?b.w:b.w/2),y:b.y+(side==='top'?0:side==='bottom'?b.h:b.h/2)}};
  const contacts=new Set();
  function route(a,b,target,start,duration,d){
   const path=make('path',{class:'bh-route',d:d||`M${a.x} ${a.y}C${(a.x+b.x)/2} ${a.y} ${(a.x+b.x)/2} ${b.y} ${b.x} ${b.y}`});svg.append(path);
   [a,b].forEach(p=>{const key=`${p.x},${p.y}`;if(contacts.has(key))return;contacts.add(key);svg.append(make('circle',{class:'bh-contact',cx:p.x,cy:p.y,r:2.6}))});
   const dots=Array.from({length:9},(_,i)=>{const dot=make('circle',{class:'bh-particle',r:F.radius(i),opacity:0});svg.append(dot);return dot});
   routes.push({path,dots,target,start,duration,length:path.getTotalLength()});
  }
  const s=port(selected,'bottom'),a=port(supply,'top');
  if(!mobile){a.x=s.x;route(a,s,selected,0,1600,`M${a.x} ${a.y}V${s.y}`)}
  else{
   // Travel beside the three cards, never through their illustrations or captions.
   const frame=box(root.querySelector('.bh-app')),rail=frame.x+frame.w-6;
   const into=port(selected,'right'),bend=6,floor=a.y-12;
   route(a,into,selected,0,1600,`M${a.x} ${a.y}V${floor+bend}Q${a.x} ${floor} ${a.x+bend} ${floor}H${rail-bend}Q${rail} ${floor} ${rail} ${floor-bend}V${into.y+bend}Q${rail} ${into.y} ${rail-bend} ${into.y}H${into.x}`);
  }
  const end=port(cards[0],mobile?'top':'left'),begin=port(selected,mobile?'bottom':'right');
  route(begin,end,cards[0],2150,900,mobile?`M${begin.x} ${begin.y}V${begin.y+8}Q${begin.x} ${begin.y+14} ${begin.x-6} ${begin.y+14}H${end.x+6}Q${end.x} ${begin.y+14} ${end.x} ${begin.y+20}V${end.y}`:null);
  cards.slice(0,-1).forEach((card,i)=>route(port(card,'right'),port(cards[i+1],'left'),cards[i+1],3700+i*1550,900));
 }
 const schedule=()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(layout)};
 const observer=new ResizeObserver(schedule);[visual,selected,supply,...cards].forEach(e=>observer.observe(e));
 document.fonts.ready.then(schedule);window.addEventListener('load',schedule,{once:true});layout();
 function reset(){routes.forEach(r=>{r.dots.forEach(dot=>dot.setAttribute('opacity',0));r.target.style.setProperty('--bh-arrival',0)});cards.forEach(c=>c.parentElement.removeAttribute('data-active'))}
 F.run(visual,time=>{
  const phase=time%8000;
  for(const r of routes){
   const elapsed=phase-r.start;
   r.dots.forEach((dot,i)=>{
    const u=(elapsed-i*F.delay)/r.duration,q=F.clamp(u),p=r.path.getPointAtLength(r.length*F.smooth(q));
    dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);
    dot.setAttribute('r',F.radius(i)*(0.8+Math.sin(q*Math.PI)*.3));
    dot.setAttribute('opacity',u>0&&u<1?(1-i*.065)*Math.min(1,u*10,(1-u)*18):0);
   });
   const glow=F.arrival(elapsed-r.duration);
   r.path.style.strokeWidth=String(.7+.3*glow);
   r.target.style.setProperty('--bh-arrival',glow*.95);
   r.target.closest('.bh-step')?.setAttribute('data-active',String(elapsed>=r.duration&&elapsed<r.duration+850));
  }
 },reset);
})();
