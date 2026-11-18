/* Rotina 9 — Histórico: carregar, filtrar, ordenar */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  var RECORDS = [
    { id: 101, t: "Manual das Estrelas", d: "2026-11-02", dias: 0, st: "Bom" },
    { id: 102, t: "Órbita de Papel", d: "2026-11-03", dias: 2, st: "Bom" },
    { id: 103, t: "Cartas do Horizonte", d: "2026-11-03", dias: 0, st: "Regular" },
    { id: 104, t: "Sinais de Campo", d: "2026-11-05", dias: 5, st: "Bom" },
    { id: 105, t: "Prisma", d: "2026-11-05", dias: 1, st: "Bom" },
    { id: 106, t: "Estrelas do Sul", d: "2026-11-07", dias: 0, st: "Ótimo" },
    { id: 107, t: "Vozes do Rio", d: "2026-11-08", dias: 7, st: "Regular" },
    { id: 108, t: "Fronteira", d: "2026-11-08", dias: 3, st: "Bom" },
    { id: 109, t: "Tempo de Serviço", d: "2026-11-10", dias: 0, st: "Bom" },
    { id: 110, t: "Oficina de Palavras", d: "2026-11-11", dias: 4, st: "Bom" }
  ];

  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  function build(p) {
    var filtro = p.filtro, alg = p.algoritmo;
    var frames = [], log = [], visits = 0, kept = 0;
    var vis = [];
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        all: RECORDS, vis: vis.slice(), visits: visits, kept: kept, filtro: filtro,
        note: note, log: log.slice(),
        metrics: { "n": RECORDS.length, "visitados": visits, "visíveis": vis.length },
        state: { "filtro": filtro, "_todos": RECORDS.length, "_visiveis": vis.length }
      }, extra || {}));
    }
    add("_todos recebe " + RECORDS.length + " registros do banco. A tela ainda não filtrou nada.", { phase: "load", i: -1 });

    for (var i = 0; i < RECORDS.length; i++) {
      var r = RECORDS[i], keep = true, why = "sem filtro";
      if (filtro === "orbita") { keep = norm(r.t).indexOf("orbita") !== -1; why = keep ? "título contém “órbita”" : "título não contém"; }
      else if (filtro === "atrasados") { keep = r.dias > 0; why = keep ? "dias_atraso > 0" : "dias_atraso = 0"; }
      else if (filtro === "zero") { keep = r.dias === 0; why = keep ? "devolvido no prazo" : "tem atraso"; }
      else if (filtro === "datas") { keep = true; why = "sem filtro; datas iguais serão ordenadas"; }
      visits++;
      if (keep) { vis.push(r); kept++; }
      add("Visita #" + r.id + " · “" + r.t + "” · " + why + " → " + (keep ? "mantém" : "descarta") + ".", { phase: "filter", i: i, keep: keep });
    }

    if (alg === "sql") {
      var sorted = vis.slice().sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : b.id - a.id; });
      add("ORDER BY data_devolucao DESC, id DESC: " + sorted.length + " linhas já saem ordenadas do banco.", { phase: "sql", sorted: sorted });
      add("A tela só renderiza. O custo de ordenação fica no SGBD, não no laço do formulário.", { phase: "done", sorted: sorted });
      return { frames: frames };
    }

    // ordenação didática por data (desc) sobre a lista visível
    var arr = vis.slice(), comps = 0, writes = 0;
    function snap(note, extra) {
      add(note, Object.assign({ phase: "sort", comps: comps, writes: writes, arr: arr.slice() }, extra || {}));
    }
    snap("Início da ordenação didática: " + arr.length + " registros visíveis.", { i: -1 });
    if (alg === "insertion") {
      for (var a = 1; a < arr.length; a++) {
        var key = arr[a], b = a - 1;
        snap("Insertion: chave #" + key.id + " (" + key.d + ").", { i: a, key: key.id });
        while (b >= 0) {
          comps++;
          var gt = arr[b].d < key.d;
          snap("Compara #" + arr[b].id + " (" + arr[b].d + ") com a chave (" + key.d + ") → " + (gt ? "desloca." : "para."), { i: b, key: key.id });
          if (!gt) break;
          arr[b + 1] = arr[b]; writes++;
          snap("Desloca #" + arr[b].id + " uma posição à direita.", { i: b, key: key.id });
          b--;
        }
        arr[b + 1] = key; writes++;
        snap("Insere a chave na posição " + (b + 1) + ".", { i: b + 1, key: key.id });
      }
    } else {
      for (var s = 0; s < arr.length - 1; s++) {
        var min = s;
        snap("Selection: procura o menor a partir de " + s + ".", { i: s, min: min });
        for (var j = s + 1; j < arr.length; j++) {
          comps++;
          var menor = arr[j].d > arr[min].d;
          snap("Compara #" + arr[j].id + " com o mínimo #" + arr[min].id + " → " + (menor ? "novo mínimo." : "mantém."), { i: j, min: menor ? j : min });
          if (menor) min = j;
        }
        if (min !== s) {
          var tmp = arr[s]; arr[s] = arr[min]; arr[min] = tmp; writes += 2;
          snap("Troca posições " + s + " e " + min + ".", { i: s, min: min });
        }
      }
    }
    snap("Fim: " + arr.length + " registros ordenados por data desc. " + (alg === "insertion" ? "Insertion é estável: datas iguais mantêm a ordem relativa." : "Selection não é estável: a troca pode inverter datas iguais."), { i: -1, done: true });
    return { frames: frames };
  }

  function card(s, r, x, y, w, state, key) {
    var fill = state === "cur" ? C.amberSoft : state === "keep" ? C.greenSoft : state === "drop" ? "#F2EFE6" : C.white;
    var stroke = state === "cur" ? C.amber : state === "keep" ? "#7FB08F" : C.line;
    s.node("rc" + key, "rect", { x: x, y: y, width: w, height: 26, rx: 3, fill: fill, stroke: stroke });
    s.text("rt" + key, "#" + r.id + " " + r.t.slice(0, 18), { x: x + 5, y: y + 11, fill: state === "drop" ? "#A9A499" : C.ink, "font-size": 6.8 });
    s.text("rd" + key, r.d.slice(5) + " · " + r.dias + "d", { x: x + 5, y: y + 21, fill: C.ink3, "font-size": 6 });
  }

  function paint(f, s) {
    s.text("h", "Histórico: carregar, filtrar, ordenar", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "_todos → _visiveis → tela", { x: 16, y: 38, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    s.text("l1", "_todos · " + f.all.length, { x: 18, y: 58, fill: C.ink3, "font-size": 7.5, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    f.all.forEach(function (r, i) {
      var st = "idle";
      if (f.phase === "filter" && f.i === i) st = "cur";
      else if (f.phase === "filter" && f.i > i) st = (f.vis.indexOf(r) !== -1) ? "keep" : "drop";
      card(s, r, 18, 66 + i * 30, 188, st, "a" + i);
    });

    s.text("l2", "_visiveis · " + f.vis.length, { x: 228, y: 58, fill: C.ink3, "font-size": 7.5, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    f.vis.forEach(function (r, i) {
      card(s, r, 228, 66 + i * 30, 188, f.phase === "sort" && f.i === i ? "cur" : "keep", "v" + i);
    });
    if (!f.vis.length) s.text("empty", "nenhum registro visível", { x: 236, y: 84, fill: C.ink3, "font-size": 8, "font-style": "italic" });

    // ordenado
    if (f.phase === "sql" || f.phase === "done" || f.done) {
      var sorted = f.sorted || (f.arr || []).slice();
      s.text("l3", "tela ordenada · " + sorted.length, { x: 438, y: 58, fill: C.ink3, "font-size": 7.5, "letter-spacing": 1, "font-family": "var(--font-mono)" });
      sorted.slice(0, 10).forEach(function (r, i) {
        card(s, r, 438, 66 + i * 30, 186, "keep", "s" + i);
      });
      s.text("sqlnote", f.phase === "sql" ? "ORDER BY no banco" : "ordenação didática", { x: 438, y: 372, fill: C.amber, "font-size": 7.5, "font-family": "var(--font-mono)" });
    } else {
      s.node("box", "rect", { x: 438, y: 66, width: 186, height: 120, rx: 6, fill: "#F7F4EA", stroke: C.line });
      s.text("bt", "Ordenação", { x: 450, y: 86, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
      s.text("b1", "comparações: " + (f.comps || 0), { x: 450, y: 108, fill: C.ink2, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("b2", "escritas: " + (f.writes || 0), { x: 450, y: 124, fill: C.ink2, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("b3", f.alg === "selection" ? "não estável" : "estável", { x: 450, y: 146, fill: f.alg === "selection" ? C.red : C.green, "font-size": 8 });
    }

    // média
    var atras = f.vis.filter(function (r) { return r.dias > 0; });
    var media = atras.length ? (atras.reduce(function (a, b) { return a + b.dias; }, 0) / atras.length) : 0;
    s.text("med", "média de atraso (só DiasAtraso > 0): " + media.toFixed(1) + " dia(s)", { x: 228, y: 372, fill: C.ink3, "font-size": 7.5 });
  }

  Lab.mount(root, {
    id: "historico", width: 640, height: 400,
    params: [
      { key: "filtro", label: "Filtro", type: "select", value: "nenhum", options: [
        { value: "nenhum", label: "Sem filtro" }, { value: "orbita", label: "Busca “orbita”" }, { value: "atrasados", label: "Somente atrasados" },
        { value: "zero", label: "Sem atraso" }, { value: "datas", label: "Datas iguais" }] },
      { key: "algoritmo", label: "Ordenação", type: "select", value: "sql", options: [
        { value: "sql", label: "ORDER BY (SQL)" }, { value: "insertion", label: "Insertion (didática)" }, { value: "selection", label: "Selection (didática)" }] }
    ],
    presets: [
      { label: "Sem filtro · SQL", params: { filtro: "nenhum", algoritmo: "sql" } },
      { label: "Busca órbita", params: { filtro: "orbita", algoritmo: "sql" } },
      { label: "Atrasados · Insertion", params: { filtro: "atrasados", algoritmo: "insertion" } },
      { label: "Datas iguais · Selection", params: { filtro: "datas", algoritmo: "selection" } }
    ],
    build: build, paint: paint
  });
})();
