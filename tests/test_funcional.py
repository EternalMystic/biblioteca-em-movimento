"""Testes funcionais: simuladores, XSS via URL, busca, quiz persistente, 404, sobre."""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1]  # ex.: http://localhost:8090/biblioteca-em-movimento
LABS = ["gaveteiro", "busca", "devolucao", "validacao", "grafos", "versoes", "custo", "autores",
        "historico", "emprestimo", "lote", "roteiro", "ordenacao", "hash-arvores", "memoria-listas"]
fails = []


def check(cond, msg):
    print(("OK   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1360, "height": 900})
    pg = ctx.new_page()
    errs = []
    dialogs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" else None)
    pg.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))

    # simuladores: todos os casos, executar, reiniciar, parâmetros
    for lab in LABS:
        errs.clear()
        pg.goto(f"{BASE}/rotinas/{lab}/", wait_until="load")
        chips = pg.locator("#lab-params .pill-list button")
        n = chips.count()
        for i in range(n):
            chips.nth(i).click()
            pg.wait_for_timeout(60)
            pg.locator("[data-lab-next]").click()
            pg.locator("[data-lab-next]").click()
        for sel in pg.locator("#lab-params select").all():
            for v in sel.evaluate("s => [...s.options].map(o => o.value)"):
                sel.select_option(v)
                pg.wait_for_timeout(30)
        for rng in pg.locator("#lab-params input[type=range]").all():
            rng.evaluate("el => { for (const v of [el.min, el.max]) { el.value = v; el.dispatchEvent(new Event('input', {bubbles:true})); } }")
        pg.wait_for_timeout(400)
        pg.locator("[data-lab-play]").click()
        pg.wait_for_timeout(1200)
        pg.locator("[data-lab-reset]").click()
        counter = pg.inner_text("#lab-counter")
        op = pg.inner_text("#lab-op")
        check(not errs and counter.startswith("passo 1") and "Erro" not in op,
              f"simulador {lab}: {n} casos, {counter}, erros={errs[:2]}")

    # XSS via parâmetro na URL
    payload = "%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E"
    for lab, key in [("autores", "nome"), ("busca", "termo"), ("validacao", "entrada"), ("lote", "cadeia")]:
        dialogs.clear()
        pg.goto(f"{BASE}/rotinas/{lab}/?p={key}:{payload}", wait_until="load")
        pg.wait_for_timeout(300)
        injected = pg.evaluate("() => document.querySelectorAll('main img[src=\"x\"]').length")
        check(not dialogs and injected == 0, f"XSS bloqueado em {lab}?p={key}")
    # parâmetro numérico vindo da URL vira número dentro da faixa
    pg.goto(f"{BASE}/rotinas/autores/?p=capacidade:999", wait_until="load")
    val = pg.locator("#p-autores-capacidade").input_value() if pg.locator("#p-autores-capacidade").count() else "?"
    check(val == "12", f"faixa numérica limitada pela URL (capacidade={val})")

    # busca: resultados e links resolvidos na subpasta
    pg.goto(f"{BASE}/aulas/ed-08-hash/", wait_until="load")
    for q, expect in [("dijkstra", "dijkstra"), ("pilha", "pilha"), ("theta", ""), ("bfs", "")]:
        pg.keyboard.press("/")
        pg.fill("#search-input", q)
        pg.wait_for_timeout(150)
        links = pg.locator("#search-results a")
        cnt = links.count()
        href = links.first.get_attribute("href") if cnt else ""
        ok = cnt > 0 and href.startswith(BASE + "/") and (expect in href.lower() or expect in pg.inner_text("#search-results").lower())
        check(ok, f"busca '{q}': {cnt} resultados, 1º={href}")
        pg.keyboard.press("Escape")
    pg.keyboard.press("/")
    pg.fill("#search-input", "dijkstra")
    pg.wait_for_timeout(150)
    pg.keyboard.press("Enter")
    pg.wait_for_url("**/glossario/**", timeout=10000)
    check(pg.url.startswith(BASE + "/") and "404" not in pg.title(), f"Enter na busca abre {pg.url}")

    # quiz: resposta persiste e fica bloqueada após recarregar
    pg.goto(f"{BASE}/aulas/ed-01-fundamentos/", wait_until="load")
    q = pg.locator(".quiz").first
    q.locator(".quiz__opt").nth(0).click()
    pg.reload(wait_until="load")
    q = pg.locator(".quiz").first
    marked = q.locator(".quiz__opt.is-correct").count()
    check(q.get_attribute("data-answered") == "1" and marked == 1, "quiz salvo: bloqueado e mostra a correta após recarregar")

    # sobre: conteúdo e âncoras
    pg.goto(f"{BASE}/sobre/#atalhos", wait_until="load")
    check(pg.locator("#atalhos").count() == 1 and pg.locator("#metodo").count() == 1
          and len(pg.inner_text("article.prose")) > 1500, "página Sobre com conteúdo e âncoras")

    # 404: links absolutos à base
    pg.goto(f"{BASE}/404.html", wait_until="load")
    hrefs = pg.eval_on_selector_all("a.btn, nav.nav a", "els => els.map(e => e.getAttribute('href'))")
    check(all(h.startswith("/biblioteca-em-movimento/") for h in hrefs), f"404 com links absolutos {hrefs[:3]}")

    # Ctrl+R / Ctrl+P não são sequestrados
    pg.goto(f"{BASE}/defesa/", wait_until="load")
    prevented = pg.evaluate("""() => { const e = new KeyboardEvent('keydown', {key:'p', ctrlKey:true, cancelable:true, bubbles:true});
                               document.dispatchEvent(e); return e.defaultPrevented; }""")
    check(not prevented, "Ctrl+P livre no modo defesa")
    b.close()

print("\nFALHAS:", len(fails))
for f in fails:
    print(" -", f)
