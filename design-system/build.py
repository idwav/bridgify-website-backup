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
BPS = ['desktop', 'tablet', 'phone']
BP_LABEL = {'desktop': 'Desktop', 'tablet': 'Tablet', 'phone': 'Phone'}
esc = html.escape


def luminance(hex_):
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
    names = {'bg': 'Backgrounds', 'text': 'Text', 'coral': 'Coral', 'state': 'States'}
    intro = {
        'bg': 'Two backgrounds only. Every dark section and the footer use one dark; every light section uses cream.',
        'text': 'Text colours by role. Ratios are measured against both backgrounds.',
        'coral': 'Brand coral and its two companions. The ink gradients colour the second part of a two-part heading.',
        'state': 'System states only. Green is never a brand colour.',
    }
    out = []
    for g, items in T['color'].items():
        cards = ''.join(swatch_card(g, n, t) for n, t in items.items())
        out.append(f'<h3 id="color-{g}">{names[g]}</h3><p class="lead">{intro[g]}</p><div class="swatches">{cards}</div>')
    return '\n'.join(out)


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
  <a href="#files">Files</a>
  <span class="soon">Components · next</span>
  <span class="soon">Patterns</span>
  <span class="soon">Pages</span>
  <span class="soon">Motion</span>
  <span class="soon">Assets</span>
  <span class="soon">Acceptance</span>
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
    <div class="st"><b>Components</b><span>Next: buttons, cards, tabs, header, footer</span></div>
    <div class="st"><b>Patterns</b><span>Section layouts and their phone behaviour</span></div>
    <div class="st"><b>Pages</b><span>16 pages, section by section</span></div>
    <div class="st"><b>Motion, assets, acceptance</b><span>After pages</span></div>
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

<section class="ch" id="files">
  <div class="eyebrow">Handoff</div>
  <h2>Files</h2>
  <ul class="plain">
    <li><code>design-system/tokens.json</code>: every value in this chapter (W3C design tokens format). The single source.</li>
    <li><code>design-system/tokens.css</code>: the same values as CSS custom properties, switching at 600 and 1024.</li>
    <li><code>design-system/fonts/</code>: Chillax Light, Regular, Medium and Sofia Sans variable.</li>
  </ul>
</section>
</main>
</div>
<script>
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
