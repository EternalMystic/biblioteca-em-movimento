---
slug: tc-05-computabilidade
title: "Computabilidade e a Máquina de Turing"
summary: "Computar é mapear entradas em saídas por um procedimento que sempre para. Quando a pilha não basta — como em aⁿbⁿcⁿ —, a fita infinita da Máquina de Turing resolve por marcação, e a tese de Church-Turing fixa esse modelo como régua do que é computável."
pages: "pp. 2–19"
pdf: "aula5.pdf — Computabilidade e a Máquina de Turing"
objectives:
  - "Descrever um problema computacional como função f : D → C e distinguir decisão de avaliação."
  - "Definir função computável pelas duas exigências: passos finitos e parada com o valor correto."
  - "Explicar por que a pilha falha em aⁿbⁿcⁿ e o que o autômato linearmente limitado acrescenta."
  - "Simular a marcação de aabbcc por uma Máquina de Turing e comparar o modelo ao AFD."
evidence:
  - kind: code
    source: "FormDevolucao.cs · linhas 544–547"
    text: "CalcularDiasAtraso é Math.Max(0, (devolucao.Date - vencimento.Date).Days): função total, com domínio de pares de datas e contradomínio nos inteiros não negativos."
  - kind: code
    source: "Form2.cs · linhas 40–60"
    text: "A busca pagina com LIMIT @offset, @limite e faz uma consulta COUNT(*) separada; cada consulta é um mapeamento de filtro para conjunto de linhas."
  - kind: model
    source: "aula5.pdf pp. 16–19"
    text: "A Máquina de Turing que valida aabbcc por marcações X, Y e Z é modelo didático, não rotina do sistema."
  - kind: future
    source: "aula5.pdf pp. 6–9"
    text: "Provar equivalência entre versões do módulo de devolução exigiria decidir um problema indecidível; a prática usa testes, não prova automática."
quiz:
  - q: "Uma função é computável quando existe procedimento que:"
    options: ["Resolve a maioria das entradas rapidamente.", "Executa em passos finitos, para e devolve o valor exato para toda entrada.", "Usa memória limitada pela entrada.", "Pode ser escrito em qualquer linguagem."]
    answer: 1
    explain: "As duas exigências são independentes: terminar sempre e devolver o valor correto. Um procedimento que às vezes entra em laço não calcula a função."
  - q: "Por que o autômato de pilha falha em aⁿbⁿcⁿ?"
    options: ["Porque não lê o símbolo c.", "Porque, ao desempilhar os a's para parear com os b's, perde a referência para comparar os c's.", "Porque a pilha é infinita.", "Porque a entrada tem três símbolos."]
    answer: 1
    explain: "A política LIFO destrói o histórico. Quando os c's chegam, a pilha está vazia e não há como comparar o terceiro grupo."
  - q: "O que caracteriza o autômato linearmente limitado?"
    options: ["Fita infinita em ambas as direções.", "Espaço de rascunho proporcional ao tamanho da entrada.", "Ausência de estados finais.", "Leitura apenas para a direita."]
    answer: 1
    explain: "O LBA tem cabeçote móvel, mas o espaço disponível é limitado pelo comprimento da cadeia de entrada."
  - q: "Quando uma Máquina de Turing encerra a execução?"
    options: ["Ao consumir o último símbolo da entrada.", "Ao atingir um estado explícito de aceitação ou rejeição.", "Quando a fita fica toda em branco.", "Depois de um número fixo de passos."]
    answer: 1
    explain: "A parada é por estado, não por fim de fita. Sem transição prevista ou em ciclo, a máquina simplesmente não para."
---

Um inventário da biblioteca é uma sequência de conferências: cada gaveta, cada código, cada ficha. Se o roteiro pede que três listas batam entre si — o que está na estante, o que o banco diz e o que o caderno registra —, o conferente precisa contar três vezes e comparar. A aula 5 formaliza por que esse tipo de conferência tripla escapa da pilha e exige um modelo com memória reescrevível.

## Computação como mapeamento entrada–saída

Na engenharia, computar não é operar transistores; é o mapeamento matemático entre conjuntos de dados. Um problema computacional se escreve como f : D → C, com D sendo todas as instâncias possíveis e C as soluções esperadas. A consulta por gaveta, por exemplo, leva uma etiqueta de localização a um conjunto de obras — e é esse mapeamento, não o laço que o implementa, que define o problema.

Essa mudança de ponto de vista é o que permite falar de limites. Enquanto o objeto é o código, a pergunta é “como fazer”; quando o objeto é a função, a pergunta é “existe procedimento que a calcule para toda entrada?”.

## Problemas de decisão × avaliação de funções; funções computáveis

Problemas de decisão exigem resposta binária: a máquina consome a entrada e atinge aceitação ou rejeição. Problemas de avaliação exigem transformação de dados: a máquina processa, encerra e deixa o resultado legível na memória. Validar se uma gaveta pertence à lista é decisão; calcular os dias de atraso é avaliação.

Uma função é computável se existe procedimento mecânico que, para qualquer entrada, executa em número finito de passos, para e devolve o valor exato. As duas exigências são independentes: um procedimento pode calcular corretamente quando para e nunca parar em outras entradas. Resolver uma instância isolada não resolve o problema — a solução vale para todo o domínio, que costuma ser infinito.

## Indecidibilidade e tese de Church–Turing

Se para certa função se prova que nenhum procedimento garante parada em todas as entradas, a função é não computável. Isso não depende de CPU ou RAM: é limite da lógica. Até 1936 não havia definição formal de algoritmo; Church, com o cálculo lambda, e Turing, com a máquina, chegaram à mesma classe.

A tese de Church-Turing postula que todo problema resolvível por método mecânico e finito é resolvido por uma Máquina de Turing. Ela funciona como régua: se a máquina não resolve, nenhuma linguagem ou hardware resolve. No PI, a consequência é saber o que não prometer — comparar duas versões do sistema e garantir equivalência total não é tarefa automatizável.

## Limite da pilha em aⁿbⁿcⁿ; sensíveis ao contexto e LBA

O autômato de pilha pareia aberturas e fechamentos, mas a política LIFO tem falha estrutural: para ler o fundo, é preciso desempilhar tudo. Em aⁿbⁿcⁿ, a máquina empilha os a's, desempilha ao ler os b's e, quando os c's chegam, a pilha está vazia e a referência de contagem foi destruída. Não há como comparar o terceiro grupo com os dois primeiros.

O Nível 1 contorna isso com o autômato linearmente limitado: cabeçote móvel nos dois sentidos e espaço de rascunho proporcional ao tamanho da entrada. As regras passam a depender do contexto — símbolos vizinhos —, o que permite dependências que a pilha não expressa. O preço é que a garantia de terminação fica mais difícil: com fita limitada, o número de configurações é finito, mas cresce rápido.

## Nível 0, fita sem limite, cabeçote lê/escreve/desloca

O Nível 0 remove as duas restrições: não há limite de espaço nem disciplina de acesso. A Máquina de Turing opera sobre fita infinita, com controle finito e cabeçote que, em cada transição, faz três coisas ao mesmo tempo: muda de estado, grava um símbolo na célula atual e desloca o cabeçote um passo para a esquerda ou para a direita.

| Aspecto | AFD | Máquina de Turing |
| --- | --- | --- |
| Memória | Nenhuma | Fita infinita, leitura e escrita |
| Movimento | Só para a direita, consumo único | Esquerda e direita, livre |
| Parada | Ao consumir o último símbolo | Só em estado explícito de parada |
| Gravação | Inexistente | Sobrescreve qualquer célula |

A parada por estado, e não por fim de entrada, é o que permite laços e revisitas — e também o que cria a possibilidade de não parar.

## Comparação AFD–MT, marcação e teste de mesa aabbcc

A Máquina de Turing valida igualdade sem contadores: usa marcações físicas na fita. O algoritmo lê o primeiro a e grava X, avança até o primeiro b e grava Y, avança até o primeiro c e grava Z, retrocede até o último X e recomeça. Quando não há mais a, uma varredura final confirma que restaram apenas marcadores.

O custo é quadrático no número de trios: cada ciclo atravessa a fita inteira, e há n ciclos. O AFD não faz isso porque não tem onde marcar; o autômato de pilha não faz porque perderia a contagem ao desempilhar.

## No Projeto Integrador

Confirmado no código: `CalcularDiasAtraso` é função total sobre pares de datas, com truncamento em zero; a busca de empréstimos pagina com `LIMIT` e faz `COUNT(*)` separado, o que significa duas passagens pelo conjunto filtrado. Nada no sistema conta três grupos dependentes nem precisa de fita.

Modelo didático: a Máquina de Turing de aⁿbⁿcⁿ, as marcações X, Y e Z e o quadro AFD–MT. Ementa/proposta: usar um modelo de fita para descrever a rotina de inventário em três vias, com conferência entre listas. O PI usa MySQL local; não há login, OCR, API pública nem banco em nuvem.

## Teste de mesa

Fita inicial: a a b b c c, cabeçote no primeiro a.

1. Grava X no primeiro a e avança à direita ignorando a. Fita: X a b b c c.
2. Grava Y no primeiro b e avança ignorando b. Fita: X a Y b c c.
3. Grava Z no primeiro c e recua até o último X. Fita: X a Y b Z c.
4. Avança um passo e repete: grava X no a, Y no b, Z no c. Fita: X X Y Y Z Z.
5. Recua, procura novo a, encontra Y: os a's acabaram.
6. Varre à direita: só marcadores até o branco. Aceita.

Se faltasse um c — a a b b c —, o passo 3 não encontraria c e a transição não teria destino previsto, levando à rejeição.

## Pergunta de defesa

**“Por que a Máquina de Turing e não o autômato de pilha para validar três listas iguais?”**

Porque a pilha só guarda o histórico em ordem inversa e o destrói ao desempilhar. Comparar três grupos exige voltar à fita e reler o que já foi marcado, e isso só a fita bidirecional com escrita permite. A Máquina de Turing paga em tempo — cada ciclo varre a fita inteira —, mas ganha em poder de expressão. No PI, a conferência de inventário é feita por consultas e comparações em memória, que é a versão prática da mesma ideia.

## Exercício

Explique por que o algoritmo de marcação continua correto se a cadeia tiver zero trios (cadeia vazia) e o que ele deve fazer nesse caso.

<details><summary>Ver resposta</summary>

Com a fita vazia, o primeiro passo não encontra a para marcar. A máquina precisa de uma transição específica para o branco no estado inicial: se a célula já é branca, ela passa direto à varredura final, que também não encontra marcadores e atinge qaceita. A cadeia vazia pertence a aⁿbⁿcⁿ com n = 0, e o algoritmo correto precisa aceitá-la. Se essa transição não existir, a máquina fica sem destino e o comportamento passa a depender da implementação — o mesmo erro de totalização discutido no AFD.

</details>
