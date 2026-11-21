#!/usr/bin/env python3
"""Build the Bridgify design system pages from tokens.json.

tokens.json is the single source. This script writes:
  tokens.css   CSS custom properties for developers (per breakpoint)
  index.html   the living style guide (Foundations chapter)

Run:  python3 design-system/build.py
Check (fails if the built files are stale):  python3 design-system/build.py --check
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(HERE, 'tokens.json')))
PAGES = json.load(open(os.path.join(HERE, 'pages.json')))
MOTION = json.load(open(os.path.join(HERE, 'motion.json')))
ASSETS = json.load(open(os.path.join(HERE, 'assets.json')))
HANDOFF = json.load(open(os.path.join(HERE, 'handoff.json')))
ACCEPT = json.load(open(os.path.join(HERE, 'acceptance.json')))
BPS = ['desktop', 'tablet', 'phone']
BP_LABEL = {'desktop': 'Desktop', 'tablet': 'Tablet', 'phone': 'Phone'}
esc = html.escape


def luminance(hex_):
    if hex_.startswith('rgb'):
        c = [float(x) / 255 for x in re.findall(r'[\d.]+', hex_)[:3]]
    else:
        h = hex_.lstrip('#')[:6]
        c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


# ---------------------------------------------------------------- tokens.css
def build_css():
    out = ['/* Bridgify design tokens. Generated from tokens.json by build.py; do not edit by hand. */',
           f"/* version {T['meta']['version']} · {T['meta']['date']} */", ':root {']
    for group, items in T['color'].items():
        for name, tok in items.items():
            out.append(f"  --color-{group}-{name}: {tok['$value']};")
    fam = T['font']['family']
    for name, tok in fam.items():
        vals = ', '.join(f'"{v}"' if ' ' in v else v for v in tok['$value'])
        out.append(f'  --font-{name}: {vals};')
    for k in ('radius', 'shadow'):
        for name, tok in T[k].items():
            if not name.startswith('$'):
                out.append(f"  --{k}-{name}: {tok['$value']};")
    for name, tok in T['glass'].items():
        if not name.startswith('$') and not str(tok['$value']).startswith('shadow.'):
            out.append(f"  --glass-{name}: {tok['$value']};")
    out.append(f"  --content-max: {T['grid']['content-max']['$value']};")
    out.append(f"  --illustration-text-min: {T['rule']['illustration-text-min']['$value']};")

    def bp_block(bp):
        lines = [f"  --margin: {T['grid']['margin'][bp]['$value']};"]
        for name, tok in T['space'].items():
            if name.startswith('$'):
                continue
            lines.append(f'  --space-{name}: {tok[bp]};')
        for role, r in T['type'].items():
            if role.startswith('$'):
                continue
            lines.append(f"  --type-{role}-size: {r[bp]['size']};")
            lines.append(f"  --type-{role}-weight: {r[bp]['weight']};")
        return lines

    out += bp_block('desktop')
    for role, r in T['type'].items():
        if role.startswith('$'):
            continue
        out.append(f"  --type-{role}-line-height: {r['lineHeight']};")
        out.append(f"  --type-{role}-letter-spacing: {r['letterSpacing']};")
    out.append('}')
    out.append(f"@media (max-width: {T['breakpoint']['tablet']['max']}) {{\n  :root {{")
    out += ['  ' + l for l in bp_block('tablet')]
    out.append('  }\n}')
    out.append(f"@media (max-width: {T['breakpoint']['phone']['max']}) {{\n  :root {{")
    out += ['  ' + l for l in bp_block('phone')]
    out.append('  }\n}')
    return '\n'.join(out) + '\n'


# ---------------------------------------------------------------- page parts
def swatch_card(group, name, tok):
    v = tok['$value']
    var = f'--color-{group}-{name}'
    is_grad = tok.get('$type') == 'gradient'
    ink = '#180F10' if (not is_grad and luminance(v) > 0.4) else '#EEE9DE'
    ratios = ''
    if not is_grad and group in ('text', 'coral', 'state'):
        rd = contrast(v, T['color']['bg']['base']['$value'])
        rl = contrast(v, T['color']['bg']['cream']['$value'])
        def badge(r, on):
            ok = 'aa' if r >= 4.5 else ('large' if r >= 3 else 'fail')
            lab = {'aa': 'AA', 'large': 'AA large', 'fail': 'below AA'}[ok]
            return f'<span class="ratio {ok}">on {on} {r:.1f}:1 · {lab}</span>'
        # only the surfaces the colour is meant for
        on = ['cream'] if name.startswith('on-light') else (['dark', 'cream'] if group == 'coral' else ['dark'])
        ratios = '<div class="ratios">' + ''.join(badge(rd if s == 'dark' else rl, s) for s in on) + '</div>'
    fb = f'<span class="mono">fallback {esc(tok["fallback"])}</span>' if tok.get('fallback') else ''
    prov = '<span class="prov">provisional</span>' if tok.get('status') == 'provisional' else ''
    chip = f'<div class="chipc" style="background:{v};color:{ink}"><span>{esc(name)}</span></div>'
    return (f'<article class="swatch">{chip}<div class="sw-body"><div class="sw-top"><code>{var}</code>{prov}</div>'
            f'<div class="mono val">{esc(v)}</div>{fb}<p>{esc(tok.get("$description", ""))}</p>{ratios}</div></article>')


SAMPLES = {
    'hero': 'Your guests didn’t travel for the room.',
    'section': 'Choose how to integrate and distribute experiences',
    'section-sm': 'Frequently asked questions',
    'card': 'Activities for tour operators and packages',
    'small-head': 'How can hotels sell tours and activities to guests?',
    'stat': '1M+',
    'body': 'They came for the city, the beach, the show. Sell the stay and everything around it under your hotel brand.',
    'small': 'Bridgify configures your brand, domain and catalog.',
    'cta': 'See the Experiences API →',
    'eyebrow': 'Travel technology companies',
    'nav': 'Products · Solutions · Developers',
    'index': '01   02   03   04',
    'caption': '© Bridgify 2026 · 21 Nov 2026',
}


def type_rows():
    rows = []
    for role, r in T['type'].items():
        if role.startswith('$'):
            continue
        fam = 'Chillax' if r['family'] == 'display' else 'Sofia Sans'
        extra = [x for x in (r.get('transform'), r.get('numeric')) if x]
        prov = ' <span class="prov">provisional</span>' if r.get('status') == 'provisional' else ''
        sizes = ''.join(f'<div class="spec bp-{bp}"><span>{BP_LABEL[bp]}</span><b>{esc(r[bp]["size"])}</b><i>{r[bp]["weight"]}</i></div>' for bp in BPS)
        rows.append(
            f'<article class="role"><div class="role-meta"><div><code>type-{role}</code>{prov}<div class="dim">{esc(r["use"])}</div></div>'
            f'<div class="specs"><div class="spec"><span>Family</span><b>{fam}</b></div>{sizes}'
            f'<div class="spec"><span>Line height</span><b>{r["lineHeight"]}</b></div><div class="spec"><span>Tracking</span><b>{esc(r["letterSpacing"])}</b>'
            f'{"<i>" + esc(", ".join(extra)) + "</i>" if extra else ""}</div></div></div>'
            f'<div class="sample t-{role}">{esc(SAMPLES.get(role, role))}</div></article>')
    return '\n'.join(rows)


def type_css():
    css = []
    for role, r in T['type'].items():
        if role.startswith('$'):
            continue
        fam = 'var(--display)' if r['family'] == 'display' else 'var(--text)'
        base = (f".t-{role}{{font-family:{fam};line-height:{r['lineHeight']};letter-spacing:{r['letterSpacing']};"
                f"{'text-transform:' + r['transform'] + ';' if r.get('transform') else ''}"
                f"{'font-variant-numeric:' + r['numeric'] + ';' if r.get('numeric') else ''}}}")
        css.append(base)
        for bp in BPS:
            css.append(f".scale[data-bp={bp}] .t-{role}{{font-size:{r[bp]['size'] if 'clamp' not in r[bp]['size'] else max_of(r[bp]['size'])};font-weight:{r[bp]['weight']}}}")
    return '\n'.join(css)


def max_of(clamp):
    # show the 1440 value of a clamp(min, Xvw, max): min(max, X% of 1440)
    m = re.match(r'clamp\(([\d.]+)px,\s*([\d.]+)vw,\s*([\d.]+)px\)', clamp)
    lo, vw, hi = float(m[1]), float(m[2]), float(m[3])
    return f'{max(lo, min(hi, vw * 14.4)):.0f}px'


def space_rows():
    rows = []
    for name, tok in T['space'].items():
        if name.startswith('$'):
            continue
        bars = ''.join(
            f'<td class="num">{tok[bp]}<div class="bar" style="width:{int(tok[bp][:-2])}px"></div></td>' for bp in BPS)
        rows.append(f'<tr><th scope="row"><code>space-{name}</code><div class="dim">{esc(tok["use"])}</div></th>{bars}</tr>')
    return '\n'.join(rows)


def grid_rows():
    rows = []
    for bp in BPS:
        b = T['breakpoint'][bp]
        rng = f"{b['$value']} – {b.get('max', '∞')}"
        rows.append(f"<tr><th scope=row>{BP_LABEL[bp]}</th><td class=num>{rng}</td><td class=mono>{esc(T['grid']['margin'][bp]['$value'])}</td>"
                    f"<td class=num>{T['grid']['columns'][bp]['$value']}</td><td>{esc(b['$description'])}</td></tr>")
    return '\n'.join(rows)


def color_sections():
    names = {'bg': 'Backgrounds', 'text': 'Text', 'coral': 'Coral', 'state': 'States', 'line': 'Lines'}
    intro = {
        'bg': 'Two backgrounds only. Every dark section and the footer use one dark; every light section uses cream.',
        'text': 'Text colours by role. Ratios are measured against both backgrounds.',
        'coral': 'Brand coral and its two companions. The ink gradients colour the second part of a two-part heading.',
        'state': 'System states only. Green is never a brand colour.',
        'line': 'Hairlines and edges. Shown here over the dark background.',
    }
    out = []
    for g, items in T['color'].items():
        cards = ''.join(swatch_card(g, n, t) for n, t in items.items())
        out.append(f'<h3 id="color-{g}">{names[g]}</h3><p class="lead">{intro[g]}</p><div class="swatches">{cards}</div>')
    return '\n'.join(out)


def human(k):
    return re.sub(r'([a-z])([A-Z])', r'\1 \2', k).lower()


def spec_table(c):
    def fmt(v):
        if isinstance(v, dict):
            if set(v) <= set(BPS):
                return ' · '.join(f'{BP_LABEL[b]} {esc(v[b])}' for b in BPS if b in v)
            return '<br>'.join(f'<b>{esc(human(k))}</b> {fmt(x)}' for k, x in v.items())
        return esc(str(v))
    rows = []
    for k, v in c.items():
        if k == 'use':
            continue
        if k == 'states' and isinstance(v, dict) and all(isinstance(x, dict) for x in v.values() if not isinstance(x, str)):
            for var, st in v.items():
                if isinstance(st, str):
                    rows.append(f'<tr><th scope="row">{esc(var)}</th><td>{esc(st)}</td></tr>')
                else:
                    rows.append(f'<tr><th scope="row">{esc(var)} states</th><td>{fmt(st)}</td></tr>')
            continue
        rows.append(f'<tr><th scope="row">{esc(human(k))}</th><td>{fmt(v)}</td></tr>')
    return f'<div class="tw"><table class="spec-t"><tbody>{"".join(rows)}</tbody></table></div>'


COMP_DEMO = {
 'button': """<div class="demo dark"><div class="row"><a class="ds-btn p" href="#components">Book a demo <span aria-hidden="true">↗</span></a><a class="ds-btn s" href="#components">See the Experiences API <span aria-hidden="true">↗</span></a><span class="ds-btn p is-disabled" aria-disabled="true">Disabled <span aria-hidden="true">↗</span></span></div>
  <p class="hint">Hover and Tab to see the states.</p></div>
  <div class="demo cream"><div class="row"><a class="ds-btn p" href="#components">Book a demo <span aria-hidden="true">↗</span></a><a class="ds-btn s on-light" href="#components">How the Experiences API works <span aria-hidden="true">↗</span></a></div></div>
  <div class="demo dark phone"><span class="tag">Phone · 40px, 44px tap area, one width per group</span><div class="col"><a class="ds-btn p ph" href="#components">Book a demo <span aria-hidden="true">↗</span></a><a class="ds-btn s ph" href="#components">See the Experiences API <span aria-hidden="true">↗</span></a></div></div>""",
 'header-button': """<div class="demo dark"><div class="row"><a class="ds-btn s hd" href="#components">Log in</a><a class="ds-btn p hd" href="#components">Book a demo <span aria-hidden="true">↗</span></a></div></div>""",
 'link': """<div class="demo dark"><a class="ds-link" href="#components">See the White-Label Marketplace <span aria-hidden="true">↗</span></a></div><div class="demo cream"><a class="ds-link on-light" href="#components">Meet AIyelet <span aria-hidden="true">↗</span></a></div>""",
 'chip': """<div class="demo dark"><div class="row" role="group" aria-label="Filter example"><button type="button" class="ds-chip" aria-pressed="true">All posts</button><button type="button" class="ds-chip" aria-pressed="false">Industry insights</button><button type="button" class="ds-chip" aria-pressed="false">Partnerships</button></div></div>""",
 'card-quiet': """<div class="demo dark"><div class="cards"><div class="ds-quiet"><span class="ds-card-t">Experiences API</span><span class="ds-card-d">One schema for every supplier.</span></div><div class="ds-quiet"><span class="ds-card-t">White-Label Marketplace</span><span class="ds-card-d">A branded store, live in 3 days.</span></div></div></div>""",
 'card-glass': """<div class="demo dark"><div class="cards"><div class="ds-glass"><span class="ds-card-t">Your hotel</span><span class="ds-card-d">Your stay is confirmed · 18–21 November</span></div></div></div>""",
 'stepper': """<div class="demo dark"><div class="ds-steps">""" + ''.join(f'<div class="ds-step{" on" if i == 1 else ""}" style="--f:{[1,0.55,0,0][i]}"><span class="n">0{i+1}</span><span class="l">{t}</span></div>' for i, t in enumerate(['Aggregate', 'Normalize', 'Distribute', 'Personalize'])) + """</div></div>""",
 'tabs': """<div class="demo dark"><div class="ds-seg" role="group" aria-label="Tabs example"><button type="button" aria-pressed="true">Guest app</button><button type="button" aria-pressed="false">Concierge</button><button type="button" aria-pressed="false">Screens</button></div></div>""",
 'faq': """<div class="demo dark"><div class="ds-faq"><details open><summary>How can hotels sell tours and activities to guests?<span aria-hidden="true"></span></summary><p>Add a branded experiences store or connect the Experiences API to your guest app.</p></details><details><summary>Can Bridgify integrate with our PMS or guest app?<span aria-hidden="true"></span></summary><p>Yes. The API plugs into guest apps and digital concierges.</p></details></div></div>""",
 'icon': """<div class="demo dark"><div class="row" style="align-items:center;gap:28px"><svg width="24" height="24" viewBox="0 0 24 24" class="ds-ico" aria-hidden="true"><path d="M4 7h16v12H4zM8 3v4M16 3v4M4 11h16"/><circle cx="16" cy="15" r="1.6" class="dot"/></svg><svg width="32" height="32" viewBox="0 0 24 24" class="ds-ico" aria-hidden="true"><path d="M4 7h16v12H4zM8 3v4M16 3v4M4 11h16"/><circle cx="16" cy="15" r="1.6" class="dot"/></svg><span class="tag">24 · 32</span></div></div>""",
}
COMP_NAME = {'button': 'Button', 'header-button': 'Header button', 'link': 'Text link', 'chip': 'Chip', 'card-quiet': 'Quiet card',
             'card-glass': 'Glass card', 'stepper': 'Stepper', 'tabs': 'Tabs', 'faq': 'FAQ', 'icon': 'Icon'}


def components_section():
    out = []
    for k, c in T['component'].items():
        out.append(f'<article class="comp" id="c-{k}"><h3>{COMP_NAME.get(k, k)}</h3><p class="lead">{esc(c["use"])}</p>{COMP_DEMO.get(k, "")}{spec_table(c)}</article>')
    return '\n'.join(out)


def scale_rows(group, unit_note=''):
    rows = []
    for name, tok in T[group].items():
        if name.startswith('$'):
            continue
        v = tok['$value']
        vis = f'<div class="rad" style="border-radius:{v}"></div>' if group == 'radius' else f'<div class="shd" style="box-shadow:{v}"></div>'
        rows.append(f'<tr><th scope="row"><code>{group}-{name}</code><div class="dim">{esc(tok.get("$description", ""))}</div></th><td class="mono">{esc(v)}</td><td>{vis}</td></tr>')
    return '\n'.join(rows)


def patterns_section():
    out = []
    for k, pt in T['pattern'].items():
        if k.startswith('$'):
            continue
        img = pt['img']
        shots = '' if not img else ''.join(f'<figure><img src="img/patterns/{img}-{w}.jpg" alt="{esc(pt["name"])}, {lab} today" loading="lazy"><figcaption>{lab} today</figcaption></figure>'
                        for w, lab in (('1440', 'Desktop 1440'), ('768', 'Tablet 768'), ('390', 'Phone 390')))
        rows = ''.join(f'<tr><th scope="row">{BP_LABEL[bp]}</th><td>{esc(pt[bp])}</td></tr>' for bp in BPS)
        change = f'<p class="change"><b>Differs from the site today:</b> {esc(pt["change"])}</p>' if pt.get('change') else ''
        note = f'<p class="dim">{esc(pt["note"])}</p>' if pt.get('note') else ''
        prov = ' <span class="prov">provisional</span>' if pt.get('status') == 'provisional' else ''
        out.append(f'<article class="comp" id="p-{k}"><h3>{esc(pt["name"])}{prov}</h3><p class="lead">Used in: {esc(pt["example"])}</p>{change}'
                   f'<div class="tw"><table class="spec-t"><tbody>{rows}</tbody></table></div>{("<div class=pshots>" + shots + "</div>") if shots else ""}{note}</article>')
    return '\n'.join(out)


def rules_rows():
    return ''.join(f'<tr><th scope="row"><code>rule-{k}</code></th><td class="mono">{esc(str(v["$value"]))}</td><td>{esc(v["$description"])}</td></tr>'
                   for k, v in T['rule'].items() if not k.startswith('$'))


def pages_section():
    out = []
    pats = T['pattern']
    for key, pg in PAGES['pages'].items():
        rows = []
        for i, sec in enumerate(pg['sections']):
            pt = pats[sec['pattern']]
            flags = []
            if pt.get('change'):
                flags.append('<span class="flag diff">differs from today on phone</span>')
            if sec.get('check'):
                flags.append('<span class="flag chk">pattern to confirm</span>')
            rows.append(f'<tr><td class="num">{i + 1:02d}</td><td><b class="st-t">{esc(sec["title"])}</b>{"<div class=dim>#" + esc(sec["id"]) + "</div>" if sec["id"] else ""}{"".join(flags)}</td>'
                        f'<td><a href="#p-{sec["pattern"]}">{esc(pt["name"])}</a></td>'
                        f'<td class="th"><img src="img/pages/{key}-{i:02d}-1440.jpg" alt="Desktop" loading="lazy" width="320"></td>'
                        f'<td class="th ph"><img src="img/pages/{key}-{i:02d}-390.jpg" alt="Phone" loading="lazy" width="100"></td></tr>')
        out.append(f'<article class="comp" id="pg-{key}"><h3>{esc(pg["name"])}</h3><p class="lead"><a href="{esc(pg["url"])}">{esc(pg["url"])}</a> · {len(pg["sections"])} sections, then the shared footer.</p>'
                   f'<div class="tw"><table class="pg-t"><thead><tr><th>#</th><th>Section</th><th>Pattern</th><th>Desktop today</th><th>Phone today</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div></article>')
    return '\n'.join(out)


def motion_section():
    g = ''.join(f'<tr><th scope="row">{esc(m["name"])}</th><td>{esc(m["what"])}</td><td class="mono">{esc(m["timing"])}</td><td>{esc(", ".join(m["files"]))}</td><td>{esc(m["reduced_motion"])}</td></tr>' for m in MOTION['global'])
    rows = []
    for it in MOTION['items']:
        files = ''.join(f'<code>{esc(f)}</code><br>' for f in it['files'])
        anims = ''.join(f'<div class="dim">{esc(a)}</div>' for a in it['css_animations'][:4])
        rows.append(f'<tr><td><b class="st-t">{esc(it["page_name"])}</b><div class="dim">{esc(it["title"][:70])}</div></td>'
                    f'<td>{esc(it["desktop"])}</td><td>{esc(it["phone"])}</td><td>{esc("; ".join(it["behaviour"]))}{anims}</td><td>{files}</td>'
                    f'<td class="nowrap"><a href="{esc(it["view"])}">Run alone</a><br><a href="{esc(it["live"])}">Live ↗</a></td></tr>')
    return (f'<h3>Across the site</h3><div class="tw"><table><thead><tr><th>Effect</th><th>What happens</th><th>Timing</th><th>Code</th><th>Reduced motion</th></tr></thead><tbody>{g}</tbody></table></div>'
            f'<h3>Every animation ({len(MOTION["items"])})</h3><p class="lead">"Run alone" opens the viewer: the section runs by itself with the site\'s own HTML, CSS and JavaScript, at desktop, tablet or phone width (serve the repo root, for example <code>python3 -m http.server</code>). Phone behaviour comes from the phone layer (<code>output/element-lab/adaptive/pages/&lt;page&gt;.js</code>).</p>'
            f'<div class="tw"><table class="mo-t"><thead><tr><th>Section</th><th>Desktop</th><th>Phone</th><th>Behaviour and measured CSS animations</th><th>Source files</th><th>Open</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>'
            f'<p class="note"><b>Rule:</b> {esc(MOTION["rule"])}</p>')


def assets_section():
    sm = ASSETS['summary']
    rows = ''.join(f'<tr><td><code>{esc(f["path"][:80])}</code></td><td>{esc(f["kind"])}</td><td class="num">{esc(f.get("size", ""))}</td><td class="num">{f.get("kb", "")}</td><td class="dim">{esc(", ".join(f["pages"][:6]))}</td></tr>'
                   for f in ASSETS['files'] if f['kind'] != 'external')
    icons = ''.join(f'<figure class="ic"><img src="{esc(i["file"].replace("design-system/", ""))}" alt="" width="28" height="28"><figcaption>{esc(i["id"])}</figcaption></figure>' for i in ASSETS['icons'])
    rules = ''.join(f'<li>{esc(r)}</li>' for r in ASSETS['rules'])
    fonts = ''.join(f'<li><b>{esc(k)}:</b> {esc(v)}</li>' for k, v in ASSETS['fonts'].items())
    return (f'<p class="lead">{sm["images"]} photos and images, {sm["vectors"]} vector files, {sm["fonts"]} font files and {sm["icons"]} icons, '
            f'taken from what the pages actually load. {sm["external"]} files come from outside services (press and blog images).</p>'
            f'<h3>Rules</h3><ul class="plain">{rules}</ul><h3>Fonts</h3><ul class="plain">{fonts}</ul>'
            f'<h3>Icons ({sm["icons"]})</h3><p class="lead">Each one is a separate SVG in <code>design-system/assets/icons/</code>.</p><div class="icons">{icons}</div>'
            f'<h3>Files</h3><div class="tw"><table><thead><tr><th>Path</th><th>Kind</th><th>Size</th><th>KB</th><th>Pages</th></tr></thead><tbody>{rows}</tbody></table></div>')


def handoff_section():
    seo = ''.join(f'<tr><th scope="row">{esc(k)}</th><td>{esc(v["title"] or "")}<div class="dim">{esc((v["description"] or "")[:160])}</div></td><td><code>{esc(v["canonical"] or "")}</code></td><td>{esc(", ".join(v["structured_data"]) or "—")}</td><td>{"yes" if v["open_graph"] else "missing"}</td></tr>' for k, v in HANDOFF['seo'].items())
    routes = ''.join(f'<tr><td><code>{esc(r["source"])}</code></td><td><code>{esc(r["destination"])}</code></td><td>{"redirect" if "permanent" in r else "rewrite"}</td></tr>' for r in HANDOFF['routes']['redirects'] + HANDOFF['routes']['rewrites'])
    forms = ''.join(f'<tr><th scope="row">{esc(k)}</th><td>{esc(", ".join(v["fields"]))}</td><td>{esc(v["submits_to"])}</td></tr>' for k, v in HANDOFF['forms'].items())
    qs = ''.join(f'<li><b>{esc(q["topic"])}:</b> {esc(q["question"])}</li>' for q in HANDOFF['open_questions'])
    lst = lambda k: ''.join(f'<li>{esc(x)}</li>' for x in HANDOFF[k])
    return (f'<p class="lead">{esc(HANDOFF["copy"])}</p>'
            f'<h3>Open questions for the team</h3><ul class="plain qs">{qs}</ul>'
            f'<h3>SEO per page</h3><div class="tw"><table><thead><tr><th>Page</th><th>Title and description</th><th>Canonical</th><th>Structured data</th><th>Open Graph</th></tr></thead><tbody>{seo}</tbody></table></div>'
            f'<h3>Routes (from vercel.json)</h3><div class="tw"><table><thead><tr><th>From</th><th>To</th><th>Type</th></tr></thead><tbody>{routes}</tbody></table></div>'
            f'<h3>Forms</h3><div class="tw"><table><thead><tr><th>Page</th><th>Fields</th><th>Submits to</th></tr></thead><tbody>{forms}</tbody></table></div>'
            f'<h3>Analytics</h3><p class="lead">{esc(HANDOFF["analytics"]["today"])}</p>'
            f'<h3>Accessibility</h3><ul class="plain">{lst("accessibility")}</ul><h3>Performance</h3><ul class="plain">{lst("performance")}</ul><h3>Browsers</h3><ul class="plain">{lst("browsers")}</ul>')


def acceptance_section():
    rows = ''.join(f'<tr><td class="num">{esc(c["id"])}</td><th scope="row">{esc(c["area"])}</th><td>{esc(c["check"])}</td></tr>' for c in ACCEPT['checks'])
    proc = ''.join(f'<li>{esc(x)}</li>' for x in ACCEPT['process'])
    return (f'<p class="lead">{esc(ACCEPT["$description"])} Check every page at {", ".join(ACCEPT["widths"])}.</p>'
            f'<div class="tw"><table><thead><tr><th>#</th><th>Area</th><th>Check</th></tr></thead><tbody>{rows}</tbody></table></div>'
            f'<h3>How we work through it</h3><ol class="plain">{proc}</ol>')


def page():
    css_types = type_css()
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Bridgify Design System</title>
<style>
/* The guide in the brand's own language: dark base, Chillax for headings, Sofia Sans for text, coral used sparingly.
   Layout: a sticky contents column on desktop, one reading column of tables and swatches. */
@font-face{{font-family:Chillax;src:url("fonts/Chillax-Light.otf") format("opentype");font-weight:300}}
@font-face{{font-family:Chillax;src:url("fonts/Chillax-Regular.otf") format("opentype");font-weight:400}}
@font-face{{font-family:Chillax;src:url("fonts/Chillax-Medium.otf") format("opentype");font-weight:500 600}}
@font-face{{font-family:"Sofia Sans";src:url("fonts/SofiaSans-VariableFont_wght.ttf") format("truetype");font-weight:100 900}}
:root{{--bg:#180F10;--panel:#21171A;--line:#3A2B2C;--fg:#EEE9DE;--body:#D7C9BD;--muted:#B9A99F;--coral:#F46649;--coral3:#FFB194;
  --display:Chillax,"Sofia Sans",system-ui,sans-serif;--text:"Sofia Sans",system-ui,sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,monospace;color-scheme:dark}}
*{{box-sizing:border-box}}
html{{scroll-behavior:smooth}}
body{{margin:0;background:var(--bg);color:var(--body);font:400 16px/1.55 var(--text);
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:0 96px}}
.layout{{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:220px minmax(0,1fr);gap:56px}}
@media (max-width:900px){{.layout{{grid-template-columns:minmax(0,1fr);gap:24px}}}}
nav.toc{{position:sticky;top:env(safe-area-inset-top,0px);align-self:start;padding-top:48px;display:flex;flex-direction:column;gap:4px;font-size:14px}}
@media (max-width:900px){{nav.toc{{position:static;flex-direction:row;flex-wrap:wrap;padding-top:24px}}}}
nav.toc a{{color:var(--muted);text-decoration:none;padding:6px 0;min-height:32px}}
nav.toc a:hover,nav.toc a:focus-visible{{color:var(--fg)}}
nav.toc .soon{{color:#6F625B;padding:6px 0}}
@media (max-width:900px){{nav.toc a,nav.toc .soon{{border:1px solid var(--line);border-radius:999px;padding:6px 12px}}}}
main{{min-width:0;padding-top:48px}}
a{{color:var(--coral3)}}
:focus-visible{{outline:2px solid var(--coral);outline-offset:2px}}
.eyebrow{{font:550 12px/1.4 var(--text);letter-spacing:.15em;text-transform:uppercase;color:var(--coral3);display:flex;gap:10px;align-items:center}}
.eyebrow::before{{content:"";width:7px;height:7px;border-radius:50%;background:linear-gradient(#FFB194,#F46649)}}
h1{{font:300 clamp(40px,5vw,60px)/1.1 var(--display);letter-spacing:-.025em;color:var(--fg);margin:16px 0 16px;text-wrap:balance}}
h2{{font:300 clamp(30px,3vw,40px)/1.2 var(--display);letter-spacing:-.02em;color:var(--fg);margin:0 0 12px;text-wrap:balance}}
h3{{font:300 24px/1.25 var(--display);color:var(--fg);margin:40px 0 8px}}
section.ch{{border-top:1px solid var(--line);padding-top:48px;margin-top:64px;scroll-margin-top:16px}}
.lead{{max-width:68ch;margin:0 0 20px}}
.meta{{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0}}
.pill{{border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:13px;color:var(--muted)}}
.status-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px;margin-top:32px}}
.st{{border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px}}
.st b{{font:300 20px/1.3 var(--display);color:var(--fg)}}
.st span{{font-size:13px;color:var(--muted)}}
.st.done{{border-color:#F4664966}} .st.done span{{color:var(--coral3)}}
code,.mono{{font-family:var(--mono);font-size:13px}}
code{{color:var(--fg)}}
.dim{{color:var(--muted);font-size:13px;font-weight:400;line-height:1.45;margin-top:4px}}
.tw{{overflow-x:auto;border:1px solid var(--line);border-radius:12px}}
table{{border-collapse:collapse;width:100%;font-size:14px}}
th,td{{text-align:start;vertical-align:top;padding:14px 16px;border-bottom:1px solid var(--line)}}
thead th{{font:550 12px/1.4 var(--text);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--panel);white-space:nowrap}}
tbody tr:last-child>*{{border-bottom:0}}
tbody th{{font-weight:400;min-width:200px}}
td.num{{font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--fg)}}
.bar{{height:6px;border-radius:3px;background:var(--coral);margin-top:8px;max-width:100%}}
.swatches{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:12px}}
.swatch{{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--panel);display:flex;flex-direction:column}}
.chipc{{height:96px;display:flex;align-items:flex-end;padding:12px;font:550 12px/1 var(--text);letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--line)}}
.sw-body{{padding:14px 16px;display:flex;flex-direction:column;gap:6px;font-size:14px}}
.sw-body p{{margin:0;color:var(--body);font-size:13px;line-height:1.5}}
.sw-top{{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}}
.val{{color:var(--fg);word-break:break-all}}
.ratios{{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}}
.ratio{{font-size:12px;border-radius:999px;padding:2px 8px;border:1px solid var(--line)}}
.ratio.aa{{color:#9BDDB5;border-color:#3D5B48}} .ratio.large{{color:#E3B25C;border-color:#5C4A28}} .ratio.fail{{color:#E89A8C;border-color:#5C2F28}}
.prov{{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#E3B25C;border:1px solid #5C4A28;border-radius:999px;padding:1px 8px}}
.seg{{display:inline-flex;border:1px solid var(--line);border-radius:10px;padding:3px;gap:3px;margin:0 0 16px}}
.seg button{{font:550 14px/1 var(--text);color:var(--muted);background:none;border:0;border-radius:7px;padding:10px 16px;cursor:pointer;min-height:40px}}
.seg button[aria-pressed=true]{{background:var(--coral);color:#180F10}}
.scale{{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden}}
.role{{display:flex;flex-direction:column;gap:16px;padding:20px;border-bottom:1px solid var(--line)}}
.role:last-child{{border-bottom:0}}
.role-meta{{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:16px 32px}}
@media (max-width:700px){{.role-meta{{grid-template-columns:minmax(0,1fr)}}}}
.specs{{display:flex;flex-wrap:wrap;gap:8px 24px}}
.spec{{display:flex;flex-direction:column;gap:2px;font-size:13px;font-variant-numeric:tabular-nums}}
.spec span{{color:var(--muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase}}
.spec b{{color:var(--fg);font-weight:500}} .spec i{{font-style:normal;color:var(--muted)}}
.scale[data-bp=desktop] .bp-desktop,.scale[data-bp=tablet] .bp-tablet,.scale[data-bp=phone] .bp-phone{{border-inline-start:2px solid var(--coral);padding-inline-start:8px}}
.sample{{color:var(--fg);overflow-wrap:anywhere}}
.t-eyebrow,.t-index{{color:var(--coral3)}} .t-caption,.t-small{{color:var(--body)}} .t-cta{{color:var(--coral3)}}
{css_types}
.families{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}}
.fam{{border:1px solid var(--line);border-radius:12px;padding:20px;background:var(--panel);display:flex;flex-direction:column;gap:8px}}
.fam .big{{font-size:44px;line-height:1.1;color:var(--fg)}}
.note{{border:1px solid #5C4A28;border-radius:12px;padding:16px 20px;color:#EBD9B4;font-size:14px;max-width:80ch}}
.note b{{color:#F3E4C4;font-weight:600}}
ul.plain{{margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:6px;max-width:75ch}}
article.comp{{border-top:1px solid var(--line);padding-top:8px;margin-top:32px;display:flex;flex-direction:column;gap:14px}}
article.comp h3{{margin-top:16px}}
.demo{{border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:12px;min-width:0}}
.demo.dark{{background:#180F10;border:1px solid var(--line)}}
.demo.cream{{background:#EEE9DE}}
.demo.phone{{max-width:390px}}
.demo .row{{display:flex;flex-wrap:wrap;gap:12px;align-items:center}}
.demo .col{{display:flex;flex-direction:column;gap:12px}}
.demo .tag,.tag{{font-size:12px;color:var(--muted)}}
.hint{{margin:0;font-size:13px;color:var(--muted)}}
.ds-btn{{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 24px;border-radius:10px;border:1px solid #F46649;font:550 16px/1.25 var(--text);text-decoration:none;white-space:nowrap;transition:background .3s,box-shadow .3s,transform .15s}}
.ds-btn.p{{background:linear-gradient(105deg,#FF9862,#F46649);color:#180F10;box-shadow:inset 0 1px 1px #FFD9C288}}
.ds-btn.p:hover,.ds-btn.p:focus-visible{{background:linear-gradient(105deg,#FFAD80,#F7704F);box-shadow:inset 0 1px 1px #FFE3CC99,0 12px 28px #F4664940}}
.ds-btn.s{{background:transparent;color:#FFF8F1}}
.ds-btn.s:hover,.ds-btn.s:focus-visible{{background:#F466491A}}
.ds-btn.s.on-light{{color:#180F10}}
.ds-btn:active{{transform:translateY(1px)}}
.ds-btn:focus-visible{{outline:2px solid #F46649;outline-offset:4px}}
.ds-btn.is-disabled{{opacity:.4;pointer-events:none}}
.ds-btn.ph{{height:40px;padding:0 18px;width:100%}}
.ds-btn.ph::after{{content:"";position:absolute;inset:-2px 0}}
.ds-btn.hd{{height:36px;padding:0 16px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}}
.ds-link{{font:550 16px/1.25 var(--text);color:#FFB194;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}}
.ds-link.on-light{{color:#F46649}}
.ds-link span{{display:inline-block;transition:transform .2s}}
.ds-link:hover,.ds-link:focus-visible{{color:#FFE2C6}} .ds-link.on-light:hover{{color:#D9482C}}
.ds-link:hover span,.ds-link:focus-visible span{{transform:translate(3px,-3px)}}
.ds-chip{{height:40px;padding:0 16px;border-radius:999px;font:550 14px/1 var(--text);color:#EEE9DE;background:transparent;border:1px solid #F6C8B594;cursor:pointer}}
.ds-chip:hover{{border-color:#F46649}}
.ds-chip[aria-pressed=true]{{background:linear-gradient(105deg,#FF9862,#F46649);color:#180F10;border-color:#F46649}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:16px}}
.ds-quiet,.ds-glass{{border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:8px}}
.ds-quiet{{border:1px solid #EEE9DE2E;background:linear-gradient(125deg,#EEE9DE04,#211A181C)}}
.ds-glass{{border:1px solid #F6C8B594;background:radial-gradient(at 100% 0%,#FF89622E,#0000 30%),radial-gradient(at 0% 100%,#FF78532B,#0000 26%),linear-gradient(115deg,#FFF8F10C,#0000 40%,#FFF8F108),#140D0BF2;box-shadow:inset 0 1px 1px #FFF1DA94,inset 0 -1px 1px #FF997B75,0 24px 60px #0006}}
.ds-card-t{{font:300 24px/1.25 var(--display);letter-spacing:-.02em;color:#EEE9DE}}
.ds-card-d{{font-size:14px;color:#D7C9BD}}
.ds-steps{{display:grid;gap:2px;max-width:420px}}
.ds-step{{position:relative;display:grid;grid-template-columns:32px 1fr;align-items:center;min-height:48px;padding:0 14px;font:550 13px/1.2 var(--text);letter-spacing:.12em;text-transform:uppercase;color:#A99D94}}
.ds-step::before,.ds-step::after{{content:"";position:absolute;left:0;top:8px;bottom:8px;width:2px;border-radius:2px;background:#B28A683D}}
.ds-step::after{{background:#F46649;transform-origin:top;transform:scaleY(var(--f,0))}}
.ds-step .n{{color:#FFB194;font-weight:600;letter-spacing:.04em;font-variant-numeric:tabular-nums}}
.ds-step.on{{color:#FFF8F1}}
.ds-seg{{display:inline-flex;gap:4px;padding:4px;border:1px solid #EEE9DE2E;border-radius:12px}}
.ds-seg button{{height:40px;padding:0 16px;border-radius:9px;border:0;background:transparent;color:#D7C9BD;font:550 15px/1 var(--text);cursor:pointer}}
.ds-seg button:hover{{color:#EEE9DE}}
.ds-seg button[aria-pressed=true]{{background:linear-gradient(105deg,#FF9862,#F46649);color:#180F10}}
.ds-faq details{{border-top:1px solid #EEE9DE2E}}
.ds-faq summary{{list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center;padding:20px 0;cursor:pointer;font:300 20px/1.35 var(--display);color:#EEE9DE}}
.ds-faq summary::-webkit-details-marker{{display:none}}
.ds-faq summary span::before{{content:"+";color:#F46649;font:400 22px/1 var(--text)}}
.ds-faq details[open] summary span::before{{content:"−"}}
.ds-faq p{{margin:0 0 20px;max-width:68ch;color:#D7C9BD}}
.ds-ico{{fill:none;stroke:#F46649;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}}
.ds-ico .dot{{fill:#FFE2C6;stroke:#F46649;stroke-width:.5}}
.spec-t th{{width:200px;color:var(--fg)}} .spec-t td{{color:var(--body)}} .spec-t td b{{color:var(--fg);font-weight:500}}
.pshots{{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1.8fr) minmax(0,1.1fr);gap:10px;align-items:start}}
@media (max-width:700px){{.pshots{{grid-template-columns:1fr 1fr}}.pshots figure:first-child{{grid-column:1/-1}}}}
.pshots figure{{margin:0;display:flex;flex-direction:column;gap:6px;min-width:0}}
.pshots figcaption{{font-size:12px;color:var(--muted)}}
.pshots img{{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px}}
.change{{margin:0;border:1px solid #5C4A28;border-radius:10px;padding:10px 14px;color:#EBD9B4;font-size:14px;max-width:85ch}}
.change b{{color:#F3E4C4}}
.pg-t td{{vertical-align:top}}
.pg-t .th img{{display:block;width:320px;max-width:none;height:auto;border:1px solid var(--line);border-radius:6px}}
.pg-t .th.ph img{{width:100px}}
.pg-t a{{color:var(--coral3)}}
.st-t{{color:var(--fg);font-weight:500}}
.flag{{display:inline-block;margin-top:8px;margin-inline-end:6px;font-size:11px;letter-spacing:.04em;border-radius:999px;padding:2px 8px}}
.flag.diff{{color:#EBD9B4;border:1px solid #5C4A28}} .flag.chk{{color:#9BC7DD;border:1px solid #2E4A5C}}
.mo-t td{{vertical-align:top}} .nowrap{{white-space:nowrap}}
.icons{{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}}
.ic{{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border:1px solid var(--line);border-radius:10px;background:var(--panel)}}
.ic figcaption{{font-size:11px;color:var(--muted);text-align:center;word-break:break-all}}
ul.qs li{{margin-bottom:4px}}
.rad{{width:96px;height:56px;border:1px solid #F6C8B594;background:var(--panel)}}
.shd{{width:120px;height:56px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}}
@media (max-width:560px){{.ds-btn:not(.ph):not(.hd){{height:40px;padding:0 18px}}}}
@media (prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}}}
</style>
</head>
<body>
<div class="layout">
<nav class="toc" aria-label="Contents">
  <a href="#overview">Overview</a>
  <a href="#grid">Breakpoints and grid</a>
  <a href="#color">Color</a>
  <a href="#type">Typography</a>
  <a href="#space">Spacing</a>
  <a href="#surfaces">Radius, shadow, glass</a>
  <a href="#components">Components</a>
  <a href="#patterns">Patterns</a>
  <a href="#rules">Site rules</a>
  <a href="#pages">Pages</a>
  <a href="#motion">Motion</a>
  <a href="#assets">Assets</a>
  <a href="#build">Build notes</a>
  <a href="#acceptance">Acceptance</a>
  <a href="#files">Files</a>
</nav>
<main>
<section id="overview">
  <div class="eyebrow">Bridgify · Design system</div>
  <h1>Bridgify Design System</h1>
  <p class="lead">The reference for building bridgify.io. Every colour, type style and spacing value the site uses is named here once, with its value on desktop, tablet and phone. The live site is the reference for behaviour and motion; where the site and this guide differ, this guide wins.</p>
  <p class="lead">Every value comes from <code>tokens.json</code>. Import it, or use <code>tokens.css</code>, instead of copying values from the pages.</p>
  <div class="meta"><span class="pill">Version {T['meta']['version']}</span><span class="pill">{T['meta']['date']}</span><span class="pill">Values marked <span class="prov">provisional</span> are decided in a later chapter</span></div>
  <div class="status-grid">
    <div class="st done"><b>Foundations</b><span>Ready: grid, color, type, spacing</span></div>
    <div class="st done"><b>Components</b><span>Ready: buttons, links, chips, cards, stepper, tabs, FAQ, icons</span></div>
    <div class="st done"><b>Patterns</b><span>Ready: 15 section types on desktop, tablet and phone</span></div>
    <div class="st done"><b>Pages</b><span>Ready: 16 pages, 107 sections mapped to patterns</span></div>
    <div class="st done"><b>Motion</b><span>Ready: 57 animations with their code and a viewer</span></div>
    <div class="st done"><b>Assets</b><span>Ready: images, icons, logos, fonts</span></div>
    <div class="st done"><b>Build notes and acceptance</b><span>Ready: SEO, routes, forms, checks; 7 open questions</span></div>
  </div>
</section>

<section class="ch" id="grid">
  <div class="eyebrow">Foundations</div>
  <h2>Breakpoints and grid</h2>
  <p class="lead">Three layouts. Every section's content starts and ends on one line, the page margin; no section has its own side padding or max width. On large screens the content stops at {T['grid']['content-max']['$value']} and is centred.</p>
  <div class="tw"><table>
    <thead><tr><th>Device</th><th>Width</th><th>Page margin</th><th>Columns</th><th>Check at</th></tr></thead>
    <tbody>{grid_rows()}</tbody>
  </table></div>
</section>

<section class="ch" id="color">
  <div class="eyebrow">Foundations</div>
  <h2>Color</h2>
  <p class="lead">{len([1 for g in T['color'].values() for _ in g])} colours replace the 83 text colours and 11 backgrounds measured on the live site. Use the token name, never the hex value.</p>
  {color_sections()}
  <p class="note"><b>Owner decision, kept as an exception:</b> links and coral text on cream use coral 500 (#F46649), 2.5:1 on cream. That is below WCAG AA for small text; use it at 16px weight 550 or larger, and never for running text.</p>
</section>

<section class="ch" id="type">
  <div class="eyebrow">Foundations</div>
  <h2>Typography</h2>
  <p class="lead">Two families and 13 roles. Pick the role by what the text does, not by its HTML tag: a title inside a phone mock-up is part of the illustration, not a section heading.</p>
  <div class="families">
    <div class="fam"><span class="dim">Display · headings and numbers</span><span class="big" style="font-family:var(--display);font-weight:300">Chillax</span><span class="dim">Light 300 for headings. Regular 400 for titles on phones. Medium 500 for large numbers only.</span></div>
    <div class="fam"><span class="dim">Text · everything else</span><span class="big" style="font-family:var(--text);font-weight:400">Sofia Sans</span><span class="dim">Variable. 400 text, 550 buttons and labels, 600 step numbers.</span></div>
    <div class="fam"><span class="dim">Code windows only</span><span class="big" style="font-family:var(--mono);font-size:30px">ui-monospace</span><span class="dim">The system monospace. No Arial, no Georgia anywhere.</span></div>
  </div>
  <h3>Type scale</h3>
  <p class="lead">Samples are drawn at the selected device's size. Desktop sizes are fluid between the tablet value and the desktop maximum; the samples show the 1440 value.</p>
  <div class="seg" role="group" aria-label="Show sizes for">
    <button type="button" data-bp="desktop" aria-pressed="true">Desktop 1440</button><button type="button" data-bp="tablet" aria-pressed="false">Tablet 768</button><button type="button" data-bp="phone" aria-pressed="false">Phone 390</button>
  </div>
  <div class="scale" data-bp="desktop">{type_rows()}</div>
  <h3>Text inside illustrations</h3>
  <p class="lead">{esc(T['rule']['illustration-text-min']['$description'])}</p>
</section>

<section class="ch" id="space">
  <div class="eyebrow">Foundations</div>
  <h2>Spacing</h2>
  <p class="lead">Space between elements comes only from this table. Each token is named by the two things it separates. Bars are drawn to scale.</p>
  <div class="tw"><table>
    <thead><tr><th>Token</th><th>Desktop</th><th>Tablet</th><th>Phone</th></tr></thead>
    <tbody>{space_rows()}</tbody>
  </table></div>
</section>

<section class="ch" id="surfaces">
  <div class="eyebrow">Foundations</div>
  <h2>Radius, shadow and glass</h2>
  <p class="lead">Four radii replace the 14 measured on cards and panels. Buttons keep their own 10px.</p>
  <div class="tw"><table><thead><tr><th>Token</th><th>Value</th><th>Shape</th></tr></thead><tbody>{scale_rows('radius')}</tbody></table></div>
  <h3>Shadows</h3>
  <div class="tw"><table><thead><tr><th>Token</th><th>Value</th><th>Example</th></tr></thead><tbody>{scale_rows('shadow')}</tbody></table></div>
  <h3>Glass</h3>
  <p class="lead">{esc(T['glass']['$description'])} One recipe for every glass surface.</p>
  <div class="demo dark"><div class="cards"><div class="ds-glass"><span class="ds-card-t">Glass</span><span class="ds-card-d">Corner lights, translucent body, peach edge, rim light, soft shadow.</span></div></div></div>
  <div class="tw"><table class="spec-t"><tbody>{''.join(f"<tr><th scope=row>{esc(k)}</th><td class=mono>{esc(str(v['$value']))}{('<div class=dim>' + esc(v['$description']) + '</div>') if v.get('$description') else ''}</td></tr>" for k, v in T['glass'].items() if not k.startswith('$'))}</tbody></table></div>
</section>

<section class="ch" id="components">
  <div class="eyebrow">Components</div>
  <h2>Components</h2>
  <p class="lead">Each component: what it is for, a live example (hover and Tab work), and its measurements on every device. Build these once and reuse them; a section never restyles a component.</p>
  {components_section()}
</section>

<section class="ch" id="patterns">
  <div class="eyebrow">Patterns</div>
  <h2>Section patterns</h2>
  <p class="lead">Every section on the site is one of these types. Each type behaves the same way on every page: build the pattern once, then fill it with each page's content. The screenshots show the example as it looks on the site today; where the spec differs, it says so.</p>
  {patterns_section()}
</section>

<section class="ch" id="rules">
  <div class="eyebrow">Patterns</div>
  <h2>Site rules</h2>
  <div class="tw"><table><thead><tr><th>Rule</th><th>Value</th><th>What it means</th></tr></thead><tbody>{rules_rows()}</tbody></table></div>
</section>

<section class="ch" id="pages">
  <div class="eyebrow">Pages</div>
  <h2>Pages</h2>
  <p class="lead">Every page, section by section, with the pattern each section uses. Build the page by stacking its patterns in this order and filling them with the page's copy (the live page follows Copy v4). The screenshots show the site today; a flag marks where the spec differs or where the pattern should be confirmed.</p>
  {pages_section()}
</section>

<section class="ch" id="motion">
  <div class="eyebrow">Motion</div>
  <h2>Motion</h2>
  {motion_section()}
</section>

<section class="ch" id="assets">
  <div class="eyebrow">Assets</div>
  <h2>Assets</h2>
  {assets_section()}
</section>

<section class="ch" id="build">
  <div class="eyebrow">Build notes</div>
  <h2>Beyond the look</h2>
  {handoff_section()}
</section>

<section class="ch" id="acceptance">
  <div class="eyebrow">Acceptance</div>
  <h2>Acceptance</h2>
  {acceptance_section()}
</section>

<section class="ch" id="files">
  <div class="eyebrow">Handoff</div>
  <h2>Files</h2>
  <ul class="plain">
    <li><code>design-system/tokens.json</code>: every value in this chapter (W3C design tokens format). The single source.</li>
    <li><code>design-system/tokens.css</code>: the same values as CSS custom properties, switching at 600 and 1024.</li>
    <li><code>design-system/motion.json</code> and <code>design-system/motion/view.html</code>: every animation, its files and timings, and the viewer.</li>
    <li><code>design-system/assets.json</code> and <code>design-system/assets/icons/</code>: every file the pages load, and the 52 icons as SVG.</li>
    <li><code>design-system/handoff.json</code>: SEO, routes, forms, analytics, accessibility, performance and open questions.</li>
    <li><code>design-system/acceptance.json</code>: the checks every page passes.</li>
    <li><code>design-system/pages.json</code>: every page's sections and their patterns.</li>
    <li><code>design-system/img/pages/</code>: today's screenshot of every section at 1440 and 390.</li>
    <li><code>design-system/img/patterns/</code>: today's screenshots of each pattern's example at 1440, 768 and 390.</li>
    <li><code>design-system/fonts/</code>: Chillax Light, Regular, Medium and Sofia Sans variable.</li>
  </ul>
</section>
</main>
</div>
<script>
document.querySelectorAll('.ds-chip,.ds-seg button').forEach(b=>b.addEventListener('click',()=>{{b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}}));
document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{{
  document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  document.querySelector('.scale').dataset.bp=b.dataset.bp;
  document.querySelector('.scale').style.maxWidth=b.dataset.bp==='phone'?'390px':(b.dataset.bp==='tablet'?'768px':'');
}}));
</script>
</body>
</html>
'''


def main():
    files = {'tokens.css': build_css(), 'index.html': page()}
    if '--check' in sys.argv:
        stale = [n for n, c in files.items() if not os.path.exists(os.path.join(HERE, n)) or open(os.path.join(HERE, n)).read() != c]
        if stale:
            print('stale:', ', '.join(stale), '(run python3 design-system/build.py)')
            sys.exit(1)
        print('design system is up to date')
        return
    for n, c in files.items():
        open(os.path.join(HERE, n), 'w').write(c)
        print('wrote', n)


if __name__ == '__main__':
    main()
