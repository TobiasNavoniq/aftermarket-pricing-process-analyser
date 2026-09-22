#!/usr/bin/env python3
"""Bundle src/ into a single standalone HTML file.

    python tools/build.py

Reads src/index.html and inlines every stylesheet, script, JSON data file and
the logo, producing <OUTPUT_NAME> in the repo root. The result is one file that
runs by double-clicking it -- no server, no network, no sibling files.

For development, serve the split sources instead:

    python -m http.server 8000 --directory src
"""

import base64
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
# The standalone file lands in the repo root so it can simply be opened.
DIST = ROOT
OUTPUT_NAME = "AftermarketPricingProcessAnalyser_V0.2.0.html"

# JSON files inlined as window.RFP_BUNDLED_DATA.<key>; see src/js/data.js
DATA_FILES = {
    "canvasColors": "data/canvas-colors.json",
    "steps": "data/steps.json",
    "report": "data/report.json",
}

# The logo is referenced from exactly one CSS rule (.rp-logo), so inlining it
# there gives every use of it -- nav bar and every report page -- one copy.
LOGO_REF = 'url("../assets/logo.png")'


def read(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def guard(text):
    """Keep inlined script content from closing its own tag early.

    Only the literal sequences that terminate a script block are escaped.
    Escaping every "</" would corrupt real code -- e.g. the regex /</g in
    escHtml() -- so the match is deliberately narrow.
    """
    text = re.sub(r"</(?=\s*script)", "<\/", text, flags=re.I)
    return text.replace("<!--", "<\!--")


def build():
    html = read("index.html")

    # 1. Gather the stylesheets in link order.
    sheets = re.findall(r'<link rel="stylesheet" href="([^"]+)">', html)
    if not sheets:
        sys.exit("build: no stylesheets found in src/index.html")
    css = "\n".join("/* === %s === */\n%s" % (h, read(h)) for h in sheets)

    # 2. Logo -> data URI, inlined into the one CSS rule that references it.
    logo = base64.b64encode((SRC / "assets" / "logo.png").read_bytes()).decode()
    uri = "data:image/png;base64,%s" % logo
    if LOGO_REF not in css:
        sys.exit("build: logo rule %s not found in the stylesheets" % LOGO_REF)
    css = css.replace(LOGO_REF, 'url("%s")' % uri)

    # 3. Stylesheets -> one <style> block in place of the first <link>.
    html = re.sub(
        r'[ \t]*<link rel="stylesheet" href="[^"]+">\n',
        lambda m, seen=[]: "" if seen else seen.append(1) or "<style>\n%s</style>\n" % css,
        html,
    )

    # 4. JSON data -> a bundled-data script placed before the app scripts.
    data = {key: json.loads(read(path)) for key, path in DATA_FILES.items()}
    data_tag = "<script>\nwindow.RFP_BUNDLED_DATA = %s;\n</script>\n" % guard(
        json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    )

    # 5. Scripts -> inline, in load order.
    scripts = re.findall(r'<script src="([^"]+)"></script>', html)
    if not scripts:
        sys.exit("build: no scripts found in src/index.html")
    js = "\n".join("/* === %s === */\n%s" % (s, read(s)) for s in scripts)
    html = re.sub(
        r'[ \t]*<script src="[^"]+"></script>\n',
        lambda m, seen=[]: "" if seen else seen.append(1) or data_tag + "<script>\n%s</script>\n" % guard(js),
        html,
    )

    DIST.mkdir(exist_ok=True)
    out = DIST / OUTPUT_NAME
    out.write_text(html, encoding="utf-8")
    print("built %s (%.0f KB)" % (out.relative_to(ROOT), out.stat().st_size / 1024))
    return out


if __name__ == "__main__":
    build()
