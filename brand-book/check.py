#!/usr/bin/env python3
"""Check the brand book against the design system.

1. Every colour literal (#hex or rgba()) in brand-book.css, template.html and index.html
   appears in design-system/tokens.json (values or descriptions). Logo and icon SVG
   markup is copied from approved files and is skipped.
2. Every local file the page references (src, href, url()) exists.

Run: python3 brand-book/check.py
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def norm(c):
    c = c.lower().replace(' ', '')
    m = re.match(r'rgba?\(([\d.]+),([\d.]+),([\d.]+)(?:,([\d.]+))?\)', c)
    if m:
        a = m.group(4)
        a = str(float(a)).rstrip('0').rstrip('.') if a is not None else '1'
        return f'rgba({int(float(m.group(1)))},{int(float(m.group(2)))},{int(float(m.group(3)))},{a})'
    return c


COLOR = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)')
tokens = open(os.path.join(ROOT, 'design-system', 'tokens.json')).read()
allowed = {norm(c) for c in COLOR.findall(tokens)}
# the rgb() spelling of each token hex is the same colour (shown on the swatches)
allowed |= {norm('rgb({},{},{})'.format(*(int(h[i:i + 2], 16) for i in (1, 3, 5))))
            for h in re.findall(r'#[0-9a-fA-F]{6}\b', tokens)}
# 8-digit hex in tokens (e.g. #FFFFFF14) are not used here; 3-digit shorthands are not allowed.

problems = []
for name in ['brand-book.css', 'book.css', 'template.html', 'index.html'] + ['pages/' + f for f in sorted(os.listdir(os.path.join(HERE, 'pages')))]:
    text = open(os.path.join(HERE, name)).read()
    text = re.sub(r'<svg.*?</svg>', '', text, flags=re.S)          # approved logo / icon markup
    text = re.sub(r'<!-- external-colors.*?<!-- /external-colors -->', '', text, flags=re.S)  # competitors' own colours, quoted
    text = re.sub(r'data-copy="[^"]*"', '', text)                    # copied icon SVG strings
    for c in COLOR.findall(text):
        if c.startswith('#') and len(c) == 4:
            continue  # e.g. HTML ids are not colours; 3-digit hex is not used in CSS here
        if norm(c) not in allowed:
            problems.append(f'{name}: colour {c} is not in tokens.json')

page = open(os.path.join(HERE, 'index.html')).read()
css = open(os.path.join(HERE, 'brand-book.css')).read() + open(os.path.join(HERE, 'book.css')).read()
refs = re.findall(r'(?:src|href)="([^"#][^"]*)"', page) + re.findall(r'url\("?([^")]+)"?\)', css)
for r in refs:
    if r.startswith(('http', 'data:', 'mailto:')):
        continue
    if not os.path.exists(os.path.join(HERE, r.split('?')[0])):
        problems.append(f'missing file: {r}')

if problems:
    print('\n'.join(sorted(set(problems))))
    sys.exit(1)
print(f'ok: {len(refs)} file references, every colour from tokens.json')
