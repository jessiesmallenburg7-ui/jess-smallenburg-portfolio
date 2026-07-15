(function () {
  var root = document.querySelector(".tt-personas");
  if (!root) return;

  var tabs = root.querySelectorAll(".tab");
  var panels = root.querySelectorAll(".panel");

  function activate(tab) {
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", "false");
      t.tabIndex = -1;
    });
    panels.forEach(function (p) {
      p.classList.remove("active");
    });

    tab.setAttribute("aria-selected", "true");
    tab.tabIndex = 0;
    var panel = document.getElementById(tab.dataset.target);
    if (panel) panel.classList.add("active");
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab);
    });
    tab.addEventListener("keydown", function (e) {
      var arr = Array.prototype.slice.call(tabs);
      var i = arr.indexOf(tab);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        var next = arr[(i + 1) % arr.length];
        next.focus();
        activate(next);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        var prev = arr[(i - 1 + arr.length) % arr.length];
        prev.focus();
        activate(prev);
      }
    });
  });
})();
