import os

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1360, "height": 1000})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:140]))
    pg.on("console", lambda m: errs.append(m.text[:140]) if m.type == "error" else None)

    # home -> gaveteiro
    pg.goto(BASE + "/", wait_until="networkidle")
    btn = pg.get_by_role("link", name="Seguir o LIV123")
    if btn.count():
        btn.first.click(); pg.wait_for_load_state("networkidle")
        print("home->", pg.url)
    else:
        print("home-> CTA não encontrado")

    # busca
    pg.goto(BASE + "/mapa/", wait_until="networkidle")
    pg.keyboard.press("/")
    pg.wait_for_timeout(250)
    opened = pg.locator(".search-dialog").evaluate("el => el.classList.contains('is-open')")
    pg.keyboard.type("dijkstra")
    pg.wait_for_timeout(350)
    n = pg.locator(".search-dialog a").count()
    print("busca aberta:", opened, "resultados:", n)
    pg.keyboard.press("Escape")

    # exercícios
    pg.goto(BASE + "/exercicios/", wait_until="networkidle")
    pg.locator("[data-ex-set='a8']").click()
    pg.wait_for_timeout(250)
    vis = pg.locator("[data-set='a8']").count()
    first = pg.locator("[data-set='a8'] .quiz__opt").first
    first.click()
    pg.wait_for_timeout(250)
    fb = pg.locator("[data-set='a8'] .quiz__fb").first.inner_text()
    print("exercícios set:", vis, "feedback:", fb[:60].replace("\n", " "))

    # revisão
    pg.goto(BASE + "/revisao/", wait_until="networkidle")
    pg.locator("#review-opts .quiz__opt").first.click()
    pg.wait_for_timeout(300)
    fb2 = pg.locator("#review-fb").inner_text()
    print("revisão feedback:", fb2[:50].replace("\n", " "))
    pg.locator("#review-next").click()
    print("revisão pos:", pg.locator("#review-pos").inner_text())

    # defesa
    pg.goto(BASE + "/defesa/", wait_until="networkidle")
    visible = "() => [...document.querySelectorAll('[data-def-step]')].findIndex(s => !s.hidden)"
    before = pg.evaluate(visible)
    pg.locator("#def-next").click()
    pg.wait_for_timeout(300)
    after = pg.evaluate(visible)
    print("defesa:", before, "->", after)

    # aula: marcar estudada + tts
    pg.goto(BASE + "/aulas/ed-02-complexidade/", wait_until="networkidle")
    pg.locator("[data-mark-lesson]").click()
    pg.wait_for_timeout(250)
    pressed = pg.locator("[data-mark-lesson]").get_attribute("aria-pressed")
    tts = pg.locator("[data-tts-inline]").first
    print("marcada:", pressed, "tts:", tts.is_enabled(), tts.inner_text())
    pg.reload(wait_until="networkidle")
    print("persistiu:", pg.locator("[data-mark-lesson]").get_attribute("aria-pressed"))

    print("erros:", len(errs), errs[:2])
    b.close()
