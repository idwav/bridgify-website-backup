#!/usr/bin/env python3
"""Local heading line-break editor.

Serves the site like dev.py and adds an "Edit headings" button to every page. Click a heading,
choose where its lines break, preview it on the real page and save: the <br> tags are written into
that page's HTML file. Only line breaks change; the words are never edited.

    python3 scripts/heading-editor.py --port 8130   ->  http://localhost:8130/?version=2

Break kinds written to the HTML:
    all      <br>                          every screen
    wide     <br class="bf-br-wide">       tablet and desktop (600px and up)
    desk     <br class="bf-br-desk">       desktop only (1024px and up)
The two classed breaks are hidden below their width by brand-typography.css.
Breaks with any other class (page-specific ones) are kept as they are unless you change that gap.

Refuses: index.html (Version 1 reference), the shared footer and CTA (edit partials/ and run
scripts/sync-footer.py), and headings whose text is built by script and so is not in the file.
"""

import argparse
import html
import io
import json
import re
import sys
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import dev  # noqa: E402  (routing of the normal preview server)

EDITOR_JS = Path(__file__).resolve().parent / "heading-editor.js"
HEADING_RE = re.compile(r"<(h[1-4])\b([^>]*)>(.*?)</\1\s*>", re.S | re.I)
BR_RE = re.compile(r"<br\b[^>]*>", re.I)
TAG_RE = re.compile(r"<[^>]*>")
KIND_TAG = {"all": "<br>", "wide": '<br class="bf-br-wide">', "desk": '<br class="bf-br-desk">'}
LOCKED_FILES = {"index.html"}
FOOTER_START, FOOTER_END = "<!-- SHARED FOOTER START -->", "<!-- SHARED FOOTER END -->"


def squash(text):
    """Compare headings without whitespace: the DOM drops the space a <br> stands for."""
    return re.sub(r"\s+", "", html.unescape(TAG_RE.sub("", text)))


def br_kind(tag):
    m = re.search(r'class\s*=\s*"([^"]*)"', tag)
    if not m:
        return "all"
    classes = m.group(1).split()
    if "bf-br-wide" in classes:
        return "wide"
    if "bf-br-desk" in classes:
        return "desk"
    return "other"


def analyse(inner):
    """Split a heading's inner HTML into words and gaps.

    Returns (plain, words, gaps, breaks): `plain` is the inner HTML with every <br> removed (a space
    stands in where the break touched no whitespace); `gaps[i]` is the (start, end) of the whitespace
    run in `plain` between word i and word i+1; `breaks[i]` is the original <br> tag at that gap."""
    plain, marks, pos = [], [], 0
    for m in BR_RE.finditer(inner):
        before = inner[pos:m.start()]
        plain.append(before)
        joined = "".join(plain)
        after = inner[m.end():m.end() + 1]
        if not (joined[-1:].isspace() or after.isspace()):
            plain.append(" ")
            joined += " "
        marks.append((len(joined), m.group(0)))
        pos = m.end()
    plain.append(inner[pos:])
    plain = "".join(plain)

    # Tags never end a word. A gap is the first whitespace run after a word; it is recorded once the
    # next word starts, so there is always one gap fewer than words.
    words, gaps, in_tag, cur, run = [], [], False, "", None
    for i, ch in enumerate(plain):
        if in_tag:
            in_tag = ch != ">"
        elif ch == "<":
            in_tag = True
        elif ch.isspace():
            if cur:
                words.append(cur)
                cur = ""
                run = [i, i + 1]
            elif run is not None and run[1] == i:
                run[1] = i + 1
        else:
            if run is not None:
                gaps.append(tuple(run))
                run = None
            cur += ch
    if cur:
        words.append(cur)
    words = [html.unescape(w) for w in words]
    breaks = {}
    for at, tag in marks:
        for gi, (s, e) in enumerate(gaps):
            if s <= at <= e:
                breaks[gi] = tag
                break
    return plain, words, gaps, breaks


def rebuild(plain, gaps, old_breaks, wanted):
    """wanted: {gap index: 'all'|'wide'|'desk'|'keep'}; 'keep' re-inserts the original tag."""
    out, pos = [], 0
    for gi, (s, e) in enumerate(gaps):
        kind = wanted.get(gi)
        if not kind:
            continue
        tag = old_breaks.get(gi) if kind == "keep" else KIND_TAG[kind]
        if not tag:
            continue
        out.append(plain[pos:s])
        out.append(" " + tag)
        pos = e
    out.append(plain[pos:])
    return "".join(out)


class EditorError(Exception):
    pass


def locate(file, text, occ):
    if not re.fullmatch(r"[A-Za-z0-9._-]+\.html", file or ""):
        raise EditorError("הדף הזה אינו קובץ ‎.html‎ בתיקייה הראשית של האתר.")
    if file in LOCKED_FILES:
        raise EditorError("index.html הוא גרסה 1 (גרסת הייחוס) ולא נערך.")
    path = ROOT / file
    if not path.is_file():
        raise EditorError(f"הקובץ {file} לא נמצא.")
    source = path.read_text(encoding="utf-8")
    want = squash(text)
    hits = [m for m in HEADING_RE.finditer(source) if squash(m.group(3)) == want]
    if not hits:
        raise EditorError("הטקסט של הכותרת הזו לא כתוב בקובץ כמו שהוא מוצג (כנראה סקריפט בונה אותו), ולכן אי אפשר לשמור אותה מכאן.")
    m = hits[min(max(occ, 0), len(hits) - 1)] if len(hits) > 1 else hits[0]
    fs, fe = source.find(FOOTER_START), source.find(FOOTER_END)
    if fs != -1 and fe != -1 and fs < m.start() < fe:
        raise EditorError("זה ה-footer או ה-CTA המשותף: עורכים אותו ב-partials/ ומריצים scripts/sync-footer.py.")
    return path, source, m


def describe(file, text, occ):
    path, source, m = locate(file, text, occ)
    plain, words, gaps, breaks = analyse(m.group(3))
    return {
        "ok": True, "file": file, "tag": m.group(1).lower(), "words": words,
        "breaks": {str(k): br_kind(v) for k, v in breaks.items()},
        "has_type_css": "brand-typography.css" in source,
    }


def apply(file, text, occ, wanted, write):
    path, source, m = locate(file, text, occ)
    plain, words, gaps, breaks = analyse(m.group(3))
    clean = {}
    for k, v in (wanted or {}).items():
        gi = int(k)
        if 0 <= gi < len(gaps) and v in ("all", "wide", "desk", "keep"):
            clean[gi] = v
    inner = rebuild(plain, gaps, breaks, clean)
    if squash(inner) != squash(m.group(3)):
        raise EditorError("בדיקת בטיחות נכשלה: המילים היו משתנות. שום דבר לא נשמר.")
    if write:
        new = source[:m.start(3)] + inner + source[m.end(3):]
        if new != source:
            path.write_text(new, encoding="utf-8")
    return {"ok": True, "file": file, "html": inner, "changed": inner != m.group(3)}


class EditorHandler(dev.PreviewHandler):
    def send_head(self):
        if self.path.startswith("/__he/editor.js"):
            body = EDITOR_JS.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        self._inject = None
        f = super().send_head()
        if f is None or not self._inject:
            return f
        body = f.read()
        f.close()
        tag = (f'<script>window.__HE_FILE={json.dumps(self._inject)}</script>'
               '<script src="/__he/editor.js" defer></script>').encode()
        idx = body.rfind(b"</body>")
        body = body[:idx] + tag + body[idx:] if idx != -1 else body + tag
        return io.BytesIO(body)

    def send_header(self, keyword, value):
        if keyword.lower() == "content-type" and value.startswith("text/html"):
            name = Path(self.translate_path(self.path)).name
            self._inject = name
        if keyword.lower() == "content-length" and getattr(self, "_inject", None):
            return  # length changes after the editor tag is added; HTTP/1.0 closes the connection
        super().send_header(keyword, value)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
            data = json.loads(self.rfile.read(length) or b"{}")
            if self.path == "/__he/heading":
                result = describe(data.get("file"), data.get("text", ""), int(data.get("occ", 0)))
            elif self.path in ("/__he/preview", "/__he/save"):
                result = apply(data.get("file"), data.get("text", ""), int(data.get("occ", 0)),
                               data.get("breaks"), write=self.path.endswith("save"))
            else:
                raise EditorError("בקשה לא מוכרת.")
            code = 200
        except EditorError as e:
            result, code = {"ok": False, "error": str(e)}, 400
        except Exception as e:  # noqa: BLE001
            result, code = {"ok": False, "error": f"{type(e).__name__}: {e}"}, 500
        body = json.dumps(result, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--port", type=int, default=8130)
    args = parser.parse_args()
    handler = partial(EditorHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError:
        print(f"Port {args.port} is already in use: the editor (or another server) is probably already running.\n"
              f"Open http://localhost:{args.port}/?version=2, or start on another port: --port {args.port + 1}")
        sys.exit(1)
    with server:
        print(f"Heading editor: http://localhost:{args.port}/?version=2  (files in {ROOT})", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
