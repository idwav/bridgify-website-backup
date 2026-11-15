/* Sticky header. It follows the scroll; once the page moves it always gets the same dark surface
   (whatever section is underneath), with a fine coral line on its lower edge. */
(()=>{
const header=document.querySelector('header.site-header-common');if(!header)return;
// Lift the header out of the hero: as a direct child of <body> it stays above every section while it follows the scroll.
if(header.parentElement!==document.body)document.body.prepend(header);
header.classList.add('is-sticky');
let lastY=scrollY,ticking=false;
function update(){
 ticking=false;const y=scrollY,stuck=y>24;
 header.classList.toggle('is-stuck',stuck);
 header.classList.toggle('nav-tone-dark',stuck);
 // Small screens: the two-row header steps aside while reading down and returns on the way up.
 const menuOpen=!!header.querySelector('details[open]');
 if(innerWidth>950||y<=200||menuOpen||y<lastY-2)header.classList.remove('is-tucked');
 else if(y>lastY+2)header.classList.add('is-tucked');
 lastY=y;
}
const ask=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
addEventListener('scroll',ask,{passive:true});addEventListener('resize',ask);
update();
})();
