/* Rotina 7 — Custo, ocupação e crescimento */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  function build(p) {
    var n = Math.max(4, +p.n), alpha = Math.max(0.1, +p.ocupacao / 100);
    var m = Math.max(1, Math.ceil(n / alpha));
    var frames = [], log = [];
    if (p.modo === "crescimento") {
      var fams = [
        ["constante", function (x) { return 1; }, "Θ(1)"],
        ["log n", function (x) { return Math.log2(x); }, "Θ(log n)"],
        ["n", function (x) { return x; }, "Θ(n)"],
        ["n log n", function (x) { return x * Math.log2(x); }, "Θ(n log n)"],
        ["n²", function (x) { return x * x; }, "Θ(n²)"]
      ];
      fams.forEach(function (f, i) {
        log.push("<span class='op'>curva</span> " + f[2]);
        frames.push({
          mode: "chart", fams: fams, hi: i, n: n,
          note: f[2] + ": para n = " + n + ", o valor é " + (f[1](n) >= 1000 ? Math.round(f[1](n)).toLocaleString("pt-BR") : f[1](n).toFixed(1)) + ". " + (i === 4 ? "Dobrar n quadruplica o custo." : i === 3 ? "Dobrar n um pouco mais que dobra." : i === 2 ? "Dobrar n dobra." : i === 1 ? "Dobrar n acrescenta uma comparação." : "Não cresce com n."),
          metrics: { "n": n, "curva": f[2], "valor": Math.round(f[1](n) * 10) / 10 },
          state: { "modo": "crescimento", "n": n, "curva": f[2] }, log: log.slice()
        });
      });
      return { frames: frames };
    }

    frames.push({
      mode: "op", strategy: p.estrategia, n: n, m: m, alpha: (n / m).toFixed(2), i: -1,
      note: "n = " + n + ", m = " + m + ", α = n/m = " + (n / m).toFixed(2) + ". Escolha a estratégia e avance.",
      metrics: { "n": n, "m": m, "α": (n / m).toFixed(2), "comparações": 0 },
      state: { "estratégia": p.estrategia, "n": n }, log: []
    });

    if (p.estrategia === "varredura") {
      [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor(3 * n / 4), n - 1].forEach(function (i, k) {
        log.push("<span class='op'>compara</span> índice " + i + " · " + (i + 1) + " comparações");
        frames.push({
          mode: "op", strategy: "varredura", n: n, i: i, comp: i + 1,
          note: "Varredura: para chegar ao índice " + i + ", o laço comparou " + (i + 1) + " vezes. No pior caso, n = " + n + ".",
          metrics: { "n": n, "comparações": i + 1, "pior caso": n, "média": (n + 1) / 2 },
          state: { "estratégia": "varredura", "posição": i, "comparações": i + 1 }, log: log.slice()
        });
      });
    } else if (p.estrategia === "bst") {
      var h = Math.ceil(Math.log2(n + 1));
      for (var d = 1; d <= h; d++) {
        log.push("<span class='op'>nível</span> " + d + " · " + d + " comparações");
        frames.push({
          mode: "op", strategy: "bst", n: n, depth: d, comp: d, h: h,
          note: "BST balanceada: no nível " + d + ", a busca fez " + d + " comparações. Altura h = " + h + " ≈ log₂ n.",
          metrics: { "n": n, "comparações": d, "altura": h, "pior caso": h },
          state: { "estratégia": "BST", "nível": d, "comparações": d }, log: log.slice()
        });
      }
      frames.push({
        mode: "op", strategy: "bst", n: n, depth: h + 1, comp: n, degenerate: true,
        note: "Se a inserção for em ordem crescente, a BST degenera em lista: a busca passa a custar n = " + n + ".",
        metrics: { "n": n, "comparações": n, "altura": n - 1, "balanceada": "não" },
        state: { "estratégia": "BST degenerada", "altura": n - 1 }, log: log.slice()
      });
    } else {
      var expected = 1 + (n / m) / 2;
      frames.push({
        mode: "op", strategy: "hash", n: n, m: m, comp: 1, bucket: 4,
        note: "Hash: h(chave) = chave mod m = 4. Uma comparação para localizar o bucket.",
        metrics: { "n": n, "m": m, "α": (n / m).toFixed(2), "comparações": 1 },
        state: { "estratégia": "hash", "bucket": 4, "α": (n / m).toFixed(2) }, log: log.slice()
      });
      frames.push({
        mode: "op", strategy: "hash", n: n, m: m, comp: expected, probes: expected,
        note: "Com encadeamento e α = " + (n / m).toFixed(2) + ", o número esperado de comparações é 1 + α/2 ≈ " + expected.toFixed(2) + ".",
        metrics: { "n": n, "m": m, "α": (n / m).toFixed(2), "esperado": expected.toFixed(2) },
        state: { "estratégia": "hash", "tentativas esperadas": expected.toFixed(2) }, log: log.slice()
      });
      frames.push({
        mode: "op", strategy: "hash", n: n, m: m, comp: n, worst: true,
        note: "Pior caso: todas as n chaves no mesmo bucket. A busca degenera para Θ(n). O hash não elimina o pior caso; só o torna improvável.",
        metrics: { "n": n, "m": m, "α": (n / m).toFixed(2), "pior caso": n },
        state: { "estratégia": "hash", "pior caso": "todos no mesmo bucket" }, log: log.slice()
      });
    }
    return { frames: frames };
  }

  function chart(s, f) {
    var x0 = 350, y0 = 70, w = 270, h = 250;
    s.node("ax", "line", { x1: x0, y1: y0 + h, x2: x0 + w, y2: y0 + h, stroke: C.ink3 });
    s.node("ay", "line", { x1: x0, y1: y0, x2: x0, y2: y0 + h, stroke: C.ink3 });
    s.text("xl", "n →", { x: x0 + w - 20, y: y0 + h + 16, fill: C.ink3, "font-size": 7 });
    s.text("yl", "custo (escala log)", { x: x0 + 6, y: y0 - 8, fill: C.ink3, "font-size": 7 });
    var maxV = 64 * 64, maxY = Math.log10(1 + maxV);
    (f.fams || []).forEach(function (fam, i) {
      var pts = [];
      for (var k = 4; k <= 64; k += 2) {
        var v = Math.max(0, fam[1](k));
        var x = x0 + (k / 64) * w;
        var y = y0 + h - (Math.log10(1 + v) / maxY) * h;
        pts.push(x.toFixed(1) + "," + y.toFixed(1));
      }
      var on = f.hi === i;
      s.node("cv" + i, "polyline", { points: pts.join(" "), fill: "none", stroke: on ? C.blue : "#C9CFC9", "stroke-width": on ? 2.4 : 1.2, "stroke-dasharray": on ? "0" : "3 3" });
      s.text("cl" + i, fam[2], { x: x0 + w + 6, y: y0 + 20 + i * 18, fill: on ? C.blue : C.ink3, "font-size": 7.5, "font-weight": on ? 700 : 400, "font-family": "var(--font-mono)" });
    });
  }

  function paint(f, s) {
    s.text("h", f.mode === "chart" ? "Crescimento assintótico" : "Custo de uma operação", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    if (f.mode === "chart") {
      chart(s, f);
      s.node("box", "rect", { x: 16, y: 60, width: 300, height: 260, rx: 8, fill: C.white, stroke: C.line });
      s.text("bt", "Leitura da curva", { x: 30, y: 82, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
      (f.fams || []).forEach(function (fam, i) {
        var on = f.hi === i;
        s.text("bl" + i, fam[2] + "  →  " + (fam[1](f.n) >= 1000 ? Math.round(fam[1](f.n)).toLocaleString("pt-BR") : fam[1](f.n).toFixed(1)), { x: 30, y: 108 + i * 26, fill: on ? C.blue : C.ink2, "font-size": 8.5, "font-weight": on ? 700 : 400, "font-family": "var(--font-mono)" });
      });
      s.text("bn", "Para n = " + f.n + ". A escala vertical é logarítmica: sem ela, n² achata todas as outras.", { x: 30, y: 262, fill: C.ink3, "font-size": 7 });
      s.text("bn2", "Dobrar n: constante 0, log +1, n ×2, n log n ~×2,2, n² ×4.", { x: 30, y: 280, fill: C.amber, "font-size": 7.5 });
      return;
    }
    // operandos
    var n = f.n, i = f.i === undefined ? -1 : f.i;
    s.text("ot", f.strategy === "varredura" ? "Vetor de " + n + " posições" : f.strategy === "bst" ? "BST com " + n + " nós" : "Tabela com m = " + f.m + " buckets", { x: 16, y: 58, fill: C.ink3, "font-size": 7.5, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    if (f.strategy === "varredura") {
      var per = Math.ceil(26 / Math.ceil(n / 26));
      for (var k = 0; k < n; k++) {
        var col = k % 26, row = Math.floor(k / 26);
        var x = 18 + col * 11, y = 70 + row * 15;
        s.node("vc" + k, "rect", { x: x, y: y, width: 9, height: 12, rx: 1.5, fill: k === i ? C.amber : k < i ? "#E6E2D6" : C.white, stroke: k === i ? C.amber : C.line });
      }
      s.text("ptr", "▲ índice " + (i < 0 ? "—" : i), { x: 18 + Math.max(0, i % 26) * 11, y: 70 + Math.floor(Math.max(0, i) / 26) * 15 - 4, fill: C.blue, "font-size": 7 });
      s.text("cmp", f.comp ? f.comp + " comparações até aqui" : "aguardando", { x: 16, y: 210, fill: C.blue, "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("worst", "pior caso: n = " + n, { x: 16, y: 228, fill: C.ink3, "font-size": 7.5 });
    } else if (f.strategy === "bst") {
      var levels = Math.min(7, f.h || Math.ceil(Math.log2(n + 1)));
      for (var d = 0; d < levels; d++) {
        var count = Math.pow(2, d), y2 = 82 + d * 30;
        for (var j = 0; j < Math.min(count, 16); j++) {
          var x2 = 160 + (j - (Math.min(count, 16) - 1) / 2) * 34;
          s.node("bn" + d + "-" + j, "circle", { cx: x2, cy: y2, r: 8, fill: d < (f.depth || 0) ? C.blueSoft : C.white, stroke: d < (f.depth || 0) ? C.blue : C.line });
        }
      }
      s.text("dep", f.depth ? "nível " + f.depth + " · " + f.comp + " comparações" : "aguardando", { x: 16, y: 300, fill: C.blue, "font-size": 9, "font-family": "var(--font-mono)" });
      if (f.degenerate) s.text("deg", "degenerada: altura " + (n - 1), { x: 16, y: 318, fill: C.red, "font-size": 8 });
    } else {
      for (var b = 0; b < Math.min(f.m, 26); b++) {
        var bx = 18 + (b % 13) * 22, by = 74 + Math.floor(b / 13) * 54;
        s.node("bk" + b, "rect", { x: bx, y: by, width: 18, height: 40, rx: 3, fill: b === (f.bucket || 4) ? C.amberSoft : C.white, stroke: b === (f.bucket || 4) ? C.amber : C.line });
        s.text("bkt" + b, String(b), { x: bx + 9, y: by + 24, "text-anchor": "middle", fill: C.ink3, "font-size": 6.5 });
        var chain = Math.round(n / f.m);
        for (var c = 0; c < Math.min(chain, 4); c++) {
          s.node("bc" + b + "-" + c, "circle", { cx: bx + 9, cy: by + 46 + c * 7, r: 2.4, fill: b === (f.bucket || 4) ? C.amber : "#C9C3B4" });
        }
      }
      s.text("al", "α = " + f.alpha + " · m = " + f.m, { x: 16, y: 300, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
      if (f.probes) s.text("pr", "esperado: " + f.probes.toFixed(2) + " comparações", { x: 16, y: 318, fill: C.blue, "font-size": 8 });
      if (f.worst) s.text("wo", "pior caso: " + n + " no mesmo bucket", { x: 16, y: 334, fill: C.red, "font-size": 8 });
    }
  }

  Lab.mount(root, {
    id: "custo", width: 640, height: 400,
    params: [
      { key: "modo", label: "Modo", type: "select", value: "operacao", options: [{ value: "operacao", label: "Custo de uma operação" }, { value: "crescimento", label: "Curvas de crescimento" }] },
      { key: "estrategia", label: "Estratégia", type: "select", value: "varredura", options: [{ value: "varredura", label: "Varredura linear" }, { value: "bst", label: "BST" }, { value: "hash", label: "Hash" }] },
      { key: "n", label: "n", type: "range", min: 4, max: 64, value: 24 },
      { key: "ocupacao", label: "Ocupação α (%)", type: "range", min: 10, max: 95, value: 50 }
    ],
    presets: [
      { label: "n = 12", params: { modo: "operacao", estrategia: "varredura", n: 12, ocupacao: 50 } },
      { label: "Ocupação 90%", params: { modo: "operacao", estrategia: "hash", n: 24, ocupacao: 90 } },
      { label: "BST", params: { modo: "operacao", estrategia: "bst", n: 31, ocupacao: 50 } },
      { label: "Curvas", params: { modo: "crescimento", estrategia: "varredura", n: 32, ocupacao: 50 } }
    ],
    build: build, paint: paint
  });
})();
