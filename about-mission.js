(()=>{const board=document.querySelector('.ms-board');if(!board)return;const svg=board.querySelector('.ms-wires');const point=(el,side)=>{const r=el.getBoundingClientRect(),b=board.getBoundingClientRect();return{x:(r[side]-b.left),y:(r.top+r.height/2-b.top)}};const curve=(a,b)=>`M${a.x} ${a.y} C${(a.x+b.x)/2} ${a.y} ${(a.x+b.x)/2} ${b.y} ${b.x} ${b.y}`;function update(){const bounds=board.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);const catalog=board.querySelector('.ms-catalog'),ai=board.querySelector('.ms-ai'),result=board.querySelector('.ms-experience'),context=board.querySelector('.ms-context');board.querySelectorAll('.ms-source').forEach((el,i)=>svg.querySelector(`#ms-path-${i}`).setAttribute('d',curve(point(el,'right'),point(catalog,'left'))));svg.querySelector('#ms-path-3').setAttribute('d',curve(point(catalog,'right'),point(ai,'left')));const r=context.getBoundingClientRect(),a=ai.getBoundingClientRect(),b=board.getBoundingClientRect();svg.querySelector('#ms-path-4').setAttribute('d',`M${(r.left+r.width*.2-b.left)} ${(r.bottom-b.top)} Q${(a.left-b.left)} ${(r.bottom+30-b.top)} ${(a.left+a.width/2-b.left)} ${(a.top-b.top)}`);svg.querySelector('#ms-path-5').setAttribute('d',curve(point(ai,'right'),point(result,'left')))}
const ns='http://www.w3.org/2000/svg',group=svg.querySelector('.ms-dots');
group.replaceChildren();
const contacts=document.createElementNS(ns,'svg');contacts.classList.add('ms-contacts');contacts.setAttribute('aria-hidden','true');board.append(contacts);

const paths=Array.from({length:6},(_,i)=>svg.querySelector('#ms-path-'+i));
const dots=Array.from({length:9},(_,i)=>{const c=document.createElementNS(ns,'circle');c.setAttribute('r',2.8-i*.13);c.setAttribute('opacity','0');group.append(c);return c});
const sourceDots=[dots,...Array.from({length:2},()=>dots.map(d=>{const c=d.cloneNode();group.append(c);return c}))];
const contextDot=document.createElementNS(ns,'circle');contextDot.setAttribute('r','2.8');group.append(contextDot);
const catalog=board.querySelector('.ms-catalog'),ai=board.querySelector('.ms-ai'),result=board.querySelector('.ms-experience');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
let lengths=[],frame=0,elapsed=0,last=0,visible=false;
const motion=matchMedia('(prefers-reduced-motion: reduce)'),narrow=matchMedia('(max-width:800px)');
function layout(){update();lengths=paths.map(p=>p.getTotalLength());contacts.setAttribute('viewBox',svg.getAttribute('viewBox'));contacts.replaceChildren();const seen=new Set();paths.forEach((p,i)=>[0,lengths[i]].forEach(distance=>{const point=p.getPointAtLength(distance),key=Math.round(point.x)+','+Math.round(point.y);if(seen.has(key))return;seen.add(key);const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);dot.setAttribute('r','3.5');contacts.append(dot)}))}
function position(dot,route,t,alpha){const p=paths[route].getPointAtLength(lengths[route]*clamp(t));dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('opacity',alpha)}
function reset(){[...sourceDots.flat(),contextDot].forEach(d=>d.setAttribute('opacity','0'));[catalog,ai,result].forEach(el=>{el.style.borderColor='#f46649';el.style.removeProperty('filter');el.style.setProperty('--flow-arrival','0')})}
function pulse(el,amount){BridgifyFlow.glow(el,amount);el.style.borderColor='#f46649'}
function tick(now){frame=0;if(!visible||document.hidden||motion.matches||narrow.matches){last=0;return}if(last)elapsed+=Math.min(now-last,60);last=now;
const t=elapsed%5300;reset();
dots.forEach((dot,i)=>{const local=t-i*90,alpha=1-i*.065;
if(local>=0&&local<1600){const u=local/1600;sourceDots.forEach((row,route)=>position(row[i],route,smooth(u),Math.min(1,u*10)*alpha))}
else if(local>=1800&&local<2350){const u=(local-1800)/550;position(dot,3,smooth(u),alpha*Math.min(1,u*10))}
else if(local>=2650&&local<3550){const u=(local-2650)/900;position(dot,5,u,alpha*Math.min(1,(1-u)*12))}
});
if(t>=1700&&t<2350){const u=(t-1700)/650;position(contextDot,4,smooth(u),Math.min(1,u*10,(1-u)*12))}
pulse(catalog,BridgifyFlow.arrival(t-1600));
pulse(ai,BridgifyFlow.arrival(t-2350));
pulse(result,Math.sin(Math.PI*clamp((t-3550)/850)));
frame=requestAnimationFrame(tick)}
function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!document.hidden&&!motion.matches&&!narrow.matches)frame=requestAnimationFrame(tick);else reset()}
new ResizeObserver(layout).observe(board);document.fonts.ready.then(layout);
new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume()},{threshold:.1}).observe(board);
document.addEventListener('visibilitychange',resume);motion.addEventListener('change',resume);narrow.addEventListener('change',resume);
})();
