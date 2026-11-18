---
slug: ed-06-ordenacao
title: Algoritmos de ordenação simples
summary: Troca com variável temporária, ordenação no próprio vetor e os traços de Bubble, Selection e Insertion com comparações, escritas e escolha por cenário.
pages: "pp. 2–13"
pdf: "aula6 (1).pdf — Algoritmos de Ordenação Simples"
objectives:
  - Explicar a troca in-place e por que ela exige variável temporária.
  - Traçar Bubble, Selection e Insertion contando comparações e escritas.
  - Distinguir melhor e pior caso de cada algoritmo.
  - Escolher algoritmo por custo de escrita, quase ordenação e estabilidade.
evidence:
  - kind: code
    source: "historico_devolucao.cs · consulta do histórico"
    text: "A ordenação do histórico é feita por ORDER BY d.data_devolucao DESC, d.id DESC, não por algoritmo em C#."
  - kind: code
    source: "FormDevolucao.cs · consulta de empréstimos abertos"
    text: "ORDER BY e.vencimento ASC, e.id ASC ordena no banco e usa o id como desempate estável."
  - kind: model
    source: "aula6 (1).pdf pp. 2–13"
    text: "Os traços com [5, 3, 4, 2] e a tabela de custos vêm dos slides; o PI não implementa os três algoritmos."
quiz:
  - q: "Por que a troca de dois elementos exige uma variável temporária?"
    options:
      - "Porque a primeira atribuição sobrescreveria o valor que a segunda precisa"
      - "Porque o compilador não permite atribuição entre posições do vetor"
      - "Porque a troca precisa ser feita no heap"
      - "Porque sem ela o algoritmo deixa de ser in-place"
    answer: 0
    explain: "Sem a cópia temporária, o primeiro valor se perde ao receber o segundo. Atribuição entre posições é permitida, e a troca continua no próprio vetor."
  - q: "Qual algoritmo faz no máximo n − 1 trocas, independentemente da entrada?"
    options:
      - "Selection Sort"
      - "Bubble Sort"
      - "Insertion Sort"
      - "Merge Sort"
    answer: 0
    explain: "O Selection faz uma troca por passada, no máximo n − 1. Bubble troca muitas vezes e Insertion desloca; Merge não é dos três simples."
  - q: "Em qual cenário o Insertion Sort chega perto de O(n)?"
    options:
      - "Vetor quase ordenado, com poucos elementos fora de lugar"
      - "Vetor em ordem decrescente completa"
      - "Vetor com elementos aleatórios e muitos repetidos"
      - "Vetor vazio ou com um único elemento apenas"
    answer: 0
    explain: "Com poucos deslocamentos por elemento, o laço interno quase não roda. Ordem inversa é o pior caso; aleatório fica no caso médio quadrático."
---

A biblioteca mostra o histórico de devoluções do mais recente para o mais antigo. Ninguém escreveu um algoritmo de ordenação para isso: a ordem vem do `ORDER BY` da consulta. Mesmo assim, entender Bubble, Selection e Insertion é o que permite avaliar o que o banco faz, por que ele escolhe certos planos e quando ordenar em memória seria aceitável.

## Ordenação in-place e swap

Ordenar in-place significa reorganizar os elementos dentro do próprio vetor, sem criar uma cópia completa. Isso economiza memória, mas exige trocar posições, e a troca correta usa uma variável temporária: guarda o primeiro valor, copia o segundo para a primeira posição e devolve o temporário para a segunda.

Sem o temporário, a primeira atribuição destrói o valor que a segunda precisava. É o erro clássico de quem tenta economizar uma variável e acaba com dois elementos iguais. Em C, a função `swap` recebe ponteiros justamente para alterar as posições originais.

## Bubble Sort: traço, comparações e escritas

O Bubble percorre o vetor comparando vizinhos e trocando quando estão fora de ordem. A cada passada, o maior elemento da parte não ordenada sobe até o fim. Com [5, 3, 4, 2], a primeira passada faz três comparações e três trocas, terminando em [3, 4, 2, 5].

O custo é O(n²) em comparações e em escritas, porque cada troca grava três vezes. É o algoritmo com mais escrita na memória e, por isso, quase obsoleto na indústria; sobrevive como exercício de manipulação de índices.

## Selection Sort: mínimo e troca por passada

O Selection divide o vetor em parte ordenada e parte não ordenada, varre a parte não ordenada para achar o menor e faz uma única troca, colocando-o no fim da parte ordenada. As comparações continuam O(n²), mas as trocas caem para no máximo n − 1.

Esse perfil interessa a hardware com memória Flash ou EEPROM, onde ler é barato e regravar desgasta o componente. No PI, o equivalente é evitar atualizações desnecessárias no banco: cada `UPDATE` tem custo real de I/O.

## Insertion Sort: deslocamento e quase ordenado

O Insertion simula a mão que organiza cartas: pega o elemento atual, desloca para a direita os maiores e insere a cópia na lacuna. Não há troca, há deslocamento e uma escrita final. Com [5, 3, 4, 2], o 3 desloca o 5, o 4 desloca o 5 e o 2 desloca três elementos.

No pior caso, ordem inversa, o custo é O(n²). Em vetor quase ordenado, o laço interno quase não roda e o custo se aproxima de O(n). É o quadrático de melhor desempenho na prática, e aparece dentro de bibliotecas modernas em blocos pequenos.

## Melhor/pior caso, estabilidade e escolhas de engenharia

| Algoritmo | Comparações | Escritas no pior caso | Ponto forte |
| --- | --- | --- | --- |
| Bubble | O(n²) | O(n²) | Simplicidade didática |
| Selection | O(n²) | O(n) | Minimiza gravações |
| Insertion | O(n²) | O(n²) | Rápido em quase ordenado e em blocos pequenos |

Estabilidade é manter a ordem relativa de elementos iguais. O Insertion é estável; o Selection, na implementação com troca, não é. Por isso o histórico do PI ordena por data e usa o `id` como desempate: sem critério secundário, duas devoluções do mesmo dia poderiam trocar de lugar entre execuções.

```sql
ORDER BY d.data_devolucao DESC, d.id DESC;
```

Essa linha, extraída da consulta do histórico em historico_devolucao.cs, é a versão declarativa do que os três algoritmos fazem imperativamente. O banco pode usar índice, ordenação em memória ou arquivo temporário, mas o contrato é o mesmo: primeiro a data, depois o id como desempate.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local, abre direto no painel e não tem login. Confirmado no código: não existe chamada a `Sort`, `OrderBy` ou `Array.Sort` em nenhum arquivo do projeto. Toda ordenação visível nas telas vem do `ORDER BY` das consultas.

Isso tem consequência prática. A ordem das linhas na grade de empréstimos é a ordem de inserção na `List<Item>`, que por sua vez é a ordem de leitura do `DataReader`. Se a consulta mudar, a tela muda; não há camada de ordenação no cliente.

Modelo didático: os traços com [5, 3, 4, 2], a contagem de comparações e a tabela de custos vêm dos slides. O PI não implementa Bubble, Selection nem Insertion; a comparação serve para explicar por que a ordenação foi delegada ao banco.

## Teste de mesa

Vetor inicial [5, 3, 4, 2], contando comparações e escritas de cada algoritmo.

| Algoritmo | Passadas | Comparações | Trocas/deslocamentos | Vetor final |
| --- | --- | --- | --- | --- |
| Bubble | 3 | 3 + 2 + 1 = 6 | 5 trocas (15 escritas) | [2, 3, 4, 5] |
| Selection | 3 | 3 + 2 + 1 = 6 | 1 troca (3 escritas) | [2, 3, 4, 5] |
| Insertion | 3 | 1 + 2 + 3 = 6 | 5 deslocamentos | [2, 3, 4, 5] |

Os três chegam ao mesmo resultado com o mesmo número de comparações nesse vetor pequeno. A diferença está nas escritas: o Selection grava três vezes, contra quinze do Bubble. Em memória que desgasta, essa diferença decide.

## Pergunta de defesa

**Se o banco já ordena, por que estudar Bubble, Selection e Insertion?**

Porque o `ORDER BY` não é mágica: ele escolhe entre usar índice, ordenar em memória ou criar arquivo temporário, e essa escolha depende de custo de comparação e de escrita. Entender que o Selection minimiza gravações e que o Insertion brilha em dados quase ordenados explica por que certos planos são rápidos em um caso e lentos em outro. Além disso, se o projeto precisar ordenar algo que não está no banco, como uma lista de candidatos já carregada, a decisão volta para o código. Estudar os três também fixa a noção de que n² vem de laços aninhados, base para reconhecer o mesmo padrão em qualquer linguagem.

## Exercício

Aplique o Insertion Sort em [4, 1, 3, 2] e informe o vetor após cada inserção, além do total de comparações.

<details><summary>Ver resposta</summary>

Alvo 1: compara com 4, desloca, vetor [1, 4, 3, 2], 1 comparação. Alvo 3: compara com 4, desloca; compara com 1, para, vetor [1, 3, 4, 2], 2 comparações. Alvo 2: compara com 4, 3 e 1, desloca os três, vetor [1, 2, 3, 4], 3 comparações. Total: 6 comparações e 6 deslocamentos, resultado ordenado.

</details>
