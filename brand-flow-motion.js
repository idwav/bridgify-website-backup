/* Canonical motion values from the Experiences API hero. */
window.BridgifyFlow=(()=>{
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const arrival=t=>Math.pow(Math.sin(Math.PI*clamp(t/850)),2);
 // Fade the light's opacity as well as its radius; retain the coral resting frame.
 function glow(el,amount){
   const g=clamp(amount);
   el.style.setProperty('--flow-arrival',g*.95);
   el.style.filter=`drop-shadow(0 0 ${g*16}px rgba(244,102,73,${g}))`;
   const color=`rgb(${Math.round(244+11*g)},${Math.round(102+109*g)},${Math.round(73+103*g)})`;
   if(el instanceof SVGElement)el.style.stroke=color;else el.style.borderColor=color;
 }

 function run(root,draw,reset){const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=false,frame=0,last=0,elapsed=0;
 function tick(now){frame=0;if(!visible||document.hidden||reduced.matches){last=0;return}if(last)elapsed+=Math.min(now-last,60);last=now;draw(elapsed);frame=requestAnimationFrame(tick)}
 function resume(){cancelAnimationFrame(frame);last=0;frame=0;if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);else reset?.()}
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume()},{threshold:.1}).observe(root);document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);return reduced;
 }
 return {clamp,smooth,arrival,glow,run,radius:i=>2.8-i*.13,delay:90,cycle:5300};
})();
