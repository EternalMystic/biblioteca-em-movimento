import os
import sys, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
pages = sys.argv[1:] or ["/", "/rotinas/gaveteiro/", "/mapa/", "/jornada/", "/rotinas/", "/exercicios/", "/revisao/", "/defesa/", "/fontes/", "/glossario/", "/sobre/"]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1360, "height": 900})
    errs = []
    pg.on("console", lambda m: errs.append(("console", m.type, m.text)) if m.type in ("error",) else None)
    pg.on("pageerror", lambda e: errs.append(("pageerror", str(e))))
    for path in pages:
        pg.goto(BASE + path, wait_until="networkidle")
        pg.wait_for_timeout(500)
        title = pg.title()
        name = path.strip("/").replace("/", "_") or "home"
        pg.screenshot(path=f"shots/{name}.png", full_page=False)
        print(f"{path:28} {title[:60]:60} erros={len(errs)}")
    for e in errs[:20]:
        print("ERR", e)
    b.close()
