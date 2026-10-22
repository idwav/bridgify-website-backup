// Experiences API row: tilt, entrance and the hub → card light pulses.
(()=>{
 const stage=document.querySelector('[data-api-porcelain]');
 if(!stage)return;
 const world=stage.querySelector('.ap-world');
 const routes=[...stage.querySelectorAll('.ap-wire')];
 const lengths=routes.map(p=>p.getTotalLength());
 const streaks=[...stage.querySelectorAll('.ap-streak')];
 const heads=[...stage.querySelectorAll('.ap-head')];
 const rings=[...stage.querySelectorAll('.ap-ring')];
 const wires=[...stage.querySelectorAll('.ap-wire,.ap-wire-glow')];
 const cards=[...stage.querySelectorAll('.ap-node')];
 // Wrap each card in a glass slab: stacked edge layers give it real thickness when tilted.
 cards.forEach(node=>{
  const card=node.querySelector('.ap-card'),slab=document.createElement('div'),shadow=document.createElement('div');
  slab.className='ap-slab';shadow.className='ap-shadow';
  for(let i=9;i>=1;i--){const e=document.createElement('i');e.className='ap-edge';e.style.setProperty('--i',i);slab.append(e)}
  const sheen=document.createElement('span');sheen.className='ap-sheen';card.append(sheen);
  node.insertBefore(shadow,card);node.insertBefore(slab,card);slab.append(card);
 });
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const PERIOD=2600,STREAK=60;
 let frame=0,last=0,elapsed=0,visible=false,hover=null,rx=0,ry=0;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};

 // Fit the cards-and-ring content (about 1180×620 world px) inside the stage.
 function fit(){const s=Math.min(stage.clientWidth/1180,stage.clientHeight/620);world.style.setProperty('--s',s.toFixed(4))}

 streaks.forEach((s,i)=>{s.style.strokeDasharray=STREAK+' '+(lengths[i]+STREAK)});
 wires.forEach(w=>{const l=w.getTotalLength();w.style.strokeDasharray=l;w.style.strokeDashoffset=motion.matches?0:l;w.style.transition='stroke-dashoffset 1.3s cubic-bezier(.6,0,.2,1) .3s'});

 // Blender-rendered ring loop: HEVC-with-alpha for Safari, VP9-with-alpha everywhere else.
 const video=stage.querySelector('.ap-ring-video');
 const safari=/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
 video.src='assets/api-ring.'+(safari?'mov':'webm');
 new ResizeObserver(fit).observe(stage);fit();

 function travel(i,u){
  const s=streaks[i],len=lengths[i],head=heads[i];
  if(u<=0||u>=1){s.style.opacity=0;head.style.opacity=0;return}
  s.style.opacity=Math.min(1,u*8,(1-u)*8);
  s.style.strokeDashoffset=STREAK-(len+STREAK)*u;
  const p=routes[i].getPointAtLength(len*Math.min(1,u*1.03));head.setAttribute('cx',p.x);head.setAttribute('cy',p.y);head.style.opacity=s.style.opacity;
 }
 function step(t,k){
  routes.forEach((_,i)=>travel(i,i===k?ease(t/1100):0));
  cards.forEach((c,i)=>c.classList.toggle('is-lit',i===k&&t>900&&t<2400));
  rings.forEach((r,i)=>{const u=(t-i*160)/1100;if(u>0&&u<1){r.setAttribute('r',22+70*(1-Math.pow(1-u,3)));r.style.opacity=.55*(1-u)}else r.style.opacity=0});
 }
 function tick(now){
  frame=0;if(!visible||document.hidden)return;
  if(last)elapsed+=Math.min(now-last,60);last=now;
  if(elapsed<0){frame=requestAnimationFrame(tick);return}
  const turn=Math.floor(elapsed/PERIOD),t=elapsed%PERIOD;
  step(t,turn%cards.length);
  world.style.setProperty('--pulse',Math.max(0,1-t/500).toFixed(3));
  const tx=hover?hover[1]*-6:Math.sin(now/2600)*1.4+1,ty=hover?hover[0]*9:Math.sin(now/3400)*2.5;
  rx+=(tx-rx)*.06;ry+=(ty-ry)*.06;
  world.style.setProperty('--rx',rx.toFixed(2)+'deg');world.style.setProperty('--ry',ry.toFixed(2)+'deg');
  frame=requestAnimationFrame(tick);
 }
 function resume(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;const live=visible&&!document.hidden&&!motion.matches;if(live){frame=requestAnimationFrame(tick);video.play().catch(()=>{})}else video.pause()}

 stage.addEventListener('pointermove',e=>{const b=stage.getBoundingClientRect();hover=[(e.clientX-b.left)/b.width-.5,(e.clientY-b.top)/b.height-.5]});
 stage.addEventListener('pointerleave',()=>{hover=null});
 new IntersectionObserver(([e])=>{
  visible=e.isIntersecting;
  if(visible&&!stage.classList.contains('is-in')){stage.classList.add('is-in');wires.forEach(w=>w.style.strokeDashoffset=0);elapsed=-1400}
  resume();
 },{threshold:.25}).observe(stage);
 document.addEventListener('visibilitychange',resume);motion.addEventListener('change',resume);
 if(motion.matches)stage.classList.add('is-in');
})();
