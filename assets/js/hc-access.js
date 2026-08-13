/**
 * Healthcare consulting access gate.
 * Submits the password to a Netlify Function.
 * If no password is configured (local testing), it lets the user through.
 */
(function () {
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
    } catch (_) {}
    window.location.href = caseUrl;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");

    const entered = ((passwordInput && passwordInput.value) || "").trim();

    // If the user left the field empty, try the unlock endpoint anyway
    // (the function will allow access if no password is set in the env var)
    try {
      const res = await fetch("/.netlify/functions/hc-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: entered }),
      });

      if (res.ok) {
        goToCaseStudy();
      } else {
        // Fallback for pure local testing (no Netlify Functions running)
        // If the fetch fails completely (e.g. file:// or simple local server),
        // just let the user through.
        if (res.status === 0 || res.type === "opaque") {
          goToCaseStudy();
          return;
        }

        showError("That password is incorrect. Please try again or request access.");
        if (passwordInput) {
          passwordInput.focus();
          passwordInput.select();
        }
      }
    } catch (err) {
      // Network error = almost certainly local testing without Netlify Dev
      // → allow access so you can keep working
      console.warn("Login function not available (local testing). Allowing access.");
      goToCaseStudy();
    }
  });

  // Show / Hide password button
  if (revealBtn && passwordInput) {
    revealBtn.addEventListener("click", function () {
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";
      revealBtn.setAttribute("aria-pressed", showing ? "false" : "true");
      revealBtn.textContent = showing ? "Show" : "Hide";
    });
  }
})();
