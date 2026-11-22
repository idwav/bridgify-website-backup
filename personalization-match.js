(()=>{
 const root=document.querySelector('.match-section');if(!root)return;
 const cards=[...root.querySelectorAll('.match-card')],fields=[...root.querySelectorAll('.match-control')],values=fields.map(f=>f.querySelector('.match-value')),pause=root.querySelector('[data-match=pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[{values:['Paris','Romantic','Couple · evenings','Nov 20–22'],lead:0},{values:['London','Live music','Friends · evenings','Nov 23–25'],lead:1},{values:['Rome','Attractions','Couple · daytime','Nov 26–28'],lead:2},{values:['London','Attractions','Family · daytime','Dec 2–4'],lead:3},{values:['Paris','Food','Food lovers · daytime','Dec 5–7'],lead:4},{values:['Florence','Culture','Solo · daytime','Dec 8–10'],lead:5}];
 let currentLead=0,glowStart=0,motionClock=0;
 let index=0,elapsed=0,last=0,paused=false,visible=false,phase=-1;
 // The results panel: the matched card on the left, the full ranked queue on the right.
 const deck=root.querySelector('.match-deck'),stage=document.createElement('div'),queue=document.createElement('ul'),head=document.createElement('div');
 stage.className='match-stage';queue.className='match-queue';head.className='match-panel-head';head.innerHTML='<b>Matched for this traveler</b><span>Ranked by AIyelet</span>';
 cards.forEach(c=>stage.append(c));
 const rows=cards.map((c,i)=>{const li=document.createElement('li');li.className='match-row';const img=c.querySelector('img');li.innerHTML=`<img alt="" src="${img?img.getAttribute('src'):''}"><span><b>${c.querySelector('h3').textContent}</b><small>${c.querySelector('p').textContent.replace('⌖','').trim()}</small></span>`;queue.append(li);return li});
 deck.replaceChildren(head,stage,queue);
 const FD=window.BridgifyFlow,workspace=root.querySelector('.match-workspace'),NS='http://www.w3.org/2000/svg',wsvg=document.createElementNS(NS,'svg');wsvg.setAttribute('class','match-wires');wsvg.setAttribute('aria-hidden','true');workspace.prepend(wsvg);let runs=[];
 const mk=(tag,at)=>{const e=document.createElementNS(NS,tag);Object.entries(at).forEach(([k,v])=>e.setAttribute(k,v));wsvg.append(e);return e};
 function measureWires(){wsvg.replaceChildren();runs=[];if(innerWidth<=760)return;const wr=workspace.getBoundingClientRect();wsvg.setAttribute('viewBox',`0 0 ${wr.width} ${wr.height}`);const eng=root.querySelector('.match-engine').getBoundingClientRect(),ex0=eng.left-wr.left,ex1=eng.right-wr.left,ey=eng.top+eng.height/2-wr.top,dk=deck.getBoundingClientRect(),sx=dk.left-wr.left,sy=dk.top+dk.height/2-wr.top;
  const seg=(x0,y0,x1,y1,t0)=>{const m=(x0+x1)/2,p=mk('path',{d:`M${x0} ${y0}C${m} ${y0} ${m} ${y1} ${x1} ${y1}`,class:'match-wire'});mk('circle',{cx:x0,cy:y0,r:2.4,class:'match-contact'});runs.push({p,t0,dots:Array.from({length:3},(_,i)=>mk('circle',{r:FD?FD.radius(i):3,class:'match-pulse',opacity:0}))})};
  if(innerWidth<=900){/* vertical tablet: the four traveler fields on top, the engine under them, the results last; the wires run top to bottom */const ctr=[...root.querySelectorAll('.match-control')].map(c=>c.getBoundingClientRect()),ex=eng.left+eng.width/2-wr.left,et=eng.top-wr.top,eb=eng.bottom-wr.top,dt=dk.top-wr.top,dx=dk.left+dk.width/2-wr.left,ym=(Math.max(...ctr.map(r=>r.bottom))-wr.top+et)/2,add=(d,x0,y0,t0)=>{const p=mk('path',{d,class:'match-wire'});mk('circle',{cx:x0,cy:y0,r:2.4,class:'match-contact'});runs.push({p,t0,dots:Array.from({length:3},(_,i)=>mk('circle',{r:FD?FD.radius(i):3,class:'match-pulse',opacity:0}))})};ctr.forEach((r,i)=>{const x0=r.left+r.width/2-wr.left,y0=r.bottom-wr.top;add(`M${x0} ${y0}V${ym}H${ex}V${et}`,x0,y0,500+i*140)});add(`M${ex} ${eb}V${dt}`,ex,eb,1500);mk('circle',{cx:ex,cy:et,r:2.6,class:'match-contact'});mk('circle',{cx:ex,cy:dt,r:2.6,class:'match-contact'});return}const cp=root.querySelector('.match-controls').getBoundingClientRect(),px=cp.right-wr.left,xm=(px+ex0)/2,rr=14;
  const ortho=(x0,y0,x1,y1,t0)=>{const d=y1>y0?1:y1<y0?-1:0,r=Math.min(rr,Math.abs(y1-y0)/2),path=d===0?`M${x0} ${y0}H${x1}`:`M${x0} ${y0}H${xm-r}Q${xm} ${y0} ${xm} ${y0+d*r}V${y1-d*r}Q${xm} ${y1} ${xm+r} ${y1}H${x1}`,p=mk('path',{d:path,class:'match-wire'});mk('circle',{cx:x0,cy:y0,r:2.4,class:'match-contact'});runs.push({p,t0,dots:Array.from({length:3},(_,i)=>mk('circle',{r:FD?FD.radius(i):3,class:'match-pulse',opacity:0}))})};
  root.querySelectorAll('.match-control').forEach((c,i)=>{const b=c.getBoundingClientRect();ortho(px,b.top+b.height/2-wr.top,ex0,ey,500+i*140)});
  seg(ex1,ey,sx,sy,1500);mk('circle',{cx:ex0,cy:ey,r:2.6,class:'match-contact'});mk('circle',{cx:sx,cy:sy,r:2.6,class:'match-contact'})}
 new ResizeObserver(measureWires).observe(workspace);new ResizeObserver(measureWires).observe(deck);document.fonts&&document.fonts.ready.then(measureWires);
 function feed(){runs.forEach(({p,t0,dots})=>{const L=p.getTotalLength();dots.forEach((d,i)=>{const u=(elapsed-t0-i*(FD?FD.delay:90))/800,q=Math.max(0,Math.min(1,u));if(u<=0||u>=1){d.setAttribute('opacity',0);return}const pt=p.getPointAtLength(L*(FD?FD.smooth(q):q));d.setAttribute('cx',pt.x);d.setAttribute('cy',pt.y);d.setAttribute('opacity',Math.min(1,q*10,(1-q)*14))})})}
 function glow(now){const g=FD&&root.classList.contains('matching-result')?FD.arrival(now-glowStart):0;cards.forEach((c,i)=>c.style.setProperty('--arrival',i===currentLead?g:0));deck.style.setProperty('--arrival',g)}
 function arrange(lead){const prev=currentLead;currentLead=lead;glowStart=motionClock;cards.forEach((card,i)=>{card.classList.toggle('is-active',i===lead);card.classList.toggle('is-leaving',i===prev&&prev!==lead);card.setAttribute('aria-hidden',i!==lead);card.dataset.position=i===lead?0:1});rows.forEach((r,i)=>r.classList.toggle('is-active',i===lead))}

 function render(){const nextPhase=elapsed<300?0:elapsed<600?1:elapsed<900?2:elapsed<2600?3:4;if(nextPhase===phase)return;phase=nextPhase;const scene=scenes[index];
 fields.forEach((f,i)=>{f.classList.toggle('resolved',i<=phase);if(i<=phase)values[i].textContent=scene.values[i]});
 if(phase>=1){fields[1].querySelector('svg').innerHTML=index===0?'<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 8 14 8 14S25 10 20 5Z"/>':(index===2||index===3)?'<path d="M3 9h18L12 3 3 9Zm2 2v8m5-8v8m4-8v8m5-8v8M2 21h20"/>':'<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>';}
 if(phase>=1&&index===4)fields[1].querySelector('svg').innerHTML='<path d="M5 3v7m3-7v7m-6-7v7h6M5 10v11M17 3v18m0-18c-5 4-5 10 0 10"/>';
 if(phase>=1&&index===5)fields[1].querySelector('svg').innerHTML='<path d="M3 9h18L12 3 3 9Zm2 2v8m5-8v8m4-8v8m5-8v8M2 21h20"/>';
 if(phase>=2){fields[2].querySelector('svg').innerHTML=index>=2?'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>'; }
 root.classList.toggle('matching-signal',phase===3);root.classList.toggle('matching-result',phase===4);
 root.querySelector('.match-engine-status').textContent=phase===4?'Experiences matched':'Matching your trip';
 if(phase===4)arrange(scene.lead)
 }
 function start(n){index=(n+scenes.length)%scenes.length;elapsed=0;phase=-1;fields.forEach(f=>f.classList.remove('resolved'));root.classList.remove('matching-signal','matching-result');if(reduced.matches||paused)elapsed=1600;render()}
 function frame(now){const delta=last?Math.min(now-last,80):0;last=now;if(visible&&!paused&&!document.hidden&&!reduced.matches){elapsed+=delta;if(elapsed>=5400)start(index+1);else render();feed()}if(visible&&!paused&&!document.hidden){motionClock+=delta;glow(motionClock);}requestAnimationFrame(frame)}
 root.querySelectorAll('[data-match]').forEach(button=>button.onclick=()=>{if(button.dataset.match==='pause'){paused=!paused;root.classList.toggle('match-paused',paused);pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',paused?'Play carousel':'Pause carousel')}else start(index+(button.dataset.match==='next'?1:-1))});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.15}).observe(root);
 reduced.addEventListener('change',()=>{start(index)});arrange(0);start(0);requestAnimationFrame(frame);
})();
