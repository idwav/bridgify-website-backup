(()=>{
const root=document.querySelector('#hbx .hbx-object'),svg=root?.querySelector('svg');if(!svg)return;
svg.querySelectorAll('g[stroke-width="2.3"]').forEach(g=>g.setAttribute('stroke-width','1.2'));svg.querySelectorAll('g[filter="url(#hbx-wire-glow)"]').forEach(g=>{g.setAttribute('stroke-width','3');g.setAttribute('opacity','.25')});
const F=BridgifyFlow,ns='http://www.w3.org/2000/svg';
svg.querySelectorAll('.hbx-moving-light').forEach(el=>el.remove());
const paths=['top','mid','bottom'].map(n=>svg.querySelector('#hbx-route-'+n)),lengths=paths.map(p=>{p.setAttribute('d',p.getAttribute('d').replace('M485','M497').replace('H752','H740'));return p.getTotalLength()});
const target=svg.querySelector('#hbx-brand-frame'),source=svg.querySelector('#hbx-group-frame'),halo=svg.querySelector('rect[filter="url(#hbx-soft)"]');
// Clip moving particles to the open connector space: they enter the frame, not its face.
const clip=document.createElementNS(ns,'clipPath');clip.id='hbx-flow-clip';const rect=document.createElementNS(ns,'rect');rect.setAttribute('x','497');rect.setAttribute('y','140');rect.setAttribute('width','243');rect.setAttribute('height','135');clip.append(rect);svg.querySelector('defs').append(clip);
const stream=document.createElementNS(ns,'g');stream.setAttribute('clip-path','url(#hbx-flow-clip)');svg.append(stream);
const dots=paths.map(()=>Array.from({length:9},(_,i)=>{const d=document.createElementNS(ns,'circle');d.setAttribute('r',F.radius(i));d.setAttribute('fill','#fff8f1');d.setAttribute('stroke','#f46649');d.setAttribute('stroke-width','.7');d.setAttribute('opacity','0');stream.append(d);return d}));
// Fixed contact points remain attached to the exact borders.
[[497,157],[497,207],[497,257],[740,207]].forEach(([x,y])=>{const c=document.createElementNS(ns,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','3.5');c.setAttribute('fill','#eee9de');c.setAttribute('stroke','#f46649');c.setAttribute('stroke-width','1.2');svg.append(c)});
function frameGlow(el,amount){F.glow(el,amount<.001?0:amount);el.style.stroke='#f46649'}
function reset(){dots.flat().forEach(d=>d.setAttribute('opacity','0'));frameGlow(target,0);frameGlow(source,0);halo?.setAttribute('opacity','0')}
F.run(root,elapsed=>{const t=elapsed%F.cycle;reset();dots.forEach((row,route)=>row.forEach((d,i)=>{const local=t-i*F.delay;if(local<0||local>1600)return;const u=local/1600,p=paths[route].getPointAtLength(lengths[route]*F.smooth(u));d.setAttribute('cx',p.x);d.setAttribute('cy',p.y);d.setAttribute('opacity',Math.min(1,u*10)*(1-i*.065))}));const g=F.arrival(t-1600);frameGlow(target,g);frameGlow(source,F.arrival(t));},reset);
})();
