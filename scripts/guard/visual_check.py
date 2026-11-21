#!/usr/bin/env python3
"""PR guard, part 2: the approved rules measured in a real browser, before and after the PR (owner, 19 Nov 2026).

  python3 scripts/guard/visual_check.py --base-dir <checkout of main> --head-dir <checkout of the PR> [--pages a,b]

Both checkouts are served locally and every page the PR can affect is measured with scripts/guard/audit.js at
1440x900 (desktop) and 834x1194 (tablet). Only what the PR makes worse fails, so problems that are already on main
never block an unrelated PR:

  align     split heading: the intro's letter tops level with the title's (0px; fails above 1px or when it gets worse)
  button    every action button is the primary (filled coral) or the secondary (transparent, coral border), 52px, Sofia 16
  color     running text #D7C9BD on dark, #544440 on cream
  type      hero/section/card titles, labels, intros and body on the type scale (brand-typography.css)
  line      titles start on the content line (--try-margin)
  overflow  no sideways scroll
  space     gaps against the spacing table (reported, does not fail)

Without --pages, the pages are found from the diff: a page is checked when its HTML changed or it loads a changed
CSS/JS file. Exit code 1 when a rule got worse; the report is printed as Markdown.
"""
import argparse, functools, http.server, json, os, re, subprocess, sys, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIT = open(os.path.join(HERE, 'audit.js')).read()
PAGES = ['index-v2', 'api', 'marketplace', 'personalization', 'developers', 'otas', 'airlines', 'hotels',
         'loyalty-finance', 'travel-technology', 'super-apps', 'about-us', 'careers', 'contact', 'press', 'insights']
SIZES = [(1440, 900), (834, 1194)]
FAIL = {'align', 'button', 'color', 'type', 'line', 'overflow'}


def serve(d):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    h = functools.partial(Quiet, directory=d)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{s.server_address[1]}/'


def affected(head, base_ref):
    out = subprocess.run(['git', 'diff', '--name-only', f'{base_ref}...HEAD'], cwd=head, capture_output=True, text=True).stdout.split()
    names = {os.path.basename(f) for f in out if f.endswith(('.css', '.js'))}
    paths = {f for f in out if f.endswith(('.css', '.js'))}
    pages = []
    for p in PAGES:
        f = os.path.join(head, p + '.html')
        if not os.path.exists(f):
            continue
        html = open(f, encoding='utf-8', errors='ignore').read()
        refs = set(re.findall(r'(?:href|src)="([^"?#]+\.(?:css|js))', html))
        if p + '.html' in out or refs & paths or {os.path.basename(r) for r in refs} & names:
            pages.append(p)
    # the hero frame page of AIyelet is its own document
    if 'personalization-ai-hero.html' in out and 'personalization' not in pages:
        pages.append('personalization')
    return pages


def measure(pw, url):
    b = pw.chromium.launch()
    res = {}
    for w, h in SIZES:
        ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce')
        pg = ctx.new_page()
        pg.goto(url, wait_until='networkidle', timeout=90000)
        H = pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, H, 700):
            pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(40)
        pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(1200)
        r = pg.evaluate(AUDIT)
        if r['sw'] > w + 1:
            r['issues'].append({'kind': 'overflow', 'sec': '-', 'text': '', 'msg': f'page scrolls sideways ({r["sw"]}px wide)'})
        res[f'{w}x{h}'] = r['issues']
        ctx.close()
    b.close()
    return res


def key(i):
    return '|'.join([i['kind'], i.get('sec', ''), i.get('text', '')[:30], re.sub(r'-?\d+(\.\d+)?', '#', i['msg'])])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-dir', required=True)
    ap.add_argument('--head-dir', required=True)
    ap.add_argument('--base-ref', default='origin/main')
    ap.add_argument('--pages', default='')
    o = ap.parse_args()
    pages = [p for p in o.pages.split(',') if p] or affected(o.head_dir, o.base_ref)
    print('## PR guard · approved rules in the browser\n')
    if not pages:
        print('No page loads a changed file: nothing to measure. ✅')
        return 0
    print(f'Measured at 1440×900 and 834×1194, main against this PR: {", ".join(pages)}.\n')
    bu, hu = serve(o.base_dir), serve(o.head_dir)
    worse, warn = [], []
    with sync_playwright() as pw:
        for p in pages:
            q = f'{p}.html?version=2'
            base, head = measure(pw, bu + q), measure(pw, hu + q)
            for size in head:
                bmap = {}
                for i in base.get(size, []):
                    bmap.setdefault(key(i), i)
                for i in head[size]:
                    b = bmap.get(key(i))
                    got_worse = b is None or (i['kind'] == 'align' and abs(i.get('d', 0)) > abs(b.get('d', 0)) + 1)
                    if not got_worse:
                        continue
                    row = (p, size, i)
                    (worse if i['kind'] in FAIL else warn).append(row)
    for title, rows, mark in (('Rules this PR breaks', worse, '❌'), ('Spacing to look at (does not fail)', warn, '⚠️')):
        if not rows:
            continue
        print(f'### {title}\n')
        for p, size, i in rows[:60]:
            t = f' "{i["text"]}"' if i.get('text') else ''
            print(f'- {mark} **{p}** {size} · {i["kind"]} · section `{i.get("sec", "-")}`{t}: {i["msg"]}')
        if len(rows) > 60:
            print(f'- … and {len(rows) - 60} more')
        print()
    if not worse:
        print('✅ No approved rule got worse on the measured pages.')
    return 1 if worse else 0


if __name__ == '__main__':
    sys.exit(main())
