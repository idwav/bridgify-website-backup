(()=>{
const root=document.querySelector('.market-rows');if(!root)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
const locales=[['France · Français','Paris','Français','DÉCOUVRIR','Des expériences à partager.','assets/paris-romantic-experience.png'],['Italia · Italiano','Roma','Italiano','ESPLORA','Esperienze da condividere.','assets/api-card-colosseum.jpg'],['Ελλάδα · Ελληνικά','Σαντορίνη','Ελληνικά','ΑΝΑΚΑΛΥΨΤΕ','Εμπειρίες για να μοιραστείτε.','assets/hero-santorini.jpg']];
const amounts=['$100.00','€90.00','£80.00'];
function reveal(el){el.classList.remove('mr-changing');void el.offsetWidth;el.classList.add('mr-changing')}
function update(row,i){const kind=row.dataset.demo;row.dataset.index=i;row.querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
if(kind==='brand'){row.querySelector('.mr-frame').style.setProperty('--brand',['#f46649','#65b6a6','#b193d8'][i]);}
if(kind==='locale'){const v=locales[i];['market','place','language','place-label','place-copy'].forEach((key,n)=>row.querySelector(`[data-${key}]`).textContent=v[n]);const img=row.querySelector('[data-place-image]');img.src=v[5];img.alt=v[1];reveal(row.querySelector('.mr-destination'));}
if(kind==='currency'){row.querySelectorAll('[data-amount]').forEach(el=>{el.textContent=amounts[i];reveal(el)});}
}
const rows=[...root.querySelectorAll('.mr-row')];rows.forEach(row=>{update(row,0);row.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>{update(row,i);row.dataset.last=Date.now()}));});
const visible=new Set();const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target)}),{threshold:.25});rows.forEach(r=>observer.observe(r));
setInterval(()=>{if(paused||document.hidden)return;rows.forEach(row=>{if(visible.has(row)&&Date.now()-Number(row.dataset.last||0)>5500){update(row,(Number(row.dataset.index)+1)%3);row.dataset.last=Date.now()}})},1000);
const button=root.querySelector('.mr-pause');function label(){button.textContent=paused?'Play animation ▷':'Pause animation Ⅱ';button.setAttribute('aria-pressed',String(paused))}button.addEventListener('click',()=>{paused=!paused;label()});reduced.addEventListener('change',e=>{paused=e.matches;label()});label();
})();
