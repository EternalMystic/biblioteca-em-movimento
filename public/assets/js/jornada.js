/* Jornada — três vistas por estação */
(function () {
  "use strict";
  document.querySelectorAll("[data-views]").forEach(function (box) {
    var tabs = box.querySelectorAll("[role=tab]");
    var panels = box.querySelectorAll("[data-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var v = tab.getAttribute("data-view");
        tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
        panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== v; });
      });
      tab.addEventListener("keydown", function (e) {
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        if (e.key === "ArrowRight") { e.preventDefault(); list[(i + 1) % list.length].focus(); list[(i + 1) % list.length].click(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); list[(i - 1 + list.length) % list.length].click(); }
      });
    });
  });
})();
