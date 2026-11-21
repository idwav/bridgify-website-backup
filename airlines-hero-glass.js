/* the hero journey is an illustration: its buttons are not focusable */
document.querySelectorAll('#section-1 .aj-journey button, #section-1 .aj-journey a').forEach(function(e){e.setAttribute('tabindex','-1');e.setAttribute('aria-hidden','true')});
/* Earn beyond the flight: the channel icons get the Bridgify icon-system light dot, sitting on the stroke with the same 1.5 weight */
(function(){
  var NS='http://www.w3.org/2000/svg';
  var spots={plane:[21,4],monitor:[2,10],phone:[12,1],mail:[3,6]};
  document.querySelectorAll('#section-2 svg').forEach(function(s){
    if(s.querySelector('.al-dot'))return;
    var u=s.querySelector('use');
    if(u){var src=document.querySelector(u.getAttribute('href'));if(src){if(!s.getAttribute('viewBox'))s.setAttribute('viewBox',src.getAttribute('viewBox')||'0 0 24 24');[].slice.call(src.children).forEach(function(e){s.appendChild(e.cloneNode(true))});u.remove();}}
    var kind=s.querySelector('rect[width="20"][height="14"]')?'monitor':s.querySelector('rect[width="12"][height="22"]')?'phone':s.querySelector('rect[width="20"][height="16"]')?'mail':s.querySelector('path[d^="m3 11"]')?'plane':null;
    if(!kind)return;
    var c=document.createElementNS(NS,'circle');c.setAttribute('class','al-dot');c.setAttribute('cx',spots[kind][0]);c.setAttribute('cy',spots[kind][1]);c.setAttribute('r','1.4');
    s.appendChild(c);
  });
})();
