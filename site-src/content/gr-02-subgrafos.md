---
slug: gr-02-subgrafos
title: "Subgrafos, cliques e independência"
summary: "Escolher parte do grafo exige saber se as ligações internas foram preservadas; subgrafo, induzido, clique e independência respondem a perguntas diferentes."
pages: "pp. 2–6"
pdf: "aula3 (1).pdf — Componentes e Subestruturas em Grafos"
objectives:
  - "Distinguir subgrafo, subgrafo próprio e subgrafo induzido."
  - "Reconhecer clique e clique máximo em um grafo pequeno."
  - "Explicar hiperaresta e a decomposição em arestas binárias."
  - "Relacionar independência de arestas sem ciclo com árvore geradora."
evidence:
  - kind: code
    source: "banco.sql · livro_autores (linhas 176–183)"
    text: "Chave composta e chaves estrangeiras garantem arestas só entre livro e autor, sem repetição: grafo bipartido e simples."
  - kind: code
    source: "Form3.Designer.cs · filtro por autor (linha 427)"
    text: "O WHERE por nome de autor escolhe arestas, não vértices: o resultado é subgrafo, não subgrafo induzido."
  - kind: model
    source: "aula3 (1).pdf pp. 2–4"
    text: "Bloco de gavetas da grade 6 por 5 com as ligações internas preservadas ilustra subgrafo induzido."
  - kind: future
    source: "aula3 (1).pdf pp. 4–6"
    text: "Clique máximo e matroide não estão implementados; o matroide justifica o guloso de Kruskal na aula seguinte."
quiz:
  - q: "O que distingue subgrafo induzido de subgrafo?"
    options: ["O induzido tem menos vértices", "O induzido mantém todas as arestas originais entre os vértices escolhidos", "O induzido só existe em grafo orientado", "O induzido precisa ser conexo"]
    answer: 1
    explain: "No induzido, nenhuma aresta interna pode ser omitida; no subgrafo comum, a escolha de arestas é livre."
  - q: "Em um grafo bipartido, o tamanho do maior clique é..."
    options: ["igual ao número de vértices", "no máximo 2", "sempre 3", "impar"]
    answer: 1
    explain: "Um triângulo exigiria aresta dentro de um dos lados, o que a bipartição proíbe."
  - q: "No matroide gráfico, um conjunto de arestas é independente quando..."
    options: ["não tem ciclo", "conecta todos os vértices", "tem peso mínimo", "não repete vértice"]
    answer: 0
    explain: "Independência é ausência de ciclo; os conjuntos maximais são as árvores geradoras."
---

Escolher parte do grafo é a operação mais comum de quem investiga um acervo: isolar as obras de um autor, olhar apenas as gavetas de uma fileira, verificar se um grupo de livros se cita mutuamente. Subgrafo, subgrafo induzido, clique e conjunto independente respondem a perguntas diferentes, e confundi-los produz conclusão errada.

## Subgrafo e subgrafo próprio

Um grafo H = (V', E') é subgrafo de G = (V, E) quando V' ⊆ V e E' ⊆ E, e cada aresta de H mantém em G os mesmos vértices terminais. Se H ≠ G, ele é subgrafo próprio. A definição é permissiva: pode-se escolher qualquer subconjunto de arestas, mesmo deixando vértices isolados.

No grafo com A, B, C, D e arestas AB, AC, BC, CD, o grafo com V' = {A, B, C} e arestas AB e AC é subgrafo próprio: retirou BC e não incluiu D. Isolar uma sub-rede para diagnóstico é exatamente essa operação.

## Subgrafo induzido e preservação de todas as ligações

O subgrafo induzido por V' ⊆ V, escrito G[V'], contém todas as arestas de G que ligam vértices de V'. Nenhuma ligação interna pode ser omitida: o induzido de {A, B, C} no exemplo é o triângulo completo, com AB, AC e BC.

A diferença prática é grande. Ao extrair uma VLAN de uma rede maior, o engenheiro precisa do induzido para não perder tráfego entre as máquinas isoladas. No PI, filtrar o acervo por autor escolhe arestas, não vértices: sobra um subgrafo com as arestas daquele autor, que não é induzido.

## Clique e clique máximo; hipergrafos e hiperarestas

Um clique é um conjunto C ⊆ V cujo subgrafo induzido é completo: todos os pares de C têm aresta. O clique máximo é o de maior tamanho. No exemplo, {A, B, C} é clique de tamanho 3 e é máximo, porque faltam AD e BD para um K4. Decidir se existe clique de tamanho k é NP-completo, e por isso a prática usa heurística.

Um hipergrafo relaxa a aresta binária: a hiperaresta liga qualquer número de vértices. Um livro com três autores é naturalmente a hiperaresta {L1, A1, A2, A3}. A tabela de junção do PI desmonta essa hiperaresta em arestas de dois vértices, e essa decomposição é a estrutura de incidência.

## Matroide gráfico; independência como arestas sem ciclo

Um matroide captura a ideia de independência. No matroide gráfico, um conjunto de arestas é independente quando não contém ciclo, ou seja, quando forma floresta. Os conjuntos independentes maximais são as árvores geradoras, e todos têm o mesmo tamanho, V − 1.

É essa propriedade de troca que autoriza o guloso: aceitar a aresta mais barata que não feche ciclo nunca leva a um beco sem saída. O erro comum é confundir com conjunto independente de vértices, aquele em que nenhum par tem aresta. São conceitos distintos com nomes parecidos, e a banca costuma cobrar a diferença.

## No Projeto Integrador

Confirmado no código: `livro_autores` tem chave composta e duas chaves estrangeiras (banco.sql, linhas 176–183), o que garante arestas apenas entre livro e autor, sem repetição. O grafo é bipartido, então o clique máximo tem tamanho 2; um triângulo ali significaria um livro escrito por livro, erro de modelagem.

Modelo didático: escolher um bloco de gavetas na grade de seis por cinco e manter as ligações internas é subgrafo induzido. Busca por clique máximo e matroide não estão no sistema; o matroide aparece como justificativa do guloso de Kruskal, na aula seguinte.

## Teste de mesa

G: V = {A, B, C, D}, E = {AB, AC, BC, CD}.

| Objeto | Regra | Exemplo neste grafo |
| --- | --- | --- |
| Subgrafo | V' ⊆ V e E' ⊆ E | {A, B, C} com AB e AC |
| Subgrafo induzido | todas as arestas internas | {A, B, C} com AB, AC, BC |
| Clique | induzido completo | {A, B, C}, tamanho 3 |
| Independente de vértices | nenhuma aresta interna | {A, D} ou {B, D}, tamanho 2 |
| Independente de arestas | sem ciclo | {AB, AC, CD} |

As árvores geradoras do exemplo têm três arestas cada: {AB, AC, CD}, {AB, BC, CD} e {AC, BC, CD}. O rank do matroide é 3 = 4 − 1, e o clique de tamanho 3 convive com o independente de vértices de tamanho 2, sem contradição.

## Pergunta de defesa

Por que o grafo livro–autor não pode ter clique de tamanho 3? Porque ele é bipartido: qualquer trio de vértices teria, pelo princípio das casas, dois no mesmo lado, e a bipartição proíbe aresta interna a um lado. Assim, o maior clique é uma aresta, tamanho 2. Um triângulo no modelo indicaria uma aresta entre dois livros ou entre dois autores, o que corresponderia a dizer que um livro escreveu outro livro. A consequência prática é que cluster de livros precisa de outro critério, como categoria ou coocorrência de empréstimos.

## Exercício

No grafo com V = {1, 2, 3, 4, 5} e arestas 1–2, 1–3, 2–3, 3–4 e 4–5, determine um clique máximo, um conjunto independente de vértices máximo e uma base do matroide gráfico.

<details><summary>Ver resposta</summary>
<p>Clique máximo: {1, 2, 3}, tamanho 3, pois 1–2, 1–3 e 2–3 existem; não há K4. Independente de vértices máximo: tamanho 2, por exemplo {1, 4} ou {2, 4}; qualquer trio incluiria um par adjacente. Base do matroide: quatro arestas sem ciclo ligando os cinco vértices, como {1–2, 2–3, 3–4, 4–5}, que é árvore geradora com V − 1 = 4 arestas.</p>
</details>
