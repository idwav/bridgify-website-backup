(() => {
 const query = new URLSearchParams(location.search);
 if(query.has('device-preview') || query.has('embed')) return;
 const nav = document.createElement('nav'); nav.className='device-switcher';nav.setAttribute('aria-label','Preview device');
 nav.innerHTML='<button type="button" data-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-device="ipad" aria-pressed="false">iPad</button><button type="button" data-device="phone" aria-pressed="false">Phone</button>';
 document.querySelector('.top').after(nav);
 const stage=document.createElement('section');stage.className='device-stage';stage.hidden=true;stage.setAttribute('aria-label','Device preview');nav.after(stage);
 let frame, width, height;
 function fit(){if(!frame)return;const scale=Math.min(1,(innerWidth-32)/width);stage.style.width=width*scale+'px';stage.style.height=height*scale+'px';frame.style.transform=`scale(${scale})`;}
 nav.addEventListener('click',e=>{
  const button=e.target.closest('[data-device]');if(!button)return;
  const device=button.dataset.device;
  nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.body.classList.toggle('device-preview-open',device!=='desktop');stage.hidden=device==='desktop';
  if(frame){frame.remove();frame=null;}
  if(device==='desktop')return;
  const play=document.querySelector('#play');if(play?.getAttribute('aria-pressed')==='true')play.click();
  [width,height]=device==='phone'?[390,844]:[820,1180];
  frame=document.createElement('iframe');frame.title=device==='phone'?'Phone tutorial preview':'iPad tutorial preview';
  const url=new URL(location.href);url.searchParams.set('device-preview','1');url.searchParams.delete('embed');url.searchParams.delete('view');
  frame.src=url;frame.style.width=width+'px';frame.style.height=height+'px';stage.append(frame);fit();
 });
 window.addEventListener('resize',fit);
})();
