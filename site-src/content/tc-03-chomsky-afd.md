---
slug: tc-03-chomsky-afd
title: "Hierarquia de Chomsky e autômatos finitos"
summary: "Quatro níveis, quatro tipos de memória e uma consequência prática: escolher o modelo mais restrito que ainda resolve o problema. O AFD é o primeiro deles, definido por uma quíntupla e por uma transição única para cada par estado-símbolo."
pages: "pp. 2–19"
pdf: "aula3_1.pdf — Hierarquia de Chomsky e Autômatos Finitos"
objectives:
  - "Relacionar os quatro níveis da hierarquia ao tipo de memória que cada máquina oferece."
  - "Justificar por que a análise de código-fonte é dividida em léxica (Nível 3) e sintática (Nível 2)."
  - "Descrever um AFD pela quíntupla Q, Σ, δ, q₀, F e simular sua execução símbolo a símbolo."
  - "Explicar a diferença entre AFD e AFN e por que a construção de subconjuntos preserva a linguagem."
evidence:
  - kind: code
    source: "regitro_livros.cs · linhas 341–347"
    text: "As 30 gavetas de 1A a 6E formam uma linguagem finita; qualquer linguagem finita é regular e pode ser reconhecida por um AFD."
  - kind: code
    source: "regitro_livros.cs · linha 91 e banco.sql · livros.codigo_livro"
    text: "O código nasce de \"LIV\" + Random().Next(100, 999) e é gravado em varchar(10) sem teste de pertinência: nada no sistema reconhece a linguagem LIV###."
  - kind: model
    source: "aula3_1.pdf pp. 9–14"
    text: "O AFD de oito estados que reconhece LIV seguido de três dígitos é construção didática, não código do PI."
  - kind: future
    source: "aula3_1.pdf pp. 17–19"
    text: "A cadeia ER → AFN → AFD → código é o desenho de um analisador léxico; o PI não tem compilador nem analisador."
quiz:
  - q: "Qual máquina corresponde ao Nível 2 da hierarquia de Chomsky?"
    options: ["Autômato finito determinístico", "Autômato de pilha", "Autômato linearmente limitado", "Máquina de Turing"]
    answer: 1
    explain: "O Nível 2 reúne as linguagens livres de contexto, reconhecidas pelo autômato de pilha, que acrescenta memória LIFO ao autômato finito."
  - q: "Em um AFD, o valor de δ(q, a) é:"
    options: ["Um conjunto de estados possíveis.", "Um único estado de destino.", "Um par (estado, símbolo).", "Indefinido quando não há transição."]
    answer: 1
    explain: "Determinismo significa exatamente um destino para cada par estado-símbolo. Sem destino previsto, o autômato está incompleto."
  - q: "Por que a análise léxica fica no Nível 3 e a sintática no Nível 2?"
    options: ["Porque a léxica é mais rápida de executar.", "Porque tokens são padrões sem aninhamento, enquanto a sintaxe exige contar e parear estruturas.", "Porque a sintática não pode ser feita por máquina.", "Porque o Nível 3 não aceita expressões regulares."]
    answer: 1
    explain: "O autômato finito não conta. Identificar int ou while é regular; validar blocos aninhados exige pilha, isto é, Nível 2."
  - q: "O que a construção de subconjuntos garante?"
    options: ["Que o AFN passa a ter menos estados que o AFD.", "Que existe um AFD equivalente, com até 2^n estados.", "Que a linguagem deixa de ser regular.", "Que o autômato passa a aceitar cadeias infinitas."]
    answer: 1
    explain: "Cada conjunto de estados do AFN vira um estado do AFD. O limite é 2^n, e depois se eliminam os estados inalcançáveis."
---

Toda vez que o formulário impede a digitação de uma gaveta inexistente, ele está aplicando, sem dizer o nome, uma restrição de linguagem. A aula 3 organiza essas restrições em quatro níveis e mostra que cada nível corresponde a uma quantidade diferente de memória. A escolha do nível não é acadêmica: ela determina se a validação pode ser feita por um autômato de estados, por uma pilha ou por uma fita.

## Tipos 3/2/1/0 e as quatro classes de linguagens

Em 1956, Noam Chomsky propôs uma classificação formal das linguagens. A hierarquia correlaciona a restrição matemática das regras de formação com a capacidade de memória exigida para reconhecê-las. Quanto menor o índice, maior o poder computacional — e menor a garantia de que a máquina pare.

| Nível | Linguagem | Máquina | Memória | Exemplo |
| --- | --- | --- | --- | --- |
| 3 | Regular | Autômato finito | Nenhuma | `^LIV[0-9]{3}$` |
| 2 | Livre de contexto | Autômato de pilha | Pilha LIFO | parênteses balanceados |
| 1 | Sensível ao contexto | Autômato linearmente limitado | Fita proporcional à entrada | aⁿbⁿcⁿ |
| 0 | Recursivamente enumerável | Máquina de Turing | Fita infinita | programas em geral |

O nível 3 não conta nem pareia estruturas: só transita entre estados. O nível 2 ganha a pilha e resolve aninhamento, mas não dependências contextuais. O nível 1 avalia vizinhança e limita o espaço de trabalho ao tamanho da entrada. O nível 0 não impõe limite de espaço e define o teto do que é computável.

## AFD/AFN, AP, LBA e MT: memória e trade-offs

O trade-off aparece na prova de terminação. A Máquina de Turing reconhece os padrões de todos os níveis anteriores, mas decidir se uma execução qualquer termina é justamente o problema indecidível da aula 1. Quanto mais poder se pede ao modelo, mais caro fica garantir que ele para.

Daí a regra de projeto: mapear o problema e usar o modelo mais restrito capaz de processar a linguagem identificada. Um AFD termina sempre, porque consome a entrada uma vez. Um autômato de pilha pode ser verificado por análise sintática. Uma Máquina de Turing exige argumento de terminação separado — ou aceitação de que ele não existe.

## AFD como quíntupla Q, Σ, δ, q₀, F; determinismo e aceitação

O autômato finito determinístico é uma máquina de estados sem memória auxiliar. Formalmente, M = (Q, Σ, δ, q₀, F): Q é o conjunto finito de estados; Σ é o alfabeto de entrada; δ : Q × Σ → Q é a função de transição; q₀ ∈ Q é o estado inicial; F ⊆ Q é o conjunto de aceitação. Símbolo fora de Σ causa parada e rejeição.

O determinismo é a exigência de que, para cada par (estado, símbolo), exista exatamente um destino. Não há escolha nem indefinição. A cadeia é aceita se a leitura completa termina em estado de F.

Para reconhecer LIV seguido de três dígitos, um AFD didático usa oito estados: q₀ inicial; q₁ após L; q₂ após LI; q₃ após LIV; q₄, q₅ e q₆ após um, dois e três dígitos; q₇ como estado de erro. F = {q₆}. A tabela resume δ para os símbolos que importam:

| Estado | Lê L | Lê I | Lê V | Lê dígito | Lê outro |
| --- | --- | --- | --- | --- | --- |
| q₀ | q₁ | q₇ | q₇ | q₇ | q₇ |
| q₁ | q₇ | q₂ | q₇ | q₇ | q₇ |
| q₂ | q₇ | q₇ | q₃ | q₇ | q₇ |
| q₃ | q₇ | q₇ | q₇ | q₄ | q₇ |
| q₄ | q₇ | q₇ | q₇ | q₅ | q₇ |
| q₅ | q₇ | q₇ | q₇ | q₆ | q₇ |
| q₆ | q₇ | q₇ | q₇ | q₇ | q₇ |
| q₇ | q₇ | q₇ | q₇ | q₇ | q₇ |

O erro comum é desenhar o autômato só com o caminho feliz. Sem q₇, a leitura de um símbolo inesperado fica sem destino definido, e a implementação precisa inventar um comportamento — normalmente uma exceção em tempo de execução. Totalizar δ é o que garante que a máquina sempre saiba o que fazer.

## AFN, caminhos paralelos, transições ε e equivalência AFD/AFN

O autômato finito não determinístico relaxa três coisas: permite várias transições com o mesmo símbolo, permite ausência de transição e permite transição vazia ε, que muda de estado sem consumir entrada. A assinatura vira δ : Q × (Σ ∪ {ε}) → P(Q), com o conjunto das partes no contradomínio.

A aceitação é existencial: basta um caminho terminar em F. O AFN não executa nada em paralelo de verdade; ele descreve um conjunto de possibilidades que o AFD simula carregando o conjunto de estados alcançáveis. A construção de subconjuntos gera até 2ⁿ estados para n estados do AFN, e depois se eliminam os inalcançáveis. O custo é exponencial no papel, mas o resultado é um AFD equivalente — e o determinismo é o que o hardware executa.

## Regex e análise léxica em compiladores

O compilador não usa a expressão regular diretamente na execução. A cadeia é: expressão regular descreve o padrão; um gerador constrói um AFN com transições ε para as concatenações; a construção de subconjuntos produz um AFD; o AFD é traduzido para código ou tabela. Na fase léxica, esse autômato identifica `int`, `while` e nomes de variáveis — padrões curtos, sem aninhamento.

O limite aparece na etapa seguinte. Chaves e parênteses exigem contagem, e o Nível 3 não conta. Por isso a sintaxe vai para o Nível 2. É a resposta para a questão de síntese da aula: dividir a análise não é organização didática, é consequência matemática da hierarquia.

## No Projeto Integrador

Confirmado no código: a gaveta é uma lista fixa de trinta valores, e o código é gerado por concatenação com `Random().Next(100, 999)`. O `banco.sql` aceita qualquer `varchar(10)` em `codigo_livro`, então um código fora do padrão — “LIV”, “liv123”, “12345” — entraria sem resistência se outro caminho de gravação existisse.

Modelo didático: o AFD de oito estados, a quíntupla e a construção de subconjuntos. Ementa/proposta: um analisador léxico para a ficha de importação, com expressão regular convertida em autômato. O PI não tem compilador, login, OCR, API pública nem banco em nuvem; o MySQL é local.

## Teste de mesa

Percorra o AFD com a cadeia “LIV123”. Em q₀, lê L e vai a q₁. Lê I, vai a q₂. Lê V, vai a q₃. Lê 1, vai a q₄. Lê 2, vai a q₅. Lê 3, vai a q₆. A entrada termina em q₆ ∈ F: aceita.

Agora “LIV12”: após L, I, V, 1 e 2, a máquina está em q₅ e a entrada acaba. q₅ não pertence a F, então a cadeia é rejeitada — faltou um dígito. Para “LIV1234”, a leitura do quarto dígito leva de q₆ a q₇, o estado de erro, e a rejeição é imediata: o autômato reconhece exatamente três dígitos, não “pelo menos três”.

## Pergunta de defesa

**“Por que validar o código com um autômato e não com um `if` de tamanho?”**

Porque o `if` verifica comprimento, não estrutura: “LIVABC” tem seis caracteres e passaria. O autômato verifica pertinência à linguagem símbolo por símbolo, com custo linear no tamanho da entrada e sem memória auxiliar. Além disso, a mesma construção serve para a gaveta e para qualquer padrão regular da ficha. O `if` de tamanho é uma aproximação; o autômato é a especificação.

## Exercício

Explique por que a linguagem das cadeias com a mesma quantidade de `(` e `)` não é regular, e indique o modelo mínimo da hierarquia que a reconhece.

<details><summary>Ver resposta</summary>

Um autômato finito tem um número fixo de estados e não guarda contagem. Para aceitar n aberturas seguidas de n fechamentos, ele precisaria distinguir arbitrariamente muitos n, e com |Q| estados dois valores diferentes de n cairiam no mesmo estado — o autômato aceitaria uma cadeia desbalanceada. A demonstração formal usa o lema do bombeamento. O modelo mínimo é o autômato de pilha, no Nível 2, que empilha um marcador a cada abertura e desempilha a cada fechamento, aceitando se a pilha terminar vazia.

</details>
