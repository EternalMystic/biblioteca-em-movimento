---
slug: tc-07-complexidade
title: "Decidibilidade, complexidade e tratabilidade"
summary: "Decidir se o problema tem solução é só o começo: entre dois algoritmos corretos, o custo decide qual sobrevive. A aula percorre a prova da Parada, as reduções e a análise assintótica até P, NP e NP-completo."
pages: "pp. 2–14"
pdf: "aula7.pdf — Computabilidade e Complexidade"
objectives:
  - "Distinguir problema decidível de indecidível e reconstruir a prova por contradição do Problema da Parada."
  - "Usar redução para transferir indecidibilidade de um problema conhecido a um novo."
  - "Medir custo em operações elementares, separando tempo de espaço auxiliar e adotando o pior caso."
  - "Classificar trechos de código em O(1), O(log n), O(n), O(n log n) e O(n²), e situar P, NP e NP-completo."
evidence:
  - kind: code
    source: "Form2.cs · linhas 40–60"
    text: "A busca usa LIKE '%…%' em três colunas e uma consulta COUNT(*) separada da consulta paginada: duas passagens pelo conjunto filtrado e varredura que não aproveita índice."
  - kind: code
    source: "regitro_livros.cs · linhas 341–347"
    text: "A montagem da lista de gavetas executa 6 × 5 = 30 iterações, custo constante independente do tamanho do acervo."
  - kind: code
    source: "FormDevolucao.cs · linhas 544–547"
    text: "CalcularDiasAtraso faz uma subtração de datas e um Math.Max: O(1) em tempo e espaço."
  - kind: model
    source: "aula7.pdf pp. 12–14"
    text: "P, NP e NP-completo são classes teóricas; nenhuma rotina do PI foi classificada formalmente, e o sistema não resolve problema NP-completo."
quiz:
  - q: "Um problema é indecidível quando:"
    options: ["Nenhum computador atual consegue resolvê-lo em tempo hábil.", "É impossível criar um algoritmo que sempre pare com a resposta correta para toda entrada.", "Só pode ser resolvido com memória infinita.", "A resposta depende do hardware."]
    answer: 1
    explain: "A limitação é lógica, não de velocidade ou memória. O sintoma é o laço infinito em certas entradas."
  - q: "O custo 3n² + 5n + 10 é:"
    options: ["O(n)", "O(log n)", "Θ(n²)", "O(n³)"]
    answer: 2
    explain: "O termo dominante é n². Constantes e termos menores são descartados, e o limite superior e o inferior coincidem, o que permite usar Θ."
  - q: "Dois laços aninhados, cada um de 1 a n, com corpo O(1), custam:"
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"]
    answer: 2
    explain: "O custo é o produto das iterações: n × n. Laços aninhados multiplicam; laços em sequência somam e ficam com o maior termo."
  - q: "Dizer que um problema é NP-completo significa que:"
    options: ["Ele não tem solução algorítmica.", "Todo problema de NP se reduz a ele em tempo polinomial.", "Ele é resolvido em tempo linear.", "Ele pertence a P por definição."]
    answer: 1
    explain: "NP-completos são os mais difíceis de NP. Se um deles tiver algoritmo polinomial, então P = NP."
---

A consulta que lista empréstimos responde em milissegundos com cinquenta registros e pode demorar com cinquenta mil. O código é o mesmo, o resultado é o mesmo, e a diferença está no crescimento do custo. A aula 7 fecha a trilha separando duas perguntas que costumam se misturar: se o problema tem solução algorítmica e quanto essa solução custa.

## Decidibilidade e indecidibilidade; Parada e diagonalização

Um problema é decidível quando existe algoritmo que sempre para e devolve a resposta correta para qualquer entrada. É indecidível quando é impossível construir um algoritmo genérico com essa garantia. A indecidibilidade não é falta de RAM nem de velocidade: é limite da lógica, e o sintoma é o laço infinito em certas entradas.

O Problema da Parada é o caso emblemático. Suponha um Auditor que recebe o código de qualquer programa e prevê se ele para, sem executá-lo. Construa o Paradoxo, que consulta o Auditor sobre si mesmo e inverte a resposta: se a previsão é “para”, entra em laço; se é “não para”, encerra. O Auditor erra nos dois ramos, logo não existe. A diagonalização é a versão formal da mesma ideia: enumerar todos os programas e construir um que discorde de cada um na sua própria posição.

## Reduções lógicas; aplicações à análise estática e verificação

Reduzir A a B significa transformar uma solução de B em solução de A. Se A é indecidível e A se reduz a B, então B também é. A técnica evita provas novas: mapeia-se o problema desconhecido para um limite já conhecido.

Na prática, isso explica por que ferramentas de análise estática não prometem tudo. Um antivírus não decide com certeza absoluta se qualquer arquivo é malicioso; um compilador não encontra todos os erros de lógica antes da execução; um verificador não prova equivalência entre dois programas arbitrários. A engenharia responde com heurísticas, análise de padrões e testes — aproximações declaradas como tais.

## Custo temporal, espaço auxiliar e casos de entrada

Complexidade de tempo conta operações elementares; complexidade de espaço conta memória auxiliar além da entrada. Não se mede em segundos, porque hardwares diferem: mede-se em função do tamanho n da entrada. Em sistemas críticos, o alvo é o pior caso, porque é ele que derruba o servidor sob estresse.

A distinção entre melhor, médio e pior caso importa. Uma busca sequencial acha o item na primeira posição no melhor caso e na última no pior; o custo garantido é o pior. Dizer “é rápido no meu computador” não é análise de complexidade, é medição de um caso.

## Termos dominantes; O, Ω e Θ

Quando n cresce, os termos menores viram ruído. Se o custo é 3n² + 5n + 10, com n igual a um milhão os termos 5n e 10 são irrelevantes, e a constante 3 também: fica n². A análise assintótica olha o termo de maior grau.

| Notação | Significado | Leitura prática |
| --- | --- | --- |
| O(f) | Limite superior | No pior caso, não cresce mais rápido que f |
| Ω(f) | Limite inferior | No melhor caso, exige ao menos f |
| Θ(f) | Limite exato | Superior e inferior coincidem |

O é a notação do mercado, porque dá garantia de teto para dimensionar infraestrutura. Θ só se aplica quando os dois limites convergem. O erro comum é escrever Θ quando só se provou o teto.

## Sequência, condicional, laços simples, logarítmicos e aninhados

O custo de um bloco é a soma das partes, e a soma é dominada pelo maior termo. Um trecho O(1) seguido de outro O(n) é O(n). No condicional, como a análise é de pior caso, soma-se o teste ao caminho mais caro entre os ramos.

Nos laços, o custo é o número de iterações vezes o custo do corpo. Um `for` de 1 a n é O(n). Um laço que divide o índice pela metade a cada passo é O(log n). Dois laços aninhados de tamanho n dão O(n²). Um laço sobre n com outro sobre 30 fixo continua O(n), porque constante não altera a classe.

## P, NP, NP-completo e tratabilidade

P reúne os problemas decidíveis em tempo polinomial. NP reúne os que têm certificado verificável em tempo polinomial — se alguém entrega a resposta, a conferência é rápida. P está contido em NP; se a inclusão é estrita, ninguém provou.

NP-completo são os problemas mais difíceis de NP: todo problema de NP se reduz a eles em tempo polinomial. Se um deles tiver algoritmo polinomial, P = NP. Praticamente, tratar um problema como NP-completo significa abandonar a solução exata para toda entrada e escolher entre heurística, aproximação ou restrição do tamanho.

## No Projeto Integrador

Confirmado no código: a busca monta `LIKE '%…%'` sobre título, nome de guerra e status; o `%` à esquerda impede o uso de índice, então cada consulta varre as linhas filtradas. A paginação faz `COUNT(*)` em uma consulta e a página em outra. A lista de gavetas custa 30 iterações fixas, e o cálculo de atraso é O(1).

Modelo didático: a classificação O/Θ dos trechos e o quadro de complexidades. Ementa/proposta: trocar a busca por texto livre em coluna indexada ou por busca full-text, e eliminar a contagem duplicada. O sistema usa MySQL local; não há login, OCR, API pública nem banco em nuvem, e nenhuma rotina resolve problema NP-completo.

## Teste de mesa

Conte as operações de um inventário ingênuo com 5 obras e 30 gavetas: para cada gaveta, percorrer todas as obras comparando a etiqueta. São 30 × 5 = 150 comparações. Com 500 obras, 15.000 — o crescimento é 30n, isto é, O(n).

A versão com índice percorre as obras uma vez e agrupa por gaveta: 5 operações de inserção em um mapa, mais 5 leituras. Com 500 obras, 500 operações. As duas produzem o mesmo relatório; a diferença aparece quando n cresce, e é exatamente isso que a notação assintótica registra. Se o inventário tivesse um terceiro laço aninhado sobre as obras, o custo passaria a O(n²) e 500 obras já custariam 250.000 comparações.

## Pergunta de defesa

**“Por que a busca do sistema é aceitável hoje e problemática amanhã?”**

Porque o custo cresce linearmente com o número de linhas e a varredura ignora índices, mas o acervo atual é pequeno. Com dezenas de milhares de empréstimos, cada consulta passa a varrer a tabela inteira, e a contagem duplicada dobra o trabalho. A correção não é reescrever a interface: é rever o padrão de busca e a paginação. É a diferença entre medir o caso e analisar a classe de crescimento.

## Exercício

Um trecho percorre as n obras e, para cada uma, executa uma busca binária em um vetor ordenado de tamanho n. Qual a complexidade e por que ela não é O(n)?

<details><summary>Ver resposta</summary>

A busca binária custa O(log n), e ela é executada n vezes, uma por obra: o total é O(n log n). Não é O(n) porque o custo interno não é constante — cada iteração faz uma busca que cresce com o logaritmo do tamanho. Também não é O(n²), porque a busca binária descarta metade do espaço a cada comparação. Esse é o custo típico de ordenar e depois consultar: O(n log n) para ordenar, mais O(log n) por consulta. Se as consultas fossem muitas, valeria ordenar uma vez; se fosse uma só, a busca linear O(n) seria mais barata.

</details>
