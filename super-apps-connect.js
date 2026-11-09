/* Measured frame-to-frame connections using the shared Experiences API motion. */
(()=>{const F=window.BridgifyFlow;if(!F)return;const ns='http://www.w3.org/2000/svg';
 const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};
 document.querySelectorAll('.sc-demo').forEach((demo,index)=>{
  demo.querySelectorAll('.sc-icon').forEach(icon=>{const shape=icon.querySelector('path,rect,circle');if(shape){const p=shape.getPointAtLength(0);icon.append(make('circle',{class:'sc-icon-light',cx:p.x,cy:p.y,r:1.1}))}});
  const svg=make('svg',{class:'sc-flow-wires','aria-hidden':'true'});demo.append(svg);let routes=[],pending=0;
  function layout(){const r=demo.getBoundingClientRect(),mobile=matchMedia('(max-width:560px)').matches;svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);routes=[];const contacts=new Set();
   const port=(e,side)=>{const b=e.getBoundingClientRect();return{x:b.left-r.left+(side==='left'?0:side==='right'?b.width:b.width/2),y:b.top-r.top+(side==='top'?0:side==='bottom'?b.height:b.height/2)}};
   function add(from,to,start,duration,vertical=false){const a=port(from,vertical?'bottom':'right'),b=port(to,vertical?'top':'left');const d=vertical?`M${a.x} ${a.y}C${a.x} ${(a.y+b.y)/2} ${b.x} ${(a.y+b.y)/2} ${b.x} ${b.y}`:`M${a.x} ${a.y}C${(a.x+b.x)/2} ${a.y} ${(a.x+b.x)/2} ${b.y} ${b.x} ${b.y}`;const path=make('path',{class:'sc-flow-path',d});svg.append(path);[a,b].forEach(p=>{const key=p.x+','+p.y;if(!contacts.has(key)){contacts.add(key);svg.append(make('circle',{class:'sc-contact',cx:p.x,cy:p.y,r:2.2}))}});const length=path.getTotalLength(),dots=Array.from({length:length<100?3:9},(_,i)=>{const dot=make('circle',{class:'sc-particle',r:F.radius(i),opacity:0});svg.append(dot);return dot});routes.push({path,length,dots,target:to,start,duration})}
   if(index===0){const tiles=[...demo.querySelectorAll('.sc-tile')];tiles.slice(0,-1).forEach((tile,i)=>add(tile,tiles[i+1],i*1400,900,mobile&&i===1))}
   if(index===1){const steps=[...demo.querySelectorAll('.sc-check-step')];steps.slice(0,-1).forEach((step,i)=>add(step.querySelector('.sc-result'),steps[i+1].querySelector(mobile?'.sc-pill':'.sc-result'),i*1800,1100,mobile))}
   if(index===2){const hub=demo.querySelector('.sc-ai');demo.querySelectorAll('.sc-inputs>.sc-glass').forEach(input=>add(input,hub,0,1600));add(hub,demo.querySelector('.sc-map-result'),2150,900,mobile)}
  }
  const schedule=()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(layout)};new ResizeObserver(schedule).observe(demo);document.fonts.ready.then(schedule);layout();
  const reset=()=>routes.forEach(r=>{r.dots.forEach(d=>d.setAttribute('opacity',0));r.target.style.setProperty('--sc-arrival',0)});
  F.run(demo,time=>{const t=time%5300;reset();routes.forEach(r=>{const elapsed=t-r.start;r.dots.forEach((dot,i)=>{const u=(elapsed-i*F.delay)/r.duration,q=F.clamp(u),p=r.path.getPointAtLength(r.length*F.smooth(q));dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('r',F.radius(i)*(.8+.3*Math.sin(Math.PI*q)));dot.setAttribute('opacity',u>0&&u<1?(1-i*.065)*Math.min(1,u*10,(1-u)*18):0)});const g=F.arrival(elapsed-r.duration);r.target.style.setProperty('--sc-arrival',g*.95);r.path.style.strokeWidth=String(.7+.3*g)})},reset);
 });
})();
