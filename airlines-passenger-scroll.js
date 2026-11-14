(() => {
 const section=document.querySelector('.jp-scroll');if(!section)return;
 const tabs=[...section.querySelectorAll('[data-touchpoint]')].filter(e=>e.tagName==='BUTTON');
 const panels=[...section.querySelectorAll('[data-phone-panel]')];
 const compact=matchMedia('(max-width:900px), (max-height:740px), (prefers-reduced-motion:reduce)');
 let active=-1,frame=0;
 function select(i){if(i===active)return;active=i;tabs.forEach((tab,j)=>{tab.setAttribute('aria-selected',String(j===i));tab.tabIndex=j===i?0:-1});panels.forEach((p,j)=>{p.getAnimations().forEach(a=>a.cancel());p.hidden=j!==i;p.inert=j!==i;p.setAttribute('aria-hidden',String(j!==i));if(j===i&&!matchMedia('(prefers-reduced-motion:reduce)').matches)p.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'})});section.querySelector('.al-phone').dataset.touchpoint=tabs[i].dataset.touchpoint}
 function update(){frame=0;if(compact.matches)return;let distance=section.offsetHeight-innerHeight;let progress=Math.max(0,Math.min(.999,(24-section.getBoundingClientRect().top)/Math.max(1,distance)));select(Math.floor(progress*tabs.length))}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',e=>{e.stopImmediatePropagation();select(i);if(!compact.matches)window.scrollTo({top:scrollY+section.getBoundingClientRect().top-24+(section.offsetHeight-innerHeight)*(i+.5)/tabs.length,behavior:'instant'})},true);tab.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:tabs.length-1))%tabs.length;tabs[n].click();tabs[n].focus()},true)});
 select(0);addEventListener('scroll',update,{passive:true});addEventListener('resize',update);compact.addEventListener('change',update);
})();
