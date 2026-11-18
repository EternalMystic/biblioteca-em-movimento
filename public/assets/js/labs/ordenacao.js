/* Laboratório — ordenação com contadores */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  function baseArray(p) {
    var n = +p.tamanho, out = [], i;
    if (p.entrada === "inversa") { for (i = 0; i < n; i++) out.push(90 - i * Math.floor(80 / n)); return out; }
    if (p.entrada === "quase") { for (i = 0; i < n; i++) out.push(10 + i * 7); var t = out[n - 2]; out[n - 2] = out[n - 1]; out[n - 1] = t; return out; }
    if (p.entrada === "repetidos") { for (i = 0; i < n; i++) out.push([20, 20, 50, 50, 80, 35][i % 6]); return out; }
    var seed = 7;
    for (i = 0; i < n; i++) { seed = (seed * 9301 + 49297) % 233280; out.push(8 + Math.floor(seed / 233280 * 88)); }
    return out;
  }

  function build(p) {
    var arr = baseArray(p), frames = [], log = [], comps = 0, writes = 0, extra = 0;
    function push(note, o) {
      log.push("<span class='op'>passo " + (frames.length + 1) + "</span> " + note);
      frames.push(Object.assign({
        arr: arr.slice(), comps: comps, writes: writes, extra: extra, note: note, log: log.slice(),
        metrics: { "comparações": comps, "escritas": writes, "n": arr.length, "auxiliar": extra },
        state: { "algoritmo": p.algoritmo, "n": arr.length, "comparações": comps }
      }, o || {}));
    }
    push("Vetor inicial de " + arr.length + " posições. O objetivo é ordenar sem esconder o custo.", { sortedFrom: arr.length });

    if (p.algoritmo === "bubble") {
      for (var i = 0; i < arr.length - 1; i++) {
        var swapped = false;
        for (var j = 0; j < arr.length - 1 - i; j++) {
          comps++;
          push("Compara " + arr[j] + " e " + arr[j + 1] + ".", { a: j, b: j + 1, sortedFrom: arr.length - i });
          if (arr[j] > arr[j + 1]) {
            var t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t; writes += 2; swapped = true;
            push("Troca: " + arr[j + 1] + " ↔ " + arr[j] + ".", { a: j, b: j + 1, swap: true, sortedFrom: arr.length - i });
          }
        }
        if (!swapped) { push("Passada sem troca: o vetor já está ordenado; pode parar.", { sortedFrom: arr.length - i - 1, done: true }); break; }
      }
    } else if (p.algoritmo === "selection") {
      for (var s = 0; s < arr.length - 1; s++) {
        var min = s;
        push("Passada " + (s + 1) + ": procura o mínimo a partir de " + s + ".", { a: s, min: min, sortedFrom: s });
        for (var k = s + 1; k < arr.length; k++) {
          comps++;
          push("Compara " + arr[k] + " com o mínimo atual " + arr[min] + ".", { a: k, min: min, sortedFrom: s });
          if (arr[k] < arr[min]) min = k;
        }
        if (min !== s) { var tt = arr[s]; arr[s] = arr[min]; arr[min] = tt; writes += 2; push("Troca posições " + s + " e " + min + ".", { a: s, b: min, swap: true, sortedFrom: s }); }
        else push("O mínimo já estava em " + s + "; nenhuma troca.", { sortedFrom: s });
      }
    } else if (p.algoritmo === "insertion") {
      for (var q = 1; q < arr.length; q++) {
        var key = arr[q], r = q - 1;
        push("Chave " + key + " na posição " + q + ".", { a: q, key: key, sortedFrom: q });
        while (r >= 0) {
          comps++;
          push("Compara " + arr[r] + " com a chave " + key + ".", { a: r, key: key, sortedFrom: q });
          if (arr[r] <= key) break;
          arr[r + 1] = arr[r]; writes++;
          push("Desloca " + arr[r] + " para a direita.", { a: r, b: r + 1, key: key, sortedFrom: q });
          r--;
        }
        arr[r + 1] = key; writes++;
        push("Insere a chave em " + (r + 1) + ".", { a: r + 1, key: key, sortedFrom: q });
      }
    } else if (p.algoritmo === "merge") {
      var aux = new Array(arr.length); extra = arr.length;
      function ms(lo, hi, depth) {
        if (hi - lo < 1) return;
        var mid = Math.floor((lo + hi) / 2);
        push("Divide [" + lo + "," + hi + "] em [" + lo + "," + mid + "] e [" + (mid + 1) + "," + hi + "].", { a: lo, b: hi, depth: depth });
        ms(lo, mid, depth + 1); ms(mid + 1, hi, depth + 1);
        var i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) {
          comps++;
          push("Funde: compara " + arr[i] + " e " + arr[j] + ".", { a: i, b: j, depth: depth });
          aux[k++] = arr[i] <= arr[j] ? arr[i++] : arr[j++];
        }
        while (i <= mid) aux[k++] = arr[i++];
        while (j <= hi) aux[k++] = arr[j++];
        for (var x = lo; x <= hi; x++) { arr[x] = aux[x]; writes++; }
        push("Copia [" + lo + "," + hi + "] de volta: " + arr.slice(lo, hi + 1).join(", ") + ".", { a: lo, b: hi, depth: depth, sortedFrom: arr.length });
      }
      ms(0, arr.length - 1, 0);
    } else {
      function qs(lo, hi) {
        if (lo >= hi) return;
        var pivot = arr[hi], i = lo - 1;
        push("Partição [" + lo + "," + hi + "] com pivô " + pivot + ".", { pivot: hi, a: lo, b: hi });
        for (var j = lo; j < hi; j++) {
          comps++;
          push("Compara " + arr[j] + " com o pivô " + pivot + ".", { a: j, pivot: hi });
          if (arr[j] <= pivot) {
            i++;
            if (i !== j) { var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; writes += 2; push("Troca " + i + " e " + j + ".", { a: i, b: j, pivot: hi, swap: true }); }
          }
        }
        var tp = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = tp; writes += 2;
        push("Pivô vai para " + (i + 1) + ".", { a: i + 1, pivot: i + 1, swap: true });
        qs(lo, i); qs(i + 2, hi);
      }
      qs(0, arr.length - 1);
    }
    push("Fim: vetor ordenado. " + comps + " comparações e " + writes + " escritas.", { done: true, sortedFrom: 0 });
    return { frames: frames };
  }

  function paint(f, s) {
    s.text("h", ({ bubble: "Bubble Sort", selection: "Selection Sort", insertion: "Insertion Sort", merge: "Merge Sort", quick: "Quick Sort" })[(f.state || {}).algoritmo] || "Ordenação", { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "comparações " + f.comps + " · escritas " + f.writes + (f.extra ? " · auxiliar " + f.extra : ""), { x: 16, y: 38, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    var n = f.arr.length, base = 330, maxV = 100;
    var w = Math.min(52, 580 / n);
    for (var i = 0; i < n; i++) {
      var v = f.arr[i], h = Math.max(4, v / maxV * 230);
      var x = 24 + i * (w + 4);
      var sorted = f.sortedFrom !== undefined && i >= f.sortedFrom;
      var isA = f.a === i, isB = f.b === i, isP = f.pivot === i, isMin = f.min === i;
      var fill = isP ? C.blue : isA || isB ? C.amber : isMin ? C.amberSoft : sorted ? C.green : "#C9D6CF";
      s.node("b" + i, "rect", { x: x, y: base - h, width: w, height: h, rx: 3, fill: fill, stroke: sorted ? C.green : "#AFC3B8" });
      s.text("v" + i, String(v), { x: x + w / 2, y: base - h - 6, "text-anchor": "middle", fill: C.ink2, "font-size": Math.min(8, w / 2.6), "font-family": "var(--font-mono)" });
      s.text("i" + i, String(i), { x: x + w / 2, y: base + 14, "text-anchor": "middle", fill: C.ink3, "font-size": 5.6, "font-family": "var(--font-mono)" });
    }
    s.node("base", "line", { x1: 18, y1: base, x2: 620, y2: base, stroke: C.ink3 });
    s.text("leg", "amarelo: comparação · azul: pivô · verde: posição final", { x: 24, y: 372, fill: C.ink3, "font-size": 7 });
    if (f.done) s.text("done", "ordenado", { x: 600, y: 38, "text-anchor": "end", fill: C.green, "font-size": 8, "font-weight": 700 });
  }

  Lab.mount(root, {
    id: "ordenacao", width: 640, height: 400,
    params: [
      { key: "algoritmo", label: "Algoritmo", type: "select", value: "bubble", options: [
        { value: "bubble", label: "Bubble" }, { value: "selection", label: "Selection" }, { value: "insertion", label: "Insertion" },
        { value: "merge", label: "Merge" }, { value: "quick", label: "Quick" }] },
      { key: "entrada", label: "Entrada", type: "select", value: "aleatoria", options: [
        { value: "aleatoria", label: "Aleatória" }, { value: "inversa", label: "Inversa" }, { value: "quase", label: "Quase ordenada" }, { value: "repetidos", label: "Com repetidos" }] },
      { key: "tamanho", label: "Tamanho", type: "range", min: 5, max: 12, value: 8 }
    ],
    presets: [
      { label: "Bubble · inversa", params: { algoritmo: "bubble", entrada: "inversa", tamanho: 8 } },
      { label: "Insertion · quase", params: { algoritmo: "insertion", entrada: "quase", tamanho: 8 } },
      { label: "Selection · repetidos", params: { algoritmo: "selection", entrada: "repetidos", tamanho: 8 } },
      { label: "Merge · aleatória", params: { algoritmo: "merge", entrada: "aleatoria", tamanho: 8 } },
      { label: "Quick · inversa", params: { algoritmo: "quick", entrada: "inversa", tamanho: 8 } }
    ],
    build: build, paint: paint
  });
})();
