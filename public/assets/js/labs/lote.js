/* Rotina 11 — Três máquinas para a mesma cadeia */
(function () {
  "use strict";
  var root = document.getElementById("lab");
  if (!root || !window.Lab) return;
  var C = window.PI_DATA.COLORS;

  function afdBuild(input) {
    var q = "q0", frames = [], log = [], i = 0;
    var delta = {
      q0: { a: "q0", b: "q1", c: "q2" },
      q1: { b: "q1", c: "q2" },
      q2: { c: "q2" }
    };
    frames.push({ kind: "afd", input: input, pos: -1, state: q, stateName: q, state: { "entrada": input || "(vazia)", "estado": q, "posição": "—" }, note: "AFD lê a ordem dos blocos. Estado inicial q0.", metrics: { "símbolos": input.length, "passos": 0, "estado": q }, log: [] });
    for (i = 0; i < input.length; i++) {
      var ch = input[i], nxt = (delta[q] || {})[ch];
      if (!nxt) {
        log.push("<span class='op'>rejeita</span> " + ch + " em " + q);
        frames.push({ kind: "afd", input: input, pos: i, state: q, stateName: q, state: { "entrada": input, "estado": q, "posição": i }, bad: true, note: "Em " + q + ", o símbolo “" + ch + "” não tem transição: rejeita.", metrics: { "símbolos": i + 1, "passos": i + 1, "estado": q }, log: log.slice() });
        return frames;
      }
      q = nxt; log.push("<span class='op'>δ</span> " + ch + " → " + q);
      frames.push({ kind: "afd", input: input, pos: i, state: q, stateName: q, state: { "entrada": input, "estado": q, "posição": i }, note: "Lê “" + ch + "” e vai para " + q + ".", metrics: { "símbolos": i + 1, "passos": i + 1, "estado": q }, log: log.slice() });
    }
    frames.push({ kind: "afd", input: input, pos: input.length, state: q, stateName: q, state: { "entrada": input, "estado": q, "posição": "fim" }, ok: true, note: "Aceita: a ordem a*b*c* foi respeitada. O AFD não conta símbolos — por isso aceitaria aabcc.", metrics: { "símbolos": input.length, "passos": input.length, "estado": q }, log: log.slice() });
    return frames;
  }

  function apBuild(input) {
    var q = "q0", stack = [], frames = [], log = [], i = 0;
    frames.push({ kind: "ap", input: input, pos: -1, state: q, stateName: q, stack: [], note: "Autômato de pilha: q0 empilha a, q1 desempilha com b, q2 confere c.", metrics: { "símbolos": input.length, "passos": 0, "pilha": 0 }, log: [] });
    for (i = 0; i < input.length; i++) {
      var ch = input[i], bad = false, note = "";
      if (q === "q0") {
        if (ch === "a") { stack.push("A"); note = "Empilha A."; }
        else if (ch === "b") { q = "q1"; note = stack.length ? "Troca para q1 e desempilha A." : "b sem a na pilha: rejeita."; if (stack.length) stack.pop(); else bad = true; }
        else bad = true;
      } else if (q === "q1") {
        if (ch === "b") { if (stack.length) { stack.pop(); note = "Desempilha A."; } else { bad = true; note = "Pilha vazia: rejeita."; } }
        else if (ch === "c") { q = "q2"; note = "Troca para q2; c não mexe na pilha."; }
        else bad = true;
      } else {
        if (ch === "c") note = "c não mexe na pilha.";
        else bad = true;
      }
      if (bad) {
        log.push("<span class='op'>rejeita</span> " + ch + " em " + q);
        frames.push({ kind: "ap", input: input, pos: i, state: q, stateName: q, stack: stack.slice(), state: { "entrada": input, "estado": q, "posição": i }, bad: true, note: "Rejeita: " + (note || "símbolo fora de ordem em " + q) + ".", metrics: { "símbolos": i + 1, "passos": i + 1, "pilha": stack.length }, log: log.slice() });
        return frames;
      }
      log.push("<span class='op'>passo</span> " + ch + " · " + note);
      frames.push({ kind: "ap", input: input, pos: i, state: q, stateName: q, stack: stack.slice(), state: { "entrada": input, "estado": q, "posição": i }, note: note, metrics: { "símbolos": i + 1, "passos": i + 1, "pilha": stack.length }, log: log.slice() });
    }
    var ok = (q === "q2" && stack.length === 0) || (input.length === 0);
    frames.push({ kind: "ap", input: input, pos: input.length, state: q, stateName: q, stack: stack.slice(), ok: ok, limitNote: true,
      note: ok ? "Pilha vazia: aⁿbⁿ foi reconhecido. Mas o AP não contou os c — a pilha não tem segundo contador. Para aⁿbⁿcⁿ é preciso fita (LBA/MT)." : "Rejeita: sobrou " + stack.length + " A na pilha (contagem de a e b diferente).",
      metrics: { "símbolos": input.length, "passos": input.length, "pilha": stack.length }, log: log.slice() });
    return frames;
  }

  function mtBuild(input) {
    var tape = input.split("");
    if (!tape.length) tape = ["␣"];
    var head = 0, q = "q0", frames = [], log = [], steps = 0, max = 240;
    function snap(note, extra) {
      frames.push(Object.assign({
        kind: "mt", tape: tape.slice(), head: head, state: q, steps: steps, note: note, log: log.slice(),
        metrics: { "passos": steps, "cabeça": head, "estado": q, "limite": max },
        state: { "fita": tape.join(""), "cabeça": head, "estado": q }
      }, extra || {}));
    }
    snap("Fita inicial. q0 procura o primeiro “a” não marcado.", {});
    while (steps < max) {
      var ch = tape[head] === undefined ? "␣" : tape[head];
      var nxt = null;
      if (q === "q0") {
        if (ch === "X") { head++; nxt = "q0"; }
        else if (ch === "a") { tape[head] = "X"; head++; nxt = "q1"; }
        else if (ch === "Y" || ch === "Z" || ch === "␣") { q = "qA"; snap("Todos os a já foram marcados: aceita.", { ok: true }); return frames; }
        else { q = "qR"; snap("Símbolo inesperado “" + ch + "” em q0.", { bad: true }); return frames; }
      } else if (q === "q1") {
        if (ch === "Y") { head++; nxt = "q1"; }
        else if (ch === "a") { head++; nxt = "q1"; }
        else if (ch === "b") { tape[head] = "Y"; head++; nxt = "q2"; }
        else { q = "qR"; snap("Esperava b, encontrou “" + ch + "”.", { bad: true }); return frames; }
      } else if (q === "q2") {
        if (ch === "Z") { head++; nxt = "q2"; }
        else if (ch === "b") { head++; nxt = "q2"; }
        else if (ch === "c") { tape[head] = "Z"; head--; nxt = "q3"; }
        else { q = "qR"; snap("Esperava c, encontrou “" + ch + "”.", { bad: true }); return frames; }
      } else if (q === "q3") {
        if (ch === "X" || ch === "Y" || ch === "Z" || ch === "a" || ch === "b" || ch === "c") { head--; nxt = "q3"; }
        else if (ch === "␣") { head++; nxt = "q0"; }
        else { q = "qR"; snap("Símbolo inesperado no retorno.", { bad: true }); return frames; }
      }
      q = nxt; steps++;
      if (head < 0) { tape.unshift("␣"); head = 0; }
      snap("Passo " + steps + ": lê “" + ch + "” e move " + (q === "q3" ? "para a esquerda" : "para a direita") + ".");
      if (head >= tape.length) tape.push("␣");
    }
    q = "qL"; snap("Limite de " + max + " passos atingido: interrompida. Não é prova de indecidibilidade.", { limit: true });
    return frames;
  }

  function build(p) {
    var input = String(p.cadeia || "");
    if (!/^[abc]*$/.test(input)) input = input.replace(/[^abc]/g, "");
    if (p.maquina === "ap") return { frames: apBuild(input) };
    if (p.maquina === "mt") return { frames: mtBuild(input) };
    return { frames: afdBuild(input) };
  }

  function tape(s, f, x0, y0, cw) {
    var arr = f.tape || (f.input || "").split("");
    var head = f.head !== undefined ? f.head : (f.pos >= 0 ? f.pos : 0);
    var start = Math.max(0, Math.min(head - 6, Math.max(0, arr.length - 13)));
    for (var k = 0; k < 13; k++) {
      var idx = start + k;
      var ch = arr[idx] === undefined ? "␣" : arr[idx];
      var isHead = idx === head;
      s.node("t" + k, "rect", { x: x0 + k * cw, y: y0, width: cw - 2, height: 34, rx: 3, fill: isHead ? C.amberSoft : C.white, stroke: isHead ? C.amber : C.line, "stroke-width": isHead ? 2 : 1 });
      s.text("tt" + k, ch, { x: x0 + k * cw + (cw - 2) / 2, y: y0 + 23, "text-anchor": "middle", fill: ch === "X" || ch === "Y" || ch === "Z" ? C.blue : ch === "␣" ? "#BDB8AA" : C.ink, "font-size": 13, "font-weight": 700, "font-family": "var(--font-mono)" });
      s.text("ti" + k, String(idx), { x: x0 + k * cw + (cw - 2) / 2, y: y0 - 4, "text-anchor": "middle", fill: C.ink3, "font-size": 5.6 });
    }
    s.text("head", "▲", { x: x0 + (head - start) * cw + cw / 2, y: y0 + 48, "text-anchor": "middle", fill: C.blue, "font-size": 9 });
  }

  function paint(f, s) {
    var title = { afd: "AFD · ordem a*b*c*", ap: "Autômato de pilha · aⁿbⁿcⁿ", mt: "Máquina de Turing · marcação" }[f.kind];
    s.text("h", title, { x: 16, y: 22, fill: C.green, "font-size": 12, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("hs", "cadeia: " + (f.input || f.tape.join("")) + " · " + (f.kind === "mt" ? "fita com branco ␣" : "fita finita"), { x: 16, y: 38, fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });

    if (f.kind === "mt") {
      tape(s, f, 20, 64, 44);
      s.text("st", "estado " + (f.stateName || f.state), { x: 20, y: 136, fill: C.blue, "font-size": 9, "font-family": "var(--font-mono)" });
      s.text("sp", "passos " + f.steps + " / 240", { x: 140, y: 136, fill: C.ink3, "font-size": 8, "font-family": "var(--font-mono)" });
      s.node("leg", "rect", { x: 20, y: 152, width: 604, height: 34, rx: 5, fill: "#F7F4EA", stroke: C.line });
      s.text("legt", "X = a marcado · Y = b marcado · Z = c marcado · ␣ = branco", { x: 30, y: 173, fill: C.ink2, "font-size": 7.5, "font-family": "var(--font-mono)" });
      s.text("note", "q0 marca a; q1 marca b; q2 marca c e volta; q3 retorna ao início. Cada rodada consome um de cada.", { x: 20, y: 210, fill: C.ink3, "font-size": 7.5 });
    } else {
      tape(s, f, 20, 64, 40);
      s.text("st", "estado " + (f.stateName || f.state), { x: 20, y: 136, fill: C.blue, "font-size": 9, "font-family": "var(--font-mono)" });
    }

    if (f.kind === "ap") {
      s.text("pt", "PILHA", { x: 20, y: 170, fill: C.ink3, "font-size": 7.5, "letter-spacing": 1, "font-family": "var(--font-mono)" });
      s.node("base", "line", { x1: 20, y1: 330, x2: 110, y2: 330, stroke: C.ink2, "stroke-width": 2 });
      (f.stack || []).forEach(function (x, i) {
        var y = 314 - i * 20;
        s.node("sk" + i, "rect", { x: 24, y: y, width: 82, height: 17, rx: 2, fill: i === f.stack.length - 1 ? C.amberSoft : C.white, stroke: i === f.stack.length - 1 ? C.amber : C.line });
        s.text("skt" + i, x, { x: 65, y: y + 12, "text-anchor": "middle", fill: C.ink, "font-size": 8, "font-family": "var(--font-mono)" });
      });
      if (!(f.stack || []).length) s.text("se", "vazia", { x: 65, y: 324, "text-anchor": "middle", fill: C.ink3, "font-size": 8, "font-style": "italic" });
      s.text("apn", "Empilha em a, desempilha em b, confere c. A pilha é a memória que o AFD não tem.", { x: 130, y: 200, fill: C.ink2, "font-size": 8 });
      s.text("apn2", "aⁿbⁿcⁿ não é livre de contexto: falta um segundo contador. A pilha reconhece aⁿbⁿ, não os três blocos.", { x: 130, y: 220, fill: C.amber, "font-size": 7.5 });
    } else if (f.kind === "afd") {
      s.text("afn", "O AFD verifica a ordem dos blocos, não a igualdade das contagens.", { x: 20, y: 180, fill: C.ink2, "font-size": 8 });
      s.text("afn2", "Por isso aabcc é aceita: há um bloco a, um bloco b e um bloco c, nesta ordem.", { x: 20, y: 200, fill: C.amber, "font-size": 8 });
    } else {
      s.text("mtn", "A fita é a memória externa: o cabeçote lê, escreve e desloca. O estado é finito.", { x: 20, y: 246, fill: C.ink2, "font-size": 8 });
    }

    var ok = f.ok, bad = f.bad, lim = f.limit;
    s.node("res", "rect", { x: 430, y: 150, width: 194, height: 52, rx: 7, fill: ok ? C.greenSoft : bad ? C.redSoft : lim ? C.amberSoft : "#F4F1E7", stroke: ok ? "#7FB08F" : bad ? "#D8A5A5" : C.line });
    s.text("rest", ok ? "ACEITA" : bad ? "REJEITA" : lim ? "INTERROMPIDA" : "EM CURSO", { x: 527, y: 172, "text-anchor": "middle", fill: ok ? C.green : bad ? C.red : lim ? C.amber : C.ink3, "font-size": 11, "font-weight": 700, "font-family": "var(--font-head)" });
    s.text("ress", "passos: " + (f.steps !== undefined ? f.steps : f.pos + 1), { x: 527, y: 190, "text-anchor": "middle", fill: C.ink3, "font-size": 7.5, "font-family": "var(--font-mono)" });
    if (lim) s.text("lim", "limite não decide: poderia haver aceitação depois.", { x: 430, y: 216, fill: C.amber, "font-size": 7 });
  }

  Lab.mount(root, {
    id: "lote", width: 640, height: 400,
    params: [
      { key: "cadeia", label: "Cadeia (a, b, c)", type: "text", value: "aabbcc" },
      { key: "maquina", label: "Máquina", type: "select", value: "afd", options: [
        { value: "afd", label: "AFD (ordem)" }, { value: "ap", label: "Autômato de pilha" }, { value: "mt", label: "Máquina de Turing" }] }
    ],
    presets: [
      { label: "aabbcc", params: { cadeia: "aabbcc", maquina: "afd" } },
      { label: "aabcc", params: { cadeia: "aabcc", maquina: "afd" } },
      { label: "aabcc · pilha", params: { cadeia: "aabcc", maquina: "ap" } },
      { label: "acb", params: { cadeia: "acb", maquina: "afd" } },
      { label: "vazia", params: { cadeia: "", maquina: "mt" } },
      { label: "aabbcc · MT", params: { cadeia: "aabbcc", maquina: "mt" } }
    ],
    build: build, paint: paint
  });
})();
