---
slug: gr-06-circuitos
title: "Circuitos, Euler e Hamilton"
summary: "Percorrer arestas ou vértices muda a classe do problema: Euler se decide pela paridade dos graus, Hamilton é NP-completo e o TSP cobra o preço em fatorial."
pages: "pp. 2–9"
pdf: "aula6 (2).pdf — Circuitos em Grafos"
objectives:
  - "Distinguir trilha, caminho, circuito e ciclo."
  - "Aplicar a condição de paridade e conectividade de Euler."
  - "Explicar por que a decisão hamiltoniana é NP-completa."
  - "Estimar o número de rotas do TSP e comparar heurística com ótimo."
evidence:
  - kind: model
    source: "rotinas/roteiro · Roteiro de inventário"
    text: "O simulador monta um circuito pelas gavetas, verifica o certificado e compara com a heurística do vizinho mais próximo."
  - kind: code
    source: "Form3.Designer.cs · BtnPlanilhaEstoque_Click (linhas 467–552)"
    text: "O relatório de estoque lista as gavetas em ordem de código; não calcula rota nem custo de deslocamento."
  - kind: model
    source: "aula6 (2).pdf pp. 4–6"
    text: "Königsberg: quatro porções de terra, sete pontes e graus ímpares que tornam o passeio impossível."
  - kind: future
    source: "aula6 (2).pdf pp. 7–9"
    text: "Não há solver de TSP nem heurística implementada; o roteiro é proposta didática."
quiz:
  - q: "Um grafo conexo tem todos os vértices de grau par. O que existe?"
    options: ["Circuito euleriano", "Caminho euleriano sem circuito", "Circuito hamiltoniano", "Nada se pode afirmar"]
    answer: 0
    explain: "Paridade par em todos os vértices, com conectividade, garante circuito euleriano."
  - q: "Quantos vértices de grau ímpar um caminho euleriano admite?"
    options: ["Nenhum", "Exatamente dois", "Um número par qualquer", "Todos"]
    answer: 1
    explain: "A origem e o destino ficam com grau ímpar; os demais precisam ser pares."
  - q: "O problema de decisão hamiltoniano é..."
    options: ["resolvido pela paridade dos graus", "NP-completo", "linear no número de arestas", "impossível de definir"]
    answer: 1
    explain: "Não há critério simples de paridade; testar rotas é exponencial no pior caso."
---

Toda biblioteca tem um roteiro: sair do balcão, conferir gaveta por gaveta, voltar. A pergunta de engenharia é se esse roteiro pode ser feito sem repetir caminho e com o menor custo. A aula 6 separa duas perguntas que parecem iguais e não são: percorrer todas as ligações ou percorrer todos os pontos.

## Circuito e retorno à origem; trilha/circuito euleriano

Um percurso fechado começa e termina no mesmo vértice. Quando ele usa cada aresta exatamente uma vez, é euleriano: circuito se volta à origem, caminho se termina em outro vértice. A ênfase está nas arestas, não nos vértices: pode-se passar várias vezes pelo mesmo ponto, desde que nenhuma ligação seja repetida.

Exemplo com dois triângulos que compartilham A: A–B, B–C, C–A, A–D, D–E, E–A. Os graus são 4 para A e 2 para os demais, todos pares, e o circuito A–B–C–A–D–E–A percorre as seis arestas uma vez. Esse é o formato de inspeção de cabos e de varredura de corredores.

## Sete Pontes de Königsberg, paridade e conectividade

Em 1736, Euler mostrou que o passeio pelas sete pontes de Königsberg era impossível. As quatro porções de terra viraram vértices e as pontes, arestas, com graus 3, 3, 3 e 5. A regra que ele extraiu dispensa testar rotas: para circuito euleriano, todos os vértices de grau positivo precisam ser pares; para caminho euleriano, exatamente dois ímpares.

Há uma segunda condição, frequentemente esquecida: os vértices de grau positivo devem estar no mesmo componente. Um grafo com dois blocos isolados pode ter todos os graus pares e ainda assim não ter circuito euleriano. Paridade e conectividade juntas formam o critério, e o teste custa O(V + E), apenas uma passagem de contagem.

## Caminho/circuito hamiltoniano e decisão NP-completa

O percurso hamiltoniano visita todos os vértices exatamente uma vez, e o circuito retorna à origem. Agora o foco são os pontos: sobrar arestas não importa, desde que todo ponto seja visitado. É o roteiro de conferência em que cada gaveta precisa ser aberta uma única vez.

O contraste com Euler é brutal. No grafo dos dois triângulos, o circuito euleriano existe, mas não existe circuito hamiltoniano: A é ponto de corte, e qualquer volta que passe por B, C, D e E precisa atravessar A duas vezes. Não há fórmula de paridade que decida o caso geral; a decisão é NP-completa, e a única certeza vem de testar rotas, com custo exponencial.

## TSP ponderado e explosão combinatória da força bruta

Com pesos, o circuito hamiltoniano vira o problema do caixeiro viajante: visitar todos os pontos uma vez e voltar, com custo total mínimo. A força bruta testa todas as ordens. Com origem fixa e n pontos, são (n − 1)! sequências; em caso simétrico, ida e volta se confundem e sobram (n − 1)!/2.

Para cinco pontos, 24 sequências e 12 rotas distintas. Para dez, 362.880 sequências. Para vinte, cerca de 1,21 × 10^17, inviável por enumeração. Por isso a prática usa heurística, como o vizinho mais próximo, que decide rápido e não garante o ótimo. Aplicações vão de furadeira CNC a roteamento de frota.

| Pontos | Sequências (n − 1)! | Rotas distintas, caso simétrico |
| --- | --- | --- |
| 5 | 24 | 12 |
| 10 | 362.880 | 181.440 |
| 20 | 1,21 × 10^17 | 6,08 × 10^16 |

## No Projeto Integrador

O roteiro de inventário é modelo didático, não funcionalidade. O sistema exporta o relatório de estoque em `Form3.Designer.cs` (linhas 467–552) listando código, título, autores, disponibilidade e gaveta em ordem de código — uma listagem, não uma rota. A rotina Roteiro de inventário usa as trinta gavetas como vértices e permite montar circuito, conferir o certificado e comparar com o vizinho mais próximo.

A distinção entre Euler e Hamilton tem uso didático claro no acervo. Se o objetivo é inspecionar cada corredor entre gavetas, o problema é euleriano e se resolve pela paridade. Se o objetivo é abrir cada gaveta uma vez, o problema é hamiltoniano e não tem atalho. Verificar uma rota proposta é barato, O(n); encontrar a melhor é caro. Essa assimetria entre certificar e decidir é o argumento central da defesa.

## Teste de mesa

Cinco gavetas com distâncias de corredor: A–B 3, A–C 3, A–D 7, A–E 2, B–C 4, B–D 4, B–E 1, C–D 4, C–E 3, D–E 5.

| Rota | Conta | Custo |
| --- | --- | --- |
| A–B–C–E–D–A | 3 + 4 + 3 + 5 + 7 | 22 |
| A–E–B–C–D–A (vizinho mais próximo) | 2 + 1 + 4 + 4 + 7 | 18 |
| A–C–D–B–E–A | 3 + 4 + 4 + 1 + 2 | 14 |

O vizinho mais próximo escolhe E (2), depois B (1), depois C (4, empate com D resolvido pelo alfabeto) e termina com a volta caríssima D–A de 7. A rota de custo 14 existe e é ótima entre as doze. Verificar 14 leva cinco somas; provar que não há rota menor exige comparar as doze.

## Pergunta de defesa

Por que o problema de Euler é fácil e o de Hamilton é difícil? Porque Euler tem certificado local: a paridade de cada grau e a conectividade decidem em uma passagem. Hamilton não tem condição equivalente conhecida; a única prova de existência é exibir a rota, e a busca cresce fatorialmente. No TSP, a situação se repete: dado um circuito, conferir o custo é O(n), mas encontrar o menor é NP-difícil. Heurísticas como o vizinho mais próximo entregam solução viável sem garantia de ótimo.

## Exercício

Com quatro gavetas e as ligações A–B 2, A–C 5, A–D 4, B–C 3, B–D 6, C–D 1, calcule o custo da rota do vizinho mais próximo partindo de A e compare com a melhor rota que você conseguir montar.

<details><summary>Ver resposta</summary>
<p>Vizinho mais próximo: de A o mais barato é B (2); de B, o mais barato entre C (3) e D (6) é C (3); de C sobra D (1); volta D–A (4). Total 2 + 3 + 1 + 4 = 10, rota A–B–C–D–A. A alternativa A–C–D–B–A custa 5 + 1 + 6 + 2 = 14; A–B–D–C–A custa 2 + 6 + 1 + 5 = 14; A–D–C–B–A custa 4 + 1 + 3 + 2 = 10. A heurística acertou o ótimo neste caso, o que não garante acerto em todos.</p>
</details>
