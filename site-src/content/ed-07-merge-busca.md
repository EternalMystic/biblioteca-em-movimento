---
slug: ed-07-merge-busca
title: Merge Sort e busca binária
summary: Divisão e conquista aplicada à ordenação, a árvore de recursão, o custo da memória auxiliar e por que ordenar antes permite descartar metade a cada passo.
pages: "pp. 2–15"
pdf: "aula7 (1).pdf — Ordenação e Busca Otimizada"
objectives:
  - Descrever divisão, conquista e fusão com caso base explícito.
  - Traçar a árvore de recursão e o número de comparações da fusão.
  - Justificar a memória auxiliar O(n) do Merge Sort.
  - Comparar busca linear e binária e enunciar a pré-condição de ordenação.
evidence:
  - kind: code
    source: "regitro_livros.cs · linha 576"
    text: "O cadastro evita autor repetido com listaAutoresTags.Contains, uma busca linear sobre a lista de tags."
  - kind: code
    source: "FormDevolucao.cs · consulta de atirador por termo"
    text: "A consulta combina igualdade de número com LIKE de nome e ordena por prioridade, LIMIT 15."
  - kind: model
    source: "aula7 (1).pdf pp. 2–15"
    text: "Recursão em C com índices, slicing em Python e o traço da busca binária são dos slides; o PI não tem Merge Sort."
quiz:
  - q: "Qual é o caso base do Merge Sort?"
    options:
      - "Subvetor com zero ou um elemento, que já está ordenado"
      - "Subvetor com dois elementos trocados"
      - "Vetor de tamanho par"
      - "Vetor com todos os elementos iguais"
    answer: 0
    explain: "A recursão para quando não há o que ordenar. Tamanho par é irrelevante; elementos iguais ainda precisam de fusão."
  - q: "Por que o Merge Sort usa memória auxiliar O(n)?"
    options:
      - "Porque a fusão precisa de um vetor temporário para combinar as metades"
      - "Porque a recursão cria uma cópia de cada subvetor na pilha"
      - "Porque ele ordena em um segundo vetor definitivo"
      - "Porque o pivô precisa ser armazenado a cada chamada"
    answer: 0
    explain: "A fusão copia elementos para um bloco temporário antes de devolvê-los. A pilha guarda índices, não cópias; não há vetor definitivo nem pivô."
  - q: "Quantas comparações a busca binária faz, no pior caso, em 1.000.000 de elementos ordenados?"
    options:
      - "Cerca de 20"
      - "Cerca de 1.000"
      - "Cerca de 10.000"
      - "Cerca de 1.000.000"
    answer: 0
    explain: "log₂ de 1.000.000 é aproximadamente 20. Mil comparações seriam ~n/1000, e um milhão é o custo da busca linear."
---

A biblioteca identifica um livro pelo código, como LIV123, e o cadastro precisa recusar códigos repetidos e localizar obras por título. Quando o acervo é pequeno, qualquer varredura resolve. Quando cresce, a diferença entre percorrer tudo e descartar metade a cada passo passa a decidir se a tela responde ou trava. Esta aula constrói as duas metades dessa história: ordenar com divisão e conquista e buscar com descarte.

## Divisão e conquista; caso base e fusão

Divisão e conquista resolve um problema quebrando-o em instâncias menores, resolvendo cada uma e combinando os resultados. No Merge Sort, dividir é partir o vetor pela metade; conquistar é ordenar cada metade recursivamente; combinar é fundir as duas metades ordenadas em uma só.

O caso base é o subvetor de zero ou um elemento, que já está ordenado. Sem esse caso, a recursão não termina. A fusão percorre as duas metades comparando os menores elementos e copiando para o destino, o que custa tempo proporcional ao total.

## Árvore de recursão, índices e alocação em C

Com [38, 27, 43, 3], a primeira divisão gera [38, 27] e [43, 3]; a segunda gera quatro vetores de um elemento. A árvore tem altura log₂ n, e cada nível custa n operações de fusão, o que dá n log n.

Em C, a recursão trabalha com índices `inicio`, `meio` e `fim`, sem duplicar o vetor. A fusão aloca um bloco temporário com `malloc` do tamanho da faixa, copia os elementos ordenados e devolve ao vetor original antes de `free`. Esse `malloc` é o custo espacial explícito.

## Slicing e cópias em Python; custo temporal e memória auxiliar

Em Python, o fatiamento esconde a alocação: `vetor[:meio]` cria uma lista nova na memória. O código fica curto, mas cada nível da recursão copia dados, e o consumo de memória cresce além do vetor temporário da fusão.

O custo temporal continua n log n; o que muda é a constante e o pico de memória. Em C, o pico é um bloco do tamanho da faixa fundida; em Python, somam-se as cópias das metades em cada nível. Para o PI, isso reforça uma escolha: ordenar no banco evita carregar e copiar listas no cliente.

## Busca linear e binária em C/Python

A busca linear percorre do início até achar ou terminar, custando O(n). É o único método possível em lista encadeada ou vetor desordenado. No projeto, `listaAutoresTags.Contains(nomeAutor)` é exatamente isso: uma varredura sobre os autores já adicionados.

A busca binária exige vetor ordenado e acesso por índice. Compara com o elemento do meio, descarta uma metade e repete. Em [2, 5, 8, 12, 16, 18, 23, 38, 56, 72], procurar 18 gasta três comparações: meio 16, depois 38, depois 18.

## Entrada ordenada e acesso indexado; comparação de volume

| Volume | Busca linear | Busca binária |
| --- | --- | --- |
| 1.000 | 1.000 comparações | ~10 |
| 1.000.000 | 1.000.000 | ~20 |
| 1.000.000.000 | 1.000.000.000 | ~30 |

A tabela mostra por que ordenar uma vez e buscar muitas vezes compensa: o custo n log n da ordenação se paga depois de poucas consultas. Mas a pré-condição é rígida: se o vetor não estiver ordenado, a binária devolve resultado errado sem avisar.

```csharp
if (listaAutoresTags.Contains(nomeAutor)) return;
listaAutoresTags.Add(nomeAutor);
```

Esse trecho de regitro_livros.cs mostra a busca linear em uso real: antes de adicionar um autor à lista de tags do livro, o código verifica se ele já está lá. Como um livro tem poucos autores, o custo é irrelevante, e a simplicidade vence.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local, abre direto no painel e não tem login. Confirmado no código: não há Merge Sort, não há `BinarySearch` e não há ordenação em memória. A ordenação é feita pelo `ORDER BY` e a busca por igualdade ou `LIKE` no banco.

O `LIKE '%termo%'` do cadastro de atiradores é uma varredura: o curinga à esquerda impede usar índice de prefixo. Já `WHERE numero = @num` usa a chave primária, que é indexada. A mesma tela mistura os dois regimes, e é isso que explica por que buscar por número é instantâneo e buscar por parte do nome custa mais.

Modelo didático: a árvore de recursão, o `malloc` da fusão e o traço da binária vêm dos slides. O PI não implementa nenhum dos dois; a ponte é entender o que o banco faz por baixo.

## Teste de mesa

Merge Sort em [38, 27, 43, 3], contando comparações em cada fusão.

| Etapa | Entrada | Comparações | Saída |
| --- | --- | --- | --- |
| Fusão 1 | [38] e [27] | 1 | [27, 38] |
| Fusão 2 | [43] e [3] | 1 | [3, 43] |
| Fusão 3 | [27, 38] e [3, 43] | 3 | [3, 27, 38, 43] |

A última fusão compara 27 com 3, copia 3; compara 27 com 43, copia 27; compara 38 com 43, copia 38; e copia o 43 restante. Total: 5 comparações para n = 4, dentro do limite de n log₂ n = 8.

## Pergunta de defesa

**Por que não usar busca binária em vez do LIKE no cadastro de atiradores?**

Porque a busca binária exige a coleção ordenada pelo campo pesquisado e acesso por índice, e a consulta procura um trecho no meio do nome, não um valor exato. Um `LIKE '%silva%'` não tem como descartar metade das linhas, porque o trecho pode estar em qualquer posição. Além disso, a consulta combina três critérios, incluindo igualdade de número. O caminho correto seria indexar o campo e usar prefixo, ou manter uma estrutura auxiliar de busca textual, o que o projeto não faz.

## Exercício

Aplique a busca binária para encontrar 7 no vetor ordenado [1, 3, 5, 7, 9, 11, 13] e liste os índices de meio visitados.

<details><summary>Ver resposta</summary>

Início 0, fim 6, meio 3, valor 7: encontrado na primeira comparação. Se o alvo fosse 11, o meio 3 daria 7, menor que 11, então início vira 4; meio 5, valor 11, encontrado em duas comparações. O exemplo mostra que o número de passos depende de log₂ n, não da posição do elemento.

</details>
