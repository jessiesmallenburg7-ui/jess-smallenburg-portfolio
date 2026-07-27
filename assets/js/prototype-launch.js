(function () {
  function initPrototypeLaunch(root) {
    var toggles = root.querySelectorAll("[data-prototype-mode]");
    var panels = root.querySelectorAll("[data-prototype-panel]");
    if (!toggles.length || !panels.length) return;

    function activateEmbedIframes(panel) {
      panel.querySelectorAll("iframe[data-src]").forEach(function (frame) {
        if (!frame.getAttribute("src")) {
          frame.setAttribute("src", frame.getAttribute("data-src"));
        }
      });
    }

    function showMode(mode) {
      toggles.forEach(function (btn) {
        var active = btn.getAttribute("data-prototype-mode") === mode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      panels.forEach(function (panel) {
        var match = panel.getAttribute("data-prototype-panel") === mode;
        if (match) {
          panel.removeAttribute("hidden");
          if (mode === "embed") activateEmbedIframes(panel);
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    }

    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        showMode(btn.getAttribute("data-prototype-mode") || "button");
      });
    });

    showMode("button");
  }

  function boot() {
    document.querySelectorAll("[data-prototype-launch]").forEach(initPrototypeLaunch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
