/* Rotina 6 — Três revisões, uma decisão */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  var FUNCS = {
    gerar: {
      title: "Gerador de código", file: "regitro_livros.cs",
      proto: "Random.Next(1000, 9999) dentro de do/while; cada tentativa faz SELECT para verificar unicidade.",
      pacote: "Random.Next(100, 999), um único sorteio, sem consulta; o limite superior é exclusivo.",
      read: "O intervalo mudou e a verificação sumiu. A unicidade passou a depender da PK e da sorte.",
      old: "int codigo = rnd.Next(1000, 9999);\ndo { ... SELECT ... } while (existe);",
      now: "int numero = rnd.Next(100, 999);\nstring codigo = $\"LIV{numero}\";"
    },
    login: {
      title: "Entrada no sistema", file: "Program.cs",
      proto: "FormLogin com usuário e senha antes do dashboard.",
      pacote: "Application.Run(new FormDashboard()) direto; não há tabela de usuários no dump.",
      read: "O login existe na documentação e nos slides, não nesta revisão do código.",
      old: "Application.Run(new FormLogin());",
      now: "Application.Run(new TGLibrary.FormDashboard());"
    },
    emprestimo: {
      title: "Empréstimo", file: "FormEmprestimo.cs",
      proto: "INSERT do empréstimo e UPDATE do livro em dois comandos separados, sem transação.",
      pacote: "Duas consultas por candidato (permite_emprestimo e contagem de ativos), com uma conexão por verificação.",
      read: "A transação não foi adicionada; o que mudou foi a checagem de disponibilidade.",
      old: "INSERT INTO emprestimos ...;\nUPDATE livros SET status='Emprestado' ...;",
      now: "SELECT COALESCE(permite_emprestimo,1) ...;\nSELECT COUNT(*) ... WHERE status NOT IN (...);"
    },
    devolucao: {
      title: "Devolução", file: "FormDevolucao.cs",
      proto: "Apenas UPDATE do empréstimo para concluído; nenhum registro de devolução.",
      pacote: "Transação: INSERT em devolucoes, UPDATE em emprestimos, Rollback se afetadas = 0, Commit no fim.",
      read: "Aqui houve salto de engenharia: duas escritas passaram a ser atômicas.",
      old: "UPDATE emprestimos SET status='Concluído' WHERE id=@id;",
      now: "using var tx = conn.BeginTransaction();\nINSERT ...; UPDATE ...;\nif (afetadas == 0) { tx.Rollback(); return; }\ntx.Commit();"
    },
    historico: {
      title: "Histórico", file: "historico_devolucao.cs",
      proto: "DataGridView preenchido diretamente pela consulta, sem filtros em memória.",
      pacote: "_todos recebe todos os registros; AplicarFiltros monta _visiveis; a ordenação fica no ORDER BY.",
      read: "O filtro saiu do SQL para a memória; a ordenação continuou no banco.",
      old: "SELECT * FROM devolucoes d JOIN emprestimos e ...;",
      now: "ORDER BY d.data_devolucao DESC, d.id DESC"
    },
    cache: {
      title: "Cache de imagens", file: "Form4.cs",
      proto: "Não havia cache; cada abertura recarregava a imagem.",
      pacote: "Dictionary<string, Image> com Dispose ao substituir e ao fechar.",
      read: "O ADC2 dizia que não havia Dictionary; o código atual usa. A evidência mais recente vence.",
      old: "pictureBox.Image = Image.FromFile(caminho);",
      now: "if (cache.TryGetValue(codigo, out var img)) { ... }\ncache[codigo] = Image.FromFile(caminho);"
    }
  };

  function build(p) {
    var f = FUNCS[p.funcao] || FUNCS.gerar;
    var falha = p.falha;
    var frames = [], log = [];
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({ fn: p.funcao, data: f, note: note, log: log.slice() }, extra || {}));
    }
    add("Linha do tempo: três revisões do mesmo sistema. Selecione uma função para ver o que mudou.", { phase: "timeline", rev: -1 });
    add("Protótipo 66fd8fb: " + f.proto, { phase: "proto", rev: 0 });
    add("Revisão .NET 8 7427270: migração de plataforma, mesma lógica de negócio.", { phase: "mid", rev: 1 });
    add("Anexo PI.rar: " + f.pacote, { phase: "now", rev: 2 });
    add(f.read, { phase: "read", rev: 2 });

    if (falha === "prototipo") {
      add("Simulação no protótipo: INSERT do empréstimo funciona; o segundo comando falha.", { phase: "fail", rev: 0, step: 0 });
      add("O INSERT permanece. O livro continua 'Disponível' e o empréstimo existe: estado inconsistente.", { phase: "fail", rev: 0, step: 1, inconsistent: true });
      add("Não há Rollback porque não há transação. O erro só aparece na próxima consulta.", { phase: "fail", rev: 0, step: 2, inconsistent: true });
    } else if (falha === "revisao") {
      add("Simulação na revisão: INSERT da devolução funciona; o UPDATE falha.", { phase: "fail", rev: 2, step: 0 });
      add("afetadas = 0 → Rollback. A devolução não é confirmada.", { phase: "fail", rev: 2, step: 1, rolled: true });
      add("Estado original: empréstimo aberto, nenhuma devolução. Consistente.", { phase: "fail", rev: 2, step: 2, rolled: true });
    } else {
      add("Sem falha injetada: as duas escritas confirmam juntas.", { phase: "ok", rev: 2, committed: true });
    }
    return { frames: frames };
  }

  function paint(f, s) {
    var revs = [
      ["66fd8fb", "protótipo", ".NET Framework"],
      ["7427270", "migração", ".NET 8"],
      ["PI.rar", "revisão atual", ".NET 8 + transação"]
    ];
    s.text("h", "Três revisões, uma decisão", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    revs.forEach(function (r, i) {
      var x = 20 + i * 150, y = 42;
      var on = f.rev === i || (f.rev === -1 && i === 2);
      s.node("rv" + i, "rect", { x: x, y: y, width: 138, height: 52, rx: 7, fill: on ? C.greenSoft : C.white, stroke: on ? "#7FB08F" : C.line, "stroke-width": on ? 2 : 1 });
      s.text("rvt" + i, r[0], { x: x + 10, y: y + 18, fill: on ? C.green : C.ink2, "font-size": 8.5, "font-weight": 700, "font-family": "var(--font-mono)" });
      s.text("rvs" + i, r[1] + " · " + r[2], { x: x + 10, y: y + 32, fill: C.ink3, "font-size": 6.8 });
      s.text("rvn" + i, String(i + 1), { x: x + 124, y: y + 18, "text-anchor": "middle", fill: on ? C.green : "#BDB8AA", "font-size": 8, "font-family": "var(--font-mono)" });
      if (i < 2) s.node("ar" + i, "line", { x1: x + 138, y1: y + 26, x2: x + 150, y2: y + 26, stroke: C.ink3 });
    });

    var d = f.data || FUNCS.gerar;
    s.text("ft", d.title + " · " + d.file, { x: 20, y: 122, fill: C.green, "font-size": 10, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("fp", "protótipo", { x: 20, y: 142, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    s.node("pb", "rect", { x: 20, y: 148, width: 290, height: 96, rx: 6, fill: "#FBF7EC", stroke: "#D8CFB8" });
    s.text("pt", (d.old || "").split("\n")[0].slice(0, 42), { x: 30, y: 168, fill: C.ink2, "font-size": 7.5, "font-family": "var(--font-mono)" });
    s.text("pt2", (d.old || "").split("\n")[1] ? d.old.split("\n")[1].slice(0, 42) : "", { x: 30, y: 184, fill: C.ink2, "font-size": 7.5, "font-family": "var(--font-mono)" });
    s.text("pt3", d.proto.slice(0, 52), { x: 30, y: 208, fill: C.ink3, "font-size": 7 });
    s.text("pt4", d.proto.slice(52, 110), { x: 30, y: 220, fill: C.ink3, "font-size": 7 });

    s.text("fn", "revisão atual", { x: 330, y: 142, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    s.node("nb", "rect", { x: 330, y: 148, width: 294, height: 96, rx: 6, fill: C.greenSoft, stroke: "#9EC4AE" });
    s.text("nt", (d.now || "").split("\n")[0].slice(0, 44), { x: 340, y: 168, fill: C.green, "font-size": 7.5, "font-family": "var(--font-mono)" });
    s.text("nt2", (d.now || "").split("\n")[1] ? d.now.split("\n")[1].slice(0, 44) : "", { x: 340, y: 184, fill: C.green, "font-size": 7.5, "font-family": "var(--font-mono)" });
    s.text("nt3", (d.now || "").split("\n")[2] ? d.now.split("\n")[2].slice(0, 44) : "", { x: 340, y: 200, fill: C.green, "font-size": 7.5, "font-family": "var(--font-mono)" });
    s.text("nt4", d.read.slice(0, 50), { x: 340, y: 222, fill: C.ink2, "font-size": 7 });

    // simulação
    s.node("sim", "rect", { x: 20, y: 258, width: 604, height: 106, rx: 7, fill: C.white, stroke: C.line });
    s.text("simt", "Simulação de falha", { x: 32, y: 276, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    if (f.phase === "fail" || f.phase === "ok") {
      var step = f.step === undefined ? 2 : f.step;
      var rows = [
        ["1. primeiro comando", f.rolled || f.committed ? "aplicado" : "aplicado", C.green],
        ["2. segundo comando", f.rolled ? "falhou" : f.committed ? "aplicado" : step >= 1 ? "falhou" : "pendente", f.rolled ? C.red : f.committed ? C.green : C.amber],
        ["3. estado final", f.rolled ? "revertido" : f.committed ? "consistente" : "inconsistente", f.rolled || f.committed ? C.green : C.red]
      ];
      rows.forEach(function (r, i) {
        s.text("sr" + i, r[0], { x: 34, y: 298 + i * 20, fill: C.ink2, "font-size": 8 });
        s.text("sv" + i, r[1], { x: 210, y: 298 + i * 20, fill: r[2], "font-size": 8, "font-weight": 700 });
      });
      s.text("sx", f.rolled ? "Rollback desfez o primeiro comando." : f.committed ? "Commit confirmou os dois." : "Sem transação: o primeiro comando fica.", { x: 330, y: 318, fill: C.ink3, "font-size": 7.5 });
      s.text("sy", f.rolled ? "Consistência preservada." : f.committed ? "Tudo ou nada." : "O banco fica num estado que ninguém projetou.", { x: 330, y: 336, fill: f.rolled || f.committed ? C.green : C.red, "font-size": 7.5 });
    } else {
      s.text("sx", "Escolha um caso com falha para comparar as duas revisões.", { x: 34, y: 306, fill: C.ink3, "font-size": 8 });
    }
  }

  Lab.mount(root, {
    id: "versoes", width: 640, height: 400,
    params: [
      { key: "funcao", label: "Função", type: "select", value: "gerar", options: [
        { value: "gerar", label: "Gerador de código" }, { value: "login", label: "Login" }, { value: "emprestimo", label: "Empréstimo" },
        { value: "devolucao", label: "Devolução" }, { value: "historico", label: "Histórico" }, { value: "cache", label: "Cache de imagens" }] },
      { key: "falha", label: "Simulação", type: "select", value: "revisao", options: [
        { value: "nenhuma", label: "Sem falha" }, { value: "prototipo", label: "Falha no protótipo" }, { value: "revisao", label: "Falha na revisão" }] }
    ],
    presets: [
      { label: "Gerador", params: { funcao: "gerar", falha: "nenhuma" } },
      { label: "Devolução", params: { funcao: "devolucao", falha: "revisao" } },
      { label: "Falha no protótipo", params: { funcao: "emprestimo", falha: "prototipo" } },
      { label: "Login", params: { funcao: "login", falha: "nenhuma" } }
    ],
    build: build, paint: paint
  });
})();
