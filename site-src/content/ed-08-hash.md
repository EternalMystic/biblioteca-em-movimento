---
slug: ed-08-hash
title: Tabelas hash
summary: Função modular, colisão inevitável, encadeamento separado, endereçamento aberto com sondagem linear, fator de carga e o cache de imagens do projeto.
pages: "pp. 2–11"
pdf: "aula8.pdf — Tabelas Hash e Introdução a Árvores"
objectives:
  - Explicar por que a tabela hash troca comparação por cálculo de índice.
  - Calcular índice com aritmética modular e reconhecer colisão.
  - Comparar encadeamento separado e endereçamento aberto.
  - Interpretar fator de carga e o efeito do agrupamento primário.
  - Relacionar o cache Dictionary do projeto ao custo médio O(1).
evidence:
  - kind: code
    source: "Form4.cs · linha 43"
    text: "private readonly Dictionary<string, Image> _cacheImagens guarda a foto do atirador pela chave numero."
  - kind: code
    source: "Form4.cs · linhas 489 e 581"
    text: "A carga faz _cacheImagens[num] = Image.FromStream(ms); o desenho consulta TryGetValue por número."
  - kind: code
    source: "Form4.cs · linhas 461–462"
    text: "Antes de recarregar, o cache percorre os valores chamando Dispose e depois Clear, liberando handles GDI+."
quiz:
  - q: "Em uma tabela de tamanho 10, onde cai a chave 25 com função modular?"
    options:
      - "Índice 5, porque 25 % 10 = 5"
      - "Índice 2, porque 25 / 10 = 2"
      - "Índice 0, porque a tabela começa em zero"
      - "Índice 15, porque 25 − 10 = 15"
    answer: 0
    explain: "A função usa o resto da divisão inteira. A divisão dá 2, mas o índice é o resto; zero é o início da tabela, não o resultado."
  - q: "O que acontece ao inserir a chave 15 na mesma tabela depois da chave 25?"
    options:
      - "Ocorre colisão no índice 5 e alguma estratégia precisa resolver o conflito"
      - "A chave 15 substitui a 25 silenciosamente"
      - "A tabela dobra de tamanho automaticamente em qualquer implementação"
      - "A chave 15 é descartada porque o índice está ocupado"
    answer: 0
    explain: "15 % 10 também dá 5. Substituir perderia dado, dobrar não é obrigatório e descartar violaria o contrato da estrutura."
  - q: "O que o fator de carga α = n/m indica?"
    options:
      - "A ocupação da tabela, que aumenta a probabilidade de colisão"
      - "O tempo médio de busca em segundos"
      - "O número de colisões já ocorridas"
      - "A quantidade de memória livre no heap"
    answer: 0
    explain: "α compara elementos e posições. Tempo depende de hardware e estratégia, colisões são consequência e memória livre é outro assunto."
---

O cadastro de atiradores mostra uma foto ao lado de cada nome. As imagens vêm do banco como bytes e são desenhadas na grade; converter tudo a cada pintura de tela seria lento. O projeto resolve isso com um dicionário em memória que associa o número do atirador à imagem já decodificada. Essa estrutura é uma tabela hash, e esta aula explica o que ela promete e quando a promessa falha.

## Acesso direto × busca binária

A busca binária reduz o espaço pela metade a cada comparação e chega a O(log n). É bom, mas ainda depende de percorrer uma sequência de posições. A pergunta seguinte é se dá para encontrar um elemento sem percorrer nada.

A tabela hash faz isso: calcula o índice a partir da chave e vai direto à posição. Não é uma busca binária melhor, é outra estratégia de organização, em que a posição do dado é derivada do próprio dado.

## Função modular e mapeamento de chaves 25 e 15 em tabela de 10

A tabela é um vetor somado a uma função de espalhamento. A função recebe a chave, calcula um inteiro e devolve um índice. A forma mais comum usa aritmética modular: índice = chave % tamanho.

Com tabela de 10 posições, a chave 25 cai em 25 % 10 = 5. A chave 15 cai em 15 % 10 = 5 também. Duas chaves distintas, um único índice: a colisão deixa de ser acidente e passa a ser consequência matemática, porque o conjunto de chaves possíveis é maior que o número de posições.

## Colisão, encadeamento separado e endereçamento aberto

O encadeamento separado transforma cada posição em cabeça de uma lista encadeada: o índice 5 guarda 25 e, depois dele, 15. A estrutura passa a ser vetor mais função mais lista. A busca percorre só a cadeia daquele índice.

O endereçamento aberto não usa listas: todos os elementos ficam no vetor principal. Ao colidir, o algoritmo sonda posições seguintes até achar espaço livre. Ganha-se localidade de memória e perde-se simplicidade na remoção, que exige marcação de posição excluída.

## Sondagem linear e agrupamento primário

Na sondagem linear, a colisão em i leva a testar i+1, i+2 e assim por diante, com retorno ao início. É simples e usa memória contígua, mas produz agrupamento primário: blocos ocupados crescem e atraem novas colisões, porque qualquer chave que caia dentro do bloco precisa percorrer até o fim dele.

O efeito é visível. Inserindo 25, 15, 35 e 45 em uma tabela de 10, todas caem no índice 5 e ocupam 5, 6, 7 e 8. Uma quinta chave com resto 5 percorreria quatro posições antes de achar espaço, mesmo que a tabela tenha seis posições livres.

## Fator de carga α = n/m, custo esperado e pior caso

O fator de carga é o número de elementos dividido pelo número de posições. Com 7 elementos em 10 posições, α = 0,7. Quanto maior α, maior a chance de colisão e maior o comprimento médio das cadeias ou das sondagens.

Com boa função e α controlado, a busca fica em O(1) médio. O pior caso é O(n): basta que todas as chaves colidam no mesmo índice. Dizer que a tabela hash é O(1) sem qualificar é o erro mais comum em entrevista e em prova.

```csharp
private readonly Dictionary<string, Image> _cacheImagens = new Dictionary<string, Image>();
...
_cacheImagens[num] = Image.FromStream(ms);
...
if (_cacheImagens.TryGetValue(numRow, out Image fotoImg))
```

Os três trechos são de Form4.cs. A chave é o número do atirador, convertido para texto; a escrita acontece ao carregar a página e a leitura, a cada célula pintada. O `TryGetValue` evita exceção quando não há foto e resolve o caso comum em tempo médio constante.

## No Projeto Integrador

O sistema é WinForms .NET 8 com MySQL local, abre direto no painel e não tem login. O cache do Form4 é a única tabela hash explícita do código revisado, e ela existe por um motivo concreto: decodificar imagem é caro e a grade redesenha com frequência.

Confirmado no código: a chave é o campo `numero`, que é a chave primária da tabela `atiradores`; o cache é limpo a cada recarga, com `Dispose` em cada imagem antes de `Clear`, para não acumular handles. A paginação de dez linhas limita o tamanho do cache a dez imagens por vez.

Modelo didático: a função modular, o encadeamento e a sondagem linear vêm dos slides. O `Dictionary` do .NET não expõe a função de espalhamento nem o fator de carga usado, então os números desta aula são de laboratório, não do sistema.

## Teste de mesa

Tabela de 10 posições, sondagem linear, inserindo 25, 15, 35, 45 e 55.

| Chave | chave % 10 | Sondagens | Índice final |
| --- | --- | --- | --- |
| 25 | 5 | livre | 5 |
| 15 | 5 | 6 livre | 6 |
| 35 | 5 | 6 e 7 ocupados | 7 |
| 45 | 5 | 6, 7 e 8 ocupados | 8 |
| 55 | 5 | 6, 7, 8 e 9 ocupados | 9 |

Com 5 elementos em 10 posições, α = 0,5. Ainda assim, a última inserção custou quatro sondagens: o agrupamento primário degrada o desempenho local mesmo com metade da tabela vazia.

## Pergunta de defesa

**O cache de imagens do projeto é realmente O(1)?**

No caso médio, sim: a chave é o número do atirador, o dicionário calcula o índice e resolve a leitura em tempo praticamente constante, com colisões raras distribuídas. No pior caso teórico, se todas as chaves caíssem no mesmo balde, a busca viraria uma varredura linear, O(n). No projeto isso não acontece porque o número é bem distribuído e o cache é pequeno, limitado às dez linhas da página. A afirmação honesta é custo médio constante com pior caso linear, e não garantia absoluta.

## Exercício

Em uma tabela de 7 posições com função modular e sondagem linear, insira 10, 17, 24 e 3. Informe o índice final de cada chave e o fator de carga.

<details><summary>Ver resposta</summary>

10 % 7 = 3, índice 3. 17 % 7 = 3, colide, vai para 4. 24 % 7 = 3, colide, 4 ocupado, vai para 5. 3 % 7 = 3, colide, 4 e 5 ocupados, vai para 6. Fator de carga: 4/7 ≈ 0,57. As quatro chaves caem no mesmo resto, o que mostra por que a escolha do tamanho da tabela importa: usar um número primo reduz padrões de colisão.

</details>
