
(()=>{
const ns='http://www.w3.org/2000/svg',F=BridgifyFlow;
const shapes={layers:'M3 8 12 3l9 5-9 5ZM3 12l9 5 9-5M3 16l9 5 9-5',code:'m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18',shop:'M3 10v11h18V10M2 10l2-7h16l2 7M2 10q3 4 5 0 3 4 5 0 3 4 5 0 3 4 5 0M9 21v-7h6v7',spark:'M12 2q1 9 10 10-9 1-10 10-1-9-10-10 9-1 10-10Z',card:'M3 5h18v14H3ZM3 10h18M6 15h4',case:'M3 7h18v14H3ZM8 7V3h8v4',plane:'m3 10 7 2 7-9 3 1-4 9 5 3-1 2-7-1-4 5-2-1 2-6-6-3Z',bed:'M3 4v17m18-10v10M3 17h18M3 8h6v6H3m6-4h12v7',cart:'M2 3h3l3 13h12l2-9H6M9 21h1m8 0h1',user:'M8 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M3 22v-3a9 9 0 0 1 18 0v3'};
Object.assign(shapes,{search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',chevron:'m5 9 7 7 7-7',museum:'M3 9 12 3l9 6ZM3 21h18M5 18V11m5 7V11m4 7V11m5 7V11',heart:'M12 21 3 12C-2 5 7 0 12 7c5-7 14-2 9 5Z',pin:'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13ZM9 9a3 3 0 1 0 6 0 3 3 0 1 0-6 0',check:'m5 12 4 4L19 6'});
const lightPoint={search:[10,3],chevron:[5,9],museum:[12,3],heart:[12,21],pin:[12,22],check:[19,6],layers:[3,8],code:[8,6],shop:[4,3],spark:[12,2],card:[3,5],case:[8,7],plane:[17,3],bed:[3,8],cart:[5,3],user:[12,3]};
function icon(k){const [x,y]=lightPoint[k];return '<svg class="insight-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+shapes[k]+'"/><circle class="icon-light" cx="'+x+'" cy="'+y+'" r="1.2"/></svg>'}
document.querySelectorAll('.lt-topic-grid a>span').forEach((e,i)=>e.innerHTML=icon(['layers','code','shop','spark','card','case','plane','bed'][i]));
document.querySelectorAll('.lt-card h3>span').forEach((e,i)=>e.innerHTML=icon(['code','shop','spark'][i]));
document.querySelector('.ld-engine>b').innerHTML=icon('spark');document.querySelector('.ld-search').innerHTML=icon('search')+'<span></span>'+icon('chevron')+'<b>'+icon('cart')+'</b>';
const context=document.querySelector('.ld-context strong');context.innerHTML=icon('user')+' Paris · Art & culture';
document.querySelectorAll('.er-number').forEach(e=>{e.textContent=e.textContent.replace(/^\d+\s*\/\s*/,'');e.classList.add('brand-section-label')});
function circle(svg,r){const c=document.createElementNS(ns,'circle');c.setAttribute('r',r);c.setAttribute('fill','#fff8f1');c.setAttribute('stroke','#f46649');c.setAttribute('stroke-width','.7');svg.append(c);return c}
function animate(root,svg,paths,target,start=0){svg.querySelectorAll('.brand-wire-contacts').forEach(e=>e.remove());const seen=new Set();paths.forEach(p=>[0,p.getTotalLength()].forEach(d=>{const q=p.getPointAtLength(d),key=q.x+','+q.y;if(seen.has(key))return;seen.add(key);const c=circle(svg,2.6);c.setAttribute('cx',q.x);c.setAttribute('cy',q.y)}));const trains=paths.map(p=>({p,n:p.getTotalLength(),dots:Array.from({length:9},(_,i)=>circle(svg,F.radius(i)))}));
const glow=g=>{if(!target)return;F.glow(target,g<.001?0:g);if(target instanceof SVGElement)target.style.stroke='#f46649';else target.style.borderColor='#f46649'};
const reset=()=>{trains.forEach(t=>t.dots.forEach(d=>d.style.opacity=0));glow(0)};
F.run(root,elapsed=>{const t=elapsed%F.cycle-start;trains.forEach(a=>a.dots.forEach((d,i)=>{const u=(t-i*F.delay)/1600;if(u<0||u>1){d.style.opacity=0;return}const q=a.p.getPointAtLength(a.n*F.smooth(u));d.setAttribute('cx',q.x);d.setAttribute('cy',q.y);d.style.opacity=Math.min(1,u*10,(1-u)*18)*(1-i*.065)}));glow(F.arrival(t-1600))},reset)}
const api=document.querySelector('.ld-api'),svg=api.querySelector('svg'),route=svg.querySelector('.lt-route');
const defs=document.createElementNS(ns,'defs');defs.innerHTML='<linearGradient id="insights-node-glass" x2="1" y2="1"><stop stop-color="#684235"/><stop offset=".45" stop-color="#30201e"/><stop offset="1" stop-color="#432820"/></linearGradient>';svg.prepend(defs);
[[30,28],[42,82],[30,145],[174,76]].forEach(([x,y])=>{const c=circle(svg,1.6);c.classList.add('icon-light');c.setAttribute('cx',x);c.setAttribute('cy',y)});
const codeLines=svg.querySelector('.api-code-lines');if(codeLines){const accents=document.createElementNS(ns,'path');accents.setAttribute('d','M277 88h8M283 99h10M310 110h8M296 121h8');codeLines.append(accents)}
const paths=route.getAttribute('d').match(/M[^M]+/g).map(d=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke','#f46649');svg.append(p);return p});route.remove();animate(api,svg,paths.slice(0,3),svg.querySelector('rect[x="139"]'));animate(api,svg,paths.slice(3),svg.querySelector('rect[x="265"]'),1800);
document.querySelectorAll('.ld-wire').forEach((wire,i)=>{const s=document.createElementNS(ns,'svg');s.classList.add('insight-flow');s.setAttribute('viewBox','0 0 30 14');s.setAttribute('preserveAspectRatio','none');const p=document.createElementNS(ns,'path');p.setAttribute('d','M0 7H30');p.setAttribute('stroke','#f46649');s.append(p);wire.append(s);animate(wire.closest('.ld-ai'),s,[p],wire.nextElementSibling,i*1800)});

document.querySelectorAll('.ld-context>span').forEach((e,i)=>e.insertAdjacentHTML('afterbegin',icon(['museum','heart','layers'][i])));
document.querySelectorAll('.ld-result small').forEach((e,i)=>e.insertAdjacentHTML('afterbegin',icon(['case','museum','pin'][i])));
document.querySelectorAll('.ld-context>span b').forEach(e=>e.innerHTML=icon('check'));
document.querySelectorAll('.ih-topic>svg').forEach(s=>{const p=s.querySelector('path');if(p){const q=p.getPointAtLength(0),c=circle(s,2);c.classList.add('icon-light');c.setAttribute('cx',q.x);c.setAttribute('cy',q.y)}});
const topics=[...document.querySelectorAll('.ih-topic')];F.run(document.querySelector('.ih-topics'),t=>{topics.forEach((e,i)=>e.classList.toggle('is-current',Math.floor(t/1800)%3===i))},()=>topics.forEach(e=>e.classList.remove('is-current')));
})();
