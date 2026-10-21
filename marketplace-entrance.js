(()=>{
 const section=document.querySelector('#section-1');if(!section||!Element.prototype.animate)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let played=false,animations=[];
 const sequence=[
  ['.block-copy .eyebrow',0,550,10],
  ['.block-copy h1',100,900,22],
  ['.block-copy .lead',240,800,16],
  ['.block-copy .actions .btn:nth-child(1)',380,700,12],
  ['.block-copy .actions .btn:nth-child(2)',450,700,12],
  ['.market-window',170,1050,26],
  ['.market-chrome',400,650,6],
  ['.market-nav',480,650,8],
  ['.market-main-photo',460,950,0],
  ['.market-cover h2',610,800,13],
  ['.market-search',730,750,12],
  ['.market-featured-head',820,650,8],
  ['.market-cards article:nth-child(1)',900,750,14],
  ['.market-cards article:nth-child(2)',990,750,14],
  ['.market-cards article:nth-child(3)',1080,750,14],
  ['.brand-settings',180,650,12],
  ['.market-light',1100,650,0]
 ];
 function enter(){if(played)return;played=true;if(reduced.matches)return;
  for(const[selector,delay,duration,distance]of sequence){const el=section.querySelector(selector);if(!el)continue;const a=el.animate([{opacity:0,translate:`0 ${distance}px`},{opacity:1,translate:'0 0'}],{delay,duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});animations.push(a);a.onfinish=()=>a.cancel()}
 }
 const observer=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){enter();observer.disconnect()}},{threshold:.1});
 // Wait for type metrics before the entrance, with a bounded fallback.
 Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,500))]).then(()=>observer.observe(section));
 reduced.addEventListener('change',()=>{if(reduced.matches){animations.forEach(a=>a.cancel());animations=[]}});
})();
