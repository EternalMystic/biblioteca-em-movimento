---
slug: gr-01-fundamentos
title: "Grafos: fundamentos e representações"
summary: "Um grafo é um par (V, E); matriz e lista de adjacência guardam o mesmo conjunto com custos diferentes, e a escolha reaparece em toda a trilha."
pages: "pp. 2–15"
pdf: "aula2 (2).pdf — Fundamentos e Representações Computacionais"
objectives:
  - "Definir grafo simples, orientado e não orientado."
  - "Aplicar o lema do aperto de mãos a uma lista de graus."
  - "Reconhecer grafo bipartido pela ausência de ciclo ímpar."
  - "Comparar matriz e lista de adjacência em espaço e tempo."
evidence:
  - kind: code
    source: "banco.sql · livro_autores (linhas 176–183)"
    text: "Chave composta (codigo_livro, id_autor) e duas chaves estrangeiras: grafo bipartido livro–autor, sem aresta duplicada."
  - kind: code
    source: "regitro_livros.cs · cbGaveta (linhas 341–346)"
    text: "Dois laços geram 1A a 6E: trinta gavetas, lidas no site como grade."
  - kind: code
    source: "Form3.Designer.cs · CarregarDadosBanco (linhas 414–429)"
    text: "LEFT JOIN com GROUP_CONCAT monta a vizinhança de cada livro por junção, sem matriz em memória."
  - kind: model
    source: "aula2 (2).pdf pp. 8–11"
    text: "As quatro matrizes de caso são desenho didático; o sistema não as constrói."
  - kind: future
    source: "aula2 (2).pdf pp. 11–15"
    text: "Recomendação e emparelhamento são ementa: não há motor de recomendação no PI."
quiz:
  - q: "Um grafo não orientado tem 5 arestas. Quanto vale a soma dos graus?"
    options: ["5", "10", "25", "Depende do número de vértices"]
    answer: 1
    explain: "O lema do aperto de mãos dá 2|E| = 10."
  - q: "Qual destes grafos de quatro vértices é bipartido?"
    options: ["Triângulo A–B–C mais aresta C–D", "Ciclo A–B–C–D–A", "A–B, B–C, C–A", "A–B, B–C, C–D, D–A, A–C"]
    answer: 1
    explain: "O ciclo de comprimento 4 é par; os outros contêm triângulo."
  - q: "Na matriz de um grafo ponderado, posição sem aresta recebe..."
    options: ["0", "infinito ou sentinela máximo", "1", "-1"]
    answer: 1
    explain: "Com 0, um trajeto inexistente entraria na soma como custo zero."
---

O acervo do Tiro de Guerra cabe em trinta gavetas, mas as perguntas da biblioteca não cabem em uma lista. Quem levou o manual de tiro? Quais obras do mesmo autor estão disponíveis? Toda pergunta trata de relação, não de item isolado. A trilha começa por como essa relação fica gravada.

## G = (V, E), vértices, arestas, grafo simples e laços

Um grafo é um par G = (V, E): V reúne os vértices e E as arestas, cada uma ligando dois vértices. No grafo simples, cada par tem no máximo uma aresta e não existe laço, a aresta que sai e volta ao mesmo vértice.

Um modelo mínimo do acervo tem os livros L1 e L2 e os autores A1 e A2. Se L1 tem A1 e A2 e L2 tem A2, as arestas são {L1, A1}, {L1, A2} e {L2, A2}; nada liga L1 a L2, porque livro não é escrito por livro.

## Orientado/não orientado, grau e lema do aperto de mãos

Em grafo não orientado a aresta é conjunto sem ordem e a conexão vale nos dois sentidos. Em dígrafo ela é par ordenado, e (u, v) diferente de (v, u) significa ida sem volta.

O grau é o número de arestas incidentes no vértice, e o lema do aperto de mãos garante que a soma dos graus é o dobro do número de arestas. Com E = {AB, AC, BC, CD}, os graus são 2, 2, 3 e 1, e a soma 8 confirma 2 × 4; soma ímpar denuncia contagem errada.

## Bipartição e ciclos ímpares

Um grafo é bipartido quando V se divide em dois conjuntos disjuntos e não vazios, com toda aresta cruzando de um lado para o outro. O critério é exato: bipartido se, e somente se, não houver ciclo ímpar.

No acervo, livros de um lado e autores do outro. O grafo de empréstimos também é bipartido, com atiradores e obras. A grade de gavetas só tem ciclos pares, logo é bipartida, mas não tem triângulo.

## Matriz e lista de adjacência; simetria, sumidouro e densidade

A matriz de adjacência é uma tabela n por n com 1 quando existe aresta; no grafo não orientado é simétrica; no dígrafo, uma linha de zeros denuncia sumidouro.

| Critério | Matriz | Lista |
| --- | --- | --- |
| Espaço | O(V²) | O(V + E) |
| Testar aresta | O(1) | O(grau de u) |
| Listar vizinhos | O(V) | O(grau de u) |
| 1.000 vértices, 2.000 arestas | 1.000.000 de células | 4.000 registros |


## Casos: não orientado, orientado, ponderado e bipartido

As quatro matrizes da aula usam os mesmos vértices. No caso não orientado, simetria e diagonal zero; no orientado, linha é origem e coluna é destino, e vértice sem saída produz linha nula; no ponderado, ausência recebe infinito, nunca zero.

No bipartido, usa-se matriz retangular de biadjacência: a junção livro–autor do PI é exatamente isso, esparsa, com autores nas colunas de cada livro. O banco guarda só as posições com 1.

## OSPF, rede social, processo–núcleo e recomendação

Roteadores OSPF formam malha com triângulos, e o triângulo é o que impede tratar a rede como bipartida. Redes sociais têm ciclos arbitrários porque as entidades são da mesma natureza. No escalonamento, processos e núcleos formam grafo bipartido; na recomendação, clientes e produtos ficam em lados opostos.

## No Projeto Integrador

O vínculo confirmado no código é `livro_autores`, com chave composta por `codigo_livro` e `id_autor` e duas chaves estrangeiras com `ON DELETE CASCADE` (banco.sql, linhas 176–183): grafo bipartido livro–autor, sem aresta duplicada. A consulta do acervo monta a vizinhança com `LEFT JOIN` e `GROUP_CONCAT` (Form3.Designer.cs, linhas 414–429), então a lista de adjacência existe na consulta, não em memória.

Modelo didático é o gaveteiro de trinta posições (`regitro_livros.cs`, linhas 341–346), lido no site como grade; o sistema guarda a gaveta como texto e não conhece vizinhança. A ementa aparece na recomendação e no emparelhamento, que o PI não implementa.

## Teste de mesa

Grafo da aula: V = {A, B, C, D}, E = {AB, AC, BC, CD}.

| | A | B | C | D | grau |
| --- | --- | --- | --- | --- | --- |
| A | 0 | 1 | 1 | 0 | 2 |
| B | 1 | 0 | 1 | 0 | 2 |
| C | 1 | 1 | 0 | 1 | 3 |
| D | 0 | 0 | 1 | 0 | 1 |

A soma 2 + 2 + 3 + 1 = 8 confirma 2 × 4 arestas; não há linha nula, logo não há sumidouro. A lista fica A: B, C; B: A, C; C: A, B, D; D: C, com oito registros contra dezesseis células. Densidade 4/6 = 0,67, e o triângulo A–B–C impede a bipartição.

## Pergunta de defesa

Por que não manter uma matriz de adjacência no lugar das consultas? Porque o grafo é esparso e a matriz gastaria O(V²) para guardar quase só zeros. As perguntas chegam como SQL com junção e devolvem a vizinhança pedida. A matriz só entra quando o algoritmo exige acesso O(1) a qualquer par, como em Floyd–Warshall, e aí é construída para o cálculo.

## Exercício

Com V = {1, 2, 3, 4, 5} e as arestas 1–2, 2–3, 3–4, 4–5, 5–1 e 2–5, calcule os graus, confira o lema, informe a densidade e diga se o grafo é bipartido.

<details><summary>Ver resposta</summary>
<p>Graus: 1 tem 2, 2 tem 3, 3 tem 2, 4 tem 2 e 5 tem 3. A soma 12 é 2 × 6, então o lema se confirma; a densidade é 6/10 = 0,6. Não é bipartido: 1, 2 e 5 formam o triângulo 1–2–5–1.</p>
</details>
