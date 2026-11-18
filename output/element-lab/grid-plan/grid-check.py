"""Step 5 · automatic check of every approved rule on the homepage trial (lab only).

Loads index-v2 with the approved layers injected (try-cap.css cap 1560 + tablet 32, header-compact.css,
type-wide.css, tokens-wide.css + rhythm-wide.js, split-align.css + split-align.js) and checks, per width:
  G1 content line · G2 nothing past the right margin · H1 no sideways scroll · S spacing table ·
  A1 split headings · N1 header · T1 text sizes · T2 no local type scale · SC1 smooth wheel scroll.
Writes check/report.json and check/report.html. Run:  python3 output/element-lab/grid-plan/grid-check.py
Needs the dev server on :8084 (launch.json "grid-live")."""
import json, pathlib, sys, datetime
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
OUT = HERE / "check"; OUT.mkdir(exist_ok=True)
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
PAGE = next((a[7:] for a in sys.argv[1:] if a.startswith("--page=")), "home")
LIVE = "--live" in sys.argv     # check the page as the site serves it (its HTML links wide/): nothing is injected
BAKED = "--baked" in sys.argv or LIVE   # check the published build (wide/) instead of the lab layers: no spacing is set at run time
# a width, or WxH for a screen of its own shape: 1024x1366 is an iPad Pro held upright, which is in the desktop class
# but gets the stacked tablet layouts (18 Nov 2026: the White-Label demo sat on the hero buttons only there)
SIZES = [(int(x.split("x")[0]), int(x.split("x")[1]) if "x" in x else 900) for x in (ARGS[0].split(",") if ARGS else "390,768,1024,1024x1366,1280,1440,1920".split(","))]
WIDTHS = [w for w, _ in SIZES]
PAGES = {
  "home": {"url": "index-v2.html?version=2", "roles": "roles-index-v2.js", "css": ["tablet-hero.css"], "pairs": None,
    "hero": "#home #hero-title",
    "section": "#v2p-title, #opx-opportunity-title, #opx-why-title, #home-intent-title, #audiences-title, #partner-results-title, #sec2-title, #faq div.copy-inner > h2, #hc2-title",
    "card": "#products .pr-body h4, #why-bridgify div.wy-copy > h4, #opportunity-study .pb-panel h4, #audiences .audience-card h3, #sources div.trust-copy > h2",
    "buttons": "#start, section .hc2-actions a, section a.brand-action"},
  "api": {"url": "api.html", "roles": "roles-api.js", "css": ["api-trial.css"],
    "pairs": [["#whats-inside", "h2", "header.ex-head > p"], ["#api-features", "h2", "header.ck-head > p"]],
    "hero": "#top .hero-copy > h2",
    "section": "#an-title, #ak-title, #cx-title, #am-title, #af-title, #ae-title, #faq .copy-inner > h2, #bf-cta-title",
    "card": "#integration .am-build h3, #integration .am-managed h3",
    "buttons": "section .hero-actions a, section a.brand-action, .bf-cta-actions a"},
  "marketplace": {"url": "marketplace.html", "roles": "roles-marketplace.js", "css": ["marketplace-trial.css"],
    "pairs": [["#section-2", "h2.tour-title", "header > p"], ["#section-3", "h2", "header.wl-heading > p"], ["#section-4", "#commerce-title", "header.wo-heading > p"], ["#section-5", "h2", "div.launch-heading > p"], ["#build-or-buy", "h2", "header.bc-heading > p"]],
    "hero": "#section-1 h1.copy-seo",
    "section": "#section-2 h2.tour-title, #section-3 .wl-heading h2, #commerce-title, #launch-title, #bb-title, #ma-title, #results-title, #faq .copy-inner > h2",
    "card": "#section-3 .wl-details h3, #section-5 .launch-setup h3, #build-or-buy .bc-card-heading h3, #marketplace-audiences .ma-industry-card h3",
    "buttons": "section .actions a, section a.brand-action, .bf-cta-actions a"},
  "personalization": {"url": "personalization.html", "roles": "roles-personalization.js", "css": ["personalization-trial.css"], "pairs": [["#section-2", "h2", "div.intent-heading > p"], ["#section-4", "h2", "div.embed-heading > p"]],
    "hero": "x-none",
    "section": "#section-2 .intent-heading h2, #section-3 .match-head h2, #section-4 .embed-heading h2, #day-itinerary header h2, #faq .copy-inner > h2",
    "card": "#section-4 .embed-shell h3, #day-itinerary .day-start h3, #day-itinerary .day-plan h3",
    "buttons": "section a.brand-action, .bf-cta-actions a"},
  "otas": {"url": "otas.html", "roles": "roles-otas.js", "css": ["otas-trial.css"], "pairs": [["#section-3", "h2", "header.rc-head > div"]],
    "hero": "#ys-title",
    "section": "#ms-title, #rc-title, #xc-title, #faq .copy-inner > h2",
    "card": "#section-4.xc .xc-body h3",
    "buttons": "section a.brand-action, section a.xc-cta, .bf-cta-actions a"},
  "airlines": {"url": "airlines.html", "roles": "roles-airlines.js", "css": ["airlines-trial.css"], "pairs": [["#section-2", "h2", "header.ar-heading > p"], ["#section-4", "h2", "header.xc-head > p"]],
    "hero": "#al-title",
    "section": "#al-earn-title, #al-journey-title, #xc-title, #al-faq-title",
    "card": "#section-4.xc .xc-body h3",
    "buttons": "section a.brand-action, section a.xc-cta, .bf-cta-actions a"},
  "hotels": {"url": "hotels.html", "roles": "roles-hotels.js", "css": ["hotels-trial.css"], "pairs": [["#section-4", "h2", "header.xc-head > p"]],
    "hero": "#hm-title",
    "section": "#hr-title, #hs-title, #xc-title, #faq .copy-inner > h2",
    "card": "#section-4.xc .xc-body h3",
    "buttons": "section a.brand-action, section a.xc-cta, .bf-cta-actions a"},
  "loyalty-finance": {"url": "loyalty-finance.html", "roles": "roles-loyalty-finance.js", "css": ["loyalty-finance-trial.css"], "pairs": [["#section-2", "h2", "header > div.lp-copy"]],
    "hero": "#section-1 .lf-heading > h1",
    "section": "#section-2 h2:not(.lp-x), #section-3 > h2, #xc-title, #we-started-here header h2, #market-signal header h2, #faq .copy-inner > h2",
    "card": "#section-4.xc .xc-body h3",
    "buttons": "section a.brand-action, section a.xc-cta, .bf-cta-actions a"},
  "super-apps": {"url": "super-apps.html", "roles": "roles-super-apps.js", "css": ["super-apps-trial.css"], "pairs": [["#section-4", "h2", "header.xc-head > p"]],
    "hero": "#section-1 .sc-hero-copy > h1",
    "section": "#ma-title, #sc-title, #xc-title, #faq .copy-inner > h2",
    "card": "#section-4.xc .xc-body h3",
    "buttons": "section a.brand-action, section a.xc-cta, .bf-cta-actions a"},
  "travel-technology": {"url": "travel-technology.html", "roles": "roles-travel-technology.js", "css": ["travel-technology-trial.css"], "pairs": [["#section-4", "h2", "header.xc-head > p"]],
    "hero": "#te-title",
    "section": "#th-title, #ad-title, #xc-title, #faq .copy-inner > h2",
    "card": "#section-4.xc .xc-body h3",
    "buttons": "section a.brand-action, section a.xc-cta, .bf-cta-actions a"}
}
P = PAGES[PAGE]
BASE = "http://127.0.0.1:8084/" + P["url"]
R = lambda n: (HERE / n).read_text()
CSS = [R("try-cap.css") + "\nhtml:root{--try-cap:1560px;--try-tab:32px}", R("header-compact.css"), R("type-wide.css"), R("tokens-wide.css"), R("split-align.css")] + [R(c) for c in P["css"]]
JS = [R(P["roles"]) + "\n" + R("rhythm-wide.js"), (f"window.BridgifySplitPairs = {json.dumps(P['pairs'])};\n" if P["pairs"] else "") + R("split-align.js")]
if BAKED:
    W = HERE.parents[2] / "wide"; WP = {"home": "index-v2"}.get(PAGE, PAGE)
    CSS = [(W / f).read_text() for f in ("grid.css", "tokens.css", "type.css", "header.css", "split.css")] + [(W / "pages" / f"{WP}.css").read_text()]
    JS = ["window.__bfMeasureOnly = true;\n" + JS[0], "window.__bfMeasureOnly = true;\n" + JS[1]] + ([(W / "pages" / f"{WP}.js").read_text()] if (W / "pages" / f"{WP}.js").exists() else [])
if LIVE:
    CSS = []; JS = JS[:2]
# documented exceptions (SPACING-GRID-PLAN.md 2c, 3a): a divider with its own padding, a label row taller than the label
KNOWN = {("#sources", "content→foot"), ("#sources", "sub→content"), ("#opportunity-study", "more→text"), ("#audiences", "label→title")}
# page-specific: Super Apps "Connect experiences to what users are planning" is a pinned scroll scene whose frame is a
# screen tall (min-height 100svh, content centred), so the gap under it depends on the screen's height; it is exact at
# the heights the build samples and drifts by up to 63px on others (18 Nov 2026)
if PAGE == "super-apps": KNOWN = KNOWN | {("#section-3", "content→text")}

def margin(w):
    if w <= 599: return None
    if w <= 1023: return 32
    return max(min(max(40, 0.04 * w), 64), (w - 1560) / 2)

def clamp(lo, v, hi): return max(lo, min(v, hi))
def expect_type(w):
    if w <= 599: return None
    if w <= 1023: return {"hero": clamp(48, .055 * w, 56), "section": 36, "card": 24}   # tablet hero: approved 17 Nov (48–56)
    return {"hero": clamp(40, .036 * w, 60), "section": clamp(36, .03 * w, 44), "card": clamp(24, .019 * w, 28)}

MEASURE = r"""([m, S]) => {
 const vis = e => { const r=e.getBoundingClientRect(), c=getComputedStyle(e); return r.width>1 && r.height>1 && c.visibility!=='hidden' && c.display!=='none' && +c.opacity>0.01; };
 const de = document.documentElement, cw = de.clientWidth;
 const out = {};
 out.hscroll = de.scrollWidth > cw;
 // G1: the first heading, label or boxed card of each top-level section, against the margin
 out.g1 = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && vis(s) && !s.matches('.bf-cta-shell')).map(s => {
   const h = s.querySelector('.sec2-in, .hc2-box') || [...s.querySelectorAll('h1,h2')].filter(vis)[0]; if (!h) return null;
   // a centred heading (the OTAs hero) is centred on the content: its column, not its first letter, sits on the line
   const centred = getComputedStyle(h).textAlign === 'center';
   let x = (centred ? h.parentElement : h).getBoundingClientRect().left; const lbl = s.querySelector('.brand-section-label, .hm-eyebrow, .v4-kicker, .bv2-hero-eyebrow, .sec2-eyebrow');
   // inside a boxed card the label sits on the card's own padding: only the box is checked against the margin
   const boxed = !!s.querySelector('.sec2-in, .hc2-box, .bf-cta-card');
   return {id: s.id || s.className.split(' ')[0], left: Math.round(x), label: !boxed && !centred && lbl && vis(lbl) ? Math.round(lbl.getBoundingClientRect().left) : null}; }).filter(Boolean);
 // G2: editorial text past the right margin (visuals, demos and full-bleed art excluded)
 const skip = '[aria-hidden=true], .ar-trip, .ar-bookings, .ys-ticket, .market-demo, .presentation, .screens, .wl-preview-stage, .launch-workspace, .bc-comparison, .wo-stack, .results-panel, .match-workspace, .embed-shell, .day-layout, iframe, .ahc-visual, .nz-wrap, .ex-app, .cj-stage, .am-panel, .hm-stage, .intent-stage, .pr-card-visual, .v2e-proof, .v2e-art, .hc2-demo, .bv2-hero-visual, .pb-panels, .pr-grid, .audience-grid, svg, header, footer, .site-footer, .trust-stat';
 out.g2 = m == null ? [] : [...document.querySelectorAll('section h1, section h2, section p, section .brand-action')].filter(e => vis(e) && !e.closest(skip))
   .filter(e => e.getBoundingClientRect().right > cw - m + 1.5).map(e => ({t: e.innerText.trim().slice(0, 40), over: Math.round(e.getBoundingClientRect().right - (cw - m))}));
 // T1 / T2: text sizes by role; local redefinitions of the type tokens
 const fs = e => +parseFloat(getComputedStyle(e).fontSize).toFixed(1), lh = e => +(parseFloat(getComputedStyle(e).lineHeight) / parseFloat(getComputedStyle(e).fontSize)).toFixed(2);
 const q = s => [...document.querySelectorAll(s)].filter(vis);
 out.t1 = {
   hero: q(S.hero).map(e => [e.innerText.slice(0, 24), fs(e), lh(e)]),
   section: q(S.section).map(e => [e.innerText.slice(0, 24), fs(e), lh(e)]),
   card: q(S.card).map(e => [e.innerText.slice(0, 24), fs(e), lh(e)]),
   body: q('section p').filter(e => e.innerText.trim().length > 40 && !e.closest(skip)).map(e => [e.innerText.slice(0, 24), fs(e)]),
   button: q(S.buttons).filter(e => !e.closest(skip)).map(e => [e.innerText.slice(0, 24), fs(e)]),
   label: q('.brand-section-label, .hm-eyebrow, .v4-kicker, .bv2-hero-eyebrow, .sec2-eyebrow, .audiences-kicker').map(e => [e.innerText.slice(0, 24), fs(e)]) };
 const root = getComputedStyle(de);
 out.t2 = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section')).flatMap(s => ['--type-hero', '--type-section', '--type-card']
   .filter(v => getComputedStyle(s).getPropertyValue(v).trim() !== root.getPropertyValue(v).trim()).map(v => ({id: s.id, token: v, local: getComputedStyle(s).getPropertyValue(v).trim()})));
 // N1: header at the top of the page
 const hd = document.querySelector('header.site-header-common'), lg = hd && hd.querySelector('a.wordmark, a.logo'), bt = hd ? [...hd.querySelectorAll('.nav-actions > a')].filter(vis) : [];
 out.n1 = hd ? {top: Math.round(hd.getBoundingClientRect().top), h: Math.round(hd.getBoundingClientRect().height), logo: lg ? Math.round(lg.getBoundingClientRect().left) : null, lastR: bt.length ? Math.round(cw - bt[bt.length - 1].getBoundingClientRect().right) : null} : null;
 return out; }"""

SCROLL = r"""async () => {
 // SC1: wheel-sized steps through the whole page, then through "Why Bridgify" in fine steps
 const ys = []; const step = async () => { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); ys.push(scrollY); };
 scrollTo(0, 0); await step();
 const t = document.querySelector('#why-bridgify .wy-track'); const top = t ? t.getBoundingClientRect().top + scrollY - innerHeight : 0;
 scrollTo(0, Math.max(0, top)); await step();
 const end = t ? top + t.offsetHeight + innerHeight : document.body.scrollHeight;
 for (let i = 0; i < 80 && scrollY < end; i++) { scrollBy(0, 120); await step(); }
 const d = ys.slice(2).map((y, i) => Math.round(y - ys[i + 1]));
 return {steps: d.length, max: Math.max(...d), min: Math.min(...d)}; }"""

def main():
    rows, started = [], datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    def add(w, rule, ok, detail, known=False): rows.append({"w": w if vh == 900 else f"{w}x{vh}", "rule": rule, "ok": bool(ok), "known": known, "detail": detail})
    vh = 900
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, vh in SIZES:
            pg = b.new_page(viewport={"width": w, "height": vh}, reduced_motion="reduce")
            pg.goto(BASE, wait_until="networkidle", timeout=60000)
            for c in CSS: pg.add_style_tag(content=c)
            for j in JS: pg.add_script_tag(content=j)
            pg.evaluate("async () => { for (let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y); await new Promise(r=>setTimeout(r,30));} scrollTo(0,0); await new Promise(r=>setTimeout(r,500)); BridgifyRhythmWide.apply(); await new Promise(r=>setTimeout(r,200)); BridgifySplit.apply(); await new Promise(r=>setTimeout(r,200)); }")
            m = margin(w); r = pg.evaluate(MEASURE, [m, {k: P[k] for k in ('hero', 'section', 'card', 'buttons')}])
            # H1
            add(w, "H1 בלי גלילה הצידה", not r["hscroll"], "אין" if not r["hscroll"] else "יש גלילה אופקית")
            if m is not None:
                # G1
                off = [f"{x['id']}: {x['left']}" for x in r["g1"] if x["left"] > 0 and abs(x["left"] - m) > 1]
                offl = [f"{x['id']} label: {x['label']}" for x in r["g1"] if x["label"] not in (None, 0) and abs(x["label"] - m) > 1]
                add(w, "G1 קו התוכן", not off and not offl, f"קו {round(m)} · {len(r['g1'])} סקשנים" + (" · חורגים: " + ", ".join(off + offl) if off or offl else " · כולם על הקו"))
                # G2
                add(w, "G2 שום טקסט לא עובר את השוליים מימין", not r["g2"], "אין" if not r["g2"] else "; ".join(f"{x['t']} (+{x['over']})" for x in r["g2"][:4]))
                # S
                rep = pg.evaluate("BridgifyRhythmWide.report()")
                bad = [x for x in rep if abs(x["got"] - x["want"]) > 1 and (x["section"], x["pair"]) not in KNOWN]
                kn = [x for x in rep if abs(x["got"] - x["want"]) > 1 and (x["section"], x["pair"]) in KNOWN]
                add(w, "S טבלת הריווח", not bad, f"{len(rep) - len(bad) - len(kn)}/{len(rep)} זוגות בדיוק" + ("; לא תקין: " + ", ".join(f"{x['section']} {x['pair']} {x['got']}≠{x['want']}" for x in bad) if bad else ""))
                # R1: items the map lists one after another that sit side by side in one row start on one top edge
                r1 = pg.evaluate("""() => { const out = []; const els = [...document.querySelectorAll('[data-bf-role]')];
                  els.forEach((a, i) => { const b = els[i + 1]; if (!b || a.parentElement !== b.parentElement) return; const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
                    const top = e => !/center|end/.test(getComputedStyle(e.parentElement).alignItems) && !/center|end/.test(getComputedStyle(e).alignSelf);
                    if (top(a) && top(b) && rb.left >= ra.right - 2 && Math.abs(rb.top - ra.top) > 1) out.push((a.closest('section') || {}).id + ' ' + a.className.split(' ')[0] + '|' + b.className.split(' ')[0] + ' ' + Math.round(rb.top - ra.top)); });
                  return out; }""")
                add(w, "R1 פריטים באותה שורה מתחילים באותו גובה", not r1, "כולם" if not r1 else ", ".join(r1))
                if kn: add(w, "S חריגים מתועדים", True, ", ".join(f"{x['section']} {x['pair']} {x['got']} (טבלה {x['want']})" for x in kn), known=True)
                # T1
                e = expect_type(w); probs = []
                if w >= 1024 and vh > w: e = dict(e, hero=clamp(48, .055 * w, 56))   # an iPad Pro held upright gets the approved tablet portrait hero (17 Nov)
                for role, want, lhw in (("hero", e["hero"], 1.16), ("section", e["section"], 1.2), ("card", e["card"], 1.25)):
                    for t, f, l in r["t1"][role]:
                        if abs(f - want) > .6: probs.append(f"{t} {f}≠{round(want,1)}")
                        if abs(l - lhw) > .02: probs.append(f"{t} גובה שורה {l}≠{lhw}")
                for role, want in (("body", 16), ("button", 16), ("label", 12)):
                    probs += [f"{t} {f}≠{want}" for t, f in r["t1"][role] if abs(f - want) > .6]
                n = sum(len(v) for v in r["t1"].values())
                add(w, "T1 גדלי טקסט", not probs, f"{n} טקסטים · hero {round(e['hero'],1)} · סקשן {round(e['section'],1)} · פנימית {round(e['card'],1)} · גוף 16" + ("; לא תקין: " + "; ".join(probs[:5]) if probs else ""))
                add(w, "T2 בלי סולם טקסט מקומי", not r["t2"], "אין" if not r["t2"] else ", ".join(f"{x['id']} {x['token']}={x['local']}" for x in r["t2"]))
                # N1
                n1 = r["n1"]; okline = n1 and abs(n1["logo"] - m) <= 1 and abs(n1["lastR"] - m) <= 1
                if w >= 1024:
                    pg.evaluate("scrollTo(0, 800)"); pg.wait_for_timeout(500)
                    h2 = pg.evaluate("(() => { const h=document.querySelector('header.site-header-common'); const r=h.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)] })()")
                    pg.evaluate("scrollTo(0, 0)"); pg.wait_for_timeout(400)
                    ok = okline and n1["top"] == 0 and n1["h"] == 88 and h2 == [0, 64]
                    add(w, "N1 header", ok, f"לוגו {n1['logo']} · כפתור {n1['lastR']} (קו {round(m)}) · למעלה top {n1['top']} גובה {n1['h']} · בגלילה top {h2[0]} גובה {h2[1]}")
                else:
                    add(w, "N1 header על הקו", okline, f"לוגו {n1['logo']} · כפתור {n1['lastR']} (קו {round(m)})")
                # A1
                if w >= 1024:
                    col7 = w / 2 + 16; sp = pg.evaluate("BridgifySplit.report()")
                    bad = [x for x in sp if abs(x["introLeft"] - col7) > 1 or x["introWidth"] > 561 or abs(x["dTop"]) > 2]
                    add(w, "A1 כותרת מפוצלת", not bad, f"עמודה 7 = {round(col7)} · " + ", ".join(f"{x['section']} x{x['introLeft']} רוחב {x['introWidth']} ראש {x['dTop']:+d}" for x in sp))
            else:
                add(w, "טלפון: לא משתנה", True, "שכבות הניסוי לא פועלות מתחת ל־600 (המובייל המאושר נבדק ב־PR #9)")
            # SC1
            sc = pg.evaluate(SCROLL)
            add(w, "SC1 גלילה חלקה (Why Bridgify)", sc["max"] <= 125 and sc["min"] >= 0, f"{sc['steps']} צעדים של 120px · הצעד הגדול {sc['max']} · הקטן {sc['min']}")
            pg.close(); print(w, "done", file=sys.stderr)
        b.close()
    (OUT / ((f"report-{PAGE}" if PAGE != "home" else "report") + ("-live" if LIVE else "-baked" if BAKED else "") + ".json")).write_text(json.dumps({"run": started, "widths": WIDTHS, "rows": rows}, ensure_ascii=False, indent=1))
    html(rows, started)
    fails = [x for x in rows if not x["ok"]]
    print(f"{len(rows)} checks · {len(fails)} failed")
    for x in fails: print("FAIL", x["w"], x["rule"], x["detail"])

def html(rows, started):
    rules = list(dict.fromkeys(x["rule"] for x in rows)); ws = list(dict.fromkeys(x["w"] for x in rows))
    cell = {}
    for x in rows: cell[(x["rule"], x["w"])] = x
    def td(rule, w):
        x = cell.get((rule, w))
        if not x: return '<td class="na">—</td>'
        cls = "known" if x["known"] else ("ok" if x["ok"] else "bad")
        mark = "חריג מתועד" if x["known"] else ("עובר" if x["ok"] else "נכשל")
        return f'<td class="{cls}"><b>{mark}</b><span>{x["detail"]}</span></td>'
    n, f = len(rows), sum(1 for x in rows if not x["ok"])
    body = "".join(f"<tr><th>{r}</th>{''.join(td(r, w) for w in ws)}</tr>" for r in rules)
    (OUT / ((f"report-{PAGE}" if PAGE != "home" else "report") + ("-live" if LIVE else "-baked" if BAKED else "") + ".html")).write_text(f"""<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>בדיקת גריד · {PAGE}</title><style>
:root{{--bg:#100A08;--panel:#1A1210;--line:#3a2c27;--ink:#EEE9DE;--muted:#9b8b80;--coral:#F46649;--ok:#2f6b4f;--bad:#8a2b1c;--known:#5a4a2a}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,system-ui,sans-serif;padding:24px 16px}}
h1{{font-size:22px;margin:0 0 6px}} p{{color:var(--muted);margin:0 0 18px}} .sum{{display:inline-block;padding:6px 12px;border-radius:8px;background:{'var(--ok)' if f == 0 else 'var(--bad)'};color:#fff;font-weight:700;margin-bottom:16px}}
.wrap{{overflow-x:auto}} table{{border-collapse:separate;border-spacing:4px;min-width:900px}} th{{text-align:right;font-weight:600;color:var(--muted);padding:6px 8px;vertical-align:top;white-space:nowrap}}
thead th{{color:var(--ink);text-align:center}} td{{vertical-align:top;padding:8px 10px;border-radius:8px;min-width:160px;font-size:12px}} td b{{display:block;font-size:13px;margin-bottom:3px}} td span{{color:#e9ddd2;direction:ltr;unicode-bidi:plaintext;display:block}}
.ok{{background:var(--ok)}} .bad{{background:var(--bad)}} .known{{background:var(--known)}} .na{{background:var(--panel);color:var(--muted);text-align:center}}
</style></head><body><h1>בדיקת גריד, ריווח, יישור וטקסט · {'דף הבית' if PAGE == 'home' else PAGE.upper()} (ניסוי)</h1>
<p>כל הכללים שאושרו בשלבים 2–3, נמדדים אוטומטית בכל רוחב. הרצה: {started}. מעבדה בלבד; האתר לא השתנה.</p>
<div class="sum">{n - f} מתוך {n} בדיקות עברו</div>
<div class="wrap"><table><thead><tr><th>כלל</th>{''.join(f'<th>{w}px</th>' for w in ws)}</tr></thead><tbody>{body}</tbody></table></div></body></html>""")

if __name__ == "__main__":
    main()
