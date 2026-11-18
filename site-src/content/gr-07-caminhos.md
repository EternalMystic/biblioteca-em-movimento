---
slug: gr-07-caminhos
title: "Caminhos mínimos e roteamento"
summary: "Relaxar arestas até não haver melhoria: Dijkstra com heap, Bellman-Ford com V − 1 rodadas e Floyd-Warshall com matriz resolvem o mesmo problema com premissas diferentes."
pages: "pp. 2–12"
pdf: "aula8 (1).pdf — Problemas de Caminhos e Roteamento"
objectives:
  - "Escolher o peso adequado ao objetivo de engenharia."
  - "Aplicar a equação de relaxamento passo a passo."
  - "Executar Dijkstra e justificar a exigência de pesos não negativos."
  - "Usar Bellman-Ford para detectar ciclo negativo e Floyd-Warshall para todos os pares."
evidence:
  - kind: code
    source: "FormDevolucao.cs · CalcularDiasAtraso (linhas 544–547)"
    text: "O atraso é max(0, dias entre datas): custo que nunca fica negativo, análogo à premissa de Dijkstra."
  - kind: code
    source: "Form3.Designer.cs · SubqueryAtiradorAtual (linhas 32–40)"
    text: "A subconsulta escolhe o empréstimo mais recente com ORDER BY id DESC LIMIT 1; é regra de recência, não caminho de menor custo."
  - kind: model
    source: "rotinas/grafos · casos Peso negativo e Ciclo negativo"
    text: "O simulador permite editar pesos e ver Dijkstra falhar onde Bellman-Ford acerta."
  - kind: future
    source: "aula8 (1).pdf pp. 4–12"
    text: "Nenhum dos três algoritmos está implementado no PI; o roteamento é modelo didático."
quiz:
  - q: "A operação de relaxamento de (u, v) faz o quê?"
    options: ["Soma todos os pesos", "Atualiza a distância de v se chegar por u for mais barato", "Remove a aresta mais cara", "Ordena os vizinhos"]
    answer: 1
    explain: "Custo(v) = min(Custo(v), Custo(u) + Peso(u, v)); só há mudança quando o novo valor é menor."
  - q: "Por que Dijkstra falha com peso negativo?"
    options: ["Porque não aceita heap", "Porque assenta um vértice antes de considerar um desvio que o baratearia", "Porque exige matriz", "Porque não trata origem única"]
    answer: 1
    explain: "O vértice fechado não é reaberto, e o desvio negativo chega tarde."
  - q: "Floyd-Warshall executa em..."
    options: ["O(V + E)", "O(E log V)", "O(V³)", "O(V·E)"]
    answer: 2
    explain: "Três laços aninhados sobre a matriz, independentemente do número de arestas."
---

Roteamento é a pergunta que a biblioteca faz sem perceber: qual é o caminho mais curto entre o balcão e a gaveta 4C, considerando corredores e portas? Quando as ligações têm custo, contar saltos não basta. A aula 8 mostra que todos os algoritmos de caminho mínimo compartilham uma única operação e diferem apenas em quantas vezes e em que ordem a aplicam.

## Pesos e objetivos de engenharia

O peso é a tradução numérica do objetivo. Em telecomunicações, costuma ser latência em milissegundos ou número de saltos; em logística, distância ou consumo de bateria; no mercado financeiro, taxa de transação. Escolher o peso errado produz rota rápida que gasta mais, ou rota barata que atrasa a entrega.

No acervo, o peso natural é a distância percorrida entre gavetas, e o prazo padrão de empréstimo, gravado em `prazo_padrao_dias`, é outro tipo de custo: dias até o vencimento. São pesos diferentes para problemas diferentes, e misturá-los na mesma soma não produz significado.

## Relaxamento de arestas

Tudo se resume a uma comparação. Se o custo conhecido para chegar a v é maior que o custo para chegar a u somado ao peso de (u, v), então o valor de v melhora. A equação é Custo(v) = min(Custo(v), Custo(u) + Peso(u, v)), e cada melhoria é um relaxamento bem-sucedido.

O algoritmo começa com zero na origem e infinito nos demais. Relaxar uma aresta cuja origem ainda está em infinito não muda nada, o que explica por que a ordem importa. Dijkstra e Bellman-Ford usam a mesma equação; a diferença está em quantas vezes e em que sequência a aplicam.

## Dijkstra guloso; variantes vetor/min-heap; pesos não negativos

Dijkstra mantém dois conjuntos, processados e não processados, e a cada passo escolhe o não processado de menor custo, relaxa suas arestas de saída e o fecha. A garantia vale porque, sem pesos negativos, nenhum caminho futuro consegue baratear um vértice já fechado.

Exemplo: A→B 4, A→C 2, B→C 1, B→D 5, C→D 8, C→E 10, D→E 2. A ordem de fechamento é C (2), B (4), D (9) e E (11). Note que D foi relaxado para 10 por C e depois melhorado para 9 por B: é o relaxamento em ação.

| Estrutura | Seleção do mínimo | Custo total |
| --- | --- | --- |
| Vetor, varredura linear | O(V) por passo | O(V²) |
| Min-heap binário | O(log V) por extração | O((V + E) log V) |

Com peso negativo a garantia cai. No triângulo A→B 5, A→C 2, B→C −8, Dijkstra fecha C em 2 e B em 5; o desvio por B daria −3, mas C já estava fechado. O erro não é de implementação: é de premissa. Aula adentro, o exemplo com A→C 10 esconde a falha, porque B é fechado antes de C e o relaxamento acontece a tempo; trocar 10 por 2 revela o problema.

## Bellman-Ford, V − 1 rodadas e detecção de ciclo negativo

Bellman-Ford não fecha vértices: percorre todas as arestas e repete o processo V − 1 vezes. O motivo do limite é que o caminho mais longo sem ciclo tem no máximo V − 1 arestas; depois disso, nenhuma melhoria é possível se não houver ciclo negativo.

No mesmo triângulo, a primeira rodada já leva C de 2 para −3, e a segunda não muda nada, confirmando estabilidade. O custo é O(V·E), maior que Dijkstra, e essa é a troca: generalidade por tempo. Para detectar ciclo negativo, roda-se uma rodada extra; se ainda houver melhoria, existe ciclo alcançável de soma negativa, e o conceito de caminho mínimo deixa de fazer sentido.

## Origem única e todos os pares; Floyd-Warshall e matriz

Dijkstra e Bellman-Ford resolvem origem única. Quando o problema é a matriz completa de distâncias, repetir Bellman-Ford para cada origem custa O(V²·E), o que em grafo denso chega a O(V⁴). Floyd-Warshall resolve com três laços e uma matriz, em O(V³), testando se passar por um intermediário k barateia o par (i, j).

Com A–B 4, A–C 2, B–C 1, B–D 5, C–D 8, a matriz final tem A–B 3 (via C), A–D 8, C–D 6 e B–D 5. Se algum valor da diagonal ficar negativo, há ciclo negativo. O algoritmo é atraente por localidade de memória, o que favorece cache e processamento vetorial.

## No Projeto Integrador

Nenhum dos três algoritmos está no código revisado. A consulta que descobre quem está com o livro (`Form3.Designer.cs`, linhas 32–40) usa `ORDER BY e.id DESC LIMIT 1`, isto é, escolhe o empréstimo mais recente — regra de recência, não caminho de menor custo. Chamar isso de Dijkstra seria erro de leitura.

O vínculo conceitual confirmado é o custo truncado em zero: `CalcularDiasAtraso` devolve `Math.Max(0, dias)` (FormDevolucao.cs, linhas 544–547), o mesmo tipo de garantia de não negatividade que sustenta a premissa de Dijkstra. O resto é modelo didático: a rotina Estantes conectadas permite editar pesos, criar peso zero, peso negativo e ciclo negativo, e comparar os três algoritmos.

## Teste de mesa

Dijkstra a partir de A, com A→B 4, A→C 2, B→C 1, B→D 5, C→D 8, C→E 10, D→E 2.

| Fechado | Custo | B | C | D | E |
| --- | --- | --- | --- | --- | --- |
| A | 0 | 4 | 2 | ∞ | ∞ |
| C | 2 | 4 | 2 | 10 | 12 |
| B | 4 | 4 | 2 | 9 | 12 |
| D | 9 | 4 | 2 | 9 | 11 |
| E | 11 | 4 | 2 | 9 | 11 |

O caminho até E é A–B–D–E, com 4 + 5 + 2 = 11. Bellman-Ford, no triângulo negativo, gasta duas rodadas e chega a C = −3; Floyd-Warshall preenche a matriz em 4³ = 64 comparações.

## Pergunta de defesa

Quando usar Dijkstra e quando usar Bellman-Ford? Dijkstra quando todos os pesos são não negativos, porque é mais rápido: O((V + E) log V) com heap contra O(V·E) de Bellman-Ford. Bellman-Ford quando há peso negativo ou quando é preciso detectar ciclo negativo, já que Dijkstra não tem mecanismo para reabrir vértice fechado. Se o problema pede todos os pares e o grafo é denso, Floyd-Warshall substitui as duas com O(V³). A escolha é de premissa e de tamanho, não de gosto.

## Exercício

Com A→B 2, A→C 7, B→C 3, B→D 5, C→D 1, calcule as distâncias mínimas de A a todos os vértices por Dijkstra e diga qual aresta poderia ser negativa sem quebrar o algoritmo.

<details><summary>Ver resposta</summary>
<p>Dijkstra: fecha A (0); relaxa B para 2 e C para 7. Fecha B (2); C melhora para 5 e D para 7. Fecha C (5); D melhora para 6. Fecha D (6). Distâncias: A 0, B 2, C 5, D 6. Nenhuma aresta de saída de A poderia ser negativa sem risco: qualquer peso negativo viola a premissa e pode exigir reabrir vértice já fechado. Para peso negativo, o correto é Bellman-Ford.</p>
</details>
