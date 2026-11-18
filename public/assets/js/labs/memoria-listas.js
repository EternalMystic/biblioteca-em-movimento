/* Laboratório — vetor, LSE, LDE, pilha e fila */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  function build(p) {
    var frames = [], log = [], val = String(p.valor || "X").slice(0, 3), idx = +p.indice;
    var arr = ["A", "B", "C", "D"], stack = ["A", "B", "C"], queue = ["A", "B", "C"], qcap = 5;
    var nodes = [{ v: "A", next: 1, prev: -1 }, { v: "B", next: 2, prev: 0 }, { v: "C", next: -1, prev: 1 }];
    function add(note, extra) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        arr: arr.slice(), stack: stack.slice(), queue: queue.slice(), nodes: JSON.parse(JSON.stringify(nodes)), val: val, idx: idx,
        note: note, log: log.slice(),
        metrics: { "estrutura": p.estrutura, "elementos": arr.length, "passos": frames.length + 1 },
        state: { "estrutura": p.estrutura, "operação": p.operacao, "valor": val }
      }, extra || {}));
    }

    if (p.estrutura === "vetor") {
      add("Vetor contíguo: endereços crescentes, acesso por índice Θ(1).", { phase: "init" });
      if (p.operacao === "remover") {
        idx = Math.min(idx, arr.length - 1);
        for (var i = idx; i < arr.length - 1; i++) {
          add("Desloca " + arr[i + 1] + " de " + (i + 1) + " para " + i + ".", { phase: "shift", i: i });
          arr[i] = arr[i + 1];
        }
        arr.pop();
        add("Count--. O último slot fica logicamente vazio; o custo foi O(n).", { phase: "done" });
      } else {
        if (arr.length >= 6) { add("Capacidade cheia: aloca novo bloco e copia os 6 elementos.", { phase: "grow" }); }
        arr.push("·");
        for (var j = arr.length - 1; j > idx; j--) {
          add("Abre espaço: move " + arr[j - 1] + " de " + (j - 1) + " para " + j + ".", { phase: "shift", i: j });
          arr[j] = arr[j - 1];
        }
        arr[idx] = val;
        add("Grava “" + val + "” no índice " + idx + ". Inserção no meio custa O(n) por deslocamento.", { phase: "done" });
      }
      return { frames: frames };
    }

    if (p.estrutura === "pilha") {
      add("Pilha: topo no fim do vetor. LIFO.", { phase: "init" });
      if (p.operacao === "remover") {
        add("pop(): lê o topo " + stack[stack.length - 1] + ".", { phase: "read" });
        var out = stack.pop();
        add("Topo decrementa; “" + out + "” sai. O(1).", { phase: "done", popped: out });
      } else {
        stack.push(val);
        add("push(“" + val + "”): grava em topo e incrementa. O(1).", { phase: "done" });
      }
      return { frames: frames };
    }

    if (p.estrutura === "fila") {
      var front = 0, count = queue.length, slots = queue.slice();
      while (slots.length < qcap) slots.push("·");
      add("Fila circular de " + qcap + " slots: frente " + front + ", fim " + ((front + count - 1 + qcap) % qcap) + ", count " + count + ".", { phase: "init", front: front, count: count, slots: slots.slice() });
      if (p.operacao === "remover") {
        var out2 = slots[front];
        slots[front] = "·"; front = (front + 1) % qcap; count--;
        add("dequeue(): remove “" + out2 + "” da frente; frente avança sem deslocar ninguém. O(1).", { phase: "done", front: front, count: count, slots: slots.slice(), popped: out2 });
      } else {
        var rear = (front + count) % qcap;
        if (count === qcap) { add("Fila cheia: sem slot livre. A implementação precisa crescer ou recusar.", { phase: "full", front: front, count: count, slots: slots.slice() }); return { frames: frames }; }
        slots[rear] = val; count++;
        add("enqueue(“" + val + "”): grava em " + rear + " e incrementa count. O(1).", { phase: "done", front: front, count: count, slots: slots.slice() });
      }
      return { frames: frames };
    }

    // listas
    add((p.estrutura === "lde" ? "Lista duplamente encadeada" : "Lista simplesmente encadeada") + ": nós com endereços próprios, encadeados por ponteiros.", { phase: "init", head: 0 });
    if (p.operacao === "remover") {
      idx = Math.min(idx, nodes.length - 1);
      var prev = idx - 1;
      for (var k = 0; k <= idx; k++) add("Percorre o nó " + k + " (“" + nodes[k].v + "”).", { phase: "walk", at: k, head: 0 });
      if (prev >= 0) {
        add("Religa o anterior (" + nodes[prev].v + ") ao próximo (" + (nodes[idx].next >= 0 ? nodes[nodes[idx].next].v : "NULL") + ").", { phase: "relink", at: idx, head: 0 });
        nodes[prev].next = nodes[idx].next;
        if (p.estrutura === "lde" && nodes[idx].next >= 0) nodes[nodes[idx].next].prev = prev;
      }
      var removed = nodes[idx].v;
      nodes.splice(idx, 1);
      add("free(“" + removed + "”). Nenhum outro nó se desloca; o custo foi localizar O(n) + religar O(1).", { phase: "done", head: 0 });
    } else {
      var novo = { v: val, next: idx < nodes.length ? idx : -1, prev: idx - 1 };
      for (var w = 0; w < Math.min(idx, nodes.length); w++) add("Percorre até a posição " + idx + " (nó " + w + ").", { phase: "walk", at: w, head: 0 });
      add("Cria o nó “" + val + "” em endereço novo e aponta next para " + (idx < nodes.length ? nodes[idx].v : "NULL") + ".", { phase: "new", at: idx, head: 0 });
      nodes.splice(idx, 0, novo);
      if (idx > 0) nodes[idx - 1].next = idx;
      if (p.estrutura === "lde" && idx + 1 < nodes.length) nodes[idx + 1].prev = idx;
      add("Religa o anterior ao novo nó. " + (p.estrutura === "lde" ? "O prev do próximo também é ajustado." : "Só existe o ponteiro next."), { phase: "done", head: 0 });
    }
    return { frames: frames };
  }

  function paint(f, s, p) {
    var tipo = p.estrutura;
    s.text("h", ({ vetor: "Vetor contíguo", lse: "Lista simplesmente encadeada", lde: "Lista duplamente encadeada", pilha: "Pilha (LIFO)", fila: "Fila circular (FIFO)" })[tipo], { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "endereços ilustrativos · " + (tipo === "vetor" ? "memória contígua" : tipo === "fila" ? "frente e fim caminham" : "nós independentes"), { x: 16, y: 39, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    if (tipo === "vetor") {
      var n = Math.max(6, f.arr.length), cw = Math.min(78, 560 / n);
      f.arr.forEach(function (v, i) {
        var x = 24 + i * cw, on = f.i === i;
        s.node("vc" + i, "rect", { x: x, y: 80, width: cw - 5, height: 54, rx: 4, fill: on ? C.amberSoft : C.white, stroke: on ? C.amber : C.line });
        s.text("vt" + i, v, { x: x + (cw - 5) / 2, y: 113, "text-anchor": "middle", fill: C.ink, "font-size": 12, "font-weight": 700, "font-family": "var(--font-mono)" });
        s.text("vi" + i, String(i), { x: x + (cw - 5) / 2, y: 72, "text-anchor": "middle", fill: C.ink3, "font-size": 6.5 });
        s.text("va" + i, "0x" + (2000 + i * 4).toString(16).toUpperCase(), { x: x + (cw - 5) / 2, y: 150, "text-anchor": "middle", fill: "#A9A499", "font-size": 6 });
      });
      for (var k = f.arr.length; k < n; k++) {
        var xx = 24 + k * cw;
        s.node("ve" + k, "rect", { x: xx, y: 80, width: cw - 5, height: 54, rx: 4, fill: "#F4F1E7", stroke: C.line, "stroke-dasharray": "3 3" });
      }
      s.text("vnote", f.phase === "shift" ? "deslocamento: cada célula à direita é copiada" : f.phase === "grow" ? "capacidade esgotada: novo bloco + cópia" : "acesso por índice: base + i × tamanho", { x: 24, y: 190, fill: C.amber, "font-size": 8 });
      s.text("vnote2", "Inserir/remover no meio é O(n); ler ou gravar por índice é O(1).", { x: 24, y: 212, fill: C.ink3, "font-size": 7.5 });
      return;
    }

    if (tipo === "pilha") {
      s.node("base", "line", { x1: 120, y1: 330, x2: 260, y2: 330, stroke: C.ink2, "stroke-width": 2 });
      f.stack.forEach(function (v, i) {
        var y = 300 - i * 44;
        s.node("sc" + i, "rect", { x: 130, y: y, width: 120, height: 36, rx: 4, fill: i === f.stack.length - 1 ? C.amberSoft : C.white, stroke: i === f.stack.length - 1 ? C.amber : C.line });
        s.text("sct" + i, v, { x: 190, y: y + 24, "text-anchor": "middle", fill: C.ink, "font-size": 12, "font-weight": 700, "font-family": "var(--font-mono)" });
      });
      s.text("top", "topo → " + (f.stack.length ? f.stack[f.stack.length - 1] : "vazio"), { x: 270, y: 300 - (f.stack.length - 1) * 44 + 20, fill: C.blue, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("pnote", "push e pop só no topo: O(1). A base não se move.", { x: 130, y: 360, fill: C.ink3, "font-size": 7.5 });
      return;
    }

    if (tipo === "fila") {
      var cap = 5, cx = 190, cy = 200, R = 90;
      for (var q = 0; q < cap; q++) {
        var ang = -Math.PI / 2 + q * 2 * Math.PI / cap;
        var x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
        var on2 = q === f.front;
        s.node("fc" + q, "rect", { x: x - 22, y: y - 16, width: 44, height: 32, rx: 4, fill: on2 ? C.amberSoft : C.white, stroke: on2 ? C.amber : C.line });
        s.text("fct" + q, (f.slots && f.slots[q]) || "·", { x: x, y: y + 4, "text-anchor": "middle", fill: C.ink, "font-size": 9, "font-family": "var(--font-mono)" });
        s.text("fi" + q, String(q), { x: x, y: y - 22, "text-anchor": "middle", fill: C.ink3, "font-size": 6 });
      }
      s.text("fr", "frente = " + f.front + " · count = " + f.count, { x: 320, y: 140, fill: C.blue, "font-size": 8, "font-family": "var(--font-mono)" });
      s.text("fr2", "fim = " + ((f.front + f.count - 1 + cap) % cap), { x: 320, y: 158, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
      s.text("fnote", "Circular: frente e fim avançam com módulo; ninguém desloca.", { x: 320, y: 190, fill: C.ink3, "font-size": 7.5 });
      return;
    }

    // listas
    var startX = 30, y = 120;
    f.nodes.forEach(function (n, i) {
      var x = startX + i * 120, on = f.at === i;
      s.node("ln" + i, "rect", { x: x, y: y, width: 66, height: 44, rx: 5, fill: on ? C.amberSoft : C.white, stroke: on ? C.amber : C.line });
      s.text("lv" + i, n.v, { x: x + 33, y: y + 20, "text-anchor": "middle", fill: C.ink, "font-size": 10, "font-weight": 700, "font-family": "var(--font-mono)" });
      s.text("la" + i, "0x" + (3000 + i * 16).toString(16).toUpperCase(), { x: x + 33, y: y + 36, "text-anchor": "middle", fill: C.ink3, "font-size": 5.8, "font-family": "var(--font-mono)" });
      if (i < f.nodes.length - 1) {
        s.node("ar" + i, "line", { x1: x + 66, y1: y + 22, x2: x + 120, y2: y + 22, stroke: C.ink3, "marker-end": "url(#arrow)" });
        s.text("nx" + i, "next", { x: x + 92, y: y + 16, "text-anchor": "middle", fill: C.ink3, "font-size": 5.5 });
      } else {
        s.text("null" + i, "NULL", { x: x + 88, y: y + 26, fill: C.ink3, "font-size": 7, "font-family": "var(--font-mono)" });
      }
      if (tipo === "lde" && i > 0) {
        s.node("pr" + i, "line", { x1: x, y1: y + 58, x2: x - 54, y2: y + 58, stroke: C.blue, "stroke-dasharray": "3 2" });
        s.text("prt" + i, "prev", { x: x - 28, y: y + 72, "text-anchor": "middle", fill: C.blue, "font-size": 5.5 });
      }
    });
    s.text("head", "início", { x: 30, y: 104, fill: C.green, "font-size": 7, "font-family": "var(--font-mono)" });
    s.text("lnote", tipo === "lde" ? "LDE: cada nó guarda next e prev; remover no meio não precisa percorrer de novo." : "LSE: só next; para remover, é preciso guardar o anterior durante a travessia.", { x: 30, y: 250, fill: C.ink3, "font-size": 7.5 });
    s.text("lnote2", "Nós não são contíguos: o próximo endereço vem do ponteiro, não de i+1.", { x: 30, y: 270, fill: C.amber, "font-size": 7.5 });
  }

  Lab.mount(root, {
    id: "memoria-listas", width: 640, height: 400,
    params: [
      { key: "estrutura", label: "Estrutura", type: "select", value: "vetor", options: [
        { value: "vetor", label: "Vetor" }, { value: "lse", label: "LSE" }, { value: "lde", label: "LDE" }, { value: "pilha", label: "Pilha" }, { value: "fila", label: "Fila circular" }] },
      { key: "operacao", label: "Operação", type: "select", value: "inserir", options: [{ value: "inserir", label: "Inserir / push / enqueue" }, { value: "remover", label: "Remover / pop / dequeue" }] },
      { key: "valor", label: "Valor", type: "text", value: "X" },
      { key: "indice", label: "Índice", type: "range", min: 0, max: 4, value: 1 }
    ],
    presets: [
      { label: "Vetor: inserir", params: { estrutura: "vetor", operacao: "inserir", valor: "X", indice: 1 } },
      { label: "Vetor: remover", params: { estrutura: "vetor", operacao: "remover", valor: "X", indice: 1 } },
      { label: "LSE: inserir", params: { estrutura: "lse", operacao: "inserir", valor: "X", indice: 2 } },
      { label: "LDE: remover", params: { estrutura: "lde", operacao: "remover", valor: "X", indice: 1 } },
      { label: "Pilha: push", params: { estrutura: "pilha", operacao: "inserir", valor: "D", indice: 1 } },
      { label: "Fila: enqueue", params: { estrutura: "fila", operacao: "inserir", valor: "D", indice: 1 } }
    ],
    build: build, paint: paint
  });
})();
