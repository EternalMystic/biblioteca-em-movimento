/* Rotina 5 — Grafos: BFS, Dijkstra, Bellman-Ford, Floyd-Warshall e visão bipartida */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  var POS = { A: [70, 70], B: [220, 62], C: [366, 112], D: [150, 272], E: [334, 282], F: [470, 210] };
  var PRESETS = {
    padrao: { label: "Padrão (sem negativos)", edges: [["A", "B", 2], ["A", "C", 4], ["B", "C", 1], ["B", "D", 7], ["C", "E", 3], ["D", "E", 2]], nodes: ["A", "B", "C", "D", "E"] },
    negativo: { label: "Aresta negativa", edges: [["A", "C", 1], ["A", "B", 2], ["B", "C", -10], ["C", "D", 2], ["D", "E", 2]], nodes: ["A", "B", "C", "D", "E"] },
    ciclo: { label: "Ciclo negativo", edges: [["A", "B", 1], ["B", "C", -2], ["C", "D", 1], ["D", "B", -2], ["A", "D", 5]], nodes: ["A", "B", "C", "D", "E"] },
    desconexo: { label: "Grafo desconexo", edges: [["A", "B", 1], ["C", "D", 1]], nodes: ["A", "B", "C", "D", "E"] },
    empate: { label: "Caminhos empatados", edges: [["A", "B", 1], ["A", "C", 1], ["B", "D", 2], ["C", "D", 2]], nodes: ["A", "B", "C", "D"] }
  };

  function adj(g) {
    var a = {};
    g.nodes.forEach(function (n) { a[n] = []; });
    g.edges.forEach(function (e) {
      if (a[e[0]]) a[e[0]].push([e[1], e[2]]);
      if (a[e[1]]) a[e[1]].push([e[0], e[2]]);
    });
    return a;
  }
  function distStr(d, nodes) {
    return nodes.map(function (n) { return n + ":" + (d[n] === Infinity || d[n] === undefined ? "∞" : d[n]); }).join("  ");
  }

  function bfs(g, s) {
    var A = adj(g), dist = {}, par = {}, q = [s], seen = {}, frames = [], log = [], ops = 0;
    g.nodes.forEach(function (n) { dist[n] = Infinity; });
    dist[s] = 0; seen[s] = true;
    frames.push({ kind: "bfs", g: g, cur: s, frontier: q.slice(), dist: Object.assign({}, dist), note: "Fila inicial: [" + s + "]. Distância 0.", log: [], metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "operações": 0, "fronteira": 1 } });
    log.push("<span class='op'>enqueue</span> " + s);
    while (q.length) {
      var u = q.shift(); ops++;
      var added = [];
      (A[u] || []).forEach(function (e) {
        var v = e[0];
        if (!seen[v]) { seen[v] = true; dist[v] = dist[u] + 1; par[v] = u; q.push(v); added.push(v); ops++; log.push("<span class='op'>descobre</span> " + u + " → " + v + " (nível " + dist[v] + ")"); }
      });
      frames.push({
        kind: "bfs", g: g, cur: u, frontier: q.slice(), dist: Object.assign({}, dist), settled: Object.keys(seen),
        note: "Desenfileira " + u + ". " + (added.length ? "Descobre " + added.join(", ") + "." : "Nenhum vizinho novo.") + " Fronteira: [" + q.join(", ") + "].",
        metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "operações": ops, "fronteira": q.length },
        state: { "atual": u, "fila": q.join(", ") || "vazia", "distâncias": distStr(dist, g.nodes) }, log: log.slice()
      });
    }
    frames.push({
      kind: "bfs", g: g, cur: null, frontier: [], dist: Object.assign({}, dist), settled: Object.keys(seen), final: true,
      note: "Fila vazia. BFS visita cada vértice e cada aresta uma vez: O(V+E). A distância é o número de arestas, não o peso.",
      metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "operações": ops, "alcançados": Object.keys(seen).length },
      state: { "distâncias": distStr(dist, g.nodes), "alcançados": Object.keys(seen).length + "/" + g.nodes.length }, log: log.slice()
    });
    return frames;
  }

  function dijkstra(g, s) {
    var A = adj(g), dist = {}, settled = {}, pq = [[0, s]], frames = [], log = [], ops = 0, order = [];
    g.nodes.forEach(function (n) { dist[n] = Infinity; });
    dist[s] = 0;
    frames.push({ kind: "dijkstra", g: g, cur: s, dist: Object.assign({}, dist), settled: [], note: "Fila de prioridade: (0," + s + ").", log: [], metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "relaxamentos": 0, "assentados": 0 } });
    while (pq.length) {
      pq.sort(function (a, b) { return a[0] - b[0]; });
      var it = pq.shift(), d = it[0], u = it[1];
      if (settled[u]) continue;
      settled[u] = true; order.push(u); ops++;
      var rel = [];
      (A[u] || []).forEach(function (e) {
        var v = e[0], w = e[1];
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w; pq.push([dist[v], v]); rel.push(v + "=" + dist[v]); ops++;
          log.push("<span class='op'>relaxa</span> " + u + "→" + v + " · " + dist[v]);
        }
      });
      frames.push({
        kind: "dijkstra", g: g, cur: u, edge: rel.length ? u : null, dist: Object.assign({}, dist), settled: Object.keys(settled),
        note: "Assenta " + u + " (d=" + d + "). " + (rel.length ? "Relaxa: " + rel.join(", ") + "." : "Nenhum relaxamento."),
        metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "relaxamentos": ops - order.length, "assentados": order.length },
        state: { "assentado": u, "ordem": order.join(" → "), "distâncias": distStr(dist, g.nodes) }, log: log.slice()
      });
    }
    // verdade por Bellman-Ford para comparar
    var truth = bellman(g, s).dist;
    var diff = g.nodes.filter(function (n) { return truth[n] !== dist[n]; });
    frames.push({
      kind: "dijkstra", g: g, cur: null, dist: Object.assign({}, dist), settled: Object.keys(settled), final: true, diff: diff,
      note: diff.length ? "Dijkstra terminou, mas diverge da verdade em " + diff.join(", ") + ": há aresta negativa. A premissa “assentar é definitivo” falhou." : "Todos assentados. Com pesos não negativos, a distância final é ótima.",
      metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "assentados": order.length, "divergências": diff.length },
      state: { "ordem": order.join(" → "), "distâncias": distStr(dist, g.nodes), "verdade": distStr(truth, g.nodes) }, log: log.slice()
    });
    return frames;
  }

  function bellman(g, s) {
    var dist = {}, frames = [], log = [], ops = 0, relax = 0;
    g.nodes.forEach(function (n) { dist[n] = Infinity; });
    dist[s] = 0;
    var rounds = [];
    for (var k = 0; k < g.nodes.length - 1; k++) {
      var changed = false, rlog = [];
      g.edges.forEach(function (e) {
        [[e[0], e[1], e[2]], [e[1], e[0], e[2]]].forEach(function (d) {
          if (dist[d[0]] !== Infinity && dist[d[0]] + d[2] < dist[d[1]]) {
            dist[d[1]] = dist[d[0]] + d[2]; ops++; relax++; changed = true;
            rlog.push(d[0] + "→" + d[1] + "=" + dist[d[1]]);
          }
        });
      });
      rounds.push({ k: k + 1, dist: Object.assign({}, dist), changed: changed, rlog: rlog.slice() });
      if (rlog.length) log.push("<span class='op'>rodada " + (k + 1) + "</span> " + rlog.join(" · "));
      if (!changed) break;
    }
    var neg = false, witness = null;
    g.edges.forEach(function (e) {
      [[e[0], e[1], e[2]], [e[1], e[0], e[2]]].forEach(function (d) {
        if (dist[d[0]] !== Infinity && dist[d[0]] + d[2] < dist[d[1]]) { neg = true; witness = d[0] + "→" + d[1]; }
      });
    });
    frames.push({ kind: "bf", g: g, dist: Object.assign({}, dist), round: 0, note: "Início: dist[" + s + "] = 0, demais ∞.", log: [], metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "relaxamentos": 0, "rodada": 0 } });
    rounds.forEach(function (r) {
      frames.push({
        kind: "bf", g: g, dist: r.dist, round: r.k, changed: r.changed,
        note: "Rodada " + r.k + ": " + (r.rlog.length ? r.rlog.join(" · ") : "nenhum relaxamento — pode parar."),
        metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "relaxamentos": relax, "rodada": r.k },
        state: { "rodada": r.k + "/" + (g.nodes.length - 1), "distâncias": distStr(r.dist, g.nodes) }, log: log.slice()
      });
    });
    frames.push({
      kind: "bf", g: g, dist: Object.assign({}, dist), round: rounds.length, neg: neg, witness: witness, final: true,
      note: neg ? "Rodada extra encontrou relaxamento em " + witness + ": ciclo negativo alcançável. Não existe menor caminho bem definido." : "Nenhum relaxamento na rodada extra: não há ciclo negativo alcançável. Distâncias finais.",
      metrics: { "vértices": g.nodes.length, "arestas": g.edges.length, "relaxamentos": relax, "ciclo negativo": neg ? "sim" : "não" },
      state: { "distâncias": distStr(dist, g.nodes), "ciclo": neg ? "sim (" + witness + ")" : "não" }, log: log.slice()
    });
    return { frames: frames, dist: dist };
  }

  function floyd(g) {
    var nodes = g.nodes, n = nodes.length, D = {}, frames = [], log = [];
    nodes.forEach(function (a) { D[a] = {}; nodes.forEach(function (b) { D[a][b] = a === b ? 0 : Infinity; }); });
    g.edges.forEach(function (e) { D[e[0]][e[1]] = Math.min(D[e[0]][e[1]], e[2]); D[e[1]][e[0]] = Math.min(D[e[1]][e[0]], e[2]); });
    frames.push({ kind: "fw", g: g, D: JSON.parse(JSON.stringify(D)), k: null, note: "Matriz inicial: 0 na diagonal, peso nas arestas, ∞ no resto.", metrics: { "n": n, "células": n * n, "atualizações": 0, "k": "—" }, log: [] });
    var upd = 0;
    for (var ki = 0; ki < n; ki++) {
      var k = nodes[ki], count = 0;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
        var a = nodes[i], b = nodes[j];
        if (D[a][k] + D[k][b] < D[a][b]) { D[a][b] = D[a][k] + D[k][b]; count++; upd++; }
      }
      log.push("<span class='op'>k=" + k + "</span> " + count + " atualização(ões)");
      frames.push({
        kind: "fw", g: g, D: JSON.parse(JSON.stringify(D)), k: k,
        note: "Com k = " + k + ", " + count + " célula(s) melhorada(s). A matriz guarda o melhor caminho usando apenas {A…" + k + "} como intermediários.",
        metrics: { "n": n, "células": n * n, "atualizações": upd, "k": k },
        state: { "k": k, "atualizações": upd }, log: log.slice()
      });
    }
    frames.push({ kind: "fw", g: g, D: D, k: "fim", final: true, note: "Fim: todas as distâncias entre pares. Θ(n³) tempo, Θ(n²) espaço.", metrics: { "n": n, "células": n * n, "atualizações": upd, "k": "fim" }, state: { "atualizações": upd }, log: log.slice() });
    return frames;
  }

  function bipartite(p) {
    var books = ["LIV123", "LIV207", "LIV142"], authors = ["Ana Prado", "Bruno Sá", "Carla Dias", "Fábio Nunes"];
    var edges = [["LIV123", "Ana Prado"], ["LIV123", "Bruno Sá"], ["LIV207", "Carla Dias"], ["LIV142", "Fábio Nunes"]];
    var nodes = books.concat(authors), adjm = {};
    nodes.forEach(function (n) { adjm[n] = []; });
    edges.forEach(function (e) { adjm[e[0]].push(e[1]); adjm[e[1]].push(e[0]); });
    var start = p.origem && books.indexOf(p.origem) !== -1 ? p.origem : "LIV123";
    var q = [start], seen = {}, frames = [], log = [], level = 0;
    seen[start] = 0;
    frames.push({ kind: "bip", books: books, authors: authors, edges: edges, cur: start, seen: Object.assign({}, seen), note: "BFS no grafo bipartido a partir de " + start + ".", metrics: { "livros": books.length, "autores": authors.length, "arestas": edges.length, "nível": 0 }, log: [] });
    while (q.length) {
      var next = [];
      q.forEach(function (u) {
        adjm[u].forEach(function (v) {
          if (seen[v] === undefined) { seen[v] = seen[u] + 1; next.push(v); log.push("<span class='op'>visita</span> " + u + " → " + v + " (nível " + seen[v] + ")"); }
        });
      });
      if (!next.length) break;
      q = next; level++;
      frames.push({
        kind: "bip", books: books, authors: authors, edges: edges, cur: q[0], level: level, seen: Object.assign({}, seen),
        note: "Nível " + level + ": " + q.join(", ") + ". Livros e autores alternam de lado.",
        metrics: { "livros": books.length, "autores": authors.length, "arestas": edges.length, "nível": level },
        state: { "fronteira": q.join(", "), "níveis": Object.keys(seen).map(function (k) { return k + ":" + seen[k]; }).join(" · ") }, log: log.slice()
      });
    }
    return frames;
  }

  function build(p) {
    if (p.vista === "bipartido") return { frames: bipartite(p) };
    var g = PRESETS[p.pesos] || PRESETS.padrao;
    var s = p.origem || "A";
    if (g.nodes.indexOf(s) === -1) s = g.nodes[0];
    if (p.algoritmo === "bfs") return { frames: bfs(g, s) };
    if (p.algoritmo === "bellman") return { frames: bellman(g, s).frames };
    if (p.algoritmo === "floyd") return { frames: floyd(g) };
    return { frames: dijkstra(g, s) };
  }

  function drawGraph(f, s, small) {
    var g = f.g || { nodes: [], edges: [] };
    var sc = small ? 0.72 : 1, ox = 10, oy = small ? 10 : 34;
    var pos = {};
    g.nodes.forEach(function (n) { pos[n] = [POS[n][0] * sc + ox, POS[n][1] * sc + oy]; });
    var settled = f.settled || [], frontier = f.frontier || [];
    g.edges.forEach(function (e, i) {
      var a = pos[e[0]], b = pos[e[1]];
      if (!a || !b) return;
      var neg = e[2] < 0;
      var on = f.edge && (f.edge === e[0] || f.edge === e[1]);
      s.node("e" + i, "line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: on ? C.blue : neg ? C.red : "#A9B7B2", "stroke-width": on ? 3 : 1.6 });
      s.text("ew" + i, String(e[2]), { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 - 4, "text-anchor": "middle", fill: neg ? C.red : C.ink2, "font-size": 8, "font-weight": 700, "font-family": "var(--font-mono)", stroke: "#fff", "stroke-width": 3, "paint-order": "stroke" });
    });
    g.nodes.forEach(function (n) {
      var x = pos[n][0], y = pos[n][1];
      var isCur = f.cur === n, isSet = settled.indexOf(n) !== -1, isFr = frontier.indexOf(n) !== -1;
      s.node("n" + n, "circle", { cx: x, cy: y, r: 16, fill: isCur ? C.blue : isSet ? C.green : isFr ? C.amber : "#fff", stroke: isCur ? C.blue : isSet ? C.green : C.line, "stroke-width": 2 });
      s.text("nt" + n, n, { x: x, y: y + 4, "text-anchor": "middle", fill: isSet || isCur ? "#fff" : C.ink, "font-size": 10, "font-weight": 700, "font-family": "var(--font-mono)" });
      var d = f.dist ? f.dist[n] : undefined;
      if (d !== undefined) s.text("nd" + n, d === Infinity ? "∞" : String(d), { x: x, y: y + 30, "text-anchor": "middle", fill: d === Infinity ? C.ink3 : C.blue, "font-size": 8, "font-family": "var(--font-mono)" });
    });
  }

  function drawMatrix(f, s) {
    var nodes = f.g.nodes, n = nodes.length, cell = 40, x0 = 360, y0 = 74;
    s.text("mt", "D · menores distâncias", { x: x0, y: y0 - 12, fill: C.ink3, "font-size": 8, "letter-spacing": 1, "font-family": "var(--font-mono)" });
    nodes.forEach(function (a, i) {
      s.text("mh" + i, a, { x: x0 + 18 + i * cell, y: y0 + 12, "text-anchor": "middle", fill: C.ink2, "font-size": 7.5, "font-weight": 700, "font-family": "var(--font-mono)" });
      s.text("mv" + i, a, { x: x0 - 10, y: y0 + 32 + i * cell, "text-anchor": "middle", fill: C.ink2, "font-size": 7.5, "font-weight": 700, "font-family": "var(--font-mono)" });
    });
    nodes.forEach(function (a, i) {
      nodes.forEach(function (b, j) {
        var v = f.D[a][b];
        s.node("mc" + i + "-" + j, "rect", { x: x0 + j * cell, y: y0 + 18 + i * cell, width: cell - 2, height: cell - 2, rx: 3, fill: v === Infinity ? "#F2EFE6" : i === j ? "#E8E4D8" : C.white, stroke: C.line });
        s.text("mct" + i + "-" + j, v === Infinity ? "∞" : String(v), { x: x0 + j * cell + (cell - 2) / 2, y: y0 + 18 + i * cell + 24, "text-anchor": "middle", fill: v === Infinity ? "#B0AA9C" : v < 0 ? C.red : C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
      });
    });
  }

  function paint(f, s, p) {
    if (f.kind === "bip") {
      s.text("h", "Grafo bipartido · livros × autores", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
      var bx = 40, ax = 380;
      f.books.forEach(function (b, i) {
        var y = 70 + i * 70, on = f.seen[b] !== undefined;
        s.node("bb" + i, "rect", { x: bx, y: y, width: 110, height: 30, rx: 6, fill: on ? C.blueSoft : C.white, stroke: on ? C.blue : C.line });
        s.text("bbt" + i, b, { x: bx + 55, y: y + 20, "text-anchor": "middle", fill: on ? C.blue : C.ink3, "font-size": 9, "font-weight": 700, "font-family": "var(--font-mono)" });
        s.text("bbl" + i, "nível " + (f.seen[b] === undefined ? "—" : f.seen[b]), { x: bx + 55, y: y + 42, "text-anchor": "middle", fill: C.ink3, "font-size": 7 });
      });
      f.authors.forEach(function (a, i) {
        var y = 70 + i * 58, on = f.seen[a] !== undefined;
        s.node("aa" + i, "rect", { x: ax, y: y, width: 150, height: 30, rx: 6, fill: on ? C.greenSoft : C.white, stroke: on ? "#7FB08F" : C.line });
        s.text("aat" + i, a, { x: ax + 75, y: y + 20, "text-anchor": "middle", fill: on ? C.green : C.ink3, "font-size": 9 });
        s.text("aal" + i, "nível " + (f.seen[a] === undefined ? "—" : f.seen[a]), { x: ax + 75, y: y + 42, "text-anchor": "middle", fill: C.ink3, "font-size": 7 });
      });
      f.edges.forEach(function (e, i) {
        var bi = f.books.indexOf(e[0]), ai = f.authors.indexOf(e[1]);
        var y1 = 85 + bi * 70, y2 = 85 + ai * 58;
        var on = f.seen[e[0]] !== undefined && f.seen[e[1]] !== undefined;
        s.node("be" + i, "line", { x1: bx + 110, y1: y1, x2: ax, y2: y2, stroke: on ? C.amber : "#D5CFC0", "stroke-width": on ? 2 : 1.2 });
      });
      s.text("note", "Cada aresta liga um livro a um autor. BFS alterna os lados; a distância 2 liga dois livros do mesmo autor.", { x: 40, y: 372, fill: C.ink3, "font-size": 7.5 });
      return;
    }
    s.text("h", ({ bfs: "BFS · busca em largura", dijkstra: "Dijkstra · menor caminho", bellman: "Bellman-Ford · arestas negativas", fw: "Floyd-Warshall · todos os pares" })[f.kind], { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "origem A · " + (f.g ? f.g.edges.length : 0) + " arestas · " + (f.g ? f.g.nodes.length : 0) + " vértices", { x: 16, y: 38, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
    drawGraph(f, s, f.kind === "fw");
    if (f.kind === "fw") drawMatrix(f, s);
    if (f.kind === "dijkstra" && f.diff && f.diff.length) {
      s.node("warn", "rect", { x: 300, y: 330, width: 324, height: 50, rx: 6, fill: C.redSoft, stroke: "#D8A5A5" });
      s.text("warnt", "Dijkstra não é válido com aresta negativa", { x: 312, y: 348, fill: C.red, "font-size": 8, "font-weight": 700 });
      s.text("warn2", "divergência em: " + f.diff.join(", "), { x: 312, y: 364, fill: C.ink2, "font-size": 7.5 });
    }
    if (f.kind === "bf" && f.neg) {
      s.node("warn", "rect", { x: 300, y: 330, width: 324, height: 50, rx: 6, fill: C.redSoft, stroke: "#D8A5A5" });
      s.text("warnt", "Ciclo negativo alcançável", { x: 312, y: 348, fill: C.red, "font-size": 8, "font-weight": 700 });
      s.text("warn2", "relaxamento após V−1 rodadas: " + f.witness, { x: 312, y: 364, fill: C.ink2, "font-size": 7.5 });
    }
  }

  Lab.mount(root, {
    id: "grafos", width: 640, height: 400,
    params: [
      { key: "algoritmo", label: "Algoritmo", type: "select", value: "bfs", options: [
        { value: "bfs", label: "BFS" }, { value: "dijkstra", label: "Dijkstra" }, { value: "bellman", label: "Bellman-Ford" }, { value: "floyd", label: "Floyd-Warshall" }] },
      { key: "pesos", label: "Grafo", type: "select", value: "padrao", options: Object.keys(PRESETS).map(function (k) { return { value: k, label: PRESETS[k].label }; }) },
      { key: "origem", label: "Origem", type: "select", value: "A", options: ["A", "B", "C", "D", "E"].map(function (x) { return { value: x, label: x }; }) },
      { key: "vista", label: "Vista", type: "select", value: "mapa", options: [{ value: "mapa", label: "Mapa de distâncias" }, { value: "bipartido", label: "Livros × autores" }] }
    ],
    presets: [
      { label: "BFS padrão", params: { algoritmo: "bfs", pesos: "padrao", origem: "A", vista: "mapa" } },
      { label: "Dijkstra padrão", params: { algoritmo: "dijkstra", pesos: "padrao", origem: "A", vista: "mapa" } },
      { label: "Dijkstra com negativo", params: { algoritmo: "dijkstra", pesos: "negativo", origem: "A", vista: "mapa" } },
      { label: "Bellman-Ford", params: { algoritmo: "bellman", pesos: "padrao", origem: "A", vista: "mapa" } },
      { label: "Ciclo negativo", params: { algoritmo: "bellman", pesos: "ciclo", origem: "A", vista: "mapa" } },
      { label: "Floyd-Warshall", params: { algoritmo: "floyd", pesos: "padrao", origem: "A", vista: "mapa" } },
      { label: "Bipartido", params: { algoritmo: "bfs", pesos: "padrao", origem: "A", vista: "bipartido" } }
    ],
    build: build, paint: paint
  });
})();
