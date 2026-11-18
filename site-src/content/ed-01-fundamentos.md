---
slug: ed-01-fundamentos
title: Fundamentos, memória e visão geral
summary: O que é estrutura de dados, por que bytes contíguos e encadeados custam diferente, como stack e heap se dividem e o que o TAD protege.
pages: "pp. 2–18"
pdf: "aula1 (1).pdf — Fundamentos, Memória e Visão Geral da Disciplina"
objectives:
  - Definir estrutura de dados separando disposição física de regra lógica.
  - Comparar alocação contígua e encadeada por custo de acesso e memória.
  - Explicar stack frames, heap, overflow, leak e ponteiro pendente.
  - Diferenciar tipo de dado de TAD, com domínio e invariantes.
evidence:
  - kind: code
    source: "Form2.cs · ListaEmprestimos, linhas 241–249"
    text: "Item e _itens são privados; o formulário só usa métodos públicos."
  - kind: code
    source: "Program.cs · Main"
    text: "Application.Run(new FormDashboard()) abre o painel, sem login."
  - kind: model
    source: "aula1 (1).pdf pp. 11–15"
    text: "Stack frames, overflow e leak vêm dos slides em C; a ponte é analogia."
quiz:
  - q: "O que define uma estrutura de dados?"
    options:
      - "Uma coleção de dados e as regras que operam sobre ela"
      - "Apenas o tipo primitivo dos campos"
      - "Somente o total de bytes na RAM"
      - "A linguagem de implementação"
    answer: 0
    explain: "A definição une disposição física e operações permitidas; tipo é só parte."
  - q: "Qual afirmação sobre stack e heap está correta?"
    options:
      - "A stack é automática e presa ao escopo; o heap sobrevive"
      - "O heap é sempre mais rápido porque vive em registradores"
      - "A stack cresce sem limite e o heap é fixo"
      - "Os dois são liberados no retorno da função"
    answer: 0
    explain: "A stack é limitada e some no retorno; o heap dura até a liberação."
  - q: "O que o TAD esconde de quem o consome?"
    options:
      - "A representação interna e as validações, expondo operações públicas"
      - "O nome da estrutura, irrelevante ao compilador"
      - "O custo assintótico, que deixa de existir"
      - "A necessidade de tratar erros, pois o encapsulamento basta"
    answer: 0
    explain: "O TAD publica contrato e esconde a representação; custo e erro continuam."
---

A biblioteca do Tiro de Guerra de Americana trabalha com objetos concretos: o livro LIV123, a etiqueta da gaveta 3C, a ficha do atirador e o prazo de devolução. O sistema é WinForms .NET 8 com MySQL local. Esta aula responde onde esses dados ficam na memória e que contrato liga quem guarda e quem consulta.

## Engenharia, recursos e definição formal de estrutura de dados

Estrutura de dados é uma coleção organizada na memória, com as regras e algoritmos que permitem armazenar, buscar e manipular com eficiência. Mil fichas soltas não formam estrutura; em ordem de código, sim.

O custo aparece em CPU e memória: o cadastro responde bem com 200 livros e pode travar com 200 mil, porque poucas linhas escondem escolhas ruins.

## Representação física contígua e encadeada; regras lógicas

No contíguo, o endereço sai de uma conta: base mais índice vezes tamanho. No encadeado, cada nó guarda o dado e o endereço do próximo, então chegar ao quinto exige passar pelos anteriores.

Contíguo ganha em leitura por índice e perde ao inserir no meio; encadeado ganha na inserção e perde na travessia. A pilha continua pilha nos dois, porque LIFO é a regra.

## Armazenamento, busca e manipulação; visão CA1–CA4

No PI, guardar um empréstimo é um INSERT; buscar os abertos de um atirador é consulta filtrada; manipular é atualizar o status.

O mapa da disciplina tem quatro componentes: CA1 trata memória e estruturas lineares, CA2 cobre acesso direto e ordenação, CA3 entra em hierarquia e CA4 fecha com grafos.

## Dados × informação

Dado é o valor bruto sem significado: 3C, 7, LIV123. Informação é o dado com contexto: o exemplar LIV123 está na gaveta 3C e volta em sete dias.

Se a gaveta estivesse em texto livre, achar o LIV123 exigiria ler todos os registros; com a coluna, é uma igualdade.

## Árvores, BST, AVL, travessias, heap e grafos no mapa da disciplina

Os slides anunciam o restante do curso: árvores genéricas, BST, AVL, travessias, heap e grafos com matriz ou lista de adjacência.

Esse trecho é ementa, não implementação. O código revisado não tem classe de árvore nem de grafo; a hierarquia real está nos índices do InnoDB.

## Stack de execução e stack frames

Cada chamada empilha um quadro com parâmetros, variáveis locais e endereço de retorno; ao terminar, ele é desempilhado movendo o ponteiro. Recursão sem caso base estoura a região.

No PI, `CarregarDadosBanco` mantém strings, offset e leitor no seu quadro, criados e destruídos a cada chamada.

## Heap de memória, alocação estática/dinâmica, overflow, leak e ponteiro pendente

O heap é alocação sob demanda: em C, `malloc` pede bytes; em C#, `new` pede ao runtime. O bloco tem tamanho definido em execução e sobrevive ao escopo.

Esquecer o `free` vaza memória; liberar e continuar usando gera ponteiro pendente. O coletor do .NET não conhece recursos externos, por isso o cache do Form4 é limpo com `Dispose`.

## TD × TAD, domínio, operações, encapsulamento e invariantes

Tipo de dado é a categoria que linguagem e hardware oferecem, com representação fixa; acessar o campo interno direto acopla todos os dependentes.

TAD especifica comportamento por operações e esconde a representação. Domínio é a faixa válida, operações públicas são o contrato e invariantes valem sempre. No projeto, `Item` é privado e o formulário só chama `Adicionar` e `Limpar`.

```csharp
internal class ListaEmprestimos : Control
{
    private class Item
    {
        public int Id;
        public string Titulo, Atirador, DataRetirada, Vencimento, Status;
    }
    private readonly List<Item> _itens = new List<Item>();
```

`Item` é inacessível fora da classe e `_itens` é somente leitura: ninguém troca a lista nem insere linha pela metade.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local e abre direto no painel, sem login. A memória relevante está nos formulários vivos, nas listas das grades e no cache de imagens.

Confirmado no código: `Program.cs` chama `Application.Run(new FormDashboard())`; `Form4.cs` declara `Dictionary<string, Image>` e limpa o cache antes de recarregar; `historico_devolucao.cs` mantém `_todos` e `_visiveis`.

Modelo didático: stack frame, overflow e ponteiro pendente vêm dos slides em C; o PI não usa `unsafe`.

## Teste de mesa

Vetor de 1.000 fichas de 120 bytes desde 0x1000, contra lista com 8 bytes de ponteiro por nó.

| Passo | Cálculo | Resultado |
| --- | --- | --- |
| Índice 0 | 0x1000 + 0 × 120 | 0x1000 |
| Índice 999 | 0x1000 + 119.880 | 0x1E448 |
| Ler índice 999 no vetor | multiplicação, soma, leitura | 3 passos |
| Ler o 1.000º nó | 999 desvios de ponteiro | 999 passos |
| Memória da lista | 1.000 × 128 | 128.000 bytes |

O vetor responde em tempo constante e gasta 8.000 bytes menos; a lista chega ao fim devagar, mas insere no meio com dois ponteiros.

## Pergunta de defesa

**Se o vetor é mais rápido e gasta menos, por que o projeto usa listas em memória?**

Porque o padrão do PI é acrescentar e percorrer: as grades recebem registros na ordem do banco e são lidas de cima para baixo, então o deslocamento não aparece. Além disso, `List<T>` é um vetor com crescimento automático. Com milhões de linhas, valeria medir de novo.

## Exercício

Classifique como verdadeira ou falsa: (a) pilha em vetor deixa de ser TAD; (b) o heap libera no retorno da função; (c) acessar o índice 900 custa o mesmo que o 9; (d) objeto com handle de imagem é liberado sem `Dispose`.

<details><summary>Ver resposta</summary>

(a) Falsa: LIFO é a regra; o arranjo é representação. (b) Falsa: o heap sobrevive ao escopo. (c) Verdadeira: base mais índice vezes tamanho, em passos fixos. (d) Falsa: o handle GDI+ exige `Dispose`.

</details>
