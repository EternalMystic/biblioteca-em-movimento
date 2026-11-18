/* Modo defesa — passos, cronômetro e checklist */
(function () {
  "use strict";
  var steps = document.querySelectorAll("[data-def-step]");
  if (!steps.length) return;
  var btns = document.querySelectorAll("[data-def-go]");
  var i = 0, timer = null, elapsed = 0, running = false;
  var clock = document.getElementById("def-clock");
  var play = document.getElementById("def-play");
  var reset = document.getElementById("def-reset");
  var bar = document.getElementById("def-progress");
  var Store = window.PI_STORE;

  function show(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    btns.forEach(function (b, k) { b.classList.toggle("is-active", k === i); });
    bar.style.width = (100 * (i + 1) / steps.length) + "%";
    try { history.replaceState(null, "", "#p" + (i + 1)); } catch (e) {}
    var active = btns[i];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
  }
  function tick() {
    if (!running) return;
    elapsed++;
    var m = String(Math.floor(elapsed / 60)).padStart(2, "0");
    var s = String(elapsed % 60).padStart(2, "0");
    clock.textContent = m + ":" + s;
  }
  function start() {
    running = !running;
    play.textContent = running ? "Pausar" : "Iniciar";
    if (running && !timer) timer = setInterval(tick, 1000);
  }
  btns.forEach(function (b, k) { b.addEventListener("click", function () { show(k); }); });
  document.getElementById("def-next").addEventListener("click", function () { show(i + 1); });
  document.getElementById("def-prev").addEventListener("click", function () { show(i - 1); });
  document.getElementById("def-start").addEventListener("click", function () { show(0); start(); });
  play.addEventListener("click", start);
  reset.addEventListener("click", function () {
    running = false; elapsed = 0; clock.textContent = "00:00"; play.textContent = "Iniciar";
    if (timer) { clearInterval(timer); timer = null; }
    show(0);
  });
  document.addEventListener("keydown", function (e) {
    var t = (document.activeElement || {}).tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "ArrowRight") { e.preventDefault(); show(i + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(i - 1); }
    if (e.key.toLowerCase() === "p") { e.preventDefault(); start(); }
  });

  // checklist
  var checks = Store ? Store.get("checklist", {}) : {};
  document.querySelectorAll("[data-check]").forEach(function (c) {
    var k = c.getAttribute("data-check");
    c.checked = !!checks[k];
    c.addEventListener("change", function () {
      var all = Store.get("checklist", {});
      all[k] = c.checked; Store.set("checklist", all);
    });
  });
  var resetCheck = document.getElementById("check-reset");
  if (resetCheck) resetCheck.addEventListener("click", function () {
    Store.set("checklist", {});
    document.querySelectorAll("[data-check]").forEach(function (c) { c.checked = false; });
  });

  function fromHash() {
    var h = (location.hash || "").match(/^#p(\d+)$/);
    return h ? Number(h[1]) - 1 : null;
  }
  window.addEventListener("hashchange", function () {
    var n = fromHash();
    if (n !== null && n !== i) show(n);
  });
  show(fromHash() || 0);
})();
