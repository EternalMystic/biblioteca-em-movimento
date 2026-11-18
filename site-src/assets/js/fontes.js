/* Fontes — filtro da matriz de cobertura */
(function () {
  "use strict";
  var chips = document.querySelectorAll("[data-mfilter]");
  var rows = document.querySelectorAll("#coverage-table tbody tr");
  var current = "all";
  function apply() {
    rows.forEach(function (r) {
      var t = r.getAttribute("data-track"), k = r.getAttribute("data-kind");
      var show = current === "all" || current === t || current === k;
      r.hidden = !show;
    });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-mfilter") === current ? "true" : "false"); });
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () { current = c.getAttribute("data-mfilter"); apply(); });
  });
  apply();
})();
