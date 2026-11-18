---
slug: ed-05-listas
title: Listas dinâmicas e o List<T> do projeto
summary: Como o List<T> junta vetor e realocação, o que são Count e Capacity, por que o append é amortizado e por que inserir no início ainda custa caro.
pages: "aula5 (1) pp. 2–12; aula1 (1) pp. 15–18"
pdf: "aula5 (1).pdf — Filas, Pilhas e Listas Lineares; aula1 (1).pdf — TAD"
objectives:
  - Diferenciar lista linear de vetor e de lista encadeada.
  - Explicar Count, Capacity e o crescimento por dobra no List<T>.
  - Calcular o custo amortizado de acrescentar no fim.
  - Justificar o custo linear de inserir ou remover no meio.
evidence:
  - kind: code
    source: "Form2.cs · ListaEmprestimos, linha 249"
    text: "A grade mantém List<Item> privada e só acrescenta no fim com Add, o caso de custo amortizado."
  - kind: code
    source: "historico_devolucao.cs · linhas 373 e 396"
    text: "O filtro gera uma nova lista com ToList e a grade é pré-dimensionada com _visiveis.Count."
  - kind: code
    source: "FormDevolucao.cs · linhas 354 e 455"
    text: "Cada busca de atirador descarta a lista anterior e aloca outra; a lista de empréstimos abertos nasce vazia e recebe Add."
quiz:
  - q: "O que significa dizer que acrescentar no fim de um List<T> é amortizado O(1)?"
    options:
      - "A maioria das inserções custa O(1), e as cópias ocasionais se diluem no total"
      - "Toda inserção custa exatamente uma operação"
      - "O custo é O(log n) porque a capacidade dobra"
      - "O custo é O(n) em todos os casos"
    answer: 0
    explain: "Quando a capacidade acaba, o vetor é copiado, custando O(n) naquele passo; somando, o custo por inserção fica constante. Não é sempre uma operação nem logarítmico."
  - q: "Qual é a diferença entre Count e Capacity?"
    options:
      - "Count é quantos itens existem; Capacity é quantos cabem sem realocar"
      - "Count é o tamanho do vetor interno; Capacity é o número de itens"
      - "Os dois são sempre iguais no List<T>"
      - "Capacity conta apenas elementos nulos"
    answer: 0
    explain: "Count acompanha os itens efetivos; Capacity é o espaço reservado. Elas só coincidem quando a lista está cheia."
  - q: "Por que inserir na posição 0 de uma lista de 10.000 itens é caro?"
    options:
      - "Porque todos os elementos precisam ser deslocados uma posição à direita"
      - "Porque a lista precisa ser recriada em outro endereço"
      - "Porque o índice 0 é reservado para o cabeçalho"
      - "Porque o acesso por índice deixa de ser possível"
    answer: 0
    explain: "O List<T> é um vetor: abrir espaço no início desloca n elementos. Não há recriação obrigatória, nem índice reservado, nem perda de acesso indexado."
---

A tela de empréstimos da biblioteca precisa mostrar uma lista de linhas, cada uma com id, obra, atirador, datas e status. Essa lista muda de tamanho: nasce vazia, recebe as linhas do banco e é limpa quando o filtro muda. A estrutura escolhida no projeto é `List<T>`, que parece uma lista encadeada, mas é um vetor que cresce. Entender essa diferença evita erros de desempenho.

## Lista linear, nós e encadeamento

Lista linear é uma sequência em que cada elemento tem um antecessor e um sucessor, exceto o primeiro e o último. A implementação encadeada representa isso com nós: cada nó guarda o valor e o endereço do próximo, e a sequência é mantida por ponteiros, não por posições vizinhas.

O ponteiro `inicio` aponta para o primeiro nó, e o último aponta para NULL. A travessia segue os ponteiros até encontrar NULL. Inserir e remover exigem religar ponteiros, e a estrutura cresce nó a nó, sem capacidade prévia.

## Inserção e remoção no meio: deslocamento e religamento

Na lista encadeada, inserir no meio custa O(1) depois de localizar o ponto, mas localizar custa O(n). Na lista baseada em vetor, o custo está no deslocamento: abrir uma posição no índice k obriga a mover n − k elementos para a direita.

Remover tem a mesma assimetria. No vetor, remover do início desloca todos os demais; no encadeado, basta ajustar um ponteiro depois de encontrar o anterior. Por isso a escolha depende do padrão de uso: muitas inserções no meio pedem encadeamento, muitos acessos por índice pedem vetor.

## List<T>: capacidade, Count e redimensionamento

`List<T>` no .NET é um vetor com dois números internos: `Count`, que conta os itens, e `Capacity`, que diz quantos cabem sem nova alocação. Quando `Count` alcança `Capacity`, o runtime aloca um vetor maior, copia os elementos e descarta o antigo.

O crescimento é por dobra (ou fator próximo), o que mantém o número de cópias proporcional ao total. Declarar a capacidade inicial quando o tamanho é conhecido evita realocações; é o que o projeto faz ao criar a grade com `new List<DataGridViewRow>(_visiveis.Count)`.

## Acesso por índice, append amortizado e busca linear

O acesso `lista[i]` é O(1), porque o endereço sai de base mais i vezes tamanho. `Add` no fim é amortizado O(1): a maioria das chamadas só escreve na posição livre. `Contains` e `IndexOf` são O(n), porque percorrem até achar.

```csharp
private List<Registro> _todos = new List<Registro>();
private List<Registro> _visiveis = new List<Registro>();
...
_visiveis = q.ToList();
```

O trecho é de historico_devolucao.cs. `_todos` recebe a carga do banco e `_visiveis` é substituída a cada filtro por uma lista nova. Essa troca de lista é simples, mas aloca de novo a cada tecla digitada; o formulário usa um timer para adiar a execução e reduzir o número de alocações.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local e abre direto no painel, sem login. `List<T>` aparece em cinco pontos confirmados: a grade de empréstimos em Form2.cs, os candidatos de atirador e os empréstimos abertos em FormDevolucao.cs, as listas de histórico e as tags de autor no cadastro de livros.

O uso é uniforme e conservador: criar, acrescentar no fim, percorrer para desenhar e descartar. Não há inserção no meio nem ordenação em memória; quando a ordem importa, ela vem do `ORDER BY` da consulta. É a escolha correta para o volume do projeto.

Modelo didático: nós, religamento de ponteiros e LSE vêm dos slides em C. O PI não tem classe de nó nem lista encadeada própria. A ponte é mostrar que `List<T>` resolve o crescimento automático, mas paga com deslocamento nas pontas erradas.

## Teste de mesa

Acrescentando os números de 1 a 10 em um `List<int>` que começa vazio e dobra de capacidade.

| Add | Count | Capacity | Cópias nesta chamada |
| --- | --- | --- | --- |
| 1 | 1 | 4 | 0 |
| 4 | 4 | 4 | 0 |
| 5 | 5 | 8 | 4 |
| 8 | 8 | 8 | 0 |
| 9 | 9 | 16 | 8 |
| 10 | 10 | 16 | 0 |

Foram 12 cópias para 10 inserções, cerca de 1,2 por item. Em 1.000 inserções, o total de cópias fica abaixo de 2.000, o que confirma o comportamento amortizado.

## Pergunta de defesa

**Se o List<T> é um vetor, por que não usar array desde o início?**

Porque o array exige tamanho fixo no momento da criação, e o sistema não sabe quantos empréstimos ou devoluções virão. O `List<T>` resolve isso com crescimento por dobra e mantém o acesso por índice em O(1), que é o que as grades usam. Quando o tamanho é conhecido, como no caso das linhas do histórico, o projeto já passa a capacidade no construtor e evita realocações. Array puro só compensaria em estruturas de tamanho fixo, como as tabelas de títulos e estados do formulário.

## Exercício

Uma lista tem 1.000 elementos e capacidade 1.024. Você insere um elemento na posição 0 e depois acrescenta um no fim. Quantos deslocamentos e quantas cópias acontecem?

<details><summary>Ver resposta</summary>

Inserir na posição 0 desloca os 1.000 elementos existentes uma casa à direita, custando O(n). Acrescentar no fim usa a capacidade livre: há espaço até 1.024, então não há cópia, apenas uma escrita. Se a capacidade estivesse cheia, haveria uma cópia de todos os elementos, e essa é a chamada O(n) que o custo amortizado dilui.

</details>
