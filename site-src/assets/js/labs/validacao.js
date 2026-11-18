/* Rotina 4 — Validação com autômato, pilha e tabela */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  var AFD_CODIGO = {
    start: "q0", accept: ["q6"],
    cols: ["L", "I", "V", "0-9", "outro"],
    rows: ["q0", "q1", "q2", "q3", "q4", "q5", "q6"],
    delta: {
      q0: { L: "q1" }, q1: { I: "q2" }, q2: { V: "q3" }, q3: { "0-9": "q4" },
      q4: { "0-9": "q5" }, q5: { "0-9": "q6" }, q6: {}
    }
  };
  var AFD_GAVETA = {
    start: "g0", accept: ["g2"],
    cols: ["1-6", "A-E", "outro"],
    rows: ["g0", "g1", "g2"],
    delta: { g0: { "1-6": "g1" }, g1: { "A-E": "g2" }, g2: {} }
  };

  function colFor(ch, kind) {
    if (kind === "codigo") {
      if (ch === "L" || ch === "I" || ch === "V") return ch;
      if (/[0-9]/.test(ch)) return "0-9";
      return "outro";
    }
    if (/[1-6]/.test(ch)) return "1-6";
    if (/[A-E]/.test(ch)) return "A-E";
    return "outro";
  }

  function buildAfd(input, kind) {
    var M = kind === "codigo" ? AFD_CODIGO : AFD_GAVETA;
    var chars = input.split("");
    var q = M.start, log = [], frames = [], trans = 0;
    frames.push({
      kind: kind, chars: chars, pos: -1, state: q, activeCol: null, result: "em curso",
      note: "Início em " + q + ". A fita tem " + chars.length + " símbolo(s).",
      metrics: { "símbolos": chars.length, "transições": 0, "estado": q },
      state: { "entrada": input || "(vazia)", "estado": q, "posição": "—", "resultado": "em curso" }, log: log.slice()
    });
    for (var i = 0; i < chars.length; i++) {
      var col = colFor(chars[i], kind);
      var nxt = (M.delta[q] || {})[col];
      if (!nxt) {
        log.push("<span class='op'>rejeita</span> " + q + " não tem transição para “" + chars[i] + "”.");
        frames.push({
          kind: kind, chars: chars, pos: i, state: q, activeCol: col, result: "rejeitada", error: true,
          note: "Rejeição imediata: em " + q + " não existe transição com “" + chars[i] + "” (coluna " + col + ").",
          metrics: { "símbolos": i + 1, "transições": trans, "estado": q },
          state: { "entrada": input, "estado": q + " (sem transição)", "posição": i, "resultado": "rejeitada" }, log: log.slice()
        });
        return frames;
      }
      q = nxt; trans++;
      log.push("<span class='op'>δ</span> " + chars[i] + " → " + q);
      frames.push({
        kind: kind, chars: chars, pos: i, state: q, activeCol: col, result: "em curso",
        note: "Lê “" + chars[i] + "”, coluna " + col + ", vai para " + q + ".",
        metrics: { "símbolos": i + 1, "transições": trans, "estado": q },
        state: { "entrada": input, "estado": q, "posição": i, "resultado": "em curso" }, log: log.slice()
      });
    }
    var ok = M.accept.indexOf(q) !== -1;
    frames.push({
      kind: kind, chars: chars, pos: chars.length, state: q, activeCol: null, result: ok ? "aceita" : "rejeitada",
      note: ok ? "Fim da fita em estado final " + q + ": aceita." : "Fim da fita em " + q + ", que não é final: rejeitada.",
      metrics: { "símbolos": chars.length, "transições": trans, "estado": q },
      state: { "entrada": input, "estado": q, "posição": "fim", "resultado": ok ? "aceita" : "rejeitada" }, log: log.slice()
    });
    return frames;
  }

  function buildPilha(input) {
    var chars = input.split(""), stack = [], log = [], frames = [], depth = 0;
    frames.push({
      kind: "importacao", chars: chars, pos: -1, stack: [], depth: 0, result: "em curso",
      note: "Pilha vazia. Cada “abre colchete” empilha o fechamento esperado; cada “]” desempilha.",
      metrics: { "símbolos": chars.length, "passos": 0, "profundidade": 0 },
      state: { "entrada": input, "pilha": "vazia", "posição": "—", "resultado": "em curso" }, log: []
    });
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      if (ch === "[") {
        stack.push("]"); depth = Math.max(depth, stack.length);
        log.push("<span class='op'>push</span> “abre colchete” na posição " + i + " · profundidade " + stack.length);
        frames.push({
          kind: "importacao", chars: chars, pos: i, stack: stack.slice(), depth: depth, result: "em curso",
          note: "“abre colchete” empilha “]”. Profundidade agora é " + stack.length + ".",
          metrics: { "símbolos": i + 1, "passos": i + 1, "profundidade": stack.length },
          state: { "entrada": input, "pilha": stack.join("") || "vazia", "posição": i, "resultado": "em curso" }, log: log.slice()
        });
      } else if (ch === "]") {
        if (!stack.length) {
          log.push("<span class='op'>erro</span> “fecha colchete” sem “abre colchete” correspondente.");
          frames.push({
            kind: "importacao", chars: chars, pos: i, stack: [], depth: depth, result: "rejeitada", error: true,
            note: "Underflow: “]” na posição " + i + " sem “abre colchete” aberto. A cadeia é rejeitada.",
            metrics: { "símbolos": i + 1, "passos": i + 1, "profundidade": 0 },
            state: { "entrada": input, "pilha": "vazia", "posição": i, "resultado": "rejeitada" }, log: log.slice()
          });
          return frames;
        }
        stack.pop();
        log.push("<span class='op'>pop</span> “]” na posição " + i + " · profundidade " + stack.length);
        frames.push({
          kind: "importacao", chars: chars, pos: i, stack: stack.slice(), depth: depth, result: "em curso",
          note: "“]” desempilha. Profundidade cai para " + stack.length + ".",
          metrics: { "símbolos": i + 1, "passos": i + 1, "profundidade": stack.length },
          state: { "entrada": input, "pilha": stack.join("") || "vazia", "posição": i, "resultado": "em curso" }, log: log.slice()
        });
      } else if (/[A-Za-z0-9]/.test(ch)) {
        frames.push({
          kind: "importacao", chars: chars, pos: i, stack: stack.slice(), depth: depth, result: "em curso",
          note: "“" + ch + "” é conteúdo: não altera a pilha.",
          metrics: { "símbolos": i + 1, "passos": i + 1, "profundidade": stack.length },
          state: { "entrada": input, "pilha": stack.join("") || "vazia", "posição": i, "resultado": "em curso" }, log: log.slice()
        });
      } else {
        frames.push({
          kind: "importacao", chars: chars, pos: i, stack: stack.slice(), depth: depth, result: "rejeitada", error: true,
          note: "Símbolo “" + ch + "” fora do alfabeto da ficha. Rejeitada.",
          metrics: { "símbolos": i + 1, "passos": i + 1, "profundidade": stack.length },
          state: { "entrada": input, "pilha": stack.join("") || "vazia", "posição": i, "resultado": "rejeitada" }, log: log.slice()
        });
        return frames;
      }
    }
    var ok = stack.length === 0;
    frames.push({
      kind: "importacao", chars: chars, pos: chars.length, stack: [], depth: depth, result: ok ? "aceita" : "rejeitada",
      note: ok ? "Fim da fita com pilha vazia: aceita. Profundidade máxima " + depth + "." : "Sobraram " + stack.length + " fechamento(s) na pilha: rejeitada.",
      metrics: { "símbolos": chars.length, "passos": chars.length, "profundidade": depth },
      state: { "entrada": input, "pilha": stack.join("") || "vazia", "posição": "fim", "resultado": ok ? "aceita" : "rejeitada" }, log: log.slice()
    });
    return frames;
  }

  function build(p) {
    var input = String(p.entrada === undefined ? "" : p.entrada);
    if (p.modo === "importacao") return { frames: buildPilha(input || "[A[T]B]") };
    if (p.modo === "gaveta") return { frames: buildAfd(input.toUpperCase() || "3C", "gaveta") };
    return { frames: buildAfd(input.toUpperCase(), "codigo") };
  }

  function paint(f, s) {
    var chars = f.chars || [];
    s.text("h", f.kind === "importacao" ? "Ficha de importação · pilha" : "Autômato finito determinístico", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    var re = f.kind === "codigo" ? "^LIV[0-9]{3}$" : f.kind === "gaveta" ? "^[1-6][A-E]$" : "S → '[' S ']' S | ε";
    s.text("re", re, { x: 16, y: 39, fill: C.blue, "font-size": 9, "font-family": "var(--font-mono)" });

    // fita
    var n = Math.max(chars.length, 1);
    var bw = Math.min(46, 520 / n), x0 = 20;
    for (var i = 0; i < chars.length; i++) {
      var x = x0 + i * (bw + 4), y = 58;
      var cur = f.pos === i;
      s.node("c" + i, "rect", { x: x, y: y, width: bw, height: 38, rx: 4, fill: cur ? (f.error ? C.redSoft : C.amberSoft) : C.white, stroke: cur ? (f.error ? C.red : C.amber) : C.line, "stroke-width": cur ? 2 : 1 });
      s.text("ct" + i, chars[i], { x: x + bw / 2, y: y + 25, "text-anchor": "middle", fill: cur ? (f.error ? C.red : C.amber) : C.ink, "font-size": 15, "font-family": "var(--font-mono)", "font-weight": 700 });
      s.text("ci" + i, String(i), { x: x + bw / 2, y: y - 4, "text-anchor": "middle", fill: C.ink3, "font-size": 6.5, "font-family": "var(--font-mono)" });
    }
    if (!chars.length) s.text("empty", "(cadeia vazia)", { x: 22, y: 82, fill: C.ink3, "font-size": 9, "font-style": "italic" });
    s.text("head", "▲", { x: x0 + Math.max(0, f.pos) * (bw + 4) + bw / 2, y: 108, "text-anchor": "middle", fill: C.blue, "font-size": 10 });

    // resultado
    var ok = f.result === "aceita", bad = f.result === "rejeitada";
    s.node("res", "rect", { x: 470, y: 58, width: 154, height: 44, rx: 7, fill: ok ? C.greenSoft : bad ? C.redSoft : "#F4F1E7", stroke: ok ? "#7FB08F" : bad ? "#D8A5A5" : C.line });
    s.text("rest", f.result.toUpperCase(), { x: 547, y: 78, "text-anchor": "middle", fill: ok ? C.green : bad ? C.red : C.ink3, "font-size": 11, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("ress", f.kind === "importacao" ? "pilha " + (f.stack || []).length : "estado " + ((f.state && f.state.estado) || "—"), { x: 547, y: 93, "text-anchor": "middle", fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    if (f.kind === "importacao") {
      // pilha
      s.text("pt", "PILHA", { x: 20, y: 146, fill: C.ink3, "font-size": 8, "letter-spacing": 1, "font-family": "var(--font-mono)" });
      var st = f.stack || [];
      s.node("pbase", "line", { x1: 20, y1: 330, x2: 120, y2: 330, stroke: C.ink2, "stroke-width": 2 });
      for (var k = 0; k < st.length; k++) {
        var sy = 314 - k * 26;
        s.node("pk" + k, "rect", { x: 24, y: sy, width: 92, height: 22, rx: 3, fill: k === st.length - 1 ? C.amberSoft : C.white, stroke: k === st.length - 1 ? C.amber : C.line });
        s.text("pkt" + k, st[k], { x: 70, y: sy + 15, "text-anchor": "middle", fill: C.ink, "font-size": 10, "font-family": "var(--font-mono)" });
      }
      if (!st.length) s.text("pempty", "vazia", { x: 70, y: 322, "text-anchor": "middle", fill: C.ink3, "font-size": 8, "font-style": "italic" });

      // árvore por indentação
      s.text("tt", "Derivação (indentação)", { x: 150, y: 146, fill: C.ink3, "font-size": 8, "letter-spacing": 1, "font-family": "var(--font-mono)" });
      var depth = 0, rows = [], line = "";
      for (var j = 0; j < chars.length; j++) {
        var ch = chars[j];
        if (ch === "[") { if (line) { rows.push([depth, line]); line = ""; } rows.push([depth, "["]); depth++; }
        else if (ch === "]") { if (line) { rows.push([depth, line]); line = ""; } depth = Math.max(0, depth - 1); rows.push([depth, "]"]); }
        else line += ch;
        if (j === f.pos && line) { rows.push([depth, line + "  ◀"]); line = ""; }
      }
      if (line) rows.push([depth, line]);
      rows.slice(0, 10).forEach(function (r, idx) {
        s.text("tr" + idx, "  ".repeat(r[0]) + r[1], { x: 150, y: 166 + idx * 20, fill: idx === rows.length - 1 && f.pos >= 0 ? C.blue : C.ink2, "font-size": 9.5, "font-family": "var(--font-mono)" });
      });
      s.text("note", "A pilha reconhece aninhamento; a árvore é a leitura estrutural da mesma cadeia.", { x: 20, y: 366, fill: C.ink3, "font-size": 7.5 });
      return;
    }

    // tabela de transição
    var M = f.kind === "codigo" ? AFD_CODIGO : AFD_GAVETA;
    var tx = 20, ty = 138, cw = 96, rh = 24;
    s.text("tt", "δ · tabela de transição", { x: tx, y: ty - 6, fill: C.ink3, "font-size": 8, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    s.node("th", "rect", { x: tx, y: ty, width: 60, height: rh, fill: "#E8E4D8" });
    s.text("tht", "estado", { x: tx + 30, y: ty + 17, "text-anchor": "middle", fill: C.ink2, "font-size": 7.5, "font-weight": 700, "font-family": "var(--font-mono)" });
    M.cols.forEach(function (c, i) {
      s.node("hc" + i, "rect", { x: tx + 60 + i * cw, y: ty, width: cw, height: rh, fill: "#E8E4D8", stroke: C.white });
      s.text("hct" + i, c, { x: tx + 60 + i * cw + cw / 2, y: ty + 17, "text-anchor": "middle", fill: C.ink2, "font-size": 7.5, "font-weight": 700, "font-family": "var(--font-mono)" });
    });
    M.rows.forEach(function (r, ri) {
      var y = ty + rh * (ri + 1);
      var isCur = f.state === r;
      s.node("hr" + ri, "rect", { x: tx, y: y, width: 60, height: rh, fill: isCur ? C.blueSoft : C.white, stroke: C.line });
      s.text("hrt" + ri, r + (M.accept.indexOf(r) !== -1 ? " *" : ""), { x: tx + 30, y: y + 17, "text-anchor": "middle", fill: isCur ? C.blue : C.ink2, "font-size": 8, "font-weight": isCur ? 700 : 400, "font-family": "var(--font-mono)" });
      M.cols.forEach(function (c, ci) {
        var v = (M.delta[r] || {})[c] || "—";
        var active = isCur && f.activeCol === c;
        s.node("hc" + ri + "-" + ci, "rect", { x: tx + 60 + ci * cw, y: y, width: cw, height: rh, fill: active ? C.amberSoft : C.white, stroke: C.line });
        s.text("hct" + ri + "-" + ci, v, { x: tx + 60 + ci * cw + cw / 2, y: y + 17, "text-anchor": "middle", fill: active ? C.amber : v === "—" ? "#BDB8AA" : C.ink2, "font-size": 8, "font-weight": active ? 700 : 400, "font-family": "var(--font-mono)" });
      });
    });
    s.text("acc", "* estado final. Estados inalcançáveis após o último símbolo continuam na tabela — o AFD é total para o alfabeto.", { x: 20, y: 374, fill: C.ink3, "font-size": 7 });
  }

  Lab.mount(root, {
    id: "validacao", width: 640, height: 400,
    params: [
      { key: "modo", label: "Linguagem", type: "select", value: "codigo", options: [
        { value: "codigo", label: "Código LIVnnn" }, { value: "gaveta", label: "Gaveta nL" }, { value: "importacao", label: "Ficha com colchetes" }] },
      { key: "entrada", label: "Cadeia de entrada", type: "text", value: "LIV123" }
    ],
    presets: [
      { label: "LIV123", params: { modo: "codigo", entrada: "LIV123" } },
      { label: "LIV123X", params: { modo: "codigo", entrada: "LIV123X" } },
      { label: "LIV12", params: { modo: "codigo", entrada: "LIV12" } },
      { label: "Gaveta 3C", params: { modo: "gaveta", entrada: "3C" } },
      { label: "Gaveta 7C", params: { modo: "gaveta", entrada: "7C" } },
      { label: "[A[T]B]", params: { modo: "importacao", entrada: "[A[T]B]" } },
      { label: "[A[T]B", params: { modo: "importacao", entrada: "[A[T]B" } }
    ],
    build: build, paint: paint
  });
})();
