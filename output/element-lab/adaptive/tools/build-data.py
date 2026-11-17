"""Merge inventory, doc gaps, checks and decisions into adaptive-data.json for adaptive.html.
Run from output/element-lab/adaptive:  python3 tools/build-data.py"""
import json, re, os, difflib
inv = json.load(open('inventory.json')); gaps = json.load(open('gaps.json'))
dec = json.load(open('decisions.json'))
cb = json.load(open('checks-baseline.json')) if os.path.exists('checks-baseline.json') else {}
cp = json.load(open('checks-proposed.json')) if os.path.exists('checks-proposed.json') else {}
audit_src = open('../audit.html').read()
AUD = json.loads(re.search(r'const DATA = (\[.*?\]);\n', audit_src, re.S).group(1))
spec = open('../bridgify-site-spec-en.md').read()
SPEC = {}
cur = None
for line in spec.split('\n'):
    m = re.match(r'^## (\d+)\.', line)
    if m: cur = int(m.group(1)); SPEC[cur] = []; continue
    m = re.match(r'^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \|$', line)
    if m and cur: SPEC[cur].append({'title': m.group(2), 'msg': m.group(3), 'visual': re.sub(r'\*\*', '', m.group(4))})
PMAP = {'index-v2.html': 1, 'about-us.html': 2, 'api.html': 3, 'marketplace.html': 4, 'personalization.html': 5, 'developers.html': 6,
        'otas.html': 7, 'airlines.html': 8, 'loyalty-finance.html': 9, 'travel-technology.html': 10, 'hotels.html': 11,
        'super-apps.html': 12, 'insights.html': 13, 'careers.html': 13, 'press.html': 13, 'contact.html': 16}
NAMES = {'index-v2.html': 'Homepage', 'api.html': 'Experiences API', 'marketplace.html': 'White-Label Marketplace',
         'personalization.html': 'AIyelet', 'developers.html': 'Developers', 'otas.html': 'OTAs', 'airlines.html': 'Airlines',
         'loyalty-finance.html': 'Loyalty & finance', 'travel-technology.html': 'Travel technology', 'hotels.html': 'Hotels',
         'super-apps.html': 'Super apps', 'about-us.html': 'About', 'contact.html': 'Contact', 'careers.html': 'Careers',
         'press.html': 'Press', 'insights.html': 'Insights'}
def checks(src, page, sel):
    out = {}
    for w, m in (src.get(page) or {}).items():
        s = next((x for x in m['sections'] if x['sel'] == sel), None)
        if s: out[w] = {'screens': s['screens'], 'height': s['height'], 'overflow': len(s['overflow']), 'tap': s.get('smallTapCount', 0),
                        'tapSample': s['smallTap'][:3], 'text': s['smallText']['count'], 'textMin': s['smallText']['min'], 'edges': s['edges'],
                        'pageOverflow': m['page']['pageOverflow']}
    return out
def norm(s): return re.sub(r'[^a-z0-9 ]', '', s.lower())
rows = []
shared = [('shared:header', 'Header', 'index-v2.html', 'header.site-header-common', 'header'),
          ('shared:menu', 'Menu (mobile & tablet)', 'index-v2.html', 'header.site-header-common', 'menu'),
          ('shared:footer', 'Footer', 'index-v2.html', 'footer.bf-footer', 'section')]
for key, title, page, sel, mode in shared:
    rows.append({'key': key, 'page': 'Shared', 'file': page, 'sel': sel, 'mode': mode, 'title': title, 'h': '', 'doc': None,
                 'gap': None, 'spec': None, 'job': None, 'dec': dec.get(key), 'base': {}, 'prop': {}})
for page, secs in inv.items():
    g = {r['sel']: r for r in gaps[page]['rows']}
    for s in secs:
        if not s['height'] or not s['sel']: continue
        if s['sel'] == 'section.bf-cta-shell' and page != 'api.html': continue  # one shared CTA band row
        key = f'{page}|{s["sel"]}'
        gr = g.get(s['sel'], {})
        doc = gr.get('doc')
        sp = None
        if doc:
            t = norm(re.sub(r'^\d+\.\s*', '', doc).split('(')[0])
            cands = SPEC.get(PMAP[page], [])
            best = max(cands, key=lambda c: difflib.SequenceMatcher(None, norm(re.sub(r'^\d+\.\s*', '', c['title'])), t).ratio(), default=None)
            if best and difflib.SequenceMatcher(None, norm(re.sub(r'^\d+\.\s*', '', best['title'])), t).ratio() > .55: sp = best
        au = next((a for a in AUD if a['live']['file'] == page and a['live']['sel'] == s['sel']), None)
        rows.append({'key': key, 'page': NAMES[page] if s['sel'] != 'section.bf-cta-shell' else 'Shared', 'file': page, 'sel': s['sel'],
                     'mode': 'section', 'title': (doc and re.sub(r'\s*\(anchor.*\)', '', doc)) or ('CTA band' if 'cta' in s['sel'] else s['sel']),
                     'h': s['h'][:110],
                     'doc': doc, 'gap': {'found': gr.get('docFound', 0), 'total': gr.get('docTotal', 0), 'missing': gr.get('docMissing', []),
                                         'visual': gr.get('visualRequired', False)},
                     'spec': sp, 'job': au and au.get('job'), 'auditProblem': au and au.get('problem'),
                     'dec': dec.get(key) or (dec.get('shared:cta') if 'cta' in s['sel'] else None),
                     'base': checks(cb, page, s['sel']), 'prop': checks(cp, page, s['sel'])})
docmiss = {p: v['docSectionsNotOnSite'] for p, v in gaps.items() if v['docSectionsNotOnSite']}
OUT = {'rows': rows, 'docSectionsNotOnSite': docmiss, 'names': NAMES}
json.dump(OUT, open('adaptive-data.json', 'w'), ensure_ascii=False, indent=1)
# The share tunnel does not serve .json, so the lab reads this script copy.
open('adaptive-data.js', 'w').write('window.ADAPTIVE_DATA = ' + json.dumps(OUT, ensure_ascii=False) + ';\n')
print(len(rows), 'rows;', sum(1 for r in rows if r['dec']), 'with decisions')
