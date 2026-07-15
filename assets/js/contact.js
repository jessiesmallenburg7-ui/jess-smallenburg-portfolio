(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitBtn = document.getElementById("contact-submit");
  var statusEl = document.getElementById("contact-form-status");
  var emailInput = document.getElementById("contact-email");
  var replyTo = form.querySelector('input[name="_replyto"]');
  var endpoint = "https://formsubmit.co/ajax/jess@jessamynsmallenburg.com";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!submitBtn || submitBtn.disabled) return;

    if (replyTo && emailInput) {
      replyTo.value = emailInput.value;
    }

    var data = new FormData(form);

    // Immediate feedback — don't wait for the network response
    submitBtn.disabled = true;
    submitBtn.textContent = "Message sent!";
    form.reset();
    if (statusEl) {
      statusEl.classList.add("hidden");
      statusEl.textContent = "";
    }

    fetch(endpoint, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    }).catch(function () {
      if (statusEl) {
        statusEl.textContent =
          "If you don't hear back, please email jess@jessamynsmallenburg.com directly.";
        statusEl.classList.remove("hidden");
      }
    });
  });
})();
