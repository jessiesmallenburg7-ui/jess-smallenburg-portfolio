/**
 * Before / After image toggle for healthcare consulting case study.
 * Tabs switch states; Enlarge opens the shared zoom/pan lightbox.
 */
(function () {
  const root = document.querySelector("[data-hc-ba]");
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll("[data-hc-ba-btn]"));
  const panels = Array.from(root.querySelectorAll("[data-hc-ba-panel]"));
  const stage = root.querySelector("[data-hc-ba-stage]");
  const expandBtn = root.querySelector("[data-hc-ba-expand]");

  const ASSETS = {
    before: {
      src: "../../assets/images/healthcare-consulting/Before.png?v=20260723b",
      title: "Homepage CTA Improvement — Before",
      caption: "Original low-prominence text links and unused hero space",
      label: "Enlarge before design to zoom and pan",
    },
    after: {
      src: "../../assets/images/healthcare-consulting/After.png?v=20260723b",
      title: "Homepage CTA Improvement — After",
      caption: "High-contrast CTAs, clearer wording, and supporting scope note",
      label: "Enlarge after design to zoom and pan",
    },
  };

  function syncExpandButton(state) {
    if (!expandBtn) return;
    const asset = ASSETS[state] || ASSETS.before;
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

  // Clicking the preview opens enlarge (same as the Enlarge control).
  if (stage && expandBtn) {
    stage.addEventListener("click", (event) => {
      if (event.target.closest("[data-hc-ba-btn], [data-hc-ba-expand]")) return;
      expandBtn.click();
    });
  }

  setState(root.getAttribute("data-hc-ba-state") || "before");
})();
