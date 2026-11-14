/* Shared editorial controls, frame color and connector contacts. V2 only. */
(()=>{
const ns='http://www.w3.org/2000/svg';
function apply(){
 document.querySelectorAll('[class],.ih-topic>span').forEach(el=>{
  if(el instanceof SVGElement)return;
  const tokens=[...el.classList],text=el.textContent.trim();
  if((el.matches('.ih-topic>span')||tokens.some(t=>/^(?:.*-)?(?:eyebrow|kicker)$/.test(t)||['section-label','mission-label','cx-label'].includes(t)))&&!el.closest('nav,footer')&&text.length<120){
   const clean=text.replace(/^[●•]\s*/,'').replace(/^\d{1,2}\s*[—–\-/]\s*/,'').replace(/\s*[/—–]\s*\d{1,2}\s*$/,'').replace(/\s*\/\s*$/,'').replace(/\s*\/\s*/g,' · ').trim();
   if(el.textContent!==clean)el.textContent=clean;
   el.classList.add('brand-section-label');
   let parent=el.parentElement;while(parent){const rgb=getComputedStyle(parent).backgroundColor.match(/[\d.]+/g);if(rgb&&(rgb.length<4||+rgb[3]>.8)){el.classList.toggle('brand-label-light',+rgb[0]>180&&+rgb[1]>160);break}parent=parent.parentElement}
  }
 });
 document.querySelectorAll('body *:not(svg):not(svg *)').forEach(el=>{
  const c=getComputedStyle(el);
  if(['Top','Right','Bottom','Left'].every(s=>parseFloat(c['border'+s+'Width'])>0&&c['border'+s+'Style']!=='none')&&el.getBoundingClientRect().width>28)el.classList.add('brand-coral-frame');
 });
 document.querySelectorAll('a[href],button').forEach(el=>{
  if(el.closest('.site-nav-menu,svg')||el.matches('.logo,[aria-label*="home"]'))return;
  const c=getComputedStyle(el),t=el.textContent.trim();
  const isControl=(el.tagName==='BUTTON'&&parseFloat(c.paddingTop)>6&&!el.matches('[aria-expanded],[aria-selected],[aria-pressed]'))||el.classList.contains('brand-coral-frame')||(/btn|button|action|cta|connect|docs/.test(el.className)&&parseFloat(c.paddingTop)>6);
  if(!isControl||!t||t.length>110)return;
  el.classList.add('brand-action');
  el.classList.toggle('brand-action-primary',/book a demo|request api access|discuss your integration|send message/i.test(t));
 });
}
// Add contacts only to actual connector geometry, never icon paths or moving dots.
function contacts(){
 document.querySelectorAll('svg').forEach(svg=>{
  // Animated wires whose ends move draw their own nodes; a snapshot would leave stray dots behind.
  if(svg.hasAttribute('data-managed-contacts')||svg.closest('.ms-board,.hbx-object,[data-wire-contacts="off"]')||!(svg.matches('[class*="wire"],[class*="cable"],[class*="connection"],[class*="flow"]')||svg.querySelector('path[id*="route"]')))return;
  let layer=svg.querySelector(':scope > .brand-wire-contacts');
  if(!layer){layer=document.createElementNS(ns,'g');layer.classList.add('brand-wire-contacts');layer.setAttribute('aria-hidden','true');svg.append(layer)}
  const points=new Map();
  const routeOnly=!!svg.querySelector('path[id*="route"]');
  svg.querySelectorAll('path[d],use').forEach(rendered=>{
   const href=rendered.getAttribute('href')||rendered.getAttribute('xlink:href');const path=rendered.tagName==='use'?(href?.startsWith('#')?document.getElementById(href.slice(1)):null):rendered;if(!path?.matches('path[d]'))return;if(routeOnly&&!/route/.test(path.id))return;
   if((rendered===path&&path.closest('defs,clipPath,mask'))||path.closest('.brand-wire-contacts'))return;
   const parts=path.getAttribute('d').match(/[Mm][^Mm]*/g)||[];
   // Absolute subpaths are independent connector branches. Relative ones retain original geometry.
   (parts.every(p=>p[0]==='M')?parts:[path.getAttribute('d')]).forEach(d=>{
    const probe=document.createElementNS(ns,'path');probe.setAttribute('d',d);let length;try{length=probe.getTotalLength()}catch{return}if(length<25||/[zZ]/.test(d))return;
    const matrix=rendered.getCTM(),base=svg.getCTM();if(!matrix||!base)return;const transform=base.inverse().multiply(matrix);
    [0,length].forEach(n=>{const p=probe.getPointAtLength(n);const v=new DOMPoint(p.x,p.y).matrixTransform(transform);points.set(`${Math.round(v.x)},${Math.round(v.y)}`,v)});
   });
  });
  layer.replaceChildren();points.forEach(p=>{const c=document.createElementNS(ns,'circle');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r','3');layer.append(c)});
 });
}
function refresh(){apply();
 document.querySelectorAll('.brand-coral-frame').forEach(el=>{
  const rect=el.getBoundingClientRect();
  const nav=el.matches('nav,.top,.site-header,header.header')||!!el.querySelector('nav[aria-label="Main navigation"]');
  const outer=el.hasAttribute('data-brand-outer-frame')||(!el.matches('a,button,input,select')&&rect.width>innerWidth*.65&&rect.height>70);
  el.classList.toggle('brand-outer-frame',nav||outer);
 });document.querySelectorAll('svg rect[stroke]').forEach(el=>{if(el.closest('defs,clipPath,mask')||el.getAttribute('stroke')==='none')return;if(+el.getAttribute('width')>60&&+el.getAttribute('height')>30)el.classList.add('brand-svg-frame')});contacts()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
window.addEventListener('load',refresh);let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(contacts,150)});
})();
