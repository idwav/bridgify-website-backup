import json, collections
D=json.load(open('type-audit.json'))
EXP={'hero':{1280:46.1,1440:51.8,1920:60},'section':{1280:38.4,1440:43.2,1920:44},'card':{1280:24.3,1440:27.4,1920:28}}
def rowsfor(role,w):
  out=[]
  for page,ws in D.items():
    secs=ws.get(str(w)) or ws.get(w)
    if isinstance(secs,dict): continue
    for s in secs:
      for e in s['roles'].get(role,[]): out.append((page,s['id'],e))
  return out
for role in ['hero','section','section-2nd','label','intro','card','button']:
  print('\n######',role)
  for w in [1440]:
    c=collections.Counter()
    for page,sid,e in rowsfor(role,w):
      c[(e['fam'],e['size'],e['w'],e['lh'],e['ls'])]+=1
    for k,n in c.most_common(25): print(w,n,k)
