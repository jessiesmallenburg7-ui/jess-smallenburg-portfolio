(function () {
  function initPrototypeLaunch(root) {
    var toggles = root.querySelectorAll('[data-prototype-mode]');
    var panels = root.querySelectorAll('[data-prototype-panel]');
    if (!toggles.length || !panels.length) return;

    function showMode(mode) {
      toggles.forEach(function (btn) {
        var active = btn.getAttribute('data-prototype-mode') === mode;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        var match = panel.getAttribute('data-prototype-panel') === mode;
        if (match) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    }

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showMode(btn.getAttribute('data-prototype-mode') || 'button');
      });
    });

    showMode('button');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-prototype-launch]').forEach(initPrototypeLaunch);
  });
})();
