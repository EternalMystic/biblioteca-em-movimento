/* Mapa de aulas — filtros e progresso */
(function () {
  "use strict";
  var Store = window.PI_STORE;
  if (!Store) return;
  var chips = document.querySelectorAll("[data-filter]");
  var rows = document.querySelectorAll(".lesson-row");
  var blocks = document.querySelectorAll("[data-track-block]");
  var current = "all";

  function done(slug) {
    return !!(Store.get("lessons", {})[slug]);
  }
  function apply() {
    var visible = {};
    rows.forEach(function (r) {
      var track = r.getAttribute("data-track");
      var slug = r.getAttribute("data-slug");
      var hasSim = /Simulador/.test(r.querySelector(".lesson-row__meta").textContent);
      var show = current === "all" || current === track ||
        (current === "done" && done(slug)) || (current === "todo" && !done(slug)) ||
        (current === "sim" && hasSim);
      r.hidden = !show;
      if (show) visible[track] = (visible[track] || 0) + 1;
    });
    blocks.forEach(function (b) {
      var t = b.getAttribute("data-track-block");
      b.hidden = !visible[t];
    });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-filter") === current ? "true" : "false"); });
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () { current = c.getAttribute("data-filter"); apply(); });
  });
  document.addEventListener("pi:progress", apply);
  apply();
})();
