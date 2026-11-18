---
slug: ed-02-complexidade
title: Classes de complexidade e notação Big-O
summary: Por que contar operações em vez de segundos, as ordens de crescimento de 1 a n!, a estimativa com operações por segundo e o custo real da busca em um milhão de linhas.
pages: "pp. 2–12"
pdf: "aula2 (1).pdf — Classes de Complexidade e Notação Big-O"
objectives:
  - Distinguir custo de um algoritmo de classe de viabilidade de um problema.
  - Identificar a ordem de crescimento de um trecho de código.
  - Estimar tempo de execução a partir de uma hipótese explícita de operações por segundo.
  - Comparar acesso por índice, busca linear e busca binária em volumes crescentes.
evidence:
  - kind: code
    source: "Form4.cs · CarregarDadosBanco, linhas 431–445"
    text: "A consulta pagina com LIMIT @offset, @limite, mas o COUNT(*) roda sobre o mesmo filtro LIKE antes de cada página."
  - kind: code
    source: "historico_devolucao.cs · AplicarFiltros, linha 337"
    text: "O filtro percorre a lista _todos inteira em memória a cada digitação, com um timer que adia a execução."
  - kind: model
    source: "aula2 (1).pdf pp. 5–6"
    text: "A hipótese de 10⁸ operações por segundo é didática; o tempo real depende de cache, I/O e do compilador."
quiz:
  - q: "O que a notação O(n) descreve?"
    options:
      - "O limite superior do crescimento do número de operações no pior caso"
      - "O tempo exato em segundos para qualquer máquina"
      - "A quantidade de memória RAM sempre necessária"
      - "A dificuldade matemática do problema resolvido"
    answer: 0
    explain: "Big-O descreve taxa de crescimento no pior caso. Segundos variam com hardware, memória é outro eixo e dificuldade do problema é complexidade computacional."
  - q: "Um algoritmo faz 3n² + 40n + 7 operações. Qual é sua classe?"
    options:
      - "O(n²)"
      - "O(n)"
      - "O(n³)"
      - "O(3n²)"
    answer: 0
    explain: "Termos de menor grau e constantes são descartados, sobrando n². O(n) ignora o termo dominante e O(3n²) não é notação canônica."
  - q: "Por que a busca binária exige vetor ordenado?"
    options:
      - "Porque o descarte de metade depende de saber que os menores estão à esquerda"
      - "Porque a ordenação deixa o vetor menor na memória"
      - "Porque sem ordenação o acesso por índice fica mais lento"
      - "Porque o algoritmo usa recursão obrigatoriamente"
    answer: 0
    explain: "A comparação com o meio só permite descartar um lado se a ordem for garantida. Acesso por índice continua O(1) e a versão iterativa dispensa recursão."
---

O histórico de devoluções da biblioteca tem uma caixa de busca que filtra por nome do atirador, título da obra, código do livro e responsável pelo recebimento. A cada tecla digitada, o programa precisa responder rápido. A pergunta desta aula é como prever esse custo antes de o sistema ficar lento em produção, e não depois.

## Custo de um algoritmo × classe/viabilidade de um problema

Complexidade algorítmica olha para o código e para a máquina: quão rápido este algoritmo roda e quanta RAM consome quando a entrada cresce. O problema já tem solução; buscamos a via mais barata.

Complexidade computacional olha para o problema matemático: existe algum algoritmo, em qualquer máquina, que o resolva em tempo viável? Ordenar está resolvido em n log n; o caixeiro viajante não tem solução exata viável para entradas grandes, e por isso se aceita aproximação.

## Tamanho de entrada e limites de crescimento

Antes de medir, é preciso definir o que é n. No PI, n pode ser o número de devoluções na lista, o número de atiradores cadastrados ou o comprimento do termo buscado. Cada escolha muda a conta.

Contar operações elementares é mais estável que cronometrar, porque o cronômetro mistura hardware, compilador e processos em segundo plano. Constantes e termos menores desaparecem: 2n + 5 e 3n + 900 são ambos O(n), porque o que importa é a tendência quando n cresce.

## Ordens 1, log n, n, n log n, n², 2ⁿ, n!

A tabela abaixo usa valores aproximados de operações para dar noção de escala.

| n | log₂ n | n | n log₂ n | n² | 2ⁿ |
| --- | --- | --- | --- | --- | --- |
| 10 | 3,3 | 10 | 33 | 100 | 1.024 |
| 1.000 | 10 | 1.000 | 10.000 | 1.000.000 | impraticável |
| 1.000.000 | 20 | 1.000.000 | 20.000.000 | 10¹² | impraticável |

Constante é o acesso por índice; logarítmica é a busca binária, que corta o espaço pela metade; linear é a varredura; n log n é o limite dos algoritmos de ordenação por comparação; quadrática vem de laços aninhados; exponencial e fatorial aparecem em força bruta e permutações.

## Operações por segundo e estimativa de tempo com hipótese explícita

A estimativa usa Tempo = T(n) / capacidade da CPU. Adotando 10⁸ operações por segundo, um lote de 10.000 registros custa 10⁴/10⁸ = 0,0001 s em O(n) e 10⁸/10⁸ = 1 s em O(n²).

Com um milhão de registros, o linear leva 0,01 s e o quadrático leva 10¹²/10⁸ = 10.000 s, quase três horas. O ponto de engenharia é que os dois parecem equivalentes no teste pequeno; a diferença aparece só no volume de produção. A hipótese precisa ser declarada, porque 10⁸ é uma aproximação, não uma medida do seu computador.

## Acesso por índice, busca linear e binária

Acesso por índice é O(1): o endereço sai de base mais índice vezes tamanho, sem varredura. A busca linear é O(n), porque no pior caso visita todos os elementos. A busca binária é O(log n), mas exige vetor ordenado e acesso indexado.

Em um milhão de registros, a linear faz até um milhão de comparações; a binária, cerca de vinte. O ganho é de cinco ordens de grandeza, e é isso que justifica ordenar antes de buscar quando há muitas consultas.

## Quick Sort como exemplo de caso médio

O Quick Sort escolhe um pivô, particiona e recorre. No caso médio fica em n log n; no pior caso, com pivô sempre extremo, degenera para n². É o exemplo clássico de que a classe de um algoritmo pode depender da entrada.

Esse tópico é ementa: o PI não implementa Quick Sort. O código revisado não tem rotina de ordenação própria; a ordenação é delegada ao `ORDER BY` do MySQL.

## Fibonacci recursivo ingênuo e TSP por força bruta

Fibonacci recursivo sem memorização refaz a mesma conta muitas vezes e cresce como 2ⁿ. O caixeiro viajante por força bruta testa todas as permutações e cresce como n!. Para n = 50, nenhum dos dois termina em tempo útil.

A lição prática é reconhecer o padrão antes de escrever: dois laços aninhados sobre o mesmo conjunto já anunciam n²; recursão que se chama duas vezes sem guardar resultado anuncia exponencial.

```csharp
string queryCount = "SELECT COUNT(*) FROM atiradores WHERE 1=1";
string queryDados = "SELECT numero, nome_guerra, email, foto, nome, pelotao, ano_instrucao, situacao FROM atiradores WHERE 1=1";
if (!string.IsNullOrEmpty(filtroBusca))
{
    string condicao =
        " AND (numero LIKE @busca OR nome_guerra LIKE @busca OR nome LIKE @busca OR email LIKE @busca)";
    queryCount += condicao;
    queryDados += condicao;
}
queryDados += " ORDER BY numero ASC LIMIT @offset, @limite;";
```

O trecho é de Form4.cs. A leitura da página custa O(10) porque o `LIMIT` corta a saída, mas o `COUNT(*)` com quatro `LIKE '%termo%'` percorre a tabela inteira para saber o total. Paginar reduz a transferência, não o custo da contagem.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local e abre direto no painel, sem login. As telas trabalham com volumes modestos, o que esconde o custo: o cadastro de atiradores pagina de dez em dez e o histórico de devoluções carrega tudo para depois filtrar em memória.

Confirmado no código: em `Form4.cs`, `_linhasPorPagina` vale 10 e a consulta usa `LIMIT @offset, @limite` com `COUNT(*)` separado; em `historico_devolucao.cs`, `AplicarFiltros` parte de `_todos` e aplica `Where` sucessivos, refazendo a varredura a cada mudança de filtro.

Modelo didático: a hipótese de 10⁸ operações por segundo e os exemplos de Fibonacci e caixeiro viajante vêm dos slides. O PI não tem benchmark nem medição instrumentada; as estimativas servem para argumentar, não para afirmar números do sistema.

## Teste de mesa

Suponha três algoritmos com T(n) = n, T(n) = n log₂ n e T(n) = n², em uma CPU de 10⁸ operações por segundo.

| n | n operações | n log₂ n | n² | Tempo linear | Tempo n² |
| --- | --- | --- | --- | --- | --- |
| 1.000 | 1.000 | 10.000 | 10⁶ | 0,00001 s | 0,01 s |
| 2.000 | 2.000 | 22.000 | 4×10⁶ | 0,00002 s | 0,04 s |
| 4.000 | 4.000 | 48.000 | 16×10⁶ | 0,00004 s | 0,16 s |

Dobrar n dobra o tempo linear, multiplica por pouco mais de dois o n log n e quadruplica o quadrático. É esse fator que estoura o orçamento de tempo quando o volume cresce.

## Pergunta de defesa

**Se a tela pagina de dez em dez, por que ela ainda pode ficar lenta?**

Porque a paginação limita o que é transferido, não o que é lido. O `COUNT(*)` roda sobre o mesmo filtro de quatro `LIKE` com curinga à esquerda, e curinga à esquerda impede o uso de índice de prefixo, então o banco varre a tabela. Com muitos atiradores, cada página custa uma varredura completa, e o custo cresce linearmente com o cadastro. A correção seria indexar os campos realmente consultados ou trocar a busca textual por uma estratégia de prefixo.

## Exercício

Um algoritmo exponencial faz 2ⁿ operações. Com 10⁸ operações por segundo, quanto tempo ele leva para n = 50? Expresse em dias.

<details><summary>Ver resposta</summary>

2⁵⁰ = 1.125.899.906.842.624 operações. Dividindo por 10⁸, dá 11.258.999 segundos, ou cerca de 130 dias. O cálculo mostra por que força bruta exponencial é inviável mesmo com n aparentemente pequeno.

</details>
