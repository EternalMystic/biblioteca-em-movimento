/* Sobre — realce de âncoras e estado do movimento */
(function () {
  "use strict";
  if (location.hash) {
    var t = document.querySelector(location.hash);
    if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 60);
  }
})();
