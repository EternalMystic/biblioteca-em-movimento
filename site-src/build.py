# -*- coding: utf-8 -*-
"""Gerador do site estático — Biblioteca em Movimento."""
import html
import json
import os
import re
import shutil
import unicodedata
from pathlib import Path

import markdown
import yaml
from urllib.parse import urlparse
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name

import data
import pages

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "public"
# Endereço público do site (usado em sitemap, canonical e na página 404).
SITE_URL = os.environ.get("SITE_URL", "https://carlosnobuyasu.vercel.app/")
SITE_BASE = urlparse(SITE_URL).path or "/"
CONTENT = ROOT / "content"
DATA = ROOT / "data"

TRACKS = data.TRACKS
LESSONS = data.LESSONS
ROUTINES = data.ROUTINES
LESSON_BY_SLUG = data.LESSON_BY_SLUG
ROUTINE_BY_ID = data.ROUTINE_BY_ID

EX_BY_LESSON = {
    "ed-01-fundamentos": ["a1"], "ed-02-complexidade": ["a2"],
    "ed-03-ponteiros": ["a1", "a4"], "ed-04-pilhas-filas": ["a4"],
    "ed-05-listas": ["a4"], "ed-06-ordenacao": ["a5"],
    "ed-07-merge-busca": ["a2", "a6"], "ed-08-hash": ["a7"], "ed-09-arvores": ["a7"],
    "gr-01-fundamentos": ["a9"], "gr-02-subgrafos": ["a9"], "gr-03-bfs-dfs": ["a8"],
    "gr-04-dag-scc": ["a8"], "gr-05-mst": ["a9"], "gr-06-circuitos": ["a9"],
    "gr-07-caminhos": ["a9"], "tc-01-fundamentos": [], "tc-02-linguagens": ["r1", "r2", "r3"],
    "tc-03-chomsky-afd": ["r1"], "tc-04-afn-pda": [], "tc-05-computabilidade": [],
    "tc-06-turing": [], "tc-07-complexidade": ["a9"],
}

BOND_LABEL = {
    "code": ("Confirmado no código", "ev--code"),
    "model": ("Modelo didático", "ev--model"),
    "future": ("Proposta / evolução", "ev--future"),
    "ementa": ("Ementa — estudo introdutório", "ev--future"),
}


def esc(s):
    return html.escape(str(s), quote=True)


def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


def load_json(name, default=None):
    p = DATA / name
    if not p.exists():
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# ------------------------------------------------------------------ markdown
PYGMENTS_CSS = HtmlFormatter(style="monokai").get_style_defs(".code pre")
CODE_RE = re.compile(r"```([\w+#-]*)([^\n]*)\n(.*?)```", re.S)


def render_code(md_text):
    store = []

    def repl(m):
        lang = (m.group(1) or "text").lower()
        body = m.group(3)
        alias = {"c#": "csharp", "cs": "csharp", "js": "javascript", "sh": "bash",
                 "sql": "sql", "py": "python", "text": "text"}.get(lang, lang)
        try:
            lexer = get_lexer_by_name(alias, stripall=False)
            inner = highlight(body, lexer, HtmlFormatter(nowrap=True))
        except Exception:
            inner = esc(body)
        label = {"csharp": "C#", "javascript": "JavaScript", "python": "Python",
                 "sql": "SQL", "bash": "Shell", "text": "texto", "json": "JSON"}.get(alias, lang or "texto")
        store.append(
            '<div class="code"><div class="code__bar"><span class="dot"></span>'
            f'<span>trecho do material</span><span class="lang">{label}</span></div>'
            f"<pre><code>{inner}</code></pre></div>"
        )
        return f"\n\n@@CODE{len(store) - 1}@@\n\n"

    md_text = CODE_RE.sub(repl, md_text)
    md = markdown.Markdown(extensions=["extra", "tables", "sane_lists", "toc", "md_in_html", "attr_list"],
                           extension_configs={"toc": {"permalink": False}})
    out = md.convert(md_text)
    for i, block in enumerate(store):
        out = out.replace(f"<p>@@CODE{i}@@</p>", block).replace(f"@@CODE{i}@@", block)
    # tabelas roláveis
    out = out.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")
    return out


def parse_content():
    docs = {}
    for p in sorted(CONTENT.glob("*.md")):
        raw = p.read_text(encoding="utf-8")
        meta, body = {}, raw
        if raw.startswith("---"):
            _, fm, body = raw.split("---", 2)
            meta = yaml.safe_load(fm) or {}
        docs[p.stem] = {"meta": meta, "body": body}
    return docs


# ------------------------------------------------------------------ layout
NAV = [
    ("inicio", "Início", ""),
    ("mapa", "Mapa de aulas", "mapa/"),
    ("jornada", "Jornada do PI", "jornada/"),
    ("rotinas", "Simuladores", "rotinas/"),
    ("exercicios", "Exercícios", "exercicios/"),
    ("revisao", "Revisão", "revisao/"),
    ("defesa", "Defesa", "defesa/"),
    ("fontes", "Fontes", "fontes/"),
]

ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
ICON_MOTION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12c2.5-5 5-5 7.5 0s5 5 7.5 0"/><path d="M3 17c2.5-4 5-4 7.5 0s5 4 7.5 0"/></svg>'
ICON_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9v6h3l5 4V5L7 9H4Z"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>'
ICON_PRINT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 16h10v5H7z"/></svg>'

BRAND_MARK = ('<svg viewBox="0 0 24 24" fill="none" stroke="#9ed6bd" stroke-width="1.8" aria-hidden="true">'
              '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M12 4v16"/>'
              '<circle cx="7.5" cy="6.5" r=".8" fill="#9ed6bd" stroke="none"/></svg>')


def header(root, active):
    links = []
    for key, label, href in NAV:
        cur = ' aria-current="page"' if key == active else ""
        links.append(f'<a href="{root}{href}"{cur}>{label}</a>')
    return f"""
<header class="site-header">
  <div class="wrap site-header__in">
    <a class="brand" href="{root}" aria-label="Biblioteca em Movimento — página inicial">
      <span class="brand__mark">{BRAND_MARK}</span>
      <span class="brand__text">
        <span class="brand__name">Biblioteca em Movimento</span>
        <span class="brand__short">Biblioteca</span>
        <span class="brand__sub">PI · ED + TC · UNISAL 2026</span>
      </span>
    </a>
    <button class="icon-btn burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu">{ICON_MENU}</button>
    <nav class="nav" id="nav" aria-label="Navegação principal">{''.join(links)}</nav>
    <div class="tools">
      <button class="icon-btn" id="open-search" aria-label="Buscar no site (atalho: barra)" title="Buscar (/)">{ICON_SEARCH}</button>
      <button class="icon-btn" id="motion-toggle" aria-pressed="false" aria-label="Reduzir movimento" title="Movimento: completo">{ICON_MOTION}</button>
      <button class="icon-btn" id="tts-toggle" aria-pressed="false" aria-label="Ler esta página em voz alta" title="Leitura em voz alta">{ICON_SOUND}</button>
    </div>
  </div>
</header>"""


def footer(root):
    return f"""
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="{root}" style="color:#e8f3ed">
          <span class="brand__mark">{BRAND_MARK}</span>
          <span class="brand__text"><span class="brand__name">Biblioteca em Movimento</span>
        <span class="brand__short">Biblioteca</span>
          <span class="brand__sub" style="color:#7fa295">documento técnico + apoio à defesa</span></span>
        </a>
        <p style="margin-top:.9rem;max-width:38ch">Site de estudo do Projeto Integrador da biblioteca do Tiro de Guerra de Americana, integrando Estruturas de Dados e Teoria da Computação. Todos os dados do sistema são fictícios.</p>
      </div>
      <div>
        <h3>Estudar</h3>
        <ul>
          <li><a href="{root}mapa/">Mapa das 23 aulas</a></li>
          <li><a href="{root}rotinas/">15 simuladores</a></li>
          <li><a href="{root}exercicios/">Exercícios e desafios</a></li>
          <li><a href="{root}revisao/">Revisão intercalada</a></li>
        </ul>
      </div>
      <div>
        <h3>Apresentar</h3>
        <ul>
          <li><a href="{root}jornada/">Jornada do PI</a></li>
          <li><a href="{root}defesa/">Modo defesa</a></li>
          <li><a href="{root}fontes/">Fontes e matriz de cobertura</a></li>
          <li><a href="{root}sobre/">Como usar e acessibilidade</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-note">
      <span>UNISAL · Campus Maria Auxiliadora · Engenharia da Computação · 2026</span>
      <span>Material de estudo do Projeto Integrador.</span>
    </div>
  </div>
</footer>
<div class="search-dialog" id="search-dialog" role="dialog" aria-modal="true" aria-label="Busca no site">
  <div class="search-box">
    <div class="search-box__in">
      {ICON_SEARCH}
      <input type="search" id="search-input" placeholder="Busque por tema, símbolo, aula ou rotina…" aria-label="Termo de busca" autocomplete="off">
      <button class="icon-btn" id="close-search" aria-label="Fechar busca">✕</button>
    </div>
    <div class="search-results" id="search-results" aria-live="polite"></div>
    <div class="search-hint"><span><kbd>↑</kbd> <kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> fechar</span><span>Busca sem acento: <code>theta</code> acha Θ</span></div>
  </div>
</div>"""


def shell(path, title, body, active="", root=None, desc="", scripts="", body_class="", page_class=""):
    depth = len([p for p in Path(path).parent.parts if p not in ("", ".")])
    root = root if root is not None else "../" * depth
    full_title = f"{title} · Biblioteca em Movimento" if title else "Biblioteca em Movimento · PI Biblioteca TG"
    desc = desc or ("Site de estudo do Projeto Integrador da biblioteca do Tiro de Guerra de Americana: "
                    "aulas, simuladores, exercícios e roteiro de defesa.")
    url_path = Path(path).parent.as_posix().strip(".").strip("/")
    canonical = SITE_URL + (url_path + "/" if url_path else "")
    canonical_tags = "" if path == "404.html" else (
        f'<meta property="og:url" content="{canonical}">\n<link rel="canonical" href="{canonical}">')
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(full_title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#002F2D">
<meta property="og:title" content="{esc(full_title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Biblioteca em Movimento">
<meta property="og:image" content="{SITE_URL}assets/img/logo.png">
{canonical_tags}
<link rel="icon" type="image/png" href="{root}assets/img/logo.png">
<link rel="apple-touch-icon" href="{root}assets/img/logo.png">
<link rel="stylesheet" href="{root}assets/css/site.css">
<script src="{root}assets/js/search-index.js" defer></script>
<script src="{root}assets/js/site.js" defer></script>
{scripts}
</head>
<body class="{body_class}">
<a class="skip-link" href="#main">Ir para o conteúdo</a>
{header(root, active)}
<main id="main" class="{page_class}">
{body}
</main>
{footer(root)}
</body>
</html>"""


def write(path, content):
    dest = OUT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content, encoding="utf-8", newline="\n")


# ------------------------------------------------------------------ components
def track_badge(track):
    t = TRACKS[track]
    return f'<span class="badge badge--{track}">{esc(t["label"])}</span>'


def ev_badge(kind):
    label, cls = BOND_LABEL[kind]
    return f'<span class="ev {cls}">{esc(label)}</span>'


def quiz_html(slug, quiz):
    if not quiz:
        return ""
    out = ['<section class="quiz-block" aria-labelledby="checagem"><h2 id="checagem">Checagem de compreensão</h2>'
           '<p class="muted" style="font-size:.9rem">Responda sem consultar. O erro fica registrado no seu caderno de revisão.</p>']
    for i, q in enumerate(quiz):
        opts = "".join(
            f'<button class="quiz__opt" data-q="{slug}-{i}" data-i="{j}" data-answer="{q["answer"]}">'
            f'<span class="mark">{chr(65 + j)}</span><span>{esc(o)}</span></button>'
            for j, o in enumerate(q["options"])
        )
        out.append(f"""<div class="quiz" data-quiz="{slug}-{i}" data-track="{LESSON_BY_SLUG[slug]['track']}">
  <div class="quiz__q">{i + 1}. {esc(q['q'])}</div>
  <div class="quiz__opts" role="group" aria-label="Alternativas">{opts}</div>
  <div class="quiz__fb" role="status"></div>
  <div class="quiz__foot"><span>Marque uma alternativa.</span><button class="btn btn--ghost btn--sm reveal-sol" data-sol="{esc(q.get('explain', ''))}">Ver explicação</button></div>
</div>""")
    out.append("</section>")
    return "".join(out)


def evidence_html(meta):
    items = meta.get("evidence") or []
    if not items:
        return ""
    cards = []
    for it in items:
        kind = it.get("kind", "model")
        cards.append(f"""<div class="card" style="padding:.9rem 1rem">
  <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.35rem">{ev_badge(kind)}<span class="mono" style="font-size:.7rem;color:var(--ink-3)">{esc(it.get('source',''))}</span></div>
  <p style="margin:0;font-size:.9rem">{it.get('text','')}</p>
</div>""")
    return f"""<section aria-labelledby="evidencia"><h2 id="evidencia">Evidência no Projeto Integrador</h2>
<p>Cada afirmação sobre o sistema vem marcada pela natureza da evidência. <strong>Confirmado no código</strong> tem arquivo e linha; <strong>modelo didático</strong> é uma ponte construída para ensinar; <strong>proposta</strong> é evolução, não funcionalidade.</p>
<div class="grid grid--2" style="margin-top:1rem">{''.join(cards)}</div></section>"""


def toc_html(toc, meta, slug):
    if not toc:
        return ""
    items = "".join(f'<li><a href="#{i["id"]}">{esc(i["name"])}</a></li>' for i in toc if i["level"] == 2)
    return f"""<aside class="toc" aria-label="Nesta página">
  <div class="toc__box">
    <div class="toc__title">Progresso desta aula</div>
    <div class="toc__progress"><i data-progress-fill style="width:0%"></i></div>
    <div class="toc__meta"><span data-progress-label>0%</span><span>{esc(meta.get('pages',''))}</span></div>
    <button class="btn btn--ghost btn--sm" style="width:100%;margin-top:.6rem" data-mark-lesson="{slug}" aria-pressed="false">Marcar como estudada</button>
  </div>
  <div class="toc__title">Nesta página</div>
  <ol>{items}</ol>
</aside>"""


def lesson_page(doc, prev, nxt, docs):
    slug = doc["meta"]["slug"]
    L = LESSON_BY_SLUG[slug]
    body_md = doc["body"]
    body_html = render_code(body_md)
    toc = []
    for m in re.finditer(r'<h([23]) id="([^"]+)">(.*?)</h\1>', body_html):
        toc.append({"level": int(m.group(1)), "id": m.group(2), "name": re.sub(r"<[^>]+>", "", m.group(3))})
    # remove o primeiro h1 duplicado, se o markdown trouxer
    body_html = re.sub(r"<h1[^>]*>.*?</h1>", "", body_html, count=1)
    # insere objetivos e evidência
    objectives = doc["meta"].get("objectives") or []
    obj_html = ""
    if objectives:
        obj_html = ('<div class="objectives"><h2>Objetivos desta aula</h2><ul>'
                    + "".join(f"<li>{o}</li>" for o in objectives) + "</ul></div>")
    # insere objetivos após a introdução (primeiro parágrafo)
    body_html = body_html.replace("</p>", "</p>" + obj_html, 1) if "</p>" in body_html else obj_html + body_html
    ev = evidence_html(doc["meta"])
    # insere evidência antes da última seção? coloca após o 2º h2
    parts = re.split(r'(<h2 id="[^"]+">)', body_html)
    if len(parts) >= 5:
        # parts: pre, h2, content, h2, content...
        idx = 0
        for i, p in enumerate(parts):
            if p.startswith("<h2"):
                idx += 1
                if idx == 3:
                    parts.insert(i, ev)
                    break
        body_html = "".join(parts)
    else:
        body_html += ev
    quiz = quiz_html(slug, doc["meta"].get("quiz") or [])
    body_html += quiz
    pager = f"""<nav class="pager" aria-label="Aulas anteriores e próximas">
  <a class="prev" href="../{prev['slug']}/"><span>← Anterior</span><strong>{esc(prev['title'])}</strong></a>
  <a class="next" href="../{nxt['slug']}/"><span>Próxima →</span><strong>{esc(nxt['title'])}</strong></a>
</nav>""" if prev and nxt else ""
    head = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui">
      <a href="../../">Início</a><span>/</span><a href="../../mapa/">Mapa de aulas</a><span>/</span>
      <span>{esc(TRACKS[L['track']]['label'])}</span><span>/</span><span>Aula {L['num']}</span>
    </nav>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">{track_badge(L['track'])}<span class="badge">{esc(L['pages'])}</span></div>
    <h1>{esc(doc['meta'].get('title', L['title']))}</h1>
    <p class="page-head__lead">{esc(doc['meta'].get('summary', L['summary']))}</p>
    <div class="page-head__meta"><span class="mono">{esc(L['pdf'])}</span></div>
    <div class="page-actions">
      <a class="btn btn--sm" href="../../rotinas/{L['routine']}/">Abrir simulador ligado</a>
      <button class="btn btn--ghost btn--sm" data-tts-inline>Ler em voz alta</button>
      <button class="btn btn--ghost btn--sm" onclick="window.print()">Imprimir</button>
    </div>
  </div>
</div>"""
    inner = f"""<div class="wrap"><div class="layout">
  <article class="prose" style="--track:{TRACKS[L['track']]['color']}">{body_html}</article>
  {toc_html(toc, doc['meta'], slug)}
</div></div>"""
    return shell(f"aulas/{slug}/index.html", doc["meta"].get("title", L["title"]), head + inner,
                 active="mapa", desc=doc["meta"].get("summary", L["summary"]),
                 scripts='<script src="../../assets/js/lesson.js" defer></script>')


# ------------------------------------------------------------------ build
def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    docs = parse_content()
    # garante todos os documentos
    missing = [l["slug"] for l in LESSONS if l["slug"] not in docs]
    if missing:
        print("AVISO: aulas sem conteúdo:", ", ".join(missing))

    # assets
    shutil.copytree(ROOT / "assets", OUT / "assets")

    # aulas
    ordered = sorted(LESSONS, key=lambda l: (["ed", "grafos", "tc"].index(l["track"]), l["num"]))
    for i, L in enumerate(ordered):
        slug = L["slug"]
        if slug not in docs:
            continue
        prev = ordered[i - 1] if i > 0 else None
        nxt = ordered[i + 1] if i + 1 < len(ordered) else None
        write(f"aulas/{slug}/index.html", lesson_page(docs[slug], prev, nxt, docs))

    # páginas especiais
    write("index.html", pages.home(docs))
    write("mapa/index.html", pages.mapa())
    write("jornada/index.html", pages.jornada())
    write("rotinas/index.html", pages.routines_index())
    for r in ROUTINES:
        write(f"rotinas/{r['id']}/index.html", pages.routine_page(r))
    write("exercicios/index.html", pages.exercicios_page())
    write("revisao/index.html", pages.revisao_page())
    write("defesa/index.html", pages.defesa_page())
    write("fontes/index.html", pages.fontes_page())
    write("glossario/index.html", pages.glossario_page())
    write("sobre/index.html", pages.sobre_page(docs))

    # 404
    write("404.html", shell("404.html", "Página não encontrada",
                            '<div class="wrap-narrow section"><h1>Esta gaveta não existe.</h1>'
                            '<p>O endereço pode ter mudado. Volte ao mapa de aulas ou use a busca.</p>'
                            f'<p><a class="btn" href="{SITE_BASE}mapa/">Ir para o mapa</a></p></div>',
                            active="", root=SITE_BASE))

    # dados JS
    write("assets/js/quiz-data.js", "window.PI_QUIZ = " + json.dumps(build_quiz_data(docs), ensure_ascii=False) + ";")
    write("assets/js/search-index.js", "window.PI_SEARCH = " + json.dumps(build_search_index(docs), ensure_ascii=False) + ";")
    write("assets/css/pygments.css", PYGMENTS_CSS)

    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n")
    urls = ["", "mapa/", "jornada/", "rotinas/", "exercicios/", "revisao/", "defesa/", "fontes/", "glossario/", "sobre/"]
    urls += [f"aulas/{l['slug']}/" for l in LESSONS] + [f"rotinas/{r['id']}/" for r in ROUTINES]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
          + "".join(f"<url><loc>{SITE_URL}{u}</loc></url>" for u in urls) + "</urlset>\n")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"OK — {len(list(OUT.rglob('*.html')))} páginas em {OUT}")


def build_quiz_data(docs):
    out = []
    for L in LESSONS:
        d = docs.get(L["slug"])
        if not d:
            continue
        for i, q in enumerate(d["meta"].get("quiz") or []):
            out.append({
                "id": f"{L['slug']}-{i}", "lesson": L["slug"], "lessonTitle": L["title"],
                "track": L["track"], "q": q["q"], "options": q["options"],
                "answer": q["answer"], "explain": q.get("explain", ""),
            })
    return out


def build_search_index(docs):
    idx = []
    for L in LESSONS:
        d = docs.get(L["slug"], {"meta": {}, "body": ""})
        body = re.sub(r"<[^>]+>", " ", render_code(d.get("body", "")))
        body = re.sub(r"\s+", " ", body)[:1200]
        idx.append({
            "t": L["title"], "u": f"aulas/{L['slug']}/", "k": " ".join(
                [L["summary"], L["pdf"]] + [t[0] for t in L["topics"]] + [TRACKS[L["track"]]["label"]]),
            "s": f"Aula {L['num']} · {TRACKS[L['track']]['label']} · {L['pages']}", "b": body,
        })
        for t in L["topics"]:
            idx.append({"t": t[0], "u": f"aulas/{L['slug']}/", "k": f"{L['title']} {t[0]}",
                        "s": f"Subtópico · {L['pdf']} · {t[1]}", "b": ""})
    for r in ROUTINES:
        idx.append({"t": r["title"], "u": f"rotinas/{r['id']}/",
                    "k": f"{r['sub']} {r['question']} simulador interativo {r['id']}",
                    "s": f"{'Rotina' if r['kind'] == 'rotina' else 'Laboratório'} {r['num']} · {r['source']}", "b": r["what"]})
    for name in ("exercicios.json", "defesa.json", "glossario.json"):
        dataj = load_json(name)
        if not dataj:
            continue
        if name == "exercicios.json":
            for s in dataj.get("sets", []):
                idx.append({"t": s["title"], "u": "exercicios/#" + s["id"], "k": s.get("note", "") + " exercício " + s["title"],
                            "s": "Exercícios · " + s.get("source", ""), "b": ""})
        elif name == "glossario.json":
            for t in dataj.get("terms", []):
                idx.append({"t": t["term"], "u": "glossario/#" + slugify(t["term"]),
                            "k": " ".join([t.get("full", ""), t["def"]] + t.get("syn", [])),
                            "s": "Glossário · " + t.get("full", ""), "b": t["def"]})
    # páginas fixas
    for t, u, k, s in [
        ("Mapa de aulas", "mapa/", "mapa aulas trilhas progresso", "Navegação · 23 aulas em três trilhas"),
        ("Jornada do PI", "jornada/", "jornada livro LIV123 tela dados modelo", "Narrativa · cadastrar buscar emprestar devolver"),
        ("Modo defesa", "defesa/", "defesa banca roteiro perguntas cronômetro", "Apresentação · 10 minutos"),
        ("Matriz de cobertura", "fontes/", "cobertura fontes matriz rastreabilidade", "Documentação · fonte, página, rota e exercício"),
        ("Revisão intercalada", "revisao/", "revisao flashcards quiz espacamento", "Prática · recuperação ativa"),
        ("Como usar", "sobre/", "acessibilidade movimento reduzido teclado leitura em voz alta", "Guia · atalhos e limites"),
    ]:
        idx.append({"t": t, "u": u, "k": k, "s": s, "b": ""})
    return idx


if __name__ == "__main__":
    build()
