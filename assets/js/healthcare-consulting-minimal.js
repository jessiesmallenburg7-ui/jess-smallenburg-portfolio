(function () {
  var lb = document.getElementById('hc-lb');
  if (!lb) return;

  var body = document.getElementById('hc-lbBody');
  var title = document.getElementById('hc-lbTitle');
  var scale = 1;
  var fitWidth = 0;
  var lastFocus = null;

  function getImg() {
    return body.querySelector('.hc-lb-stage img');
  }

  function applyScale() {
    var img = getImg();
    if (!img || !fitWidth) return;

    var prevW = img.offsetWidth || fitWidth;
    var prevH =
      img.offsetHeight ||
      fitWidth * ((img.naturalHeight || 1) / (img.naturalWidth || 1));
    var centerX = body.scrollLeft + body.clientWidth / 2;
    var centerY = body.scrollTop + body.clientHeight / 2;
    var fracX = prevW ? centerX / prevW : 0.5;
    var fracY = prevH ? centerY / prevH : 0.5;

    img.style.width = fitWidth * scale + 'px';
    img.style.maxWidth = 'none';
    img.style.height = 'auto';
    img.style.transform = '';

    requestAnimationFrame(function () {
      body.scrollLeft = Math.max(
        0,
        fracX * img.offsetWidth - body.clientWidth / 2
      );
      body.scrollTop = Math.max(
        0,
        fracY * img.offsetHeight - body.clientHeight / 2
      );
    });
  }

  function setScale(next) {
    scale = Math.min(4, Math.max(1, next));
    applyScale();
  }

  function initImage(img) {
    var maxW = Math.max(200, body.clientWidth - 32);
    var maxH = Math.max(200, body.clientHeight - 32);
    var nw = img.naturalWidth || 1200;
    var nh = img.naturalHeight || 900;
    fitWidth = Math.min(nw, maxW, nw * (maxH / nh));
    scale = 1;
    applyScale();
    body.scrollLeft = 0;
    body.scrollTop = 0;
  }

  function open() {
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-lightbox-open');
    document.getElementById('hc-lbClose').focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    document.documentElement.classList.remove('is-lightbox-open');
    body.innerHTML = '';
    scale = 1;
    fitWidth = 0;
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.hc-case .zoom').forEach(function (el) {
    el.addEventListener('click', function () {
      lastFocus = el;
      var thumb = el.querySelector('img');
      title.textContent =
        el.getAttribute('data-title') || (thumb && thumb.alt) || 'View';
      body.className = 'hc-lb-body img';
      body.innerHTML =
        '<div class="hc-lb-stage"><img src="' +
        el.getAttribute('data-src') +
        '" alt="' +
        ((thumb && thumb.alt) || '') +
        '"></div>';
      var img = getImg();
      if (img.complete && img.naturalWidth) {
        initImage(img);
      } else {
        img.addEventListener('load', function () {
          initImage(img);
        });
      }
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
