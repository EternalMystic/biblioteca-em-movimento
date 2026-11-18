/* Aula — sumário ativo, progresso de leitura e atalhos */
(function () {
  "use strict";
  var toc = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (!toc.length) return;
  var heads = toc.map(function (a) {
    var id = a.getAttribute("href").slice(1);
    return { a: a, el: document.getElementById(id) };
  }).filter(function (x) { return x.el; });
  var current = null;

  function paint() {
    var y = window.scrollY + 140, best = null;
    heads.forEach(function (h) { if (h.el.offsetTop <= y) best = h; });
    if (best === current) return;
    current = best;
    heads.forEach(function (h) {
      var on = h === best;
      h.a.classList.toggle("is-active", on);
      if (on) h.a.setAttribute("aria-current", "true");
      else h.a.removeAttribute("aria-current");
    });
  }

  var bar = document.createElement("div");
  bar.setAttribute("aria-hidden", "true");
  bar.style.cssText = "position:fixed;left:0;top:0;height:2px;background:var(--blue);width:0;z-index:99;transition:width .1s linear";
  document.body.appendChild(bar);
  function progress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + "%";
  }
  function onScroll() { paint(); progress(); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement || {}).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement || {}).isContentEditable) return;
    if (e.key === "j" || e.key === "]") {
      var next = document.querySelector(".pager .next");
      if (next) location.href = next.getAttribute("href");
    } else if (e.key === "k" || e.key === "[") {
      var prev = document.querySelector(".pager .prev");
      if (prev) location.href = prev.getAttribute("href");
    }
  });
})();
