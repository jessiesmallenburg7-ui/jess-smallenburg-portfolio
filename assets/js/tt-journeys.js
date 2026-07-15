(function () {
  var root = document.querySelector(".tt-journeys");
  if (!root) return;

  var MAPS = {
    nia: {
      current: {
        src: "./journey-maps/PathCompass_Nia_CurrentState.svg",
        title: "Nia's Journey Through TF-CBT — Current State",
        caption: "Nia · Youth · Paper-based current state across six evaluation phases",
        alt: "Current-state journey map for Nia, age 14: feelings, actions, pain points, and opportunities across recruitment through 18-month follow-up.",
        width: 1672,
        height: 1188,
      },
      ideal: {
        src: "./journey-maps/PathCompass_Nia_IdealState.svg",
        title: "Nia's Journey Through Path Compass — Ideal State",
        caption: "Nia · Youth · Path Compass-supported ideal state across six evaluation phases",
        alt: "Ideal-state journey map for Nia, age 14: feelings, actions, and opportunities delivered with Path Compass across six phases.",
        width: 1672,
        height: 1098,
      },
    },
    marcus: {
      current: {
        src: "./journey-maps/PathCompass_Marcus_CurrentState.svg",
        title: "Marcus's Journey Through TF-CBT Delivery — Current State",
        caption: "Marcus · Clinician · Paper-based current state across six evaluation phases",
        alt: "Current-state journey map for Marcus, LCSW: feelings, actions, pain points, and opportunities across recruitment through 18-month follow-up.",
        width: 1672,
        height: 1171,
      },
      ideal: {
        src: "./journey-maps/PathCompass_Marcus_IdealState.svg",
        title: "Marcus's Journey Through Path Compass — Ideal State",
        caption: "Marcus · Clinician · Path Compass-supported ideal state across six evaluation phases",
        alt: "Ideal-state journey map for Marcus, LCSW: feelings, actions, and opportunities delivered with Path Compass across six phases.",
        width: 1672,
        height: 1088,
      },
    },
  };

  var persona = "nia";
  var state = "current";
  var svgCache = Object.create(null);
  var loadToken = 0;

  // Keep map URLs rooted on this case-study folder even when the address bar
  // is /projects/path-compass (no trailing slash) — otherwise ./journey-maps/… 404s.
  var caseBase = (function () {
    var path = window.location.pathname || "/";
    if (/\.html?$/i.test(path)) {
      path = path.replace(/[^/]+$/, "");
    } else if (path.slice(-1) !== "/") {
      path += "/";
    }
    return window.location.origin + path;
  })();

  function mapUrl(src) {
    return new URL(String(src || "").replace(/^\.\//, ""), caseBase).href;
  }

  var stage = root.querySelector(".diagram-zoom-stage");
  var expandBtn = root.querySelector("[data-lightbox-src]");
  var metaEl = root.querySelector("[data-journey-meta]");
  var viewport = root.querySelector("[data-journey-zoom]");
  var personaTabs = root.querySelectorAll("[data-persona]");
  var stateTabs = root.querySelectorAll("[data-state]");
  var activeZoom = null;

  function currentMap() {
    return MAPS[persona][state];
  }

  function setSelected(tabs, attr, value) {
    tabs.forEach(function (tab) {
      var selected = tab.getAttribute(attr) === value;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  function destroyZoom() {
    if (activeZoom) {
      activeZoom.destroy();
      activeZoom = null;
    }
  }

  function ensureZoom() {
    if (!viewport || !window.DiagramZoom) return;
    destroyZoom();
    activeZoom = window.DiagramZoom.create(viewport, {
      captureModifierZoom: false,
    });
  }

  function prepareSvg(svgMarkup, alt, width, height) {
    var doc = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
    var svg = doc.documentElement;
    if (
      !svg ||
      (svg.localName || svg.tagName || "").toLowerCase() !== "svg" ||
      doc.querySelector("parsererror")
    ) {
      throw new Error("Invalid SVG");
    }

    // Drop remote @import — page already loads Cormorant / Lato / IBM Plex Mono.
    Array.prototype.slice.call(svg.querySelectorAll("style")).forEach(function (styleEl) {
      styleEl.textContent = styleEl.textContent.replace(/@import[^;]+;/g, "");
    });

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.classList.add("user-flow-svg", "journey-map-svg", "diagram-zoom-content");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", alt);
    svg.dataset.intrinsicWidth = String(width);
    svg.dataset.intrinsicHeight = String(height);
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
    if (width && height) {
      svg.style.aspectRatio = width + " / " + height;
    }

    return document.importNode(svg, true);
  }

  function fetchSvg(src) {
    if (svgCache[src]) return Promise.resolve(svgCache[src]);
    return fetch(src, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + src);
        return res.text();
      })
      .then(function (text) {
        svgCache[src] = text;
        return text;
      });
  }

  function applyMap() {
    var map = currentMap();
    if (!stage) return;

    var token = ++loadToken;
    destroyZoom();
    stage.innerHTML =
      '<p class="tt-journeys-loading" style="margin:0;padding:24px;font-size:14px;color:#5C6963;">Loading journey map…</p>';

    if (expandBtn) {
      expandBtn.setAttribute("data-lightbox-src", mapUrl(map.src));
      expandBtn.setAttribute("data-lightbox-title", map.title);
      expandBtn.setAttribute("data-lightbox-caption", map.caption);
      expandBtn.setAttribute("data-lightbox-inline-svg", "");
      expandBtn.setAttribute("aria-label", "Open " + map.title + " full size");
    }

    if (metaEl) {
      var personaLabel = persona === "nia" ? "Nia (youth)" : "Marcus (clinician)";
      var stateLabel = state === "current" ? "Current state" : "Ideal state";
      metaEl.innerHTML =
        "<strong>" +
        stateLabel +
        "</strong> &mdash; " +
        personaLabel +
        " across the six TF-CBT evaluation phases.";
    }

    fetchSvg(mapUrl(map.src))
      .then(function (markup) {
        if (token !== loadToken) return;
        var svg = prepareSvg(markup, map.alt, map.width, map.height);
        stage.innerHTML = "";
        stage.appendChild(svg);
        ensureZoom();
      })
      .catch(function () {
        if (token !== loadToken) return;
        // Fallback: rasterized <img> if fetch/inline fails (e.g. file://).
        stage.innerHTML = "";
        var img = document.createElement("img");
        img.id = "journey-map-image";
        img.className = "user-flow-svg journey-map-svg diagram-zoom-content";
        img.alt = map.alt;
        img.width = map.width;
        img.height = map.height;
        img.decoding = "async";
        img.src = mapUrl(map.src);
        stage.appendChild(img);
        img.addEventListener(
          "load",
          function () {
            ensureZoom();
          },
          { once: true }
        );
      });
  }

  function activatePersona(next) {
    persona = next;
    setSelected(personaTabs, "data-persona", persona);
    applyMap();
  }

  function activateState(next) {
    state = next;
    setSelected(stateTabs, "data-state", state);
    applyMap();
  }

  personaTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activatePersona(tab.getAttribute("data-persona"));
    });
    tab.addEventListener("keydown", function (e) {
      var arr = Array.prototype.slice.call(personaTabs);
      var i = arr.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var next =
          e.key === "ArrowRight"
            ? arr[(i + 1) % arr.length]
            : arr[(i - 1 + arr.length) % arr.length];
        next.focus();
        activatePersona(next.getAttribute("data-persona"));
      }
    });
  });

  stateTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateState(tab.getAttribute("data-state"));
    });
    tab.addEventListener("keydown", function (e) {
      var arr = Array.prototype.slice.call(stateTabs);
      var i = arr.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var next =
          e.key === "ArrowRight"
            ? arr[(i + 1) % arr.length]
            : arr[(i - 1 + arr.length) % arr.length];
        next.focus();
        activateState(next.getAttribute("data-state"));
      }
    });
  });

  applyMap();
})();
