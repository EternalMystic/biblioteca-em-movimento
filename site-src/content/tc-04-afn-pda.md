---
slug: tc-04-afn-pda
title: "Do não-determinismo à memória estruturada"
summary: "O AFN facilita o desenho, mas não aumenta o poder da máquina: a construção de subconjuntos devolve um AFD equivalente. Quando o problema exige contar e descontar aninhamento, entra a pilha e nasce o autômato de pilha."
pages: "pp. 2–15"
pdf: "aula4.pdf — Do Não-Determinismo à Memória Estruturada"
objectives:
  - "Totalizar um AFD com estado de erro e explicar por que todo par estado-símbolo precisa de destino."
  - "Aplicar a construção de subconjuntos com fecho-ε e eliminar estados inalcançáveis."
  - "Justificar o limite da análise léxica diante de blocos aninhados."
  - "Descrever a sêxtupla do autômato de pilha e simular push e pop no balanceamento de delimitadores."
evidence:
  - kind: code
    source: "Form2.cs · linhas 40–60"
    text: "A cláusula WHERE é montada por concatenação, com parênteses em volta do bloco de busca: (l.titulo LIKE @busca OR a.nome_guerra LIKE @busca OR e.status LIKE @busca). O aninhamento é escrito à mão, não validado por parser."
  - kind: code
    source: "regitro_livros.cs · linhas 341–347"
    text: "A lista de gavetas é gerada por dois laços aninhados — fileiras dentro de colunas —, o caso mais simples de aninhamento no código do PI."
  - kind: model
    source: "aula4.pdf pp. 11–15"
    text: "O autômato de pilha que valida (n)n e o traço com [A[T]B] são construções didáticas sobre a sêxtupla M = (Q, Σ, Γ, δ, q₀, F)."
  - kind: future
    source: "aula4.pdf pp. 8–11"
    text: "Uma gramática livre de contexto para a ficha de importação, com AST, é proposta de evolução; o sistema lê campos de formulário, não texto estruturado."
quiz:
  - q: "Como um AFN aceita uma cadeia?"
    options: ["Se todos os caminhos chegarem a um estado final.", "Se ao menos um caminho chegar a um estado final após consumir toda a entrada.", "Se o caminho mais curto não passar por estado de erro.", "Se a pilha terminar vazia."]
    answer: 1
    explain: "A aceitação é existencial. A rejeição é que exige que todos os caminhos falhem."
  - q: "Para que serve o fecho-ε na conversão de AFN para AFD?"
    options: ["Para eliminar estados finais.", "Para incluir os estados alcançáveis sem consumir símbolos.", "Para contar o número de caminhos.", "Para transformar o autômato em Máquina de Turing."]
    answer: 1
    explain: "Transições vazias não consomem entrada e podem ser tomadas de graça, então entram no conjunto antes de cada passo."
  - q: "Por que um AFD não valida parênteses aninhados em qualquer profundidade?"
    options: ["Porque não tem alfabeto suficiente.", "Porque não possui contador nem memória auxiliar.", "Porque não pode ter estados finais.", "Porque a entrada é lida da direita para a esquerda."]
    answer: 1
    explain: "Com |Q| estados, o autômato distingue no máximo |Q| níveis. Para qualquer profundidade é preciso uma pilha."
  - q: "Na sêxtupla do autômato de pilha, o que é Γ?"
    options: ["O alfabeto da fita de entrada.", "O alfabeto da pilha.", "O conjunto de estados finais.", "A função de transição."]
    answer: 1
    explain: "Γ reúne os símbolos permitidos na pilha, que podem ser diferentes dos símbolos lidos na entrada."
---

O formulário do PI monta consultas SQL concatenando texto, e em um ponto precisa de parênteses: o bloco de busca tem três condições ligadas por OR e deve ser avaliado como um conjunto, não misturado ao filtro de status. Quem escreveu aquela linha resolveu um problema de aninhamento. A aula 4 mostra por que esse tipo de problema escapa do autômato finito e exige uma memória com disciplina de pilha.

## AFD completo e estado de erro

Um AFD de projeto precisa de destino para todo par (estado, símbolo). Quando o desenho deixa lacunas, a implementação real inventa um comportamento — e quase sempre inventa errado. A solução é explícita: um estado de erro, também chamado de poço ou buraco negro, que recebe todas as transições não previstas e nunca sai dele.

Totalizar δ custa estados e clareza, mas compra uma propriedade valiosa: a máquina nunca fica indefinida. Em termos de código, é a diferença entre uma tabela de transição completa e uma cadeia de `if` que pode cair no `else` sem tratamento. O erro comum é totalizar só o caminho de sucesso e descobrir a lacuna em produção, com uma exceção de índice ou um valor nulo.

## AFN: transições múltiplas, ausentes e vazias; aceitação existencial

O autômato finito não determinístico nasce para simplificar o desenho. Ele permite três flexibilizações: várias transições para o mesmo símbolo, ausência de transição para certos símbolos (caminhos mortos) e transições ε, que mudam de estado sem consumir entrada. Desenhar o “caminho feliz” em um AFN é muito mais rápido do que prever todas as falhas em um AFD.

A aceitação é existencial: a palavra é aceita se ao menos um caminho chega a um estado final após consumir toda a entrada, e só é rejeitada se todos os caminhos falham. Isso não é execução paralela real; é uma descrição compacta de um conjunto de possibilidades.

## Construção dos subconjuntos com fecho-ε e eliminação de inalcançáveis

A conversão para AFD trata cada conjunto de estados do AFN como um único estado. Se n estados existem, o AFD pode ter até 2ⁿ. O fecho-ε entra antes de cada passo: a partir de um conjunto, acrescentam-se todos os estados alcançáveis por transições vazias, porque elas não consomem entrada e podem ser tomadas “de graça”.

O procedimento é mecânico: começa pelo fecho-ε de {q₀}; para cada símbolo, calcula o fecho-ε dos destinos; repete até não surgir conjunto novo. Ao final, elimina-se o que não é alcançável a partir do inicial, o que costuma reduzir bastante a tabela. O erro frequente é esquecer o fecho-ε na primeira linha, gerando um AFD que rejeita cadeias que o AFN aceita.

## Limite da análise léxica e aninhamento

O Nível 3 encerra seu escopo nos autômatos finitos e nas expressões regulares. Na arquitetura de compiladores, ele faz a análise léxica: reconhece padrões curtos como `int`, `while` ou nomes de variáveis. O problema aparece quando a linguagem tem blocos aninhados: é preciso garantir que chaves e parênteses sejam abertos e fechados na ordem e na quantidade corretas.

Um autômato finito não tem contador. Ele pode aceitar até k níveis de aninhamento com k estados, mas não “qualquer número”. Por isso a sintaxe muda de nível. O mesmo raciocínio vale para o PI: a consulta com um par de parênteses é simples, mas uma expressão gerada dinamicamente com vários níveis exigiria validação estrutural, não concatenação de strings.

## Linguagens e gramáticas livres de contexto; análise sintática e AST

No Nível 2, a linguagem é gerada por gramática livre de contexto, uma quádrupla G = (V, Σ, P, S), em que V são os não terminais, Σ os terminais, P as produções e S o símbolo inicial. As produções têm a forma A → α, com um único não terminal à esquerda — é essa restrição que dá o nome “livre de contexto” e permite derivar árvores.

A análise sintática consome os tokens da fase léxica e verifica se existe derivação. O resultado é a Árvore de Sintaxe Abstrata, que preserva a estrutura e descarta detalhes como parênteses redundantes. É a AST que permite avaliar precedência: em `2 + 3 * 4`, a árvore decide a ordem, não a leitura da esquerda para a direita.

## Autômato de pilha, LIFO, push/pop e balanceamento de parênteses

O autômato de pilha herda estados e transições do autômato finito e acrescenta uma fita com política LIFO. A formalização passa da quíntupla à sêxtupla M = (Q, Σ, Γ, δ, q₀, F), com Γ como alfabeto da pilha. A transição passa a considerar três informações e pode devolver um conjunto de pares:

δ : Q × (Σ ∪ {ε}) × (Γ ∪ {ε}) → P(Q × (Γ ∪ {ε}))

| Estado | Entrada | Topo | Novo estado | Escreve no topo |
| --- | --- | --- | --- | --- |
| q₀ | `[` | Z ou vazio | q₀ | X (push) |
| q₀ | `]` | X | q₀ | ε (pop) |
| q₀ | fim | Z | q₁ | Z (aceita) |
| q₀ | `]` | Z | q₂ | Z (rejeita) |

A linguagem L = {(ⁿ)ⁿ | n ≥ 0} mostra o mecanismo. Cada abertura empilha um marcador; cada fechamento desempilha. Se a entrada termina e a pilha está vazia, o balanceamento está correto. Se sobra marcador, falta fechar; se aparece fechamento com pilha vazia, sobra fechamento.

## No Projeto Integrador

Confirmado no código: a busca em `Form2.cs` monta a cláusula com parênteses explícitos em volta das três condições `LIKE`, e a lista de gavetas é produzida por dois laços aninhados. Não há parser, nem validação de expressão, nem AST: o aninhamento existe apenas como texto escrito por quem programou.

Modelo didático: a sêxtupla, a tabela de transição do autômato de pilha e o traço de `[A[T]B]`. Ementa/proposta: uma gramática para a ficha de importação, com árvore sintática, que permitiria ler um arquivo de fichas em vez de preencher campos. O sistema usa MySQL local; não há login, OCR, API pública nem banco em nuvem.

## Teste de mesa

Valide `[A[T]B]` com pilha inicial vazia, tratando `[` e `]` como delimitadores e A, T, B como conteúdo ignorado.

1. Lê `[`: push. Pilha: [X].
2. Lê A: símbolo de conteúdo, nenhuma operação. Pilha: [X].
3. Lê `[`: push. Pilha: [X, X].
4. Lê T: conteúdo. Pilha: [X, X].
5. Lê `]`: pop. Pilha: [X].
6. Lê B: conteúdo. Pilha: [X].
7. Lê `]`: pop. Pilha: vazia.
8. Fim da entrada com pilha vazia: aceita.

Se a cadeia fosse `[A[T]B`, o passo 7 não existiria e restaria um X na pilha ao fim da leitura — rejeitada. O teste também revela o custo: cada símbolo é lido uma vez, mas o acesso ao fundo exigiria desempilhar tudo.

## Pergunta de defesa

**“Por que não validar a consulta SQL com um autômato finito?”**

Porque a consulta tem aninhamento e o autômato finito não conta. Um AFD aceitaria um número fixo de níveis, não qualquer número, e a diferença só aparece quando o texto cresce. Além disso, validar estrutura não resolve o problema principal da concatenação, que é a injeção de trecho malicioso: a solução correta é parametrizar a consulta, como o código já faz com `@busca`. A teoria explica o limite; a prática recomenda não construir a consulta por texto.

## Exercício

Acrescente à tabela do autômato de pilha a transição que rejeita o fechamento sem abertura e explique por que ela precisa existir mesmo que a cadeia “pareça” válida no fim.

<details><summary>Ver resposta</summary>

A transição é (q₀, `]`, Z) → (q₂, Z), com q₂ fora de F: lê fechamento com pilha vazia e vai para o estado de rejeição, sem alterar a pilha. Ela é necessária porque, sem ela, a leitura de `]` no estado inicial ficaria indefinida, e a implementação poderia simplesmente ignorar o símbolo. Cadeias como `]` ou `][` seguidas de `[` terminariam com pilha vazia e seriam aceitas por engano. A rejeição explícita fecha o caminho inválido no momento em que ele ocorre, e não depois.

</details>
