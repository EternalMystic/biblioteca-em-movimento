---
slug: ed-04-pilhas-filas
title: Pilhas, filas e listas lineares
summary: LIFO e FIFO como disciplinas de acesso, pilha em vetor e encadeada, fila com frente e trás, fila circular, listas simples e duplas e o custo por posição.
pages: "aula3 pp. 9–13; aula5 (1) pp. 2–12"
pdf: "aula3.pdf — TAD Pilha e Fila; aula5 (1).pdf — Filas, Pilhas e Listas Lineares"
objectives:
  - Implementar pilha e fila e justificar a disciplina LIFO ou FIFO.
  - Comparar implementação em vetor e encadeada quanto a capacidade e custo.
  - Explicar a fila circular e o motivo dos dois ponteiros.
  - Inserir e remover em LSE e LDE na ordem correta de religamento.
evidence:
  - kind: code
    source: "FormDevolucao.cs · linha 455 e consulta de empréstimos abertos"
    text: "Os empréstimos abertos de um atirador vêm ordenados por vencimento crescente, o que dá comportamento de fila por prazo."
  - kind: code
    source: "Form2.cs · ListaEmprestimos, linha 249"
    text: "A grade guarda as linhas em List<Item> e acrescenta no fim com Add, preservando a ordem de chegada."
  - kind: model
    source: "aula3.pdf pp. 9–13; aula5 (1).pdf pp. 2–12"
    text: "Push, pop, enqueue, dequeue, LSE e LDE são apresentados em C; o projeto não usa Stack<T> nem Queue<T>."
quiz:
  - q: "Qual estrutura entrega o último elemento inserido primeiro?"
    options:
      - "Pilha, com push no topo e pop no topo"
      - "Fila, com enqueue no fim e dequeue no início"
      - "Lista dupla, que sempre remove o maior elemento"
      - "Vetor ordenado, que remove o menor índice"
    answer: 0
    explain: "LIFO é a assinatura da pilha: entra e sai pela mesma extremidade. Fila é FIFO; lista dupla não ordena; vetor não define disciplina de remoção."
  - q: "Por que a fila encadeada eficiente precisa de dois ponteiros?"
    options:
      - "Porque inserir no fim sem ponteiro de trás exigiria percorrer toda a fila"
      - "Porque o ponteiro da frente não pode ser alterado"
      - "Porque a fila circular exige um nó sentinela obrigatório"
      - "Porque cada nó precisa apontar para o anterior"
    answer: 0
    explain: "Com só a frente, o enqueue percorre a estrutura, custando O(n). O ponteiro de trás mantém inserção em O(1); apontar para o anterior é característica da lista dupla."
  - q: "Na inserção de um nó no meio de uma LSE, qual ordem evita perder o resto da lista?"
    options:
      - "Primeiro o novo nó aponta para o sucessor, depois o anterior aponta para o novo"
      - "Primeiro o anterior aponta para o novo, depois o novo aponta para o sucessor"
      - "Liberar o nó anterior e depois criar o novo"
      - "Inverter os ponteiros do nó seguinte"
    answer: 0
    explain: "Se o anterior apontar primeiro para o novo, o endereço do sucessor se perde. A ordem correta preserva a cadeia e evita vazamento."
---

A devolução de um livro na biblioteca tem ordem: quem devolveu primeiro deve ser atendido primeiro, e o último empréstimo registrado é o primeiro a ser desfeito quando há engano no lançamento. Essas duas frases descrevem FIFO e LIFO, as disciplinas que esta aula formaliza. Elas não dependem do tipo de alocação, mas da restrição de acesso que a estrutura impõe.

## TAD pilha em vetor e encadeada; push/pop e liberação

A pilha admite acesso apenas pelo topo: `push` insere, `pop` remove, ambos em O(1). Em vetor, basta um índice de topo e a checagem de capacidade; em implementação encadeada, cada `push` aloca um nó, liga ao topo atual e move o topo para o novo nó.

No `pop` encadeado existe uma armadilha: guardar o nó em uma variável temporária, ler o valor, mover o topo para o próximo e só então liberar. Liberar antes de ler o sucessor destrói a informação necessária para continuar a lista. A versão em vetor não tem esse risco, mas tem limite fixo de capacidade.

## Fila encadeada FIFO com frente/trás e fila circular

A fila insere no fim e remove do início. Com apenas o ponteiro de frente, inserir no fim exigiria percorrer todos os nós, o que custa O(n). Com frente e trás, inserção e remoção ficam O(1): o novo nó entra depois de trás, e a remoção avança a frente.

A fila circular resolve o desperdício do vetor: em vez de deslocar elementos quando a frente avança, os índices voltam ao começo com aritmética modular. O controle passa a ser por `frente`, `tras` e contagem, e a condição de cheia deixa de ser `tras == tamanho`.

## LIFO e FIFO; push/pop e enqueue/dequeue

LIFO significa último a entrar, primeiro a sair; FIFO significa primeiro a entrar, primeiro a sair. As duas estruturas garantem O(1) em inserção e remoção porque só tocam extremidades, ignorando o miolo.

O erro comum é usar pilha onde o negócio pede fila. No PI, uma fila de espera por exemplar deve respeitar a ordem de chegada; uma pilha inverteria a prioridade e produziria injustiça no atendimento.

## Listas lineares, LSE/LDE, nós, início, NULL e travessia

A lista linear quebra as restrições e permite inserir, remover e consultar em qualquer posição. Na LSE, cada nó tem valor e um único ponteiro para o próximo; a lista é controlada por um ponteiro `inicio` e termina em NULL.

A consequência é a navegação de mão única: não existe marcha à ré. Para ler o quinto elemento é preciso visitar o primeiro, o segundo e assim por diante, porque os nós não estão adjacentes na memória. A busca, portanto, é O(n), diferente do acesso por índice do vetor.

## Inserção/remoção, ordem de religamento e liberação

Inserir no meio exige quatro passos: localizar o ponto com um ponteiro auxiliar, alocar o nó, fazer o novo apontar para o sucessor e fazer o anterior apontar para o novo. Inverter os dois últimos passos desconecta o resto da lista, que fica inacessível e vaza memória.

Remover exige o endereço do anterior, o que obriga dois ponteiros caminhando juntos: `atual` e `anterior`. Depois de religar, o nó removido precisa de `free`; esquecer essa etapa deixa o nó órfão no heap. Na LDE, o mesmo nó guarda `anterior` e `proximo`, o que permite remover em O(1) quando o ponteiro é conhecido.

## Comparação de memória e custos conforme posição

| Estrutura | Inserção no início | Inserção no meio | Busca pior caso |
| --- | --- | --- | --- |
| Vetor estático | O(n), desloca | O(n) | O(1) por índice |
| LSE | O(1) | O(n) para localizar | O(n) |
| LDE | O(1) | O(n) para localizar | O(n) |

A LDE ganha em remoção com ponteiro conhecido e perde 8 bytes por nó em sistemas 64 bits, além de exigir sincronizar quatro ponteiros por inserção. A escolha depende de quanto acesso aleatório o sistema faz.

```sql
SELECT e.id, e.id_obra, l.titulo, e.data_retirada, e.vencimento
FROM emprestimos e
INNER JOIN livros l ON e.id_obra = l.codigo_livro
WHERE e.id_atirador = @atirador
  AND UPPER(e.status) NOT IN ('CONCLUIDO', 'CONCLUÍDO')
ORDER BY e.vencimento ASC, e.id ASC;
```

O trecho é de FormDevolucao.cs. Ele materializa a disciplina FIFO por prazo: os empréstimos abertos do atirador chegam na ordem de vencimento, e o desempate por `id` garante estabilidade quando duas obras vencem no mesmo dia.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local e abre direto no painel. Confirmado no código: não existe `Stack<T>` nem `Queue<T>` no projeto. A ordem de atendimento é produzida pelo `ORDER BY` do SQL e pela ordem de inserção na `List<Item>` da grade de empréstimos, que usa `Add` no fim.

Isso significa que as disciplinas LIFO e FIFO estão no modelo de negócio e na consulta, não em uma classe de estrutura de dados. O histórico de devoluções carrega tudo em `_todos` e filtra em memória, sem fila de processamento.

Modelo didático: `push`, `pop`, `enqueue`, `dequeue`, fila circular, LSE e LDE vêm dos slides em C. O projeto não implementa nenhuma delas à mão; usa as coleções da biblioteca padrão, que internamente são vetores dinâmicos.

## Teste de mesa

Fila circular de capacidade 5 com índices `frente` e `tras`, começando em 0.

| Operação | frente | tras | Conteúdo lógico |
| --- | --- | --- | --- |
| enqueue(101) | 0 | 1 | 101 |
| enqueue(102) | 0 | 2 | 101, 102 |
| enqueue(103) | 0 | 3 | 101, 102, 103 |
| dequeue() devolve 101 | 1 | 3 | 102, 103 |
| enqueue(104) | 1 | 4 | 102, 103, 104 |
| enqueue(105) | 1 | 0 | 102, 103, 104, 105 |

No último passo, `tras` volta a 0 por aritmética modular, reaproveitando a posição liberada pelo dequeue. Se a fila fosse um vetor comum sem circularidade, seria preciso deslocar todos os elementos ou desperdiçar as posições iniciais.

## Pergunta de defesa

**Por que o projeto não usa Queue para a fila de devoluções?**

Porque a fila não vive em memória: ela é o resultado de uma consulta ordenada por vencimento no MySQL. Materializar uma `Queue<T>` exigiria carregar todos os empréstimos e ordená-los no cliente, o que duplicaria lógica e aumentaria o volume transferido. O `ORDER BY e.vencimento ASC, e.id ASC` cumpre o papel de disciplina FIFO com desempate estável. A estrutura de dados aparece, portanto, na consulta e na ordem de inserção da grade, não em uma classe própria.

## Exercício

Considere uma pilha vazia e a sequência: push(3), push(8), pop(), push(5), push(2), pop(). Qual é o topo ao final e quais valores foram removidos, na ordem?

<details><summary>Ver resposta</summary>

push(3) e push(8) deixam a pilha [3, 8] com topo 8. O pop remove 8. push(5) e push(2) deixam [3, 5, 2]. O segundo pop remove 2, e o topo passa a ser 5. Os removidos foram 8 e depois 2, o que confirma LIFO: o último a entrar é o primeiro a sair.

</details>
