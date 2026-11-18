import os
import sys
from playwright.sync_api import sync_playwright

paths = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch()
    for path in paths:
        pg = b.new_page(viewport={"width": 1360, "height": 1000})
        errs = []
        pg.on("pageerror", lambda e: errs.append("PAGE " + str(e)[:160]))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text[:160]) if m.type == "error" else None)
        pg.goto(os.environ.get("BASE_URL", "http://localhost:8080") + path, wait_until="networkidle")
        chips = pg.locator("#lab-params .pill-list button")
        n = chips.count()
        for i in range(n):
            chips.nth(i).click()
            pg.wait_for_timeout(120)
        pg.locator("[data-lab-play]").click()
        pg.wait_for_timeout(2500)
        pg.locator("[data-lab-reset]").click()
        txt = pg.locator(".lab__status").inner_text()
        print(f"{path:26} presets={n} status={txt[:28]!r} errs={len(errs)} {errs[:1]}")
        pg.close()
    b.close()
