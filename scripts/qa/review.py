#!/usr/bin/env python3
"""Before/after review + full QA for any change (owner, 22 Nov 2026). Run it before every PR.

  python3 scripts/qa/review.py                       # pages found from your changes vs origin/main
  python3 scripts/qa/review.py --pages hotels,api    # these pages
  python3 scripts/qa/review.py --all                 # every public page
  python3 scripts/qa/review.py --full                # 8 widths instead of 4 (adds 360, 834, 1280, 1920)
  python3 scripts/qa/review.py --webkit              # also Safari's engine (phone and desktop)
  python3 scripts/qa/review.py --base <ref>          # compare with another branch or commit

What it does
  1. Puts the base (origin/main by default) in a temporary checkout and serves it next to your working copy.
  2. Opens every page at phone 390, tablet 768, small desktop 1024 and desktop 1440, scrolls it so everything
     appears, and photographs each section (header, every section, footer) before and after.
  3. Marks the sections that changed (pixel difference, outlined in magenta) and folds away the ones that did not.
  4. Checks every page in the browser: sideways scroll, text past the screen edge, text cut by its box or its
     parent, overlapping text, images that fail, tiny text, fonts outside the brand, phone tap targets, headings off
     the content line, duplicate ids, console errors, failed requests (404) and broken internal links.
     Each problem is boxed in red on the screenshot and marked NEW (your change caused it) or ALREADY ON MAIN.
  5. Writes output/qa-review/<date-time>/index.html (open it in a browser) and summary.md (paste into the PR).
     Exit code 1 when your change adds an error.

Phone rules (MOBILE-RULES.md) are checked by their own tool; with --phone-rules this runs it for each page too.
"""
import argparse, datetime, functools, http.server, json, os, re, shutil, subprocess, sys, tempfile, threading, urllib.request, html as H
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AUDIT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audit.js')).read()
PAGES = ['index-v2', 'api', 'marketplace', 'personalization', 'developers', 'otas', 'airlines', 'hotels', 'loyalty-finance',
         'travel-technology', 'super-apps', 'about-us', 'careers', 'contact', 'press', 'insights', 'demo', 'login',
         'job?role=senior-backend-engineer', 'blog-aggregation', 'blog-infrastructure']
WIDTHS = [(390, 844), (768, 1024), (1024, 768), (1440, 900)]
FULL = [(360, 740), (390, 844), (768, 1024), (834, 1194), (1024, 768), (1280, 800), (1440, 900), (1920, 1080)]
SHOW = {360: 260, 390: 280, 768: 400, 834: 420, 1024: 480, 1280: 560, 1440: 600, 1920: 680}   # display width per screen
CAP = 2600   # tallest section photographed, in CSS px
CHG = 0.08   # a section counts as changed when more than this % of its pixels differ


def git(*a, cwd=ROOT):
    return subprocess.check_output(['git', *a], cwd=cwd, text=True).strip()


def serve(d):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    class Server(http.server.ThreadingHTTPServer):
        def handle_error(self, *a):   # the browser closing a connection early is not a problem
            pass
    s = Server(('127.0.0.1', 0), functools.partial(Quiet, directory=d))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{s.server_address[1]}'


def url_of(p):
    name, _, q = p.partition('?')
    name = name[:-5] if name.endswith('.html') else name
    return f"{name}.html?{q + '&' if q else ''}version=2"


def changed_pages(base):
    files = set(git('diff', '--name-only', f'{base}...HEAD').split()) | set(git('diff', '--name-only').split()) | \
        set(l[3:] for l in git('status', '--porcelain').splitlines() if l[:2].strip() in ('M', 'A', '??', 'AM', 'MM'))
    files = {f for f in files if not f.startswith(('output/', 'scripts/', '.')) and not f.endswith('.md')}
    pages = set()
    names = {p.split('?')[0]: p for p in PAGES}
    for f in files:
        b = os.path.basename(f)
        stem = b.rsplit('.', 1)[0]
        if f.endswith('.html') and stem in names:
            pages.add(names[stem]); continue
        if f.startswith(('wide/pages/', 'mobile/pages/')) and stem in names:
            pages.add(names[stem]); continue
        if f.endswith(('.css', '.js', '.svg', '.png', '.jpg', '.webp', '.html')):
            for n, p in names.items():
                fp = os.path.join(ROOT, n + '.html')
                if os.path.exists(fp) and (b in open(fp, encoding='utf-8', errors='ignore').read()):
                    pages.add(p)
    return sorted(pages, key=lambda p: PAGES.index(p) if p in PAGES else 99), sorted(files)


def settle(pg):
    H_ = pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0, H_ + 800, 450):
        pg.evaluate(f"scrollTo({{top:{y},behavior:'instant'}})"); pg.wait_for_timeout(70)
    pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(900)


def visit(browser, base, page, w, h, motion):
    phone = w < 600
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=phone and browser.browser_type.name == 'chromium',
                              has_touch=phone, reduced_motion='no-preference' if motion else 'reduce')
    pg = ctx.new_page(); errs, bad = [], []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text[:200]))
    pg.on('response', lambda r: r.status >= 400 and r.url.startswith(base) and bad.append(f'{r.status} {r.url[len(base):]}'))
    pg.on('requestfailed', lambda r: r.url.startswith(base) and bad.append(f'failed {r.url[len(base):]}'))
    pg.goto(f'{base}/{url_of(page)}', wait_until='networkidle', timeout=60000)
    settle(pg)
    res = pg.evaluate(AUDIT, {})
    shots = {}
    for s in res['sections']:
        r = s['rect']; hh = min(r['h'], CAP)
        if hh < 8:
            continue
        pg.evaluate(f"scrollTo({{top:{max(0, r['y'] - 100)},behavior:'instant'}})"); pg.wait_for_timeout(250)
        p = tempfile.mktemp(suffix='.png')
        pg.screenshot(path=p, full_page=True, clip={'x': 0, 'y': r['y'], 'width': w, 'height': hh})
        shots[s['key']] = p
    for e in errs:
        res['issues'].append({'type': 'console', 'level': 'error', 'section': '(page)', 'sel': '', 'text': '', 'msg': e, 'rect': None})
    for b in sorted(set(bad)):
        res['issues'].append({'type': 'request', 'level': 'error', 'section': '(page)', 'sel': '', 'text': '', 'msg': b, 'rect': None})
    ctx.close()
    return res, shots


def check_links(base, links, cache):
    out = []
    for l in links:
        u = l.split('?')[0]
        if u not in cache:
            try:
                req = urllib.request.Request(u, method='HEAD'); cache[u] = urllib.request.urlopen(req, timeout=10).status
            except Exception as e:
                cache[u] = getattr(e, 'code', 0)
        if cache[u] >= 400 or cache[u] == 0:
            out.append({'type': 'link', 'level': 'error', 'section': '(page)', 'sel': '', 'text': '', 'msg': f'broken link {u[len(base):]} ({cache[u]})', 'rect': None})
    return out


def group(items):
    """Same problem on several elements (e.g. nine map pins) -> one line with a count."""
    out = {}
    for d, i in items:
        k = (d['page'], d['w'], d['eng'], i['type'], i['section'], i['sel'], re.sub(r'[0-9.]+px', '#', i['msg']), i['new'])
        if k in out:
            out[k][2] += 1
        else:
            out[k] = [d, i, 1]
    return list(out.values())


def ikey(i):
    return (i['type'], i['section'], i['sel'], i['text'][:40], i['msg'] if i['type'] in ('hscroll', 'console', 'request', 'link', 'duplicate-id', 'image') else '')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--base', default='origin/main'); ap.add_argument('--pages'); ap.add_argument('--all', action='store_true')
    ap.add_argument('--full', action='store_true'); ap.add_argument('--webkit', action='store_true'); ap.add_argument('--motion', action='store_true')
    ap.add_argument('--phone-rules', action='store_true'); ap.add_argument('--out')
    a = ap.parse_args()
    try:
        git('fetch', '-q', 'origin')
    except Exception:
        pass
    pages, files = (a.pages.split(','), []) if a.pages else (PAGES, []) if a.all else changed_pages(a.base)
    if not pages:
        print('No page is affected by your changes (vs %s). Use --pages or --all.' % a.base); return 0
    stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M')
    out = a.out or os.path.join(ROOT, 'output', 'qa-review', stamp); os.makedirs(os.path.join(out, 'img'), exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='qa-base-')
    git('worktree', 'add', '-q', '--detach', tmp, a.base)
    sides = {'before': serve(tmp), 'after': serve(ROOT)}
    widths = FULL if a.full else WIDTHS
    engines = ['chromium'] + (['webkit'] if a.webkit else [])
    print(f'Comparing {a.base} → your working copy · pages: {", ".join(pages)} · widths: {", ".join(str(w) for w, _ in widths)}')
    data, cache = [], {}
    try:
        with sync_playwright() as p:
            for eng in engines:
                br = getattr(p, eng).launch()
                for page in pages:
                    for w, h in (widths if eng == 'chromium' else [(390, 844), (1440, 900)]):
                        res = {s: visit(br, sides[s], page, w, h, a.motion) for s in sides}
                        if w == 1440 and eng == 'chromium':
                            res['after'][0]['issues'] += check_links(sides['after'], res['after'][0]['links'], cache)
                            res['before'][0]['issues'] += check_links(sides['before'], res['before'][0]['links'], {})
                        data.append(compare(page, eng, w, res, out))
                        d = data[-1]
                        print(f"  {page:<32} {eng:<8} {w:>5}  changed {len(d['changed']):>2}/{len(d['secs'])}  new errors {d['new_err']}  new warnings {d['new_warn']}")
                br.close()
    finally:
        subprocess.run(['git', 'worktree', 'remove', '--force', tmp], cwd=ROOT)
    phone = run_phone_rules(pages, sides['after']) if a.phone_rules else None
    write_report(out, a, pages, files, data, phone)
    print(f'\nReport: {os.path.join(out, "index.html")}\nSummary for the PR: {os.path.join(out, "summary.md")}')
    return 1 if any(d['new_err'] for d in data) else 0


def compare(page, eng, w, res, out):
    (B, bshots), (A, ashots) = res['before'], res['after']
    bkeys = {ikey(i) for i in B['issues']}
    for i in A['issues']:
        i['new'] = ikey(i) not in bkeys
    secs = []
    slug = re.sub(r'[^a-z0-9]+', '-', f'{page}-{eng}-{w}'.lower())
    for k, s in enumerate(A['sections']):
        key = s['key']; ap_ = ashots.get(key); bp = bshots.get(key)
        if not ap_:
            continue
        box = None
        ia = Image.open(ap_).convert('RGB'); ib = Image.open(bp).convert('RGB') if bp else None
        if ib is None:
            pct = 100.0
        elif ib.size != ia.size:
            pct = 100.0
        else:
            # soften 1px anti-aliasing and image smoothing first, so only real changes count
            diff = ImageChops.difference(ia.filter(ImageFilter.BoxBlur(2)), ib.filter(ImageFilter.BoxBlur(2))).convert('L').point(lambda v: 255 if v > 40 else 0)
            pct = 100.0 * sum(diff.histogram()[255:]) / (ia.width * ia.height)
            box = diff.getbbox()
        sw = SHOW.get(w, 400); sc = sw / w
        da = ImageDraw.Draw(ia)
        if ib is not None and ib.size == ia.size and pct > CHG and box:
            da.rectangle(box, outline=(255, 0, 200), width=max(2, int(2 / sc)))
        own = [i for i in A['issues'] if i['section'] == key and i['rect']]
        for i in own:
            for rr in [i['rect']] + ([i['rect2']] if i.get('rect2') else []):
                x0, y0 = rr['x'], rr['y'] - s['rect']['y']
                da.rectangle((x0, y0, x0 + rr['w'], y0 + rr['h']), outline=(255, 40, 40) if i['level'] == 'error' else (255, 190, 0), width=max(2, int(2 / sc)))
        name = f"{slug}-{k:02d}"
        ia.resize((sw, max(1, int(ia.height * sc)))).save(os.path.join(out, 'img', name + '-a.jpg'), quality=78)
        if ib is not None:
            ib.resize((sw, max(1, int(ib.height * sc)))).save(os.path.join(out, 'img', name + '-b.jpg'), quality=78)
        secs.append({'key': key, 'pct': round(pct, 2), 'img': name, 'has_before': ib is not None, 'issues': own})
        os.remove(ap_)
    for f in bshots.values():
        if os.path.exists(f):
            os.remove(f)
    gone = [s['key'] for s in B['sections'] if s['key'] not in {x['key'] for x in A['sections']}]
    changed = [s for s in secs if s['pct'] > CHG]
    new = [i for i in A['issues'] if i['new']]
    return {'page': page, 'eng': eng, 'w': w, 'secs': secs, 'changed': changed, 'gone': gone, 'issues': A['issues'],
            'fixed': [i for i in B['issues'] if ikey(i) not in {ikey(j) for j in A['issues']}],
            'new_err': sum(i['level'] == 'error' for i in new), 'new_warn': sum(i['level'] == 'warn' for i in new)}


def run_phone_rules(pages, base):
    chk = os.path.join(ROOT, 'output', 'element-lab', 'adaptive', 'system', 'check.py')
    if not os.path.exists(chk):
        return None
    res = {}
    for p in pages:
        n = p.split('?')[0]
        for eng, dev in (('webkit', 'iPhone 13'), ('chromium', 'Pixel 7')):
            r = subprocess.run([sys.executable, chk, '--page', n, '--engine', eng, '--device', dev, '--base', base], capture_output=True, text=True, cwd=os.path.dirname(chk))
            bad = [l for l in r.stdout.splitlines() if '✗' in l]
            res[f'{n} · {dev}'] = bad if r.returncode in (0, 1) else [f'could not run: {r.stderr.strip()[-200:]}']
    return res


CSS = """
:root{--bg:#160e0d;--panel:#211716;--line:#3a2b29;--ink:#eee9de;--mute:#b5a79c;--coral:#f46649;--red:#ff4b4b;--amber:#ffbe2e;--green:#57c98a;--pink:#ff00c8}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 -apple-system,system-ui,sans-serif}
header.top{position:sticky;top:0;z-index:5;background:#120b0aee;backdrop-filter:blur(6px);border-bottom:1px solid var(--line);padding:12px 20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
h1{font-size:18px;margin:0}h2{font-size:17px;margin:32px 0 8px}h3{font-size:14px;margin:18px 0 8px;color:var(--mute);font-weight:600}
main{padding:12px 20px 80px;max-width:2000px}table{border-collapse:collapse;margin:8px 0 16px}td,th{border:1px solid var(--line);padding:5px 10px;text-align:left;vertical-align:top}
th{background:var(--panel);font-weight:600}.e{color:var(--red);font-weight:700}.w{color:var(--amber)}.ok{color:var(--green)}.m{color:var(--mute)}
.pill{display:inline-block;padding:1px 8px;border-radius:9px;font-size:12px;border:1px solid var(--line)}.new{background:#ff4b4b22;border-color:var(--red);color:#ffb3b3}.old{color:var(--mute)}
.row{display:flex;gap:18px;align-items:flex-start;overflow-x:auto;padding:8px 0}.cell{flex:none}.cell .lab{font-size:12px;color:var(--mute);margin-bottom:4px}
.cell img{display:block;border:1px solid var(--line);border-radius:6px}.pair{display:flex;gap:8px}.sec{border:1px solid var(--line);border-radius:10px;margin:10px 0;padding:6px 12px;background:var(--panel)}
.sec>summary{cursor:pointer;font-weight:600;padding:4px 0}.chg{color:var(--pink)}.legend span{margin-right:14px}a{color:#ffb194}
select,label{font:inherit;color:inherit;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:3px 6px}
ul.iss{margin:6px 0 10px;padding-left:18px}ul.iss li{margin:2px 0}code{font-size:12px;color:#ffcfbf}
"""


def write_report(out, a, pages, files, data, phone):
    E = H.escape
    tot_err = sum(d['new_err'] for d in data); tot_warn = sum(d['new_warn'] for d in data)
    widths = sorted({d['w'] for d in data})
    md = [f"### Before/after + QA · `{a.base}` → this branch", '',
          f"Pages: {', '.join(pages)} · widths: {', '.join(map(str, widths))}" + (' · WebKit too' if a.webkit else ''), '',
          f"**New errors: {tot_err} · new warnings: {tot_warn}**", '', '| Page | Width | Sections changed | New errors | New warnings | Fixed |', '|---|---|---|---|---|---|']
    for d in data:
        md.append(f"| {d['page']} | {d['w']}{' (WebKit)' if d['eng'] == 'webkit' else ''} | {len(d['changed'])}/{len(d['secs'])} {', '.join(s['key'] for s in d['changed'])[:120]} | {d['new_err']} | {d['new_warn']} | {len(d['fixed'])} |")
    newl = [(d, i) for d in data for i in d['issues'] if i['new']]
    if newl:
        md += ['', '**New problems**', '']
        for d, i, n in group(newl)[:60]:
            md.append(f"- {'❌' if i['level'] == 'error' else '⚠️'} {d['page']} @{d['w']}{' WebKit' if d['eng'] == 'webkit' else ''} · {i['section']} · {i['type']}: {i['msg']} {('· `' + i['sel'] + '`') if i['sel'] else ''}{f' · ×{n}' if n > 1 else ''}")
    if phone:
        md += ['', '**Phone rules (MOBILE-RULES.md)**', ''] + [f"- {k}: {'✅ 0 issues' if not v else '❌ ' + '; '.join(v)[:300]}" for k, v in phone.items()]
    open(os.path.join(out, 'summary.md'), 'w').write('\n'.join(md) + '\n')

    h = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA review {E(os.path.basename(out))}</title><style>{CSS}</style></head><body>',
         f'<header class="top"><h1>Before / after + QA</h1><span class="m">{E(a.base)} → working copy · {datetime.datetime.now():%d %b %Y %H:%M}</span>',
         f'<span class="{"e" if tot_err else "ok"}">new errors {tot_err}</span><span class="{"w" if tot_warn else "ok"}">new warnings {tot_warn}</span>',
         '<label><input type="checkbox" id="onlychg" checked> only changed sections</label><label><input type="checkbox" id="onlynew"> only new problems</label>',
         '<span class="legend m"><span><b class="chg">■</b> what changed</span><span><b class="e">■</b> error</span><span><b class="w">■</b> warning</span></span></header><main>']
    h.append('<h2>Summary</h2><table><tr><th>Page</th><th>Width</th><th>Sections changed</th><th>New errors</th><th>New warnings</th><th>Fixed by this change</th></tr>')
    for d in data:
        h.append(f"<tr><td><a href='#{E(d['page'])}'>{E(d['page'])}</a></td><td>{d['w']}{' WebKit' if d['eng'] == 'webkit' else ''}</td><td>{len(d['changed'])}/{len(d['secs'])}</td>"
                 f"<td class='{'e' if d['new_err'] else 'ok'}'>{d['new_err']}</td><td class='{'w' if d['new_warn'] else 'ok'}'>{d['new_warn']}</td><td class='ok'>{len(d['fixed']) or ''}</td></tr>")
    h.append('</table>')
    if files:
        h.append('<details><summary class="m">Files changed (' + str(len(files)) + ')</summary><p><code>' + '<br>'.join(E(f) for f in files) + '</code></p></details>')
    if phone:
        h.append('<h3>Phone rules (MOBILE-RULES.md, check.py)</h3><ul class="iss">' + ''.join(f"<li>{E(k)}: " + ("<span class='ok'>0 issues</span>" if not v else "<span class='e'>" + E('; '.join(v)) + '</span>') + '</li>' for k, v in phone.items()) + '</ul>')
    for page in pages:
        dd = [d for d in data if d['page'] == page]
        h.append(f"<h2 id='{E(page)}'>{E(page)}</h2>")
        pi = [(d, i) for d in dd for i in d['issues'] if i['section'] == '(page)']
        if pi:
            h.append('<ul class="iss">' + ''.join(f"<li data-new='{int(i['new'])}'><span class='pill {'new' if i['new'] else 'old'}'>{'NEW' if i['new'] else 'already on main'}</span> <span class='{'e' if i['level'] == 'error' else 'w'}'>{E(i['type'])}</span> @{d['w']}{' WebKit' if d['eng'] == 'webkit' else ''}: {E(i['msg'])}</li>" for d, i in pi) + '</ul>')
        gone = sorted({g for d in dd for g in d['gone']})
        if gone:
            h.append(f"<p class='w'>Sections that are gone after the change: {E(', '.join(gone))}</p>")
        keys = []
        for d in dd:
            for s in d['secs']:
                if s['key'] not in keys:
                    keys.append(s['key'])
        for key in keys:
            rows = [(d, next((s for s in d['secs'] if s['key'] == key), None)) for d in dd]
            changed = any(s and s['pct'] > CHG for _, s in rows)
            iss = [(d, i) for d, s in rows if s for i in s['issues']]
            newc = sum(i['new'] for _, i in iss)
            tag = (f"<span class='chg'>changed</span> " if changed else "<span class='m'>no visual change</span> ") + \
                  (f"<span class='pill new'>{newc} new problem{'s' if newc > 1 else ''}</span> " if newc else '') + (f"<span class='pill old'>{len(iss) - newc} already on main</span>" if len(iss) - newc else '')
            h.append(f"<details class='sec' data-chg='{int(changed)}' data-new='{int(bool(newc))}' {'open' if changed or newc else ''}><summary>{E(key)} · {tag}</summary>")
            if iss:
                h.append('<ul class="iss">' + ''.join(f"<li data-new='{int(i['new'])}'><span class='pill {'new' if i['new'] else 'old'}'>{'NEW' if i['new'] else 'already on main'}</span> <span class='{'e' if i['level'] == 'error' else 'w'}'>{E(i['type'])}</span> @{d['w']}{' WebKit' if d['eng'] == 'webkit' else ''}: {E(i['msg'])} <code>{E(i['sel'])}</code> {('“' + E(i['text'][:50]) + '”') if i['text'] else ''}{f' <b>×{n}</b>' if n > 1 else ''}</li>" for d, i, n in group(iss)[:80]) + '</ul>')
            h.append('<div class="row">')
            for d, s in rows:
                if not s:
                    continue
                lab = f"{d['w']}{' WebKit' if d['eng'] == 'webkit' else ''}" + (f" · <span class='chg'>{s['pct']}% changed</span>" if s['pct'] > CHG else '')
                h.append(f"<div class='cell'><div class='lab'>{lab}</div><div class='pair'>")
                if s['has_before']:
                    h.append(f"<div><div class='lab'>before</div><img loading='lazy' src='img/{s['img']}-b.jpg'></div>")
                h.append(f"<div><div class='lab'>after</div><img loading='lazy' src='img/{s['img']}-a.jpg'></div></div></div>")
            h.append('</div></details>')
    h.append("""</main><script>
const f=()=>{const c=document.getElementById('onlychg').checked,n=document.getElementById('onlynew').checked;
document.querySelectorAll('details.sec').forEach(d=>{d.style.display=(c&&d.dataset.chg==='0'&&d.dataset.new==='0')||(n&&d.dataset.new==='0')?'none':''});
document.querySelectorAll('li[data-new]').forEach(l=>{l.style.display=n&&l.dataset.new==='0'?'none':''})};
document.querySelectorAll('header input').forEach(i=>i.onchange=f);f();</script></body></html>""")
    open(os.path.join(out, 'index.html'), 'w').write('\n'.join(h))


if __name__ == '__main__':
    sys.exit(main())
