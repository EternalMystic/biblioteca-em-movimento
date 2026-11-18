/* Glossário — filtro por grupo */
(function () {
  "use strict";
  var chips = document.querySelectorAll("[data-gfilter]");
  var items = document.querySelectorAll(".gloss-item");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var g = c.getAttribute("data-gfilter");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      items.forEach(function (it) { it.hidden = g !== "todas" && it.getAttribute("data-group") !== g; });
    });
  });
})();
