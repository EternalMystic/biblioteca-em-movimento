---
slug: tc-06-turing
title: "A Máquina de Turing em detalhe"
summary: "A sétupla fixa estados, alfabetos, transição e os dois estados de parada. Sobre essa base, a máquina marca aⁿbⁿcⁿ, ganha fitas extras sem ganhar poder e chega à Máquina Universal, origem do programa armazenado."
pages: "pp. 2–19"
pdf: "aula6.pdf — A Máquina de Turing"
objectives:
  - "Ler a sétupla M = (Q, Σ, Γ, δ, q₀, qaceita, qrejeita) e explicar o papel do símbolo branco."
  - "Simular a marcação de aabbcc identificando estado, símbolo lido, símbolo gravado e direção."
  - "Justificar por que fitas adicionais e não-determinismo não alteram a classe de problemas."
  - "Relacionar a Máquina Universal ao programa armazenado e à completude de Turing das linguagens comerciais."
evidence:
  - kind: code
    source: "Form1.cs e Form2.cs · conexão MySQL"
    text: "A aplicação é um programa C# executado por um processador genérico: o comportamento do sistema está no código carregado, não no hardware — a versão prática da Máquina Universal."
  - kind: code
    source: "banco.sql · emprestimos e devolucoes"
    text: "As tabelas guardam dados e estado (status, dias_atraso), mas não instruções; o programa está nos arquivos .cs compilados."
  - kind: model
    source: "aula6.pdf pp. 2–9"
    text: "A sétupla e a máquina que marca aabbcc com X, Y e Z são construções didáticas; o PI não implementa Máquina de Turing."
  - kind: future
    source: "aula6.pdf pp. 12–16"
    text: "A noção de programa armazenado explica a arquitetura do PI, mas não é funcionalidade do sistema; é leitura teórica do que já existe."
quiz:
  - q: "Por que Γ é diferente de Σ na sétupla da Máquina de Turing?"
    options: ["Porque Σ inclui o símbolo branco.", "Porque Γ inclui Σ, os símbolos auxiliares de marcação e o branco.", "Porque Γ é sempre binário.", "Porque Σ é o alfabeto da fita."]
    answer: 1
    explain: "Σ é o alfabeto da palavra de entrada; Γ é o alfabeto completo da fita, com marcas como X, Y, Z e o branco."
  - q: "O que acontece ao acrescentar fitas a uma Máquina de Turing?"
    options: ["Aumenta a classe de problemas reconhecíveis.", "Reduz o tempo de processamento, mas não altera a classe.", "Elimina a necessidade de estados finais.", "Permite decidir o Problema da Parada."]
    answer: 1
    explain: "O teorema da equivalência mostra que k fitas são simuladas por uma fita única, com custo maior de tempo."
  - q: "A Máquina de Turing Universal recebe na fita:"
    options: ["Apenas a cadeia de entrada.", "A descrição codificada de uma máquina M e a entrada w.", "Somente o estado inicial.", "O resultado já calculado."]
    answer: 1
    explain: "É essa separação entre descrição e dados que origina o conceito de programa armazenado e a arquitetura de von Neumann."
  - q: "Uma linguagem é Turing-completa quando:"
    options: ["Tem tipagem forte e orientação a objetos.", "Tem controle de fluxo e memória arbitrária, podendo simular uma Máquina Universal.", "Compila para código nativo.", "Executa em tempo polinomial."]
    answer: 1
    explain: "As duas exigências bastam: decisão e salto simulam o controle finito; memória expansível simula a fita."
---

O sistema da biblioteca não muda de hardware quando passa do cadastro para a devolução. O mesmo executável, rodando na mesma máquina, assume comportamentos diferentes conforme o código que foi carregado. Essa separação entre máquina e programa tem origem matemática precisa, e a aula 6 a constrói a partir da definição formal da Máquina de Turing.

## Sétupla, fita e branco, transições e aceitação/rejeição/loop

A Máquina de Turing é definida por sete componentes: M = (Q, Σ, Γ, δ, q₀, qaceita, qrejeita). Q é o conjunto finito de estados; Σ é o alfabeto de entrada, sem o branco; Γ é o alfabeto da fita, que contém Σ, os símbolos auxiliares de marcação e o branco ⊔; q₀ é o estado inicial; qaceita e qrejeita são estados finais mutuamente exclusivos.

| Componente | Papel | Exemplo em aⁿbⁿcⁿ |
| --- | --- | --- |
| Q | Estados do controle finito | leitura, busca de b, busca de c, retorno |
| Σ | Entrada original | {a, b, c} |
| Γ | Fita, com marcas e branco | {a, b, c, X, Y, Z, ⊔} |
| δ | Regra de transição | Q × Γ → Q × Γ × {L, R} |
| q₀ | Início | cabeçote no primeiro símbolo |
| qaceita | Parada com aceitação | varredura final chegou ao branco |
| qrejeita | Parada com rejeição | falta um c |

A fita começa com a cadeia nas primeiras células e brancos em todo o resto. A transição δ : Q × Γ → Q × Γ × {L, R} lê o estado e o símbolo sob o cabeçote e devolve novo estado, símbolo a gravar e direção. A máquina só para em qaceita ou qrejeita; se a configuração não tiver transição prevista ou levar a um ciclo, ela não para.

## aⁿbⁿcⁿ por marcação

O problema pede quantidades iguais de três símbolos. Modelos com pilha falham porque perdem a referência depois de parear os dois primeiros grupos. A Máquina de Turing usa a fita como caderno: substitui um a por X, avança até o primeiro b e grava Y, avança até o primeiro c e grava Z, retrocede até o último X e repete.

Cada ciclo consome exatamente um trio, e a ordem das marcas registra o que já foi conferido. A varredura final confirma que não sobrou letra sem marcar. O custo é o número de ciclos vezes o comprimento da fita — quadrático —, mas o resultado não depende de contador numérico.

## Multifita com cabeçotes independentes e equivalência com fita única

Com duas ou mais fitas e cabeçotes independentes, o engenheiro modela variáveis simultâneas com muito mais conforto: uma fita para a entrada, outra para o rascunho, outra para o resultado. O tempo cai, porque não é preciso caminhar até o fim da fita para anotar algo.

O teorema da equivalência garante que qualquer máquina com k fitas é simulada por uma de fita única. A simulação reserva faixas na fita e usa marcadores para indicar a posição de cada cabeçote; cada passo original vira uma varredura. O ganho é de tempo, não de classe: nenhum problema novo se torna solúvel.

## MT não determinística e simulação determinística

A MT não determinística admite várias transições para a mesma leitura, ou seja, vários caminhos simultâneos. Como no par AFN–AFD, o não-determinismo não altera o limite matemático: toda MTND tem uma MT determinística equivalente que a simula, por busca em largura na árvore de configurações.

A vantagem é de modelagem. Desenhar “escolha o próximo a não marcado” é muito mais simples do que descrever a varredura exata. O custo aparece na simulação, que pode ser exponencial em tempo. O erro comum é confundir facilidade de descrição com poder extra.

## Do hardware dedicado à MT universal; programa armazenado

Nas máquinas vistas até aqui, δ é fixa. Uma máquina projetada para reconhecer palíndromos não serve para balancear parênteses; trocar de problema exigia construir outra máquina. Foi o cenário dos primeiros computadores, programados reconectando cabos, em que o algoritmo era literalmente o hardware.

A Máquina Universal de Turing muda isso ao tratar a tabela de regras como dado. Sua fita recebe dois blocos: a descrição codificada de uma máquina M e a entrada w. A máquina U lê as regras e simula M sobre w. Colocar instruções na fita é a gênese matemática do software, e a arquitetura de von Neumann adota a mesma ideia ao unificar dados e instruções na memória.

## Comparação com computador moderno; completude de Turing; quadro de modelos

A CPU é a máquina universal: hardware genérico que não sabe calcular atraso nem renderizar tela. O aplicativo é a máquina M, traduzida em instruções e carregada na memória. Uma linguagem atinge a completude de Turing quando tem controle de fluxo e memória arbitrária — duas exigências que C#, Python, Java e Assembly cumprem.

| Característica | AFD | AFN | Autômato de pilha | Máquina de Turing |
| --- | --- | --- | --- | --- |
| Nível de Chomsky | 3 | 3 | 2 | 0 |
| Memória | Nenhuma | Nenhuma | Pilha LIFO | Fita infinita |
| Cabeçote | Só à direita | Só à direita | Só à direita | Bidirecional |
| Gravação | Não | Não | Só no topo | Apaga e reescreve |
| Uso típico | Análise léxica | Conversão para AFD | Análise sintática | Hardware de uso geral |

A consequência matemática da completude é dura: toda linguagem Turing-completa sofre do Problema da Parada, e nenhum analisador garante, antes da execução, que o código termina.

## No Projeto Integrador

Confirmado no código: a aplicação é um programa C# com janelas e acesso a MySQL local; o comportamento está nos arquivos `.cs`, e o banco guarda dados e estados como `status` e `dias_atraso`. Não há instruções armazenadas nas tabelas.

Modelo didático: a sétupla, a tabela de transição e a máquina que marca aabbcc. Ementa/proposta: descrever formalmente uma rotina do PI como Máquina de Turing para medir seu custo em passos. O sistema não tem login, OCR, API pública nem banco em nuvem.

## Teste de mesa

Configuração inicial: fita `a a b b c c ⊔`, cabeçote no primeiro a, estado q₀.

1. (q₀, a) → (q₁, X, R). Fita: X a b b c c.
2. (q₁, a) → (q₁, a, R); (q₁, b) → (q₂, Y, R). Fita: X a Y b c c.
3. (q₂, b) → (q₂, b, R); (q₂, c) → (q₃, Z, L). Fita: X a Y b Z c.
4. (q₃, b) → (q₃, b, L); (q₃, Y) → (q₃, Y, L); (q₃, a) → (q₃, a, L); (q₃, X) → (q₀, X, R).
5. Ciclo 2: (q₀, a) → (q₁, X, R); (q₁, Y) → (q₁, Y, R); (q₁, b) → (q₂, Y, R); (q₂, Z) → (q₂, Z, R); (q₂, c) → (q₃, Z, L). Fita: X X Y Y Z Z.
6. Retorno, leitura de Y em q₀: não há mais a. Varredura final até ⊔ em qaceita.

O ponto delicado é o passo 6: a máquina precisa de transição para “achei Y onde esperava a”, e essa transição é o que separa aceitação de laço infinito.

## Pergunta de defesa

**“Se a Máquina de Turing é tão simples, por que ela representa qualquer computador?”**

Porque a tese de Church-Turing identifica nela o limite do que é mecanicamente calculável, e porque a Máquina Universal mostra que uma máquina fixa pode simular qualquer outra quando recebe a descrição do programa na fita. O computador moderno é essa máquina com engenharia de desempenho: mais rápida, com hierarquia de memória, mas sem poder além. As linguagens comerciais são Turing-completas, o que também significa que carregam o Problema da Parada.

## Exercício

Explique por que a máquina de aⁿbⁿcⁿ precisa gravar X, Y e Z em vez de apagar os símbolos lidos.

<details><summary>Ver resposta</summary>

Apagar perderia a informação de quantos trios já foram conferidos e de onde a varredura deve parar. As marcas funcionam como memória externa: X indica posições já processadas de a, Y e Z fazem o mesmo para b e c, e a varredura final verifica que só restaram marcas. Se os símbolos fossem apagados para branco, a fita ficaria indistinguível de espaço não usado, e a máquina não conseguiria decidir se terminou ou se ainda há símbolo por marcar. A marcação troca um contador — que a fita não tem — por símbolos distintos no alfabeto Γ.

</details>
