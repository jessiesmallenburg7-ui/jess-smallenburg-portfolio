/**
 * Redirect to the access gate unless the user completed it this session.
 */
(function () {
  try {
    if (sessionStorage.getItem("hc-case-access") === "granted") return;
  } catch (_) {
    /* ignore */
  }
  window.location.replace("./access/");
})();
