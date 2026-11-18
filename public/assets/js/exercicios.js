/* Exercícios — filtro por conjunto, feedback e solução */
(function () {
  "use strict";
  var Store = window.PI_STORE;
  var chips = document.querySelectorAll("[data-ex-set]");
  var sets = document.querySelectorAll("[data-set]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var id = c.getAttribute("data-ex-set");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      sets.forEach(function (s) { s.hidden = s.getAttribute("data-set") !== id; });
      var first = document.getElementById(id);
      if (first) first.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-ex-quiz]").forEach(function (quiz) {
    var id = quiz.getAttribute("data-ex-quiz");
    var opts = quiz.querySelectorAll(".quiz__opt");
    var fb = quiz.querySelector(".quiz__fb");
    var sol = quiz.parentElement.querySelector(".solution");
    var explain = quiz.parentElement.querySelector(".solution") ? quiz.parentElement.querySelector(".solution").innerHTML : "";
    var saved = Store ? Store.get("exercises", {})[id] : null;
    if (saved) paint(saved.ans, true);
    opts.forEach(function (o) {
      o.addEventListener("click", function () { answer(Number(o.getAttribute("data-i"))); });
    });
    function answer(i) {
      if (quiz.getAttribute("data-answered") === "1") return;
      quiz.setAttribute("data-answered", "1");
      var correct = Number(opts[0].getAttribute("data-answer"));
      paint(i, false);
      var ok = i === correct;
      fb.className = "quiz__fb show " + (ok ? "ok" : "no");
      fb.innerHTML = (ok ? "<strong>Correto.</strong> " : "<strong>Ainda não.</strong> ") +
        "Reveja a resolução comentada abaixo e compare o seu passo a passo.";
      if (Store) Store.patch("exercises", (function () { var o = {}; o[id] = { ans: i, ok: ok }; return o; })());
      if (!ok && sol) sol.open = true;
      if (window.PI_ANNOUNCE) window.PI_ANNOUNCE(ok ? "Resposta correta." : "Resposta incorreta. Solução aberta.");
    }
    function paint(i, replay) {
      var correct = Number(opts[0].getAttribute("data-answer"));
      opts.forEach(function (o) {
        o.setAttribute("aria-disabled", "true");
        var oi = Number(o.getAttribute("data-i"));
        if (oi === correct) o.classList.add("is-correct");
        else if (oi === i && !replay) o.classList.add("is-wrong");
      });
      if (replay && fb) {
        var ok = i === correct;
        fb.className = "quiz__fb show " + (ok ? "ok" : "no");
        fb.innerHTML = ok ? "<strong>Você já acertou esta questão.</strong>" : "<strong>Você errou esta questão antes.</strong> Releia a solução.";
      }
    }
  });

  document.querySelectorAll(".exercise .reveal-sol").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ex = btn.closest(".exercise");
      var sol = ex.querySelector(".solution");
      var fb = ex.querySelector(".quiz__fb");
      if (sol) sol.open = true;
      fb.className = "quiz__fb show";
      fb.innerHTML = "Resolução comentada aberta abaixo. Compare com a sua tentativa antes de seguir.";
    });
  });
})();
