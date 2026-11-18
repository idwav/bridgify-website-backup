import json, collections
from playwright.sync_api import sync_playwright
J=r"""() => {
 const vis = e => { const r=e.getBoundingClientRect(), c=getComputedStyle(e); return r.width>1 && r.height>1 && c.visibility!=='hidden' && c.display!=='none' && +c.opacity>0.01 && !e.closest('[aria-hidden=true], .hm-stage, .intent-stage, .pr-card-visual, .v2e-proof, .hc2-demo, .ad-hero-flow, .bv2-hero-visual, svg'); };
 const out={h1:[],h2:[],h3:[],h4:[],label:[],body:[],button:[]};
 const fam = e => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,'');
 const row = (e) => { const c=getComputedStyle(e); const sec=e.closest('section'); return [sec?(sec.id||sec.className.split(' ')[0]):'-', +parseFloat(c.fontSize).toFixed(1), c.fontWeight, fam(e), +(parseFloat(c.lineHeight)/parseFloat(c.fontSize)).toFixed(2), e.innerText.trim().slice(0,26)]; };
 document.querySelectorAll('main h1, section h1, h1').forEach(e=>vis(e)&&out.h1.push(row(e)));
 document.querySelectorAll('section h2').forEach(e=>vis(e)&&out.h2.push(row(e)));
 document.querySelectorAll('section h3').forEach(e=>vis(e)&&out.h3.push(row(e)));
 document.querySelectorAll('section h4').forEach(e=>vis(e)&&out.h4.push(row(e)));
 [...document.querySelectorAll('section *')].filter(e=>vis(e) && getComputedStyle(e).textTransform==='uppercase' && e.children.length===0 && e.innerText.trim().length>3 && e.innerText.trim().length<50).forEach(e=>out.label.push(row(e)));
 document.querySelectorAll('section p').forEach(e=>vis(e)&&e.innerText.trim().length>40&&out.body.push(row(e)));
 document.querySelectorAll('section a.brand-action, section .brand-action, section button.brand-action, section a[class*=btn], section .hc2-actions a, #start').forEach(e=>vis(e)&&out.button.push(row(e)));
 return out; }"""
res={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (600,768,1024,1280,1440,1920):
        pg=b.new_page(viewport={"width":w,"height":900}, reduced_motion="reduce")
        pg.goto("http://127.0.0.1:8084/index-v2.html?version=2", wait_until="networkidle")
        pg.evaluate("async () => { for (let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y); await new Promise(r=>setTimeout(r,30));} scrollTo(0,0); }"); pg.wait_for_timeout(400)
        res[w]=pg.evaluate(J); pg.close()
    b.close()
json.dump(res, open("typescan.json","w"), indent=1)
for role in ("h1","h2","h3","h4","label","body","button"):
    print(f"\n### {role}")
    for w,r in res.items():
        c=collections.Counter((x[1]) for x in r[role]); 
        print(f"  {w}: " + ", ".join(f"{k}px×{v}" for k,v in sorted(c.items())))
print("\n### h2 per section @1440 / @768")
for w in (1440,768):
    print(w, [(x[0],x[1]) for x in res[w]["h2"]])
print("\n### families/weights h1/h2 @1440", {(x[3],x[2]) for x in res[1440]["h1"]+res[1440]["h2"]})
print("### lh h2 @1440", sorted({x[4] for x in res[1440]["h2"]}), " body lh", sorted({x[4] for x in res[1440]["body"]}))
print("### h3 @1440", [(x[0],x[1],x[5]) for x in res[1440]["h3"]][:20])
print("### body @1440 by section", sorted({(x[0],x[1]) for x in res[1440]["body"]}))
print("### labels @1440", sorted({(x[1],x[2]) for x in res[1440]["label"]}))
