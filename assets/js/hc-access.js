/**
 * Healthcare consulting access gate.
 *
 * Auth is OFF for now (preview). Flip AUTH_ENABLED to true and set
 * EXPECTED_PASSWORD (or replace with a real auth check) before publish.
 */
(function () {
  const AUTH_ENABLED = false;
  // Placeholder only — replace before enabling auth. Do not commit a real secret
  // to a public repo; prefer a server-side or edge check when you publish.
  const EXPECTED_PASSWORD = "";

  const form = document.getElementById("hc-access-form");
  if (!form) return;

  const caseUrl = form.getAttribute("data-case-url") || "../";
  const passwordInput = document.getElementById("hc-access-password");
  const errorEl = document.getElementById("hc-access-error");

  function showError(message) {
    if (!errorEl) return;
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }

  function goToCaseStudy() {
    window.location.href = caseUrl;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showError("");

    // Preview: skip password check and open the case study.
    if (!AUTH_ENABLED) {
      goToCaseStudy();
      return;
    }

    const entered = (passwordInput && passwordInput.value) || "";
    if (!EXPECTED_PASSWORD || entered !== EXPECTED_PASSWORD) {
      showError("That password is incorrect. Please try again or request access.");
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.select();
      }
      return;
    }

    try {
      sessionStorage.setItem("hc-case-access", "granted");
    } catch (e) {
      /* ignore storage errors */
    }
    goToCaseStudy();
  });
})();
