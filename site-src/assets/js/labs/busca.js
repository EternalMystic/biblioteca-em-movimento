/* Rotina 2 — Bancada de busca em paralelo */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var D = window.PI_DATA, C = D.COLORS;

  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function catalog(p) {
    var list = D.CATALOG.map(function (b) { return Object.assign({}, b); });
    var novo = String(p.novo || "").trim().toUpperCase();
    if (/^LIV\d{3}$/.test(novo) && !list.some(function (b) { return b.code === novo; })) {
      list.push({ code: novo, title: "Obra inserida no catálogo", authors: ["Autor fictício"], drawer: "—", prazo: 7 });
    }
    list.sort(function (a, b) { return a.code < b.code ? -1 : 1; });
    return list.slice(0, Math.max(3, Math.min(list.length, +p.tamanho)));
  }

  function linearSteps(list, key) {
    var out = [], comp = 0;
    for (var i = 0; i < list.length; i++) {
      comp++;
      var hit = list[i].code === key;
      out.push({ i: i, comp: comp, found: hit, done: hit, note: "Compara " + list[i].code + " com " + key + (hit ? " → igual." : " → diferente.") });
      if (hit) break;
    }
    if (!out.length || !out[out.length - 1].found) {
      out.push({ i: list.length, comp: comp, found: false, done: true, note: "Percorreu as " + list.length + " fichas sem encontrar " + key + "." });
    }
    return out;
  }
  function binarySteps(list, key) {
    var out = [], lo = 0, hi = list.length - 1, comp = 0;
    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2);
      comp++;
      var v = list[mid].code, hit = v === key;
      out.push({ lo: lo, hi: hi, mid: mid, comp: comp, found: hit, done: hit, note: "Intervalo [" + lo + "," + hi + "] · meio " + mid + " = " + v + (hit ? " → igual." : (v < key ? " → menor; descarta a metade esquerda." : " → maior; descarta a metade direita.")) });
      if (hit) break;
      if (v < key) lo = mid + 1; else hi = mid - 1;
    }
    if (!out.length || !out[out.length - 1].found) {
      out.push({ lo: lo, hi: hi, mid: -1, comp: comp, found: false, done: true, note: "Intervalo vazio: " + key + " não está no conjunto ordenado." });
    }
    return out;
  }
  function hashSteps(list, key, m) {
    var buckets = [];
    for (var b = 0; b < m; b++) buckets.push([]);
    list.forEach(function (it) { buckets[D.hash(it.code, m)].push(it.code); });
    var h = D.hash(key, m);
    var chain = buckets[h] || [];
    var out = [{ phase: "calc", h: h, comp: 1, bucket: h, chain: chain, found: false, done: false, note: "h(" + key + ") = " + key.slice(3) + " mod " + m + " = " + h + ". Consulta o bucket " + h + "." }];
    var comp = 1, hit = false;
    for (var i = 0; i < chain.length; i++) {
      comp++;
      hit = chain[i] === key;
      out.push({ phase: "scan", h: h, comp: comp, bucket: h, chain: chain, pos: i, found: hit, done: hit, note: "Bucket " + h + ", posição " + i + ": " + chain[i] + (hit ? " → igual." : " → diferente; segue a cadeia.") });
      if (hit) break;
    }
    if (!hit) out.push({ phase: "scan", h: h, comp: comp, bucket: h, chain: chain, pos: -1, found: false, done: true, note: "Cadeia do bucket " + h + " termina sem " + key + "." });
    return { steps: out, buckets: buckets, h: h };
  }

  function build(p) {
    var list = catalog(p);
    var key = String(p.chave || "LIV123").trim().toUpperCase();
    var n = list.length, m = 7;
    var log = [], frames = [];

    if (p.modo === "trecho") {
      var term = String(p.termo || "estrela");
      var found = [], comps = 0;
      for (var i = 0; i < n; i++) {
        comps++;
        var hay = norm(list[i].title + " " + list[i].authors.join(" "));
        var hit = hay.indexOf(norm(term)) !== -1;
        if (hit) found.push(list[i].code);
        log.push("<span class='op'>visita " + i + "</span> " + list[i].code + " · " + list[i].title + (hit ? " <span class='ok'>→ contém</span>" : " → não contém"));
        frames.push({
          mode: "trecho", list: list, i: i, term: term, hit: hit, comp: comps,
          found: found.slice(), note: "Filtro por trecho: compara “" + term + "” com o título de " + list[i].code + (hit ? " → mantém." : " → descarta."),
          aria: "Visita " + (i + 1) + " de " + n + (hit ? ", resultado mantido" : ""),
          metrics: { "n": n, "visitas": comps, "resultados": found.length, "preparo": "0" },
          state: { "predicado": "titulo LIKE '%" + term + "%'", "posição": i, "chave": key, "modo": "trecho" },
          log: log.slice()
        });
      }
      if (!frames.length) frames.push({ mode: "trecho", list: list, i: -1, note: "Catálogo vazio.", metrics: {}, state: {}, log: [] });
      frames.push({
        mode: "trecho", list: list, i: -2, term: term, found: found,
        note: "Fim da varredura: " + comps + " fichas visitadas, " + found.length + " resultado(s). O custo é Θ(n) e o LIKE com curinga inicial não usa o índice de forma útil.",
        metrics: { "n": n, "visitas": comps, "resultados": found.length, "preparo": "0" },
        state: { "predicado": "titulo LIKE '%" + term + "%'", "resultado": found.join(", ") || "nenhum", "modo": "trecho" },
        log: log.slice()
      });
      return { frames: frames };
    }

    var lin = linearSteps(list, key);
    var bin = binarySteps(list, key);
    var hs = hashSteps(list, key, m);
    var hash = hs.steps;
    var steps = Math.max(lin.length, bin.length, hash.length);
    var prepBin = Math.round(n * Math.log2(n));
    var prepHash = n;

    for (var s = 0; s < steps; s++) {
      var L = lin[Math.min(s, lin.length - 1)];
      var B = bin[Math.min(s, bin.length - 1)];
      var H = hash[Math.min(s, hash.length - 1)];
      var notes = [];
      if (s < lin.length) notes.push("Varredura: " + L.note);
      if (s < bin.length) notes.push("Binária: " + B.note);
      if (s < hash.length) notes.push("Hash: " + H.note);
      var result = L.found || B.found || H.found ? key : "ausente";
      frames.push({
        mode: "igualdade", list: list, lin: L, bin: B, hash: H, buckets: hs.buckets, m: m, key: key,
        note: notes.join("<br>"),
        aria: "Passo " + (s + 1) + ": " + notes.join(". "),
        metrics: {
          "comparações": L.comp + "/" + B.comp + "/" + H.comp,
          "preparo": "0 / " + prepBin + " / " + prepHash,
          "resultado": result
        },
        state: { "chave": key, "n": n, "bucket": H.bucket + " (m=" + m + ")", "binária": "[" + B.lo + "," + B.hi + "]", "modo": "igualdade" },
        log: (log = log.concat(notes.map(function (x) { return "<span class='op'>passo " + (s + 1) + "</span> " + x; }))).slice(-18)
      });
    }
    // frame final
    frames.push({
      mode: "igualdade", list: list, lin: lin[lin.length - 1], bin: bin[bin.length - 1], hash: hash[hash.length - 1],
      buckets: hs.buckets, m: m, key: key, final: true,
      note: "Resultado: " + (lin[lin.length - 1].found ? "encontrado" : "ausente") + ". A varredura fez " + lin[lin.length - 1].comp + " comparações; a binária, " + bin[bin.length - 1].comp + "; o hash, " + hash[hash.length - 1].comp + " (mais o preparo).",
      metrics: {
        "varredura": lin[lin.length - 1].comp, "binária": bin[bin.length - 1].comp,
        "hash": hash[hash.length - 1].comp, "preparo": prepBin + " / " + prepHash
      },
      state: { "chave": key, "n": n, "resultado": lin[lin.length - 1].found ? "encontrado" : "ausente", "α hash": (n / m).toFixed(2) },
      log: log.slice(-18)
    });
    return { frames: frames };
  }

  function row(s, key, x, y, w, state) {
    var it = key;
    var fill = C.white, stroke = C.line, color = C.ink2;
    if (state === "dim") { fill = "#F2EFE6"; color = "#A9A499"; }
    if (state === "cur") { fill = C.amberSoft; stroke = C.amber; color = C.amber; }
    if (state === "hit") { fill = C.greenSoft; stroke = "#4D8A63"; color = C.green; }
    s.node("r" + x + "-" + y, "rect", { x: x, y: y, width: w, height: 15, rx: 2, fill: fill, stroke: stroke });
    s.text("t" + x + "-" + y, it.code + " " + it.title.slice(0, 13), { x: x + 4, y: y + 11, fill: color, "font-size": 7.2 });
  }

  function paint(f, s, p) {
    var list = f.list || [];
    s.node("bg", "rect", { x: 0, y: 0, width: 640, height: 400, fill: "none" });

    if (f.mode === "trecho") {
      s.text("h0", "Busca por trecho · " + (f.term || ""), { x: 16, y: 22, fill: C.green, "font-size": 11, "font-weight": 700, "font-family": "var(--font-head)" });
      s.text("h1", "predicado: titulo LIKE '%" + (f.term || "") + "%'  ·  varredura Θ(n)", { x: 16, y: 38, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
      for (var i = 0; i < list.length; i++) {
        var st = "idle";
        if (f.i === i) st = f.hit ? "hit" : "cur";
        else if (f.i > i) st = "dim";
        if (f.found && f.found.indexOf(list[i].code) !== -1) st = "hit";
        row(s, list[i], 16, 52 + i * 20, 420, st);
        if (f.found && f.found.indexOf(list[i].code) !== -1) s.text("k" + i, "✓", { x: 444, y: 64 + i * 20, fill: C.green, "font-size": 9 });
      }
      s.node("sum", "rect", { x: 470, y: 52, width: 154, height: 120, rx: 6, fill: C.greenSoft, stroke: "#C4D9CD" });
      s.text("sumT", "Resultado", { x: 482, y: 70, fill: C.ink3, "font-size": 7.5, "letter-spacing": 1 });
      s.text("sumV", (f.found ? f.found.length : 0) + " obra(s)", { x: 482, y: 92, fill: C.green, "font-size": 16, "font-weight": 700, "font-family": "var(--font-head)" });
      s.text("sum2", f.found && f.found.length ? f.found.join(", ") : "nenhuma", { x: 482, y: 112, fill: C.ink2, "font-size": 7.5 });
      s.text("sum3", "Sem índice utilizável:", { x: 482, y: 140, fill: C.amber, "font-size": 7.5 });
      s.text("sum4", "curinga no início → varredura", { x: 482, y: 152, fill: C.amber, "font-size": 7.5 });
      return;
    }

    var cols = [
      { x: 14, title: "Varredura linear", sub: "Θ(n)", st: f.lin, kind: "lin" },
      { x: 220, title: "Busca binária", sub: "Θ(log n) · ordenado", st: f.bin, kind: "bin" },
      { x: 426, title: "Tabela hash", sub: "Θ(1) médio", st: f.hash, kind: "hash" }
    ];
    cols.forEach(function (c) {
      s.text("h" + c.kind, c.title, { x: c.x, y: 18, fill: C.green, "font-size": 9.5, "font-weight": 700, "font-family": "var(--font-head)" });
      s.text("hs" + c.kind, c.sub, { x: c.x, y: 31, fill: C.ink3, "font-size": 7, "font-family": "var(--font-mono)" });
      s.node("box" + c.kind, "rect", { x: c.x - 4, y: 38, width: 200, height: 306, rx: 6, fill: "#FDFCF8", stroke: C.line });
    });

    // linear
    for (var i2 = 0; i2 < list.length; i2++) {
      var L = f.lin || {};
      var stt = "idle";
      if (L.found && L.i === i2) stt = "hit";
      else if (L.i === i2 && !L.done) stt = "cur";
      else if (L.i > i2 || L.done) stt = "dim";
      row(s, list[i2], 18, 46 + i2 * 19, 192, stt);
      if (L.i === i2) s.text("lp" + i2, "▲", { x: 214, y: 58 + i2 * 19, fill: C.amber, "font-size": 7 });
    }

    // binária
    var B = f.bin || {};
    for (var j = 0; j < list.length; j++) {
      var stb = "idle";
      if (B.found && B.mid === j) stb = "hit";
      else if (B.mid === j && !B.done) stb = "cur";
      else if (B.done || j < B.lo || j > B.hi) stb = "dim";
      row(s, list[j], 224, 46 + j * 19, 192, stb);
    }
    if (B.lo !== undefined && B.hi >= B.lo) {
      s.node("blo", "line", { x1: 222, y1: 44 + B.lo * 19, x2: 222, y2: 62 + B.hi * 19, stroke: C.blue, "stroke-width": 2 });
      s.text("bloT", "lo", { x: 216, y: 44 + B.lo * 19, fill: C.blue, "font-size": 6.5 });
      s.text("bhiT", "hi", { x: 216, y: 62 + B.hi * 19, fill: C.blue, "font-size": 6.5 });
    }

    // hash
    var m = f.m || 7;
    s.text("hh", "m = " + m + " buckets · α = " + (list.length / m).toFixed(2), { x: 430, y: 48, fill: C.ink3, "font-size": 7, "font-family": "var(--font-mono)" });
    for (var b = 0; b < m; b++) {
      var by = 58 + b * 40;
      var active = f.hash && f.hash.bucket === b;
      s.node("bk" + b, "rect", { x: 430, y: by, width: 26, height: 32, rx: 3, fill: active ? C.amberSoft : C.white, stroke: active ? C.amber : C.line });
      s.text("bkt" + b, String(b), { x: 443, y: by + 20, "text-anchor": "middle", fill: active ? C.amber : C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
      var chain = (f.buckets && f.buckets[b]) || [];
      chain.forEach(function (code, ci) {
        var cx = 462 + ci * 46;
        var hit = f.hash && f.hash.found && f.hash.bucket === b && f.hash.pos === ci;
        var cur = f.hash && f.hash.bucket === b && f.hash.pos === ci && !hit;
        s.node("ch" + b + "-" + ci, "rect", { x: cx, y: by + 6, width: 42, height: 20, rx: 3, fill: hit ? C.greenSoft : cur ? C.amberSoft : C.white, stroke: hit ? "#4D8A63" : cur ? C.amber : C.line });
        s.text("cht" + b + "-" + ci, code, { x: cx + 21, y: by + 19, "text-anchor": "middle", fill: hit ? C.green : C.ink2, "font-size": 6.5, "font-family": "var(--font-mono)" });
      });
      if (!chain.length) s.text("empty" + b, "—", { x: 470, y: by + 20, fill: "#BDB8AA", "font-size": 7 });
    }
    s.text("hashNote", f.hash ? "h(" + (f.key || "") + ") = " + f.hash.bucket : "", { x: 430, y: 348, fill: C.blue, "font-size": 7.5, "font-family": "var(--font-mono)" });
  }

  Lab.mount(root, {
    id: "busca", width: 640, height: 400,
    params: [
      { key: "chave", label: "Chave", type: "text", value: "LIV123" },
      { key: "modo", label: "Cenário", type: "select", value: "igualdade", options: [{ value: "igualdade", label: "Igualdade (três algoritmos)" }, { value: "trecho", label: "Busca por trecho" }] },
      { key: "termo", label: "Trecho do título", type: "text", value: "estrela" },
      { key: "tamanho", label: "Tamanho do catálogo", type: "range", min: 5, max: 15, value: 15 },
      { key: "novo", label: "Inserir código (opcional)", type: "text", value: "", placeholder: "LIV150" }
    ],
    presets: [
      { label: "LIV123", params: { chave: "LIV123", modo: "igualdade", tamanho: 15, novo: "" } },
      { label: "LIV207", params: { chave: "LIV207", modo: "igualdade", tamanho: 15, novo: "" } },
      { label: "LIV999 (ausente)", params: { chave: "LIV999", modo: "igualdade", tamanho: 15, novo: "" } },
      { label: "Trecho “estrela”", params: { chave: "LIV123", modo: "trecho", termo: "estrela", tamanho: 15, novo: "" } },
      { label: "Trecho “órbita”", params: { chave: "LIV123", modo: "trecho", termo: "órbita", tamanho: 15, novo: "" } }
    ],
    build: build, paint: paint
  });
})();
