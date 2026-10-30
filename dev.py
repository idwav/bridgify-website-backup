#!/usr/bin/env python3
"""Preview the static site locally, including its Netlify route aliases."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit


ROOT = Path(__file__).resolve().parent
ROUTES = {}
for line in (ROOT / "_redirects").read_text().splitlines():
    fields = line.split()
    if fields and not fields[0].startswith("#"):
        source, target, status = fields
        ROUTES[source] = (target, int(status))


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Local editing should always show the current files, including scripts.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        request = urlsplit(self.path)
        query = parse_qs(request.query, keep_blank_values=True)
        version = query.get("version", query.get("v"))
        home = request.path in {"/", "/index.html", "/index-v2.html"}
        v2 = version == ["2"] or (request.path == "/index-v2.html" and version != ["1"])
        if home and v2:
            if request.path != "/" or "v" in query or query.get("version") != ["2"]:
                query.pop("v", None)
                query["version"] = ["2"]
                self.send_response(302)
                self.send_header("Location", "/?" + urlencode(query, doseq=True))
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            self.path = "/index-v2.html"
        route = ROUTES.get(request.path)
        if route:
            target, status = route
            if status == 200:
                self.path = target
            else:
                if request.query:
                    target_path, separator, fragment = target.partition("#")
                    target = f"{target_path}?{request.query}"
                    if separator:
                        target += f"#{fragment}"
                self.send_response(status)
                self.send_header("Location", target)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
        return super().send_head()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    handler = partial(PreviewHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Bridgify preview: http://localhost:{args.port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
