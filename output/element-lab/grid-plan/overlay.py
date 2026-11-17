"""Step 2 · draw the proposed grid over the current homepage (nothing on the site changes).
Shoots index-v2 at tablet and desktop widths (two screens tall) and paints:
  - the proposed columns (tinted) with their margins and gaps
  - the left line the page uses today (green = section headings, red = hero, when they differ)
Writes overlays/<width>-<variant>.jpg and overlays/*-compare.jpg."""
import functools, pathlib, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = str(pathlib.Path(__file__).resolve().parents[3])
OUT = pathlib.Path(__file__).parent / "overlays"; OUT.mkdir(exist_ok=True)

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/index-v2.html?version=2"

def grid(w, variant):
    """Return (left margin, column count, gap, content width) for the proposal."""
    if w <= 599: return 24, 4, 16, w - 48
    if w <= 1023:
        m = 40 if variant == "m40" else 32
        return m, 8, 24, w - 2 * m
    cap = 1312 if variant == "cap1312" else 1440
    m = max(min(max(40, 0.04 * w), 64), (w - cap) / 2)
    return m, 12, 32, w - 2 * m

LINES = r"""() => {
  const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && +c.opacity > 0.01; };
  const hero = document.querySelector('#home h1, #home h2'); const sec = [...document.querySelectorAll('section:not(#home) h2')].filter(vis)[0];
  return {hero: hero ? Math.round(hero.getBoundingClientRect().left) : null, sec: sec ? Math.round(sec.getBoundingClientRect().left) : null};
}"""

try: F = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)
except Exception: F = ImageFont.load_default()

def paint(src, w, variant, lines):
    im = Image.open(src).convert("RGBA"); ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    m, n, g, cw = grid(w, variant); col = (cw - g * (n - 1)) / n
    for i in range(n):
        x0 = m + i * (col + g); d.rectangle([x0, 0, x0 + col, im.height], fill=(244, 102, 73, 38))
    for x in (m, m + cw): d.line([(x, 0), (x, im.height)], fill=(244, 102, 73, 230), width=2)
    if lines["sec"] is not None: d.line([(lines["sec"], 0), (lines["sec"], im.height)], fill=(76, 195, 138, 255), width=3)
    if lines["hero"] is not None and abs(lines["hero"] - (lines["sec"] or -99)) > 2: d.line([(lines["hero"], 0), (lines["hero"], im.height)], fill=(230, 40, 40, 255), width=3)
    out = Image.alpha_composite(im, ov).convert("RGB"); dr = ImageDraw.Draw(out)
    label = {"m40": "margin 40", "m32": "margin 32", "cap1312": "content max 1312", "cap1440": "content max 1440"}[variant]
    txt = f"{w}px · {n} columns · gap {g} · margin {round(m)} · {label}"
    dr.rectangle([0, out.height - 44, out.width, out.height], fill=(238, 233, 222)); dr.text((16, out.height - 36), txt, fill=(24, 15, 16), font=F)
    return out

def main():
    widths = {768: ["m40", "m32"], 1024: ["cap1312"], 1440: ["cap1312", "cap1440"], 1920: ["cap1312", "cap1440"], 2560: ["cap1312", "cap1440"]}
    H = {768: 1024, 1024: 768, 1440: 900, 1920: 1080, 2560: 1440}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, vs in widths.items():
            pg = b.new_page(viewport={"width": w, "height": H[w]}, reduced_motion="reduce")
            pg.goto(URL, wait_until="networkidle", timeout=60000)
            pg.evaluate("async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } scrollTo(0, 0); }")
            pg.wait_for_timeout(500)
            lines = pg.evaluate(LINES)
            raw = OUT / f"raw-{w}.png"
            pg.screenshot(path=str(raw), full_page=True)
            im = Image.open(raw); im.crop((0, 0, w, min(im.height, int(H[w] * 2.2)))).save(raw)
            for v in vs: paint(raw, w, v, lines).save(OUT / f"{w}-{v}.jpg", quality=72)
            raw.unlink(); pg.close(); print(w, lines)
        b.close()
    # side-by-side comparisons for the two decisions
    for name, files in {"tablet-compare": ["768-m40", "768-m32"], "wide-compare-1920": ["1920-cap1312", "1920-cap1440"], "wide-compare-2560": ["2560-cap1312", "2560-cap1440"]}.items():
        ims = [Image.open(OUT / f"{f}.jpg") for f in files]; h = 900
        ims = [i.resize((int(i.width * h / i.height), h)) for i in ims]
        s = Image.new("RGB", (sum(i.width for i in ims) + 24, h), "white"); x = 0
        for i in ims: s.paste(i, (x, 0)); x += i.width + 24
        s.save(OUT / f"{name}.jpg", quality=75)

if __name__ == "__main__":
    main()
