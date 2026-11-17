(()=>{
 const root=document.querySelector('.match-section');if(!root)return;
 const cards=[...root.querySelectorAll('.match-card')],fields=[...root.querySelectorAll('.match-control')],values=fields.map(f=>f.querySelector('.match-value')),pause=root.querySelector('[data-match=pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[{values:['Paris','Romantic','Couple · evenings','Nov 20–22'],lead:0},{values:['London','Live music','Friends · evenings','Nov 23–25'],lead:1},{values:['Rome','Attractions','Couple · daytime','Nov 26–28'],lead:2},{values:['London','Attractions','Family · daytime','Dec 2–4'],lead:3},{values:['Paris','Food','Food lovers · daytime','Dec 5–7'],lead:4},{values:['Florence','Culture','Solo · daytime','Dec 8–10'],lead:5}];
 let motionStart=0,motionClock=0,currentLead=0,nextLead=0,moving=false,recycleStart=0;
 let index=0,elapsed=0,last=0,paused=false,visible=false,phase=-1;
 const slot=document.createElement('div');slot.className='match-slot';slot.setAttribute('aria-hidden','true');root.querySelector('.match-deck').prepend(slot);
 const FD=window.BridgifyFlow,workspace=root.querySelector('.match-workspace'),feedDots=Array.from({length:9},()=>{const d=document.createElement('i');d.className='match-feed-dot';d.setAttribute('aria-hidden','true');workspace.append(d);return d});
 function feed(){const wr=workspace.getBoundingClientRect(),c=root.querySelector('.match-controls').getBoundingClientRect(),e=root.querySelector('.match-engine').getBoundingClientRect(),dk=cards[0].getBoundingClientRect(),y=e.top+e.height/2-wr.top;const segs=[[c.right-wr.left,e.left-wr.left,600],[e.right-wr.left,dk.left-wr.left,1500]];feedDots.forEach((d,i)=>{let on=0,x=0;segs.forEach(([x0,x1,t0])=>{const u=(elapsed-t0-i*(FD?FD.delay:90))/900;if(u>0&&u<1){on=Math.min(1,u*10,(1-u)*14);x=x0+(x1-x0)*(FD?FD.smooth(u):u)}});d.style.opacity=on;d.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${.8+.4*(1-i/9)})`})}
 const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
 const knots=[{x:.14,y:0,s:.97,o:0},{x:0,y:0,s:1,o:1},{x:-.14,y:0,s:.97,o:0},{x:-.14,y:0,s:.97,o:0},{x:-.14,y:0,s:.97,o:0}];
 const easeIO=t=>{t=Math.max(0,Math.min(1,t));return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
 function at(f){const k=Math.max(-1,Math.min(3,f))+1,i=Math.min(3,Math.floor(k)),u=k-i,a=knots[i],b=knots[i+1],m=p=>a[p]+(b[p]-a[p])*u;return {x:m('x'),y:m('y'),s:m('s'),o:m('o')}}
 function orbit(now){cards.forEach((c,i)=>c.style.setProperty('--arrival',i===currentLead&&!moving?window.BridgifyFlow.arrival(now-recycleStart):0));const deck=root.querySelector('.match-deck'),w=deck.clientWidth,cw=cards[0].offsetWidth,base=(w-cw)/2;slot.style.left=base+'px';slot.style.width=cw+'px';
 let adv=0;if(moving){const t=reduced.matches?1:(now-motionStart)/1200;if(t>=1){currentLead=nextLead;recycleStart=now;moving=false}else adv=easeIO(t)}
 cards.forEach((card,i)=>{const slot=(i-currentLead+cards.length)%cards.length,f=slot-adv,p=at(f);
 card.style.transform=`translate3d(${base+p.x*cw}px,${p.y}px,0) scale(${p.s})`;card.style.opacity=p.o;card.style.zIndex=40-Math.round(f*10);card.style.filter='none';card.style.pointerEvents=p.o<.6?'none':'';});
 }
 function arrange(lead){if(lead===currentLead&&!moving){cards.forEach((card,i)=>card.setAttribute('aria-hidden',i!==lead));return;}
 // Only adjacent cards advance through the visible queue. Other selections reset off-stage.
 if(reduced.matches||paused||lead!==(currentLead+1)%cards.length){currentLead=lead;moving=false;}else{nextLead=lead;motionStart=motionClock;moving=true;}
 cards.forEach((card,i)=>{card.dataset.position=i===lead?0:1;card.setAttribute('aria-hidden',i!==lead)});orbit(motionClock);
 }

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
 function frame(now){const delta=last?Math.min(now-last,80):0;last=now;if(visible&&!paused&&!document.hidden&&!reduced.matches){elapsed+=delta;if(elapsed>=5400)start(index+1);else render();feed()}if(visible&&!paused&&!document.hidden){motionClock+=delta;orbit(motionClock);}requestAnimationFrame(frame)}
 root.querySelectorAll('[data-match]').forEach(button=>button.onclick=()=>{if(button.dataset.match==='pause'){paused=!paused;root.classList.toggle('match-paused',paused);pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',paused?'Play carousel':'Pause carousel')}else start(index+(button.dataset.match==='next'?1:-1))});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.15}).observe(root);
 reduced.addEventListener('change',()=>{start(index)});arrange(0);start(0);requestAnimationFrame(frame);
})();
