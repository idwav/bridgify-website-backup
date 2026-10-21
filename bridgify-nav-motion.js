(()=>{
 const groups=[...document.querySelectorAll('.site-nav-group')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const running=new WeakMap();
 function setOpen(group,open){
  const menu=group.querySelector('.site-nav-menu'),previous=running.get(group);
  if(!menu)return;
  const from=previous?{opacity:getComputedStyle(menu).opacity,transform:getComputedStyle(menu).transform}:null;
  if(previous)previous.cancel();
  running.delete(group);
  if(reduced.matches){group.open=open;return}
  if(open){
   group.open=true;
   const animation=menu.animate([from||{opacity:0,transform:'translateY(-10px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
   running.set(group,animation);
   animation.onfinish=()=>running.delete(group);
  }else if(group.open){
   const animation=menu.animate([from||{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-6px) scale(.99)'}],{duration:170,easing:'cubic-bezier(.4,0,1,1)'});
   running.set(group,animation);
   animation.onfinish=()=>{group.open=false;running.delete(group)};
  }
 }
 groups.forEach(group=>{
  const summary=group.querySelector('summary');
  summary.addEventListener('click',event=>{
   event.preventDefault();
   const open=!group.open;
   groups.forEach(other=>{if(other!==group)setOpen(other,false)});
   setOpen(group,open);
  });
  group.addEventListener('keydown',event=>{if(event.key==='Escape'){setOpen(group,false);summary.focus()}});
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const active=groups.find(group=>group.open);groups.forEach(group=>setOpen(group,false));if(active)active.querySelector('summary').focus()}});
 document.addEventListener('click',event=>groups.forEach(group=>{if(!group.contains(event.target)||event.target.closest('a'))setOpen(group,false)}));
})();
