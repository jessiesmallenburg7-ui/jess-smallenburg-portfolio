(function () {
  var lb = document.getElementById('lm-lb');
  if (!lb) return;

  var body = document.getElementById('lm-lbBody');
  var title = document.getElementById('lm-lbTitle');
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
    document.getElementById('lm-lbClose').focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    body.innerHTML = '';
    setScale(1);
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.lm-case .zoom').forEach(function (el) {
    el.addEventListener('click', function () {
      lastFocus = el;
      scale = 1;
      var kind = el.getAttribute('data-lb');

      if (kind === 'img') {
        body.className = 'lm-lb-body img';
        title.textContent = el.getAttribute('data-title') || 'View';
        body.innerHTML =
          '<img src="' +
          el.getAttribute('data-src') +
          '" alt="' +
          (el.getAttribute('data-title') || '') +
          '">';
      } else {
        var src = document.getElementById('src-' + kind);
        body.className = 'lm-lb-body';
        if (src) {
          title.textContent = src.getAttribute('data-title') || 'Detail';
          body.innerHTML = src.innerHTML;
        } else {
          title.textContent = 'Detail';
          body.innerHTML = '<p>No detail available.</p>';
        }
      }

      open();
    });
  });

  document.getElementById('lm-lbClose').addEventListener('click', close);
  document.getElementById('lm-lbIn').addEventListener('click', function () {
    setScale(scale + 0.35);
  });
  document.getElementById('lm-lbOut').addEventListener('click', function () {
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
