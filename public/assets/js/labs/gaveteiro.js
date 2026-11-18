/* Rotina 1 — Gaveteiro de 30 posições */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var D = window.PI_DATA, C = D.COLORS;

  function bookFor(drawer) {
    var f = D.CATALOG.filter(function (b) { return b.drawer === drawer; })[0];
    if (f) return f;
    var n = 300 + (parseInt(drawer[0], 10) * 7 + drawer.charCodeAt(1)) % 600;
    return { code: "LIV" + n, title: "Obra da gaveta " + drawer, authors: ["Autor fictício"], drawer: drawer, prazo: 7 };
  }

  function build(p) {
    var rows = +p.rows, cols = +p.cols;
    var letters = "ABCDEFGH".slice(0, cols).split("");
    var target = String(p.gaveta || "3C").toUpperCase();
    var valid = /^[1-8][A-H]$/.test(target) && +target[0] <= rows && letters.indexOf(target[1]) !== -1;
    if (!valid) target = "1A";
    var book = bookFor(target);
    var vista = p.vista;
    var total = rows * cols;
    var log = [];
    var frames = [];
    var phases = [
      ["Gaveta " + target + " fechada. O acervo tem " + total + " posições (" + rows + " × " + cols + ").", 0],
      ["A gaveta " + target + " abre e a ficha física sai. O código " + book.code + " já existia antes da tela.", 1],
      ["A ficha traz título, gaveta, prazo e autores. É o mesmo objeto que será gravado.", 2],
      ["O registro vira linha: INSERT em livros e vínculo em livro_autores.", 3],
      ["A consulta materializa o resultado: uma linha com " + book.authors.length + " autor(es).", 4],
      ["O formulário copia a linha para um item de List<Item> e desenha a lista.", 5],
      ["A relação livro–autor é muitos-para-muitos: " + book.authors.join(" e ") + ".", 6]
    ];
    phases.forEach(function (ph, i) {
      log.push("<span class='op'>passo " + (i + 1) + "</span> " + ph[0]);
      frames.push({
        phase: ph[1],
        note: ph[0],
        aria: "Fase " + (i + 1) + ": " + ph[0],
        metrics: {
          "gavetas": total, "laços": rows + "×" + cols,
          "consultas": i >= 3 ? 1 : 0, "passo": (i + 1) + "/" + phases.length
        },
        state: {
          "código": book.code, "título": book.title, "gaveta": target,
          "autores": book.authors.join(", "), "vista": vista, "fase": i
        },
        log: log.slice()
      });
    });
    return { frames: frames };
  }

  function paint(f, s, p) {
    var rows = +p.rows, cols = +p.cols;
    var letters = "ABCDEFGH".slice(0, cols).split("");
    var target = String(p.gaveta || "3C").toUpperCase();
    if (!/^[1-8][A-H]$/.test(target) || +target[0] > rows || letters.indexOf(target[1]) === -1) target = "1A";
    var book = bookFor(target);
    var phase = f.phase;

    // moldura
    s.node("cab", "rect", { x: 14, y: 44, width: 268, height: 342, rx: 10, fill: "#0A3F3A", stroke: "#17564F" });
    s.text("cabTitle", "ACERVO · " + rows + " × " + cols, { x: 26, y: 34, fill: C.ink2, "font-size": 10, "font-family": "var(--font-mono)" });

    var pad = 10, gap = 4;
    var x0 = 24, y0 = 56;
    var cw = (248 - (cols - 1) * gap) / cols;
    var ch = (318 - (rows - 1) * gap) / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var label = (r + 1) + letters[c];
        var isT = label === target;
        var open = isT && phase >= 1;
        var x = x0 + c * (cw + gap), y = y0 + r * (ch + gap);
        s.node("dr-" + label, "rect", {
          x: x, y: y, width: cw, height: ch, rx: 4,
          fill: open ? C.paper : isT ? "#1C6D60" : "#12524B",
          stroke: isT ? (open ? "#C9B98F" : "#7FD1AE") : "#1D6159",
          "stroke-width": isT ? 2 : 1
        });
        s.text("dt-" + label, label, {
          x: x + cw / 2, y: y + ch / 2 + 3, "text-anchor": "middle",
          fill: open ? C.green : isT ? "#E8FFF4" : "#A9CFC0",
          "font-size": Math.max(7, Math.min(10, cw / 4)), "font-weight": isT ? 700 : 400
        });
      }
    }

    // ficha saindo
    if (phase >= 1) {
      var ti = +target[0] - 1, ci = letters.indexOf(target[1]);
      var fx = x0 + ci * (cw + gap) + cw / 2 - 22;
      var fy = y0 + ti * (ch + gap) - 26;
      s.node("mini", "rect", { x: fx, y: fy, width: 44, height: 34, rx: 3, fill: C.paper, stroke: "#C9B98F" });
      s.text("miniT", book.code, { x: fx + 5, y: fy + 13, fill: C.blue, "font-size": 7, "font-weight": 700 });
      s.text("miniL", "ficha", { x: fx + 5, y: fy + 25, fill: C.ink3, "font-size": 6 });
    } else { s.hide("mini"); s.hide("miniT"); s.hide("miniL"); }

    // painel direito
    s.node("panel", "rect", { x: 296, y: 44, width: 330, height: 342, rx: 10, fill: C.white, stroke: C.line });
    var titles = { tela: "Vista da tela", dados: "Vista dos dados", modelo: "Vista do modelo" };
    s.text("ptitle", titles[p.vista] + " · fase " + (phase + 1), { x: 310, y: 68, fill: C.ink2, "font-size": 10, "font-weight": 700, "font-family": "var(--font-head)" });

    // cartão principal
    var layer = 0;
    if (p.vista === "dados") layer = phase >= 4 ? 2 : phase >= 3 ? 1 : 0;
    else if (p.vista === "modelo") layer = phase >= 6 ? 4 : phase >= 5 ? 3 : 0;
    else layer = phase >= 5 ? 3 : 0;
    if (phase >= 6) layer = 4;

    s.node("card", "rect", { x: 310, y: 82, width: 302, height: 224, rx: 8, fill: C.paper, stroke: layer === 4 ? C.green : C.line, "stroke-width": layer === 4 ? 1.5 : 1 });

    // limpa textos dinâmicos
    for (var i = 0; i < 12; i++) s.text("ln" + i, "", { x: 0, y: -20, fill: C.ink, "font-size": 9 });

    if (layer === 0) {
      s.node("card", "rect", { x: 310, y: 82, width: 302, height: 224, rx: 8, fill: "#FFFDF7", stroke: "#D8CFB8" });
      s.text("ln0", "FICHA FÍSICA", { x: 326, y: 106, fill: C.ink3, "font-size": 8, "letter-spacing": 1 });
      s.text("ln1", book.code, { x: 326, y: 136, fill: C.blue, "font-size": 22, "font-weight": 700, "font-family": "var(--font-mono)" });
      s.text("ln2", book.title.slice(0, 30), { x: 326, y: 160, fill: C.green, "font-size": 13, "font-weight": 700, "font-family": "var(--font-head)" });
      s.text("ln3", "Gaveta " + target + " · " + (book.cat || "Técnico") + " · prazo " + (book.prazo || 7) + " dias", { x: 326, y: 180, fill: C.ink3, "font-size": 9 });
      s.text("ln4", "Autores: " + book.authors.join(", "), { x: 326, y: 200, fill: C.ink2, "font-size": 9 });
      s.text("ln5", "A ficha não sabe o que é SQL. Ela só guarda o código.", { x: 326, y: 240, fill: C.ink3, "font-size": 8 });
      s.node("stamp", "rect", { x: 512, y: 96, width: 82, height: 22, rx: 3, fill: "none", stroke: C.red, transform: "rotate(-6 553 107)" });
      s.text("stampT", phase >= 3 ? "REGISTRO" : "FÍSICA", { x: 553, y: 111, "text-anchor": "middle", fill: C.red, "font-size": 8, "font-weight": 700, "letter-spacing": 1 });
    } else if (layer === 1) {
      s.text("ln0", "-- INSERT produzido pelo cadastro", { x: 322, y: 104, fill: "#6F9A8B", "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("ln1", "INSERT INTO livros", { x: 322, y: 124, fill: "#8FB8FF", "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("ln2", "  (codigo_livro, titulo, gaveta,", { x: 322, y: 140, fill: "#E2EEE8", "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("ln3", "   prazo_padrao_dias)", { x: 322, y: 156, fill: "#E2EEE8", "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("ln4", "VALUES ('" + book.code + "',", { x: 322, y: 176, fill: "#A8D8B0", "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("ln5", "  '" + book.title.slice(0, 22) + "',", { x: 322, y: 192, fill: "#A8D8B0", "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("ln6", "  '" + target + "', " + (book.prazo || 7) + ");", { x: 322, y: 208, fill: "#A8D8B0", "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("ln7", "INSERT IGNORE INTO livro_autores ...", { x: 322, y: 236, fill: "#FFD79A", "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("ln8", "PK: codigo_livro · uma linha por obra", { x: 322, y: 276, fill: C.ink3, "font-size": 8 });
    } else if (layer === 2) {
      s.node("tblH", "rect", { x: 320, y: 96, width: 282, height: 20, rx: 3, fill: "#E8E4D8" });
      ["codigo_livro", "titulo", "gaveta", "prazo"].forEach(function (h, i) {
        s.text("th" + i, h, { x: 326 + i * 70, y: 110, fill: C.ink2, "font-size": 7.5, "font-weight": 700, "font-family": "var(--font-mono)" });
      });
      s.node("tblR", "rect", { x: 320, y: 118, width: 282, height: 26, rx: 2, fill: C.greenSoft, stroke: "#C4D9CD" });
      s.text("td0", book.code, { x: 326, y: 135, fill: C.green, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("td1", book.title.slice(0, 16), { x: 396, y: 135, fill: C.ink, "font-size": 8 });
      s.text("td2", target, { x: 500, y: 135, fill: C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("td3", String(book.prazo || 7), { x: 545, y: 135, fill: C.ink, "font-size": 8 });
      s.text("ln1", "DataTable / MySqlDataReader", { x: 322, y: 172, fill: C.ink3, "font-size": 8, "font-weight": 700 });
      s.text("ln2", "1 linha materializada · " + book.authors.length + " autor(es) via GROUP_CONCAT", { x: 322, y: 192, fill: C.ink2, "font-size": 8 });
      s.text("ln3", "A tela não vê o banco: vê esta cópia.", { x: 322, y: 214, fill: C.ink3, "font-size": 8 });
      s.text("ln4", "Custo: leitura + materialização", { x: 322, y: 244, fill: C.amber, "font-size": 8 });
    } else if (layer === 3) {
      s.text("ln0", "List<Item> · Count = 15 · Capacity = 16", { x: 322, y: 104, fill: C.ink2, "font-size": 8, "font-family": "var(--font-mono)" });
      for (var k = 0; k < 8; k++) {
        var xx = 322 + k * 35;
        s.node("cell" + k, "rect", { x: xx, y: 118, width: 30, height: 34, rx: 3, fill: k === 3 ? C.blueSoft : C.white, stroke: k === 3 ? C.blue : C.line });
        s.text("ci" + k, String(k), { x: xx + 15, y: 132, "text-anchor": "middle", fill: C.ink3, "font-size": 6 });
        s.text("cv" + k, k === 3 ? book.code.slice(3) : "…", { x: xx + 15, y: 146, "text-anchor": "middle", fill: k === 3 ? C.blue : C.ink3, "font-size": 7, "font-weight": k === 3 ? 700 : 400 });
      }
      s.text("ln1", "índice 3 → " + book.code + " (Θ(1))", { x: 322, y: 176, fill: C.blue, "font-size": 9 });
      s.text("ln2", "Item { Codigo = \"" + book.code + "\",", { x: 322, y: 200, fill: C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("ln3", "       Titulo = \"" + book.title.slice(0, 18) + "\" }", { x: 322, y: 214, fill: C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("ln4", "A lista guarda referências; o objeto é o mesmo.", { x: 322, y: 248, fill: C.ink3, "font-size": 8 });
      s.text("ln5", "Append amortizado Θ(1) · busca Θ(n)", { x: 322, y: 270, fill: C.amber, "font-size": 8 });
    } else {
      // bipartido
      var bx = 326, by = 120;
      s.text("ln0", "livro_autores · chave composta", { x: 322, y: 104, fill: C.ink2, "font-size": 8, "font-weight": 700 });
      s.node("bipL", "rect", { x: bx, y: by, width: 88, height: 26, rx: 4, fill: C.blueSoft, stroke: C.blue });
      s.text("bipLT", book.code, { x: bx + 44, y: by + 17, "text-anchor": "middle", fill: C.blue, "font-size": 8, "font-weight": 700 });
      book.authors.forEach(function (a, i) {
        var ay = by + i * 44;
        s.node("bipA" + i, "rect", { x: bx + 180, y: ay, width: 96, height: 26, rx: 4, fill: C.greenSoft, stroke: "#9EC4AE" });
        s.text("bipAT" + i, a, { x: bx + 228, y: ay + 17, "text-anchor": "middle", fill: C.green, "font-size": 8 });
        s.node("bipE" + i, "line", { x1: bx + 88, y1: by + 13, x2: bx + 180, y2: ay + 13, stroke: C.amber, "stroke-width": 1.6 });
      });
      s.text("ln1", "PK(codigo_livro, id_autor) → sem par repetido", { x: 322, y: 236, fill: C.ink3, "font-size": 8 });
      s.text("ln2", "FK CASCADE nos dois lados", { x: 322, y: 252, fill: C.ink3, "font-size": 8 });
      s.text("ln3", "Grafo bipartido: livros × autores", { x: 322, y: 274, fill: C.green, "font-size": 8 });
    }

    // chips de camadas
    var chips = ["Ficha", "SQL", "Tabela", "Lista"];
    chips.forEach(function (label, i) {
      var cx = 310 + i * 76;
      var active = layer === i;
      s.node("ch" + i, "rect", { x: cx, y: 322, width: 70, height: 24, rx: 5, fill: active ? C.green : C.white, stroke: active ? C.green : C.line });
      s.text("cht" + i, label, { x: cx + 35, y: 338, "text-anchor": "middle", fill: active ? "#fff" : C.ink3, "font-size": 8, "font-weight": active ? 700 : 400 });
    });

    // contador de laços
    s.text("loop", "for (i = 0; i < " + rows + "; i++)  for (j = 0; j < " + cols + "; j++)  →  " + (rows * cols) + " gavetas",
      { x: 310, y: 372, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
  }

  Lab.mount(root, {
    id: "gaveteiro",
    width: 640, height: 400,
    params: [
      { key: "gaveta", label: "Gaveta", type: "text", value: "3C" },
      { key: "vista", label: "Vista", type: "select", value: "tela", options: [
        { value: "tela", label: "Tela da biblioteca" }, { value: "dados", label: "Dados e código" }, { value: "modelo", label: "Modelo teórico" }] },
      { key: "rows", label: "Linhas", type: "range", min: 1, max: 8, value: 6 },
      { key: "cols", label: "Colunas", type: "range", min: 1, max: 8, value: 5 }
    ],
    presets: [
      { label: "3C", params: { gaveta: "3C", rows: 6, cols: 5, vista: "tela" } },
      { label: "1A", params: { gaveta: "1A", rows: 6, cols: 5, vista: "dados" } },
      { label: "6E", params: { gaveta: "6E", rows: 6, cols: 5, vista: "modelo" } },
      { label: "Grade 4×3", params: { gaveta: "2B", rows: 4, cols: 3, vista: "tela" } }
    ],
    build: build,
    paint: paint
  });
})();
