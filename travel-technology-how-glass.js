/* Integration map: the source icons get the Bridgify icon-system light dot, on the stroke, with the same 1.5 weight */
(function(){
  var NS='http://www.w3.org/2000/svg';
  var spots=[['M4 9V6',[4,9]],['M3 20h18',[12,3]],['M3 16c2',[5,13]],['M9 18V6',[9,6]],['m3 19',[3,19]],['M12 21s',[12,3]]];
  document.querySelectorAll('#section-2 .ti-src svg').forEach(function(s){
    if(s.querySelector('.ti-dot'))return;
    var p=s.querySelector('path');if(!p)return;var d=p.getAttribute('d')||'';
    spots.forEach(function(sp){if(d.indexOf(sp[0])===0){var c=document.createElementNS(NS,'circle');c.setAttribute('class','ti-dot');c.setAttribute('cx',sp[1][0]);c.setAttribute('cy',sp[1][1]);c.setAttribute('r','1.5');s.appendChild(c)}});
  });
})();
