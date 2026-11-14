(()=>{
 const section=document.querySelector('#section-5'),work=section?.querySelector('.launch-workspace');if(!work)return;
 const buttons=[...work.querySelectorAll('[data-launch]')],panel=work.querySelector('.launch-timeline'),live=work.querySelector('.launch-live'),label=work.querySelector('[data-live-label]'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),F=window.BridgifyFlow;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('launch-timeline-motion');svg.setAttribute('aria-hidden','true');svg.setAttribute('data-managed-contacts','true');panel.append(svg);
 const targets=[...buttons,live],paths=[],contacts=[];
 const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));svg.append(e);return e};
 for(let i=0;i<3;i++)contacts.push(make('circle',{r:2.2}));
 for(let i=0;i<2;i++)paths.push(make('path',{}));
 const pulses=Array.from({length:9},(_,i)=>make('circle',{r:F.radius(i),class:'launch-wire-pulse',opacity:0}));
 let timers=[],frames=new Set(),visible=false,traveling=false;
 const frame=fn=>{const id=requestAnimationFrame(t=>{frames.delete(id);fn(t)});frames.add(id)};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const clear=()=>{work.classList.add('launch-paused');timers.forEach(clearTimeout);timers=[];frames.forEach(cancelAnimationFrame);frames.clear();traveling=false;pulses.forEach(p=>p.setAttribute('opacity',0));targets.forEach(e=>e.style.removeProperty('--launch-arrival'));contacts.flat().forEach(c=>c.style.removeProperty('filter'))};
 const layout=()=>{
  const r=panel.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${panel.clientWidth} ${panel.clientHeight}`);
  paths.forEach((p,i)=>{const a=buttons[i].getBoundingClientRect(),b=buttons[i+1].getBoundingClientRect(),d=work.querySelector('.launch-days').getBoundingClientRect(),x=d.left-r.left-panel.clientLeft+.5,y=a.top-r.top-panel.clientTop+27,Y=b.top-r.top-panel.clientTop+27;
   p.setAttribute('d',`M ${x} ${y} L ${x} ${Y}`);
   [[x,y],[x,Y]].forEach(([cx,cy],j)=>{contacts[i+j].setAttribute('cx',cx);contacts[i+j].setAttribute('cy',cy)})
  });
 };
 const show=n=>{work.dataset.launchStep=n;const day=n===0?0:n>=4?4:2;
  buttons.forEach(b=>{const k=Number(b.dataset.launch);b.classList.toggle('pending',k>day);b.classList.toggle('complete',k<day||n>=4);b.classList.toggle('active',k===day);b.setAttribute('aria-pressed',String(k===day))});
  label.textContent=n===4?'Live':n===0?'Ready to begin':'Setting up';
 };
 const glow=target=>{if(reduced.matches)return;let start;const tick=t=>{start??=t;const age=t-start;target.style.setProperty('--launch-arrival',F.arrival(age));const index=targets.indexOf(target);if(contacts[index])contacts[index].style.filter=`drop-shadow(0 0 ${F.arrival(age)*12}px #ffd3b0)`;if(age<850)frame(tick);else target.style.removeProperty('--launch-arrival')};frame(tick)};
 const travel=(index,arrive)=>{
  if(reduced.matches){arrive();return}work.classList.remove('launch-paused');layout();traveling=true;const path=paths[index];let start;
  const tick=t=>{start??=t;const age=t-start;
   pulses.forEach((pulse,i)=>{const q=(age-i*F.delay)/1550,progress=F.clamp(q),pos=path.getPointAtLength(path.getTotalLength()*F.smooth(progress));
    pulse.setAttribute('cx',pos.x);pulse.setAttribute('cy',pos.y);pulse.setAttribute('r',F.radius(i)*(.8+.3*Math.sin(Math.PI*progress)));pulse.setAttribute('opacity',q>0&&q<1?Math.min(1,q*8,(1-q)*10):0);
   });
   if(age<1550+8*F.delay)frame(tick);else{traveling=false;pulses.forEach(p=>p.setAttribute('opacity',0));glow(targets[index+1]);arrive()}
  };frame(tick);
 };
 const configure=()=>{show(1);later(()=>show(2),1200);later(()=>show(3),2400)};
 const launch=()=>travel(1,()=>{buttons.forEach((b,i)=>{b.classList.toggle('active',i===2);b.classList.toggle('complete',i<2);b.classList.remove('pending');b.setAttribute('aria-pressed',String(i===2))});later(()=>show(4),260)});
 const play=()=>{clear();if(reduced.matches){show(4);return}work.classList.remove('launch-paused');show(0);later(()=>travel(0,configure),1200);later(launch,6500);later(()=>{if(visible&&!document.hidden)play()},14500)};
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{clear();if(i===0){show(0);glow(buttons[0])}else if(i===1){show(0);travel(0,()=>reduced.matches?show(3):configure())}else{show(3);launch()}if(!reduced.matches)later(()=>{if(visible&&!document.hidden)play()},9500)}));
 new ResizeObserver(layout).observe(panel);show(4);layout();
 new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!document.hidden)play();else{clear();show(4)}},{threshold:.2}).observe(work);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();show(4)}else if(visible)play()});reduced.addEventListener('change',()=>{clear();if(reduced.matches)show(4);else if(visible)play()});
})();
