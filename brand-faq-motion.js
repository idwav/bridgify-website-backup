/* Shared FAQ disclosure: animate real height, preserve native keyboard semantics. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('#faq details,.copy-faq details,.al-faq details').forEach(el=>{
  const summary=el.querySelector('summary');if(!summary)return;
  let animation=null,fade=[],wanted=el.open;
  function clear(){animation?.cancel();animation=null;fade.forEach(a=>a.cancel());fade=[];el.style.removeProperty('height');el.style.removeProperty('overflow')}
  summary.addEventListener('click',event=>{
   event.preventDefault();wanted=!wanted;
   const start=el.getBoundingClientRect().height;clear();
   if(reduced.matches){el.open=wanted;return}
   el.open=false;const closed=el.getBoundingClientRect().height;
   el.open=true;const expanded=el.getBoundingClientRect().height;
   el.style.height=start+'px';el.style.overflow='hidden';
   animation=el.animate([{height:start+'px'},{height:(wanted?expanded:closed)+'px'}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
   fade=[...el.children].filter(e=>e!==summary).map(e=>e.animate([{opacity:wanted?0:1},{opacity:wanted?1:0}],{duration:wanted?320:180,easing:'ease-out',fill:'forwards'}));
   animation.onfinish=()=>{el.open=wanted;clear()};
  });
  reduced.addEventListener('change',()=>{el.open=wanted;clear()});
  window.addEventListener('resize',()=>{if(animation){el.open=wanted;clear()}});
 });
})();
