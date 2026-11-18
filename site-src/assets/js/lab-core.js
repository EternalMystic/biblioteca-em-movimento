/* Núcleo dos simuladores — passos determinísticos, estado separado da animação */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function Stage(el, w, h) {
    this.el = el;
    this.w = w || 640;
    this.h = h || 400;
    this.nodes = {};
    el.innerHTML = "";
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + this.w + " " + this.h);
    svg.setAttribute("class", "stage-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Palco da simulação");
    el.appendChild(svg);
    this.svg = svg;
  }
  Stage.prototype.clear = function () {
    this.svg.innerHTML = "";
    this.nodes = {};
  };
  Stage.prototype.node = function (key, tag, attrs) {
    var n = this.nodes[key];
    if (!n) {
      n = document.createElementNS(SVGNS, tag);
      n.setAttribute("class", "token");
      this.svg.appendChild(n);
      this.nodes[key] = n;
    }
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] === null || attrs[k] === undefined) n.removeAttribute(k);
        else n.setAttribute(k, attrs[k]);
      });
    }
    return n;
  };
  Stage.prototype.text = function (key, str, attrs) {
    var n = this.node(key, "text", attrs);
    n.textContent = str;
    return n;
  };
  Stage.prototype.move = function (key, x, y) {
    var n = this.nodes[key];
    if (n) n.setAttribute("transform", "translate(" + x + "," + y + ")");
  };
  Stage.prototype.hide = function (key) { var n = this.nodes[key]; if (n) n.style.opacity = "0"; };
  Stage.prototype.show = function (key) { var n = this.nodes[key]; if (n) n.style.opacity = "1"; };
  Stage.prototype.remove = function (key) {
    var n = this.nodes[key];
    if (n) { n.remove(); delete this.nodes[key]; }
  };
  Stage.prototype.group = function (key, attrs) { return this.node(key, "g", attrs); };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  // Entradas digitadas ou vindas da URL viram texto puro: nada de marcação HTML.
  function cleanText(v) {
    return String(v === undefined || v === null ? "" : v).replace(/[<>&"'`\\]/g, "").slice(0, 120);
  }

  // Valida um valor de parâmetro contra a sua definição (tipo, faixa e opções).
  function coerce(def, v) {
    if (!def) return v;
    if (def.type === "text") return cleanText(v);
    if (def.type !== "select") {
      var n = Number(v);
      if (!isFinite(n)) return def.value;
      if (def.min !== undefined) n = Math.max(Number(def.min), n);
      if (def.max !== undefined) n = Math.min(Number(def.max), n);
      return n;
    }
    if (def.type === "select") {
      var ok = (def.options || []).some(function (o) { return String(o.value) === String(v); });
      return ok ? v : def.value;
    }
    return cleanText(v);
  }

  function fmt(n) {
    if (typeof n !== "number" || !isFinite(n)) return String(n);
    return n.toLocaleString("pt-BR");
  }

  function mount(root, config) {
    var stageEl = root.querySelector("#lab-stage");
    var panelOp = root.querySelector("#lab-op");
    var metricsEl = root.querySelector("#lab-metrics");
    var stateEl = root.querySelector("#lab-state");
    var logEl = root.querySelector("#lab-log");
    var counter = root.querySelector("#lab-counter");
    var badge = root.querySelector("#lab-step-badge");
    var paramsEl = root.querySelector("#lab-params");
    var playBtn = root.querySelector("[data-lab-play]");

    var params = {};
    (config.params || []).forEach(function (p) { params[p.key] = p.value; });
    // URL
    try {
      var q = new URLSearchParams(location.search);
      var raw = q.get("p");
      if (raw) raw.split(",").forEach(function (kv) {
        var parts = kv.split(":");
        var k = decodeURIComponent(parts[0]), v = decodeURIComponent(parts.slice(1).join(":"));
        if (params[k] !== undefined) {
          var def = (config.params || []).filter(function (x) { return x.key === k; })[0];
          params[k] = coerce(def, v);
        }
      });
    } catch (e) {}

    var stage = new Stage(stageEl, config.width || 640, config.height || 400);
    var frames = [], i = 0, timer = null, playing = false;

    function build() {
      var res;
      try { res = config.build(params); }
      catch (e) { res = { frames: [{ note: "Erro na entrada: " + esc(e && e.message), metrics: {}, state: {}, log: [] }] }; }
      frames = (res && res.frames) || [];
      if (!frames.length) frames = [{ note: "Sem passos.", metrics: {}, state: {}, log: [] }];
      i = Math.min(i, frames.length - 1);
      stage.clear();
      render();
      syncUrl();
    }

    function render() {
      var f = frames[i] || {};
      if (config.paint) {
        try { config.paint(f, stage, params); } catch (e) { console.error(e); }
      }
      if (panelOp) panelOp.innerHTML = f.note || "";
      if (metricsEl) {
        var m = f.metrics || {};
        metricsEl.innerHTML = Object.keys(m).map(function (k) {
          return '<div class="metric"><b>' + esc(m[k]) + '</b><span>' + esc(k) + "</span></div>";
        }).join("") || '<span class="muted" style="font-size:.8rem">sem métricas</span>';
      }
      if (stateEl) {
        var st = f.state || {};
        stateEl.innerHTML = Object.keys(st).map(function (k) {
          return "<dt>" + esc(k) + "</dt><dd>" + esc(st[k]) + "</dd>";
        }).join("") || '<dd class="muted" style="text-align:left">—</dd>';
      }
      if (logEl) {
        var logs = f.log || [];
        logEl.innerHTML = (logs.length ? logs.slice(-40) : ["<span class='muted'>sem operações neste passo</span>"]).map(function (l) {
          return "<div>" + (typeof l === "string" ? l : l) + "</div>";
        }).join("");
        logEl.scrollTop = logEl.scrollHeight;
      }
      if (counter) counter.textContent = "passo " + (i + 1) + " / " + frames.length;
      if (badge) badge.textContent = "passo " + (i + 1) + " de " + frames.length;
      if (stage.svg) stage.svg.setAttribute("aria-label", (f.aria || f.note || "passo " + (i + 1)).replace(/<[^>]+>/g, ""));
      var pct = frames.length > 1 ? (100 * i) / (frames.length - 1) : 100;
      var bar = root.querySelector("[data-lab-progress]");
      if (bar) bar.style.width = pct + "%";
      document.dispatchEvent(new CustomEvent("pi:lab-frame", { detail: { id: config.id, i: i, total: frames.length, frame: f } }));
    }

    function syncUrl() {
      try {
        var pairs = Object.keys(params).map(function (k) { return encodeURIComponent(k) + ":" + encodeURIComponent(params[k]); });
        var url = new URL(location.href);
        if (pairs.length) url.searchParams.set("p", pairs.join(",")); else url.searchParams.delete("p");
        if (i > 0) url.searchParams.set("step", String(i + 1)); else url.searchParams.delete("step");
        history.replaceState(null, "", url.toString());
      } catch (e) {}
    }

    function go(n) {
      i = Math.max(0, Math.min(frames.length - 1, n));
      render();
      syncUrl();
    }
    function next() { if (i < frames.length - 1) go(i + 1); else stop(); }
    function prev() { go(i - 1); }
    function stop() {
      playing = false;
      clearInterval(timer); timer = null;
      if (playBtn) { playBtn.textContent = "Executar"; playBtn.setAttribute("aria-pressed", "false"); }
    }
    function play() {
      if (playing) { stop(); return; }
      if (i >= frames.length - 1) go(0);
      playing = true;
      if (playBtn) { playBtn.textContent = "Pausar"; playBtn.setAttribute("aria-pressed", "true"); }
      var speed = Number((root.querySelector("[data-lab-speed]") || {}).value || 700);
      timer = setInterval(function () { if (i >= frames.length - 1) stop(); else next(); }, speed);
    }
    function reset() { stop(); go(0); }

    // controles
    var bPrev = root.querySelector("[data-lab-prev]");
    var bNext = root.querySelector("[data-lab-next]");
    var bPlay = playBtn;
    var bReset = root.querySelector("[data-lab-reset]");
    if (bPrev) bPrev.addEventListener("click", function () { stop(); prev(); });
    if (bNext) bNext.addEventListener("click", function () { stop(); next(); });
    if (bPlay) bPlay.addEventListener("click", play);
    if (bReset) bReset.addEventListener("click", reset);
    var speed = root.querySelector("[data-lab-speed]");
    if (speed) speed.addEventListener("change", function () {
      if (playing) { stop(); play(); }
    });

    // barra de progresso clicável
    var barWrap = root.querySelector("[data-lab-scrub]");
    if (barWrap) barWrap.addEventListener("input", function () { stop(); go(Number(barWrap.value)); });

    // parâmetros
    if (paramsEl) {
      paramsEl.innerHTML = "";
      (config.params || []).forEach(function (p) {
        var id = "p-" + config.id + "-" + p.key;
        var wrap = el("label", { class: "field", for: id });
        wrap.appendChild(el("span", { text: p.label }));
        var input;
        if (p.type === "select") {
          input = el("select", { id: id });
          (p.options || []).forEach(function (o) {
            var op = el("option", { value: o.value, text: o.label });
            if (String(o.value) === String(params[p.key])) op.selected = true;
            input.appendChild(op);
          });
          input.addEventListener("change", function () { params[p.key] = input.value; i = 0; build(); });
        } else if (p.type === "text") {
          input = el("input", { id: id, type: "text", value: params[p.key], placeholder: p.placeholder || "" });
          input.setAttribute("maxlength", "120");
          var apply = debounce(function () { params[p.key] = cleanText(input.value); i = 0; build(); }, 380);
          input.addEventListener("input", apply);
          input.addEventListener("change", function () { params[p.key] = cleanText(input.value); i = 0; build(); });
        } else {
          input = el("input", { id: id, type: "range", min: p.min, max: p.max, step: p.step || 1, value: params[p.key] });
          var out = el("output", { text: params[p.key], style: "font-family:var(--font-mono);font-size:.78rem;min-width:2ch;text-align:right" });
          var onRange = debounce(function () { params[p.key] = Number(input.value); i = 0; build(); }, 220);
          input.addEventListener("input", function () { out.textContent = input.value; onRange(); });
          wrap.appendChild(input);
          wrap.appendChild(out);
          paramsEl.appendChild(wrap);
          return;
        }
        wrap.appendChild(input);
        paramsEl.appendChild(wrap);
      });
      // presets
      if (config.presets && config.presets.length) {
        var box = el("div", { class: "pill-list", style: "flex-basis:100%;margin-top:.2rem" });
        box.appendChild(el("span", { class: "muted", style: "font-size:.72rem;align-self:center;margin-right:.2rem", text: "Casos:" }));
        config.presets.forEach(function (ps) {
          var b = el("button", { class: "chip", type: "button", text: ps.label });
          b.addEventListener("click", function () {
            Object.keys(ps.params).forEach(function (k) { params[k] = ps.params[k]; });
            i = 0; build(); syncParamInputs();
            if (window.PI_ANNOUNCE) window.PI_ANNOUNCE("Caso aplicado: " + ps.label);
          });
          box.appendChild(b);
        });
        paramsEl.appendChild(box);
      }
      var copy = el("button", { class: "btn btn--ghost btn--sm", type: "button", text: "Copiar traço" });
      copy.addEventListener("click", function () {
        var text = frames.map(function (f, n) {
          var st = f.state || {};
          return "Passo " + (n + 1) + ": " + String(f.note || "").replace(/<[^>]+>/g, " ") +
            " | " + Object.keys(st).map(function (k) { return k + "=" + st[k]; }).join(", ");
        }).join("\n");
        function done(ok) { copy.textContent = ok ? "Copiado" : "Não foi possível copiar"; setTimeout(function () { copy.textContent = "Copiar traço"; }, 1600); }
        function legacy() {
          var ta = el("textarea", { style: "position:fixed;left:-9999px;top:0" }); ta.value = text;
          document.body.appendChild(ta); ta.select();
          var ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
          ta.remove(); done(ok);
        }
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
        else legacy();
      });
      copy.style.marginLeft = "auto";
      paramsEl.appendChild(copy);
    }
    function syncParamInputs() {
      (config.params || []).forEach(function (p) {
        var input = root.querySelector("#p-" + config.id + "-" + p.key);
        if (input) input.value = params[p.key];
      });
    }

    // teclado
    document.addEventListener("keydown", function (e) {
      var t = (document.activeElement || {}).tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || (document.activeElement || {}).isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); stop(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); prev(); }
      else if (e.key === " " && root.matches(":hover, :focus-within")) { e.preventDefault(); play(); }
      else if (e.key.toLowerCase() === "r" && root.matches(":hover, :focus-within")) { e.preventDefault(); reset(); }
      else if (e.key === "Home") { go(0); }
      else if (e.key === "End") { go(frames.length - 1); }
    });

    // casos do briefing (botões na página)
    document.querySelectorAll("[data-case]").forEach(function (b) {
      b.addEventListener("click", function () {
        var label = b.getAttribute("data-case");
        var ps = (config.presets || []).filter(function (x) { return x.label === label; })[0];
        if (ps) {
          Object.keys(ps.params).forEach(function (k) { params[k] = ps.params[k]; });
          i = 0; build(); syncParamInputs();
          if (window.PI_ANNOUNCE) window.PI_ANNOUNCE("Caso aplicado: " + label);
        }
      });
    });

    build();
    var start = 1;
    try { start = Number(new URLSearchParams(location.search).get("step") || 1); } catch (e) {}
    if (start > 1) go(start - 1);

    var api = { go: go, next: next, prev: prev, play: play, stop: stop, reset: reset, rebuild: function () { build(); }, get frames() { return frames; }, params: params };
    window.PI_LAB = api;
    return api;
  }

  window.Lab = { mount: mount, esc: esc, fmt: fmt, el: el };
})();
