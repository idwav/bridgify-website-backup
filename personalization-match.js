(()=>{
 const root=document.querySelector('.match-section');if(!root)return;
 const cards=[...root.querySelectorAll('.match-card')],fields=[...root.querySelectorAll('.match-control')],values=fields.map(f=>f.querySelector('.match-value')),pause=root.querySelector('[data-match=pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[{values:['Paris','Romantic','Evening'],lead:0},{values:['Rome','Attractions','Daytime'],lead:2},{values:['London','Live music','Evening'],lead:1}];
 let index=0,elapsed=0,last=0,paused=false,visible=false,phase=-1;
 function arrange(lead){cards.forEach((card,i)=>{card.dataset.position=(i-lead+cards.length)%cards.length;card.setAttribute('aria-hidden',i!==lead);card.classList.remove('arriving')})}
 function render(){const nextPhase=elapsed<240?0:elapsed<480?1:elapsed<850?2:elapsed<1500?3:4;if(nextPhase===phase)return;phase=nextPhase;const scene=scenes[index];
 fields.forEach((f,i)=>{f.classList.toggle('resolved',i<=phase);if(i<=phase)values[i].textContent=scene.values[i]});
 if(phase>=1){fields[1].querySelector('svg').innerHTML=index===0?'<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 8 14 8 14S25 10 20 5Z"/>':index===1?'<path d="M3 9h18L12 3 3 9Zm2 2v8m5-8v8m4-8v8m5-8v8M2 21h20"/>':'<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>';}
 if(phase>=2){fields[2].querySelector('svg').innerHTML=index===1?'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>'; }
 root.classList.toggle('matching-signal',phase===3);root.classList.toggle('matching-result',phase===4);
 if(phase===4){arrange(scene.lead);if(!reduced.matches){void cards[scene.lead].offsetWidth;cards[scene.lead].classList.add('arriving')}}
 }
 function start(n){index=(n+scenes.length)%scenes.length;elapsed=0;phase=-1;fields.forEach(f=>f.classList.remove('resolved'));root.classList.remove('matching-signal','matching-result');if(reduced.matches)elapsed=1400;render()}
 function frame(now){const delta=last?Math.min(now-last,80):0;last=now;if(visible&&!paused&&!document.hidden&&!reduced.matches){elapsed+=delta;if(elapsed>=5200)start(index+1);else render()}requestAnimationFrame(frame)}
 root.querySelectorAll('[data-match]').forEach(button=>button.onclick=()=>{if(button.dataset.match==='pause'){paused=!paused;root.classList.toggle('match-paused',paused);pause.textContent=paused?'Play ▷':'Pause Ⅱ';pause.setAttribute('aria-label',paused?'Play carousel':'Pause carousel')}else start(index+(button.dataset.match==='next'?1:-1))});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.15}).observe(root);
 reduced.addEventListener('change',()=>{start(index)});arrange(0);start(0);requestAnimationFrame(frame);
})();
