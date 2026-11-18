---
slug: gr-03-bfs-dfs
title: "Percursos: BFS e DFS"
summary: "Fila para alargar, pilha para aprofundar: os dois percursos visitam o mesmo grafo com estratégias opostas e o mesmo custo O(V + E)."
pages: "pp. 2–9"
pdf: "aula4 (1).pdf — Percursos em Grafos"
objectives:
  - "Explicar por que a marcação de visitados é obrigatória."
  - "Executar BFS com fila e ler os níveis produzidos."
  - "Executar DFS com pilha ou recursão e identificar o retrocesso."
  - "Justificar o custo O(V + E) em lista de adjacência."
evidence:
  - kind: code
    source: "Form2.cs · AplicarFiltroEBusca (linhas 36–115)"
    text: "A paginação com LIMIT e OFFSET percorre o conjunto em blocos sem repetir nem pular linhas; é varredura sistemática, não BFS."
  - kind: model
    source: "rotinas/grafos · Estantes conectadas"
    text: "O simulador roda BFS sobre o mapa de gavetas e mostra a fronteira crescendo em níveis."
  - kind: future
    source: "aula4 (1).pdf pp. 6–8"
    text: "Uma DFS sobre empréstimo, devolução e histórico permitiria rastrear dependências; o sistema só consulta por junção."
quiz:
  - q: "Qual estrutura de dados caracteriza a BFS?"
    options: ["Pilha, LIFO", "Fila, FIFO", "Heap mínimo", "Árvore binária"]
    answer: 1
    explain: "A BFS retira sempre o vértice enfileirado há mais tempo, o que produz a expansão em níveis."
  - q: "Em grafo sem pesos, a BFS garante..."
    options: ["o caminho de menor soma de pesos", "o caminho com menos arestas", "a maior distância", "todos os caminhos"]
    answer: 1
    explain: "Sem pesos, menos arestas é o critério; com pesos, é preciso Dijkstra."
  - q: "Por que a marcação de visitados é indispensável?"
    options: ["Para economizar memória", "Para impedir que ciclos façam o percurso repetir vértices indefinidamente", "Para ordenar os vizinhos", "Para calcular o grau"]
    answer: 1
    explain: "Sem marcação, um ciclo devolve o algoritmo ao mesmo vértice em loop."
---

Um grafo guardado em memória não responde nada sozinho: é preciso percorrê-lo. A biblioteca faz isso quando quer saber quais obras estão a duas gavetas de distância, ou quando segue a cadeia de um empréstimo até a devolução. Percurso é a regra que garante visita completa sem repetição, e as duas regras clássicas são a busca em largura e a busca em profundidade.

## Navegação sistemática e necessidade de marcação

Caminhar ao acaso em um grafo com ciclo não termina: o percurso volta ao mesmo vértice e recomeça. A solução é manter um conjunto de visitados e uma ordem explícita de exploração, de modo que cada vértice seja descoberto uma vez e cada aresta seja examinada um número limitado de vezes.

A marcação é o que separa percurso de passeio. Ela também define o que o algoritmo entrega: na BFS, a distância em número de arestas; na DFS, a ordem de descoberta e de finalização, que mais tarde sustenta detecção de ciclo e ordenação topológica.

## BFS com fila, níveis e menor número de saltos sem pesos

A busca em largura usa fila, isto é, retira sempre o vértice que entrou primeiro. O efeito é a expansão em ondas: primeiro o vértice de origem, depois todos os vizinhos a um salto, depois os de dois saltos. Por isso, em grafo sem pesos, a BFS encontra o caminho com o menor número de arestas.

Exemplo com arestas A–B, A–C, B–D, C–E, D–E, E–F. Partindo de A, a fila recebe B e C, depois D, depois E e, por fim, F, com distâncias 0, 1, 1, 2, 2 e 3. Note que D e E aparecem em ordens diferentes conforme a lista de vizinhos, mas a distância não muda. Esse é o uso típico em descoberta de rede: varrer primeiro o que está perto do administrador.

## DFS com pilha/recursão, retrocesso e dependências

A busca em profundidade usa pilha, explícita ou implícita na recursão. Ela escolhe um vizinho e avança até não poder mais; ao encontrar beco sem saída, retrocede e tenta a próxima ramificação. O caminho pode ficar longo antes de a exploração voltar.

No mesmo grafo, partindo de A e visitando vizinhos em ordem alfabética, a DFS desce A, B, D, E, C e depois F. Ao chegar em C, o vizinho A está ativo na pilha, e essa aresta de retorno prova a existência do ciclo A–B–D–E–C–A. A DFS não garante caminho mais curto: garante exploração completa e a ordem de finalização, que é a matéria-prima da análise de dependências.

## Custo com lista de adjacência O(V+E)

Com lista de adjacência, cada vértice entra e sai da estrutura uma vez, e cada aresta é examinada no máximo duas vezes no grafo não orientado. O custo é O(V + E), tanto para BFS quanto para DFS. Com matriz, o mesmo percurso custa O(V²), porque cada vértice precisa varrer a linha inteira para descobrir seus vizinhos.

| Critério | BFS | DFS |
| --- | --- | --- |
| Estrutura | fila (FIFO) | pilha (LIFO) ou recursão |
| Estratégia | alarga por níveis | aprofunda e retrocede |
| Caminho mínimo sem pesos | garante | não garante |
| Uso típico | distância, descoberta de rede | ciclo, dependências, ordenação |
| Custo em lista | O(V + E) | O(V + E) |

## No Projeto Integrador

Nenhum dos dois percursos está implementado no código revisado: a busca do acervo é SQL com `LIKE` e junção, e a listagem usa paginação com `LIMIT` e `OFFSET` em `Form2.cs` (linhas 36–115). Essa paginação é varredura sistemática — percorre o resultado em blocos sem repetir linha —, mas não é BFS, e chamá-la assim seria impreciso.

O que existe de grafo no PI é modelo didático: a rotina Estantes conectadas usa o mapa de trinta gavetas como grafo e mostra a fronteira da BFS crescendo. A DFS aparece como perspectiva: seguir empréstimo, devolução e histórico como cadeia de dependências exigiria percurso sobre registros, e o sistema hoje resolve isso com junções. A ordem de exclusão em `Form3.Designer.cs` (linhas 364–405), que apaga vínculos antes do livro, é o germe dessa ideia e será tratada como ordenação topológica na próxima aula.

## Teste de mesa

Grafo: A–B, A–C, B–D, C–E, D–E, E–F, com vizinhos em ordem alfabética.

| Passo | Fila após retirar | Visitados | Distância de A |
| --- | --- | --- | --- |
| 1 | B, C | A | 0 |
| 2 | C, D | A, B | B = 1 |
| 3 | D, E | A, B, C | C = 1 |
| 4 | E | A, B, C, D | D = 2 |
| 5 | F | A, B, C, D, E | E = 2 |
| 6 | vazia | todos | F = 3 |

Na DFS, a pilha de chamadas segue A, B, D, E, C e detecta a aresta C–A com A ativo, fechando o ciclo de comprimento 5. A ordem de finalização é C, F, E, D, B, A.

## Pergunta de defesa

Por que a BFS não serve para achar o caminho mais barato quando as arestas têm peso? Porque ela conta saltos, não soma pesos: um caminho de três arestas baratas pode custar menos que um de duas arestas caras, e a BFS não vê essa diferença. Ela resolve o caso sem pesos, que é o da distância entre gavetas. Com pesos, o problema passa para Dijkstra, na aula 7. Confundir os dois é o erro mais comum em prova.

## Exercício

Execute BFS e DFS a partir de A no grafo A–B, A–C, B–C, C–D, D–E, indicando ordem de visita, distâncias e se há ciclo. Considere vizinhos em ordem alfabética.

<details><summary>Ver resposta</summary>
<p>BFS: fila começa com A; visitam-se B e C (distância 1), depois D (2) e E (3). Ordem A, B, C, D, E. DFS: A desce para B, depois C, D e E; a aresta B–C encontra C já ativo, provando o ciclo A–B–C–A. Ordem de visita A, B, C, D, E; finalização E, D, C, B, A. O custo é O(V + E) nos dois casos, com lista de adjacência.</p>
</details>
