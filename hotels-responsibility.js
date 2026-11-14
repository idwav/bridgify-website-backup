(()=>{
 const root=document.querySelector('.hotel-responsibility');if(!root)return;
 const dialog=root.querySelector('dialog');
 root.querySelector('[data-hr-preview]').addEventListener('click',()=>dialog.showModal());
 dialog.querySelector('.hm-close').addEventListener('click',()=>dialog.close());
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),rows=[...root.querySelectorAll('.hr-managed li')],card=root.querySelector('.hr-experience');
 let visible=false,timer=null,index=0,entered=false,animations=[];
 function stop(){clearInterval(timer);timer=null;rows.forEach(r=>r.classList.remove('is-current'));card.classList.remove('is-arriving')}
 function tick(){rows.forEach((r,i)=>r.classList.toggle('is-current',i===index));card.classList.toggle('is-arriving',index===2);index=(index+1)%3}
 function update(){stop();if(!visible||document.hidden||reduce.matches)return;if(!entered){entered=true;const elements=[root.querySelector('.hr-heading'),root.querySelector('.hr-managed'),root.querySelector('.hr-brand'),root.querySelector('.hr-footer')];animations=elements.map((el,i)=>el.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:i*110,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}))}tick();timer=setInterval(tick,2200)}
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()},{threshold:.25}).observe(root);
 window.addEventListener('scroll',()=>{const r=root.getBoundingClientRect(),next=r.top<innerHeight*.75&&r.bottom>innerHeight*.25;if(next!==visible){visible=next;update()}},{passive:true});
 document.addEventListener('visibilitychange',update);reduce.addEventListener('change',()=>{animations.forEach(a=>a.cancel());update()});
})();
