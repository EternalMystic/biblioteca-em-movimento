/* Cena de abertura — a ficha que sai da gaveta e vira registro */
(function () {
  "use strict";
  var scene = document.getElementById("scene");
  if (!scene) return;
  var ficha = document.getElementById("hero-ficha");
  var stamp = document.getElementById("ficha-stamp");
  var meta = ficha ? ficha.querySelector(".hero-ficha__meta") : null;
  var caption = document.getElementById("scene-caption");
  var stepsBox = document.getElementById("scene-steps");
  var nextBtn = document.getElementById("scene-next");
  var drawers = scene.querySelectorAll(".drawer-cell");
  var step = 0, timer = null, interacted = false;
  var reduced = document.documentElement.getAttribute("data-motion") === "reduced";

  var CAPTIONS = [
    ["Uma ficha na gaveta 3C.", "Clique na gaveta ou avance para retirar o LIV123."],
    ["A gaveta abre.", "A ficha física sai com código, título, gaveta e autores — antes de qualquer tela."],
    ["Sobre a mesa, a ficha vira registro.", "LIV123 passa a ser chave primária: varchar(10), PK da tabela livros."],
    ["O registro segue para consulta, empréstimo e devolução.", "O mesmo objeto, três operações e um histórico."],
    ["Três vistas do mesmo livro.", "Tela da biblioteca, dados e código, modelo teórico. Escolha por onde olhar."]
  ];

  var TRANSFORMS = [
    "translate(0,0) rotate(-2deg)",
    "translate(16%,-16%) rotate(4deg)",
    "translate(22%,-6%) rotate(0deg) scale(.97)",
    "translate(8%,4%) rotate(-1deg) scale(.95)",
    "translate(-2%,8%) rotate(-2deg) scale(.9)"
  ];

  function setStep(n, user) {
    step = Math.max(0, Math.min(4, n));
    scene.setAttribute("data-step", String(step));
    if (user) interacted = true;
    if (ficha) {
      ficha.style.transform = TRANSFORMS[step];
      ficha.style.opacity = "1";
      ficha.classList.toggle("is-digital", step >= 2);
    }
    if (stamp) stamp.textContent = step >= 2 ? "REGISTRO" : "FÍSICA";
    if (meta) meta.innerHTML = step >= 2 ? "<span>PK · varchar(10)</span><span>3C</span>" : "<span>Gaveta 3C</span><span>2 autores</span>";
    drawers.forEach(function (d) {
      d.classList.toggle("is-open", d.getAttribute("data-drawer") === "3C" && step >= 1);
    });
    if (caption) caption.innerHTML = '<span class="mono" style="color:#7fd1ae">0' + (step + 1) + "</span><span><strong>" + CAPTIONS[step][0] + "</strong> " + CAPTIONS[step][1] + "</span>";
    if (stepsBox) {
      Array.prototype.forEach.call(stepsBox.children, function (b, i) {
        b.setAttribute("aria-current", i === step ? "true" : "false");
      });
    }
    if (nextBtn) nextBtn.textContent = step >= 4 ? "Recomeçar" : "Avançar";
  }

  function autoplay() {
    if (reduced || interacted) return;
    clearInterval(timer);
    timer = setInterval(function () {
      if (interacted) { clearInterval(timer); return; }
      if (step >= 4) { clearInterval(timer); return; }
      setStep(step + 1);
    }, 2200);
  }

  if (nextBtn) nextBtn.addEventListener("click", function () {
    interacted = true; clearInterval(timer);
    setStep(step >= 4 ? 0 : step + 1, true);
  });
  if (stepsBox) stepsBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]");
    if (!b) return;
    interacted = true; clearInterval(timer);
    setStep(Number(b.getAttribute("data-go")), true);
  });
  drawers.forEach(function (d) {
    d.addEventListener("click", function () {
      interacted = true; clearInterval(timer);
      if (d.getAttribute("data-drawer") === "3C") setStep(step < 1 ? 1 : step, true);
      else {
        d.classList.add("is-open");
        setTimeout(function () { d.classList.remove("is-open"); }, 700);
      }
    });
  });
  scene.addEventListener("pointerdown", function () { interacted = true; clearInterval(timer); });
  scene.addEventListener("keydown", function () { interacted = true; clearInterval(timer); });
  document.addEventListener("pi:motion", function () {
    reduced = document.documentElement.getAttribute("data-motion") === "reduced";
  });

  setStep(reduced ? 1 : 0);
  if (!reduced) setTimeout(autoplay, 900);
})();
