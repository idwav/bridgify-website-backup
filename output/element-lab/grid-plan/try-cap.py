"""Lab trial for step 2: render the homepage with one content max-width (try-cap.css) and check the left line.
Versions: A = cap 1440 (proposal), B = cap 1560 (the hero's current edge). Widths 1440 / 1920 / 2560.
Prints every section heading's left edge against the target margin; writes trial/<cap>-<width>.jpg
(top of the page, with the target line drawn) and trial/compare-<width>.jpg."""
import functools, json, pathlib, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
ROOT = str(HERE.resolve().parents[2])
OUT = HERE / "trial"; OUT.mkdir(exist_ok=True)
CSS = (HERE / "try-cap.css").read_text()

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/index-v2.html?version=2"
H = {1440: 900, 1920: 1080, 2560: 1440}

MEASURE = r"""() => {
  const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && +c.opacity > 0.01; };
  const m = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--try-margin')) || null;
  const rows = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && vis(s)).map(s => {
    const h = s.querySelector('.sec2-in, .hc2-box') || [...s.querySelectorAll('h1,h2')].filter(vis)[0];   // a boxed card: its box sits on the line
    return {id: s.id || s.className.split(' ')[0], left: h ? Math.round(h.getBoundingClientRect().left) : null, right: h ? Math.round(innerWidth - Math.max(...[...s.querySelectorAll('h1,h2,h3,p,a')].filter(vis).map(e => e.getBoundingClientRect().right))) : null};
  });
  const logo = document.querySelector('.site-header-common img, header img');
  return {margin: m, logo: logo ? Math.round(logo.getBoundingClientRect().left) : null, docW: document.documentElement.scrollWidth, rows};
}"""

try: F = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 26)
except Exception: F = ImageFont.load_default()

def main():
    report = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, h in H.items():
            for cap in (1440, 1560):
                pg = b.new_page(viewport={"width": w, "height": h}, reduced_motion="reduce")
                pg.goto(URL, wait_until="networkidle", timeout=60000)
                pg.add_style_tag(content=CSS + f"\n@media (min-width:1024px){{html:root{{--try-cap:{cap}px}}}}")
                pg.evaluate("async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } scrollTo(0, 0); }")
                pg.wait_for_timeout(500)
                r = pg.evaluate(MEASURE); report[f"{cap}@{w}"] = r
                raw = OUT / "raw.png"; pg.screenshot(path=str(raw), full_page=True)
                im = Image.open(raw).convert("RGB"); im = im.crop((0, 0, w, min(im.height, int(h * 2.6)))); d = ImageDraw.Draw(im)
                x = max(min(max(40, 0.04 * w), 64), (w - cap) / 2); r["margin"] = x
                for xx in (x, w - x): d.line([(xx, 0), (xx, im.height)], fill=(244, 102, 73), width=3)
                d.rectangle([0, im.height - 48, w, im.height], fill=(238, 233, 222))
                name = "A · content max 1440" if cap == 1440 else "B · content max 1560 (red line)"
                d.text((16, im.height - 40), f"{w}px · {name} · margin {round(x)}", fill=(24, 15, 16), font=F)
                im.save(OUT / f"{cap}-{w}.jpg", quality=74); raw.unlink(); pg.close()
                off = [f"{q['id']}:{q['left']}" for q in r["rows"] if q["left"] is not None and abs(q["left"] - x) > 2]
                print(f"{w} cap {cap}: margin {round(x)} logo {r['logo']} docW {r['docW']} off-line: {off}")
            a, bb = Image.open(OUT / f"1440-{w}.jpg"), Image.open(OUT / f"1560-{w}.jpg"); hh = 1000
            a, bb = [i.resize((int(i.width * hh / i.height), hh)) for i in (a, bb)]
            s = Image.new("RGB", (a.width + bb.width + 24, hh), "white"); s.paste(a, (0, 0)); s.paste(bb, (a.width + 24, 0)); s.save(OUT / f"compare-{w}.jpg", quality=76)
        b.close()
    (OUT / "report.json").write_text(json.dumps(report, indent=1))

if __name__ == "__main__":
    main()
