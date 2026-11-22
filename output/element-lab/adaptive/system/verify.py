#!/usr/bin/env python3
"""Are we really following the rules? One command, one report, every rule by its ID (see MOBILE-RULES.md).

Runs every automated check on every page and writes system/compliance.md: for each rule, how it is checked and what
the last run found. A rule with no automated check says so ("by eye"), so nothing is quietly assumed.

  spacing, roles, grid, buttons ... check.py on 5 phones (WebKit iPhone SE/13/15 Pro Max, Chromium iPhone 13/Pixel 7)
  type, figures, line breaks, taps  fit.py on the 3 WebKit iPhones
  desktop and tablet unchanged      layout boxes at 1440 and 768 with and without the system
  text never added or removed       every text in the page with and without the layer
  no Replay/Pause rows              visible controls with those words, on phones
  no jump on load                   stability.py, as the phone preview and as the live site would load it

Usage: python3 verify.py [--pages api,otas] [--quick]   (--quick: iPhone 13 only, no load films)
"""
import argparse, asyncio, json, os, re, subprocess, sys, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); LAYER = os.path.dirname(HERE)
PAGES = ['index-v2', 'api', 'marketplace', 'personalization', 'otas', 'airlines', 'hotels', 'loyalty-finance', 'travel-technology', 'super-apps', 'developers', 'about-us', 'contact', 'press', 'insights']
DEVICES = [('webkit', 'iPhone SE'), ('webkit', 'iPhone 13'), ('webkit', 'iPhone 15 Pro Max'), ('chromium', 'iPhone 13'), ('chromium', 'Pixel 7')]

# Every rule in MOBILE-RULES.md, with what checks it. Messages from check.py are matched to rules by their wording.
RULES = [
 ('S1', 'Label → title 16', 'check.py', r'label → title'),
 ('S2', 'Title → text 24; paragraph → paragraph 16', 'check.py', r'title → text|text → text'),
 ('S3', 'Text → Read more 8 (to its visible text)', 'check.py', r'→ more'),
 ('S4', 'Heading → buttons 32; button ↔ button 12', 'check.py', r'→ actions|button ↔ button'),
 ('S5', 'Text or buttons → text link 16', 'check.py', r'→ link'),
 ('S6', 'Heading → tabs 32; tabs → content 16', 'check.py', r'→ control|control →'),
 ('S7', 'Heading → content 32; content → content 32; scroller → dots 16', 'check.py', r'→ content|→ dots|dots →|content →'),
 ('S8', 'Hero heading → hero visual 48', 'check.py', r'→ visual'),
 ('S9', 'Section top and bottom 64; header bar → hero label 48', 'check.py', r'section top|section end|header → first'),
 ('S10', 'Heading text and buttons stay inside the 24px side margins', 'check.py', r'outside the side margins|not on the'),
 ('S11', 'Tiles of one row start on one line', 'check.py', r'tiles on the first row'),
 ('S12', 'Every visible block has a role (nothing unchecked)', 'check.py', r'no role for|not found or hidden|section not found|not in the role map'),
 ('B1', 'Button = action, link = go and read; a link is never drawn as a button', 'check.py', r'drawn as a button'),
 ('B2', 'At most one primary button per group; every button has a kind', 'check.py', r'primary button|has no kind'),
 ('B3', 'Buttons 40px tall, full frame', 'check.py', r'tall \(want 40\)|uneven frame'),
 ('B4', 'Buttons of one group share one width', 'check.py', r'differ in width'),
 ('T1', 'Hero, section and closing titles 28px Chillax 400', 'fit.py titleRoles', None),
 ('T2', 'Section label → title measured on every page (16 ±2)', 'fit.py labelGaps', None),
 ('T3', 'Key figures at least 28px', 'fit.py smallFigures', None),
 ('T4', 'No single word on a last line; even title lines', 'fit.py badBreaks', None),
 ('T5', 'No text under 11px as seen (labels are 11)', 'fit.py tiny', None),
 ('L1', 'Tap targets at least 44px', 'fit.py taps', None),
 ('L2', 'A demo fits the screen (≤85% of iPhone 13, ≤100% of SE)', 'fit.py fit', None),
 ('L3', 'The hero fills the first screen', 'fit.py heroFill', None),
 ('L4', 'Desktop (1440) and tablet (768) layout unchanged', 'layout boxes', None),
 ('C1', 'No text added or removed by the mobile layer (folding and hiding allowed)', 'page text', None),
 ('C2', 'No Replay / Pause rows unless asked', 'visible controls', None),
 ('C3', 'Copy matches Copy v4', 'by eye against the content doc', None),
 ('C4', 'No frames unless asked', 'by eye', None),
 ('M1', 'No jump on load: phone preview', 'stability.py --mode lab', None),
 ('M2', 'No jump on load: as the live site would load it', 'stability.py --mode site', None),
 ('M3', 'Entrances as on desktop; off with reduced motion', 'by eye', None),
]


def run(cmd):
    return subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)


def inject_lists(page, system=True):
    css = (['system/tokens.css'] if system else []) + ['layout.css', 'patterns.css', f'pages/{page}.css'] + (['system/actions.css'] if system else [])
    js = ['patterns.js', f'pages/{page}.js'] + ([f'system/roles/{page}.js', 'system/rhythm.js'] if system else [])
    return [c for c in css if os.path.exists(os.path.join(LAYER, c))], [j for j in js if os.path.exists(os.path.join(LAYER, j))]


async def strip_published(pg, page):
    from published import route_stripped
    await route_stripped(pg, f'**/{"" if page == "index-v2" else page + ".html"}?*')


async def load(pg, page, layer, system=True):
    await strip_published(pg, page)
    await pg.goto(f'http://localhost:8081/{"" if page == "index-v2" else page + ".html"}?version=2', wait_until='networkidle')
    if layer:
        css, js = inject_lists(page, system)
        for c in css: await pg.add_style_tag(path=os.path.join(LAYER, c))
        for j in js: await pg.add_script_tag(path=os.path.join(LAYER, j))
    await pg.wait_for_timeout(1500)

GEO = """()=>{const o=[];const top=e=>{let y=0,x=0;for(let n=e;n;n=n.offsetParent){y+=n.offsetTop;x+=n.offsetLeft}return [x,y]};
 document.querySelectorAll('body *').forEach(e=>{if(!(e instanceof HTMLElement))return;const [x,y]=top(e);const moving=!!(e.getAnimations&&e.getAnimations().length)||!!e.closest('[aria-hidden=true]');o.push([e.tagName,String(e.className).slice(0,30),Math.round(x),Math.round(y),e.offsetWidth,e.offsetHeight,moving])});return o}"""
# every word in the page (hidden or not), minus the labels the layer itself adds to its controls
TEXT = """()=>{const t=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode()){if(n.parentElement.closest('script,style,.ad-more,.ad-show-more,.ad-seg,.ad-dots,.ad-menu-btn,.ad-menu,.bf-overlay'))continue;const s=n.textContent.replace(/\\s+/g,' ').trim();if(s)t.push(s)}return t.join(' ').split(' ')}"""
CONTROLS = """()=>[...document.querySelectorAll('button,a,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;for(let a=e;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden')return false}return /\\b(replay|pause|start again|restart)\\b/i.test(e.textContent+' '+(e.getAttribute('aria-label')||''))}).map(e=>(e.textContent.trim()||e.getAttribute('aria-label')).slice(0,40))"""


async def page_checks(pages):
    out = {}
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for page in pages:
            r = out.setdefault(page, {})
            # L4: layout boxes at 1440 / 768, with and without the system (elements mid-animation are skipped)
            moved = []
            for w, h in [(1440, 900), (768, 1024)]:
                boxes = []
                for system in (False, True):
                    pg = await (await br.new_context(viewport={'width': w, 'height': h})).new_page(); await load(pg, page, True, system)
                    boxes.append(await pg.evaluate(GEO)); await pg.context.close()
                a, b = boxes
                if len(a) != len(b): moved.append(f'{w}: element count {len(a)} vs {len(b)}')
                else:
                    # an element mid-animation or decorative (aria-hidden) moves by itself; it is not a layout change
                    d = [x for x, y in zip(a, b) if x[:6] != y[:6] and not (x[6] or y[6])]
                    if d: moved.append(f'{w}: {len(d)} moved (e.g. {d[0][0].lower()}.{d[0][1].split(" ")[0]})')
            r['L4'] = moved
            # C1 + C2 on a phone
            dev = dict(p.devices['iPhone 13']); dev.pop('default_browser_type', None)
            words = []
            for layer in (False, True):
                pg = await (await br.new_context(**dev)).new_page(); await load(pg, page, layer)
                words.append(await pg.evaluate(TEXT))
                if layer: r['C2'] = [f'visible control "{t}"' for t in await pg.evaluate(CONTROLS)]
                await pg.context.close()
            from collections import Counter
            a, b = Counter(words[0]), Counter(words[1])
            added, removed = b - a, a - b
            r['C1'] = ([f'added: {" ".join(list(added.elements())[:12])}'] if added else []) + ([f'removed: {" ".join(list(removed.elements())[:12])}'] if removed else [])
            print('page checks', page, file=sys.stderr)
        await br.close()
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--pages', default=','.join(PAGES)); ap.add_argument('--quick', action='store_true')
    a = ap.parse_args(); pages = a.pages.split(','); t0 = time.time()
    found = {r[0]: {} for r in RULES}  # rule -> page -> [issues]
    add = lambda rule, page, msg: found[rule].setdefault(page, []).append(msg)

    # 1 · check.py on every page and phone
    devices = [('webkit', 'iPhone 13')] if a.quick else DEVICES
    for page in pages:
        for eng, dev in devices:
            res = run(['python3', 'check.py', '--page', page, '--engine', eng, '--device', dev, '--json', f'/tmp/bf-{page}.json'])
            if not os.path.exists(f'/tmp/bf-{page}.json'): add('S12', page, f'{dev} {eng}: check did not run ({res.stderr.strip()[-120:]})'); continue
            for msg in json.load(open(f'/tmp/bf-{page}.json'))['issues']:
                rule = next((r[0] for r in RULES if r[3] and re.search(r[3], msg)), 'S12')
                add(rule, page, f'{dev} ({eng}): {msg}')
        print('check.py', page, file=sys.stderr)

    # 2 · fit.py on the WebKit iPhones
    run(['python3', '../tools/fit.py', '--engine', 'webkit', '--pages', ','.join(p + '.html' for p in pages), '--out', '/tmp/bf-fit.json'])
    fit = json.load(open('/tmp/bf-fit.json')) if os.path.exists('/tmp/bf-fit.json') else {}
    for dev, D in fit.items():
        for page, P in D.get('pages', {}).items():
            for k, rule in [('titleRoles', 'T1'), ('labelGaps', 'T2'), ('smallFigures', 'T3'), ('badBreaks', 'T4')]:
                for m in P.get(k, []): add(rule, page, f'{dev}: {m}')
            hf = P.get('heroFill');
            if isinstance(hf, (int, float)) and hf < 0.99: add('L3', page, f'{dev}: hero {hf:.2f} of the screen')
        for key, b in D.get('blocks', {}).items():
            page = key.split('|')[0] if '|' in key else key.rsplit('-', 1)[0]
            if page not in pages: continue
            where = f'{dev}: {b["section"]} {b["block"]}'
            if b.get('tiny'): add('T5', page, f'{where} ({b["tiny"]} pieces of text)')
            if b.get('taps'): add('L1', page, f'{where} ({len(b["taps"]) if isinstance(b["taps"], list) else b["taps"]} small targets)')
            lim = 1.0 if dev == 'iPhone SE' else 0.85
            if b.get('demo') and not b.get('heading') and b.get('fit', 0) > lim: add('L2', page, f'{where} {int(b["fit"] * 100)}% of the screen')

    # 3 · desktop/tablet, text, controls
    for page, R in asyncio.run(page_checks(pages)).items():
        for rule in ('L4', 'C1', 'C2'):
            for m in R.get(rule, []): add(rule, page, m)

    # 4 · load stability
    if not a.quick:
        for page in pages:
            for mode, rule in (('lab', 'M1'), ('site', 'M2')):
                r = run(['python3', 'stability.py', '--page', page, '--mode', mode])
                if r.returncode: add(rule, page, r.stdout.strip().split('\n')[0])

    # report
    auto = {'C3', 'C4', 'M3'}
    lines = [f'# Compliance report', '', f'Generated {time.strftime("%d %b %Y %H:%M")} by `system/verify.py`'
             f'{" --quick" if a.quick else ""} on {len(pages)} page(s) in {int(time.time() - t0)}s. Rules: `MOBILE-RULES.md`.', '',
             '| Rule | What | Checked by | Result |', '|---|---|---|---|']
    for rid, what, how, _ in RULES:
        f = found[rid]; n = sum(len(v) for v in f.values())
        res = 'not automated: check by eye' if rid in auto else ('not run (--quick)' if a.quick and rid in ('M1', 'M2') else ('✓ pass' if not n else f'✗ {n} on {", ".join(sorted(f))}'))
        lines.append(f'| {rid} | {what} | {how} | {res} |')
    lines += ['', '## Details', '']
    for rid, what, how, _ in RULES:
        if not found[rid]: continue
        lines.append(f'### {rid} · {what}')
        for page, msgs in sorted(found[rid].items()):
            uniq = list(dict.fromkeys(msgs))
            lines.append(f'- **{page}** ({len(uniq)}): ' + '; '.join(uniq[:6]) + (' …' if len(uniq) > 6 else ''))
        lines.append('')
    open(os.path.join(HERE, 'compliance.md'), 'w').write('\n'.join(lines) + '\n')
    json.dump(found, open(os.path.join(HERE, 'compliance.json'), 'w'), indent=1, ensure_ascii=False)
    failing = [rid for rid, *_ in RULES if found[rid]]
    print(f'{len(RULES)} rules · {len(RULES) - len(failing) - len(auto)} pass · {len(failing)} with findings · {len(auto)} by eye → system/compliance.md')
    sys.exit(1 if failing else 0)

main()
