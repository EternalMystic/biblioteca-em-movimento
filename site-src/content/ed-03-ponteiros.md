---
slug: ed-03-ponteiros
title: Gerenciamento dinâmico e ponteiros
summary: Endereço e valor, operadores & e *, passagem por valor, struct com seta, sizeof, malloc, calloc, realloc, free e o cuidado com ponteiros pendentes.
pages: "pp. 2–8"
pdf: "aula3.pdf — Gerenciamento Dinâmico e Estruturas"
objectives:
  - Ler e escrever o endereço de uma variável, distinguindo endereço de valor.
  - Explicar por que passar ponteiro simula passagem por referência em C.
  - Dimensionar struct com sizeof e acessar campos por seta.
  - Escolher entre malloc, calloc e realloc, verificando NULL e liberando com free.
  - Reconhecer ponteiro pendente e o padrão seguro de realocação.
evidence:
  - kind: code
    source: "Form4.cs · CarregarDadosBanco, linhas 480–490"
    text: "O byte[] da foto é copiado para um MemoryStream descartado com using antes de virar Image no cache."
  - kind: code
    source: "Form4.cs · linhas 461–462"
    text: "O cache percorre as imagens e chama Dispose em cada uma antes de limpar o dicionário."
  - kind: model
    source: "aula3.pdf pp. 2–8"
    text: "Os exemplos de malloc, realloc e ponteiro pendente são em C; o PI é C# gerenciado e não usa unsafe."
quiz:
  - q: "O que a expressão *p faz quando p é um ponteiro válido?"
    options:
      - "Acessa o conteúdo armazenado no endereço guardado em p"
      - "Devolve o endereço da variável p"
      - "Cria uma cópia da variável apontada na pilha"
      - "Libera a memória apontada por p"
    answer: 0
    explain: "O operador de indireção lê o endereço e busca o valor nele. Endereço de p é &p; cópia não é criada; liberação é free."
  - q: "Qual é a diferença entre malloc e calloc?"
    options:
      - "calloc zera os bytes alocados; malloc deixa o conteúdo indefinido"
      - "malloc zera os bytes; calloc deixa lixo de memória"
      - "calloc aloca na pilha e malloc no heap"
      - "malloc recebe dois parâmetros e calloc apenas um"
    answer: 0
    explain: "calloc recebe quantidade e tamanho e inicializa com zero; malloc recebe bytes e não inicializa. Ambos alocam no heap."
  - q: "Por que o padrão seguro de realloc usa uma variável temporária?"
    options:
      - "Porque realloc pode devolver NULL e o ponteiro original continua válido"
      - "Porque realloc sempre move o bloco para outro endereço"
      - "Porque o compilador exige duas variáveis na chamada"
      - "Porque a memória antiga é liberada automaticamente"
    answer: 0
    explain: "Se realloc falhar, devolve NULL e o bloco antigo permanece; sobrescrever o ponteiro perderia a referência e vazaria memória."
---

Um livro do acervo tem código, título, gaveta e uma foto do exemplar. Guardar isso em memória exige decidir onde os bytes ficam e quem os libera. Esta aula trata do nível mais baixo dessa decisão: endereço, indireção e alocação sob demanda, o vocabulário que sustenta listas, pilhas e árvores nas próximas aulas.

## Endereço virtual; endereço × valor; & e *

Cada variável ocupa uma região endereçável durante a execução, e o endereço observado é virtual: o sistema operacional traduz para o físico. O valor guardado é uma coisa; a coordenada onde ele mora é outra. O operador `&` obtém a coordenada, como em `printf("%p", (void*)&x)`.

Um ponteiro é uma variável que guarda endereço. Com `int x = 10; int *p = &x;`, escrever `*p = 20;` manda o processador ao endereço de `x` e altera o valor lá. O erro comum é confundir `p` com `*p`: o primeiro é a coordenada, o segundo é o conteúdo.

## Passagem por valor em C e alteração via ponteiro

C passa tudo por valor. Ao chamar `alterar(&numero)`, a função recebe uma cópia do endereço, mas usa esse endereço para escrever no objeto original. O efeito prático é o de passagem por referência, sem que a linguagem tenha esse mecanismo.

Sem o `&` na chamada, a função altera apenas a cópia local e o valor original permanece. Esse é o erro mais frequente em provas e em código real: a assinatura pede ponteiro, o chamador esquece o endereço e o compilador reclama ou, pior, o programa compila com conversão implícita indevida.

## struct, -> e sizeof

Uma `struct` agrupa campos e dá um único tipo ao conjunto. Quando existe ponteiro para a struct, o acesso usa seta: `p->matricula` equivale a `(*p).matricula`. É açúcar sintático, mas deixa claro que se está navegando por endereço.

`sizeof` devolve o tamanho em bytes do tipo, incluindo padding de alinhamento. Uma struct com `int` e `char[50]` costuma ocupar 56 bytes em vez de 54, porque o compilador alinha a estrutura. Esse detalhe importa ao calcular quantos nós cabem em um bloco alocado.

## malloc, calloc, realloc, free e checagem de NULL

`malloc` reserva bytes no heap e devolve o endereço inicial, ou NULL se falhar; verificar NULL é obrigatório. `calloc` reserva e zera, útil quando o vetor precisa começar em estado conhecido. `realloc` muda o tamanho de um bloco, podendo movê-lo. `free` devolve o bloco ao sistema.

Depois de liberar, atribuir NULL ao ponteiro evita reutilização acidental. O padrão completo é: pedir, testar NULL, usar, liberar, anular. Pular a checagem de NULL produz falha de segmentação longe da causa, o que torna o diagnóstico caro.

## Variáveis temporárias na realocação e ponteiros pendentes

`realloc` pode devolver um endereço diferente do original. Se o programador escreve `p = realloc(p, novo);` e a chamada falha, `p` vira NULL e o bloco antigo fica inacessível: vazamento. O padrão seguro guarda o retorno em `temp` e só atualiza `p` quando `temp` não é NULL.

Ponteiro pendente é o inverso: a memória foi liberada e alguém continua usando o endereço. Em C, o comportamento é indefinido; em C#, referências gerenciadas evitam o caso, mas recursos nativos exigem descarte explícito, como no cache de imagens do projeto.

```csharp
using var ms = new MemoryStream(bytes);
_cacheImagens[num] = Image.FromStream(ms);
```

Esse trecho, de Form4.cs, mostra o equivalente gerenciado do pedido de memória: os bytes vêm do banco, passam por um `MemoryStream` descartado automaticamente ao fim do bloco e viram um `Image` guardado no dicionário. O `using` é o `free` determinístico do stream; a imagem, por ser recurso GDI+, continua exigindo `Dispose` na limpeza do cache.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local, sem login, e abre direto no painel. Não existe `unsafe`, aritmética de ponteiro nem `malloc` no código revisado: a alocação é feita com `new`, e o runtime cuida do heap gerenciado.

Confirmado no código: `Form4.cs` declara `Dictionary<string, Image>` e, ao recarregar, percorre os valores chamando `Dispose` antes de `Clear`; o `MemoryStream` da foto é criado em `using`. Esses dois pontos são o cuidado de liberação que a aula ensina em C.

Modelo didático: `&`, `*`, `->`, `sizeof` e as três funções de alocação vêm dos slides em C. O PI não permite observar endereços nem provocar ponteiro pendente, então os traços desta aula são de laboratório, não do sistema entregue.

## Teste de mesa

Realocação de um vetor de inteiros de 4 para 8 posições, com `int` de 4 bytes.

| Passo | Operação | Estado |
| --- | --- | --- |
| 1 | `p = malloc(4 * sizeof(int))` | p = 0x1000, bloco de 16 bytes |
| 2 | preenche p[0..3] | valores em 0x1000–0x100F |
| 3 | `temp = realloc(p, 8 * sizeof(int))` | temp = 0x2000, 32 bytes, cópia feita |
| 4 | `p = temp` | p passa a 0x2000, bloco antigo liberado |
| 5 | `free(p); p = NULL` | bloco devolvido, ponteiro anulado |

Se o passo 3 falhasse, `temp` seria NULL e o bloco de 0x1000 continuaria válido. Escrever `p = realloc(p, ...)` direto perderia esse endereço e vazaria 16 bytes.

## Pergunta de defesa

**Se C# tem coletor de lixo, por que o projeto chama Dispose nas imagens?**

Porque o coletor recupera memória gerenciada, mas não sabe quando um handle nativo deixou de ser usado. Um `Image` do WinForms encapsula recurso GDI+ fora do heap gerenciado, e esse recurso só é devolvido no `Dispose` ou no finalizador, que é tardio. Como o cadastro recarrega a cada busca e a cada página, deixar acumular handles esgota recurso do sistema antes de o coletor agir. Por isso o cache é limpo explicitamente, e esse é o mesmo raciocínio do `free` em C.

## Exercício

Considere `int v[5] = {10, 20, 30, 40, 50}; int *p = &v[2]; *p += 5; p++;`. Quais valores ficam em `v[2]` e em `*p`?

<details><summary>Ver resposta</summary>

`p` aponta para `v[2]`, então `*p += 5` transforma 30 em 35. Depois, `p++` avança uma posição de `int`, e `p` passa a apontar para `v[3]`, cujo valor é 40. Portanto `v[2]` vale 35 e `*p` vale 40; o incremento de ponteiro anda em unidades do tipo apontado, não em bytes.

</details>
