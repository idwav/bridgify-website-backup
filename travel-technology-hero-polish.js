(() => {
  const root = document.querySelector('.te-visual'), F = window.BridgifyFlow;
  if (!root || !F) return;
  const ns = 'http://www.w3.org/2000/svg', reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const code = root.querySelector('.nt-code-lines'), tabs = root.querySelector('.nt-tabs');
  const grid = root.querySelector('.nt-experiences'), product = root.querySelector('.nt-product');
  const states = [
    {name:'Experiences', items:[['louvre','Louvre Museum'],['food-tour','Food experiences'],['concert','Live shows']]},
    {name:'Tours', items:[['florence','City walks'],['food-tour','Food tours'],['seine-dinner','River cruises']]},
    {name:'Activities', items:[['catamaran','Sailing'],['alps','Outdoor adventures'],['london-eye','Attractions']]}
  ];
  states.flatMap(s => s.items).forEach(([asset]) => { const im = new Image(); im.src = `assets/hero-experiences/${asset}.jpg`; });
  const bridge = root.querySelector('.nt-bridge'), hub = document.createElement('div');
  hub.className = 'te-hub';
  [...bridge.querySelectorAll(':scope > svg,:scope > strong')].forEach(el => hub.append(el));
  bridge.replaceChildren(hub);
  const mark = document.createElement('span'); mark.className='te-brand-mark'; mark.setAttribute('aria-hidden','true'); hub.prepend(mark);
  tabs.replaceChildren(); tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Experience categories');
  grid.id = 'te-category-panel'; grid.setAttribute('role','tabpanel');
  let active = 0, target = 1, elapsed = 0, epoch = 0, delivered = false;
  const buttons = states.map((state, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = state.name;
    button.id = `te-tab-${i}`; button.setAttribute('role','tab'); button.setAttribute('aria-controls',grid.id);
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', e => {
      let next = e.key === 'ArrowRight' ? (i+1)%3 : e.key === 'ArrowLeft' ? (i+2)%3 : e.key === 'Home' ? 0 : e.key === 'End' ? 2 : null;
      if (next !== null) {e.preventDefault(); select(next); buttons[next].focus();}
    }); tabs.append(button); return button;
  });
  function render(animate) {
    const state = states[active];
    buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===active));b.tabIndex=i===active?0:-1;});
    grid.setAttribute('aria-labelledby',buttons[active].id);
    grid.replaceChildren(...state.items.map(([asset,title],i)=>{
      const card = document.createElement('div'); card.className = 'nt-experience';
      card.innerHTML = `<img class="nt-photo" src="assets/hero-experiences/${asset}.jpg" alt=""><div class="nt-caption"><span>${title}</span></div>`;
      if (animate && !reduced.matches) card.animate([{opacity:0,transform:'translateY(14px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:650,delay:i*110,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
      return card;
    }));

  }
  const codeText = () => `// Experiences API\n{\n  "category": "${states[target].name}",\n  "content": "normalized",\n  "availability": "live",\n  "booking": true\n}`;
  code.innerHTML = '<pre class="te-code-content"><code></code><span class="te-caret" aria-hidden="true">▍</span></pre>';
  const typed = code.querySelector('code');
  code.setAttribute('aria-label','Illustrative Experiences API request');
  function select(i) {
    target=i; epoch=elapsed; delivered=false;
    if(reduced.matches){active=i;typed.textContent=codeText();render(false);}
  }
  render(false);
  typed.textContent = reduced.matches ? codeText() : "";
  const svg = document.createElementNS(ns,'svg'); svg.classList.add('te-flow-svg'); svg.setAttribute('aria-hidden','true'); root.append(svg);
  let lines=[];
  function layout() {
    svg.replaceChildren(); lines=[];
    const r=root.getBoundingClientRect(), nodes=[root.querySelector('.nt-code'),hub,product], mobile=innerWidth<=760;
    nodes.slice(0,2).forEach((a,i)=>{
      const b=nodes[i+1], A=a.getBoundingClientRect(), B=b.getBoundingClientRect();
      let x,y,X,Y,d;
      if(mobile){
        x=A.left+A.width/2-r.left;y=A.bottom-r.top;
        X=B.left+B.width/2-r.left;Y=B.top-r.top;
        d=`M${x} ${y} L${X} ${Y}`;
      }else if(i===0){
        x=A.left+A.width/2-r.left;y=A.bottom-r.top;
        X=B.left-r.left;Y=B.top+B.height/2-r.top;
        d=`M${x} ${y} V${Y-22} Q${x} ${Y} ${x+22} ${Y} H${X}`;
      }else{
        x=A.right-r.left;y=A.top+A.height/2-r.top;
        X=B.left+B.width/2-r.left;Y=B.bottom-r.top;
        d=`M${x} ${y} H${X-22} Q${X} ${y} ${X} ${y-22} V${Y}`;
      }
      const make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);return el;};
      const path=make('path',{d,fill:'none',stroke:'#f46649','stroke-width':2.2,opacity:.8});
      const light=make('path',{d,fill:'none',stroke:'#fff8f1','stroke-width':2.5,'stroke-linecap':'round',opacity:0});
      [[x,y],[X,Y]].forEach(([cx,cy])=>make('circle',{cx,cy,r:2.6,fill:'#fff8f1',stroke:'#f46649','stroke-width':1.2}));
      const dots=Array.from({length:4},()=>make('circle',{fill:'#fff8f1',r:2.6,opacity:0}));
      lines.push({path,light,dots,b,i,length:path.getTotalLength()});
    });
  }
  new ResizeObserver(layout).observe(root); document.fonts.ready.then(layout); layout();
  let previous=0;
  F.run(root,t=>{
    const delta=previous?t-previous:0; previous=t;

    elapsed+=delta;
    if(elapsed-epoch>=8000){target=(active+1)%3;epoch=elapsed;delivered=false;}
    const phase=elapsed-epoch;
    const text=codeText();
    typed.textContent=text.slice(0,Math.floor(text.length*F.clamp(phase/1900)));
    code.classList.toggle('te-typing',phase<1900);
    root.dataset.motionPhase=phase<1900?'typing':phase<3500?'to-bridgify':phase<4100?'processing':phase<5700?'to-product':'delivered';
    lines.forEach(l=>{
      const start=l.i===0?2100:4100, u=(phase-start)/1300, q=F.clamp(u);
      l.light.setAttribute('stroke-dasharray',`${Math.min(24,l.length*.4)} ${l.length+30}`);
      l.light.setAttribute('stroke-dashoffset',-q*l.length);
      l.light.setAttribute('opacity',u>0&&u<1?Math.sin(q*Math.PI):0);
      l.dots.forEach((dot,i)=>{const v=(phase-start-i*75)/1300,p=l.path.getPointAtLength(l.length*F.smooth(v));dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('opacity',v>0&&v<1?Math.min(1,v*8,(1-v)*8):0);});
      l.b.style.setProperty('--arrival',F.arrival(phase-(l.i===0?3450:5450)));
    });
    if(phase>=5700&&!delivered){delivered=true;active=target;render(true);}

  },()=>{previous=0;lines.forEach(l=>{l.light.setAttribute('opacity',0);l.dots.forEach(d=>d.setAttribute('opacity',0));l.b.style.setProperty('--arrival',0);});});
})();
