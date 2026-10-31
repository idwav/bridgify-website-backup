(()=>{
 const root=document.querySelector('.match-section');if(!root)return;
 const cards=[...root.querySelectorAll('.match-card')],fields=[...root.querySelectorAll('.match-control')],values=fields.map(f=>f.querySelector('.match-value')),pause=root.querySelector('[data-match=pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[{values:['Paris','Romantic','Evening'],lead:0},{values:['London','Live music','Evening'],lead:1},{values:['Rome','Attractions','Daytime'],lead:2},{values:['London','Attractions','Daytime'],lead:3},{values:['Paris','Food','Daytime'],lead:4},{values:['Florence','Culture','Daytime'],lead:5}];
 let motionStart=0,motionClock=0,currentLead=0,nextLead=0,moving=false,recycled=-1,recycleStart=0;
 let index=0,elapsed=0,last=0,paused=false,visible=false,phase=-1;
 const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
 function pose(slot,w){return {x:w*(w<500?.9:1)*[0,.54,.63,.69,.74,.78][slot],y:slot*9,scale:[1,.8,.68,.57,.48,.4][slot]};}
 function draw(card,p,opacity,z){card.style.transform=`translate3d(${p.x}px,${p.y}px,0) scale(${p.scale})`;card.style.opacity=opacity;card.style.zIndex=z;card.style.filter=`brightness(${.42+p.scale*.58})`;}
 function orbit(now){const w=root.querySelector('.match-deck').clientWidth;let t=reduced.matches?1:Math.min(1,(now-motionStart)/1550);
 if(moving&&t>=1){recycled=currentLead;recycleStart=now;currentLead=nextLead;moving=false;}
 cards.forEach((card,i)=>{const slot=(i-currentLead+cards.length)%cards.length;const p=pose(slot,w);
 if(!moving){draw(card,p,i===recycled?.35+.65*ease((now-recycleStart)/500):1,20-slot);return;}
 const advance=ease((t-.12)/.88);
 if(slot===0){const shrink=ease(t/.78),scale=1-shrink*.6;const incomingScale=.8+.2*advance;const back=pose(5,w);const retreat=ease((t-.18)/.82);draw(card,{x:back.x*retreat,y:back.y*shrink,scale},1-.65*shrink,scale<incomingScale?5:25);return;}
 const q=pose(slot-1,w);draw(card,{x:p.x+(q.x-p.x)*advance,y:p.y+(q.y-p.y)*advance,scale:p.scale+(q.scale-p.scale)*advance},1,20-slot);
 });
 }
 function arrange(lead){if(lead===currentLead&&!moving){cards.forEach((card,i)=>card.setAttribute('aria-hidden',i!==lead));return;}
 // Only adjacent cards advance through the visible queue. Other selections reset off-stage.
 if(reduced.matches||lead!==(currentLead+1)%cards.length){currentLead=lead;moving=false;}else{nextLead=lead;motionStart=motionClock;moving=true;}
 cards.forEach((card,i)=>{card.dataset.position=i===lead?0:1;card.setAttribute('aria-hidden',i!==lead)});orbit(motionClock);
 }

 function render(){const nextPhase=elapsed<240?0:elapsed<480?1:elapsed<850?2:elapsed<1500?3:4;if(nextPhase===phase)return;phase=nextPhase;const scene=scenes[index];
 fields.forEach((f,i)=>{f.classList.toggle('resolved',i<=phase);if(i<=phase)values[i].textContent=scene.values[i]});
 if(phase>=1){fields[1].querySelector('svg').innerHTML=index===0?'<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 8 14 8 14S25 10 20 5Z"/>':(index===2||index===3)?'<path d="M3 9h18L12 3 3 9Zm2 2v8m5-8v8m4-8v8m5-8v8M2 21h20"/>':'<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>';}
 if(phase>=1&&index===4)fields[1].querySelector('svg').innerHTML='<path d="M5 3v7m3-7v7m-6-7v7h6M5 10v11M17 3v18m0-18c-5 4-5 10 0 10"/>';
 if(phase>=1&&index===5)fields[1].querySelector('svg').innerHTML='<path d="M3 9h18L12 3 3 9Zm2 2v8m5-8v8m4-8v8m5-8v8M2 21h20"/>';
 if(phase>=2){fields[2].querySelector('svg').innerHTML=index>=2?'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>'; }
 root.classList.toggle('matching-signal',phase===3);root.classList.toggle('matching-result',phase===4);
 if(phase===4)arrange(scene.lead)
 }
 function start(n){index=(n+scenes.length)%scenes.length;elapsed=0;phase=-1;fields.forEach(f=>f.classList.remove('resolved'));root.classList.remove('matching-signal','matching-result');if(reduced.matches)elapsed=1600;render()}
 function frame(now){const delta=last?Math.min(now-last,80):0;last=now;if(visible&&!paused&&!document.hidden&&!reduced.matches){elapsed+=delta;if(elapsed>=5200)start(index+1);else render()}if(visible&&!paused&&!document.hidden){motionClock+=delta;orbit(motionClock);}requestAnimationFrame(frame)}
 root.querySelectorAll('[data-match]').forEach(button=>button.onclick=()=>{if(button.dataset.match==='pause'){paused=!paused;root.classList.toggle('match-paused',paused);pause.textContent=paused?'Play ▷':'Pause Ⅱ';pause.setAttribute('aria-label',paused?'Play carousel':'Pause carousel')}else start(index+(button.dataset.match==='next'?1:-1))});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.15}).observe(root);
 reduced.addEventListener('change',()=>{start(index)});arrange(0);start(0);requestAnimationFrame(frame);
})();
