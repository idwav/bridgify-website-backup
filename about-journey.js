(() => {
  const journey=document.querySelector('.about-journey');
  if (!journey) return;
  const hbx=document.querySelector('.hbx-content');
  const atmosphere=document.querySelector('.hbx-atmosphere');
  const team=document.querySelector('#team');
  const heading=team.querySelector('.team-head');
  const title=heading.querySelector('div');
  const description=heading.querySelector('p');
  const cards=[...team.querySelectorAll('.ticket')];
  const note=team.querySelector('.team-demo-note');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
  let pending=false;
  let overflow=0;
  function measure(){
    journey.classList.toggle('is-motion',!media.matches);
    overflow=Math.max(0,team.offsetHeight-innerHeight);
    journey.style.height=media.matches?'auto':`${innerHeight*3.4+overflow}px`;
    schedule();
  }
  function render(){
    pending=false;
    if(media.matches){
      [hbx,atmosphere,team,heading,title,description,note,...cards].forEach(el=>el.removeAttribute('style'));
      team.inert=false;return;
    }
    const distance=Math.max(0,-journey.getBoundingClientRect().top);
    const transitionDistance=innerHeight*2.4;
    const p=clamp(distance/transitionDistance);
    team.style.transform=`translateY(${-Math.min(overflow,Math.max(0,distance-transitionDistance))}px)`;
    const exit=ease((p-.16)/.24),enter=ease((p-.34)/.23),reveal=ease((p-.61)/.26);
    hbx.style.opacity=1-exit;
    hbx.style.visibility=exit<1?"visible":"hidden";
    hbx.style.transform=`translateY(${-110*exit}px) scale(${1-.035*exit})`;
    atmosphere.style.transform=`translateY(${120*enter}px) scale(${1+.16*enter})`;
    atmosphere.style.opacity=1-.86*enter;
    team.style.opacity=enter;
    team.style.visibility=p>.34?'visible':'hidden';
    team.style.pointerEvents=p>.58?'auto':'none';team.inert=p<.58;
    const leftIn=ease((p-.34)/.25),rightIn=ease((p-.38)/.25);
    title.style.transform=`translateX(${-150*(1-leftIn)}px)`;
    title.style.opacity=leftIn;
    description.style.transform=`translateX(${150*(1-rightIn)}px)`;
    description.style.opacity=rightIn;
    cards.forEach((card,i)=>{const r=ease((p-.60-i*.035)/.18);card.style.opacity=r;card.style.transform=`translateY(${130*(1-r)}px) rotate(${(i-1.5)*2*(1-r)}deg)`});
    note.style.opacity=reveal;

  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(render)}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);
  media.addEventListener('change',measure);new ResizeObserver(measure).observe(team);function followHash(){
    if(!['#team','#hbx'].includes(location.hash)||media.matches)return;
    const start=journey.getBoundingClientRect().top+scrollY;
    window.scrollTo({top:start+(location.hash==='#team'?innerHeight*2.4:0),behavior:'instant'});
    schedule();
  }
  addEventListener('hashchange',followHash);
  document.fonts.ready.then(()=>{measure();requestAnimationFrame(followHash)});measure();
})();
