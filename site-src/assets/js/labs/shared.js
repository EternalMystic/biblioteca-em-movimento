/* Dados sintéticos compartilhados pelos simuladores */
(function () {
  "use strict";

  var CATALOG = [
    { code: "LIV101", title: "Cartas do Horizonte", authors: ["Carla Dias"], drawer: "1A", cat: "Literatura", prazo: 7, permite: 1 },
    { code: "LIV108", title: "Caderno da Serra", authors: ["Diego Alves"], drawer: "2B", cat: "Campo", prazo: 7, permite: 1 },
    { code: "LIV115", title: "Acervo dos Ventos", authors: ["Elisa Rocha"], drawer: "4D", cat: "Literatura", prazo: 14, permite: 1 },
    { code: "LIV123", title: "Manual das Estrelas", authors: ["Ana Prado", "Bruno Sá"], drawer: "3C", cat: "Técnico", prazo: 7, permite: 1 },
    { code: "LIV130", title: "Sinais de Campo", authors: ["Gabriela Lima"], drawer: "2A", cat: "Técnico", prazo: 7, permite: 1 },
    { code: "LIV142", title: "Órbita de Papel", authors: ["Fábio Nunes"], drawer: "5E", cat: "Literatura", prazo: 7, permite: 1 },
    { code: "LIV155", title: "Mapas do Cerrado", authors: ["Heitor Reis"], drawer: "6B", cat: "Campo", prazo: 14, permite: 1 },
    { code: "LIV163", title: "Prisma", authors: ["Isabel Souza"], drawer: "1C", cat: "Técnico", prazo: 7, permite: 1 },
    { code: "LIV171", title: "Vozes do Rio", authors: ["João Mendes"], drawer: "4A", cat: "Literatura", prazo: 7, permite: 0 },
    { code: "LIV184", title: "Fronteira", authors: ["Karina Lopes"], drawer: "6E", cat: "História", prazo: 7, permite: 1 },
    { code: "LIV196", title: "Tempo de Serviço", authors: ["Marcos Vieira"], drawer: "3D", cat: "História", prazo: 7, permite: 1 },
    { code: "LIV207", title: "Estrelas do Sul", authors: ["Carla Dias"], drawer: "5B", cat: "Literatura", prazo: 7, permite: 1 },
    { code: "LIV214", title: "Manual de Instrução", authors: ["Ana Prado"], drawer: "2C", cat: "Técnico", prazo: 7, permite: 1 },
    { code: "LIV228", title: "Oficina de Palavras", authors: ["Nina Torres"], drawer: "4E", cat: "Literatura", prazo: 7, permite: 1 },
    { code: "LIV235", title: "Rotas de Inverno", authors: ["Otávio Luz"], drawer: "1D", cat: "Campo", prazo: 14, permite: 1 }
  ];

  var BOOK = CATALOG.filter(function (b) { return b.code === "LIV123"; })[0];

  function byCode(code) {
    return CATALOG.filter(function (b) { return b.code === code; })[0];
  }
  function hash(code, m) {
    var n = parseInt(String(code).replace(/\D/g, ""), 10) || 0;
    return n % m;
  }
  function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  function fmt(n) {
    return Number(n).toLocaleString("pt-BR");
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  window.PI_DATA = {
    CATALOG: CATALOG, BOOK: BOOK, byCode: byCode, hash: hash,
    manhattan: manhattan, fmt: fmt, clone: clone,
    COLORS: {
      paper: "#F7F6F2", paper2: "#EFECE4", ink: "#17201F", ink2: "#3D4A48", ink3: "#66736F",
      blue: "#28407F", blueSoft: "#E6EAF5", green: "#002F2D", greenSoft: "#E8F1EC",
      amber: "#955300", amberSoft: "#F7ECD9", red: "#992F36", redSoft: "#F8E7E6",
      line: "#D9D5C9", white: "#FFFEFB"
    }
  };
})();
