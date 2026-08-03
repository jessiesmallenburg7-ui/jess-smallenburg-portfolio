(function () {
  var lb = document.getElementById('lm-lb');
  if (!lb) return;

  var body = document.getElementById('lm-lbBody');
  var title = document.getElementById('lm-lbTitle');
  var zoomTools = document.getElementById('lm-lbZoom');
  var scale = 1;
  var lastFocus = null;

  function setZoomVisible(show) {
    if (zoomTools) zoomTools.hidden = !show;
  }

  function getFitWidth() {
    var padding = 32;
    return Math.max(body.clientWidth - padding, 200);
  }

  function applyImageScale() {
    var img = body.querySelector('img');
    if (!img || !img.naturalWidth) return;

    if (!img.dataset.baseFit) {
      img.dataset.baseFit = String(getFitWidth());
    }

    var displayWidth = parseFloat(img.dataset.baseFit) * scale;
    img.style.width = displayWidth + 'px';
    img.style.maxWidth = 'none';
    img.style.height = 'auto';
    img.style.transform = 'none';
    img.style.marginLeft = '0';
    img.style.marginRight = '0';

    if (scale === 1) {
      body.scrollLeft = 0;
      body.scrollTop = 0;
    }
  }

  function setScale(next) {
    scale = Math.min(4, Math.max(1, next));
    applyImageScale();
  }

  function bindImage(img) {
    function ready() {
      delete img.dataset.baseFit;
      scale = 1;
      requestAnimationFrame(function () {
        applyImageScale();
      });
    }

    if (img.complete && img.naturalWidth) {
      ready();
    } else {
      img.addEventListener('load', ready, { once: true });
    }
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
    body.className = 'lm-lb-body';
    var inner = lb.querySelector('.lm-lb-inner');
    if (inner) inner.className = 'lm-lb-inner';
    setZoomVisible(false);
    scale = 1;
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.lm-case .zoom').forEach(function (el) {
    el.addEventListener('click', function () {
      lastFocus = el;
      scale = 1;
      var kind = el.getAttribute('data-lb');

      if (kind === 'img') {
        var innerImg = lb.querySelector('.lm-lb-inner');
        if (innerImg) innerImg.className = 'lm-lb-inner';
        body.className = 'lm-lb-body img';
        title.textContent = el.getAttribute('data-title') || 'View';
        body.innerHTML =
          '<div class="lm-lb-img-stage"><img src="' +
          el.getAttribute('data-src') +
          '" alt="' +
          (el.getAttribute('data-title') || '') +
          '"></div>';
        setZoomVisible(true);
        open();
        bindImage(body.querySelector('img'));
      } else {
        var src = document.getElementById('src-' + kind);
        var inner = lb.querySelector('.lm-lb-inner');
        body.className = 'lm-lb-body';
        inner.className = 'lm-lb-inner';
        setZoomVisible(false);
        if (kind && kind.indexOf('p-') === 0) {
          body.classList.add('persona', 'persona--' + kind.slice(2));
          inner.classList.add('persona-frame', 'persona-frame--' + kind.slice(2));
        }
        if (kind && kind.indexOf('th-') === 0) {
          var themeColors = { '1': 'blue', '2': 'amber', '3': 'rose', '4': 'teal', '5': 'violet' };
          var themeNum = kind.slice(3);
          var themeColor = themeColors[themeNum] || 'teal';
          body.classList.add('theme', 'theme--' + themeColor);
          inner.classList.add('theme-frame', 'theme-frame--' + themeColor);
        }
        if (src) {
          title.textContent = src.getAttribute('data-title') || 'Detail';
          body.innerHTML = src.innerHTML;
        } else {
          title.textContent = 'Detail';
          body.innerHTML = '<p>No detail available.</p>';
        }
      }

      if (kind !== 'img') open();
    });
  });

  document.getElementById('lm-lbClose').addEventListener('click', close);
  document.getElementById('lm-lbIn').addEventListener('click', function () {
    if (zoomTools && zoomTools.hidden) return;
    setScale(scale + 0.35);
  });
  document.getElementById('lm-lbOut').addEventListener('click', function () {
    if (zoomTools && zoomTools.hidden) return;
    setScale(scale - 0.35);
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (zoomTools && zoomTools.hidden) return;
    if (e.key === '+' || e.key === '=') setScale(scale + 0.35);
    if (e.key === '-') setScale(scale - 0.35);
  });
})();
