(()=>{
 const section=document.querySelector('#section-3');
 if(!section)return;
 const rows=[...section.querySelectorAll('.step')];
 const images=["assets/api-card-florence.jpg", "assets/api-attraction.png", "assets/api-concert.png"];
 const captions=["Cardholders", "Wallet users", "Members"];
 const preview=document.createElement('div');preview.className='process-preview';preview.setAttribute('aria-hidden','true');
 const img=document.createElement('img');img.alt='';const caption=document.createElement('span');preview.append(img,caption);section.append(preview);
 let active=null,raf=0,x=0,y=0,tx=0,ty=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function draw(){x+=(tx-x)*.16;y+=(ty-y)*.16;preview.style.transform=`translate3d(${x}px,${y}px,0)`;if(active&&Math.abs(tx-x)+Math.abs(ty-y)>.2)raf=requestAnimationFrame(draw);else raf=0;}
 function position(e,row){const r=section.getBoundingClientRect(),b=row.getBoundingClientRect();const w=preview.offsetWidth,h=preview.offsetHeight;tx=Math.max(10,Math.min(r.width-w-10,e.clientX-r.left+25));const right= row.querySelector('p').getBoundingClientRect().left-r.left;tx=Math.min(Math.max(tx,right-w-65),right-w-24);ty=Math.max(0,Math.min(r.height-h,b.top-r.top+(b.height-h)/2+(e.clientY-b.top-b.height/2)*.16));if(reduced.matches){x=tx;y=ty;}if(!raf)raf=requestAnimationFrame(draw);}
 rows.forEach((row,i)=>{row.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||!matchMedia('(hover:hover) and (min-width:1000px)').matches)return;active=row;img.src=images[i];caption.textContent=captions[i];position(e,row);x=tx;y=ty;preview.classList.add('is-visible');});row.addEventListener('pointermove',e=>{if(active===row)position(e,row)});row.addEventListener('pointerleave',()=>{active=null;preview.classList.remove('is-visible')});});
 window.addEventListener('blur',()=>{active=null;preview.classList.remove('is-visible')});
})();
