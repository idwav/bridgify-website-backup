/* Add experience discovery: icons get the light dot on the stroke (same 1.5 weight) */
(function(){
  var NS='http://www.w3.org/2000/svg';
  document.querySelectorAll('#section-3 .ad-column h3 svg, #section-3 .ad-tabs span svg, #section-3 .ad-package>div svg').forEach(function(s){
    if(s.querySelector('.ad-dot')||s.closest('.ad-network'))return;
    var p=s.querySelector('path,rect');if(!p)return;
    var vb=(s.getAttribute('viewBox')||'0 0 24 24').split(' ');var x=+vb[0]+3,y=+vb[1]+3;
    var d=(p.getAttribute('d')||'');
    var m=d.match(/^M\s*([\d.]+)[ ,]+([\d.]+)/i);if(m){x=+m[1];y=+m[2]}
    var c=document.createElementNS(NS,'circle');c.setAttribute('class','ad-dot');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','1.4');s.appendChild(c);
  });
})();
