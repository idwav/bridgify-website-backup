(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-motion]').forEach(panel => {
   const controls = document.createElement('div'); controls.className = 'dev-motion-controls';
   const replay = document.createElement('button'); replay.textContent = 'Replay ↻';
   const pause = document.createElement('button'); pause.textContent = 'Pause animation Ⅱ';
   controls.append(replay, pause); panel.after(controls);
   let paused = false, visible = false, elapsed = 0, last = 0;
   const cable = panel.querySelector('.dev-cables');
   const paths = ['M0 32C85 32 80 150 200 150','M0 110C85 110 100 150 200 150','M0 190C85 190 100 150 200 150','M0 268C85 268 80 150 200 150'];
   const dots = cable ? paths.map(d => {
     const path = document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d',d); path.style.stroke='none'; cable.append(path);
     const dot = document.createElementNS('http://www.w3.org/2000/svg','circle'); dot.setAttribute('r','2.4'); dot.setAttribute('class','dev-cable-dot'); cable.append(dot); return {path,dot};
   }) : [];
   function sync(){ panel.toggleAttribute('data-paused',paused || reduced.matches); pause.textContent = paused ? 'Play animation ▷' : 'Pause animation Ⅱ'; pause.setAttribute('aria-pressed',String(paused)); }
   pause.onclick=()=>{paused=!paused;sync()};
   replay.onclick=()=>{elapsed=0;paused=false;panel.getAnimations({subtree:true}).forEach(a=>a.currentTime=0);sync()};
   new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;panel.toggleAttribute('data-offscreen',!visible)}, {threshold:.1}).observe(panel);
   const timeline=panel.querySelector('.dev-timeline');
   if(timeline)new ResizeObserver(()=>panel.style.setProperty('--travel',`${timeline.clientWidth-8}px`)).observe(timeline);
   function frame(now){if(last && visible && !paused && !reduced.matches){elapsed+=Math.min(now-last,50);dots.forEach(({path,dot},i)=>{const t=((elapsed/8000+i*.15)%1); const point=path.getPointAtLength(path.getTotalLength()*t);dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);dot.style.opacity=t<.08||t>.95?'0':'1'})}last=now;requestAnimationFrame(frame)}
   reduced.addEventListener('change',sync);sync();if(dots.length)requestAnimationFrame(frame);
 });
})();
