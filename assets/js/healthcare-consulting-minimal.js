(function () {
  var lb = document.getElementById('hc-lb');
  if (!lb) return;

  var body = document.getElementById('hc-lbBody');
  var title = document.getElementById('hc-lbTitle');
  var scale = 1;
  var lastFocus = null;

  function setScale(next) {
    scale = Math.min(4, Math.max(1, next));
    var img = body.querySelector('img');
    if (img) img.style.transform = 'scale(' + scale + ')';
  }

  function open() {
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('hc-lbClose').focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    body.innerHTML = '';
    setScale(1);
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.hc-case .zoom').forEach(function (el) {
    el.addEventListener('click', function () {
      lastFocus = el;
      scale = 1;
      var img = el.querySelector('img');
      title.textContent = el.getAttribute('data-title') || (img && img.alt) || 'View';
      body.className = 'hc-lb-body img';
      body.innerHTML =
        '<img src="' +
        el.getAttribute('data-src') +
        '" alt="' +
        ((img && img.alt) || '') +
        '">';
      open();
    });
  });

  document.getElementById('hc-lbClose').addEventListener('click', close);
  document.getElementById('hc-lbIn').addEventListener('click', function () {
    setScale(scale + 0.35);
  });
  document.getElementById('hc-lbOut').addEventListener('click', function () {
    setScale(scale - 0.35);
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === '+' || e.key === '=') setScale(scale + 0.35);
    if (e.key === '-') setScale(scale - 0.35);
  });
})();
