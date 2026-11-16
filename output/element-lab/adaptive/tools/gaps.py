import re,json,difflib
S='..'
L=[l.rstrip() for l in open('tools/copy-v4-clean.txt').read().split('\n')]
def norm(s):
  s=s.lower().replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"').replace('–','-').replace('—','-').replace(' ',' ')
  s=re.sub(r'[^a-z0-9$%+&\' ]+',' ',s); return re.sub(r'\s+',' ',s).strip()
# parse pages
pages=[];i=0
while i<len(L):
  m=re.match(r'^(\d+)\. (.+)$',L[i])
  if m and i+1<len(L) and L[i+1].startswith('URL:'):
    pages.append({'n':int(m.group(1)),'name':m.group(2),'start':i,'secs':[],'faq':[]})
  i+=1
for k,p in enumerate(pages):
  end=pages[k+1]['start'] if k+1<len(pages) else len(L)
  body=L[p['start']:end]
  try: s0=body.index('Section')
  except ValueError: s0=0
  cur=None; infaq=False
  for line in body[s0+1:]:
    if re.match(r'^.{0,60}\bFAQ$',line) and not re.match(r'^\d+\.',line): infaq=True; cur=None; continue
    if infaq:
      if line.strip(): p['faq'].append(line)
      continue
    m=re.match(r'^(\d+)\. (.+)$',line)
    if m and len(line)<70:
      cur={'n':int(m.group(1)),'title':m.group(2),'lines':[]}; p['secs'].append(cur); continue
    if cur is not None and line.strip(): cur['lines'].append(line)
SKIP=('Product visual','Idea','Background','Link (small','URL','Note')
def units(lines):
  out=[]
  for ln in lines:
    lab,_,txt=ln.partition(': ')
    if not _ : lab,txt='',ln
    if ' Link: ' in txt:
      txt,lk=txt.split(' Link: ',1); out+=re.findall(r'"([^"]+)"',lk)
    if lab.startswith(SKIP) or txt.startswith('See FAQ'): continue
    if lab.startswith('Link') or lab.startswith('Button'):
      out+= [q for q in re.findall(r'"([^"]+)"',txt)]; continue
    if lab.startswith('Eyebrow / H1'): continue
    for part in re.split(r' · |(?<=[.?!])\s+',txt):
      part=re.sub(r'\[(TBD|CONFIRM)[^\]]*\]','',part).strip(' .')
      if len(norm(part).split())>=2: out.append(part)
  return out
inv=json.load(open('inventory.json'))
PMAP={'index-v2.html':1,'about-us.html':2,'api.html':3,'marketplace.html':4,'personalization.html':5,'developers.html':6,'otas.html':7,'airlines.html':8,'loyalty-finance.html':9,'travel-technology.html':10,'hotels.html':11,'super-apps.html':12,'insights.html':13,'careers.html':14,'press.html':15,'contact.html':16}
docall=' '+norm('\n'.join(L))+' '
docsents=[norm(x) for x in re.split(r'(?<=[.?!:])\s+|\n|·',('\n'.join(L))) if len(norm(x))>12]
result={}
for page,secs in inv.items():
  dp=next(p for p in pages if p['n']==PMAP[page])
  used=set(); rows=[]
  for s in secs:
    if s['height']==0: continue
    T=' '+norm(s['text'])+' | '+norm(s['all'])+' '
    best=None;bs=0
    for ds in dp['secs']:
      u=units(ds['lines'])
      if not u: 
        sc=1 if norm(ds['title']) in norm(s['cls']+' '+s['h']) else 0
      else:
        sc=sum(1 for x in u if ' '+norm(x)+' ' in T)/len(u)
        hl=[x.split(': ',1)[1] for x in ds['lines'] if x.startswith('Headline:')]
        if hl and difflib.SequenceMatcher(None,norm(hl[0]),norm(s['h'])).ratio()>0.8: sc+=1
      if sc>bs: bs,best=sc,ds
    if 'faq' in (s['sel'] or ''):
      best={'n':0,'title':'FAQ','lines':dp['faq']}; bs=1
    if 'bf-cta-shell' in (s['sel'] or ''):
      best=next((d for d in dp['secs'] if d['title'].startswith('CTA')),None) or {'n':-1,'title':'Recurring CTA','lines':[]}; bs=1
    missing=[];found=0
    if best and bs>0.15:
      used.add(best['n'])
      if best['title']=='FAQ':
        qs=[ln.split('?')[0]+'?' for ln in best['lines'] if '?' in ln]
        missing=[q for q in qs if ' '+norm(q)+' ' not in T]; total=len(qs)
      else:
        u=units(best['lines']); missing=[x for x in u if ' '+norm(x)+' ' not in T]; total=len(u)
      found=total-len(missing)
    extra=[]
    for sent in re.split(r'(?<=[.?!])\s+|\n',s['text']):
      n=norm(sent)
      if len(n.split())<5 or (' '+n+' ') in docall: continue
      extra.append(sent[:160])
    visual=bool(best and any(x.startswith('Product visual: yes') for x in best['lines']))
    rows.append({'sel':s['sel'],'h':s['h'],'height':s['height'],'doc':(f"{best['n']}. {best['title']}" if best and bs>0.15 else None),
      'docFound':found if best and bs>0.15 else 0,'docTotal':(found+len(missing)) if best and bs>0.15 else 0,'docMissing':missing,'notInDoc':extra[:8],'visualRequired':visual})
  unmatched=[f"{d['n']}. {d['title']}" for d in dp['secs'] if d['n'] not in used and not d['title'].startswith(('FAQ','CTA'))]
  result[page]={'doc':dp['name'],'rows':rows,'docSectionsNotOnSite':unmatched}
  print(f"\n== {page} → {dp['name']}  | doc sections not on site: {unmatched}")
  for r in rows: print(f"  {r['sel']:28} ↔ {str(r['doc']):34} {r['docFound']}/{r['docTotal']} miss:{len(r['docMissing'])} extra:{len(r['notInDoc'])}")
json.dump(result,open('gaps.json','w'),indent=1,ensure_ascii=False)
