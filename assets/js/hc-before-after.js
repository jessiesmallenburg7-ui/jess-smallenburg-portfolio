/**
 * Before / After image toggles for healthcare consulting case study.
 * Supports multiple [data-hc-ba] instances. Tabs switch states;
 * Enlarge opens the shared zoom/pan lightbox.
 */
(function () {
  const roots = Array.from(document.querySelectorAll("[data-hc-ba]"));
  if (!roots.length) return;

  function assetsFor(root) {
    return {
      before: {
        src: root.getAttribute("data-before-src"),
        title: root.getAttribute("data-before-title") || "Before",
        caption: root.getAttribute("data-before-caption") || "",
        label: root.getAttribute("data-before-label") || "Enlarge before design to zoom and pan",
      },
      after: {
        src: root.getAttribute("data-after-src"),
        title: root.getAttribute("data-after-title") || "After",
        caption: root.getAttribute("data-after-caption") || "",
        label: root.getAttribute("data-after-label") || "Enlarge after design to zoom and pan",
      },
    };
  }

  function init(root) {
    const buttons = Array.from(root.querySelectorAll("[data-hc-ba-btn]"));
    const panels = Array.from(root.querySelectorAll("[data-hc-ba-panel]"));
    const stage = root.querySelector("[data-hc-ba-stage]");
    const expandBtn = root.querySelector("[data-hc-ba-expand]");
    const ASSETS = assetsFor(root);

    function syncExpandButton(state) {
      if (!expandBtn) return;
      const asset = ASSETS[state] || ASSETS.before;
      if (!asset.src) return;
      expandBtn.setAttribute("data-lightbox-src", asset.src);
      expandBtn.setAttribute("data-lightbox-title", asset.title);
      expandBtn.setAttribute("data-lightbox-caption", asset.caption);
      expandBtn.setAttribute("aria-label", asset.label);
    }

    function setState(state) {
      buttons.forEach((btn) => {
        const active = btn.getAttribute("data-hc-ba-btn") === state;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });

      panels.forEach((panel) => {
        const active = panel.getAttribute("data-hc-ba-panel") === state;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });

      root.setAttribute("data-hc-ba-state", state);
      syncExpandButton(state);
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setState(btn.getAttribute("data-hc-ba-btn"));
      });
    });

    if (stage && expandBtn) {
      stage.addEventListener("click", (event) => {
        if (event.target.closest("[data-hc-ba-btn], [data-hc-ba-expand]")) return;
        expandBtn.click();
      });
    }

    setState(root.getAttribute("data-hc-ba-state") || "before");
  }

  roots.forEach(init);
})();
