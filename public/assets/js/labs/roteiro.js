/* Rotina 12 — Roteiro de inventário: certificado, heurística e força bruta */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var D = window.PI_DATA, C = D.COLORS;

  var P = { A: { x: 0, y: 0 }, B: { x: 0, y: 1 }, C: { x: 0, y: 2 }, D: { x: 2, y: 1 }, E: { x: 3, y: 3 } };
  var NAMES = { A: "A · entrada", B: "B · corredor", C: "C · acervo", D: "D · leitura", E: "E · reserva" };
  function dist(a, b) { return D.manhattan(P[a], P[b]); }
  function routeCost(r) { var t = 0; for (var i = 0; i < r.length - 1; i++) t += dist(r[i], r[i + 1]); return t; }
  function parse(s) {
    var arr = String(s).toUpperCase().split(/[^A-E]+/).filter(Boolean);
    if (arr.length < 2 || arr[0] !== "A" || arr[arr.length - 1] !== "A") return null;
    return arr;
  }

  function build(p) {
    var route = parse(p.rota) || ["A", "B", "C", "E", "D", "A"];
    var budget = +p.orcamento;
    var frames = [], log = [], cost = 0, visited = {};
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        route: route.slice(), cost: cost, budget: budget, visited: Object.assign({}, visited), note: note, log: log.slice(),
        metrics: { "custo": cost, "orçamento": budget, "posições": Object.keys(visited).length, "passos": frames.length + 1 },
        state: { "rota": route.join(" → "), "custo": cost, "orçamento": budget }
      }, extra || {}));
    }

    if (p.modo === "vizinho") {
      var cur = "A", un = ["B", "C", "D", "E"], r = ["A"], total = 0;
      add("Vizinho mais próximo a partir de A. Heurística gulosa: não olha o futuro.", { mode: "vizinho" });
      while (un.length) {
        un.sort(function (a, b) { return dist(cur, a) - dist(cur, b) || (a < b ? -1 : 1); });
        var nx = un.shift();
        total += dist(cur, nx);
        log.push("<span class='op'>escolhe</span> " + nx + " a " + dist(cur, nx) + " de " + cur);
        r.push(nx); cur = nx;
        add("De " + r[r.length - 2] + " para " + nx + " (" + dist(r[r.length - 2], nx) + "). Restam " + un.join(", ") + ".", { mode: "vizinho", route: r.slice(), cost: total });
      }
      total += dist(cur, "A"); r.push("A");
      add("Fecha em A (+" + dist(cur, "A") + "). Custo " + total + ".", { mode: "vizinho", route: r.slice(), cost: total });
      add(total <= budget ? "A rota cabe no orçamento por acaso." : "A rota não cabe no orçamento: a heurística não garante o ótimo.", { mode: "vizinho", route: r.slice(), cost: total, done: true, over: total > budget });
      return { frames: frames };
    }

    if (p.modo === "exato") {
      var best = null, bestCost = Infinity, perms = 0, nodes = ["B", "C", "D", "E"];
      add("Força bruta: enumerar as 4! = 24 permutações de B, C, D, E e fechar em A.", { mode: "exato" });
      function perm(arr, cur) {
        if (!arr.length) {
          var r = ["A"].concat(cur, ["A"]), c = routeCost(r);
          perms++;
          if (c < bestCost) { bestCost = c; best = r; log.push("<span class='op'>melhor</span> " + r.join("") + " = " + c); }
          add("Permutação " + perms + ": " + r.join(" → ") + " custa " + c + ". Melhor até agora: " + bestCost + ".", { mode: "exato", route: r, cost: c, best: best.slice(), perms: perms });
          return;
        }
        arr.forEach(function (x, i) {
          var rest = arr.slice(0, i).concat(arr.slice(i + 1));
          perm(rest, cur.concat([x]));
        });
      }
      perm(nodes, []);
      add("Ótimo: " + best.join(" → ") + " com custo " + bestCost + ". " + perms + " rotas avaliadas; 4! cresce rápido.", { mode: "exato", route: best, cost: bestCost, best: best, perms: perms, done: true, over: bestCost > budget });
      return { frames: frames };
    }

    // certificado
    add("Certificado: percorrer a rota e verificar cada aresta, cada posição obrigatória e o retorno a A.", { mode: "cert" });
    visited[route[0]] = true;
    for (var i = 0; i < route.length - 1; i++) {
      var a = route[i], b = route[i + 1], w = dist(a, b);
      cost += w; visited[b] = true;
      add("Aresta " + a + "→" + b + ": " + w + ". Custo acumulado " + cost + ".", { mode: "cert", edge: i });
    }
    var missing = ["B", "C", "D", "E"].filter(function (x) { return !visited[x]; });
    var ok = cost <= budget && missing.length === 0 && route[0] === "A" && route[route.length - 1] === "A";
    add(missing.length ? "Faltou visitar " + missing.join(", ") + ": certificado rejeitado." : (ok ? "Todas as posições visitadas, retorno a A, custo " + cost + " ≤ " + budget + ": certificado aceito." : "Custo " + cost + " acima do orçamento " + budget + ": certificado rejeitado."), { mode: "cert", done: true, ok: ok, over: cost > budget });
    return { frames: frames };
  }

  function sx(x) { return 70 + x * 70; }
  function sy(y) { return 300 - y * 60; }

  function paint(f, s) {
    s.text("h", "Roteiro de inventário · " + (f.mode === "cert" ? "certificado" : f.mode === "vizinho" ? "vizinho mais próximo" : "força bruta"), { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "A–E no grid · distância de Manhattan · orçamento " + f.budget, { x: 16, y: 38, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    // grid
    for (var gx = 0; gx <= 3; gx++) for (var gy = 0; gy <= 3; gy++) {
      s.node("g" + gx + gy, "circle", { cx: sx(gx), cy: sy(gy), r: 2, fill: "#D5CFC0" });
    }
    // rota
    var r = f.route || [];
    for (var i = 0; i < r.length - 1; i++) {
      var a = P[r[i]], b = P[r[i + 1]];
      var on = f.edge === i;
      s.node("re" + i, "line", { x1: sx(a.x), y1: sy(a.y), x2: sx(b.x), y2: sy(b.y), stroke: on ? C.amber : f.ok === false ? "#D8A5A5" : C.blue, "stroke-width": on ? 4 : 2.2, "stroke-linecap": "round", opacity: 0.9 });
    }
    Object.keys(P).forEach(function (k) {
      var x = sx(P[k].x), y = sy(P[k].y);
      var vis = f.visited && f.visited[k];
      s.node("p" + k, "circle", { cx: x, cy: y, r: 14, fill: vis ? C.green : C.white, stroke: vis ? C.green : C.line, "stroke-width": 2 });
      s.text("pt" + k, k, { x: x, y: y + 4, "text-anchor": "middle", fill: vis ? "#fff" : C.ink, "font-size": 9, "font-weight": 700, "font-family": "var(--font-mono)" });
    });
    s.text("leg", "A entrada · B corredor · C acervo · D leitura · E reserva", { x: 30, y: 360, fill: C.ink3, "font-size": 7 });

    // painel
    s.node("pb", "rect", { x: 340, y: 52, width: 284, height: 120, rx: 7, fill: C.white, stroke: C.line });
    s.text("pbt", "Custo da rota", { x: 354, y: 72, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    s.text("pbc", String(f.cost), { x: 354, y: 104, fill: f.cost > f.budget ? C.red : C.green, "font-size": 24, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("pbo", "orçamento " + f.budget, { x: 430, y: 104, fill: C.ink3, "font-size": 8 });
    s.node("bar", "rect", { x: 354, y: 116, width: 250, height: 8, rx: 4, fill: "#EAE6DA" });
    s.node("barf", "rect", { x: 354, y: 116, width: Math.min(250, 250 * f.cost / Math.max(1, f.budget)), height: 8, rx: 4, fill: f.cost > f.budget ? C.red : C.green });
    s.text("pbr", f.cost <= f.budget ? "dentro do orçamento" : "acima do orçamento", { x: 354, y: 144, fill: f.cost <= f.budget ? C.green : C.red, "font-size": 7.5 });

    // checklist
    s.text("ck", "Posições obrigatórias", { x: 340, y: 196, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    ["B", "C", "D", "E"].forEach(function (k, i) {
      var on = f.visited && f.visited[k];
      s.text("ck" + i, (on ? "✓ " : "○ ") + NAMES[k], { x: 340, y: 216 + i * 18, fill: on ? C.green : C.ink3, "font-size": 7.5 });
    });
    s.text("rt", "Rota", { x: 340, y: 306, fill: C.ink3, "font-size": 7, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    s.text("rtv", (f.route || []).join(" → "), { x: 340, y: 324, fill: C.ink2, "font-size": 8, "font-family": "var(--font-mono)" });
    if (f.mode === "exato") s.text("pm", "permutações: " + (f.perms || 0) + " / 24", { x: 340, y: 344, fill: C.amber, "font-size": 7.5, "font-family": "var(--font-mono)" });
    if (f.over) s.text("ov", "a rota estoura o orçamento", { x: 340, y: 364, fill: C.red, "font-size": 7.5 });
  }

  Lab.mount(root, {
    id: "roteiro", width: 640, height: 400,
    params: [
      { key: "modo", label: "Método", type: "select", value: "cert", options: [
        { value: "cert", label: "Verificar certificado" }, { value: "vizinho", label: "Vizinho mais próximo" }, { value: "exato", label: "Força bruta (24)" }] },
      { key: "rota", label: "Rota (A…A)", type: "text", value: "A,B,C,E,D,A" },
      { key: "orcamento", label: "Orçamento", type: "range", min: 8, max: 20, value: 12 }
    ],
    presets: [
      { label: "A–B–C–E–D–A", params: { modo: "cert", rota: "A,B,C,E,D,A", orcamento: 12 } },
      { label: "Rota cara", params: { modo: "cert", rota: "A,E,D,C,B,A", orcamento: 12 } },
      { label: "Vizinho", params: { modo: "vizinho", rota: "A,B,C,E,D,A", orcamento: 12 } },
      { label: "Força bruta", params: { modo: "exato", rota: "A,B,C,E,D,A", orcamento: 12 } },
      { label: "Sem D", params: { modo: "cert", rota: "A,B,C,E,A", orcamento: 12 } }
    ],
    build: build, paint: paint
  });
})();
