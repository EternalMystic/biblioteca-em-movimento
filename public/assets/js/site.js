/* Biblioteca em Movimento — núcleo de interface */
(function () {
  "use strict";

  var KEY = "pi-biblioteca-v1";
  var Store = {
    read: function () {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    },
    write: function (obj) {
      try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) { /* modo privado */ }
    },
    get: function (k, def) {
      var d = Store.read();
      return d[k] === undefined ? def : d[k];
    },
    set: function (k, v) {
      var d = Store.read(); d[k] = v; Store.write(d); return v;
    },
    patch: function (k, obj) {
      var d = Store.read(); d[k] = Object.assign(d[k] || {}, obj); Store.write(d); return d[k];
    }
  };
  window.PI_STORE = Store;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------------------------------------------------------- normalização */
  var SYNONYMS = {
    "afd": "automato finito deterministico dfa",
    "afn": "automato finito nao deterministico ndfa",
    "lba": "linearmente limitado maquina de turing",
    "mt": "maquina de turing",
    "ap": "automato de pilha",
    "theta": "Θ complexidade",
    "bigo": "big-o complexidade assintotica",
    "big o": "big-o complexidade assintotica",
    "epsilon": "ε cadeia vazia",
    "lambda": "ε cadeia vazia",
    "tsp": "caixeiro viajante travelling salesman",
    "mst": "arvore geradora minima",
    "bfs": "busca em largura",
    "dfs": "busca em profundidade",
    "scc": "componente fortemente conexa",
    "dag": "grafo dirigido aciclico",
    "hash": "tabela hash espalhamento",
    "bst": "arvore binaria de busca",
    "avl": "arvore balanceada",
    "np": "np completo dificil tratabilidade",
    "p": "classe p polinomial",
    "ocr": "reconhecimento optico caracteres",
    "fk": "chave estrangeira",
    "pk": "chave primaria",
    "der": "diagrama entidade relacionamento",
    "gaveta": "gaveteiro armazenamento localizacao",
    "liv123": "codigo livro exemplo"
  };

  function norm(s) {
    s = String(s || "").toLowerCase();
    try { s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
    return s.replace(/[^a-z0-9\u0370-\u03ff\s+#-]/g, " ").replace(/\s+/g, " ").trim();
  }
  window.PI_NORM = norm;

  // Sinônimos só entram quando a palavra inteira bate ("p" não pode expandir "pilha").
  function synonymsFor(n) {
    var words = n.split(" ").filter(Boolean);
    var extra = [];
    Object.keys(SYNONYMS).forEach(function (k) {
      var hit = k.indexOf(" ") !== -1 ? (" " + n + " ").indexOf(" " + k + " ") !== -1 : words.indexOf(k) !== -1;
      if (hit) extra = extra.concat(norm(SYNONYMS[k]).split(" "));
    });
    return extra.filter(function (w) { return w && words.indexOf(w) === -1; });
  }

  /* ---------------------------------------------------------- movimento */
  function initMotion() {
    var pref = Store.get("motion", null);
    var sys = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mode = pref || (sys ? "reduced" : "full");
    apply(mode);
    var btn = document.getElementById("motion-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        mode = document.documentElement.getAttribute("data-motion") === "reduced" ? "full" : "reduced";
        Store.set("motion", mode);
        apply(mode);
        announce(mode === "reduced" ? "Movimento reduzido ativado." : "Movimento completo ativado.");
      });
    }
    function apply(m) {
      document.documentElement.setAttribute("data-motion", m);
      if (!btn) return;
      var reduced = m === "reduced";
      btn.setAttribute("aria-pressed", reduced ? "true" : "false");
      btn.setAttribute("aria-label", reduced ? "Ativar movimento completo" : "Reduzir movimento");
      btn.title = reduced ? "Movimento reduzido (clique para completo)" : "Movimento completo (clique para reduzir)";
    }
  }

  var liveRegion = null;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.className = "visually-hidden";
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = "";
    setTimeout(function () { liveRegion.textContent = msg; }, 60);
  }
  window.PI_ANNOUNCE = announce;

  /* ---------------------------------------------------------- menu */
  function initNav() {
    var burger = document.getElementById("burger");
    var nav = document.getElementById("nav");
    if (!burger || !nav) return;
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.focus();
      }
    });
  }

  /* ---------------------------------------------------------- busca */
  function initSearch() {
    var dlg = document.getElementById("search-dialog");
    if (!dlg) return;
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var openBtn = document.getElementById("open-search");
    var closeBtn = document.getElementById("close-search");
    var idx = window.PI_SEARCH || [];
    var active = -1, current = [];

    function open() {
      dlg.classList.add("is-open");
      setTimeout(function () { input.focus(); input.select(); }, 30);
      document.body.style.overflow = "hidden";
      render("");
    }
    function close() {
      dlg.classList.remove("is-open");
      document.body.style.overflow = "";
      if (openBtn) openBtn.focus();
    }
    function render(q) {
      var query = norm(q);
      var list;
      if (!query) {
        list = idx.filter(function (x) { return x.u === "mapa/" || x.u === "rotinas/" || x.u === "defesa/" || x.u === "fontes/" || x.u === "jornada/"; }).slice(0, 6);
      } else {
        var terms = query.split(" ").filter(Boolean);
        var extra = synonymsFor(query);
        list = idx.map(function (x) {
          if (!x._hay) { x._hay = norm(x.t + " " + (x.k || "") + " " + (x.s || "") + " " + (x.b || "")); x._title = norm(x.t); }
          var hay = x._hay, title = x._title;
          var score = 0, all = true, viaSyn = 0;
          terms.forEach(function (t) {
            if (title.indexOf(t) === 0) score += 60;
            else if (title.indexOf(t) !== -1) score += 34;
            if (hay.indexOf(t) !== -1) score += 10; else all = false;
          });
          extra.forEach(function (t) {
            if (t.length > 1 && hay.indexOf(t) !== -1) { viaSyn += 6; if (title.indexOf(t) !== -1) viaSyn += 10; }
          });
          if (!all) score = score > 50 ? score : 0;
          score += viaSyn;
          if (title && query === title) score += 25;
          return { x: x, s: score };
        }).filter(function (o) { return o.s > 0; })
          .sort(function (a, b) { return b.s - a.s; })
          .slice(0, 14)
          .map(function (o) { return o.x; });
      }
      current = list;
      active = list.length ? 0 : -1;
      if (!list.length) {
        results.innerHTML = '<div class="none">Nada encontrado para “' + esc(q) + '”. Tente <code>AFD</code>, <code>hash</code>, <code>Θ</code> ou <code>devolução</code>.</div>';
        return;
      }
      results.innerHTML = list.map(function (x, i) {
        return '<a href="' + rootPrefix() + x.u + '" data-i="' + i + '" class="' + (i === 0 ? "is-active" : "") + '">' +
          '<div class="t">' + esc(x.t) + '</div><div class="s">' + esc(x.s || "") + '</div></a>';
      }).join("");
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    // A raiz do site é deduzida do próprio CSS carregado, então funciona em domínio
    // próprio, em subpasta (GitHub Pages) e na página 404 servida em qualquer URL.
    var siteRoot = null;
    function rootPrefix() {
      if (siteRoot !== null) return siteRoot;
      var css = document.querySelector('link[rel="stylesheet"][href*="assets/css/site.css"]');
      siteRoot = css ? css.href.replace(/assets\/css\/site\.css.*$/, "") : "/";
      return siteRoot;
    }
    function move(d) {
      if (!current.length) return;
      active = (active + d + current.length) % current.length;
      Array.prototype.forEach.call(results.querySelectorAll("a"), function (a, i) {
        a.classList.toggle("is-active", i === active);
        if (i === active) a.scrollIntoView({ block: "nearest" });
      });
    }
    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      if (e.key === "Enter" && current[active]) { location.href = rootPrefix() + current[active].u; }
    });
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement || {}).tagName;
      var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement || {}).isContentEditable;
      if (e.key === "/" && !typing) { e.preventDefault(); open(); }
      if (e.key === "Escape" && dlg.classList.contains("is-open")) close();
    });
  }

  /* ---------------------------------------------------------- leitura */
  var speech = { on: false, queue: [], i: 0, utter: null, paused: false };
  function initSpeech() {
    var btn = document.getElementById("tts-toggle");
    var inline = document.querySelectorAll("[data-tts-inline]");
    if (!("speechSynthesis" in window)) {
      if (btn) { btn.disabled = true; btn.title = "Leitura em voz alta não suportada neste navegador"; }
      inline.forEach(function (b) { b.disabled = true; b.textContent = "Leitura indisponível"; });
      return;
    }
    function chunks() {
      var main = document.querySelector("main");
      if (!main) return [];
      var clone = main.cloneNode(true);
      clone.querySelectorAll(".lab, .quiz, .code, .search-dialog, .toc, .pager, .page-actions, .mock-ui, .table-wrap, script, style, .btn, .chip, .lab__controls").forEach(function (n) { n.remove(); });
      var nodes = clone.querySelectorAll("h1,h2,h3,p,li,blockquote,dt,dd");
      var out = [];
      nodes.forEach(function (n) {
        var t = (n.textContent || "").replace(/\s+/g, " ").trim();
        if (t.length > 2 && t.length < 900) out.push(t);
      });
      return out.slice(0, 220);
    }
    function stop() {
      speech.on = false; speech.paused = false;
      window.speechSynthesis.cancel();
      if (btn) { btn.setAttribute("aria-pressed", "false"); btn.setAttribute("aria-label", "Ler esta página em voz alta"); }
      inline.forEach(function (b) { b.textContent = "Ler em voz alta"; });
      announce("Leitura interrompida.");
    }
    function speakNext() {
      if (!speech.on) return;
      if (speech.i >= speech.queue.length) { stop(); announce("Fim da leitura."); return; }
      var u = new SpeechSynthesisUtterance(speech.queue[speech.i++]);
      u.lang = "pt-BR"; u.rate = 0.98; u.pitch = 1;
      var voices = window.speechSynthesis.getVoices();
      var pt = voices.filter(function (v) { return /pt[-_]BR/i.test(v.lang); })[0] || voices.filter(function (v) { return /^pt/i.test(v.lang); })[0];
      if (pt) u.voice = pt;
      u.onend = function () { if (speech.on) setTimeout(speakNext, 120); };
      u.onerror = function () { if (speech.on) stop(); };
      speech.utter = u;
      window.speechSynthesis.speak(u);
    }
    function toggle() {
      if (speech.on) { stop(); return; }
      speech.queue = chunks(); speech.i = 0; speech.on = true;
      window.speechSynthesis.cancel();
      if (btn) { btn.setAttribute("aria-pressed", "true"); btn.setAttribute("aria-label", "Parar leitura em voz alta"); }
      inline.forEach(function (b) { b.textContent = "Parar leitura"; });
      announce("Lendo a página em voz alta. Use o mesmo botão para parar.");
      speakNext();
    }
    if (btn) btn.addEventListener("click", toggle);
    inline.forEach(function (b) { b.addEventListener("click", toggle); });
    window.addEventListener("beforeunload", function () { window.speechSynthesis.cancel(); });
  }

  /* ---------------------------------------------------------- progresso */
  function initProgress() {
    var done = Store.get("lessons", {});
    document.querySelectorAll("[data-mark-lesson]").forEach(function (btn) {
      var slug = btn.getAttribute("data-mark-lesson");
      var isDone = !!done[slug];
      paint(btn, isDone);
      btn.addEventListener("click", function () {
        var d = Store.get("lessons", {});
        if (d[slug]) { delete d[slug]; } else { d[slug] = true; }
        Store.set("lessons", d);
        paint(btn, !!d[slug]);
        document.dispatchEvent(new CustomEvent("pi:progress"));
        announce(d[slug] ? "Aula marcada como estudada." : "Aula desmarcada.");
      });
    });
    function paint(btn, on) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? "✓ Estudada — desmarcar" : "Marcar como estudada";
      var fill = document.querySelector("[data-progress-fill]");
      var label = document.querySelector("[data-progress-label]");
      if (fill) fill.style.width = on ? "100%" : "0%";
      if (label) label.textContent = on ? "100%" : "0%";
    }
    var totalFill = document.querySelector("[data-total-progress]");
    if (totalFill) {
      var all = window.PI_TOTAL_LESSONS || 23;
      var n = Object.keys(Store.get("lessons", {})).length;
      totalFill.style.width = Math.min(100, (100 * n) / all) + "%";
      var lbl = document.querySelector("[data-total-label]");
      if (lbl) lbl.textContent = n + " de " + all + " aulas estudadas";
    }
  }

  /* ---------------------------------------------------------- quiz */
  function initQuiz() {
    document.querySelectorAll(".quiz[data-quiz]").forEach(function (quiz) {
      var id = quiz.getAttribute("data-quiz");
      var saved = Store.get("quiz", {})[id];
      var opts = quiz.querySelectorAll(".quiz__opt");
      var fb = quiz.querySelector(".quiz__fb");
      var correctIdx = opts.length ? Number(opts[0].getAttribute("data-answer")) : -1;
      if (saved) {
        quiz.setAttribute("data-answered", "1");
        var foot = quiz.querySelector(".quiz__foot span");
        if (foot) foot.textContent = saved.ok ? "Você acertou esta questão." : "Você errou esta questão antes — veja a explicação.";
      }
      opts.forEach(function (o) {
        var oi = Number(o.getAttribute("data-i"));
        if (saved) {
          o.setAttribute("aria-disabled", "true");
          if (oi === correctIdx) o.classList.add("is-correct");
          else if (oi === saved.ans) o.classList.add("is-wrong");
        }
        o.addEventListener("click", function () { answer(oi); });
      });
      function answer(i) {
        if (quiz.getAttribute("data-answered") === "1") return;
        quiz.setAttribute("data-answered", "1");
        var correct = Number(opts[0].getAttribute("data-answer"));
        var ok = i === correct;
        opts.forEach(function (o) {
          o.setAttribute("aria-disabled", "true");
          var oi = Number(o.getAttribute("data-i"));
          if (oi === correct) o.classList.add("is-correct");
          else if (oi === i) o.classList.add("is-wrong");
        });
        var explain = quiz.querySelector(".reveal-sol").getAttribute("data-sol") || "";
        fb.className = "quiz__fb show " + (ok ? "ok" : "no");
        fb.innerHTML = (ok ? "<strong>Correto.</strong> " : "<strong>Ainda não.</strong> ") + explain;
        var q = Store.get("quiz", {});
        q[id] = { ok: ok, ans: i, at: Date.now() };
        Store.set("quiz", q);
        var review = Store.get("review", {});
        var r = review[id] || { box: 1, seen: 0, doubt: false };
        r.seen++; r.ok = ok; r.box = ok ? Math.min(3, (r.box || 1) + 1) : 1;
        review[id] = r; Store.set("review", review);
        announce(ok ? "Resposta correta." : "Resposta incorreta. Leia a explicação.");
      }
    });
    document.querySelectorAll(".reveal-sol").forEach(function (btn) {
      if (!btn.getAttribute("data-sol")) return;
      btn.addEventListener("click", function () {
        var quiz = btn.closest(".quiz");
        var fb = quiz.querySelector(".quiz__fb");
        if (fb.classList.contains("show")) return;
        fb.className = "quiz__fb show";
        fb.innerHTML = btn.getAttribute("data-sol");
      });
    });
  }

  /* ---------------------------------------------------------- TOC ativo */
  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[en.target.id];
          if (a) a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll(".prose h2[id]").forEach(function (h) { obs.observe(h); });
  }

  /* ---------------------------------------------------------- reveal */
  function initReveal() {
    var els = document.querySelectorAll(".reveal-up");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || document.documentElement.getAttribute("data-motion") === "reduced") {
      els.forEach(function (e) { e.classList.add("is-in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); } });
    }, { threshold: .12 });
    els.forEach(function (e) { obs.observe(e); });
  }

  ready(function () {
    initMotion(); initNav(); initSearch(); initSpeech(); initProgress(); initQuiz(); initToc(); initReveal();
  });
})();
