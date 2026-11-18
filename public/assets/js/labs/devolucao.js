/* Rotina 3 — Devolução transacional */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var D = window.PI_DATA, C = D.COLORS;

  function build(p) {
    var atraso = +p.atraso;
    var falha = p.falha; // nenhuma | insert_update | antes_commit
    var dup = p.duplicada === "sim";
    var log = [], frames = [];
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        note: note, log: log.slice(),
        metrics: { "dias de atraso": atraso, "escritas": 0, "desfeitas": 0, "devoluções": dup ? 1 : 0 },
        state: { "empréstimo": "#118", "livro": "LIV123", "atirador": "Nº 042", "atraso": atraso + " dia(s)" }
      }, extra || {}));
    }

    add("Empréstimo #118 aberto, vencimento em D−" + atraso + ". Nada foi escrito ainda.", { phase: 0, writes: 0 });
    add("Validação dos campos: motivo, recebido por e estado do exemplar estão preenchidos.", { phase: 1, writes: 0 });
    add("Cálculo: dias_atraso = max(0, devolução − vencimento) = " + atraso + ".", { phase: 2, writes: 0, metrics: { "dias de atraso": atraso, "escritas": 0, "desfeitas": 0, "cálculo": "max(0, d−v)" } });
    add("BEGIN TRANSACTION. A partir daqui, ou tudo vale, ou nada vale.", { phase: 3, writes: 0, state: { "transação": "aberta", "empréstimo": "#118", "atraso": atraso + " dia(s)" } });
    add("INSERT em devolucoes: (id_emprestimo, data, estado, motivo, recebido_por, dias_atraso). A linha está pendente.", { phase: 4, writes: 1, pending: true, state: { "transação": "aberta", "devolucoes": "1 pendente", "empréstimos": "inalterado" } });

    if (falha === "insert_update") {
      add("UPDATE emprestimos SET status='Concluído' … falha: conexão caiu antes de afetar a linha.", { phase: 5, writes: 1, failed: true, metrics: { "dias de atraso": atraso, "escritas": 1, "desfeitas": 0, "afetadas": 0 } });
      add("O código detecta afetadas = 0 e chama Rollback(). O INSERT não é confirmado.", { phase: 6, writes: 0, rolled: true, state: { "transação": "rollback", "devolucoes": "0", "empréstimos": "aberto" } });
      add("Estado revertido: nenhuma devolução, empréstimo continua aberto. O contador não mente.", { phase: 7, writes: 0, rolled: true, metrics: { "dias de atraso": atraso, "escritas": 0, "desfeitas": 1, "devoluções": 0 } });
    } else if (falha === "antes_commit") {
      add("INSERT e UPDATE afetaram linhas. Antes do Commit, uma exceção é lançada.", { phase: 5, writes: 2, failed: true });
      add("O bloco catch executa Rollback(): as duas escritas desaparecem juntas.", { phase: 6, writes: 0, rolled: true, metrics: { "dias de atraso": atraso, "escritas": 0, "desfeitas": 2, "devoluções": 0 } });
      add("Estado original restaurado. É para isso que existe a transação.", { phase: 7, writes: 0, rolled: true });
    } else if (dup) {
      add("COMMIT: devolução gravada e empréstimo concluído.", { phase: 5, writes: 2, committed: true });
      add("Segunda tentativa para o mesmo empréstimo: a UNIQUE(id_emprestimo) barra com erro 1062.", { phase: 6, writes: 2, duplicate: true, metrics: { "dias de atraso": atraso, "escritas": 2, "desfeitas": 0, "erro": "1062" } });
      add("Nada muda: a barreira é o banco, não o botão.", { phase: 7, writes: 2, duplicate: true });
    } else {
      add("UPDATE emprestimos SET status='Concluído' WHERE id=@id … 1 linha afetada.", { phase: 5, writes: 2, pending: true });
      add("COMMIT: as duas escritas passam a valer ao mesmo tempo.", { phase: 6, writes: 2, committed: true, state: { "transação": "confirmada", "devolucoes": "1", "empréstimos": "concluído" } });
      add("Estado final: devolução registrada, empréstimo concluído, histórico consistente.", { phase: 7, writes: 2, committed: true, metrics: { "dias de atraso": atraso, "escritas": 2, "desfeitas": 0, "devoluções": 1 } });
    }
    return { frames: frames };
  }

  function paint(f, s) {
    var W = 640, laneY = 96;
    s.text("h", "Duas tabelas, uma transação", { x: 16, y: 24, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "devolucoes  ←→  emprestimos", { x: 16, y: 40, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });

    // bracket da transação
    var active = f.phase >= 3 && !f.rolled;
    s.node("br", "path", {
      d: "M 22 78 L 14 78 L 14 296 L 22 296", fill: "none",
      stroke: active ? C.blue : f.rolled ? C.red : "#C9C3B4", "stroke-width": 2, "stroke-dasharray": active ? "0" : "4 3"
    });
    s.text("brt", active ? "TX aberta" : f.rolled ? "TX desfeita" : "sem TX", { x: 20, y: 312, fill: active ? C.blue : f.rolled ? C.red : C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    // lane devolucoes
    s.node("l1", "rect", { x: 40, y: laneY, width: 260, height: 74, rx: 7, fill: f.committed ? C.greenSoft : f.rolled ? "#FBEDEC" : C.white, stroke: f.committed ? "#7FB08F" : f.rolled ? "#D8A5A5" : C.line });
    s.text("l1t", "devolucoes", { x: 52, y: laneY + 17, fill: C.green, "font-size": 9, "font-weight": 700, "font-family": "var(--font-mono)" });
    s.text("l1a", f.phase >= 4 ? (f.rolled ? "linha desfeita" : "id_emprestimo = 118") : "vazia para #118", { x: 52, y: laneY + 36, fill: f.rolled ? C.red : C.ink2, "font-size": 8 });
    s.text("l1b", f.phase >= 4 ? "data, estado, motivo, recebido_por" : "—", { x: 52, y: laneY + 50, fill: C.ink3, "font-size": 7.5 });
    s.text("l1c", f.phase >= 4 ? "dias_atraso = " + (f.metrics["dias de atraso"] || 0) : "", { x: 52, y: laneY + 64, fill: C.amber, "font-size": 7.5, "font-family": "var(--font-mono)" });
    if (f.pending) {
      s.node("l1p", "rect", { x: 240, y: laneY + 8, width: 52, height: 16, rx: 8, fill: C.amberSoft, stroke: C.amber });
      s.text("l1pt", "pendente", { x: 266, y: laneY + 19, "text-anchor": "middle", fill: C.amber, "font-size": 7 });
    }

    // lane emprestimos
    s.node("l2", "rect", { x: 40, y: laneY + 96, width: 260, height: 74, rx: 7, fill: f.committed ? C.greenSoft : C.white, stroke: f.committed ? "#7FB08F" : C.line });
    s.text("l2t", "emprestimos", { x: 52, y: laneY + 113, fill: C.green, "font-size": 9, "font-weight": 700, "font-family": "var(--font-mono)" });
    s.text("l2a", "#118 · LIV123", { x: 52, y: laneY + 132, fill: C.ink2, "font-size": 8 });
    s.text("l2b", "status: " + (f.committed ? "Concluído" : "Pendente"), { x: 52, y: laneY + 148, fill: f.committed ? C.green : C.amber, "font-size": 8, "font-weight": 700 });
    s.text("l2c", "atirador Nº 042", { x: 52, y: laneY + 162, fill: C.ink3, "font-size": 7.5 });

    // ações
    var acts = [
      ["BEGIN", 3], ["INSERT", 4], ["UPDATE", 5], ["COMMIT", 6]
    ];
    acts.forEach(function (a, i) {
      var x = 330, y = 92 + i * 52;
      var on = f.phase >= a[1];
      var isFail = (a[0] === "UPDATE" && f.failed) || (a[0] === "COMMIT" && f.phase >= 6 && (f.rolled || f.duplicate));
      s.node("a" + i, "rect", { x: x, y: y, width: 120, height: 38, rx: 6, fill: isFail ? C.redSoft : on ? C.blueSoft : C.white, stroke: isFail ? C.red : on ? "#9FB0D8" : C.line });
      s.text("at" + i, a[0], { x: x + 12, y: y + 16, fill: isFail ? C.red : on ? C.blue : C.ink3, "font-size": 8, "font-weight": 700, "font-family": "var(--font-mono)" });
      s.text("as" + i, a[0] === "BEGIN" ? "abre" : a[0] === "COMMIT" ? (f.rolled ? "não chega" : "confirma") : (isFail ? "falha" : "afeta linha"), { x: x + 12, y: y + 29, fill: C.ink3, "font-size": 7 });
    });
    s.node("arr", "line", { x1: 452, y1: 111, x2: 470, y2: 111, stroke: C.ink3 });
    s.node("arr2", "line", { x1: 452, y1: 163, x2: 470, y2: 163, stroke: C.ink3 });

    // estado final
    var boxY = 306;
    s.node("st", "rect", { x: 330, y: boxY - 20, width: 294, height: 66, rx: 7, fill: f.rolled ? C.redSoft : f.committed ? C.greenSoft : "#F4F1E7", stroke: f.rolled ? "#D8A5A5" : f.committed ? "#9EC4AE" : C.line });
    s.text("stt", f.rolled ? "Estado revertido" : f.committed ? "Estado confirmado" : "Estado em curso", { x: 342, y: boxY - 4, fill: f.rolled ? C.red : f.committed ? C.green : C.ink2, "font-size": 8, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("stv", f.rolled ? "devoluções: 0 · empréstimo: aberto" : f.committed ? "devoluções: 1 · empréstimo: concluído" : "devoluções: " + (f.pending ? "1 pendente" : "0") + " · empréstimo: aberto", { x: 342, y: boxY + 14, fill: C.ink2, "font-size": 8 });
    s.text("stw", f.duplicate ? "erro 1062 · UNIQUE(id_emprestimo)" : "atomicidade: tudo ou nada", { x: 342, y: boxY + 30, fill: C.ink3, "font-size": 7.5 });

    // fórmula
    s.text("fm", "dias_atraso = max(0, data_devolucao − data_vencimento)", { x: 40, y: 372, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
  }

  Lab.mount(root, {
    id: "devolucao", width: 640, height: 400,
    params: [
      { key: "atraso", label: "Dias de atraso", type: "range", min: 0, max: 14, value: 3 },
      { key: "falha", label: "Falha injetada", type: "select", value: "nenhuma", options: [
        { value: "nenhuma", label: "Nenhuma" }, { value: "insert_update", label: "Falha entre INSERT e UPDATE" }, { value: "antes_commit", label: "Falha antes do COMMIT" }] },
      { key: "duplicada", label: "Devolução duplicada", type: "select", value: "nao", options: [{ value: "nao", label: "Não" }, { value: "sim", label: "Sim" }] }
    ],
    presets: [
      { label: "Em dia", params: { atraso: 0, falha: "nenhuma", duplicada: "nao" } },
      { label: "3 dias", params: { atraso: 3, falha: "nenhuma", duplicada: "nao" } },
      { label: "Falha no UPDATE", params: { atraso: 3, falha: "insert_update", duplicada: "nao" } },
      { label: "Falha antes do COMMIT", params: { atraso: 5, falha: "antes_commit", duplicada: "nao" } },
      { label: "Duplicada", params: { atraso: 0, falha: "nenhuma", duplicada: "sim" } }
    ],
    build: build, paint: paint
  });
})();
