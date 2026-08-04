(function () {
  function closeTip(btn, tip) {
    btn.setAttribute('aria-expanded', 'false');
    tip.hidden = true;
  }

  function openTip(btn, tip) {
    btn.setAttribute('aria-expanded', 'true');
    tip.hidden = false;
  }

  function initMetricsTips() {
    var buttons = document.querySelectorAll('[data-metrics-tip-btn]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      var tipId = btn.getAttribute('aria-controls');
      var tip = tipId ? document.getElementById(tipId) : null;
      if (!tip) return;

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        buttons.forEach(function (otherBtn) {
          var otherId = otherBtn.getAttribute('aria-controls');
          var otherTip = otherId ? document.getElementById(otherId) : null;
          if (!otherTip || otherBtn === btn) return;
          closeTip(otherBtn, otherTip);
        });

        if (isOpen) {
          closeTip(btn, tip);
        } else {
          openTip(btn, tip);
        }
      });
    });

    document.addEventListener('click', function (event) {
      buttons.forEach(function (btn) {
        var tipId = btn.getAttribute('aria-controls');
        var tip = tipId ? document.getElementById(tipId) : null;
        if (!tip || tip.hidden) return;
        if (btn.contains(event.target) || tip.contains(event.target)) return;
        closeTip(btn, tip);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      buttons.forEach(function (btn) {
        var tipId = btn.getAttribute('aria-controls');
        var tip = tipId ? document.getElementById(tipId) : null;
        if (!tip || tip.hidden) return;
        closeTip(btn, tip);
        btn.focus();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMetricsTips);
  } else {
    initMetricsTips();
  }
})();
