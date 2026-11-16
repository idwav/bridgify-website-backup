#!/usr/bin/env python3
"""Load stability: does the page change after the reader first sees it?

Loads the page on a slow 4G-like link (150ms latency, 1.6 Mb/s) and films it every ~200ms from the first frame with
content until it settles, then compares every frame to the final one.

  --mode site   the layer is in the page the way the live site would carry it: CSS in <head>, scripts at the end of
                <body>. This is the real test for implementation: anything that changes here will jump on the site.
  --mode lab    the phone preview (phone.html), which must show the final design from its first visible frame.

A frame "differs" when its mean pixel difference from the final frame is over 3 (out of 255). Entrance animations
also count, so read the strip (--strip) before blaming the layout. Exit code 1 when a visible frame differs.

Usage: python3 stability.py --page api [--mode site|lab] [--strip out.png]
"""
import argparse, asyncio, io, os, sys, time
from playwright.async_api import async_playwright
from PIL import Image, ImageChops, ImageStat, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__)); LAYER = os.path.dirname(HERE); LB = '/output/element-lab/adaptive/'


def files(n):
    css = ['system/tokens.css', 'layout.css', 'patterns.css', f'pages/{n}.css', 'system/actions.css']
    js = ['patterns.js', f'pages/{n}.js', f'system/roles/{n}.js', 'system/rhythm.js']
    return [c for c in css if os.path.exists(os.path.join(LAYER, c))], [j for j in js if os.path.exists(os.path.join(LAYER, j))]


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', required=True); ap.add_argument('--mode', default='site')
    ap.add_argument('--base', default='http://localhost:8081'); ap.add_argument('--strip'); a = ap.parse_args()
    n = a.page
    async with async_playwright() as p:
        br = await p.chromium.launch(); d = dict(p.devices['iPhone 13']); d.pop('default_browser_type', None)
        ctx = await br.new_context(**d); pg = await ctx.new_page()
        page_url = f'{a.base}/{"" if n == "index-v2" else n + ".html"}?version=2'
        if a.mode == 'site':
            css, js = files(n)
            async def h(route):
                r = await route.fetch(); body = await r.text()
                body = body.replace('</head>', ''.join(f'<link rel="stylesheet" href="{LB}{c}">' for c in css) + '</head>', 1)
                body = body.replace('</body>', ''.join(f'<script src="{LB}{j}"></script>' for j in js) + '</body>', 1)
                await route.fulfill(response=r, body=body)
            await pg.route(page_url, h); url = page_url
        else:
            url = f'{a.base}/output/element-lab/phone.html?page={"index-v2.html" if n == "index-v2" else n + ".html"}'
        cdp = await ctx.new_cdp_session(pg); await cdp.send('Network.enable')
        await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150, 'downloadThroughput': 1.6e6, 'uploadThroughput': 7.5e5})
        frames = []; t0 = time.time(); await pg.goto(url, wait_until='commit')
        while time.time() - t0 < 9:
            try:
                b = await pg.screenshot(timeout=3000); frames.append((round(time.time() - t0, 1), Image.open(io.BytesIO(b)).convert('RGB').resize((130, 221))))
            except Exception: pass
            await asyncio.sleep(0.2)
        await pg.wait_for_timeout(2000); fin = Image.open(io.BytesIO(await pg.screenshot())).convert('RGB').resize((130, 221))
        await br.close()
    blank = lambda im: ImageStat.Stat(im.convert('L')).stddev[0] < 6          # an empty or single-colour frame
    seen = [(t, f) for t, f in frames if not blank(f)]
    rows = [(t, round(ImageStat.Stat(ImageChops.difference(f, fin)).mean[0], 1)) for t, f in seen]
    bad = [r for r in rows if r[1] > 3]
    print(f'{n} · {a.mode}: first content {rows[0][0] if rows else "-"}s · ' + (f'changes after first view until {bad[-1][0]}s (max diff {max(r[1] for r in bad)})' if bad else 'stable from the first visible frame'))
    print('  ' + ' '.join(f'{t}:{d}' for t, d in rows[:20]))
    if a.strip:
        sel = seen[:14]; strip = Image.new('RGB', (132 * max(1, len(sel)), 240), 'white'); dr = ImageDraw.Draw(strip)
        for i, (t, f) in enumerate(sel): strip.paste(f, (i * 132, 0)); dr.text((i * 132 + 4, 224), f'{t}s', fill='black')
        strip.save(a.strip)
    sys.exit(1 if bad else 0)

asyncio.run(main())
