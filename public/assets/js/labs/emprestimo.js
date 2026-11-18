/* Rotina 10 — Balcão de empréstimo */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var D = window.PI_DATA, C = D.COLORS;

  var TODAY = new Date(2026, 10, 18);
  function fmt(d) { return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }
  function addDays(n) { var d = new Date(TODAY); d.setDate(d.getDate() + n); return d; }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  function build(p) {
    var term = String(p.termo || "LIV123").trim();
    var cands = D.CATALOG.filter(function (b) {
      return norm(b.code + " " + b.title + " " + b.authors.join(" ")).indexOf(norm(term)) !== -1;
    });
    if (p.cenario === "multiplos") cands = D.CATALOG.filter(function (b) { return norm(b.title).indexOf("manual") !== -1; });
    if (p.cenario === "bloqueada") cands = D.CATALOG.filter(function (b) { return b.code === "LIV171"; });
    if (p.cenario === "ativo") cands = D.CATALOG.filter(function (b) { return b.code === "LIV207"; });
    if (p.cenario === "unico") cands = D.CATALOG.filter(function (b) { return b.code === "LIV123"; });
    if (!cands.length) cands = [D.BOOK];

    var frames = [], log = [], queries = 0, checks = 0;
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        cands: cands, term: term, queries: queries, checks: checks, note: note, log: log.slice(),
        metrics: { "candidatos": cands.length, "consultas": queries, "verificações": checks, "resultado": extra && extra.result || "—" },
        state: { "termo": term, "hoje": fmt(TODAY), "candidatos": cands.length }
      }, extra || {}));
    }

    queries++;
    add("Busca no acervo: WHERE titulo LIKE '%" + term + "%' OR codigo LIKE … → " + cands.length + " candidato(s).", { phase: "search", result: cands.length + " resultado(s)" });

    var chosen = null;
    cands.forEach(function (b, i) {
      var blocked = b.permite === 0;
      var active = p.cenario === "ativo" && b.code === "LIV207";
      queries++; checks++;
      add("Candidato " + (i + 1) + " · " + b.code + ": SELECT permite_emprestimo → " + (blocked ? "0 (bloqueado)" : "1") + ".", { phase: "check1", i: i, book: b, result: blocked ? "bloqueado" : "segue" });
      queries++;
      add("Candidato " + (i + 1) + ": SELECT COUNT(*) de empréstimos ativos → " + (active ? "1 (já emprestado)" : "0") + ".", { phase: "check2", i: i, book: b, result: active ? "indisponível" : "disponível" });
      if (!blocked && !active && !chosen) chosen = b;
    });
    if (!chosen) chosen = cands[0];
    add("Seleciona " + chosen.code + " (" + chosen.title + ").", { phase: "select", book: chosen, result: "selecionado" });

    var offset = +p.dias;
    var venc = addDays(offset);
    add("Vencimento definido para " + fmt(venc) + " (hoje " + fmt(TODAY) + ").", { phase: "date", book: chosen, venc: fmt(venc), result: "Pendente" });

    [-1, 0, 1].forEach(function (k) {
      var ref = addDays(k);
      var calc = ref > venc ? "Atrasado" : "Pendente";
      var persisted = k === 0 ? "Pendente" : null;
      add("Se hoje fosse " + fmt(ref) + ", o cálculo daria " + calc + "." + (persisted && persisted !== calc ? " O status gravado (“Pendente”) diverge do calculado." : ""), { phase: "clock", book: chosen, ref: fmt(ref), calc: calc, persisted: persisted });
    });

    add("Confirma: INSERT em empréstimos, status inicial Pendente, prazo de " + (chosen.prazo || 7) + " dias.", { phase: "confirm", book: chosen, result: "emprestado" });
    add("Fim: " + queries + " consultas para " + cands.length + " candidato(s). Cada candidato custa 2 consultas.", { phase: "done", book: chosen, result: "concluído" });
    return { frames: frames };
  }

  function paint(f, s) {
    s.text("h", "Balcão de empréstimo", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "hoje " + fmt(TODAY) + " · dados fictícios", { x: 16, y: 38, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    // busca
    s.node("sb", "rect", { x: 16, y: 52, width: 300, height: 30, rx: 6, fill: C.white, stroke: C.line });
    s.text("sbt", "🔎 " + (f.term || ""), { x: 28, y: 71, fill: C.ink2, "font-size": 9 });
    s.text("sbn", f.cands.length + " resultado(s)", { x: 300, y: 71, "text-anchor": "end", fill: C.ink3, "font-size": 7 });

    f.cands.slice(0, 4).forEach(function (b, i) {
      var y = 92 + i * 44;
      var on = f.book && f.book.code === b.code;
      s.node("cd" + i, "rect", { x: 16, y: y, width: 300, height: 38, rx: 5, fill: on ? C.greenSoft : C.white, stroke: on ? "#7FB08F" : C.line });
      s.text("cdt" + i, b.code + " · " + b.title.slice(0, 24), { x: 26, y: y + 15, fill: on ? C.green : C.ink, "font-size": 8, "font-weight": on ? 700 : 400 });
      s.text("cds" + i, "gaveta " + b.drawer + " · " + b.authors.join(", "), { x: 26, y: y + 28, fill: C.ink3, "font-size": 6.5 });
      var blocked = b.permite === 0;
      s.text("cdb" + i, blocked ? "bloqueado" : "permite", { x: 306, y: y + 20, "text-anchor": "end", fill: blocked ? C.red : C.green, "font-size": 6.5 });
    });

    // consultas
    s.text("qt", "Consultas executadas", { x: 336, y: 60, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    var qs = [
      ["busca", f.phase !== "search"],
      ["permite_emprestimo", f.phase === "check2" || f.phase === "select" || f.phase === "date" || f.phase === "clock" || f.phase === "confirm" || f.phase === "done"],
      ["COUNT ativos", f.phase === "select" || f.phase === "date" || f.phase === "clock" || f.phase === "confirm" || f.phase === "done"],
      ["INSERT empréstimo", f.phase === "confirm" || f.phase === "done"]
    ];
    qs.forEach(function (q, i) {
      var y = 76 + i * 26;
      s.node("q" + i, "rect", { x: 336, y: y, width: 286, height: 20, rx: 3, fill: q[1] ? C.blueSoft : "#F4F1E7", stroke: q[1] ? "#9FB0D8" : C.line });
      s.text("qt" + i, (q[1] ? "✓ " : "· ") + q[0], { x: 344, y: y + 14, fill: q[1] ? C.blue : C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
      s.text("qc" + i, q[1] ? "1" : "—", { x: 612, y: y + 14, "text-anchor": "end", fill: C.ink3, "font-size": 7, "font-family": "var(--font-mono)" });
    });
    s.text("qsum", "total: " + f.queries + " consultas · " + f.checks + " verificações", { x: 336, y: 196, fill: C.amber, "font-size": 8, "font-family": "var(--font-mono)" });

    // linha do tempo de status
    s.text("st", "Status calculado pela data", { x: 336, y: 228, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    var states = [["Pendente", 0], ["Atrasado", 1], ["Concluído", 2]];
    states.forEach(function (st, i) {
      var x = 344 + i * 92;
      var on = f.calc === st[0] || (f.phase === "done" && i === 2);
      s.node("ms" + i, "rect", { x: x, y: 240, width: 84, height: 28, rx: 5, fill: on ? (i === 1 ? C.redSoft : i === 2 ? C.greenSoft : C.amberSoft) : C.white, stroke: on ? (i === 1 ? C.red : i === 2 ? "#7FB08F" : C.amber) : C.line });
      s.text("mst" + i, st[0], { x: x + 42, y: 258, "text-anchor": "middle", fill: on ? (i === 1 ? C.red : i === 2 ? C.green : C.amber) : C.ink3, "font-size": 7.5, "font-weight": on ? 700 : 400 });
      if (i < 2) s.text("ar" + i, "→", { x: x + 88, y: 258, fill: C.ink3, "font-size": 8 });
    });
    s.text("stn", f.ref ? "referência: " + f.ref + " · vencimento " + (f.venc || "—") : "mova a data para ver o cálculo", { x: 344, y: 286, fill: C.ink3, "font-size": 7.5 });
    if (f.persisted) s.text("stw", "gravado: " + f.persisted + " · calculado: " + f.calc, { x: 344, y: 302, fill: C.amber, "font-size": 7.5 });

    // estado final
    s.node("fin", "rect", { x: 336, y: 318, width: 286, height: 46, rx: 6, fill: f.phase === "confirm" || f.phase === "done" ? C.greenSoft : "#F7F4EA", stroke: C.line });
    s.text("fint", f.phase === "done" ? "Empréstimo registrado" : f.phase === "confirm" ? "Confirmando…" : "Nada gravado ainda", { x: 348, y: 338, fill: f.phase === "confirm" || f.phase === "done" ? C.green : C.ink3, "font-size": 8, "font-weight": 700 });
    s.text("fins", f.book ? f.book.code + " · vencimento " + (f.venc || "—") : "", { x: 348, y: 354, fill: C.ink3, "font-size": 7, "font-family": "var(--font-mono)" });
  }

  Lab.mount(root, {
    id: "emprestimo", width: 640, height: 400,
    params: [
      { key: "termo", label: "Termo de busca", type: "text", value: "LIV123" },
      { key: "cenario", label: "Cenário", type: "select", value: "unico", options: [
        { value: "unico", label: "Um candidato" }, { value: "multiplos", label: "Vários candidatos" },
        { value: "bloqueada", label: "Obra bloqueada" }, { value: "ativo", label: "Já emprestada" }] },
      { key: "dias", label: "Vencimento (dias a partir de hoje)", type: "range", min: -5, max: 10, value: 7 }
    ],
    presets: [
      { label: "LIV123 em 7 dias", params: { termo: "LIV123", cenario: "unico", dias: 7 } },
      { label: "Vence hoje", params: { termo: "LIV123", cenario: "unico", dias: 0 } },
      { label: "Vencido ontem", params: { termo: "LIV123", cenario: "unico", dias: -1 } },
      { label: "Vários “Manual”", params: { termo: "Manual", cenario: "multiplos", dias: 7 } },
      { label: "Bloqueada", params: { termo: "LIV171", cenario: "bloqueada", dias: 7 } },
      { label: "Já emprestada", params: { termo: "LIV207", cenario: "ativo", dias: 7 } }
    ],
    build: build, paint: paint
  });
})();
