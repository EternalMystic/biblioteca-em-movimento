# Biblioteca em Movimento

Site de estudo do Projeto Integrador **Biblioteca do Tiro de Guerra de Americana** (UNISAL, Engenharia da Computação, 2026), integrando Estruturas de Dados, Grafos e Teoria da Computação.

Site no ar: https://eternalmystic.github.io/biblioteca-em-movimento/

## Conteúdo

- 23 aulas em três trilhas (9 de Estruturas de Dados, 7 de Grafos, 7 de Teoria da Computação), cada uma com a fonte (PDF e página).
- 12 rotinas interativas e 3 laboratórios de apoio (15 simuladores).
- Jornada do PI com o mesmo livro `LIV123` em três vistas.
- Exercícios com solução comentada, 76 questões de revisão e caderno de erros.
- Glossário e matriz de cobertura.
- Modo defesa com roteiro cronometrado, perguntas de banca e checklist.

## Estrutura

```
public/      site pronto (é o que vai para o ar)
site-src/    gerador: conteúdo em Markdown, dados, CSS e JavaScript
tests/       testes de navegador (Playwright)
```

## Editar e gerar

Requer Python 3 com `pyyaml`, `markdown` e `pygments`.

```bash
cd site-src
python build.py          # grava o site em ../public
```

O endereço público usado no sitemap e nos links canônicos vem da variável `SITE_URL`
(padrão: `https://eternalmystic.github.io/biblioteca-em-movimento/`).

## Ver localmente

```bash
python -m http.server 8080 -d public
# abrir http://localhost:8080
```

## Testes

```bash
pip install playwright && python -m playwright install chromium
python -m http.server 8080 -d public &
python tests/test_ui.py
python tests/test_funcional.py http://localhost:8080
```

## Publicação

Cada push na branch `main` publica a pasta `public/` no GitHub Pages pelo workflow em `.github/workflows/pages.yml`.

## Dados e créditos

Livros, autores e empréstimos dos exemplos são fictícios. O progresso do estudante fica apenas no navegador (localStorage).
Fontes tipográficas Instrument Sans, Source Sans 3 e IBM Plex Mono servidas localmente sob a SIL Open Font License.
Material acadêmico, sem fins comerciais.
