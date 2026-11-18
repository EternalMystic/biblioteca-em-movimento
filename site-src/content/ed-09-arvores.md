---
slug: ed-09-arvores
title: Introdução a árvores e BST
summary: Nó, aresta, raiz, folhas, grau, profundidade e altura; a regra de ordenação da BST, a busca em O(h) e o preço de inserir valores em ordem crescente.
pages: "pp. 12–17"
pdf: "aula8.pdf — Introdução a Árvores"
objectives:
  - Nomear as partes de uma árvore e calcular altura e profundidade.
  - Aplicar a regra de ordenação da BST ao inserir e buscar.
  - Medir o custo da busca em função da altura.
  - Comparar árvore balanceada e degenerada.
evidence:
  - kind: code
    source: "banco.sql · CREATE TABLE livros"
    text: "codigo_livro é PRIMARY KEY e id_categoria tem índice com chave estrangeira, estruturas que o InnoDB mantém como árvores balanceadas."
  - kind: code
    source: "banco.sql · CREATE TABLE devolucoes"
    text: "A tabela declara UNIQUE uq_devolucoes_emprestimo e os índices idx_devolucoes_atirador e idx_devolucoes_obra."
  - kind: future
    source: "aula8.pdf pp. 16–17"
    text: "Árvores AVL e balanceamento aparecem como ementa; o código revisado não implementa árvore binária de busca."
quiz:
  - q: "O que é a altura de uma árvore?"
    options:
      - "O número de arestas do caminho mais longo da raiz até uma folha"
      - "O número total de nós da árvore"
      - "A quantidade de filhos da raiz"
      - "O número de folhas da árvore"
    answer: 0
    explain: "Altura mede o caminho mais longo em arestas. Total de nós é tamanho, filhos da raiz é grau e folhas são nós terminais."
  - q: "Em uma BST, onde vai um valor menor que a raiz?"
    options:
      - "Na subárvore esquerda, descendo pela comparação em cada nó"
      - "Na subárvore direita, sempre"
      - "Na raiz, substituindo o valor anterior"
      - "Em qualquer folha disponível, sem regra"
    answer: 0
    explain: "A regra é menor à esquerda e maior à direita. Sem essa regra não há como descartar metade dos nós na busca."
  - q: "Por que inserir 10, 20, 30, 40, 50 em ordem crescente piora a busca?"
    options:
      - "Porque a árvore degenera em uma linha, com altura n − 1, e a busca vira O(n)"
      - "Porque a árvore fica balanceada e a busca vira O(1)"
      - "Porque a raiz muda a cada inserção"
      - "Porque a BST proíbe valores crescentes"
    answer: 0
    explain: "Cada novo valor é maior que todos os anteriores e desce sempre à direita. A raiz não muda e valores crescentes são permitidos, apenas custosos sem balanceamento."
---

A biblioteca guarda livros por código, mas também precisa responder perguntas por categoria, por autor e por faixa de ano. Um vetor ordenado resolve busca por igualdade, mas reorganizar tudo a cada novo livro é caro. Árvores entram quando os dados têm hierarquia e quando se quer manter ordem sem deslocar blocos inteiros. Esta aula apresenta o vocabulário e a primeira árvore de busca, a BST.

## Nó, aresta, raiz, pais, filhos, irmãos, folhas, grau, profundidade e altura

Nó é o bloco que guarda a carga útil e os ponteiros para outros nós. Aresta é a ligação lógica entre dois nós, representada em C por um ponteiro dentro do nó. A raiz é o nó superior, único ponto de entrada, sem antecessor.

Nó pai é quem aponta para nós inferiores; filho é quem descende diretamente de um pai; irmãos compartilham o mesmo pai; folha é o nó sem filhos, com ponteiros em NULL. Grau é o número de filhos diretos. Profundidade conta arestas da raiz até o nó; altura é a maior profundidade da árvore, e é ela que limita o tempo de busca no pior caso.

## Árvore binária e BST; regra de ordenação

Árvore binária é aquela em que cada nó tem no máximo dois filhos, chamados esquerdo e direito. A restrição binária permite algoritmos simples de busca e travessia.

A BST acrescenta uma regra: valores menores que o nó descem à esquerda, valores maiores descem à direita. Inserir 50, 30, 70, 20, 40, 60 e 80 produz uma árvore de altura 2, com 50 na raiz, 30 e 70 no nível 1 e os demais no nível 2. A regra vale para toda a subárvore, não só para o pai imediato.

## Busca em BST e custo O(h)

Buscar é descer comparando: se o alvo é menor, vai à esquerda; se é maior, à direita; se é igual, achou. Em uma árvore de altura 2, localizar 60 gasta três comparações: 60 > 50 desce à direita, 60 < 70 desce à esquerda, achou.

O custo é O(h), onde h é a altura. Em árvore equilibrada, h ≈ log₂ n, e a busca se aproxima da binária. O erro comum é achar que a BST garante O(log n) sempre: ela garante O(h), e h depende da forma.

## Balanceada × degenerada: O(log n) e O(n)

Inserindo 10, 20, 30, 40, 50 em ordem crescente, cada valor é maior que todos os anteriores e desce sempre à direita. A árvore vira uma linha, com altura 4 para 5 nós, e a busca por 50 percorre todos os nós: O(n), igual a uma lista.

Manter a altura baixa exige balanceamento, tema de AVL e de árvores rubro-negras. Esse tópico é ementa: o código revisado não tem classe de árvore, e a hierarquia que existe está nos índices do banco.

```sql
CREATE TABLE `livros` (
  `codigo_livro` varchar(10) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `gaveta` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`codigo_livro`),
  KEY `id_categoria` (`id_categoria`)
) ENGINE=InnoDB;
```

O trecho é de banco.sql, reduzido aos campos citados. A chave primária e o índice de categoria são mantidos pelo InnoDB em estruturas balanceadas: a busca por `codigo_livro` desce uma árvore de poucos níveis, e não percorre a tabela. É a mesma ideia da BST, com a garantia de balanceamento que a BST pura não oferece.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local, abre direto no painel e não tem login. Confirmado no código: `banco.sql` declara chaves primárias em `atiradores.numero`, `livros.codigo_livro` e `devolucoes.id`, uma chave única em `nome_autor` e uma chave composta em `livro_autores`, além dos índices `idx_devolucoes_atirador` e `idx_devolucoes_obra`.

Esses índices são a árvore que o projeto realmente usa, ainda que ninguém tenha escrito uma linha de BST. A consequência é prática: buscar por número de atirador ou por código de livro é rápido, enquanto filtrar por `LIKE '%termo%'` não usa índice e varre a tabela.

Modelo didático: nó, aresta, raiz, folha, grau, profundidade e altura vêm dos slides, assim como a busca em BST. AVL e balanceamento são ementa, não implementação. O PI não tem árvore binária em memória.

## Teste de mesa

Duas sequências de inserção em BST, com altura e comparações até o último valor.

| Sequência | Altura | Nós no caminho até 50 | Comparações |
| --- | --- | --- | --- |
| 50, 30, 70, 20, 40, 60, 80 | 2 | 50 | 1 |
| 10, 20, 30, 40, 50 | 4 | 10, 20, 30, 40, 50 | 5 |

Os mesmos cinco ou sete valores produzem custos diferentes conforme a ordem de chegada. Ordem aleatória tende a gerar altura próxima de log n; ordem crescente gera a pior forma possível.

## Pergunta de defesa

**Por que o projeto não precisa de uma BST se já usa índices?**

Porque o índice do banco é uma árvore balanceada mantida pelo próprio SGBD, com páginas em disco e balanceamento automático. Implementar uma BST em memória duplicaria a função e traria o problema da degeneração, que exigiria código de balanceamento. A BST faria sentido se o sistema precisasse manter, no cliente, um conjunto ordenado com inserções frequentes e consultas por faixa. Como o PI consulta o banco a cada tela, o índice resolve com menos código e mais garantia.

## Exercício

Insira 40, 20, 60, 10, 30, 50, 70 em uma BST vazia. Informe a altura da árvore e o caminho percorrido para buscar 50.

<details><summary>Ver resposta</summary>

40 vira raiz. 20 vai à esquerda; 60 à direita; 10 à esquerda de 20; 30 à direita de 20; 50 à esquerda de 60; 70 à direita de 60. A árvore fica com altura 2. A busca por 50 compara com 40 (maior, vai à direita), com 60 (menor, vai à esquerda) e encontra 50: três comparações, o mesmo número de níveis mais um.

</details>
