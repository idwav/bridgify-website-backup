"""Published pages (MOBILE-RULES.md "Publishing a page") link their own copy of the phone layer. The lab's checks
inject the lab layer themselves, so they first remove the page's own tags: loaded twice, a page's scripts run twice."""
import re


def strip_layer(html):
    html = re.sub(r'<!-- Phone layer.*?</head>', '</head>', html, flags=re.S)
    return re.sub(r'<script src="mobile/load\.js[^>]*></script>', '', html)


async def route_stripped(pg, page_url_glob):
    async def h(route):
        r = await route.fetch(); body = await r.text()
        await route.fulfill(response=r, body=strip_layer(body))
    await pg.route(page_url_glob, h)
