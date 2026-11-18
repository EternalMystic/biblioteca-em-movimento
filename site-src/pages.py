# -*- coding: utf-8 -*-
"""Páginas especiais: capa, mapa, jornada, rotinas, exercícios, revisão, defesa, fontes."""
import html
import json
import re


def _b():
    import build
    return build


def esc(s):
    return html.escape(str(s), quote=True)


def track_badge(track):
    b = _b()
    return f'<span class="badge badge--{track}">{esc(b.TRACKS[track]["label"])}</span>'


def ev(kind):
    b = _b()
    label, cls = b.BOND_LABEL[kind]
    return f'<span class="ev {cls}">{esc(label)}</span>'


# ------------------------------------------------------------------ capa
def home(docs):
    b = _b()
    lessons = b.LESSONS
    n_lessons = len(lessons)
    n_routines = len([r for r in b.ROUTINES if r["kind"] == "rotina"])
    n_labs = len(b.ROUTINES)

    # gaveteiro 6x5
    rows = ["1", "2", "3", "4", "5", "6"]
    cols = ["A", "B", "C", "D", "E"]
    drawers = "".join(
        f'<button class="drawer-cell{" is-target" if f + c == "3C" else ""}" data-drawer="{f}{c}" '
        f'aria-label="Gaveta {f}{c}">{f}{c}</button>' for f in rows for c in cols
    )

    tracks_html = "".join(f"""
<a class="card card--track card--hover card--link" href="mapa/#{t}" style="--track:{_b().TRACKS[t]['color']}">
  <div class="card__kicker">{esc(_b().TRACKS[t]['short'])} · {len([l for l in lessons if l['track'] == t])} aulas</div>
  <h3>{esc(_b().TRACKS[t]['label'])}</h3>
  <p>{esc(_b().TRACKS[t]['desc'])}</p>
  <div class="card__foot"><span>Entrar na trilha</span><span style="margin-left:auto">→</span></div>
</a>""" for t in ("ed", "grafos", "tc"))

    routine_cards = "".join(f"""
<a class="card routine-card card--hover card--link" href="rotinas/{r['id']}/">
  <span class="routine-card__num">{r['num']:02d}</span>
  <div class="card__kicker">{'Rotina interativa' if r['kind'] == 'rotina' else 'Laboratório'}</div>
  <h3>{esc(r['title'])}</h3>
  <p>{esc(r['sub'])}</p>
  <div class="card__foot"><span>{len(r['cases'])} casos</span><span style="margin-left:auto">Abrir →</span></div>
</a>""" for r in b.ROUTINES[:6])

    steps = [
        ("Preveja", "Antes de rodar, arrisque um resultado. O erro explícito vale mais que a leitura passiva."),
        ("Execute", "Avance passo a passo e observe estado, operação e métricas no mesmo quadro."),
        ("Explique", "Diga em voz alta por que aquele passo aconteceu. Se travar, o site mostra a pré-condição."),
        ("Recupere", "Feche a página e responda à checagem. A lembrança difícil é a que fixa."),
        ("Aplique", "Leve o mesmo mecanismo para outro caso: outra chave, outro grafo, outra cadeia."),
    ]
    steps_html = "".join(f'<li><strong>{esc(t)}</strong><span>{esc(d)}</span></li>' for t, d in steps)

    body = f"""
<section class="hero">
  <div class="wrap hero__in">
    <div>
      <span class="hero__eyebrow">Projeto Integrador · Engenharia da Computação · UNISAL 2026</span>
      <h1>A biblioteca que aprende <em>em movimento</em>.</h1>
      <p class="hero__lead">Um livro, três pontos de vista e quinze rotinas para entender como Estruturas de Dados e Teoria da Computação sustentam o sistema da biblioteca do Tiro de Guerra.</p>
      <div class="btn-row">
        <a class="btn btn--light" href="mapa/">Começar pelo mapa de aulas {b.ICON_ARROW}</a>
        <a class="btn btn--outline-light" href="jornada/">Seguir o LIV123</a>
      </div>
      <div class="hero__meta">
        <div><strong>{n_lessons}</strong>aulas rastreáveis</div>
        <div><strong>{n_labs}</strong>simuladores</div>
        <div><strong>3</strong>trilhas integradas</div>
      </div>
    </div>
    <div>
      <div class="scene" id="scene" data-step="0">
        <div class="cabinet" style="position:absolute;inset:0;background:linear-gradient(160deg,#0d4a44,#06332f);border:10px solid #0a3f3a;border-radius:14px;box-shadow:inset 0 0 60px rgba(0,0,0,.5);padding:14px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;color:#9ecbb9;font:600 .62rem var(--font-mono);letter-spacing:.12em">
            <span>ACERVO · TG AMERICANA</span><span>6 × 5</span>
          </div>
          <div class="drawers" style="flex:1;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(6,1fr)">{drawers}</div>
        </div>
        <div class="hero-ficha" id="hero-ficha" aria-live="polite">
          <span class="hero-ficha__stamp" id="ficha-stamp">FÍSICA</span>
          <div class="hero-ficha__code" id="ficha-code">LIV123</div>
          <div class="hero-ficha__title" id="ficha-title">Manual das Estrelas</div>
          <div class="hero-ficha__meta"><span>Gaveta 3C</span><span>2 autores</span></div>
          <div class="hero-ficha__lines"><span></span><span></span><span></span></div>
        </div>
      </div>
      <div class="scene-caption" id="scene-caption" aria-live="polite">
        <span class="mono" style="color:#7fd1ae">01</span>
        <span><strong>Uma ficha na gaveta 3C.</strong> Clique na gaveta ou avance para retirar o LIV123.</span>
      </div>
      <div style="display:flex;align-items:center;gap:.7rem;margin-top:.4rem">
        <div class="scene-steps" id="scene-steps" role="tablist" aria-label="Etapas da abertura">
          {''.join(f'<button data-go="{i}" aria-label="Etapa {i+1}" aria-current="{"true" if i==0 else "false"}"></button>' for i in range(5))}
        </div>
        <button class="btn btn--sm btn--outline-light" id="scene-next" style="margin-left:auto">Avançar</button>
        <a class="btn btn--sm btn--outline-light" href="mapa/">Pular</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">Três trilhas, um sistema</div>
      <h2>O conteúdo do semestre inteiro, amarrado ao mesmo software.</h2>
      <p>As aulas não estão soltas: cada tópico aponta para um arquivo, uma consulta ou uma decisão do Projeto Integrador — e para um simulador onde você pode mexer.</p>
    </div>
    <div class="grid grid--3">{tracks_html}</div>
  </div>
</section>

<section class="section section--paper2">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">O fio condutor</div>
      <h2>Cadastrar → buscar → emprestar → devolver → consultar.</h2>
      <p>O mesmo <code>LIV123</code> atravessa todas as etapas. Em cada uma, você pode olhar pela tela, pelos dados ou pelo modelo teórico.</p>
    </div>
    <div class="grid grid--4" style="margin-bottom:1.2rem">
      {''.join(f'''<a class="card card--hover card--link" href="jornada/#{k}">
        <div class="card__kicker">Etapa {i+1}</div><h3>{t}</h3><p>{d}</p>
        <div class="card__foot"><span class="mono">{c}</span></div></a>''' for i, (k, t, d, c) in enumerate([
          ("entrada", "Entrada e arquitetura", "O dashboard abre direto; cada ação do bibliotecário revela tela, função e consulta.", "Program.cs → Form1"),
          ("cadastro", "Cadastro e modelagem", "Autores em lista, relação muitos-para-muitos e chave composta.", "listaAutoresTags"),
          ("busca", "Busca e acervo", "LIKE, junções, contagem e paginação no mesmo fluxo.", "Form2.cs"),
          ("devolucao", "Devolução e histórico", "Duas escritas, um commit — e filtros em memória.", "FormDevolucao.cs"),
        ]))}
    </div>
    <a class="btn btn--ghost" href="jornada/">Ver a jornada completa {b.ICON_ARROW}</a>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head section-head--wide" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:end;max-width:none">
      <div style="flex:1 1 420px">
        <div class="eyebrow">Simuladores</div>
        <h2>Doze rotinas que só fazem sentido neste projeto.</h2>
        <p>Gaveta que vira registro, devolução que reverte, autômato que carimba, grafo que se reconecta. Cada uma tem passo a passo, estado e métrica.</p>
      </div>
      <a class="btn btn--ghost" href="rotinas/">Ver as 15 atividades {b.ICON_ARROW}</a>
    </div>
    <div class="grid grid--3">{routine_cards}</div>
  </div>
</section>

<section class="section section--green">
  <div class="wrap">
    <div class="grid grid--2" style="gap:clamp(1.5rem,4vw,3.5rem);align-items:center">
      <div>
        <div class="eyebrow">Como estudar aqui</div>
        <h2>Cinco movimentos para cada assunto.</h2>
        <p style="max-width:52ch">O site não entrega só texto: ele organiza a leitura em segmentos curtos, pede uma previsão antes da animação, mostra o passo, explica a pré-condição e cobra a recuperação depois. Você controla quando a próxima cena começa.</p>
        <a class="btn btn--light" href="sobre/#metodo">Como o método aparece no site</a>
      </div>
      <ol class="method-list">{steps_html}</ol>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="grid grid--2" style="align-items:center;gap:2rem">
      <div>
        <div class="eyebrow">Para a banca</div>
        <h2>Dez minutos de apresentação, com as três pontes da disciplina.</h2>
        <p>O modo defesa percorre o problema, a solução, as decisões de engenharia e as três pontes com a disciplina: o léxico do <code>LIV</code>, a sintaxe da ficha de importação e a tratabilidade do roteiro de inventário. Cada passo diz o que mostrar e o que <em>não</em> afirmar.</p>
        <div class="btn-row"><a class="btn" href="defesa/">Abrir modo defesa</a><a class="btn btn--ghost" href="fontes/">Ver matriz de cobertura</a></div>
      </div>
      <div class="card" style="background:#fdfcf8">
        <div class="card__kicker">Três pontes</div>
        <div class="timeline" style="margin:.4rem 0 0">
          <div class="timeline__item"><div class="timeline__when">Nível 3 · Chomsky</div><h3>LIV[0-9]{3} e [1-6][A-E]</h3><p>Expressão regular, AFD totalizado e o ponto exato de rejeição.</p></div>
          <div class="timeline__item timeline__item--green"><div class="timeline__when">Nível 2 · Chomsky</div><h3>Ficha de importação com colchetes</h3><p>Gramática, árvore sintática e pilha com empilhar/desempilhar visíveis.</p></div>
          <div class="timeline__item timeline__item--amber"><div class="timeline__when">Complexidade</div><h3>Certificado, decisão e otimização</h3><p>Verificar uma rota é barato; decidir se existe dentro do orçamento é NP-completo.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight section--paper2">
  <div class="wrap" style="display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center;justify-content:space-between">
    <div>
      <div class="eyebrow">Fontes</div>
      <h3 style="margin:0">20 PDFs de aula, 2 atividades, 5 documentos e 3 revisões de código — todos rastreados.</h3>
    </div>
    <a class="btn" href="fontes/">Abrir a matriz de cobertura</a>
  </div>
</section>
"""
    return b.shell("index.html", "", body, active="inicio",
                   desc="Site de estudo do Projeto Integrador da biblioteca do Tiro de Guerra: Estruturas de Dados, Grafos e Teoria da Computação com 15 simuladores.",
                   scripts='<script src="assets/js/home.js" defer></script>', page_class="page-home")


# ------------------------------------------------------------------ mapa
def mapa():
    b = _b()
    counts = {}
    for L in b.LESSONS:
        counts[L["track"]] = counts.get(L["track"], 0) + 1
    blocks = []
    for t in ("ed", "grafos", "tc"):
        rows = []
        for L in [l for l in b.LESSONS if l["track"] == t]:
            r = b.ROUTINE_BY_ID.get(L["routine"], {})
            rows.append(f"""
<a class="lesson-row" href="../aulas/{L['slug']}/" data-track="{t}" data-slug="{L['slug']}" style="--track:{b.TRACKS[t]['color']}">
  <span class="lesson-row__num">{L['num']:02d}</span>
  <span>
    <span class="lesson-row__t">{esc(L['title'])}</span>
    <span class="lesson-row__s">{esc(L['short'])}</span>
  </span>
  <span class="lesson-row__meta">
    <span class="mono">{esc(L['pages'])}</span>
    <span>{('Simulador ' + str(r.get('num', ''))) if r else 'Somente leitura'}</span>
  </span>
</a>""")
        blocks.append(f"""
<section class="track-block" id="{t}" data-track-block="{t}">
  <div class="track-head" style="--track:{b.TRACKS[t]['color']}">
    <h2>{esc(b.TRACKS[t]['label'])}</h2>
    <span class="badge badge--{t}">{counts[t]} aulas</span>
    <span class="count">Comece pela aula 01 ou use os filtros acima</span>
  </div>
  <div class="lesson-list">{''.join(rows)}</div>
</section>""")

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Mapa de aulas</span></nav>
    <div class="eyebrow">Percurso completo</div>
    <h1>Mapa das {len(b.LESSONS)} aulas</h1>
    <p class="page-head__lead">Cada linha corresponde a uma apresentação do professor, com o PDF, as páginas e o simulador que transforma o conceito em operação. A ordem é uma sugestão: a trilha de Teoria começa pelo mesmo problema que a de Estruturas resolve.</p>
    <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center;margin-top:1.4rem">
      <div style="flex:1 1 320px;max-width:420px">
        <div class="progress-bar"><i data-total-progress style="width:0%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--ink-3);margin-top:.35rem"><span data-total-label>0 de {len(b.LESSONS)} aulas estudadas</span><span>salvo neste navegador</span></div>
      </div>
      <div class="btn-row">
        <a class="btn btn--sm btn--ghost" href="../revisao/">Revisar</a>
        <a class="btn btn--sm btn--ghost" href="../jornada/">Jornada do PI</a>
      </div>
    </div>
  </div>
</div>
<div class="wrap section--tight">
  <div class="pill-list" role="group" aria-label="Filtrar aulas" style="margin-bottom:1.6rem">
    <button class="chip" data-filter="all" aria-pressed="true">Todas</button>
    <button class="chip" data-filter="ed" aria-pressed="false">Estruturas de Dados</button>
    <button class="chip" data-filter="grafos" aria-pressed="false">Grafos</button>
    <button class="chip" data-filter="tc" aria-pressed="false">Teoria da Computação</button>
    <button class="chip" data-filter="done" aria-pressed="false">Estudadas</button>
    <button class="chip" data-filter="todo" aria-pressed="false">Pendentes</button>
    <button class="chip" data-filter="sim" aria-pressed="false">Com simulador</button>
  </div>
  {''.join(blocks)}
  <div class="callout callout--green" style="margin-top:2rem">
    <div class="callout__title">Trilha sugerida para a primeira semana</div>
    <p>Comece por <a href="../aulas/ed-01-fundamentos/">Fundamentos</a> e <a href="../aulas/ed-02-complexidade/">Big-O</a>, faça a rotina <a href="../rotinas/gaveteiro/">Gaveteiro</a> e depois leia <a href="../aulas/tc-02-linguagens/">Linguagens formais</a> com a rotina <a href="../rotinas/validacao/">Validação</a>. Em duas horas você cobre a base que a banca cobra.</p>
  </div>
</div>"""
    return b.shell("mapa/index.html", "Mapa de aulas", body, active="mapa",
                   desc="Mapa das 23 aulas de Estruturas de Dados, Grafos e Teoria da Computação com páginas dos PDFs e simuladores.",
                   scripts='<script>window.PI_TOTAL_LESSONS=23;</script><script src="../assets/js/mapa.js" defer></script>')


# ------------------------------------------------------------------ jornada
def jornada():
    b = _b()
    stations = [
        {
            "id": "entrada", "n": 1, "title": "Entrada e arquitetura", "sub": "Program.cs → FormDashboard",
            "lead": "O sistema não pede login nesta revisão: o programa abre o painel direto. Cada cartão do dashboard leva a um formulário e a uma consulta.",
            "tela": """<div class="mock-ui"><div class="mock-top"><span class="dotr"></span><span class="doty"></span><span class="dotg"></span><b>Dashboard · TGLibrary</b></div>
<div class="mock-body"><div class="mock-side"><span class="on">Acervo</span><span>Empréstimos</span><span>Devoluções</span><span>Histórico</span><span>Atiradores</span></div>
<div class="mock-main"><div class="mock-cards"><div><b>1.248</b><span>obras</span></div><div><b>96</b><span>atiradores</span></div><div><b>37</b><span>empréstimos</span></div></div>
<div class="mock-row"><span>Manual das Estrelas</span><span class="tag-ok">Disponível</span></div><div class="mock-row"><span>Cartas do Horizonte</span><span class="tag-warn">Emprestado</span></div></div></div></div>""",
            "dados": """<div class="code code--light" style="margin:0"><div class="code__bar"><span class="dot"></span><span>Program.cs</span><span class="lang">C#</span></div><pre><code>ApplicationConfiguration.Initialize();
Application.Run(new TGLibrary.FormDashboard());</code></pre></div>
<p style="font-size:.85rem;margin-top:.6rem">Confirmado no código: <code>Program.cs</code> instancia o dashboard diretamente. Os slides mostram uma tela de login que não existe neste snapshot.</p>""",
            "modelo": """<p style="font-size:.9rem">A arquitetura é uma máquina de estados de telas: cada ação do bibliotecário é uma transição. O estado persistente fica no MySQL; o estado de interface, nos formulários.</p>
<div class="flow-mini"><span>Dashboard</span><i>→</i><span>Cadastro</span><i>→</i><span>Acervo</span><i>→</i><span>Empréstimo</span><i>→</i><span>Devolução</span><i>→</i><span>Histórico</span></div>
<p style="font-size:.85rem;color:var(--ink-3)">Modelo didático: um grafo dirigido de navegação, com o dashboard como vértice de origem.</p>""",
            "code": ("Form1.cs", "BuscarTotais() consulta COUNT(*) em livros, atiradores e empréstimos; um Timer de 3 s atualiza os cartões."),
            "link": "../rotinas/versoes/", "link_label": "Comparar revisões",
        },
        {
            "id": "cadastro", "n": 2, "title": "Cadastro e modelagem", "sub": "regitro_livros.cs + livro_autores",
            "lead": "O cadastro gera o código, coleta título, gaveta, prazo e autores. Os autores vivem numa <code>List&lt;string&gt;</code> até o salvamento; no banco, viram relação muitos-para-muitos.",
            "tela": """<div class="mock-ui"><div class="mock-top"><span class="dotr"></span><span class="doty"></span><span class="dotg"></span><b>Cadastro de obra</b></div>
<div class="mock-form"><label>Código</label><div class="mock-input">LIV123</div><label>Título</label><div class="mock-input">Manual das Estrelas</div><label>Gaveta</label><div class="mock-input">3C</div>
<label>Autores</label><div class="mock-tags"><span>Ana Prado ×</span><span>Bruno Sá ×</span><span class="add">+ autor</span></div></div></div>""",
            "dados": """<div class="code code--light" style="margin:0"><div class="code__bar"><span class="dot"></span><span>banco.sql</span><span class="lang">SQL</span></div><pre><code>CREATE TABLE livro_autores (
  codigo_livro varchar(10) NOT NULL,
  id_autor int NOT NULL,
  PRIMARY KEY (codigo_livro, id_autor),
  FOREIGN KEY (codigo_livro) REFERENCES livros(codigo_livro) ON DELETE CASCADE,
  FOREIGN KEY (id_autor) REFERENCES autores(id_autor) ON DELETE CASCADE
);</code></pre></div>
<p style="font-size:.85rem;margin-top:.6rem">A chave composta impede o mesmo par livro–autor duas vezes. O <code>INSERT IGNORE</code> do formulário também ignora repetição.</p>""",
            "modelo": """<p style="font-size:.9rem">A relação muitos-para-muitos é um grafo bipartido: livros de um lado, autores do outro, arestas = vínculos. A tabela de junção é a lista de arestas.</p>
<div class="bipartite"><div><span>LIV123</span><span>LIV207</span></div><div class="edges"><i></i><i></i><i></i></div><div><span>Ana Prado</span><span>Bruno Sá</span><span>Carla Dias</span></div></div>""",
            "code": ("regitro_livros.cs", "AdicionarTagAutor usa listaAutoresTags.Contains antes de Add; a remoção é Remove(nome) e o painel é descartado."),
            "link": "../rotinas/autores/", "link_label": "Abrir raio-X dos autores",
        },
        {
            "id": "busca", "n": 3, "title": "Busca e acervo", "sub": "Form2.cs · Form3.Designer.cs",
            "lead": "A busca do acervo combina junções, <code>LIKE '%termo%'</code>, agregação de autores e uma subconsulta para saber quem está com o livro. A tela de empréstimos pagina com <code>LIMIT/OFFSET</code>.",
            "tela": """<div class="mock-ui"><div class="mock-top"><span class="dotr"></span><span class="doty"></span><span class="dotg"></span><b>Acervo · busca</b></div>
<div class="mock-search">🔎 estrelas <span>24 resultados · página 1 de 3</span></div>
<div class="mock-row"><span><b>LIV123</b> Manual das Estrelas<br><small>Ana Prado, Bruno Sá · 3C</small></span><span class="tag-ok">Disponível</span></div>
<div class="mock-row"><span><b>LIV207</b> Estrelas do Sul<br><small>Carla Dias · 5B</small></span><span class="tag-warn">Emprestado</span></div></div>""",
            "dados": """<div class="code code--light" style="margin:0"><div class="code__bar"><span class="dot"></span><span>Form2.cs · AplicarFiltroEBusca</span><span class="lang">SQL</span></div><pre><code>WHERE UPPER(e.status) NOT IN ('CONCLUIDO','CONCLUÍDO')
  AND (e.excluido = 0 OR e.excluido IS NULL)
  AND (l.titulo LIKE @busca OR a.nome_guerra LIKE @busca ...)
ORDER BY e.id DESC
LIMIT @offset, @limite;</code></pre></div>
<p style="font-size:.85rem;margin-top:.6rem">Confirmado: a contagem e a página são duas consultas; o filtro textual usa curinga nas duas pontas.</p>""",
            "modelo": """<p style="font-size:.9rem">Com <code>LIKE '%termo%'</code> não há como usar o índice B-tree para localizar o início: o banco tende a varrer. A paginação com <code>OFFSET</code> também percorre e descarta.</p>
<div class="flow-mini"><span>varredura n</span><i>→</i><span>filtro</span><i>→</i><span>k linhas</span><i>→</i><span>página</span></div>
<p style="font-size:.85rem;color:var(--ink-3)">Modelo didático: custo Θ(n) no filtro, mais o custo de materializar k resultados.</p>""",
            "code": ("Form3.Designer.cs", "GROUP_CONCAT dos autores e subconsulta com ORDER BY e.id DESC LIMIT 1 para o empréstimo ativo."),
            "link": "../rotinas/busca/", "link_label": "Abrir bancada de busca",
        },
        {
            "id": "emprestimo", "n": 4, "title": "Empréstimo e estados", "sub": "FormEmprestimo.cs",
            "lead": "Para liberar o empréstimo, o formulário verifica duas coisas por candidato: se a obra permite empréstimo e quantos empréstimos ativos existem. O status é recalculado pela data.",
            "tela": """<div class="mock-ui"><div class="mock-top"><span class="dotr"></span><span class="doty"></span><span class="dotg"></span><b>Novo empréstimo</b></div>
<div class="mock-form"><label>Obra</label><div class="mock-input">LIV123 · Manual das Estrelas</div><label>Retirada</label><div class="mock-input">18/11/2026</div><label>Vencimento</label><div class="mock-input">25/11/2026</div><label>Status</label><div class="mock-input">Pendente</div>
<div class="mock-note">✔ Obra disponível · prazo de 7 dias</div></div></div>""",
            "dados": """<div class="code code--light" style="margin:0"><div class="code__bar"><span class="dot"></span><span>FormEmprestimo.cs</span><span class="lang">SQL</span></div><pre><code>SELECT COALESCE(permite_emprestimo,1) FROM livros WHERE codigo_livro=@id;
SELECT COUNT(*) FROM emprestimos
 WHERE id_obra=@id AND UPPER(status) NOT IN ('CONCLUIDO','CONCLUÍDO');</code></pre></div>
<p style="font-size:.85rem;margin-top:.6rem">São duas consultas e uma conexão por verificação. No menu com vários candidatos, cada candidato dispara o par.</p>""",
            "modelo": """<p style="font-size:.9rem">Máquina de estados didática: <b>Pendente</b> → (data passou) <b>Atrasado</b> → (devolução) <b>Concluído</b>. O formulário grava o status; a data é a regra.</p>
<div class="flow-mini"><span>Pendente</span><i>→</i><span>Atrasado</span><i>→</i><span>Concluído</span></div>
<p style="font-size:.85rem;color:var(--ink-3)">A classificação por data é confirmada; o diagrama é modelo didático.</p>""",
            "code": ("FormEmprestimo.cs", "AtualizarStatusAutomaticoPorData compara dtpDevolucao.Value.Date com DateTime.Today."),
            "link": "../rotinas/emprestimo/", "link_label": "Abrir balcão de empréstimo",
        },
        {
            "id": "devolucao", "n": 5, "title": "Devolução e histórico", "sub": "FormDevolucao.cs · historico_devolucao.cs",
            "lead": "A devolução grava o detalhe e conclui o empréstimo na mesma transação. O histórico carrega tudo para <code>_todos</code>, filtra para <code>_visiveis</code> e ordena no SQL.",
            "tela": """<div class="mock-ui"><div class="mock-top"><span class="dotr"></span><span class="doty"></span><span class="dotg"></span><b>Devolução</b></div>
<div class="mock-form"><label>Atirador</label><div class="mock-input">Nº 042 · Pessoa Fictícia A</div><label>Empréstimo</label><div class="mock-input">#118 · Manual das Estrelas</div><label>Devolução</label><div class="mock-input">18/11/2026 10:32</div>
<div class="mock-note warn">Atraso de 3 dias · estado: Bom</div><div class="mock-btn">Registrar devolução</div></div></div>""",
            "dados": """<div class="code code--light" style="margin:0"><div class="code__bar"><span class="dot"></span><span>FormDevolucao.cs</span><span class="lang">C#</span></div><pre><code>using var tx = conn.BeginTransaction();
INSERT INTO devolucoes (...) VALUES (...);
UPDATE emprestimos SET status='Concluído'
 WHERE id=@id AND UPPER(status) NOT IN ('CONCLUIDO','CONCLUÍDO');
if (afetadas == 0) { tx.Rollback(); return; }
tx.Commit();</code></pre></div>""",
            "modelo": """<p style="font-size:.9rem">Duas escritas dependentes: ou ambas valem, ou nenhuma. A transação é a barreira; a <code>UNIQUE(id_emprestimo)</code> é a segunda barreira contra duplicidade.</p>
<div class="flow-mini"><span>INSERT</span><i>→</i><span>UPDATE</span><i>→</i><span>COMMIT</span></div>
<p style="font-size:.85rem;color:var(--ink-3)">Falha no meio → ROLLBACK. Devolução repetida → erro 1062.</p>""",
            "code": ("historico_devolucao.cs", "_todos recebe todos os registros; AplicarFiltros monta _visiveis; a média considera só DiasAtraso > 0."),
            "link": "../rotinas/devolucao/", "link_label": "Abrir mesa de devolução",
        },
    ]

    blocks = []
    for s in stations:
        blocks.append(f"""
<section class="station" id="{s['id']}" data-station="{s['id']}">
  <div class="station__head">
    <span class="station__num">{s['n']:02d}</span>
    <div><h2>{esc(s['title'])}</h2><div class="mono" style="font-size:.75rem;color:var(--ink-3)">{esc(s['sub'])}</div></div>
  </div>
  <p class="station__lead">{s['lead']}</p>
  <div class="views" data-views>
    <div class="views__tabs" role="tablist" aria-label="Pontos de vista">
      <button role="tab" aria-selected="true" data-view="tela">Tela da biblioteca</button>
      <button role="tab" aria-selected="false" data-view="dados">Dados e código</button>
      <button role="tab" aria-selected="false" data-view="modelo">Modelo teórico</button>
    </div>
    <div class="views__panel" data-panel="tela" role="tabpanel">{s['tela']}</div>
    <div class="views__panel" data-panel="dados" role="tabpanel" hidden>{s['dados']}</div>
    <div class="views__panel" data-panel="modelo" role="tabpanel" hidden>{s['modelo']}</div>
  </div>
  <div class="station__foot">
    <p style="margin:0;font-size:.85rem"><strong>No código:</strong> {esc(s['code'][1])} <span class="mono" style="color:var(--ink-3)">({esc(s['code'][0])})</span></p>
    <a class="btn btn--sm btn--ghost" href="{s['link']}">{esc(s['link_label'])} →</a>
  </div>
</section>""")

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Jornada do PI</span></nav>
    <div class="eyebrow">O mesmo livro, três olhares</div>
    <h1>A jornada do LIV123</h1>
    <p class="page-head__lead">Uma ficha física sai da gaveta 3C, vira linha de banco, aparece num resultado de consulta e volta como item de lista na tela. Troque de vista sem perder o livro: o código, o título e a posição continuam os mesmos.</p>
    <div class="btn-row" style="margin-top:1.2rem">
      <a class="btn" href="../rotinas/gaveteiro/">Abrir o gaveteiro interativo</a>
      <a class="btn btn--ghost" href="../defesa/">Levar para a defesa</a>
    </div>
  </div>
</div>
<div class="wrap section--tight">
  <div class="journey-strip" aria-hidden="true">
    <span>Ficha física</span><i>→</i><span>Registro</span><i>→</i><span>Consulta</span><i>→</i><span>Empréstimo</span><i>→</i><span>Devolução</span><i>→</i><span>Histórico</span>
  </div>
  {''.join(blocks)}
  <div class="callout">
    <div class="callout__title">A regra de ouro da apresentação</div>
    <p>Sempre diga em qual vista você está. “Isto é a tela” e “isto é o modelo” não são a mesma afirmação. O site marca cada trecho com <span class="ev ev--code">confirmado no código</span>, <span class="ev ev--model">modelo didático</span> ou <span class="ev ev--future">proposta</span> justamente para você não misturar as três.</p>
  </div>
</div>"""
    return b.shell("jornada/index.html", "Jornada do PI", body, active="jornada",
                   desc="A trajetória do livro LIV123 nas três vistas: tela da biblioteca, dados e código, modelo teórico.",
                   scripts='<script src="../assets/js/jornada.js" defer></script>')


# ------------------------------------------------------------------ rotinas
TESTS = {
    "gaveteiro": [("Abrir 3C", "ficha LIV123 sai; SQL, resultado e item de lista preservam código e título"),
                  ("Trocar para 1A", "a identidade muda para o livro daquela gaveta; voltar restaura o anterior"),
                  ("Linhas 4 × colunas 3", "12 gavetas; contador de laços = 12 e Θ(4×3)")],
    "busca": [("LIV123 no catálogo", "varredura e binária encontram; hash encontra no bucket calculado"),
              ("LIV999 ausente", "varredura visita n; binária descarta até o intervalo vazio; hash erra o bucket"),
              ("Catálogo com 3 obras", "métricas caem; o custo de preparo aparece separado")],
    "devolucao": [("Devolução em dia", "dias_atraso = 0; INSERT + UPDATE + COMMIT"),
                  ("Falha simulada", "INSERT desfeito; empréstimo continua aberto; contadores voltam"),
                  ("Duas devoluções", "segunda bloqueada pela UNIQUE (erro 1062)")],
    "validacao": [("LIV123", "aceita; 6 transições; estado final q6"),
                  ("LIV000", "aceita pela regra de formato, mas fora do domínio do gerador (100–998)"),
                  ("LIV123X", "rejeita no 7º símbolo; estado de erro"),
                  ("3F", "rejeita: coluna F não existe em [1-6][A-E]")],
    "grafos": [("BFS em A", "fronteira cresce por níveis; saltos mínimos sem peso"),
               ("Dijkstra com peso negativo", "pode assentar cedo; veja o contraexemplo com A→C=2"),
               ("Ciclo negativo alcançável", "Bellman-Ford detecta na rodada V; Floyd–Warshall mostra diagonal negativa")],
    "versoes": [("Falha no 2º comando · protótipo", "INSERT permanece; status do livro não muda: estado inconsistente"),
                ("Falha no 2º comando · revisão", "ROLLBACK desfaz o INSERT; nada muda")],
    "custo": [("n = 12", "contagem observada pequena; curva ainda plana"),
              ("Ocupação 90%", "tentativas esperadas M/(M−m) crescem; colisões de bucket aumentam"),
              ("Mesma entrada, duas estratégias", "comparação lado a lado com os mesmos passos")],
    "autores": [("Adicionar 'Ana Prado'", "Contains percorre 0..k−1 e adiciona ao final"),
                ("Repetir 'Ana Prado'", "rejeitado sem alterar Count"),
                ("Remover no meio", "referências deslocadas; cópias contadas"),
                ("Capacidade esgotada", "novo bloco maior; cópias = Count antigo")],
    "historico": [("Busca 'orbita'", "encontra 'Órbita' sem acento; 1 resultado"),
                  ("Somente atrasados", "k < n; média só dos atrasados"),
                  ("Datas iguais sem desempate", "Insertion mantém ordem relativa; Selection pode trocar")],
    "emprestimo": [("Vencimento hoje", "status calculado: Pendente"),
                   ("Vencimento ontem", "status calculado: Atrasado"),
                   ("Obra bloqueada", "permite_emprestimo = 0 → indisponível"),
                   ("Múltiplos candidatos", "2 consultas por candidato; contador cresce")],
    "lote": [("aabbcc", "AFD aceita; AP reconhece aⁿbⁿ; MT aceita"),
             ("aabcc", "AFD aceita a ordem; AP reconhece aⁿbⁿ e ignora os c; MT rejeita"),
             ("acb", "AFD rejeita na ordem dos blocos"),
             ("cadeia vazia", "aceita (n = 0)"),
             ("limite de passos", "interrompida — não é prova de indecidibilidade")],
    "roteiro": [("A–B–C–E–D–A", "custo 12; passa no verificador"),
                ("Vizinho mais próximo", "A–B–C–D–E–A custa 14; não passa no orçamento"),
                ("Sem posições obrigatórias", "circuito vazio custa 0 e é válido")],
    "ordenacao": [("Entrada inversa", "Bubble e Insertion no pior caso; Selection estável em comparações"),
                  ("Quase ordenada", "Insertion faz poucas escritas"),
                  ("Com repetidos", "Insertion e Merge preservam a ordem relativa; Selection não")],
    "hash-arvores": [("α > 1", "encadeamento aceita; média cresce"),
                     ("Sondagem linear", "agrupamento primário visível"),
                     ("BST em ordem crescente", "degenera em lista; altura n−1")],
    "memoria-listas": [("push/pop", "LIFO preservado; topo volta ao valor anterior"),
                       ("enqueue/dequeue", "FIFO preservado; frente avança"),
                       ("Remover nó do meio", "anterior->prox = atual->prox; free(atual)")],
}


def routines_index():
    b = _b()
    rot = [r for r in b.ROUTINES if r["kind"] == "rotina"]
    labs = [r for r in b.ROUTINES if r["kind"] == "laboratorio"]

    def card(r):
        return f"""
<a class="card routine-card card--hover card--link" href="{r['id']}/">
  <span class="routine-card__num">{r['num']:02d}</span>
  <div class="card__kicker">{'Rotina' if r['kind'] == 'rotina' else 'Laboratório'} · {len(r['cases'])} casos</div>
  <h3>{esc(r['title'])}</h3>
  <p>{esc(r['sub'])}</p>
  <div class="card__foot"><span class="mono" style="font-size:.68rem">{esc(r['source'].split(';')[0])}</span></div>
</a>"""

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Simuladores</span></nav>
    <div class="eyebrow">Aprender operando</div>
    <h1>12 rotinas + 3 laboratórios</h1>
    <p class="page-head__lead">Cada simulador calcula os passos a partir da entrada, guarda o estado separado da animação e mostra contadores. Todos têm Avançar, Voltar, Executar/Pausar, Reiniciar, velocidade e casos prontos — no teclado ou no toque.</p>
    <div class="btn-row" style="margin-top:1.2rem">
      <a class="btn" href="gaveteiro/">Começar pela rotina 01</a>
      <a class="btn btn--ghost" href="../sobre/#atalhos">Ver atalhos de teclado</a>
    </div>
  </div>
</div>
<div class="wrap section--tight">
  <div class="section-head"><div class="eyebrow">Rotinas do briefing</div><h2>As doze que a banca pede</h2></div>
  <div class="grid grid--3">{''.join(card(r) for r in rot)}</div>
  <div class="section-head" style="margin-top:3rem"><div class="eyebrow">Apoio</div><h2>Três laboratórios de base</h2>
  <p>Ordenação, hash/árvores e memória/listas: os mecanismos que aparecem dentro das rotinas, isolados para você comparar algoritmos.</p></div>
  <div class="grid grid--3">{''.join(card(r) for r in labs)}</div>
  <div class="callout callout--amber" style="margin-top:2rem">
    <div class="callout__title">O que é simulado e o que é real</div>
    <p>Os dados são fictícios e as operações acontecem no navegador. Quando uma rotina reproduz uma consulta ou transação, ela mostra o SQL equivalente e diz se o comportamento foi <strong>confirmado no código</strong> ou construído como <strong>modelo didático</strong>. Nenhum simulador se conecta ao MySQL.</p>
  </div>
</div>"""
    return b.shell("rotinas/index.html", "Simuladores", body, active="rotinas",
                   desc="12 rotinas interativas e 3 laboratórios sobre o Projeto Integrador: gaveteiro, busca, devolução, autômatos, grafos, custo e TSP.")


def routine_page(r):
    b = _b()
    tests = TESTS.get(r["id"], [])
    tests_html = "".join(f"<tr><td><code>{esc(c)}</code></td><td>{esc(e)}</td></tr>" for c, e in tests)
    learn = "".join(f'<a class="badge badge--{b.LESSON_BY_SLUG[s]["track"]}" href="../../aulas/{s}/">{esc(b.LESSON_BY_SLUG[s]["title"])}</a> '
                    for s in r["learn"] if s in b.LESSON_BY_SLUG)
    idx = [x["id"] for x in b.ROUTINES].index(r["id"])
    prev = b.ROUTINES[idx - 1] if idx > 0 else b.ROUTINES[-1]
    nxt = b.ROUTINES[idx + 1] if idx + 1 < len(b.ROUTINES) else b.ROUTINES[0]
    cases = "".join(f'<button class="chip" data-case="{esc(c)}">{esc(c)}</button>' for c in r["cases"])

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../../">Início</a><span>/</span><a href="../">Simuladores</a><span>/</span><span>{'Rotina' if r['kind'] == 'rotina' else 'Laboratório'} {r['num']:02d}</span></nav>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
      <span class="badge badge--ok">{'Rotina interativa' if r['kind'] == 'rotina' else 'Laboratório de apoio'}</span>
      <span class="badge">passos determinísticos</span><span class="badge">dados fictícios</span>
    </div>
    <h1>{esc(r['title'])}</h1>
    <p class="page-head__lead">{esc(r['sub'])}</p>
    <div class="page-actions"><button class="btn btn--sm btn--ghost" data-tts-inline>Ler a introdução</button><button class="btn btn--sm btn--ghost" onclick="window.print()">Imprimir roteiro</button></div>
  </div>
</div>
<div class="wrap" style="padding-top:1.4rem">
  <div class="callout" style="margin-top:0">
    <div class="callout__title">Pergunta que a rotina responde</div>
    <p style="font-family:var(--font-head);font-size:1.08rem;color:var(--green);margin:0">{esc(r['question'])}</p>
  </div>
  <div class="lab" id="lab" data-lab="{r['id']}">
    <div class="lab__head">
      <h2>{esc(r['title'])}</h2>
      <span class="badge">simulador</span>
      <span class="spacer"></span>
      <span class="badge" id="lab-step-badge">passo 0</span>
    </div>
    <div class="lab__bar"><i data-lab-progress></i></div>
    <div class="lab__body">
      <div class="lab__stage" id="lab-stage" aria-label="Palco da simulação"></div>
      <div class="lab__panel">
        <div>
          <h3>Operação atual</h3>
          <p id="lab-op" aria-live="polite" style="margin:.25rem 0 0;font-size:.9rem;min-height:2.6em">Carregando…</p>
        </div>
        <div>
          <h3>Métricas</h3>
          <div class="metrics" id="lab-metrics"></div>
        </div>
        <div>
          <h3>Estado</h3>
          <dl class="kv" id="lab-state"></dl>
        </div>
        <div>
          <h3>Traço</h3>
          <div class="log" id="lab-log" aria-label="Registro de operações"></div>
        </div>
      </div>
    </div>
    <div class="lab__controls" id="lab-controls">
      <button class="btn btn--sm btn--ghost" data-lab-prev aria-label="Passo anterior">{b.ICON_BACK} Voltar</button>
      <button class="btn btn--sm" data-lab-play aria-pressed="false">Executar</button>
      <button class="btn btn--sm btn--ghost" data-lab-next>Avançar {b.ICON_ARROW}</button>
      <button class="btn btn--sm btn--ghost" data-lab-reset>Reiniciar</button>
      <label class="range" style="max-width:150px">Velocidade
        <select data-lab-speed aria-label="Velocidade">
          <option value="1400">0,5×</option><option value="700" selected>1×</option><option value="350">2×</option><option value="140">4×</option>
        </select>
      </label>
      <div class="grow"></div>
      <span class="lab__status" id="lab-counter">passo 0 / 0</span>
    </div>
    <div class="lab__controls" id="lab-params" style="background:#f6f4ec"></div>
  </div>

  <div class="grid grid--2" style="margin-top:1.6rem">
    <div class="card">
      <div class="card__kicker">O que fazer</div>
      <p>{esc(r['what'])}</p>
      <div class="card__kicker" style="margin-top:.8rem">Casos prontos</div>
      <div class="pill-list">{cases}</div>
    </div>
    <div class="card">
      <div class="card__kicker">O que observar</div>
      <p>{esc(r['watch'])}</p>
      <div class="card__kicker" style="margin-top:.8rem">Fonte da evidência</div>
      <p class="mono" style="font-size:.78rem;margin:0">{esc(r['source'])}</p>
    </div>
  </div>

  <div class="grid grid--2" style="margin-top:1.2rem">
    <div class="card">
      <div class="card__kicker">Teste rápido — resultado esperado</div>
      <div class="table-wrap" style="margin:.4rem 0 0"><table class="compact"><thead><tr><th>Caso</th><th>O que deve acontecer</th></tr></thead><tbody>{tests_html}</tbody></table></div>
    </div>
    <div class="card">
      <div class="card__kicker">Vínculo com as aulas</div>
      <div class="pill-list" style="margin-bottom:.8rem">{learn}</div>
      <p style="font-size:.88rem;margin-bottom:.4rem">A rotina é uma demonstração; a explicação conceitual e o exercício estão nas aulas acima. Use os dois juntos: primeiro preveja na aula, depois execute aqui.</p>
      <div class="btn-row"><a class="btn btn--sm btn--ghost" href="../../revisao/">Revisar este tema</a><a class="btn btn--sm btn--ghost" href="../../defesa/">Levar para a defesa</a></div>
    </div>
  </div>

  <nav class="pager" aria-label="Outras rotinas">
    <a class="prev" href="../{prev['id']}/"><span>← {prev['num']:02d}</span><strong>{esc(prev['title'])}</strong></a>
    <a class="next" href="../{nxt['id']}/"><span>{nxt['num']:02d} →</span><strong>{esc(nxt['title'])}</strong></a>
  </nav>
</div>"""
    scripts = ('<script src="../../assets/js/lab-core.js" defer></script>'
               '<script src="../../assets/js/labs/shared.js" defer></script>'
               f'<script src="../../assets/js/labs/{r["id"]}.js" defer></script>')
    return b.shell(f"rotinas/{r['id']}/index.html", r["title"], body, active="rotinas",
                   desc=f"{r['title']} — {r['sub']}", scripts=scripts)


# ------------------------------------------------------------------ exercícios
def exercicios_page():
    b = _b()
    data = b.load_json("exercicios.json", {"sets": []})
    sets = data.get("sets", [])
    nav = "".join(f'<button class="chip" data-ex-set="{s["id"]}" aria-pressed="{"true" if i == 0 else "false"}">{esc(s["title"].split("—")[0].strip())}</button>'
                  for i, s in enumerate(sets))
    blocks = []
    for i, s in enumerate(sets):
        exs = []
        for e in s["exercises"]:
            opts = "".join(
                f'<button class="quiz__opt" data-ex="{e["id"]}" data-i="{j}" data-answer="{e["answer"]}">'
                f'<span class="mark">{chr(65 + j)}</span><span>{esc(o)}</span></button>'
                for j, o in enumerate(e["options"]))
            hints = "".join(f"<li>{h}</li>" for h in e.get("hints", []))
            table = ""
            if e.get("table"):
                table = f'<div class="ex-table"><div class="card__kicker">Teste de mesa</div>{b.render_code(e["table"])}</div>'
            exs.append(f"""
<article class="exercise" data-ex-id="{e['id']}" data-lesson="{s.get('lesson','')}">
  <div class="exercise__head"><span class="mono">{esc(e['id']).upper()}</span><span class="badge">{esc(s['title'].split('—')[0].strip())}</span></div>
  <div class="exercise__prompt">{b.render_code(e['prompt'])}</div>
  <div class="quiz" data-ex-quiz="{e['id']}">
    <div class="quiz__opts" role="group" aria-label="Alternativas">{opts}</div>
    <div class="quiz__fb" role="status"></div>
    <div class="quiz__foot"><span>Escolha uma alternativa.</span><button class="btn btn--ghost btn--sm reveal-sol" data-sol="">Ver solução</button></div>
  </div>
  <details class="reveal"><summary>Pistas progressivas</summary><ol>{hints}</ol></details>
  {table}
  <details class="reveal solution"><summary>Resolução comentada</summary>{b.render_code(e.get('solution',''))}</details>
</article>""")
        blocks.append(f"""<section class="ex-set" id="{s['id']}" data-set="{s['id']}" {'hidden' if i else ''}>
  <div class="ex-set__head">
    <div><div class="eyebrow">{'Exercícios autorais' if s.get('kind') == 'ava' else 'Desafios da aula'}</div>
    <h2>{esc(s['title'])}</h2><p class="muted" style="font-size:.85rem;margin:0">{esc(s.get('source',''))}</p></div>
    <span class="badge">{len(s['exercises'])} exercícios</span>
  </div>
  <div class="note-strip" style="margin-bottom:1.2rem">{esc(s.get('note','Exercício autoral produzido para este site.'))}</div>
  {''.join(exs)}
</section>""")

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Exercícios</span></nav>
    <div class="eyebrow">Prática com devolutiva</div>
    <h1>Exercícios por atividade do AVA</h1>
    <p class="page-head__lead">Doze conjuntos: oito atividades do índice, a lista de grafos e os três desafios de regex da aula 2. Cada exercício tem pistas progressivas, teste de mesa quando faz sentido, feedback por alternativa e solução revelável.</p>
    <div class="callout callout--amber" style="margin-top:1rem">
      <div class="callout__title">Autoria</div>
      <p>O PDF do AVA lista apenas os títulos das atividades, sem os enunciados. Os exercícios deste site foram escritos para cobrir esses títulos e estão marcados como <strong>autorais</strong>. Os três desafios de regex foram reescritos a partir de <code>aula2.pdf</code>, pp. 27–29.</p>
    </div>
  </div>
</div>
<div class="wrap section--tight">
  <div class="pill-list" style="margin-bottom:1.6rem" role="group" aria-label="Escolher conjunto">{nav}</div>
  {''.join(blocks)}
</div>"""
    return b.shell("exercicios/index.html", "Exercícios", body, active="exercicios",
                   desc="Exercícios autorais por atividade do AVA, com pistas, teste de mesa, feedback e solução.",
                   scripts='<script src="../assets/js/exercicios.js" defer></script>')


# ------------------------------------------------------------------ revisão
def revisao_page():
    b = _b()
    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Revisão</span></nav>
    <div class="eyebrow">Recuperação ativa e intercalada</div>
    <h1>Revisão que mistura as trilhas</h1>
    <p class="page-head__lead">Um baralho com todas as checagens das 23 aulas. Responder de memória, errar, ver a explicação e voltar depois é mais eficaz do que reler. O site guarda seus erros e o que você marcou como dúvida.</p>
  </div>
</div>
<div class="wrap section--tight">
  <div class="review-shell">
    <div class="review-main">
      <div class="review-top">
        <span class="badge badge--ok" id="review-pos">1 de 1</span>
        <span class="badge" id="review-track">—</span>
        <span style="margin-left:auto;font-size:.76rem;color:var(--ink-3)" id="review-box">caixa 1</span>
      </div>
      <div class="review-q" id="review-q">Carregando…</div>
      <div class="quiz__opts" id="review-opts"></div>
      <div class="quiz__fb" id="review-fb" role="status"></div>
      <div class="review-controls">
        <button class="btn btn--sm btn--ghost" id="review-prev">← Anterior</button>
        <button class="btn btn--sm btn--ghost" id="review-doubt">Marcar dúvida</button>
        <button class="btn btn--sm" id="review-next">Próxima →</button>
      </div>
    </div>
    <aside class="review-side">
      <h3>Filtro</h3>
      <div class="pill-list" id="review-filters">
        <button class="chip" data-rfilter="all" aria-pressed="true">Todas</button>
        <button class="chip" data-rfilter="ed" aria-pressed="false">ED</button>
        <button class="chip" data-rfilter="grafos" aria-pressed="false">Grafos</button>
        <button class="chip" data-rfilter="tc" aria-pressed="false">TC</button>
        <button class="chip" data-rfilter="wrong" aria-pressed="false">Só erradas</button>
        <button class="chip" data-rfilter="doubt" aria-pressed="false">Só dúvidas</button>
      </div>
      <h3 style="margin-top:1.2rem">Seu placar</h3>
      <dl class="kv" id="review-stats"></dl>
      <div class="progress-bar" style="margin-top:.6rem"><i id="review-progress" style="width:0%"></i></div>
      <button class="btn btn--ghost btn--sm" id="review-reset" style="margin-top:1rem;width:100%">Zerar progresso da revisão</button>
      <p style="font-size:.72rem;color:var(--ink-3);margin-top:.6rem">Salvo apenas neste navegador. Nada é enviado para servidor.</p>
    </aside>
  </div>

  <section id="caderno" style="margin-top:2.6rem">
    <div class="section-head"><div class="eyebrow">Caderno de erros</div><h2>O que ainda não está firme</h2>
    <p>Questões erradas ou marcadas como dúvida, com link direto para a aula. Reveja a explicação antes de tentar de novo.</p></div>
    <div id="error-notebook"></div>
  </section>

  <div class="callout callout--green" style="margin-top:2rem">
    <div class="callout__title">Como usar o espaçamento</div>
    <p>Revise hoje, volte em dois dias e depois em uma semana. O botão “marcar dúvida” coloca a questão na frente da fila; acertos consecutivos aumentam a caixa e reduzem a frequência. Não é mágica: é prática de recuperação distribuída.</p>
  </div>
</div>"""
    return b.shell("revisao/index.html", "Revisão", body, active="revisao",
                   desc="Revisão intercalada com questões das 23 aulas, caderno de erros e progresso local.",
                   scripts='<script src="../assets/js/quiz-data.js" defer></script><script src="../assets/js/revisao.js" defer></script>')


# ------------------------------------------------------------------ defesa
def defesa_page():
    b = _b()
    d = b.load_json("defesa.json", {"steps": [], "qa": [], "checklist": [], "bridges": []})
    steps = d.get("steps", [])
    nav = "".join(f'<button class="def-step-btn{" is-active" if i == 0 else ""}" data-def-go="{i}"><span>{s["n"]:02d}</span>{esc(s["title"].split("—")[0].strip())}</button>'
                  for i, s in enumerate(steps))
    panels = "".join(f"""
<article class="def-step" data-def-step="{i}" {'hidden' if i else ''}>
  <div class="def-step__meta"><span class="badge">Passo {s['n']} de {len(steps)}</span><span class="badge badge--warn">{s.get('seconds', 60)} s</span></div>
  <h2>{esc(s['title'])}</h2>
  <div class="def-say"><div class="card__kicker">O que dizer</div><p>{esc(s['say'])}</p></div>
  <div class="grid grid--2" style="margin-top:1rem">
    <div class="card"><div class="card__kicker">O que mostrar</div><p style="margin-bottom:.6rem">{esc(s.get('show_label',''))}</p><a class="btn btn--sm" href="..{s.get('show','/')}" target="_blank" rel="noopener">Abrir recurso</a></div>
    <div class="card"><div class="card__kicker">Evidência e limite</div><p style="font-size:.86rem">{esc(s.get('evidence',''))}</p><p style="font-size:.82rem;color:var(--amber)"><strong>Cuidado:</strong> {esc(s.get('tip',''))}</p></div>
  </div>
</article>""" for i, s in enumerate(steps))
    qa = "".join(f"""<details class="accordion"><summary>{esc(q['q'])}</summary>
<div class="accordion__body"><p>{esc(q['a'])}</p><span class="badge">{esc(q.get('tag',''))}</span></div></details>""" for q in d.get("qa", []))
    checks = "".join(f'<label class="check-item"><input type="checkbox" data-check="{i}"> <span>{esc(c)}</span></label>'
                     for i, c in enumerate(d.get("checklist", [])))
    bridges = "".join(f"""<div class="card card--track" style="--track:var(--{'blue' if i==0 else ('green' if i==1 else 'amber')})">
<div class="card__kicker">{esc(br['level'])}</div><h3>{esc(br['title'])}</h3><p>{esc(br['summary'])}</p>
<div class="btn-row"><a class="btn btn--sm btn--ghost" href="{br['route']}">Abrir rotina</a><a class="btn btn--sm btn--ghost" href="../aulas/{br['lesson']}/">Ver aula</a></div></div>"""
                    for i, br in enumerate(d.get("bridges", [])))

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Defesa</span></nav>
    <div class="eyebrow">Roteiro cronometrado</div>
    <h1>Modo defesa</h1>
    <p class="page-head__lead">{esc(d.get('intro',''))}</p>
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn" id="def-start">Iniciar apresentação</button>
      <button class="btn btn--ghost" onclick="window.print()">{b.ICON_PRINT} Imprimir roteiro</button>
      <a class="btn btn--ghost" href="../fontes/">Abrir fontes</a>
    </div>
  </div>
</div>
<div class="wrap section--tight">
  <div class="def-layout">
    <aside class="def-nav" aria-label="Passos da apresentação">
      <div class="def-timer" id="def-timer" aria-live="off">
        <span class="def-timer__label">Tempo</span>
        <span class="def-timer__value" id="def-clock">00:00</span>
        <div class="btn-row" style="margin-top:.4rem"><button class="btn btn--sm btn--ghost" id="def-play">Iniciar</button><button class="btn btn--sm btn--ghost" id="def-reset">Zerar</button></div>
      </div>
      {nav}
      <div class="def-progress"><i id="def-progress"></i></div>
    </aside>
    <div class="def-main">
      {panels}
      <div class="def-controls">
        <button class="btn btn--ghost" id="def-prev">← Anterior</button>
        <span class="muted" style="font-size:.8rem">Use ← → para navegar, P para pausar o tempo</span>
        <button class="btn" id="def-next">Próximo →</button>
      </div>
    </div>
  </div>

  <section style="margin-top:3rem">
    <div class="section-head"><div class="eyebrow">Três pontes</div><h2>O que a disciplina entrega ao projeto</h2></div>
    <div class="grid grid--3">{bridges}</div>
  </section>

  <section style="margin-top:3rem">
    <div class="section-head"><div class="eyebrow">Perguntas prováveis</div><h2>Respostas curtas, com evidência</h2>
    <p>Abra cada pergunta e ensaie em voz alta. Se a resposta começar com “eu acho”, volte ao código.</p></div>
    {qa}
  </section>

  <section style="margin-top:3rem">
    <div class="section-head"><div class="eyebrow">Antes de abrir o site</div><h2>Checklist da apresentação</h2></div>
    <div class="checklist" id="checklist">{checks}</div>
    <div class="btn-row" style="margin-top:1rem"><button class="btn btn--ghost btn--sm" id="check-reset">Limpar checklist</button><span class="muted" style="font-size:.78rem">Salvo neste navegador.</span></div>
  </section>

  <div class="callout callout--amber" style="margin-top:2.4rem">
    <div class="callout__title">Regra de honestidade</div>
    <p>Se a banca perguntar sobre login, OCR ou APIs, a resposta é: <strong>previsto na documentação, não comprovado nesta revisão do código</strong>. O site existe para você mostrar a diferença entre o que o sistema faz e o que o projeto imagina. Isso vale mais do que qualquer promessa.</p>
  </div>
</div>"""
    return b.shell("defesa/index.html", "Modo defesa", body, active="defesa",
                   desc="Roteiro de defesa em 10 minutos, três pontes com a disciplina, perguntas de banca e checklist.",
                   scripts='<script src="../assets/js/defesa.js" defer></script>')


# ------------------------------------------------------------------ fontes
def fontes_page():
    b = _b()
    docs = [
        ("aula1 (1).pdf", "Fundamentos, Memória e Visão Geral da Disciplina", "18", "ed-01-fundamentos", "Lida integralmente"),
        ("aula2 (1).pdf", "Classes de Complexidade e Notação Big-O", "12", "ed-02-complexidade", "Lida integralmente"),
        ("aula3.pdf", "Gerenciamento Dinâmico e Estruturas", "13", "ed-03-ponteiros", "Lida integralmente"),
        ("aula5 (1).pdf", "Filas, Pilhas e Listas Lineares", "12", "ed-05-listas", "Lida integralmente"),
        ("aula6 (1).pdf", "Algoritmos de Ordenação Simples", "13", "ed-06-ordenacao", "Lida integralmente"),
        ("aula7 (1).pdf", "Ordenação e Busca Otimizada", "15", "ed-07-merge-busca", "Lida integralmente"),
        ("aula8.pdf", "Tabelas Hash e Introdução a Árvores", "17", "ed-08-hash", "Lida integralmente"),
        ("aula2 (2).pdf", "Grafos: Fundamentos e Representações", "15", "gr-01-fundamentos", "Lida integralmente"),
        ("aula3 (1).pdf", "Componentes e Subestruturas em Grafos", "6", "gr-02-subgrafos", "Lida integralmente"),
        ("aula4 (1).pdf", "Percursos em Grafos", "15", "gr-03-bfs-dfs", "Lida integralmente"),
        ("aula5 (2).pdf", "Árvores e Árvores Geradoras", "11", "gr-05-mst", "Lida integralmente"),
        ("aula6 (2).pdf", "Circuitos em Grafos", "9", "gr-06-circuitos", "Lida integralmente"),
        ("aula8 (1).pdf", "Problemas de Caminhos e Roteamento", "12", "gr-07-caminhos", "Lida integralmente"),
        ("aula1.pdf", "Teoria da Computação e Complexidade de Algoritmos", "22", "tc-01-fundamentos", "Lida integralmente"),
        ("aula2.pdf", "Nivelamento e Fundamentos de Linguagens Formais", "29", "tc-02-linguagens", "Lida integralmente"),
        ("aula3_1.pdf", "Hierarquia de Chomsky e Autômatos Finitos", "19", "tc-03-chomsky-afd", "Lida integralmente"),
        ("aula4.pdf", "Do Não-Determinismo à Memória Estruturada", "15", "tc-04-afn-pda", "Lida integralmente"),
        ("aula5.pdf", "Computabilidade e a Máquina de Turing", "20", "tc-05-computabilidade", "Lida integralmente"),
        ("aula6.pdf", "A Máquina de Turing", "19", "tc-06-turing", "Lida integralmente"),
        ("aula7.pdf", "Computabilidade e Complexidade", "14", "tc-07-complexidade", "Lida integralmente"),
    ]
    rows = "".join(f'<tr><td><code>{esc(f)}</code><br><small>{esc(t)}</small></td><td>{p}</td><td><a href="../aulas/{slug}/">Abrir aula</a></td><td><span class="badge badge--ok">{esc(st)}</span></td></tr>'
                   for f, t, p, slug, st in docs)
    # matriz de cobertura
    rows_m = []
    seen = {}
    for L in b.LESSONS:
        for name, pages, kind in L["topics"]:
            key = re.sub(r"[^a-z0-9]", "", name.lower())[:40]
            seen[key] = seen.get(key, 0) + 1
    for L in b.LESSONS:
        r = b.ROUTINE_BY_ID.get(L["routine"], {})
        for name, pages, kind in L["topics"]:
            key = re.sub(r"[^a-z0-9]", "", name.lower())[:40]
            rep = seen.get(key, 1) > 1
            ex = ", ".join(x.upper() for x in b.EX_BY_LESSON.get(L["slug"], [])) or "—"
            rows_m.append(f"""<tr data-track="{L['track']}" data-kind="{kind}">
<td>{esc(b.TRACKS[L['track']]['label'])}</td>
<td>{esc(name)} {'<span class="badge badge--ghost" title="Tópico repetido em mais de uma aula">repete</span>' if rep else ''}</td>
<td><code>{esc(L['pdf'].split('—')[0].strip())}</code><br><small>{esc(pages)}</small></td>
<td><a href="../aulas/{L['slug']}/">Aula {L['num']:02d}</a></td>
<td>{ev(kind)}</td>
<td>{('<a href="../rotinas/' + r['id'] + '/">' + esc(r['title']) + '</a>') if r else '—'}</td>
<td>{esc(ex)}</td></tr>""")
    # documentos do projeto
    proj = [
        ("Banner_TG_90x120.pdf", "Identidade visual, problema, solução, objetivos e créditos da equipe.", "Usado na direção de arte e nos créditos; cita OCR/foto não comprovado no código."),
        ("Apresentacao_Projeto_Integrador (1).pptx", "Apresentação editável, 10 slides.", "Escopo, tecnologias e módulos; inclui tela de login não presente no snapshot."),
        ("Apresentacao_Projeto_Integrador.pptx.pdf", "Versão PDF da apresentação.", "Conferência de escopo e narrativa."),
        ("Documento_ADC2_Integrada_Projeto_Integrador.docx.pdf", "Análise de engenharia e integração curricular.", "Base para a separação entre confirmado, modelo e proposta; desatualizado sobre Dictionary."),
        ("Blue and Grey Modern Geometric Simple Minimalist Pitch Deck Presentation.pdf", "Segunda apresentação, com problema, escopo e organização.", "Contexto de equipe e referências (SophiA, Pergamum)."),
        ("atividade integração das aulas do leonardo com o pi.pdf", "Enunciado da ADC2 (4 páginas, digitalizado).", "Define o site estático, os 80%/20% e as três frentes de integração."),
        ("atividades de estrutura de dados.pdf", "Índice do AVA (4 páginas, digitalizado).", "Títulos das atividades; enunciados completos ausentes — exercícios autorais."),
    ]
    rows_p = "".join(f"<tr><td><code>{esc(f)}</code></td><td>{esc(t)}</td><td>{esc(u)}</td></tr>" for f, t, u in proj)

    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Fontes</span></nav>
    <div class="eyebrow">Rastreabilidade</div>
    <h1>Fontes e matriz de cobertura</h1>
    <p class="page-head__lead">Toda afirmação do site tem origem: um PDF com página, um arquivo de código com linha, ou uma marca explícita de modelo didático. Esta página é o mapa entre fonte, assunto, rota, interação e exercício.</p>
  </div>
</div>
<div class="wrap section--tight">
  <div class="grid grid--3" style="margin-bottom:2rem">
    <div class="card"><div class="card__kicker">Aulas</div><div class="stat"><b>20</b><span>PDFs inventariados</span></div><p style="margin-top:.6rem;font-size:.85rem">Dois arquivos com números repetidos foram identificados pelo título interno.</p></div>
    <div class="card"><div class="card__kicker">Atividades</div><div class="stat"><b>2</b><span>PDFs do AVA</span></div><p style="margin-top:.6rem;font-size:.85rem">Digitalizados como imagem; lidos por renderização de página.</p></div>
    <div class="card"><div class="card__kicker">Código</div><div class="stat"><b>3</b><span>revisões comparadas</span></div><p style="margin-top:.6rem;font-size:.85rem">Protótipo 66fd8fb, .NET 8 7427270 e o anexo PI.rar.</p></div>
  </div>

  <h2>Apresentações de aula</h2>
  <div class="table-wrap"><table class="compact"><thead><tr><th>Arquivo · título interno</th><th>Páginas</th><th>Rota</th><th>Estado</th></tr></thead><tbody>{rows}</tbody></table></div>

  <h2>Documentos do projeto</h2>
  <div class="table-wrap"><table class="compact"><thead><tr><th>Arquivo</th><th>Conteúdo</th><th>Uso neste site</th></tr></thead><tbody>{rows_p}</tbody></table></div>

  <h2>Código e revisões</h2>
  <div class="table-wrap"><table class="compact"><thead><tr><th>Revisão</th><th>Evidência usada</th><th>Ressalva</th></tr></thead><tbody>
  <tr><td><code>PI.rar/design teste/</code></td><td>WinForms .NET 8, MySQL, devolução transacional, histórico, <code>Dictionary</code> em Form4, 30 gavetas</td><td>Revisão principal deste site</td></tr>
  <tr><td><code>GitHub 66fd8fb/bibliotecatg/</code></td><td>Protótipo .NET Framework, login, gerador LIV1000–LIV9998, gravação em dois comandos</td><td>Usado para comparação histórica</td></tr>
  <tr><td><code>GitHub 7427270</code></td><td>Versão .NET 8 anterior ao anexo</td><td>Referência de evolução; não copiada para o pacote</td></tr>
  <tr><td><code>main a3dffaf</code></td><td>Documentação e dois ZIPs de release inválidos</td><td>Não contém o código executável</td></tr>
  </tbody></table></div>

  <div class="callout callout--amber" style="margin-top:1.4rem">
    <div class="callout__title">Fonte indisponível</div>
    <p>O quadro <strong>Notion — PI · Controle de tarefas</strong> exige sessão autenticada e não foi acessado. O contexto usado vem da síntese do índice do pacote: validação, campos obrigatórios, testes de empréstimo/devolução, DER, usabilidade, acessibilidade e preparação para a banca. Um cartão do quadro comprova que a tarefa foi registrada, não que a funcionalidade existe no código.</p>
  </div>

  <h2 id="matriz">Matriz de cobertura</h2>
  <p class="muted" style="font-size:.9rem">Cada linha liga um subtópico do material a uma página, uma rota do site, o tipo de vínculo com o PI e um exercício. “Repete” indica tópico presente em mais de uma apresentação.</p>
  <div class="pill-list" style="margin:1rem 0" role="group" aria-label="Filtrar matriz">
    <button class="chip" data-mfilter="all" aria-pressed="true">Tudo</button>
    <button class="chip" data-mfilter="ed" aria-pressed="false">ED</button>
    <button class="chip" data-mfilter="grafos" aria-pressed="false">Grafos</button>
    <button class="chip" data-mfilter="tc" aria-pressed="false">TC</button>
    <button class="chip" data-mfilter="code" aria-pressed="false">Confirmado no código</button>
    <button class="chip" data-mfilter="ementa" aria-pressed="false">Ementa</button>
  </div>
  <div class="table-wrap" style="max-height:70vh;overflow:auto"><table class="compact" id="coverage-table"><thead><tr><th>Trilha</th><th>Tema e subtópico</th><th>Fonte · páginas</th><th>Rota</th><th>Vínculo</th><th>Interação</th><th>Exercício</th></tr></thead><tbody>{''.join(rows_m)}</tbody></table></div>
  <p style="font-size:.8rem;color:var(--ink-3);margin-top:.6rem">{len(rows_m)} linhas de cobertura. Tópicos citados apenas na ementa recebem estudo introdutório e estão marcados como tal.</p>

  <h2>Divergências documentais que você deve saber explicar</h2>
  <div class="grid grid--2">
    <div class="card"><div class="card__kicker">Login</div><h3>Slides × código</h3><p>A apresentação mostra o módulo e telas de login. O <code>Program.cs</code> do pacote abre <code>FormDashboard</code> direto e o dump não tem tabela de usuários. Diga: previsto, não comprovado nesta revisão.</p></div>
    <div class="card"><div class="card__kicker">OCR</div><h3>Banner × código</h3><p>O banner cita cadastro por foto com IA/OCR. O código analisado trata upload de imagem da capa, não leitura automática de registros. Foto e OCR são operações distintas.</p></div>
    <div class="card"><div class="card__kicker">Dictionary</div><h3>ADC2 × Form4</h3><p>O documento ADC2 afirma que não há <code>Dictionary</code>. O <code>Form4.cs</code>, linha 43, usa <code>Dictionary&lt;string, Image&gt;</code> como cache de fotos. A evidência mais recente vence.</p></div>
    <div class="card"><div class="card__kicker">Ordenação</div><h3>SQL × algoritmo próprio</h3><p>O histórico ordena com <code>ORDER BY d.data_devolucao DESC, d.id DESC</code>. O site usa Insertion/Selection apenas como laboratório didático — não como código do projeto.</p></div>
    <div class="card"><div class="card__kicker">Integridade</div><h3>FKs e tipos</h3><p><code>devolucoes.id_emprestimo</code> não tem FK para <code>emprestimos</code>; <code>id_atirador</code> é <code>int</code> enquanto <code>atiradores.numero</code> é <code>varchar</code>. Há <code>UNIQUE</code> em <code>id_emprestimo</code>, que bloqueia duplicidade.</p></div>
    <div class="card"><div class="card__kicker">Gerador</div><h3>Dois intervalos</h3><p>Protótipo: <code>Next(1000, 9999)</code> com consulta por tentativa. Pacote: <code>Next(100, 999)</code>, único sorteio, limite superior exclusivo. Nenhum garante unicidade sozinho.</p></div>
  </div>

  <div class="callout" style="margin-top:1.6rem">
    <div class="callout__title">Como a matriz foi construída</div>
    <p>Os intervalos de página vêm do índice do pacote e foram conferidos no texto extraído dos PDFs. Quando um tópico aparece só na ementa (Norma, Post, Kleene, PCP, Edmonds, AVL), o site oferece estudo introdutório rotulado — não finge que houve aula desenvolvida. Exercícios do AVA são autorais porque os enunciados não estavam no PDF.</p>
  </div>
</div>"""
    return b.shell("fontes/index.html", "Fontes e cobertura", body, active="fontes",
                   desc="Inventário das fontes, matriz de cobertura por página e rota, e divergências documentais do Projeto Integrador.",
                   scripts='<script src="../assets/js/fontes.js" defer></script>')


# ------------------------------------------------------------------ glossário
def glossario_page():
    b = _b()
    data = b.load_json("glossario.json", {"terms": []})
    terms = data.get("terms", [])
    groups = [("todas", "Todas"), ("estruturas", "Estruturas"), ("complexidade", "Complexidade"),
              ("grafos", "Grafos"), ("automatos", "Autômatos"), ("pi", "No PI")]
    chips = "".join(f'<button class="chip" data-gfilter="{g}" aria-pressed="{"true" if g == "todas" else "false"}">{esc(l)}</button>' for g, l in groups)
    items = []
    for t in sorted(terms, key=lambda x: x["term"].lower()):
        syn = ", ".join(t.get("syn", []))
        items.append(f"""<div class="gloss-item" id="{b.slugify(t['term'])}" data-group="{t.get('group','')}">
  <h3>{esc(t['term'])} <span class="muted" style="font-weight:400;font-size:.85rem">{esc(t.get('full',''))}</span></h3>
  <p>{t['def']}</p>
  <div class="gloss-meta"><a href="../aulas/{t.get('lesson','')}/">Ver aula</a>{(' · <span class="muted">também: ' + esc(syn) + '</span>') if syn else ''}</div>
</div>""")
    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Glossário</span></nav>
    <div class="eyebrow">Léxico do semestre</div>
    <h1>Glossário</h1>
    <p class="page-head__lead">{len(terms)} verbetes curtos, com sinônimos para busca e link para a aula onde o conceito é desenvolvido. Quando o termo aparece no PI, a definição diz exatamente onde.</p>
  </div>
</div>
<div class="wrap section--tight">
  <div class="pill-list" style="margin-bottom:1.4rem" role="group" aria-label="Filtrar glossário">{chips}</div>
  <div class="gloss-list">{''.join(items)}</div>
</div>"""
    return b.shell("glossario/index.html", "Glossário", body, active="fontes",
                   desc="Glossário de estruturas de dados, grafos, autômatos e complexidade com links para as aulas.",
                   scripts='<script src="../assets/js/glossario.js" defer></script>')


# ------------------------------------------------------------------ sobre
def sobre_page(docs):
    b = _b()
    doc = docs.get("sobre", {"meta": {}, "body": ""})
    body_md = b.render_code(doc["body"])
    body = f"""
<div class="page-head">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Você está aqui"><a href="../">Início</a><span>/</span><span>Como usar</span></nav>
    <div class="eyebrow">Guia do site</div>
    <h1>Como usar, o que é real e o que é modelo</h1>
    <p class="page-head__lead">Este site é documento técnico e material de estudo. Ele funciona direto no navegador, sem cadastro e sem banco de dados. Aqui estão os atalhos, as escolhas de acessibilidade e os limites do que ele afirma.</p>
  </div>
</div>
<div class="wrap"><div class="layout"><article class="prose">{body_md}</article>
<aside class="toc"><div class="toc__box"><div class="toc__title">Atalhos</div>
<dl class="kv"><dt>Buscar</dt><dd><kbd>/</kbd></dd><dt>Fechar busca</dt><dd><kbd>Esc</kbd></dd>
<dt>Simulador: avançar</dt><dd><kbd>→</kbd></dd><dt>Voltar</dt><dd><kbd>←</kbd></dd>
<dt>Executar/pausar</dt><dd><kbd>Espaço</kbd></dd><dt>Reiniciar</dt><dd><kbd>R</kbd></dd>
<dt>Defesa: passos</dt><dd><kbd>←</kbd> <kbd>→</kbd></dd><dt>Defesa: tempo</dt><dd><kbd>P</kbd></dd></dl></div>
<div class="toc__box"><div class="toc__title">Preferências</div><p style="font-size:.8rem;margin:0">Movimento e progresso ficam salvos neste navegador. O botão de ondas no cabeçalho alterna movimento completo/reduzido; o de alto-falante lê a página.</p></div>
</aside></div></div>"""
    return b.shell("sobre/index.html", "Como usar", body, active="", desc="Guia do site, atalhos, acessibilidade, limites e créditos.",
                   scripts='<script src="../assets/js/sobre.js" defer></script>')
