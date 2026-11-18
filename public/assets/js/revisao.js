/* Revisão intercalada — baralho, caixas e caderno de erros */
(function () {
  "use strict";
  var Store = window.PI_STORE, ALL = window.PI_QUIZ || [];
  if (!Store || !ALL.length) return;
  var root = document.getElementById("review-q");
  if (!root) return;

  var filter = "all", deck = [], idx = 0, answered = false;
  var qEl = document.getElementById("review-q");
  var optsEl = document.getElementById("review-opts");
  var fbEl = document.getElementById("review-fb");
  var posEl = document.getElementById("review-pos");
  var trackEl = document.getElementById("review-track");
  var boxEl = document.getElementById("review-box");
  var statsEl = document.getElementById("review-stats");
  var progEl = document.getElementById("review-progress");

  function review() { return Store.get("review", {}); }
  function stateOf(id) { return review()[id] || { box: 1, seen: 0, doubt: false, ok: null }; }
  function build() {
    var r = review();
    deck = ALL.filter(function (q) {
      var s = r[q.id] || {};
      if (filter === "ed" || filter === "grafos" || filter === "tc") return q.track === filter;
      if (filter === "wrong") return s.ok === false;
      if (filter === "doubt") return !!s.doubt;
      return true;
    });
    // ordem: dúvidas e caixas baixas primeiro, depois intercalar trilhas
    deck.sort(function (a, b) {
      var sa = stateOf(a.id), sb = stateOf(b.id);
      var pa = (sa.doubt ? -2 : 0) + (sa.ok === false ? -1 : 0) + (sa.box || 1);
      var pb = (sb.doubt ? -2 : 0) + (sb.ok === false ? -1 : 0) + (sb.box || 1);
      return pa - pb;
    });
    idx = 0;
    render();
    renderStats();
    notebook();
  }
  function render() {
    answered = false;
    fbEl.className = "quiz__fb";
    fbEl.innerHTML = "";
    if (!deck.length) {
      qEl.textContent = "Nenhuma questão neste filtro. Responda algumas aulas primeiro.";
      optsEl.innerHTML = "";
      posEl.textContent = "0 de 0";
      trackEl.textContent = "—";
      return;
    }
    var q = deck[idx], s = stateOf(q.id);
    qEl.innerHTML = q.q;
    posEl.textContent = (idx + 1) + " de " + deck.length;
    trackEl.textContent = ({ ed: "Estruturas de Dados", grafos: "Grafos", tc: "Teoria da Computação" })[q.track];
    boxEl.textContent = "caixa " + (s.box || 1) + (s.doubt ? " · dúvida" : "");
    optsEl.innerHTML = q.options.map(function (o, i) {
      return '<button class="quiz__opt" data-i="' + i + '"><span class="mark">' + "ABCD"[i] + "</span><span>" + o + "</span></button>";
    }).join("");
    Array.prototype.forEach.call(optsEl.children, function (b) {
      b.addEventListener("click", function () { answer(Number(b.getAttribute("data-i"))); });
    });
  }
  function answer(i) {
    if (answered) return;
    answered = true;
    var q = deck[idx], ok = i === q.answer;
    Array.prototype.forEach.call(optsEl.children, function (b) {
      var bi = Number(b.getAttribute("data-i"));
      b.setAttribute("aria-disabled", "true");
      if (bi === q.answer) b.classList.add("is-correct");
      else if (bi === i) b.classList.add("is-wrong");
    });
    fbEl.className = "quiz__fb show " + (ok ? "ok" : "no");
    fbEl.innerHTML = (ok ? "<strong>Correto.</strong> " : "<strong>Ainda não.</strong> ") + (q.explain || "") +
      '<br><a href="../aulas/' + q.lesson + '/">Voltar à aula: ' + q.lessonTitle + "</a>";
    var all = review();
    var s = all[q.id] || { box: 1, seen: 0 };
    s.seen = (s.seen || 0) + 1; s.ok = ok; s.box = ok ? Math.min(3, (s.box || 1) + 1) : 1;
    all[q.id] = s; Store.set("review", all);
    renderStats(); notebook();
    if (window.PI_ANNOUNCE) window.PI_ANNOUNCE(ok ? "Correto." : "Incorreto.");
  }
  function renderStats() {
    var r = review();
    var seen = Object.keys(r).filter(function (k) { return r[k].seen; }).length;
    var ok = Object.keys(r).filter(function (k) { return r[k].ok === true; }).length;
    var bad = Object.keys(r).filter(function (k) { return r[k].ok === false; }).length;
    var doubt = Object.keys(r).filter(function (k) { return r[k].doubt; }).length;
    statsEl.innerHTML = "<dt>Questões vistas</dt><dd>" + seen + " / " + ALL.length + "</dd>" +
      "<dt>Acertos</dt><dd>" + ok + "</dd><dt>Erros</dt><dd>" + bad + "</dd><dt>Dúvidas</dt><dd>" + doubt + "</dd>";
    progEl.style.width = (100 * seen / ALL.length).toFixed(1) + "%";
  }
  function notebook() {
    var box = document.getElementById("error-notebook");
    if (!box) return;
    var r = review();
    var bad = ALL.filter(function (q) { return r[q.id] && (r[q.id].ok === false || r[q.id].doubt); });
    if (!bad.length) {
      box.innerHTML = '<div class="callout callout--green"><div class="callout__title">Nada anotado</div><p>Responda às questões da revisão ou marque uma dúvida para montar seu caderno.</p></div>';
      return;
    }
    box.innerHTML = bad.map(function (q) {
      var s = r[q.id];
      return '<div class="notebook-item"><div><span class="badge badge--' + q.track + '">' + q.lessonTitle + '</span> ' +
        (s.doubt ? '<span class="badge badge--warn">dúvida</span>' : "") + "</div><p>" + q.q + "</p>" +
        '<p class="muted" style="font-size:.82rem">' + (q.explain || "") + '</p><a class="btn btn--sm btn--ghost" href="../aulas/' + q.lesson + '/">Rever aula</a></div>';
    }).join("");
  }

  document.getElementById("review-next").addEventListener("click", function () {
    if (!deck.length) return;
    idx = (idx + 1) % deck.length; render();
  });
  document.getElementById("review-prev").addEventListener("click", function () {
    if (!deck.length) return;
    idx = (idx - 1 + deck.length) % deck.length; render();
  });
  document.getElementById("review-doubt").addEventListener("click", function () {
    if (!deck.length) return;
    var q = deck[idx], all = review();
    var s = all[q.id] || { box: 1, seen: 0 };
    s.doubt = !s.doubt; all[q.id] = s; Store.set("review", all);
    boxEl.textContent = "caixa " + (s.box || 1) + (s.doubt ? " · dúvida" : "");
    renderStats(); notebook();
    if (window.PI_ANNOUNCE) window.PI_ANNOUNCE(s.doubt ? "Marcada como dúvida." : "Dúvida removida.");
  });
  document.querySelectorAll("[data-rfilter]").forEach(function (c) {
    c.addEventListener("click", function () {
      filter = c.getAttribute("data-rfilter");
      document.querySelectorAll("[data-rfilter]").forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      build();
    });
  });
  document.getElementById("review-reset").addEventListener("click", function () {
    Store.set("review", {});
    build();
    if (window.PI_ANNOUNCE) window.PI_ANNOUNCE("Progresso da revisão zerado.");
  });

  build();
})();
