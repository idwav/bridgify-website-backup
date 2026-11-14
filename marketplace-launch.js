(()=>{
 const section=document.querySelector('#section-5'),work=section?.querySelector('.launch-workspace');if(!work)return;
 const buttons=[...work.querySelectorAll('[data-launch]')],panel=work.querySelector('.launch-timeline'),live=work.querySelector('.launch-live'),label=work.querySelector('[data-live-label]'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),F=window.BridgifyFlow;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('launch-timeline-motion');svg.setAttribute('aria-hidden','true');svg.setAttribute('data-managed-contacts','true');panel.append(svg);
 const targets=[...buttons,live],paths=[],contacts=[];
 const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));svg.append(e);return e};
 for(let i=0;i<3;i++)contacts.push(make('circle',{r:2.2}));
 for(let i=0;i<2;i++)paths.push(make('path',{}));
 const pulses=Array.from({length:9},(_,i)=>make('circle',{r:F.radius(i),class:'launch-wire-pulse',opacity:0}));
 const layout=()=>{
  // Measure in the SVG's own viewport, including fractional borders and zoom.
  const viewport=svg.getBoundingClientRect();
  if(!viewport.width||!viewport.height)return;
  svg.setAttribute('viewBox',`0 0 ${viewport.width} ${viewport.height}`);
  const days=work.querySelector('.launch-days').getBoundingClientRect();
  const cards=buttons.map(button=>button.getBoundingClientRect());
  const x=(days.left+cards[0].left)/2-viewport.left;
  const anchors=cards.map(card=>({x,y:card.top+card.height/2-viewport.top}));
  anchors.forEach((point,i)=>{
   contacts[i].setAttribute('cx',point.x);
   contacts[i].setAttribute('cy',point.y);
  });
  paths.forEach((path,i)=>path.setAttribute('d',`M ${anchors[i].x} ${anchors[i].y} L ${anchors[i+1].x} ${anchors[i+1].y}`));
 };
 // One animation clock controls particles, completion marks and storefront states.
 const travelDuration=1550,tailDuration=8*F.delay;
 const firstDeparture=1200,configurationArrival=firstDeparture+travelDuration;
 const secondDeparture=6500,launchArrival=secondDeparture+travelDuration;
 const liveAt=launchArrival+tailDuration+850,cycle=liveAt+4200;
 let elapsed=0,last=0,raf=0,visible=false;
 const hideMotion=()=>{
  pulses.forEach(pulse=>pulse.setAttribute('opacity',0));
  targets.forEach(target=>target.style.setProperty('--launch-arrival',0));
  contacts.forEach(contact=>contact.style.removeProperty('filter'));
 };
 const render=()=>{
  const t=elapsed%cycle,day=t<configurationArrival?0:t<launchArrival?1:2;
  const step=t>=liveAt?4:t>=configurationArrival+2400?3:t>=configurationArrival+1200?2:t>=configurationArrival?1:0;
  if(work.dataset.launchStep!==String(step))work.dataset.launchStep=step;
  buttons.forEach((button,i)=>{
   const complete=i===0?t>=firstDeparture:i===1?t>=secondDeparture:t>=liveAt;
   button.classList.toggle('pending',i>day);
   button.classList.toggle('complete',complete);
   button.classList.toggle('active',i===day&&!complete);
   button.setAttribute('aria-pressed',String(i===day));
   const arrivalAt=[0,configurationArrival,launchArrival][i];
   const glow=reduced.matches?0:F.arrival(t-arrivalAt);
   button.style.setProperty('--launch-arrival',glow);
   contacts[i].style.filter=glow?`drop-shadow(0 0 ${glow*12}px #ffd3b0)`:'';
  });
  const text=t>=liveAt?'Live':t>=configurationArrival?'Setting up':'Ready to begin';
  if(label.textContent!==text)label.textContent=text;
  const index=t>=secondDeparture?1:0,age=t-(index?secondDeparture:firstDeparture),path=paths[index];
  pulses.forEach((pulse,i)=>{
   const q=(age-i*F.delay)/travelDuration;
   if(reduced.matches||q<=0||q>=1){pulse.setAttribute('opacity',0);return}
   const point=path.getPointAtLength(path.getTotalLength()*F.smooth(q));
   pulse.setAttribute('cx',point.x);pulse.setAttribute('cy',point.y);
   pulse.setAttribute('r',F.radius(i)*(.8+.3*Math.sin(Math.PI*q)));
   pulse.setAttribute('opacity',Math.min(1,q*8,(1-q)*10));
  });
 };
 const tick=now=>{
  raf=0;if(!visible||document.hidden||reduced.matches){last=0;return}
  if(last)elapsed+=Math.min(now-last,64);
  last=now;render();raf=requestAnimationFrame(tick);
 };
 const resume=()=>{
  cancelAnimationFrame(raf);raf=0;last=0;
  const paused=!visible||document.hidden||reduced.matches;
  work.classList.toggle('launch-paused',paused);
  if(paused)hideMotion();else raf=requestAnimationFrame(tick);
 };
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  elapsed=reduced.matches?(i===2?liveAt:[0,configurationArrival][i]):[0,configurationArrival,launchArrival][i];
  last=0;layout();render();resume();
 }));
 const geometryObserver=new ResizeObserver(layout);
 [panel,work.querySelector('.launch-days'),...buttons].forEach(element=>geometryObserver.observe(element));
 document.fonts.ready.then(layout);layout();
 if(reduced.matches)elapsed=liveAt;
 render();
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume()},{threshold:.2}).observe(work);
 document.addEventListener('visibilitychange',resume);
 reduced.addEventListener('change',()=>{if(reduced.matches)elapsed=liveAt;render();resume()});
})();
