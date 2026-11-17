"""Measure the reference sites' frame: side margin (left of headings/text), section padding, title sizes,
heading->text gaps, at 390 / 768 / 1440 / 1920."""
import json, pathlib
from playwright.sync_api import sync_playwright
OUT = pathlib.Path(__file__).parent; (OUT / "refs").mkdir(exist_ok=True)
SITES = {"stokt": "https://wearestokt.com/", "endurosat": "https://www.endurosat.com/space-service/"}
W = [(390, 844), (768, 1024), (1440, 900), (1920, 1080)]
JS = r"""() => {
const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.01; };
const hs = [...document.querySelectorAll('h1,h2')].filter(vis);
const ps = [...document.querySelectorAll('p')].filter(vis).filter(p => p.innerText.trim().length > 40);
const lefts = [...hs, ...ps].map(e => Math.round(e.getBoundingClientRect().left));
const freq = {}; lefts.forEach(l => freq[l] = (freq[l] || 0) + 1);
const secs = [...document.querySelectorAll('section')].filter(vis).filter((s, i, a) => !a.some(o => o !== s && o.contains(s)));
return { lefts: Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6),
  rights: (() => { const f = {}; [...hs, ...ps].forEach(e => { const r = Math.round(innerWidth - e.getBoundingClientRect().right); f[r] = (f[r] || 0) + 1; }); return Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 4); })(),
  titles: hs.slice(0, 12).map(h => { const c = getComputedStyle(h); let n = h.nextElementSibling; while (n && !vis(n)) n = n.nextElementSibling;
     return { t: h.innerText.trim().slice(0, 30), size: parseFloat(c.fontSize), lh: c.lineHeight, w: Math.round(h.getBoundingClientRect().width), next: n ? Math.round(n.getBoundingClientRect().top - h.getBoundingClientRect().bottom) : null }; }),
  pSize: ps.slice(0, 5).map(p => parseFloat(getComputedStyle(p).fontSize)), pWidth: ps.slice(0, 5).map(p => Math.round(p.getBoundingClientRect().width)),
  sections: secs.slice(0, 14).map(s => { const c = getComputedStyle(s); return [Math.round(parseFloat(c.paddingTop)), Math.round(parseFloat(c.paddingBottom)), Math.round(parseFloat(c.paddingLeft)), Math.round(s.getBoundingClientRect().height)]; }) };
}"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, url in SITES.items():
        for w, h in W:
            ctx = b.new_context(viewport={"width": w, "height": h}, user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36")
            pg = ctx.new_page()
            try:
                pg.goto(url, wait_until="domcontentloaded", timeout=45000); pg.wait_for_timeout(4000)
                pg.evaluate("async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 20000); y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); }")
                pg.wait_for_timeout(1500)
                res[f"{name}@{w}"] = pg.evaluate(JS)
                pg.screenshot(path=str(OUT / "refs" / f"{name}-{w}.jpg"), type="jpeg", quality=60)
            except Exception as e:
                res[f"{name}@{w}"] = {"error": str(e)[:200]}
            ctx.close()
    b.close()
(OUT / "refs.json").write_text(json.dumps(res, indent=1)); print("refs done")
