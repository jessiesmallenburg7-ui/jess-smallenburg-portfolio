/**
 * Healthcare consulting access gate.
 * Client-side password check for invited reviewers (sessionStorage unlock).
 */
(function () {
  const AUTH_ENABLED = true;
  const EXPECTED_PASSWORD = "findability-26";

  const form = document.getElementById("hc-access-form");
  if (!form) return;

  const caseUrl = form.getAttribute("data-case-url") || "../";
  const passwordInput = document.getElementById("hc-access-password");
  const revealBtn = document.getElementById("hc-access-reveal");
  const errorEl = document.getElementById("hc-access-error");

  function showError(message) {
    if (!errorEl) return;
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }

  function goToCaseStudy() {
    try {
      sessionStorage.setItem("hc-case-access", "granted");
    } catch (_) {
      /* ignore */
    }
    window.location.href = caseUrl;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showError("");

    if (!AUTH_ENABLED) {
      goToCaseStudy();
      return;
    }

    const entered = ((passwordInput && passwordInput.value) || "").trim();
    if (!EXPECTED_PASSWORD || entered !== EXPECTED_PASSWORD) {
      showError("That password is incorrect. Please try again or request access.");
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.select();
      }
      return;
    }

    goToCaseStudy();
  });

  if (revealBtn && passwordInput) {
    revealBtn.addEventListener("click", function () {
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";
      revealBtn.setAttribute("aria-pressed", showing ? "false" : "true");
      revealBtn.textContent = showing ? "Show" : "Hide";
    });
  }
})();
