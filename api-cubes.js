// Experiences API, cubes variant: play the Blender loop and light the card when the wire pulse reaches it.
(()=>{
 const stage=document.querySelector('[data-api-cubes]');
 if(!stage)return;
 const video=stage.querySelector('.cb-video'),card=stage.querySelector('.cb-card');
 const photos=[...stage.querySelectorAll('.cb-photo img')];
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 // HEVC-with-alpha for Safari, VP9-with-alpha everywhere else.
 const safari=/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
 video.src='assets/api-cubes.'+(safari?'mov':'webm');
 // In the 4s render the pulse reaches the wire end at 3.39s.
 const LOOP=4,ARRIVE=3.39,HOLD=.6;
 let frame=0,visible=false,lastLoop=-1,photo=0;
 function tick(){
  frame=0;if(!visible||document.hidden)return;
  const t=video.currentTime%LOOP,lit=t>=ARRIVE&&t<ARRIVE+HOLD;
  card.classList.toggle('is-lit',lit);
  const loop=Math.floor(video.currentTime/LOOP);
  if(lit&&loop!==lastLoop){lastLoop=loop;photo=(photo+1)%photos.length;photos.forEach((p,i)=>p.classList.toggle('is-on',i===photo))}
  if(t<ARRIVE)lastLoop=-1;
  frame=requestAnimationFrame(tick);
 }
 function resume(){
  if(frame)cancelAnimationFrame(frame);frame=0;
  if(visible&&!document.hidden&&!motion.matches){video.play().catch(()=>{});frame=requestAnimationFrame(tick)}else video.pause();
 }
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume()},{threshold:.2}).observe(stage);
 document.addEventListener('visibilitychange',resume);motion.addEventListener('change',resume);
})();
