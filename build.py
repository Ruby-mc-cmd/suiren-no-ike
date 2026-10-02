#!/usr/bin/env python3
"""Inline src/head.html + src/main.js into
   dist/pond.html  — the artifact body (no doctype/head; the host wraps it)
   docs/index.html — a complete page you can open directly; GitHub Pages serves it from /docs."""
import pathlib

root = pathlib.Path(__file__).parent
head = (root / "src/head.html").read_text()
js = (root / "src/main.js").read_text()
body = head.rstrip() + "\n<script type=\"module\">\n" + js.rstrip() + "\n</script>\n"
(root / "dist").mkdir(exist_ok=True)
(root / "dist/pond.html").write_text(body)

# the same base styles the artifact host provides around the body
skel = ('<!doctype html><html lang="ja"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);'
        'padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui;'
        'background:#fafaf8}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n')
(root / "docs").mkdir(exist_ok=True)
(root / "docs/index.html").write_text(skel + body + "</body></html>\n")
(root / "docs/.nojekyll").write_text("")          # serve as-is, no Jekyll pass
print(f"dist/pond.html  {len(body)/1024:.1f} KB  (+ docs/index.html)")
