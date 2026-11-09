(()=>{
const s=document.querySelector('.origin-section');if(!s)return;
const F=BridgifyFlow,track=s.querySelector('.origin-track'),items=[...s.querySelectorAll('.origin-timeline li')],fill=track.firstElementChild;
const dots=Array.from({length:9},(_,i)=>{const d=document.createElement('b');d.className='origin-traveler';const size=F.radius(i)*2;d.style.width=size+'px';d.style.height=size+'px';d.style.opacity='0';track.append(d);return d});
let stops=[0,.36,.73];
function layout(){const r=track.getBoundingClientRect();if(!r.width)return;stops=items.map(li=>{const h=li.querySelector('h4').getBoundingClientRect();li.querySelector('i').style.setProperty('--node-left',`${h.left-li.getBoundingClientRect().left}px`);return F.clamp((h.left-r.left)/r.width)})}
function progress(t){if(t<0)return 0;if(t<850)return stops[0];if(t<2450)return stops[0]+(stops[1]-stops[0])*F.smooth((t-850)/1600);if(t<3300)return stops[1];if(t<4900)return stops[1]+(stops[2]-stops[1])*F.smooth((t-3300)/1600);if(t<5750)return stops[2];return stops[2]+(1-stops[2])*F.smooth((t-5750)/900)}
function finish(){fill.style.transform='scaleX(1)';dots.forEach(d=>d.style.opacity='0');items.forEach(li=>{li.classList.add('is-reached');F.glow(li.querySelector('i'),0);F.glow(li.querySelector('h4'),0)})}
F.run(s,t=>{s.classList.add('is-visible');if(t>7400){finish();return}fill.style.transform=`scaleX(${progress(t)})`;dots.forEach((d,i)=>{const local=t-i*F.delay;d.style.left=progress(local)*100+'%';d.style.opacity=local>=0&&local<6650?String((1-i*.065)*Math.min(1,local/160,(6650-local)/100)):0});items.forEach((li,i)=>{const start=[0,2450,4900][i],g=F.arrival(t-start);li.classList.toggle('is-reached',t>=start);F.glow(li.querySelector('i'),g);F.glow(li.querySelector('h4'),g)})},finish);
new ResizeObserver(layout).observe(s);document.fonts.ready.then(layout);
})();
