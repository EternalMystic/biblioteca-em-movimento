---
slug: gr-04-dag-scc
title: "Ciclos, DAG e componentes fortemente conexas"
summary: "A DFS que encontra um vértice ativo prova ciclo; sem ciclo, a ordem inversa de finalização entrega a sequência de dependências, e o grafo transposto revela as ilhas de mão dupla."
pages: "pp. 10–15"
pdf: "aula4 (1).pdf — Ciclos, DAG e SCC"
objectives:
  - "Identificar ciclo dirigido pela aresta de retorno a vértice ativo."
  - "Produzir ordenação topológica pela ordem inversa de finalização."
  - "Definir componente fortemente conexa e explicar a transposição."
  - "Descrever as duas passagens de Kosaraju e seu custo."
evidence:
  - kind: code
    source: "Form3.Designer.cs · ExcluirLivro (linhas 364–405)"
    text: "A transação apaga livro_autores e só depois livros: ordem de dependência respeitada, aresta antes do vértice."
  - kind: code
    source: "FormDevolucao.cs · BtnSalvar_Click (linhas 1400–1430)"
    text: "Insere a devolução e depois conclui o empréstimo, duas etapas sequenciais na mesma transação."
  - kind: model
    source: "aula4 (1).pdf pp. 13–15"
    text: "Kosaraju e o grafo transposto aparecem como modelo; o sistema não calcula SCC."
  - kind: future
    source: "banco.sql · uq_devolucoes_emprestimo (linha 120)"
    text: "A unicidade por empréstimo impede duas devoluções; reabrir empréstimo concluído criaria ciclo de estados, e isso não existe."
quiz:
  - q: "O que prova a existência de ciclo dirigido em uma DFS?"
    options: ["Encontrar vértice já finalizado", "Encontrar aresta para vértice ainda ativo na pilha", "Encontrar vértice com grau zero", "Visitar todos os vértices"]
    answer: 1
    explain: "Vértice ativo está no caminho atual; voltar a ele fecha o ciclo. Vértice finalizado pode ser aresta cruzada."
  - q: "A ordenação topológica é obtida por..."
    options: ["ordem de descoberta da BFS", "ordem inversa de finalização da DFS", "ordem crescente de grau", "ordem de inserção na fila"]
    answer: 1
    explain: "Quem termina primeiro é quem depende mais; inverter a lista de finalização respeita as arestas."
  - q: "Em um DAG, uma ordenação topológica..."
    options: ["é única", "pode não ser única", "exige pesos", "só existe se o grafo for conexo"]
    answer: 1
    explain: "Vértices sem relação de dependência podem trocar de posição; a unicidade só vale se houver caminho entre todo par."
---

Um sistema de biblioteca é, antes de tudo, uma pilha de dependências: não se empresta o que não foi cadastrado, não se devolve o que não foi emprestado, não se apaga um livro que ainda tem vínculo de autoria. Quando essas relações viram arcos, surge a pergunta que decide a ordem das operações: o grafo tem ciclo? Se tiver, alguma etapa espera por si mesma e o fluxo trava.

## Ciclos dirigidos e estados ativos da DFS

Na DFS dirigida, cada vértice passa por três estados: não descoberto, ativo (na pilha de chamadas) e finalizado. Encontrar um vértice ativo a partir do vértice atual fecha um ciclo, porque existe caminho do ativo até o atual e o arco atual devolve ao início. Encontrar um vértice apenas finalizado não prova ciclo: pode ser aresta cruzada ou de avanço.

Exemplo: A→B, B→C, C→A, C→D. A DFS parte de A, desce a B e a C; o arco C→A encontra A ativo, provando o ciclo A→B→C→A. Sem esse cuidado, quem testa apenas "já visitado" acusa ciclo em qualquer dígrafo com caminhos convergentes. O erro é comum e derruba a análise de dependências.

## DAG e ordenação topológica por ordem inversa de finalização

Um DAG é um dígrafo sem ciclos. Nele, a DFS sempre termina sem encontrar vértice ativo, e a ordem inversa de finalização produz uma sequência em que toda origem aparece antes do destino. Se A→B, então A vem antes de B.

Considere o grafo de implantação do PI: L (tabela livros), A (tabela autores), LA (tabela livro_autores), C (cadastro de livro), E (empréstimo), D (devolução), com arcos L→LA, A→LA, LA→C, L→C, C→E, E→D. A DFS a partir de L finaliza D, E, C, LA e L; depois, a partir de A, finaliza A. Invertendo: A, L, LA, C, E, D. Outra ordem válida é L, A, LA, C, E, D, e a existência de duas respostas mostra que a ordenação topológica não é única.

## SCC, transposição de grafo e Kosaraju

Em dígrafo geral, a comunicação não é uniforme. Uma componente fortemente conexa é um conjunto em que existe caminho dirigido de qualquer vértice para qualquer outro do conjunto. São ilhas de mão dupla em meio a arcos de sentido único.

Kosaraju usa duas passagens de DFS. A primeira calcula a ordem de finalização no grafo original; a segunda percorre o grafo transposto, com todos os arcos invertidos, na ordem inversa de finalização. Cada árvore da segunda passagem é uma SCC. O custo é O(V + E) por passagem, portanto O(V + E) no total, mais o espaço do transposto. Exemplo: A↔B, B→C, C↔D, D→E produz as componentes {A, B}, {C, D} e {E}; a transposição impede que a segunda passagem escape para fora da componente.

## No Projeto Integrador

O vínculo confirmado no código é a ordem de exclusão em `Form3.Designer.cs` (linhas 364–405): dentro de uma transação, o sistema apaga primeiro `livro_autores` e só então `livros`. Isso respeita a dependência aresta antes do vértice, exatamente o que a ordenação topológica formaliza. A devolução segue a mesma disciplina em `FormDevolucao.cs` (linhas 1400–1430), inserindo o registro de devolução e depois concluindo o empréstimo.

O banco reforça a ordem com chaves estrangeiras e `ON DELETE CASCADE` (banco.sql, linhas 176–183), que apaga vínculos automaticamente; cascata não é percurso, é regra declarada. SCC e Kosaraju não aparecem no sistema: são modelo didático da aula. A unicidade `uq_devolucoes_emprestimo` (linha 120) impede devolver duas vezes o mesmo empréstimo, e um eventual "reabrir empréstimo concluído" criaria ciclo de estados — funcionalidade que não existe no código revisado.

## Teste de mesa

Dígrafo: A→B, B→A, B→C, C→D, D→C, D→E.

| Passagem | Ordem | Resultado |
| --- | --- | --- |
| DFS no original, de A | descoberta A, B, C, D, E | finalização E, D, C, B, A |
| Inversa da finalização | A, B, C, D, E | ordem de partida da 2ª passagem |
| DFS no transposto, de A | A e B | SCC {A, B} |
| Próximo não visitado, C | C e D | SCC {C, D} |
| Restante, E | E | SCC {E} |

O transposto tem A→B, B→A, C→B, D→C, E→D. A partir de A só se alcança B, e a componente fecha em duas unidades.

## Pergunta de defesa

Por que a ordenação topológica exige DAG? Porque a regra é colocar a origem antes do destino de cada arco, e um ciclo gera exigência contraditória: A antes de B, B antes de C e C antes de A não cabem em nenhuma sequência. A DFS detecta essa contradição ao encontrar vértice ativo. No PI, a ordem de exclusão só funciona porque a dependência é acíclica: vínculo antes do livro, devolução depois do empréstimo.

## Exercício

No dígrafo T1→T2, T1→T3, T2→T4, T3→T4, T4→T5, produza uma ordenação topológica pela DFS, indique se há ciclo e diga quantas SCCs existem.

<details><summary>Ver resposta</summary>
<p>DFS a partir de T1: T1→T2→T4→T5, finalizando T5, T4, T2; depois T3, que encontra T4 finalizado e finaliza. Ordem de finalização T5, T4, T2, T3, T1; invertendo, T1, T3, T2, T4, T5, que é válida, assim como T1, T2, T3, T4, T5. Não há ciclo, pois nenhum arco retorna a vértice ativo. Cada vértice é sua própria SCC, total de 5, porque nenhum par tem caminho de volta.</p>
</details>
