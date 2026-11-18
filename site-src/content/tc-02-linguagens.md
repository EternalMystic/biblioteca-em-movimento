---
slug: tc-02-linguagens
title: "Linguagens formais e expressões regulares"
summary: "Alfabeto, cadeia e linguagem dão o vocabulário mínimo para descrever o que o sistema aceita. As expressões regulares escrevem esses conjuntos de forma finita, e três desafios práticos mostram onde elas acertam e onde param."
pages: "pp. 2–29"
pdf: "aula2.pdf — Nivelamento e Fundamentos de Linguagens Formais"
objectives:
  - "Reescrever uma pilha como TAD formal, com conjunto de estados S e alfabeto E, antes de pensar em vetores e ponteiros."
  - "Ler as assinaturas Push : S × E → S e Pop : S → S × E identificando domínio e contradomínio."
  - "Definir alfabeto, cadeia, comprimento, cadeia vazia e linguagem, e classificar exemplos finitos e infinitos."
  - "Construir expressões regulares com união, concatenação e fecho de Kleene e explicar por que elas reconhecem exatamente as linguagens regulares."
evidence:
  - kind: code
    source: "regitro_livros.cs · linhas 341–347"
    text: "A gaveta é montada por dois laços sobre fileiras {\"1\"..\"6\"} e colunas {\"A\"..\"E\"}, gerando as 30 etiquetas de 1A a 6E — uma linguagem finita embutida no formulário."
  - kind: code
    source: "regitro_livros.cs · linha 91"
    text: "O código é gerado por concatenação de \"LIV\" com Random().Next(100, 999); não há expressão regular nem teste de pertinência antes de gravar."
  - kind: model
    source: "aula2.pdf pp. 27–29"
    text: "As expressões ^[01]*00$, ([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2}) e (Error|Failed).*port \\d+ são exercícios de sala no RegExr, não código do PI."
  - kind: future
    source: "aula2.pdf pp. 24–26"
    text: "Validar o padrão LIV### com regex no cadastro é proposta de melhoria: hoje a coluna aceita qualquer texto de até 10 caracteres."
quiz:
  - q: "Qual é o comprimento da cadeia vazia ε?"
    options: ["0", "1", "Depende do alfabeto", "Indefinido"]
    answer: 0
    explain: "A cadeia vazia não contém símbolos, então |ε| = 0. Ela pertence a A* por definição do fecho de Kleene."
  - q: "Qual assinatura corresponde à operação de desempilhar?"
    options: ["Push : S × E → S", "Pop : S → S × E", "Pop : S × E → S", "Push : E → S × E"]
    answer: 1
    explain: "O pop recebe apenas o estado atual e devolve um par: o estado anterior e o elemento removido do topo."
  - q: "A expressão 0*1, sobre Σ = {0, 1}, aceita a cadeia “1”?"
    options: ["Sim, porque 0* pode casar com zero símbolos.", "Não, porque falta pelo menos um zero antes do 1.", "Não, porque a estrela exige repetição.", "Somente se a cadeia tiver comprimento par."]
    answer: 0
    explain: "O fecho de Kleene inclui a repetição zero vezes. Ler a estrela como “uma ou mais” é o erro mais comum do assunto."
  - q: "Por que ^[01]*00$ precisa das âncoras de início e fim?"
    options: ["Para permitir que o motor use índices.", "Sem elas, o padrão casaria com qualquer cadeia que contenha “00” no meio.", "Para aceitar a cadeia vazia.", "Para tornar a expressão uma linguagem livre de contexto."]
    answer: 1
    explain: "Sem ^ e $, o motor encontra “00” dentro de “1001” e aprova uma cadeia que não termina em duplo zero."
---

O formulário de cadastro oferece uma lista fechada de gavetas: 1A, 1B, até 6E. Quem observa o sistema vê um combo; quem observa a teoria vê uma linguagem finita, com trinta cadeias, imposta pela interface. A aula 2 constrói o vocabulário que permite dizer isso com precisão — alfabeto, cadeia, linguagem — e a notação que descreve padrões de forma compacta.

Antes disso, há um desvio deliberado pela pilha, para treinar a tradução de uma estrutura conhecida para a linguagem dos conjuntos e funções.

## Algoritmo formal finito e inequívoco; TAD formal e estado da pilha S

Algoritmo, aqui, é procedimento formal, finito e não ambíguo, executável em princípio por uma Máquina de Turing. Um `for` que percorre as trinta gavetas é algoritmo; “escolha uma gaveta adequada” não é, porque deixa a decisão em aberto.

O Tipo Abstrato de Dados apaga o hardware. Define-se S como o conjunto de todos os estados possíveis da pilha — s₀ para a vazia, s₁ para “um elemento no topo” — e E como o conjunto de elementos válidos, o alfabeto da pilha. O erro comum é começar pelo código: quem não define S e E acaba com métodos que aceitam desempilhar do vazio.

## Produto cartesiano, função/domínio/contradomínio; push e pop

O produto cartesiano S × E forma pares ordenados. A função transforma esse par em resultado, e a seta separa o que a máquina exige do que ela devolve.

`Push : S × E → S` e `Pop : S → S × E`. `Push(s₀, x) = s₁` diz que, no estado vazio com o elemento x, a máquina passa ao estado que tem x no topo. `Pop(s₁) = (s₀, x)` diz que ela volta ao estado anterior e devolve o elemento. O pop devolve um par porque informa duas coisas: novo estado e dado extraído.

| Operação | Assinatura | Entrada exigida | Saída produzida |
| --- | --- | --- | --- |
| Push | S × E → S | Estado atual e elemento | Novo estado com o elemento no topo |
| Pop | S → S × E | Apenas o estado atual | Estado anterior e elemento removido |

O pop não se aplica ao estado vazio, porque não há elemento a devolver. Retornar `null` ou zero inventa um valor fora de E; em produção, isso vira exceção ou verificação explícita.

## Teste de mesa e ponte para autômato de pilha

Com E = {x, y}, partindo de s₀: `Push(s₀, x) = s₁`; `Push(s₁, y) = s₂`, com y no topo e x abaixo; `Pop(s₂) = (s₁, y)` devolve y; `Pop(s₁) = (s₀, x)` devolve x e esvazia. Quatro transições, nenhum acesso ao fundo sem remover o topo.

É essa observação que faz a ponte. O computador não sabe o que é uma pilha física; entende transições de estado. Acoplando a pilha a um autômato finito, obtém-se o autômato de pilha, modelo do Nível 2 e base da análise sintática. O limite é estrutural: ler o fundo exige destruir o topo.

## Alfabeto Σ, cadeias, comprimento, ε e linguagens

Alfabeto é conjunto finito e não vazio de símbolos indivisíveis: Σ₁ = {0, 1}, Σ₂ = {a, …, z}. Cadeia é sequência finita de símbolos de Σ; |w| conta os símbolos; ε é a cadeia vazia, de comprimento zero. Linguagem é qualquer conjunto de cadeias sobre Σ, finito ou infinito, com pertinência definida por regra clara.

L₁ = {0, 10, 11} é finita; L₂ = {w | w possui número par de 1s} é infinita, e a pertinência se decide pela paridade: 0101 ∈ L₂, 0111 ∉ L₂. No PI, a lista de gavetas é uma linguagem finita de trinta cadeias, enquanto a coluna `codigo_livro` aceita qualquer texto de até dez caracteres. Essa assimetria entre interface restrita e coluna permissiva é o que a noção de linguagem torna visível.

## ER, união, concatenação, fecho de Kleene e exemplos binários

Expressão regular é a notação algébrica das linguagens regulares, construída com união (A ∪ B), concatenação (A ◦ B) e fecho de Kleene (A*), que repete zero ou mais vezes e sempre inclui ε.

Com Σ = {0, 1}, `0*10*` descreve as cadeias com exatamente um 1; `(0 ∪ 1)*` descreve todas as binárias, inclusive a vazia; `1(0 ∪ 1)*0` descreve as que começam com 1 e terminam com 0.

| Operação | Notação | Efeito sobre o conjunto | Exemplo |
| --- | --- | --- | --- |
| União | A ∪ B | Pertence a A ou a B | {0} ∪ {11} = {0, 11} |
| Concatenação | A ◦ B | Cadeia de A seguida de B | {0, 1}{0} = {00, 10} |
| Fecho de Kleene | A* | Zero ou mais repetições | {0}* = {ε, 0, 00, …} |

O erro frequente é ler a estrela como “uma ou mais”. Ela inclui a cadeia vazia, e isso muda o conjunto: `0*1` aceita “1”, porque `0*` pode ser vazio.

## Equivalência ER–autômato, motores regex e RegExr

A validação em tempo de execução é feita por autômatos finitos. Um teorema garante que toda expressão regular se converte em autômato finito e vice-versa; a expressão é a notação, o autômato é o mecanismo que lê símbolo por símbolo sem voltar atrás.

Motores reais, como o PCRE, oferecem atalhos sintáticos, mas o poder nos bastidores continua restrito às linguagens regulares — com a ressalva de que retroreferências e recursão de grupo extrapolam esse modelo. O RegExr serve de bancada: expressão em cima, texto embaixo, destaque em tempo real, o que mostra rapidamente quando uma expressão “quase certa” aceita o caso errado.

## Três desafios de regex: 00, MAC e logs Error/Failed com porta

O primeiro desafio valida log de catraca que termina em “00”: `^[01]*00$`, com âncoras para não aceitar subcadeia no meio. O segundo extrai endereço MAC, seis blocos hexadecimais separados por dois pontos: `([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})`. O terceiro filtra erro crítico e porta: `(Error|Failed).*port \d+`, onde a união aparece como o “ou” do padrão.

Nenhum desses padrões está no PI. O sistema não usa expressões regulares: a busca em `Form2.cs` usa `LIKE '%…%'` no SQL, e o cadastro valida apenas “título não vazio”. Os desafios são modelo didático; a proposta natural é aplicar `^LIV\d{3}$` ao código e `^[1-6][A-E]$` à gaveta, com mensagem antes do INSERT.

## No Projeto Integrador

Confirmado no código: a gaveta vem de dois laços aninhados sobre seis fileiras e cinco colunas, produzindo trinta opções e um item inicial “Selecione uma gaveta…”. O código é “LIV” mais inteiro aleatório entre 100 e 998. O `banco.sql` declara `codigo_livro varchar(10)` e `gaveta varchar(50)`, sem restrição de formato.

Modelo didático: as três expressões, o alfabeto da gaveta e a linguagem dos códigos válidos. Ementa/proposta: levar a validação por regex ao formulário e à importação de fichas. O sistema usa MySQL local; não há login, OCR, API pública nem banco em nuvem.

## Teste de mesa

Avalie `^[01]*00$`. “10100”: as âncoras prendem início e fim, `[01]*` consome “101” e o par final fecha — aceita. “00”: a estrela casa com zero símbolos e o par fecha — aceita. “1001”: termina em “01”, o par final não casa — rejeita. “111”: não há “00” no fim — rejeita. “010100”: a estrela consome “0101” e o par fecha — aceita.

Sem as âncoras, o motor encontraria “00” no meio de “1001” e aprovaria uma cadeia inválida. A âncora é o que separa “contém o padrão” de “é o padrão”.

## Pergunta de defesa

**“Por que a gaveta é um problema de linguagem formal e não apenas uma caixa de texto?”**

Porque a localização física só tem trinta valores possíveis, e esse conjunto cabe numa expressão regular simples. Com campo livre, o banco aceitaria “3C”, “3c”, “gaveta 3” e “C3”, e toda consulta por localização passaria a exigir normalização. A interface resolve o problema oferecendo apenas cadeias da linguagem, o que é mais barato do que corrigir depois. O mesmo raciocínio vale para o código da obra, hoje gerado sem verificação.

## Exercício

Escreva a expressão regular que descreve exatamente as trinta gavetas e explique por que `^[A-E][1-6]$` está errada.

<details><summary>Ver resposta</summary>

`^[1-6][A-E]$`: fileira de 1 a 6 seguida de coluna de A a E, sem espaços. Aceita 6 × 5 = 30 cadeias, as mesmas geradas pelos dois laços do formulário. `^[A-E][1-6]$` inverte a ordem e descreve outro conjunto: aceitaria “A3” e rejeitaria “3A”. Falta ainda decidir se minúsculas são normalizadas antes da comparação, o que pede `^[1-6][A-Ea-e]$` ou conversão prévia.

</details>
