(function () {
  var btn = document.querySelector("[data-back-to-top]");
  if (!btn) return;

  var showAfter = Math.max(480, Math.round(window.innerHeight * 1.1));
  var ticking = false;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function updateVisibility() {
    ticking = false;
    var show = window.scrollY > showAfter;
    btn.hidden = !show;
    btn.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateVisibility);
  }

  function focusTop() {
    var target =
      document.querySelector(".site-logo") ||
      document.getElementById("main") ||
      document.body;
    if (!target || typeof target.focus !== "function") return;

    if (!target.hasAttribute("tabindex") && !target.matches("a, button, [href]")) {
      target.setAttribute("tabindex", "-1");
    }
    try {
      target.focus({ preventScroll: true });
    } catch (_) {
      target.focus();
    }
  }

  btn.addEventListener("click", function () {
    var reduce = prefersReducedMotion();
    var behavior = reduce ? "auto" : "smooth";
    window.scrollTo({ top: 0, left: 0, behavior: behavior });

    if (reduce || behavior === "auto") {
      focusTop();
      return;
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      focusTop();
    }

    window.addEventListener("scrollend", finish, { once: true });
    window.setTimeout(finish, 700);
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    showAfter = Math.max(480, Math.round(window.innerHeight * 1.1));
    updateVisibility();
  });

  updateVisibility();
})();
