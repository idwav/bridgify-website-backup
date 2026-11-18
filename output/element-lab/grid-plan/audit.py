"""Measure grid, gutters, section rhythm and title sizes of the live pages at several widths.
Serves the worktree in-process (read only) and drives Chromium with Playwright."""
import json, sys, threading, functools, pathlib
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

ROOT = str(pathlib.Path(__file__).resolve().parents[3])
OUT = pathlib.Path(__file__).parent
OUT.mkdir(exist_ok=True); (OUT / "shots").mkdir(exist_ok=True)
PAGES = ["index-v2", "api", "marketplace", "personalization", "otas", "airlines", "hotels", "loyalty-finance", "super-apps", "travel-technology"]
WIDTHS = [390, 768, 820, 1024, 1280, 1440, 1920]
H = {390: 844, 768: 1024, 820: 1180, 1024: 768, 1280: 800, 1440: 900, 1920: 1080}

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_address[1]}"

JS = r"""() => {
const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.01; };
const secs = [...document.querySelectorAll('main > section, body > section, main > div > section, body > main section[id]')]
  .filter((s, i, a) => !a.some(o => o !== s && o.contains(s)) && vis(s));
const docTop = e => e.getBoundingClientRect().top + scrollY;
return secs.map(s => {
  const cs = getComputedStyle(s);
  const hs = [...s.querySelectorAll('h1,h2')].filter(vis).filter(h => !h.closest('[aria-hidden=true],.sr-only'));
  const h = hs[0];
  let label = null, text = null, gapLT = null, gapTT = null, cont = null, contW = null;
  if (h) {
    // label: nearest preceding visible element with uppercase text
    let p = h.previousElementSibling; while (p && !vis(p)) p = p.previousElementSibling;
    if (!p) { let par = h.parentElement; let q = par && par.previousElementSibling; while (q && !vis(q)) q = q.previousElementSibling; p = q; }
    if (p && getComputedStyle(p).textTransform === 'uppercase' && p.innerText.trim().length < 80) { label = p.innerText.trim().slice(0, 40); gapLT = Math.round(h.getBoundingClientRect().top - p.getBoundingClientRect().bottom); }
    let n = h.nextElementSibling; while (n && !vis(n)) n = n.nextElementSibling;
    if (!n) { let par = h.parentElement; let q = par && par.nextElementSibling; while (q && !vis(q)) q = q.nextElementSibling; n = q; }
    if (n && /^(P|DIV)$/.test(n.tagName) && n.innerText.trim().length > 20) { const t = n.tagName === 'P' ? n : n.querySelector('p'); if (t && vis(t)) { text = t.innerText.trim().slice(0, 30); gapTT = Math.round(t.getBoundingClientRect().top - h.getBoundingClientRect().bottom); } }
    for (let a = h.parentElement; a && a !== s.parentElement; a = a.parentElement) { const mw = getComputedStyle(a).maxWidth; if (mw !== 'none' && !mw.endsWith('%')) { cont = a.className.toString().split(' ')[0] || a.tagName; contW = Math.round(a.getBoundingClientRect().width); break; } }
  }
  const txt = [...s.querySelectorAll('h1,h2,h3,p,a.brand-action,.brand-section-label')].filter(vis).filter(e => !e.closest('[aria-hidden=true]'));
  const L = txt.length ? Math.round(Math.min(...txt.map(e => e.getBoundingClientRect().left))) : null;
  const R = txt.length ? Math.round(Math.max(...txt.map(e => e.getBoundingClientRect().right))) : null;
  const hc = h ? getComputedStyle(h) : null;
  return { id: s.id || s.className.toString().split(' ')[0], top: Math.round(docTop(s)), height: Math.round(s.getBoundingClientRect().height),
    padT: Math.round(parseFloat(cs.paddingTop)), padB: Math.round(parseFloat(cs.paddingBottom)), padL: Math.round(parseFloat(cs.paddingLeft)), padR: Math.round(parseFloat(cs.paddingRight)),
    title: h ? h.innerText.trim().slice(0, 40) : null, titleSize: hc ? parseFloat(hc.fontSize) : null, titleWeight: hc ? hc.fontWeight : null, titleFamily: hc ? hc.fontFamily.split(',')[0] : null,
    titleLeft: h ? Math.round(h.getBoundingClientRect().left) : null, titleTopInSec: h ? Math.round(h.getBoundingClientRect().top - s.getBoundingClientRect().top) : null,
    label, gapLT, text, gapTT, container: cont, containerW: contW, textLeft: L, textRight: R };
});
}"""

def main(pages, widths, shots):
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in widths:
            ctx = b.new_context(viewport={"width": w, "height": H[w]}, reduced_motion="reduce", device_scale_factor=1)
            for pg in pages:
                page = ctx.new_page()
                url = f"{BASE}/{pg}.html" + ("?version=2" if pg == "index-v2" else "")
                page.goto(url, wait_until="networkidle", timeout=60000)
                page.evaluate("async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); }")
                page.wait_for_timeout(600)
                res[f"{pg}@{w}"] = {"docW": page.evaluate("document.documentElement.scrollWidth"), "sections": page.evaluate(JS)}
                if shots:
                    page.screenshot(path=str(OUT / "shots" / f"{pg}-{w}.jpg"), type="jpeg", quality=70)
                    if pg in ("index-v2", "api"):
                        page.screenshot(path=str(OUT / "shots" / f"{pg}-{w}-full.jpg"), type="jpeg", quality=55, full_page=True)
                page.close()
            ctx.close()
        b.close()
    (OUT / "measure.json").write_text(json.dumps(res, indent=1))
    print("done", len(res))

if __name__ == "__main__":
    main(PAGES, WIDTHS, "--shots" in sys.argv)
