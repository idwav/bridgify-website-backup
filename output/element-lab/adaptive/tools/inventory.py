import json, asyncio, sys
from playwright.async_api import async_playwright
PAGES=["index-v2.html","api.html","marketplace.html","personalization.html","developers.html","otas.html","airlines.html","loyalty-finance.html","travel-technology.html","hotels.html","super-apps.html","about-us.html","contact.html","careers.html","press.html","insights.html"]
JS=r"""
() => {
 const uniq = el => {
   if (el.id && document.querySelectorAll('#'+CSS.escape(el.id)).length===1) return '#'+el.id;
   const cls=[...el.classList];
   for (const c of cls){const s=el.tagName.toLowerCase()+'.'+c; if(document.querySelectorAll(s).length===1) return s;}
   return null;
 };
 const vis = t => t.replace(/\s+/g,' ').trim();
 const secs=[...document.querySelectorAll('section')].filter(s=>!s.parentElement.closest('section') && !s.closest('header.site-header-common'));
 const out=secs.map(s=>{
   const r=s.getBoundingClientRect();
   const h=s.querySelector('h1,h2');
   const eb=s.querySelector('.eyebrow,[class*=eyebrow],[class*=kicker]');
   return {sel:uniq(s), id:s.id||null, cls:s.className, h:h?vis(h.innerText):'', eyebrow:eb?vis(eb.innerText).slice(0,80):'',
     top:Math.round(r.top+scrollY), height:Math.round(r.height), text:vis(s.innerText), all:(()=>{const w=document.createTreeWalker(s,NodeFilter.SHOW_TEXT);let n,a=[];while(n=w.nextNode()){if(!n.parentElement.closest('script,style'))a.push(n.textContent)}return vis(a.join(' '))})()+' '+[...s.querySelectorAll('[aria-label],[data-count],[data-target],[data-value]')].map(e=>[e.getAttribute('aria-label'),e.dataset.count,e.dataset.target,e.dataset.value].filter(Boolean).join(' ')).join(' '), inFooter:!!s.closest('footer,.bf-footer-shell')};
 });
 return out;
}
"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':900})
    res={}
    for name in PAGES:
      await pg.goto(f'http://localhost:8081/{name}?version=2',wait_until='networkidle')
      h=await pg.evaluate('document.body.scrollHeight')
      for y in range(0,h,700):
        await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(80)
      await pg.wait_for_timeout(800)
      res[name]=await pg.evaluate(JS)
      print(name,len(res[name]),[ (x['sel'],x['height']) for x in res[name]])
    json.dump(res,open('inventory.json','w'),indent=1,ensure_ascii=False)
    await b.close()
asyncio.run(main())
