(()=>{const root=document.querySelector('.wo-section'),F=window.BridgifyFlow;if(!root||!F)return;
const you=root.querySelector('.wo-you'),seam=root.querySelector('.wo-seam'),target=root.querySelector('.wo-us'),chips=[...root.querySelectorAll('.wo-chip')],ops=[...root.querySelectorAll('.wo-op')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const dots=Array.from({length:9},()=>{const d=document.createElement('i');d.className='wo-feed-dot';d.setAttribute('aria-hidden','true');seam.append(d);return d});
// One clock: inputs light up one by one, flow runs down into the marketplace, then each operation switches on.
const CYCLE=7600,CHIP=[300,800,1300],FLOW=1900,ARRIVE=FLOW+1600+8*F.delay,OP=i=>ARRIVE+i*330,FADE=6900;
function state(t){
 root.classList.toggle('wo-is-fed',t>=CHIP[2]+300&&t<FADE);
 chips.forEach((c,i)=>c.classList.toggle('is-on',t>=CHIP[i]&&t<FADE));
 ops.forEach((o,i)=>o.classList.toggle('is-on',t>=OP(i)&&t<FADE));
}
if(reduced.matches){root.classList.add('wo-is-fed');chips.forEach(c=>c.classList.add('is-on'));ops.forEach(o=>o.classList.add('is-on'))}
F.run(root,time=>{if(reduced.matches)return;const t=time%CYCLE;state(t);
 const wide=matchMedia('(min-width:600px)').matches,sr=seam.getBoundingClientRect(),a0=wide?you.getBoundingClientRect().bottom-sr.top:0,aLen=wide?target.getBoundingClientRect().top-you.getBoundingClientRect().bottom:seam.clientHeight;
 dots.forEach((d,i)=>{const u=(t-FLOW-i*F.delay)/1600,q=F.clamp(u);d.style.top=`${a0+F.smooth(q)*aLen}px`;d.style.opacity=u>0&&u<1?String(Math.min(1,q*10,(1-q)*18)):0;d.style.transform=`translate(-50%,-50%) scale(${(.8+.3*Math.sin(q*Math.PI))*(1-i*.025)})`});
 target.style.setProperty('--wo-arrival',F.arrival(t-(FLOW+1600+8*F.delay)))},()=>{dots.forEach(d=>d.style.opacity=0);target.style.setProperty('--wo-arrival',0);if(!reduced.matches){chips.forEach(c=>c.classList.remove('is-on'));ops.forEach(o=>o.classList.remove('is-on'))}})})();
