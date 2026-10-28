(()=>{
 const section=document.querySelector('#section-3');
 if(!section)return;
 const rows=[...section.querySelectorAll('.step')];
 const images=['assets/api-hotel.png','assets/api-card-florence.jpg','assets/api-card-alps.jpg'];
 const captions=['Before arrival','During the stay','Relevant suggestions'];
 const preview=document.createElement('div');preview.className='process-preview hotel-follow-preview';preview.setAttribute('aria-hidden','true');
 const img=document.createElement('img');img.alt='';const caption=document.createElement('span');preview.append(img,caption);section.append(preview);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const enabled=matchMedia('(hover:hover) and (pointer:fine)');
 let active=null,raf=0,x=0,y=0,tx=0,ty=0,lastPointer=null;
 const clamp=(v,min,max)=>Math.max(min,Math.min(Math.max(min,max),v));
 function paint(){preview.style.transform=`translate3d(${x}px,${y}px,0)`;}
 function draw(){raf=0;if(!active)return;x+=(tx-x)*.14;y+=(ty-y)*.14;if(Math.abs(tx-x)+Math.abs(ty-y)<.3){x=tx;y=ty;}else raf=requestAnimationFrame(draw);paint();}
 function position(e,initial=false){
  lastPointer={clientX:e.clientX,clientY:e.clientY};
  const r=section.getBoundingClientRect(),w=preview.offsetWidth,h=preview.offsetHeight;
  const px=e.clientX-r.left,py=e.clientY-r.top;
  // Follow both axes freely within the section; keep a small gap from the cursor.
  const preferredX=px+w+28<r.width?px+28:px-w-28;
  tx=clamp(preferredX,12,r.width-w-12);ty=clamp(py-h/2,12,r.height-h-12);
  if(initial||reduced.matches){x=tx;y=ty;paint();}
  else if(!raf)raf=requestAnimationFrame(draw);
 }
 function hide(){active=null;lastPointer=null;cancelAnimationFrame(raf);raf=0;preview.classList.remove('is-visible');}
 rows.forEach((row,i)=>{
  row.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||!enabled.matches)return;const initial=!active;active=row;img.src=images[i];caption.textContent=captions[i];position(e,initial);preview.classList.add('is-visible');});
  row.addEventListener('pointermove',e=>{if(active===row)position(e);});
  row.addEventListener('pointerleave',e=>{if(!rows.some(r=>r.contains(e.relatedTarget)))hide();});
 });
 section.addEventListener('pointerleave',hide);
 window.addEventListener('blur',hide);
 window.addEventListener('scroll',hide,{passive:true});
 window.addEventListener('resize',()=>{if(!enabled.matches)hide();else if(active&&lastPointer)position(lastPointer,true);});
})();
