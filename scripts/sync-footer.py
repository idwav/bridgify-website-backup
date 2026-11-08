#!/usr/bin/env python3
"""Keep the shared footer in every public page as crawlable, no-JS HTML.

Edit partials/site-footer.html, then run python3 scripts/sync-footer.py.
Use --check before publishing to detect drift without writing files.
"""
from pathlib import Path
import argparse
import re

ROOT = Path(__file__).resolve().parent.parent
PAGES = ('index.html', 'index-v2.html', 'api.html', 'marketplace.html',
         'personalization.html', 'otas.html', 'airlines.html', 'hotels.html',
         'loyalty-finance.html', 'travel-technology.html', 'super-apps.html',
         'developers.html', 'insights.html', 'press.html', 'about-us.html',
         'careers.html', 'contact.html', 'login.html')
START, END = '<!-- SHARED FOOTER START -->', '<!-- SHARED FOOTER END -->'
CSS = '<link rel="stylesheet" href="shared-footer.css?v=1">'
JS = '<script src="shared-footer.js?v=1" defer></script>'


def footer_bounds(source):
    if START in source:
        start = source.index(START)
        end = source.index(END, start) + len(END)
        opening = re.search(r'<footer\b[^>]*>', source[start:end]).group()
        return start, end, opening
    match = re.search(r'<(section|footer)\b[^>]*class="[^"]*\b(?:final-cta|al-footer)\b[^"]*"[^>]*>', source)
    if not match:
        raise ValueError('No existing footer found')
    tag, depth = match.group(1), 1
    for token in re.finditer(r'</?' + tag + r'\b[^>]*>', source[match.end():]):
        depth += -1 if token.group().startswith('</') else 1
        if depth == 0:
            return match.start(), match.end() + token.end(), match.group()
    raise ValueError('Unclosed footer')


def render(name, source, template):
    start, end, opening = footer_bounds(source)
    footer_id = re.search(r'\bid="([^"]+)"', opening)
    markup = template.replace('{{FOOTER_ID}}', footer_id.group(1) if footer_id else 'site-footer')
    # Contact has its enquiry form; Press closes with its media-enquiry CTA.
    has_own_cta = name in {'contact.html', 'press.html'}
    cta = '' if has_own_cta else (ROOT / 'partials/recurring-cta.html').read_text()
    markup = markup.replace('{{CTA_BAND}}', cta)
    markup = '\n'.join(line.rstrip() for line in markup.splitlines())
    before, after = source[:start], source[end:]
    # A site footer belongs outside the main landmark, unlike the old CTA section.
    close_main = re.match(r'\s*</main>', after)
    if close_main:
        before += close_main.group()
        after = after[close_main.end():]
    result = before + START + '\n' + markup.rstrip() + '\n' + END + after
    if 'href="shared-footer.css?' not in result:
        result = result.replace('</head>', CSS + JS + '</head>', 1)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    template = (ROOT / 'partials/site-footer.html').read_text()
    changed = []
    for name in PAGES:
        path = ROOT / name
        source = path.read_text()
        result = render(name, source, template)
        if result != source:
            changed.append(name)
            if not args.check:
                path.write_text(result)
    if args.check and changed:
        raise SystemExit('Footer drift: ' + ', '.join(changed))
    print(f'{len(PAGES)} public pages checked; {len(changed)} ' + ('need sync.' if args.check else 'updated.'))
