import os
import sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
paths = sys.argv[1:] or ["/rotinas/gaveteiro/", "/rotinas/busca/"]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1360, "height": 1000})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "404" not in m.text else None)
    for path in paths:
        pg.goto(BASE + path, wait_until="networkidle")
        pg.wait_for_timeout(400)
        before = pg.inner_text("#lab-counter")
        pg.click("[data-lab-next]")
        pg.wait_for_timeout(200)
        after = pg.inner_text("#lab-counter")
        pg.click("[data-lab-play]")
        pg.wait_for_timeout(900)
        pg.click("[data-lab-play]")
        pg.click("[data-lab-reset]")
        pg.wait_for_timeout(200)
        reset = pg.inner_text("#lab-counter")
        # change first range param if exists
        rng = pg.query_selector("#lab-params input[type=range]")
        if rng:
            rng.evaluate("el => { el.value = el.max; el.dispatchEvent(new Event('input', {bubbles:true})); }")
            pg.wait_for_timeout(500)
        txt = pg.inner_text("#lab-op")
        print(f"{path:26} {before} -> {after} -> {reset} | errs={len(errs)} {errs[:1]}")
        pg.screenshot(path="shots/lab_" + path.strip("/").split("/")[-1] + ".png", full_page=False)
    b.close()
