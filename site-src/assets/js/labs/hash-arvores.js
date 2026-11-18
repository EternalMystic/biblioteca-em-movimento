/* Laboratório — hash, BST, AVL e heap */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  function keys(p) {
    return String(p.chaves || "123,130,137,207,15,25").split(/[^0-9]+/).filter(Boolean).map(Number).slice(0, 10);
  }
  function hashOf(k, m) { return k % m; }

  function insertBST(root, v, path) {
    if (!root) return { v: v, l: null, r: null, d: path.length };
    path.push(root.v);
    if (v < root.v) root.l = insertBST(root.l, v, path);
    else if (v > root.v) root.r = insertBST(root.r, v, path);
    return root;
  }
  function height(t) { return t ? 1 + Math.max(height(t.l), height(t.r)) : 0; }
  function clone(t) { return t ? { v: t.v, l: clone(t.l), r: clone(t.r), d: t.d } : null; }
  function inorder(t, out) { if (!t) return out; inorder(t.l, out); out.push(t.v); inorder(t.r, out); return out; }

  function rotR(y) { var x = y.l; y.l = x.r; x.r = y; return x; }
  function rotL(x) { var y = x.r; x.r = y.l; y.l = x; return y; }
  function balance(t) { return t ? height(t.l) - height(t.r) : 0; }
  function insertAVL(t, v, info) {
    if (!t) return { v: v, l: null, r: null };
    if (v < t.v) t.l = insertAVL(t.l, v, info);
    else if (v > t.v) t.r = insertAVL(t.r, v, info);
    else return t;
    var b = balance(t);
    if (b > 1 && v < t.l.v) { info.push("rotação à direita em " + t.v); return rotR(t); }
    if (b < -1 && v > t.r.v) { info.push("rotação à esquerda em " + t.v); return rotL(t); }
    if (b > 1 && v > t.l.v) { info.push("rotação dupla esquerda-direita em " + t.v); t.l = rotL(t.l); return rotR(t); }
    if (b < -1 && v < t.r.v) { info.push("rotação dupla direita-esquerda em " + t.v); t.r = rotR(t.r); return rotL(t); }
    return t;
  }

  function build(p) {
    var ks = keys(p), frames = [], log = [], m = +p.tabela;
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({ keys: ks, m: m, note: note, log: log.slice() }, extra || {}));
    }
    if (p.modo === "hash") {
      var buckets = []; for (var i = 0; i < m; i++) buckets.push([]);
      var col = 0;
      add("Tabela de " + m + " buckets, encadeamento separado. α = n/m.", { buckets: JSON.parse(JSON.stringify(buckets)), alpha: 0 });
      ks.forEach(function (k) {
        var h = hashOf(k, m);
        if (buckets[h].length) col++;
        buckets[h].push(k);
        add("Insere " + k + ": h = " + k + " mod " + m + " = " + h + (buckets[h].length > 1 ? " · colisão, entra na cadeia." : " · bucket vazio."), { buckets: JSON.parse(JSON.stringify(buckets)), hi: h, alpha: (buckets.reduce(function (a, b) { return a + b.length; }, 0) / m).toFixed(2), colisoes: col });
      });
      add("Fim: α = " + (ks.length / m).toFixed(2) + ", " + col + " colisão(ões). O pior caso continua Θ(n) por bucket.", { buckets: JSON.parse(JSON.stringify(buckets)), alpha: (ks.length / m).toFixed(2), colisoes: col, done: true });
      return { frames: frames };
    }
    if (p.modo === "heap") {
      var heap = [];
      add("Heap mínimo em vetor: pai de i é (i−1)/2; filhos são 2i+1 e 2i+2.", { heap: [], note: "Heap vazio." });
      ks.forEach(function (k) {
        heap.push(k); var i = heap.length - 1;
        add("Insere " + k + " no fim do vetor (índice " + i + ").", { heap: heap.slice(), hi: i });
        while (i > 0) {
          var par = Math.floor((i - 1) / 2);
          if (heap[par] <= heap[i]) break;
          var t = heap[par]; heap[par] = heap[i]; heap[i] = t;
          add("Sobe: troca " + heap[i] + " com o pai " + heap[par] + ".", { heap: heap.slice(), hi: par });
          i = par;
        }
      });
      add("Heap final: menor na raiz, propriedade de ordem restaurada.", { heap: heap.slice(), done: true });
      return { frames: frames };
    }
    // BST / AVL
    var t = null, avl = p.modo === "avl";
    add((avl ? "AVL" : "BST") + ": insere " + ks.length + " chaves. A forma depende da ordem.", { tree: null, mode: p.modo });
    ks.forEach(function (k) {
      var path = [], info = [];
      if (avl) {
        t = insertAVL(t, k, info);
        add("Insere " + k + ". " + (info.length ? info.join("; ") + "." : "Sem rotação.") + " Altura " + height(t) + ".", { tree: clone(t), mode: "avl", path: [], info: info });
      } else {
        t = insertBST(t, k, path);
        add("Insere " + k + " após " + (path.length ? "comparar com " + path.join(" → ") : "raiz vazia") + ". Profundidade " + (path.length) + ".", { tree: clone(t), mode: "bst", path: path });
      }
    });
    add("Fim: altura " + height(t) + ", em ordem " + inorder(t, []).join(", ") + ". " + (avl ? "AVL mantém O(log n)." : "BST pode degenerar para O(n)."), { tree: clone(t), mode: p.modo, done: true });
    return { frames: frames };
  }

  function treeLayout(t) {
    var out = [], idx = 0;
    (function walk(n, d) {
      if (!n) return;
      walk(n.l, d + 1);
      out.push({ v: n.v, x: 50 + idx * 62, y: 58 + d * 54, d: d });
      idx++;
      walk(n.r, d + 1);
    })(t, 0);
    return out;
  }

  function paint(f, s) {
    s.text("h", ({ hash: "Tabela hash · encadeamento", bst: "BST · árvore binária de busca", avl: "AVL · balanceamento", heap: "Heap mínimo" })[f.mode || "hash"], { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });

    if (f.mode === "hash") {
      s.text("hs", "m = " + f.m + " · α = " + (f.alpha || 0) + " · colisões = " + (f.colisoes || 0), { x: 16, y: 39, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
      var m = f.m, perRow = Math.min(m, 7), cw = 84;
      for (var b = 0; b < m; b++) {
        var col = b % perRow, row = Math.floor(b / perRow);
        var x = 20 + col * cw, y = 58 + row * 150;
        var on = f.hi === b;
        s.node("bk" + b, "rect", { x: x, y: y, width: 44, height: 30, rx: 4, fill: on ? C.amberSoft : C.white, stroke: on ? C.amber : C.line });
        s.text("bkt" + b, String(b), { x: x + 22, y: y + 20, "text-anchor": "middle", fill: on ? C.amber : C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
        var chain = (f.buckets && f.buckets[b]) || [];
        chain.forEach(function (k, i) {
          var nx = x + 52 + i * 34;
          s.node("nc" + b + "-" + i, "rect", { x: nx, y: y + 5, width: 30, height: 20, rx: 3, fill: i === chain.length - 1 ? C.greenSoft : C.white, stroke: "#9EC4AE" });
          s.text("nct" + b + "-" + i, String(k), { x: nx + 15, y: y + 19, "text-anchor": "middle", fill: C.green, "font-size": 6.8, "font-family": "var(--font-mono)" });
          if (i > 0) s.node("ar" + b + "-" + i, "line", { x1: nx - 4, y1: y + 15, x2: nx, y2: y + 15, stroke: C.ink3 });
        });
      }
      s.text("note", "Chaves: " + (f.keys || []).join(", ") + ". A função modular é simples e rápida; a colisão é tratada por lista.", { x: 20, y: 372, fill: C.ink3, "font-size": 7.5 });
      return;
    }

    if (f.mode === "heap") {
      var h = f.heap || [];
      s.text("hs", "vetor: " + (h.join(", ") || "vazio"), { x: 16, y: 39, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
      h.forEach(function (v, i) {
        var x = 40 + i * 52, y = 300;
        s.node("hc" + i, "rect", { x: x, y: y, width: 44, height: 30, rx: 3, fill: i === f.hi ? C.amberSoft : C.white, stroke: i === f.hi ? C.amber : C.line });
        s.text("hct" + i, String(v), { x: x + 22, y: y + 20, "text-anchor": "middle", fill: C.ink, "font-size": 9, "font-family": "var(--font-mono)" });
        s.text("hi" + i, String(i), { x: x + 22, y: y + 42, "text-anchor": "middle", fill: C.ink3, "font-size": 6 });
      });
      h.forEach(function (v, i) {
        var x = 320 + (i % 4) * 60, y = 80 + Math.floor(i / 4) * 54;
        s.node("hn" + i, "circle", { cx: x, cy: y, r: 15, fill: i === f.hi ? C.amberSoft : C.white, stroke: i === f.hi ? C.amber : C.line });
        s.text("hnt" + i, String(v), { x: x, y: y + 4, "text-anchor": "middle", fill: C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
        if (i > 0) {
          var pi = Math.floor((i - 1) / 2), px = 320 + (pi % 4) * 60, py = 80 + Math.floor(pi / 4) * 54;
          s.node("he" + i, "line", { x1: px, y1: py, x2: x, y2: y, stroke: C.line });
        }
      });
      return;
    }

    var nodes = treeLayout(f.tree);
    s.text("hs", "altura " + (nodes.length ? Math.max.apply(null, nodes.map(function (n) { return n.d; })) + 1 : 0) + " · " + nodes.length + " nós · em ordem: " + nodes.map(function (n) { return n.v; }).join(", "), { x: 16, y: 39, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
    nodes.forEach(function (n) {
      if (n.d > 0) {
        var par = nodes.filter(function (p) { return p.d === n.d - 1 && Math.abs(p.x - n.x) < 70; })[0];
        if (par) s.node("te" + n.v, "line", { x1: par.x, y1: par.y, x2: n.x, y2: n.y, stroke: "#C9C3B4" });
      }
    });
    nodes.forEach(function (n) {
      var on = (f.path || []).indexOf(n.v) !== -1;
      s.node("tn" + n.v, "circle", { cx: n.x, cy: n.y, r: 15, fill: on ? C.amberSoft : C.white, stroke: on ? C.amber : C.green, "stroke-width": 1.6 });
      s.text("tnt" + n.v, String(n.v), { x: n.x, y: n.y + 4, "text-anchor": "middle", fill: C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
    });
    if (f.info && f.info.length) {
      s.node("rot", "rect", { x: 400, y: 320, width: 220, height: 44, rx: 6, fill: C.blueSoft, stroke: "#9FB0D8" });
      s.text("rott", f.info.join(" · "), { x: 410, y: 340, fill: C.blue, "font-size": 7.5 });
      s.text("rott2", "a rotação manteve a altura em O(log n)", { x: 410, y: 354, fill: C.ink3, "font-size": 7 });
    }
  }

  Lab.mount(root, {
    id: "hash-arvores", width: 640, height: 400,
    params: [
      { key: "modo", label: "Estrutura", type: "select", value: "hash", options: [
        { value: "hash", label: "Tabela hash" }, { value: "bst", label: "BST" }, { value: "avl", label: "AVL" }, { value: "heap", label: "Heap mínimo" }] },
      { key: "chaves", label: "Chaves", type: "text", value: "123,130,137,207,15,25" },
      { key: "tabela", label: "m (hash)", type: "select", value: "7", options: [{ value: "7", label: "7" }, { value: "11", label: "11" }, { value: "13", label: "13" }] }
    ],
    presets: [
      { label: "Hash m=7", params: { modo: "hash", chaves: "123,130,137,207,15,25", tabela: "7" } },
      { label: "Colisões", params: { modo: "hash", chaves: "10,20,30,40,50", tabela: "7" } },
      { label: "BST ordenada", params: { modo: "bst", chaves: "10,20,30,40,50", tabela: "7" } },
      { label: "AVL ordenada", params: { modo: "avl", chaves: "10,20,30,40,50", tabela: "7" } },
      { label: "Heap", params: { modo: "heap", chaves: "40,20,50,10,30,60", tabela: "7" } }
    ],
    build: build, paint: paint
  });
})();
