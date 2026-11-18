/* Rotina 8 — List<Autor>: Contains, Add, Remove, capacidade */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  function build(p) {
    var nome = String(p.nome || "Ana Prado");
    var cap = +p.capacidade;
    var base = ["Ana Prado", "Bruno Sá", "Carla Dias"];
    if (+p.indice < 0) p.indice = 0;
    var list = base.slice(0, Math.min(base.length, cap));
    var frames = [], log = [], comps = 0, copies = 0;
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        list: list.slice(), cap: cap, nome: nome, comps: comps, copies: copies, estrutura: p.estrutura,
        note: note, log: log.slice(),
        metrics: { "Count": list.length, "Capacity": cap, "comparações": comps, "cópias": copies },
        state: { "lista": list.join(", "), "Count": list.length, "Capacity": cap }
      }, extra || {}));
    }

    add("List<Autor> começa com " + list.length + " item(ns) e capacidade " + cap + ".", { phase: "init" });

    if (p.acao === "remover") {
      var idx = Math.min(list.length - 1, Math.max(0, +p.indice));
      for (var i = 0; i <= idx; i++) {
        comps++;
        add("Contains/IndexOf percorre o índice " + i + " (" + list[i] + ").", { phase: "scan", i: i, found: i === idx });
      }
      var removed = list[idx];
      if (p.estrutura === "encadeada") {
        add("Religa o anterior ao próximo: anterior->prox = atual->prox.", { phase: "relink", i: idx, removed: removed });
        add("free(atual). O nó sai; nenhum outro elemento se desloca.", { phase: "free", i: idx, removed: removed });
      } else {
        for (var j = idx; j < list.length - 1; j++) {
          copies++;
          add("Desloca " + list[j + 1] + " de " + (j + 1) + " para " + j + ".", { phase: "shift", i: j });
        }
      }
      list.splice(idx, 1);
      add("Count cai para " + list.length + ". " + (p.estrutura === "encadeada" ? "Custo O(n) para localizar, O(1) para religar." : "Custo O(n) para localizar + O(n) para deslocar."), { phase: "done", removed: removed });
      return { frames: frames };
    }

    // adicionar
    var dup = false;
    for (var k = 0; k < list.length; k++) {
      comps++;
      var eq = list[k].toLowerCase() === nome.toLowerCase();
      add("Contains compara “" + list[k] + "” com “" + nome + "” → " + (eq ? "igual." : "diferente."), { phase: "scan", i: k, found: eq });
      if (eq) { dup = true; break; }
    }
    if (dup) {
      add("Contains retorna true: o nome já existe. Add não é chamado. Count continua " + list.length + ".", { phase: "dup" });
      return { frames: frames };
    }
    add("Contains retorna false. Agora verifica Count == Capacity: " + list.length + " == " + cap + "?", { phase: "check" });
    if (list.length >= cap) {
      var old = list.slice(), nova = Math.max(4, cap * 2);
      add("Capacidade esgotada: aloca um vetor de " + nova + " e copia os " + old.length + " elementos.", { phase: "grow", oldCap: cap, newCap: nova });
      old.forEach(function (x, ix) {
        copies++;
        add("Copia " + x + " para o novo vetor (índice " + ix + ").", { phase: "copy", i: ix, oldCap: cap, newCap: nova });
      });
      cap = nova; list = old;
      add("O vetor antigo é descartado. Custo desta expansão: " + old.length + " cópias. O append é amortizado Θ(1).", { phase: "grown", newCap: nova });
    }
    list.push(nome);
    add("Add grava “" + nome + "” no índice " + (list.length - 1) + ". Count = " + list.length + ", Capacity = " + cap + ".", { phase: "added" });
    return { frames: frames };
  }

  function paint(f, s) {
    s.text("h", "List<Autor> · vetor com Count e Capacity", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "Count = " + f.list.length + " · Capacity = " + f.cap + " · endereço base fixo", { x: 16, y: 39, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });

    var n = Math.max(f.cap, 4), cellW = Math.min(64, 560 / n);
    var x0 = 24, y0 = 74;
    for (var i = 0; i < n; i++) {
      var val = f.list[i];
      var cur = f.i === i;
      var hit = f.found && f.i === i;
      s.node("c" + i, "rect", { x: x0 + i * cellW, y: y0, width: cellW - 4, height: 46, rx: 4, fill: hit ? C.greenSoft : cur ? C.amberSoft : val ? C.white : "#F4F1E7", stroke: hit ? "#4D8A63" : cur ? C.amber : C.line, "stroke-dasharray": val ? "0" : "3 3" });
      s.text("idx" + i, String(i), { x: x0 + i * cellW + (cellW - 4) / 2, y: y0 - 6, "text-anchor": "middle", fill: C.ink3, "font-size": 6.5, "font-family": "var(--font-mono)" });
      s.text("v" + i, val ? val.split(" ")[0] : "—", { x: x0 + i * cellW + (cellW - 4) / 2, y: y0 + 26, "text-anchor": "middle", fill: hit ? C.green : val ? C.ink : "#BDB8AA", "font-size": 7.5 });
      s.text("ad" + i, "0x" + (1000 + i * 8).toString(16).toUpperCase(), { x: x0 + i * cellW + (cellW - 4) / 2, y: y0 + 60, "text-anchor": "middle", fill: "#A9A499", "font-size": 5.6, "font-family": "var(--font-mono)" });
    }

    if (f.phase === "grow" || f.phase === "copy" || f.phase === "grown") {
      s.node("ng", "rect", { x: 24, y: 176, width: 300, height: 60, rx: 6, fill: C.blueSoft, stroke: "#9FB0D8" });
      s.text("ngt", "novo vetor · capacidade " + (f.newCap || f.cap), { x: 36, y: 194, fill: C.blue, "font-size": 7.5, "font-weight": 700, "font-family": "var(--font-mono)" });
      var cw2 = Math.min(28, 260 / Math.max(1, f.newCap || 8));
      for (var k = 0; k < Math.min(f.newCap || 8, 12); k++) {
        var filled = k < (f.phase === "copy" ? (f.i + 1) : f.phase === "grown" ? f.list.length : 0);
        s.node("nc" + k, "rect", { x: 36 + k * cw2, y: 204, width: cw2 - 2, height: 18, rx: 2, fill: filled ? C.greenSoft : "#fff", stroke: filled ? "#7FB08F" : "#C9D3E4" });
      }
    }

    if (f.phase === "scan") {
      s.node("lens", "circle", { cx: x0 + (f.i || 0) * cellW + (cellW - 4) / 2, cy: y0 + 22, r: 22, fill: "none", stroke: C.blue, "stroke-width": 1.4, "stroke-dasharray": "3 2" });
      s.text("cmp", "comparação " + f.comps + ": “" + (f.list[f.i] || "") + "” ≠ “" + f.nome + "”", { x: 24, y: 154, fill: C.blue, "font-size": 8, "font-family": "var(--font-mono)" });
    }
    if (f.phase === "dup") {
      s.node("dup", "rect", { x: 24, y: 176, width: 300, height: 40, rx: 6, fill: C.redSoft, stroke: "#D8A5A5" });
      s.text("dupt", "Contains = true · Add ignorado", { x: 36, y: 200, fill: C.red, "font-size": 9, "font-weight": 700 });
    }
    if (f.phase === "shift") {
      s.text("sh", "desloca " + (f.i + 1) + " → " + f.i + " · cópia " + f.copies, { x: 24, y: 176, fill: C.amber, "font-size": 8, "font-family": "var(--font-mono)" });
      s.node("arrow", "line", { x1: x0 + (f.i + 1) * cellW + 4, y1: y0 + 52, x2: x0 + f.i * cellW + cellW - 8, y2: y0 + 52, stroke: C.amber, "stroke-width": 2 });
    }
    if (f.phase === "added") {
      s.node("add", "rect", { x: 24, y: 176, width: 320, height: 40, rx: 6, fill: C.greenSoft, stroke: "#7FB08F" });
      s.text("addt", "Add no índice " + (f.list.length - 1) + " · Count " + f.list.length + " / Capacity " + f.cap, { x: 36, y: 200, fill: C.green, "font-size": 9, "font-weight": 700 });
    }

    // comparação com encadeada
    s.text("cmp2", f.estrutura === "encadeada" ? "Encadeada: localizar O(n), religar O(1), sem deslocamento." : "Vetor: localizar O(n), inserir/remover no meio O(n) por deslocamento.", { x: 24, y: 286, fill: C.ink2, "font-size": 8 });
    s.text("cmp3", "Capacidade é do vetor, não do conteúdo: Count pode ser menor que Capacity.", { x: 24, y: 304, fill: C.ink3, "font-size": 7.5 });
    s.text("cmp4", "Endereços crescentes de 8 em 8 bytes: é um vetor de referências, não os objetos.", { x: 24, y: 322, fill: C.ink3, "font-size": 7.5 });
    s.text("cmp5", "Contains faz Θ(k) comparações; Add no fim é amortizado Θ(1).", { x: 24, y: 346, fill: C.amber, "font-size": 7.5, "font-family": "var(--font-mono)" });
  }

  Lab.mount(root, {
    id: "autores", width: 640, height: 400,
    params: [
      { key: "nome", label: "Nome do autor", type: "text", value: "Ana Prado" },
      { key: "acao", label: "Ação", type: "select", value: "adicionar", options: [{ value: "adicionar", label: "Adicionar" }, { value: "remover", label: "Remover" }] },
      { key: "indice", label: "Índice (remoção)", type: "range", min: 0, max: 4, value: 1 },
      { key: "capacidade", label: "Capacidade", type: "range", min: 3, max: 12, value: 4 },
      { key: "estrutura", label: "Estrutura", type: "select", value: "vetor", options: [{ value: "vetor", label: "Vetor (List<T>)" }, { value: "encadeada", label: "Lista encadeada" }] }
    ],
    presets: [
      { label: "Adicionar Ana", params: { nome: "Ana Prado", acao: "adicionar", indice: 1, capacidade: 4, estrutura: "vetor" } },
      { label: "Repetir Ana", params: { nome: "ana prado", acao: "adicionar", indice: 1, capacidade: 4, estrutura: "vetor" } },
      { label: "Remover índice 1", params: { nome: "Ana Prado", acao: "remover", indice: 1, capacidade: 4, estrutura: "vetor" } },
      { label: "Estourar capacidade", params: { nome: "Diego Alves", acao: "adicionar", indice: 1, capacidade: 3, estrutura: "vetor" } },
      { label: "Encadeada", params: { nome: "Ana Prado", acao: "remover", indice: 1, capacidade: 4, estrutura: "encadeada" } }
    ],
    build: build, paint: paint
  });
})();
