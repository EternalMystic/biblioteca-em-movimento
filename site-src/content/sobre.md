Este site reúne o conteúdo de Estruturas de Dados, Grafos e Teoria da Computação estudado no semestre e liga cada assunto ao sistema da biblioteca do Tiro de Guerra de Americana, desenvolvido no Projeto Integrador. Ele funciona inteiro no navegador: não pede cadastro, não usa banco de dados e não envia nada para servidor nenhum.

## Por onde começar {#comecar}

- **Mapa de aulas:** as 23 aulas em três trilhas, com filtro e marcação de progresso.
- **Jornada do PI:** o mesmo livro (`LIV123`) acompanhado do cadastro à devolução, olhando a tela, os dados e o modelo teórico.
- **Simuladores:** 12 rotinas do projeto e 3 laboratórios de apoio, todos com passo a passo.
- **Exercícios e Revisão:** prática com resposta comentada e um caderno com as questões que você errou.
- **Defesa:** roteiro de 10 minutos com cronômetro, perguntas prováveis da banca e checklist.
- **Fontes:** de onde veio cada tópico (PDF e página) e em qual aula e simulador ele aparece.

## Como o método aparece no site {#metodo}

Cada assunto segue cinco movimentos. Eles não são decoração: cada um corresponde a uma parte concreta da interface.

| Movimento | Onde aparece |
|---|---|
| **Preveja** | Os simuladores abrem parados. Antes de clicar em *Executar*, tente dizer qual será o resultado. |
| **Execute** | Os botões *Avançar* e *Voltar* mostram um passo por vez, com o estado, a operação e as métricas lado a lado. |
| **Explique** | O painel de operação descreve o que aconteceu e por quê. Compare com a sua explicação. |
| **Recupere** | No fim de cada aula há uma checagem rápida. As questões erradas vão para o caderno da página *Revisão*. |
| **Aplique** | Os casos prontos e os campos editáveis dos simuladores permitem repetir o mesmo mecanismo com outra entrada. |

## Atalhos de teclado {#atalhos}

| Onde | Tecla | Ação |
|---|---|---|
| Qualquer página | <kbd>/</kbd> | Abrir a busca |
| Busca | <kbd>↑</kbd> <kbd>↓</kbd> e <kbd>Enter</kbd> | Escolher e abrir um resultado |
| Busca e menu | <kbd>Esc</kbd> | Fechar |
| Simuladores | <kbd>→</kbd> / <kbd>←</kbd> | Avançar / voltar um passo |
| Simuladores | <kbd>Home</kbd> / <kbd>End</kbd> | Ir para o primeiro / último passo |
| Simuladores (com o cursor sobre o palco) | <kbd>Espaço</kbd> | Executar ou pausar |
| Simuladores (com o cursor sobre o palco) | <kbd>R</kbd> | Reiniciar |
| Modo defesa | <kbd>→</kbd> / <kbd>←</kbd> | Próxima / anterior etapa do roteiro |
| Modo defesa | <kbd>P</kbd> | Iniciar ou pausar o cronômetro |

Os atalhos não funcionam enquanto você digita em um campo de texto, e não interferem nos atalhos do navegador (como <kbd>Ctrl</kbd>+<kbd>P</kbd> para imprimir).

## Acessibilidade {#acessibilidade}

- Toda a navegação funciona pelo teclado, com foco visível e um link "Ir para o conteúdo" no topo.
- No computador, o botão de ondas no cabeçalho alterna entre movimento completo e reduzido. Se o seu sistema já pede menos movimento, o site começa no modo reduzido.
- O botão de alto-falante lê a página em voz alta (usa as vozes do próprio navegador; funciona melhor com uma voz em português instalada).
- Os simuladores descrevem cada passo em texto, então dá para acompanhar sem depender da animação.
- As aulas podem ser impressas: o layout de impressão remove menus e botões.

## O que é real e o que é modelo {#evidencia}

Cada afirmação sobre o sistema da biblioteca vem com uma etiqueta:

- **Confirmado no código:** existe no código do projeto, com arquivo indicado.
- **Modelo didático:** uma ponte criada para ensinar o conceito; não é uma funcionalidade do sistema.
- **Proposta / evolução:** algo que o sistema poderia fazer, mas ainda não faz.
- **Ementa:** tópico previsto na disciplina, estudado de forma introdutória.

## Limites {#limites}

- O sistema real é uma aplicação desktop (WinForms, .NET 8) com MySQL local. O site apenas simula as operações em memória.
- Não há login, OCR, API pública nem banco em nuvem no código analisado.
- Livros, autores, atiradores e empréstimos usados nos exemplos são fictícios.

## Seus dados {#dados}

O progresso das aulas, as respostas das checagens e a preferência de movimento ficam guardados apenas neste navegador (armazenamento local). Nada é enviado para fora. Para apagar tudo, limpe os dados do site nas configurações do navegador.

## Créditos {#creditos}

- **Conteúdo das aulas e atividades:** material da disciplina, citado por PDF e página na página *Fontes*.
- **Sistema da biblioteca:** código do grupo do Projeto Integrador, usado aqui como objeto de estudo.
- **Tipografia:** Instrument Sans, Source Sans 3 e IBM Plex Mono, servidas pelo próprio site sob a SIL Open Font License.

Material acadêmico, sem fins comerciais. As marcas e os textos de terceiros pertencem aos seus autores.
