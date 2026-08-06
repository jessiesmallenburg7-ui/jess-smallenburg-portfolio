(function () {
  var lb = document.getElementById('pc-lb');
  if (!lb) return;

  var body = document.getElementById('pc-lbBody');
  var inner = lb.querySelector('.pc-lb-inner');
  var title = document.getElementById('pc-lbTitle');
  var scale = 1;
  var fitWidth = 0;
  var lastFocus = null;

  function getImg() {
    return body.querySelector('.pc-lb-stage img');
  }

  function getViewportSize() {
    var head = lb.querySelector('.pc-lb-head');
    var headH = head ? head.offsetHeight : 52;
    var innerW = inner ? inner.clientWidth : 0;
    var innerH = inner ? inner.clientHeight : 0;
    if (innerH < 200) {
      innerH = Math.min(900, window.innerHeight * 0.92);
      innerW = innerW || Math.min(1200, window.innerWidth * 0.94);
    }
    var w = body.clientWidth || Math.max(320, innerW - 32);
    var h = body.clientHeight || Math.max(240, innerH - headH - 32);
    return { w: w, h: h };
  }

  function getNaturalSize(img) {
    var nw = img.naturalWidth || parseInt(img.getAttribute('width'), 10) || 0;
    var nh = img.naturalHeight || parseInt(img.getAttribute('height'), 10) || 0;
    if (!nw || !nh) {
      var thumb = lastFocus && lastFocus.querySelector('img');
      if (thumb) {
        nw = nw || thumb.naturalWidth || parseInt(thumb.getAttribute('width'), 10) || 1200;
        nh = nh || thumb.naturalHeight || parseInt(thumb.getAttribute('height'), 10) || 900;
      } else {
        nw = nw || 1200;
        nh = nh || 900;
      }
    }
    return { w: nw, h: nh };
  }

  function applyScale() {
    var img = getImg();
    if (!img || !fitWidth) return;

    var prevW = img.offsetWidth || fitWidth;
    var natural = getNaturalSize(img);
    var prevH = img.offsetHeight || fitWidth * (natural.h / natural.w);
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
    var vp = getViewportSize();
    var maxW = Math.max(320, vp.w - 16);
    var maxH = Math.max(240, vp.h - 16);
    var natural = getNaturalSize(img);
    var nw = natural.w;
    var nh = natural.h;
    fitWidth = Math.min(nw, maxW, maxH * (nw / nh));
    scale = 1;
    applyScale();
    body.scrollLeft = 0;
    body.scrollTop = 0;
  }

  function open() {
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-lightbox-open');
    document.getElementById('pc-lbClose').focus();
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

  function scheduleInit(img) {
    open();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initImage(img);
      });
    });
  }

  function resolveImageSrc(el, thumb) {
    var dataSrc = el.getAttribute('data-src') || '';
    if (/^https?:\/\//.test(dataSrc) || dataSrc.startsWith('/')) return dataSrc;

    var pagePath = window.location.pathname;
    if (pagePath.endsWith('.html')) {
      pagePath = pagePath.replace(/\/[^/]+$/, '/');
    } else if (!pagePath.endsWith('/')) {
      pagePath += '/';
    }

    return pagePath + dataSrc.replace(/^\.\//, '');
  }

  function whenImageReady(img, cb) {
    if (img.complete) {
      cb();
      return;
    }
    img.addEventListener('load', cb, { once: true });
    img.addEventListener('error', cb, { once: true });
  }

  document.querySelectorAll('.pc-case .zoom').forEach(function (el) {
    el.addEventListener('click', function () {
      lastFocus = el;
      var thumb = el.querySelector('img');
      var imgSrc = resolveImageSrc(el, thumb);
      title.textContent =
        el.getAttribute('data-title') || (thumb && thumb.alt) || 'View';
      body.className = 'pc-lb-body img';
      body.innerHTML =
        '<div class="pc-lb-stage"><img src="' +
        imgSrc +
        '" alt="' +
        ((thumb && thumb.alt) || el.getAttribute('data-title') || '') +
        '"></div>';
      var img = getImg();
      if (thumb) {
        if (thumb.getAttribute('width')) {
          img.setAttribute('width', thumb.getAttribute('width'));
        }
        if (thumb.getAttribute('height')) {
          img.setAttribute('height', thumb.getAttribute('height'));
        }
      }
      whenImageReady(img, function () {
        scheduleInit(img);
      });
    });
  });

  document.getElementById('pc-lbClose').addEventListener('click', close);
  document.getElementById('pc-lbIn').addEventListener('click', function () {
    setScale(scale + 0.35);
  });
  document.getElementById('pc-lbOut').addEventListener('click', function () {
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

(function () {
  var hint = document.querySelector('.pc-case .matrix-swipe-hint');
  var matrix = document.querySelector('.pc-case .matrix');
  if (!hint || !matrix) return;

  function updateMatrixHint() {
    var table = matrix.querySelector('table');
    var contentWidth = table ? table.scrollWidth : matrix.scrollWidth;
    var overflows = contentWidth > matrix.clientWidth + 1;
    hint.hidden = !overflows;
  }

  updateMatrixHint();
  window.addEventListener('resize', updateMatrixHint);

  if (typeof ResizeObserver !== 'undefined') {
    var observer = new ResizeObserver(updateMatrixHint);
    observer.observe(matrix);
    var table = matrix.querySelector('table');
    if (table) observer.observe(table);
  }
})();
