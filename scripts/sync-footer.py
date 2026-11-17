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
CSS = '<link rel="stylesheet" href="shared-footer.css?v=2">'
JS = '<script src="shared-footer.js?v=2" defer></script>'


ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
DEMO = ('Book a demo', 'contact.html')
# Copy v4 gives most inner pages their own closing CTA; pages not listed keep the recurring band.
PAGE_CTAS = {
    'about-us.html': ('See how Bridgify could work', 'for your business.',
                      "Tell us who your customers are and what you want to offer them. We'll help you choose the right product.",
                      [DEMO, ('Join the team', 'careers.html'), ('Press', 'press.html')]),
    'api.html': ('Discuss your', 'API integration.',
                 "Tell us what you're building and where experiences should appear. We'll walk through the integration with you.",
                 [DEMO, ('Read the docs', 'developers.html')]),
    'marketplace.html': ('Discuss your', 'marketplace launch.',
                         "Tell us about your audience, markets and brand. We'll define the offering together.", [DEMO]),
    'personalization.html': ('Discuss personalization', 'for your product.',
                             "Tell us where customers discover experiences in your product. We'll show you how AIyelet would work there.", [DEMO]),
    'otas.html': ('Discuss adding experiences', 'to your travel platform.',
                  "Tell us about your customers, markets and booking flow. We'll recommend the supply and product that fit.", [DEMO]),
    'airlines.html': ("Plan your airline's", 'experiences offering.',
                      "Tell us where experiences could fit into your passenger journey. We'll map the channels and the integration with you.", [DEMO]),
    'loyalty-finance.html': ('Discuss an experiences offering', 'for your members.',
                             "Tell us about your program, your members and your points currency. We'll help you define the offering and the integration.", [DEMO]),
    'travel-technology.html': ('Discuss how experiences fit', 'into your platform.',
                               "Tell us what you're building. We'll work through the integration, distribution and customer journey with you.", [DEMO]),
    'hotels.html': ("Plan your hotel's", 'experiences offering.',
                    "Tell us about your properties, destinations and guest journey. We'll recommend the supply and product that fit.", [DEMO]),
    'super-apps.html': ('Discuss an experiences offering', 'for your platform.',
                        "Tell us about your users, markets and product. We'll work through the integration and personalization with you.", [DEMO]),
    'insights.html': ('Have an experiences', 'project in mind?',
                      "Tell us what you're exploring. We'll answer the questions that matter to your team.", [('Talk to us', 'contact.html')]),
    'careers.html': ("Don't see", 'your role?',
                     "If you'd make this team better, tell us how.", []),
}


def cta_band(lead, accent, body, buttons):
    """Closing CTA: its own centered card above the footer (not part of the footer)."""
    links = '\n'.join(
        f'        <a class="{"bf-cta-primary" if i == 0 else "bf-cta-secondary"}" href="{href}">{label} {ARROW}</a>'
        for i, (label, href) in enumerate(buttons))
    copy = f'\n      <p class="bf-cta-body">{body}</p>' if body else ''
    return (f'<section class="bf-cta-shell" aria-labelledby="bf-cta-title">\n'
            f'    <div class="bf-recurring-cta bf-cta-card">\n'
            f'      <h2 id="bf-cta-title">{lead} <span>{accent}</span></h2>{copy}\n'
            f'      <div class="bf-cta-actions">\n{links}\n      </div>\n'
            f'    </div>\n'
            f'  </section>')


def page_cta(name):
    return cta_band(*PAGE_CTAS[name])


# Source for partials/recurring-cta.html (used where Copy v4 gives no page-specific CTA).
RECURRING = ('Tell us who your customers are.', "We'll show you what they'd book.", '',
             [DEMO, ('Read the API docs', 'developers.html')])


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
    if has_own_cta:
        cta = ''
    elif name in PAGE_CTAS:
        cta = page_cta(name)
    else:
        cta = (ROOT / 'partials/recurring-cta.html').read_text()
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
