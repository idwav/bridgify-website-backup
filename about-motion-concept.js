(() => {
  const journey=document.querySelector('.motion-journey');
  const intro=document.querySelector('.journey-intro');
  const story=document.querySelector('.journey-story');
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
    overflow=Math.max(0,team.offsetHeight-innerHeight);
    journey.style.height=media.matches?'auto':`${innerHeight*6.2+overflow}px`;
    schedule();
  }
  function render(){
    pending=false;
    if(media.matches){
      [intro,story,hbx,atmosphere,team,heading,title,description,note,...cards].forEach(el=>el.removeAttribute('style'));
      team.inert=false;intro.inert=false;story.inert=false;atmosphere.dataset.globe="0";return;
    }
    const distance=Math.max(0,-journey.getBoundingClientRect().top);
    const scene=distance/innerHeight;
    const leadDistance=innerHeight*2.8;
    const transitionDistance=innerHeight*5.2;
    const p=clamp((distance-leadDistance)/(innerHeight*2.4));
    const introOut=ease((scene-.42)/.65);
    const storyIn=ease((scene-.88)/.58), storyOut=ease((scene-1.98)/.62);
    const hbxIn=ease((scene-2.28)/.52);
    intro.style.opacity=1-introOut;
    intro.style.transform=`translateY(${-100*introOut}px)`;
    intro.style.visibility=introOut>=1?'hidden':'visible';intro.inert=introOut>.8;
    story.style.opacity=storyIn*(1-storyOut);
    story.style.transform=`translateY(${90*(1-storyIn)-90*storyOut}px)`;
    story.style.visibility=scene>.88&&scene<2.6?'visible':'hidden';story.inert=scene<1||scene>2.5;
    atmosphere.dataset.globe=String(1-hbxIn);
    team.style.transform=`translateY(${-Math.min(overflow,Math.max(0,distance-transitionDistance))}px)`;
    const exit=ease((p-.16)/.24),enter=ease((p-.34)/.23),reveal=ease((p-.61)/.26);
    hbx.style.opacity=hbxIn*(1-exit);
    hbx.style.visibility=hbxIn>0?"visible":"hidden";
    hbx.style.transform=`translateY(${-110*exit}px) scale(${1-.035*exit})`;
    const narrow=innerWidth<701;
    const drift=(narrow?12:32)*(1-introOut)+65*introOut*(1-hbxIn);
    atmosphere.style.transform=`translate(${drift}%,${120*enter}px) scale(${.82+.18*hbxIn+.16*enter})`;
    atmosphere.style.opacity=(1-.86*enter)*(1-.9*introOut*(1-hbxIn));
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
    document.querySelector('.motion-track i').style.width=`${clamp(distance/transitionDistance)*100}%`;
    document.querySelector('#motion-chapter').textContent=scene<.95?'01 / Global experiences':scene<2.4?'02 / One integration':p<.45?'03 / Backed by HBX':'04 / The people behind it';
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(render)}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);
  media.addEventListener('change',measure);new ResizeObserver(measure).observe(team);document.fonts.ready.then(measure);measure();
})();
