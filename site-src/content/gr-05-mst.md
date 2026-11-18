---
slug: gr-05-mst
title: "Árvores geradoras e MST"
summary: "Conectar tudo gastando o mínimo: Kruskal ordena arestas e usa Union-Find; Prim cresce pela fronteira com min-heap; os dois chegam ao mesmo custo."
pages: "pp. 2–11"
pdf: "aula5 (2).pdf — Árvores e Árvores Geradoras"
objectives:
  - "Reconhecer árvore por conexidade, aciclicidade e V − 1 arestas."
  - "Diferenciar árvore geradora de árvore geradora mínima."
  - "Executar Kruskal com Union-Find e justificar O(E log E)."
  - "Executar Prim com min-heap e comparar com a versão O(V²)."
evidence:
  - kind: model
    source: "aula5 (2).pdf pp. 2–9"
    text: "Ligar as trinta gavetas do mapa com o menor total de metros é o modelo didático usado no site para MST."
  - kind: code
    source: "regitro_livros.cs · cbGaveta (linhas 341–346)"
    text: "As trinta posições 1A a 6E definem os vértices do mapa; a distância entre gavetas vizinhas é didática, não medida pelo sistema."
  - kind: code
    source: "Form1.cs · contagens do painel (linhas 575–590)"
    text: "Três consultas COUNT alimentam os cards do painel; nenhuma delas calcula árvore ou custo de conexão."
  - kind: future
    source: "aula5 (2).pdf pp. 4–5"
    text: "Arborescência mínima em dígrafo exigiria o algoritmo de Edmonds; o PI não trata grafo orientado com peso."
quiz:
  - q: "Uma árvore com 8 vértices tem quantas arestas?"
    options: ["8", "7", "9", "Depende dos pesos"]
    answer: 1
    explain: "Toda árvore com V vértices tem exatamente V − 1 arestas."
  - q: "O que Kruskal faz quando a aresta mais barata fecha ciclo?"
    options: ["Descarta e segue para a próxima", "Recomeça o algoritmo", "Aceita e remove outra", "Para"]
    answer: 0
    explain: "O Union-Find detecta que as pontas já estão no mesmo conjunto, e a aresta é ignorada."
  - q: "Qual estrutura acelera a consulta 'vértice mais barato na fronteira' em Prim?"
    options: ["Fila FIFO", "Pilha", "Min-heap", "Tabela hash"]
    answer: 2
    explain: "O heap mantém o menor peso na raiz, com extração em O(log V)."
---

Uma biblioteca cresce por partes: chegam gavetas novas, muda a sala, aparece um anexo. Cedo ou tarde alguém pergunta como ligar todos os pontos gastando o mínimo de cabo, de piso ou de tempo de deslocamento. Essa pergunta é a árvore geradora mínima, e ela aparece na aula 5 com dois algoritmos que chegam ao mesmo resultado por caminhos opostos.

## Árvore conexa/acíclica, caminho único e V − 1 arestas

Uma árvore é um grafo conexo e sem ciclos. A consequência é forte: existe exatamente um caminho entre qualquer par de vértices. Se houvesse dois, haveria ciclo; se não houvesse nenhum, o grafo não seria conexo.

A regra estrutural acompanha: uma árvore com V vértices tem V − 1 arestas. Qualquer aresta extra cria ciclo, e qualquer aresta removida desconecta. Com cinco gavetas ligadas em cadeia, são quatro trechos; acrescentar um quinto trecho fecha um anel e deixa de ser árvore.

## Árvore geradora e STP; MST em grafo conexo ponderado

Uma árvore geradora de G é um subgrafo que mantém todos os vértices e apenas as arestas necessárias para conectá-los. Se G é conexo, sempre existe pelo menos uma. O protocolo STP, em switches, é a versão prática disso: desliga portas lógicas para eliminar laços físicos e evitar tempestade de broadcast.

Quando as arestas têm peso, a pergunta muda de "existe árvore" para "qual é a mais barata". A árvore geradora mínima é a de menor soma de pesos. Dois detalhes importantes: pesos negativos não são problema aqui, ao contrário do caminho mínimo; e Prim e Kruskal só valem para grafo não orientado. Em dígrafo, o problema vira arborescência mínima e pede outro algoritmo.

## Kruskal, ordenação e Union-Find/floresta/α(V)

Kruskal olha o conjunto inteiro de arestas, ordena por peso e aceita a mais barata que não feche ciclo. No começo há várias árvores isoladas — uma floresta —, que vão se unindo até sobrar uma só. A verificação de ciclo é feita por Union-Find: cada componente tem um representante, e a aresta só entra se as pontas estiverem em componentes diferentes.

O custo vem da ordenação: O(E log E), equivalente a O(E log V) quando o grafo é simples. As operações de Union-Find custam O(E α(V)), com α crescendo tão devagar que é tratado como constante. Kruskal é a escolha natural para grafo esparso, no qual ordenar poucas arestas é barato.

## Prim com expansão pela fronteira e min-heap

Prim começa em um vértice e cresce uma única árvore. A cada passo, olha a fronteira — arestas com uma ponta dentro e outra fora — e absorve a mais barata. Nunca há floresta: há sempre uma árvore conectada se expandindo.

A estrutura que responde "qual é a aresta mais barata da fronteira" decide o custo. Com varredura linear, o custo é O(V²), aceitável em grafo denso. Com min-heap, cada extração custa O(log V) e o total fica O(E log V). Em grafo denso, E é da ordem de V², e a versão com heap perde para a varredura simples.

## Contraste de custos para esparsos/densos; campus 10 prédios

A regra prática é comparar densidade. Grafo esparso, com E próximo de V, favorece Kruskal, que ordena pouco. Grafo denso, com E próximo de V², favorece Prim com varredura, que evita heap e aproveita a matriz.

O exemplo do campus fecha a conta: dez prédios ligados em malha completa dariam 45 pares, isto é, 45 valetas. A árvore geradora usa exatamente 9 conexões, uma a menos que o número de prédios, e o algoritmo escolhe quais. A economia não é pequena: 45 contra 9 valetas muda o orçamento da obra.

## No Projeto Integrador

Não há MST no código revisado. As consultas do painel (`Form1.cs`, linhas 575–590) apenas contam livros, atiradores e empréstimos, e nenhuma calcula custo de conexão. O que existe é modelo didático: as trinta gavetas geradas em `regitro_livros.cs` (linhas 341–346) formam um mapa 6 por 5, e o site usa esse mapa para mostrar Kruskal e Prim ligando posições com o menor total de metros.

O campus de dez prédios é exemplo de ementa, não do PI. A ligação com o acervo é analógica: se a biblioteca quisesse instalar pontos de leitura em cada gaveta, a planta ideal sairia de uma árvore geradora. A arborescência mínima, citada na aula para dígrafos, é perspectiva e exigiria o algoritmo de Edmonds, ausente do projeto.

## Teste de mesa

Grafo: A–C 1, B–C 2, D–E 3, A–B 4, B–D 5, C–E 6, C–D 8.

| Ordem | Aresta | Peso | Decisão | Soma |
| --- | --- | --- | --- | --- |
| 1 | A–C | 1 | aceita | 1 |
| 2 | B–C | 2 | aceita | 3 |
| 3 | D–E | 3 | aceita | 6 |
| 4 | A–B | 4 | descarta, fecha A–C–B | 6 |
| 5 | B–D | 5 | aceita | 11 |

A MST tem quatro arestas e custo 11. Prim, partindo de A, escolhe A–C (1), depois B–C (2), depois B–D (5) e por fim D–E (3), chegando ao mesmo conjunto e ao mesmo total. A única diferença é a ordem: Prim não vê D–E antes de chegar perto de D.

## Pergunta de defesa

Por que dois algoritmos diferentes dão a mesma árvore? Porque ambos respeitam a mesma propriedade de corte: a aresta mais barata que cruza um corte qualquer pertence a alguma MST. Kruskal aplica isso às arestas em ordem global; Prim, à fronteira de um conjunto que cresce. Quando há empate, as árvores podem diferir, mas o custo total é o mesmo. O que não se pode afirmar é que a MST seja única.

## Exercício

Com quatro salas e as ligações A–B 3, A–C 1, B–C 2, B–D 4, C–D 5, determine a MST por Kruskal e por Prim a partir de A, e diga se o custo coincide.

<details><summary>Ver resposta</summary>
<p>Kruskal: ordena A–C 1, B–C 2, A–B 3, B–D 4, C–D 5. Aceita A–C, B–C e B–D, descartando A–B por fechar ciclo; custo 1 + 2 + 4 = 7. Prim a partir de A: entra A–C (1), depois B–C (2), depois B–D (4), com o mesmo total 7. A árvore é a mesma e tem V − 1 = 3 arestas.</p>
</details>
