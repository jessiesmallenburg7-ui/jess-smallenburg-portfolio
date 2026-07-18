(function () {
  const lightbox = document.getElementById('wireframe-lightbox');
  if (!lightbox) return;

  const image = document.getElementById('lightbox-image');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');
  const body = lightbox.querySelector('.wireframe-lightbox-body');
  const diagramZoomViewport = document.getElementById('lightbox-diagram-zoom');
  const diagramStage = diagramZoomViewport?.querySelector('.diagram-zoom-stage');
  const closeTargets = lightbox.querySelectorAll('[data-lightbox-close]');

  let activeDiagramZoom = null;
  let lastTrigger = null;
  let inlineSvgEl = null;
  let historyOpen = false;
  const svgCache = Object.create(null);
  const PAGE_CHROME_SELECTOR = '.site-header, [data-case-nav], .case-nav, .back-to-top';

  function setPageChromeHidden(hidden) {
    document.documentElement.classList.toggle('is-lightbox-open', hidden);
    document.querySelectorAll(PAGE_CHROME_SELECTOR).forEach((el) => {
      if (hidden) {
        el.setAttribute('aria-hidden', 'true');
        try {
          el.inert = true;
        } catch (_) {
          /* older browsers */
        }
      } else {
        el.removeAttribute('aria-hidden');
        try {
          el.inert = false;
        } catch (_) {
          /* older browsers */
        }
      }
    });
  }

  function isTouchDevice() {
    return window.DiagramZoom?.isTouchDevice?.() ?? window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  function isLightboxOpen() {
    return !lightbox.hidden;
  }

  function resetDiagramZoom() {
    activeDiagramZoom?.destroy();
    activeDiagramZoom = null;
  }

  function clearInlineSvg() {
    inlineSvgEl?.remove();
    inlineSvgEl = null;
  }

  function uniquifySvgIds(svg) {
    const suffix = `-lb-${Date.now().toString(36)}`;
    const idMap = new Map();
    svg.querySelectorAll('[id]').forEach((el) => {
      const oldId = el.getAttribute('id');
      if (!oldId) return;
      const next = `${oldId}${suffix}`;
      idMap.set(oldId, next);
      el.setAttribute('id', next);
    });
    if (!idMap.size) return;
    svg.querySelectorAll('[fill],[stroke],[href],[xlink\\:href]').forEach((el) => {
      ['fill', 'stroke', 'href'].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (!val || !val.includes('url(#')) return;
        el.setAttribute(
          attr,
          val.replace(/url\(#([^)]+)\)/g, (match, id) =>
            idMap.has(id) ? `url(#${idMap.get(id)})` : match
          )
        );
      });
      const xlink = el.getAttribute('xlink:href') || el.getAttributeNS?.('http://www.w3.org/1999/xlink', 'href');
      if (xlink && xlink.startsWith('#') && idMap.has(xlink.slice(1))) {
        el.setAttribute('href', `#${idMap.get(xlink.slice(1))}`);
      }
    });
  }

  function finalizeInlineSvg(svg, alt) {
    Array.from(svg.querySelectorAll('style')).forEach((styleEl) => {
      styleEl.textContent = styleEl.textContent.replace(/@import[^;]+;/g, '');
    });

    const vb = svg.viewBox && svg.viewBox.baseVal;
    const iw =
      (vb && vb.width) ||
      parseFloat(svg.getAttribute('width')) ||
      parseFloat(svg.dataset.intrinsicWidth) ||
      0;
    const ih =
      (vb && vb.height) ||
      parseFloat(svg.getAttribute('height')) ||
      parseFloat(svg.dataset.intrinsicHeight) ||
      0;

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('user-flow-svg', 'diagram-zoom-content');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', alt || 'Diagram');
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxWidth = 'none';
    if (iw && ih) {
      svg.style.aspectRatio = `${iw} / ${ih}`;
      svg.dataset.intrinsicWidth = String(iw);
      svg.dataset.intrinsicHeight = String(ih);
    }

    uniquifySvgIds(svg);
    return svg;
  }

  function prepareInlineSvg(markup, alt) {
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.localName?.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
      throw new Error('Invalid SVG');
    }
    return finalizeInlineSvg(document.importNode(svg, true), alt);
  }

  function clonePageSvg(trigger, alt) {
    // Only clone an SVG already rendered for *this* trigger's figure.
    // Never fall back to another diagram on the page (e.g. journey maps),
    // or pattern thumbnails would open the wrong SVG.
    const figure = trigger.closest('.user-flow-figure') || trigger.closest('[data-journey-viewer]');
    if (!figure) return null;
    const source =
      figure.querySelector('.diagram-zoom-stage > svg.diagram-zoom-content') ||
      figure.querySelector('.diagram-zoom-stage > svg');
    if (!source) return null;
    return finalizeInlineSvg(source.cloneNode(true), alt);
  }

  function fetchSvg(src) {
    if (svgCache[src]) return Promise.resolve(svgCache[src]);
    return fetch(src, { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${src}`);
        return res.text();
      })
      .then((text) => {
        svgCache[src] = text;
        return text;
      });
  }

  function mountInlineSvg(svg) {
    if (!diagramStage) return;
    clearInlineSvg();
    if (image) {
      // Keep img out of the zoom stage while inlining vector SVG.
      body?.appendChild(image);
      image.removeAttribute('src');
      image.hidden = true;
    }
    inlineSvgEl = svg;
    diagramStage.appendChild(svg);
    diagramZoomViewport.hidden = false;
    body?.classList.add('wireframe-lightbox-body--diagram-zoom');
  }

  function mountDiagramImage() {
    if (!diagramStage || !image) return;
    clearInlineSvg();
    image.hidden = false;
    diagramStage.appendChild(image);
    diagramZoomViewport.hidden = false;
    body?.classList.add('wireframe-lightbox-body--diagram-zoom');
  }

  function mountStandardImage() {
    if (!body || !image) return;
    clearInlineSvg();
    image.hidden = false;
    body.appendChild(image);
    if (diagramZoomViewport) diagramZoomViewport.hidden = true;
    body.classList.remove('wireframe-lightbox-body--diagram-zoom');
  }

  function startDiagramZoom() {
    activeDiagramZoom = window.DiagramZoom?.create(diagramZoomViewport, {
      captureModifierZoom: true,
    });
  }

  function ensureExitControl() {
    if (lightbox.querySelector('[data-lightbox-exit]')) return;
    const dialog = lightbox.querySelector('.wireframe-lightbox-dialog');
    if (!dialog) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wireframe-lightbox-exit';
    btn.setAttribute('data-lightbox-close', '');
    btn.setAttribute('data-lightbox-exit', '');
    btn.setAttribute('aria-label', 'Close');
    btn.innerHTML =
      '<span class="wireframe-lightbox-exit-x" aria-hidden="true">&times;</span>' +
      '<span class="wireframe-lightbox-exit-label">Close</span>';
    btn.addEventListener('click', closeLightbox);
    dialog.appendChild(btn);
  }

  function setCaption(trigger, isZoomable) {
    if (!caption) return;
    const base = (trigger.dataset.lightboxCaption || '').trim();
    if (!isZoomable) {
      caption.textContent = base;
      return;
    }
    if (isTouchDevice()) {
      caption.textContent = base
        ? `${base} · Pinch to zoom · drag to pan · tap Close to exit`
        : 'Pinch to zoom · drag to pan · tap Close to exit';
      return;
    }
    caption.textContent = base
      ? `${base} · Ctrl + / − zooms the mockup (not the page) · drag to pan · Esc to close`
      : 'Ctrl + / − zooms the mockup (not the page) · drag to pan · Esc to close';
  }

  function pushLightboxHistory() {
    if (historyOpen) return;
    try {
      history.pushState({ wireframeLightbox: true }, '', window.location.href);
      historyOpen = true;
    } catch (_) {
      historyOpen = false;
    }
  }

  function clearLightboxHistory() {
    if (!historyOpen) return;
    historyOpen = false;
    try {
      if (history.state && history.state.wireframeLightbox) {
        history.back();
      }
    } catch (_) {
      /* ignore */
    }
  }

  function openLightbox(trigger) {
    const src = trigger.dataset.lightboxSrc;
    if (!src || !image) return;

    lastTrigger = trigger;
    if (title) title.textContent = trigger.dataset.lightboxTitle || '';

    const isZoomable = trigger.hasAttribute('data-lightbox-diagram');
    const useInlineSvg = trigger.hasAttribute('data-lightbox-inline-svg') && /\.svg(\?|$)/i.test(src);
    setCaption(trigger, isZoomable);
    lightbox.classList.toggle('wireframe-lightbox--diagram', isZoomable);
    resetDiagramZoom();
    clearInlineSvg();
    if (isZoomable) ensureExitControl();

    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setPageChromeHidden(true);
    pushLightboxHistory();

    const finishOpen = () => {
      const exitBtn =
        lightbox.querySelector('[data-lightbox-exit]') ||
        lightbox.querySelector('.wireframe-lightbox-close');
      if (isZoomable && isTouchDevice() && exitBtn) {
        exitBtn.focus({ preventScroll: true });
        return;
      }
      if (diagramZoomViewport && !diagramZoomViewport.hidden) {
        diagramZoomViewport.setAttribute('tabindex', '-1');
        diagramZoomViewport.focus({ preventScroll: true });
      } else {
        lightbox.querySelector('.wireframe-lightbox-close')?.focus();
      }
    };

    if (isZoomable && diagramZoomViewport && useInlineSvg) {
      image.alt = trigger.dataset.lightboxTitle || 'Expanded diagram';

      // Prefer cloning the already-rendered page SVG (avoids empty lightbox if fetch/parse fails).
      try {
        const cloned = clonePageSvg(trigger, image.alt);
        if (cloned) {
          image.removeAttribute('src');
          mountInlineSvg(cloned);
          startDiagramZoom();
          finishOpen();
          return;
        }
      } catch (_) {
        /* fall through to fetch / img */
      }

      image.removeAttribute('src');
      fetchSvg(src)
        .then((markup) => {
          const svg = prepareInlineSvg(markup, image.alt);
          mountInlineSvg(svg);
          startDiagramZoom();
          finishOpen();
        })
        .catch(() => {
          image.src = src;
          mountDiagramImage();
          startDiagramZoom();
          finishOpen();
        });
      return;
    }

    image.src = src;
    image.alt = trigger.dataset.lightboxTitle || 'Expanded diagram';

    if (isZoomable && diagramZoomViewport) {
      mountDiagramImage();
      startDiagramZoom();
    } else {
      mountStandardImage();
    }

    finishOpen();
  }

  function closeLightbox() {
    resetDiagramZoom();
    mountStandardImage();

    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.classList.remove('wireframe-lightbox--diagram');
    if (image) {
      image.removeAttribute('src');
      image.alt = '';
    }
    document.body.style.overflow = '';
    setPageChromeHidden(false);
    clearLightboxHistory();
    lastTrigger?.focus?.();
    lastTrigger = null;
  }

  function isZoomShortcut(event) {
    if (!(event.ctrlKey || event.metaKey)) return false;
    const key = event.key;
    const code = event.code;
    return (
      key === '+' ||
      key === '=' ||
      key === '-' ||
      key === '_' ||
      key === '0' ||
      key === 'Add' ||
      key === 'Subtract' ||
      code === 'Equal' ||
      code === 'Minus' ||
      code === 'NumpadAdd' ||
      code === 'NumpadSubtract' ||
      code === 'Digit0' ||
      code === 'Numpad0'
    );
  }

  // Capture-phase handlers stop the browser from zooming the whole page.
  document.addEventListener(
    'keydown',
    (event) => {
      if (!isLightboxOpen()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (!activeDiagramZoom || !isZoomShortcut(event)) return;

      event.preventDefault();
      event.stopPropagation();

      const key = event.key;
      const code = event.code;
      if (key === '+' || key === '=' || key === 'Add' || code === 'Equal' || code === 'NumpadAdd') {
        activeDiagramZoom.zoomBy(1.2);
      } else if (key === '-' || key === '_' || key === 'Subtract' || code === 'Minus' || code === 'NumpadSubtract') {
        activeDiagramZoom.zoomBy(1 / 1.2);
      } else if (key === '0' || code === 'Digit0' || code === 'Numpad0') {
        activeDiagramZoom.reset();
      }
    },
    true
  );

  document.addEventListener(
    'wheel',
    (event) => {
      if (!isLightboxOpen() || !activeDiagramZoom) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      event.stopPropagation();
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      activeDiagramZoom.zoomToward(event.clientX, event.clientY, factor);
    },
    { capture: true, passive: false }
  );

  document.querySelectorAll('[data-lightbox-src]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      openLightbox(trigger);
    });
  });

  document.querySelectorAll('.user-flow-figure').forEach((figure) => {
    // Journey maps own their zoom UI; click-to-open would fight with pan.
    if (figure.closest('[data-journey-viewer]')) return;

    const viewport = figure.querySelector('.diagram-zoom-viewport');
    const expandButton = figure.querySelector('[data-lightbox-src]');
    if (!viewport || !expandButton || isTouchDevice()) return;

    viewport.classList.add('diagram-zoom-viewport--desktop-open');
    viewport.addEventListener('click', () => openLightbox(expandButton));
  });

  closeTargets.forEach((node) => {
    node.addEventListener('click', closeLightbox);
  });

  window.addEventListener('popstate', () => {
    if (!isLightboxOpen()) return;
    historyOpen = false;
    closeLightbox();
  });

  window.addEventListener('pagehide', () => {
    if (!isLightboxOpen()) return;
    document.body.style.overflow = '';
    setPageChromeHidden(false);
  });

  window.DiagramZoom?.initInline();
})();
