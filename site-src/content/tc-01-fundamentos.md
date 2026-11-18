---
slug: tc-01-fundamentos
title: "Teoria da Computação: o papel do engenheiro"
summary: "Antes de otimizar, é preciso saber se o problema tem solução mecânica. A aula separa as perguntas “a máquina consegue?” e “a que custo?” e mostra por que o Problema da Parada fecha a primeira porta."
pages: "pp. 2–21"
pdf: "aula1.pdf — Teoria da Computação e Complexidade de Algoritmos"
objectives:
  - "Situar a disciplina entre Paradigmas (o como) e Estrutura de Dados (o onde): aqui se estuda o limite e o custo."
  - "Reconhecer um algoritmo formal — finito, inequívoco e executável por Máquina de Turing — e distingui-lo de uma receita."
  - "Descrever os quatro componentes do semestre e o modelo computacional associado a cada um."
  - "Explicar, sem formalismo completo, por que o Problema da Parada é indecidível e o que isso impede na prática."
evidence:
  - kind: code
    source: "regitro_livros.cs · linhas 640–643"
    text: "A única validação da ficha é o título: string.IsNullOrWhiteSpace(txtTitulo.Text) exibe “Por favor, informe o Título da Obra” e interrompe o salvamento."
  - kind: code
    source: "regitro_livros.cs · linha 91"
    text: "O código da obra nasce como “LIV” + new Random().Next(100, 999), sem verificação de duplicidade antes do INSERT."
  - kind: model
    source: "aula1.pdf pp. 16–21"
    text: "O argumento do “Testador” e do programa que faz o oposto é um modelo didático de contradição, não código do sistema."
  - kind: future
    source: "aula1.pdf pp. 5–8 (ementa, CA3/CA4)"
    text: "Máquina de Registradores (Norma), Máquina de Post, funções de Kleene e PCP constam da ementa como estudo introdutório; não há implementação no PI."
quiz:
  - q: "Qual pergunta a Teoria da Computação acrescenta ao que já foi visto em Paradigmas e Estrutura de Dados?"
    options: ["Como escrever o código na linguagem correta.", "Onde guardar os dados na memória física.", "Se o problema tem solução mecânica e qual o custo dessa solução.", "Qual framework oferece o melhor desempenho."]
    answer: 2
    explain: "Paradigmas trata do “como” e Estrutura de Dados do “onde”. A disciplina aqui trata do limite (existe procedimento?) e do custo (quantas operações?)."
  - q: "O que o Problema da Parada demonstra?"
    options: ["Que computadores são lentos para certos programas.", "Que não existe procedimento que decida, para todo programa e entrada, se a execução para.", "Que todo programa entra em laço infinito em alguma entrada.", "Que a fita da Máquina de Turing é finita."]
    answer: 1
    explain: "A prova mostra que um auditor universal levaria a contradição. Ela não afirma que todo programa é imprevisível: para classes restritas, a parada é decidível."
  - q: "No cadastro de obras do PI, o que é verificado antes do INSERT?"
    options: ["O formato do código com expressão regular.", "Se a gaveta pertence à lista de 1A a 6E.", "Apenas se o título não está vazio.", "Se o código gerado já existe no banco."]
    answer: 2
    explain: "A única validação é string.IsNullOrWhiteSpace(txtTitulo.Text). Código, gaveta e duplicidade não são testados antes da gravação."
  - q: "Por que a existência do Problema da Parada não torna inútil a análise de código?"
    options: ["Porque o auditor universal existe, apenas é lento.", "Porque a parada é decidível para classes restritas de programas.", "Porque a inteligência artificial resolve o problema.", "Porque a fita infinita elimina o laço."]
    answer: 1
    explain: "O resultado é sobre o caso universal. Restringindo a classe de programas, a análise estática volta a ser possível e é o que as ferramentas comerciais fazem."
---

Quando o sistema da biblioteca grava o código LIV123 na gaveta 3C, três perguntas ficam escondidas atrás do clique em “Salvar”: o procedimento termina sempre, quanto ele custa e se existe algum procedimento que responda isso para qualquer entrada. A Teoria da Computação responde as três, e a ordem importa — não faz sentido otimizar um problema que nenhuma máquina resolve.

O fio condutor do semestre é esse deslocamento de foco. Em Paradigmas de Programação o assunto era o “como” falar com a máquina; em Estrutura de Dados, o “onde” guardar a informação. Aqui o objeto é o limite e o custo: provar se a máquina resolve o problema e qual o preço exato da execução.

## Papel do engenheiro; fundamento, TAD e pseudolinguagens (CA1)

O engenheiro não aceita o código gerado sem medi-lo. Um programa que funciona para a ficha de um livro pode não funcionar para dez mil fichas importadas, e a diferença não está no acerto lógico, mas na cobertura dos casos e no custo. Por isso a disciplina redefine algoritmo: procedimento formal, finito, não ambíguo e executável em princípio por uma Máquina de Turing. A linguagem — C#, Python ou pseudocódigo — é detalhe.

O segundo apoio é o Tipo Abstrato de Dados, que descreve valores e operações pelo comportamento, sem fixar a representação. A ficha do acervo é um TAD: campos (código, título, ano, gaveta, prazo) e operações de inserir, consultar e alterar. O erro comum aqui é confundir “funciona no meu teste” com “está correto”: validar apenas o título aceita ano negativo, gaveta vazia e código repetido.

## Máquinas com pilha e Turing padrão/multifita (CA2)

O autômato de pilha acrescenta ao autômato finito uma memória LIFO, em que só o topo é acessível. A Máquina de Turing troca essa restrição por uma fita ilimitada com cabeçote que lê, escreve e anda nos dois sentidos. A diferença não é de velocidade, é de classe de problemas reconhecíveis.

A variante multifita engana. Com fitas e cabeçotes independentes, o engenheiro modela variáveis simultâneas com conforto e reduz o tempo, mas qualquer máquina com k fitas é simulada por uma de fita única: a simulação intercala os conteúdos com marcadores e paga em tempo, não em poder. Mais fitas não ampliam o conjunto de problemas solúveis.

| Componente | Pergunta central | Modelo associado | Efeito no PI |
| --- | --- | --- | --- |
| CA1 | O que é algoritmo e o que é TAD? | Pseudolinguagem, conjuntos, funções | Especificar a ficha antes de programar |
| CA2 | Como a máquina processa informação? | Pilha, MT padrão e multifita | Entender o custo de varrer o acervo |
| CA3 | Que outros modelos têm o mesmo poder? | Norma, Post, cálculo lambda | Confiar na análise independente da linguagem |
| CA4 | O que a máquina nunca resolverá? | Kleene, decidibilidade, Parada | Saber onde a automação para |

## Máquina de Registradores (Norma), Máquina de Post e hipótese de Church (CA3)

Bloco de ementa: nada dele está implementado no sistema da biblioteca. A Máquina de Registradores, na formulação de Norma, guarda naturais em registradores e oferece apenas incrementar, decrementar e testar zero. A Máquina de Post opera sobre cadeias, acrescentando e removendo símbolos nas extremidades. Nenhuma tem fita infinita nem pilha, e ambas alcançam o poder da Máquina de Turing.

Essa coincidência é o conteúdo da Hipótese de Church: cálculo lambda, máquina de Turing e funções recursivas definem a mesma classe de funções computáveis. A tese não se demonstra por enumeração — “procedimento mecânico” não é conceito matemático fechado —, mas se sustenta por não ter sido refutada. Consequência prática: o `while` do C# e o salto condicional de Norma são a mesma coisa vista de dois ângulos.

## Funções recursivas de Kleene, decidibilidade e Parada (CA4)

Também de ementa. Kleene constrói a computabilidade a partir de composição, recursão primitiva e minimização. As duas primeiras geram funções totais, definidas para toda entrada; a minimização — “o menor n tal que a condição valha” — produz funções parciais, que podem não devolver valor algum. Aí nasce a diferença entre calcular e calcular sempre.

Decidir é mais forte que calcular. Um problema de decisão é decidível quando existe procedimento que, para qualquer entrada, para e responde sim ou não. Se pode entrar em laço em algumas entradas, ele no máximo reconhece a linguagem. A distinção reaparece na aula 7, quando a pergunta passa de “existe algoritmo?” para “quanto custa?”.

## Limites da IA, linguagem natural ambígua e indecidibilidade

Um prompt não é linguagem formal: carrega ambiguidade e contexto implícito, e o modelo não compreende o pedido — calcula a probabilidade do próximo token. A alucinação é o nome cotidiano desse mecanismo, uma saída plausível e não verificada.

O campo “Descrição / Observações da Obra” mostra o problema em escala pequena. O sistema guarda o texto, mas não valida o significado; nenhuma rotina confere se a descrição corresponde ao livro. Valida-se estrutura, não sentido — e traduzir ambiguidade em regras estritas é o que evita o colapso.

## Equivalência geral de programas e PCP (ementa)

Dois resultados fecham o repertório. Não existe algoritmo genérico que decida se dois programas fazem a mesma coisa em todas as entradas, e o Problema da Correspondência de Post — um quebra-cabeça de dominós de palavras — é indecidível na forma geral.

No PI isso tem tradução direta: afirmar que a versão antiga e a nova de `FormDevolucao.cs` são idênticas em todos os casos é pretensão que nenhum teste sustenta. A engenharia responde com testes, revisão e monitoramento — aproximações de uma pergunta indecidível.

## Problema da Parada e ideia da contradição; custo de tempo/memória

O roteiro da contradição é curto e vale acompanhar passo a passo.

1. Suponha um Testador que, recebendo o código de um programa e uma entrada, responda “para” ou “não para” sem executar o alvo.
2. Construa o Paradoxo: ele consulta o Testador sobre si mesmo e faz o contrário.
3. Se a previsão for “para”, o Paradoxo entra em laço; se for “não para”, ele encerra.
4. Aplicado a si próprio, o Testador erra nos dois ramos; logo, não existe.

A prova não diz que todo programa é imprevisível nem que análise de código é inútil: para classes restritas, a parada é decidível. O que não existe é o auditor universal. Fechada essa porta, sobra a pergunta do custo.

## No Projeto Integrador

Confirmado no código: o cadastro valida somente o título, com `string.IsNullOrWhiteSpace(txtTitulo.Text)` seguido de mensagem e `return`; a gaveta é lista fixa de 1A a 6E montada por dois laços; o código é “LIV” mais inteiro aleatório entre 100 e 998, sem consulta ao banco. O `banco.sql` limita `codigo_livro` a `varchar(10)` e define `prazo_padrao_dias` com padrão 7.

Modelo didático: a Máquina de Turing de aⁿbⁿcⁿ, o Testador e o Paradoxo, o quadro dos CAs. Ementa/proposta: Norma, Post, Kleene, equivalência de programas e PCP. O banco é MySQL local; não há login, OCR, API pública nem banco em nuvem, e nada disso deve ser apresentado como existente.

## Teste de mesa

P1 recebe n e executa `enquanto n != 0: n = n - 1`. P2 recebe n e executa `enquanto n != 1: n = n + 2`. Para P1 com n = 3, o Testador simula três decrementos e responde “para”. Para P2 com n = 3, responde “não para”, pois a condição nunca é satisfeita.

Aplicado ao Paradoxo, o teste não termina com valor: se a resposta é “para”, o programa entra em laço e não para; se é “não para”, ele encerra e para. As duas previsões são falsas: a hipótese inicial não se sustenta.

## Pergunta de defesa

**“Por que estudar limites de computação em um sistema de biblioteca?”**

Porque a primeira decisão de projeto não é escolher tecnologia, é saber se o problema tem solução mecânica e a que custo. O cadastro é decidível e barato: validação, inserção e consulta terminam sempre. Já “as duas versões do módulo de devolução se comportam igual em todos os casos?” é indecidível, e o sistema não deve prometer isso. Reconhecer a fronteira evita vender automação como garantia e orienta o uso de testes onde a prova exata não existe.

## Exercício

Classifique como decidível ou indecidível e justifique em uma frase: (a) verificar se uma cadeia tem o formato LIV seguido de três dígitos; (b) dizer, dado o código de um programa, se ele para para toda entrada; (c) calcular os dias de atraso entre vencimento e devolução.

<details><summary>Ver resposta</summary>

(a) Decidível: é reconhecimento de linguagem regular, resolvido por autômato finito em tempo proporcional ao comprimento. O sistema não faz essa verificação — apenas gera o código.

(b) Indecidível: é o Problema da Parada na forma universal.

(c) Decidível e de custo constante: duas datas subtraídas, com negativos truncados em zero, como em `Math.Max(0, (devolucao.Date - vencimento.Date).Days)`.

</details>
