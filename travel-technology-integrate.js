/* Travel tech · build vs connect. One value, o, drives the stage:
   0 = every supplier wired into your product on its own (grey, tangled, duplicated catalog),
   1 = every supplier wired into Bridgify, one integration into your product (coral, ordered, clean catalog). */
(()=>{
const root=document.querySelector('#section-2 .ti');if(!root)return;
const ns='http://www.w3.org/2000/svg',map=root.querySelector('.ti-map'),svg=root.querySelector('.ti-wires');
const srcs=[...root.querySelectorAll('.ti-src')],hub=root.querySelector('.ti-hub'),app=root.querySelector('.ti-app');
const pillDiy=root.querySelector('.ti-pill-diy'),pillOne=root.querySelector('.ti-pill-one');
const opts=[...root.querySelectorAll('.ti-opt')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ease=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const mix=(a,b,t)=>a+(b-a)*t;
const GREY=[140,129,120],CORAL=[244,102,73];
const col=t=>`rgb(${GREY.map((g,i)=>Math.round(mix(g,CORAL[i],t))).join(',')})`;

// Raw state: each source is nudged and tilted, and lands on its own port in a shuffled order (the tangle).
const N=srcs.length,perm=[7,2,10,0,5,11,3,8,1,9,4,6];
const jit=srcs.map((el,i)=>{const s=Math.sin(i*12.9898)*43758.5453,f=s-Math.floor(s);return{x:(f-.5)*22,y:(Math.cos(i*3.1)*.5)*8,r:(f-.5)*7}});
srcs.forEach((el,i)=>{el.style.setProperty('--x',jit[i].x);el.style.setProperty('--y',jit[i].y);el.style.setProperty('--r',jit[i].r);el.style.transitionDelay=`${i*45}ms`});

const make=(tag,attrs,parent=svg)=>{const el=document.createElementNS(ns,tag);for(const k in attrs)el.setAttribute(k,attrs[k]);parent.append(el);return el};
const gWires=make('g',{}),gMain=make('g',{}),gNodes=make('g',{}),gDots=make('g',{});
const wires=srcs.map(()=>make('path',{'stroke-linecap':'round'},gWires));
const main=make('path',{'stroke-linecap':'round',stroke:'#f46649','stroke-width':2.2},gMain);
const nodeA=srcs.map(()=>make('circle',{r:2.3},gNodes)),nodeB=srcs.map(()=>make('circle',{r:2.3},gNodes));
const mainNodes=[0,1].map(()=>make('circle',{r:2.6,fill:'#fff8f1',stroke:'#f46649','stroke-width':1.2},gNodes));
const dots=srcs.map(()=>make('circle',{class:'dot',r:2.4,opacity:0},gDots));
const mainDots=[0,1,2].map(()=>make('circle',{class:'dot',r:2.6,opacity:0},gDots));

let geo=null;
function measure(){
  const m=map.getBoundingClientRect(),rel=el=>{const r=el.getBoundingClientRect();return{l:r.left-m.left,t:r.top-m.top,r:r.right-m.left,b:r.bottom-m.top,w:r.width,h:r.height}};
  const vertical=getComputedStyle(map).getPropertyValue('--ti-vertical').trim()==='1';
  // Untransformed source boxes: read with the scatter removed.
  root.style.setProperty('--o',1);
  const s=srcs.map(rel),h=rel(hub),a=rel(app);
  svg.setAttribute('viewBox',`0 0 ${m.width} ${m.height}`);
  geo={vertical,s,h,a,w:m.width,ht:m.height};
}
function bez(x1,y1,x2,y2,vertical,bend=0){
  if(vertical){const my=(y1+y2)/2;return[x1,y1,x1+bend,my,x2-bend,my,x2,y2]}
  const mx=(x1+x2)/2;return[x1,y1,mx,y1+bend,mx,y2-bend,x2,y2];
}
const D=p=>`M${p[0]} ${p[1]}C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`;
const lerpP=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));

let o=0,draw=0,broken=-1,breakN=0;
function render(time=0){
  if(!geo)return;const{vertical,s,h,a}=geo,O=smooth(o);
  root.style.setProperty('--o',O.toFixed(3));
  const ports=s.length;
  s.forEach((b,i)=>{
    const j=jit[i],sx=vertical?b.l+b.w/2+j.x*(1-O):b.r+j.x*(1-O),sy=vertical?b.b+j.y*(1-O):b.t+b.h/2+j.y*(1-O);
    const k=perm[i];
    // Raw end: its own port on your product. Ordered end: Bridgify's input edge.
    const ax=vertical?a.l+a.w*(.14+.72*k/(ports-1)):a.l,ay=vertical?a.t:a.t+a.h*(.16+.68*k/(ports-1));
    const hx=vertical?h.l+h.w/2+(i-(ports-1)/2)*2.2:h.l,hy=vertical?h.t:h.t+h.h/2+(i-(ports-1)/2)*1.6;
    const pa=bez(sx,sy,ax,ay,vertical,(k-i)*(vertical?3:4)),pb=bez(sx,sy,hx,hy,vertical,0);
    const p=lerpP(pa,pb,O),d=D(p),w=wires[i];
    w.setAttribute('d',d);
    const len=w.getTotalLength(),reveal=smooth((draw-i*.04)/.6);
    const isBroken=i===broken&&O<.5;
    w.setAttribute('stroke',isBroken?'#f46649':col(O));
    w.setAttribute('stroke-width',(1.15+O*.55).toFixed(2));
    w.setAttribute('opacity',isBroken?.95:(.62+O*.38).toFixed(2));
    w.setAttribute('stroke-dasharray',isBroken?'3 5':`${len} ${len}`);
    w.setAttribute('stroke-dashoffset',isBroken?0:len*(1-reveal));
    const on=reveal>.98?1:0;
    [[nodeA[i],p[0],p[1]],[nodeB[i],p[6],p[7]]].forEach(([c,x,y])=>{c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('opacity',on);c.setAttribute('fill',O>.5?'#fff8f1':'#d7c9bd');c.setAttribute('stroke',O>.5?'#f46649':'#8c8178');c.setAttribute('stroke-width',1.1)});
  });
  // One integration: Bridgify to your product.
  const mx1=vertical?h.l+h.w/2:h.r,my1=vertical?h.b:h.t+h.h/2,mx2=vertical?a.l+a.w/2:a.l,my2=vertical?a.t:a.t+a.h/2;
  main.setAttribute('d',D(bez(mx1,my1,mx2,my2,vertical)));
  const ml=main.getTotalLength(),mr=clamp(O*2.2-1.2);
  main.setAttribute('stroke-dasharray',`${ml} ${ml}`);main.setAttribute('stroke-dashoffset',ml*(1-mr));
  main.style.filter=`drop-shadow(0 0 ${4*mr}px #f46649b3)`;
  mainNodes.forEach((c,i)=>{c.setAttribute('cx',i?mx2:mx1);c.setAttribute('cy',i?my2:my1);c.setAttribute('opacity',mr>.98?1:0)});
  // Labels on the wires.
  if(vertical){place(pillDiy,a.l+a.w/2,a.t-26);place(pillOne,(mx1+mx2)/2,(my1+my2)/2)}
  else{place(pillDiy,a.l-62,a.t+a.h*.08-14);place(pillOne,(mx1+mx2)/2,(my1+my2)/2)}
  // Data flowing once ordered.
  const flowing=O>.98&&!reduced.matches;
  dots.forEach((dot,i)=>{
    if(!flowing){dot.setAttribute('opacity',0);return}
    const u=((time/2600)+i*.083)%1,q=smooth(clamp(u*1.15)),w=wires[i],pt=w.getPointAtLength(w.getTotalLength()*q);
    dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('opacity',u<.87?Math.min(1,u*10,(.87-u)*12):0);
  });
  mainDots.forEach((dot,i)=>{
    if(!flowing||mr<1){dot.setAttribute('opacity',0);return}
    const u=((time/1500)+i/3)%1,pt=main.getPointAtLength(ml*smooth(u));
    dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('opacity',Math.min(1,u*8,(1-u)*8));
  });
}
function place(el,x,y){el.style.left=x+'px';el.style.top=y+'px'}

// ---- State and timeline ----
let target=0,from=0,tStart=0,DUR=1300,started=false,touched=false,visible=false,clock=0,last=0,frame=0,holdFrom=0,lastBreak=0;
const HOLD=[1500,4600];// raw state is held long enough to read, then resolves once by itself
function setTarget(t,now){from=o;target=t;tStart=now;opts.forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.to==='bridgify')===!!t)))}
function tick(now){
  frame=0;if(!visible||document.hidden){last=0;return}
  if(last)clock+=Math.min(now-last,60);last=now;
  if(!started){started=true;clock=0;root.classList.add('is-in')}
  draw=clamp(clock/1400);
  if(!touched&&target===0){
    const hp=clamp((clock-HOLD[0])/(HOLD[1]-HOLD[0]));
    root.classList.toggle('is-holding',clock>HOLD[0]);root.style.setProperty('--hold',hp.toFixed(3));
    if(hp>=1){root.classList.remove('is-holding');setTarget(1,clock)}
  }
  if(o!==target){const k=ease((clock-tStart)/DUR);o=mix(from,target,k);if(k>=1)o=target}
  // While raw: a connection keeps needing work.
  if(target===0&&o===0&&clock-lastBreak>1700&&draw>=1){broken=(breakN++*5+4)%N;lastBreak=clock}
  if(clock-lastBreak>900)broken=-1;
  render(clock);
  frame=requestAnimationFrame(tick);
}
function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(reduced.matches){staticRender();return}if(visible&&!document.hidden)frame=requestAnimationFrame(tick)}
function staticRender(){root.classList.add('is-in');draw=1;if(!touched)setTarget(1,0);o=target;broken=-1;render(0)}
opts.forEach(b=>b.addEventListener('click',()=>{
  touched=true;root.classList.remove('is-holding');
  const t=b.dataset.to==='bridgify'?1:0;
  if(reduced.matches){setTarget(t,0);o=t;render(0);return}
  if(!started){started=true;root.classList.add('is-in');draw=1}
  setTarget(t,clock);if(!frame)resume();
}));
new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume()},{threshold:.35}).observe(root);
document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
const relayout=()=>{measure();render(clock)};
new ResizeObserver(relayout).observe(map);document.fonts?.ready.then(relayout);
measure();render(0);
})();
