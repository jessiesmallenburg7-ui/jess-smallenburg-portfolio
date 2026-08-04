(function () {
  function closeTip(anchor, btn) {
    anchor.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  function openTip(anchor, btn) {
    anchor.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }

  function initMetricsTips() {
    var anchors = document.querySelectorAll('[data-metrics-tip-anchor]');
    if (!anchors.length) return;

    anchors.forEach(function (anchor) {
      var btn = anchor.querySelector('[data-metrics-tip-btn]');
      var tip = anchor.querySelector('[data-metrics-tip]');
      if (!btn || !tip) return;

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = anchor.classList.contains('is-open');

        anchors.forEach(function (otherAnchor) {
          if (otherAnchor === anchor) return;
          var otherBtn = otherAnchor.querySelector('[data-metrics-tip-btn]');
          if (!otherBtn) return;
          closeTip(otherAnchor, otherBtn);
        });

        if (isOpen) {
          closeTip(anchor, btn);
        } else {
          openTip(anchor, btn);
        }
      });
    });

    document.addEventListener('click', function (event) {
      anchors.forEach(function (anchor) {
        if (!anchor.classList.contains('is-open')) return;
        if (anchor.contains(event.target)) return;
        var btn = anchor.querySelector('[data-metrics-tip-btn]');
        if (!btn) return;
        closeTip(anchor, btn);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      anchors.forEach(function (anchor) {
        if (!anchor.classList.contains('is-open')) return;
        var btn = anchor.querySelector('[data-metrics-tip-btn]');
        if (!btn) return;
        closeTip(anchor, btn);
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
