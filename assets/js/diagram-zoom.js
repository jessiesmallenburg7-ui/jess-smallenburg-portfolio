(function () {
  const MIN_SCALE = 1;
  const MAX_SCALE = 6;
  const KEYBOARD_STEP = 1.2;

  function isTouchDevice() {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  function getDistance(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  function getMidpoint(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function DiagramZoom(viewport, options) {
    const stage = viewport.querySelector('.diagram-zoom-stage');
    const content =
      stage?.querySelector('svg.diagram-zoom-content, img.diagram-zoom-content, img, svg');
    if (!stage || !content) return null;

    const captureModifierZoom = Boolean(options && options.captureModifierZoom);
    const isSvg =
      content.tagName.toLowerCase() === 'svg' ||
      (content.tagName.toLowerCase() === 'img' &&
        /\.svg(\?|#|$)/i.test(content.currentSrc || content.getAttribute('src') || ''));
    const optionMaxScale =
      options && typeof options.maxScale === 'number' && options.maxScale > 0
        ? options.maxScale
        : null;

    let scale = 1;
    let baseWidth = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let panScrollLeft = 0;
    let panScrollTop = 0;
    let pinchStartDistance = 0;
    let pinchStartScale = 1;
    let lastTap = 0;
    let moved = false;

    function contentRatio() {
      if (!isSvg) {
        return (content.naturalHeight || 1) / (content.naturalWidth || 1);
      }
      const vb = content.viewBox && content.viewBox.baseVal;
      if (vb && vb.width) return vb.height / vb.width;
      const w = parseFloat(content.getAttribute('width')) || content.clientWidth || 1;
      const h = parseFloat(content.getAttribute('height')) || content.clientHeight || 1;
      return h / w;
    }

    function measureBaseWidth() {
      const prevWidth = content.style.width;
      const prevMax = content.style.maxWidth;
      const prevHeight = content.style.height;
      content.style.width = '';
      content.style.maxWidth = '';
      content.style.height = '';

      if (!isSvg && content.naturalWidth) {
        const vw = Math.max(1, viewport.clientWidth);
        const vh = Math.max(1, viewport.clientHeight);
        const nw = content.naturalWidth;
        const nh = content.naturalHeight || nw;
        const fit = Math.min(1, vw / nw, vh / nh);
        baseWidth = Math.max(1, nw * fit);
      } else {
        baseWidth =
          content.getBoundingClientRect().width || content.offsetWidth || viewport.clientWidth;
      }

      content.style.width = prevWidth;
      content.style.maxWidth = prevMax;
      content.style.height = prevHeight;
    }

    /** Cap zoom so bitmap images never display larger than their native pixel size. */
    function getMaxScale() {
      if (optionMaxScale != null) return optionMaxScale;
      if (isSvg) return MAX_SCALE;
      const nativeWidth = content.naturalWidth || 0;
      if (!nativeWidth || !baseWidth) return MAX_SCALE;
      return Math.max(1, Math.min(MAX_SCALE, nativeWidth / baseWidth));
    }

    function preferredDoubleTapScale() {
      return Math.min(2.25, getMaxScale());
    }

    function updateCursor() {
      if (scale > 1.01) {
        viewport.style.cursor = isPanning ? 'grabbing' : 'grab';
      } else {
        viewport.style.cursor = '';
      }
    }

    function contentHeight() {
      return content.offsetHeight || baseWidth * scale * contentRatio();
    }

    function clampScroll() {
      const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      viewport.scrollLeft = clamp(viewport.scrollLeft, 0, maxLeft);
      viewport.scrollTop = clamp(viewport.scrollTop, 0, maxTop);
    }

    function applyScale(keepPoint) {
      if (!baseWidth) measureBaseWidth();

      const prevWidth = content.offsetWidth || baseWidth * scale;
      const prevHeight = content.offsetHeight || contentHeight();
      const nextWidth = baseWidth * scale;

      // Grow layout size so SVG stays vector-crisp (and <img src=svg> re-rasterizes).
      // Avoid CSS transform: scale() — that stretches a bitmap and looks soft.
      content.style.maxWidth = 'none';
      content.style.maxHeight = 'none';
      content.style.width = `${nextWidth}px`;
      content.style.height = 'auto';
      content.style.flexShrink = '0';
      content.style.minWidth = `${nextWidth}px`;
      if (stage) {
        stage.style.width = scale > 1.01 ? 'max-content' : '';
        stage.style.minWidth = scale > 1.01 ? '100%' : '';
        stage.style.transform = '';
      }

      viewport.classList.toggle('is-zoomed', scale > 1.01);
      updateCursor();

      if (scale <= 1.01) {
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
        return;
      }

      // Reflow so scrollWidth/scrollHeight reflect the zoomed layout (scrollbars + drag pan).
      void viewport.offsetWidth;

      if (!keepPoint) {
        clampScroll();
        return;
      }

      const nextHeight = contentHeight();
      const widthRatio = nextWidth / (prevWidth || nextWidth);
      const heightRatio = nextHeight / (prevHeight || nextHeight);
      const rect = viewport.getBoundingClientRect();
      const anchorX = keepPoint.x - rect.left;
      const anchorY = keepPoint.y - rect.top;

      viewport.scrollLeft = (viewport.scrollLeft + anchorX) * widthRatio - anchorX;
      viewport.scrollTop = (viewport.scrollTop + anchorY) * heightRatio - anchorY;
      clampScroll();
    }

    function zoomTo(newScale, clientX, clientY) {
      if (!baseWidth) measureBaseWidth();

      const clamped = clamp(newScale, MIN_SCALE, getMaxScale());
      if (clamped <= 1) {
        reset();
        return;
      }

      scale = clamped;
      applyScale({ x: clientX, y: clientY });
    }

    function zoomBy(factor) {
      const rect = viewport.getBoundingClientRect();
      zoomTo(scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    function reset() {
      scale = 1;
      content.style.width = '';
      content.style.maxWidth = '';
      content.style.maxHeight = '';
      content.style.height = '';
      content.style.flexShrink = '';
      content.style.minWidth = '';
      if (stage) {
        stage.style.width = '';
        stage.style.minWidth = '';
        stage.style.transform = '';
      }
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
      viewport.classList.remove('is-zoomed', 'is-dragging');
      updateCursor();
      baseWidth = 0;
    }

    function onWheel(event) {
      if (!captureModifierZoom) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomTo(scale * factor, event.clientX, event.clientY);
    }

    function onKeyDown(event) {
      if (!captureModifierZoom) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key;

      if (key === '+' || key === '=' || key === 'Add') {
        event.preventDefault();
        zoomBy(KEYBOARD_STEP);
      } else if (key === '-' || key === '_' || key === 'Subtract') {
        event.preventDefault();
        zoomBy(1 / KEYBOARD_STEP);
      } else if (key === '0' || key === 'Digit0') {
        event.preventDefault();
        reset();
      }
    }

    function bindPanTracking() {
      if (window.PointerEvent) {
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: false });
        window.addEventListener('pointercancel', onPointerCancel, { passive: false });
      } else {
        window.addEventListener('mousemove', onMouseMove, { passive: false });
        window.addEventListener('mouseup', onMouseUp, { passive: false });
      }
    }

    function unbindPanTracking() {
      if (window.PointerEvent) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerCancel);
      } else {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    }

    function startPan(clientX, clientY, pointerId) {
      isPanning = true;
      moved = false;
      panStartX = clientX;
      panStartY = clientY;
      panScrollLeft = viewport.scrollLeft;
      panScrollTop = viewport.scrollTop;
      viewport.classList.add('is-dragging');
      updateCursor();
      bindPanTracking();
      if (typeof pointerId === 'number' && viewport.setPointerCapture) {
        try {
          viewport.setPointerCapture(pointerId);
        } catch (_) {
          /* ignore */
        }
      }
    }

    function movePan(clientX, clientY) {
      if (!isPanning) return;
      const dx = clientX - panStartX;
      const dy = clientY - panStartY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
      viewport.scrollLeft = panScrollLeft - dx;
      viewport.scrollTop = panScrollTop - dy;
      clampScroll();
    }

    function endPan(pointerId) {
      if (!isPanning) return;
      isPanning = false;
      viewport.classList.remove('is-dragging');
      updateCursor();
      unbindPanTracking();
      if (typeof pointerId === 'number' && viewport.releasePointerCapture) {
        try {
          if (viewport.hasPointerCapture?.(pointerId)) {
            viewport.releasePointerCapture(pointerId);
          }
        } catch (_) {
          /* ignore */
        }
      }
    }

    function onPointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (scale <= 1.01) return;
      startPan(event.clientX, event.clientY, event.pointerId);
      event.preventDefault();
    }

    function onPointerMove(event) {
      if (!isPanning) return;
      movePan(event.clientX, event.clientY);
      event.preventDefault();
    }

    function onPointerUp(event) {
      endPan(event.pointerId);
    }

    function onPointerCancel(event) {
      endPan(event.pointerId);
    }

    function onMouseDown(event) {
      if (event.button !== 0 || scale <= 1.01) return;
      startPan(event.clientX, event.clientY, null);
      event.preventDefault();
    }

    function onMouseMove(event) {
      if (!isPanning) return;
      movePan(event.clientX, event.clientY);
      event.preventDefault();
    }

    function onMouseUp() {
      endPan(null);
    }

    function onDblClick(event) {
      if (scale > 1) {
        reset();
      } else {
        zoomTo(preferredDoubleTapScale(), event.clientX, event.clientY);
      }
    }

    function onTouchStart(event) {
      moved = false;

      if (event.touches.length === 1 && scale > 1.01) {
        isPanning = true;
        panStartX = event.touches[0].clientX;
        panStartY = event.touches[0].clientY;
        panScrollLeft = viewport.scrollLeft;
        panScrollTop = viewport.scrollTop;
        viewport.classList.add('is-dragging');
        event.preventDefault();
      } else if (event.touches.length === 2) {
        isPanning = false;
        pinchStartDistance = getDistance(event.touches[0], event.touches[1]);
        pinchStartScale = scale;
        event.preventDefault();
      }
    }

    function onTouchMove(event) {
      if (event.touches.length === 2 && pinchStartDistance > 0) {
        const distance = getDistance(event.touches[0], event.touches[1]);
        const midpoint = getMidpoint(event.touches[0], event.touches[1]);
        zoomTo(pinchStartScale * (distance / pinchStartDistance), midpoint.x, midpoint.y);
        moved = true;
        event.preventDefault();
      } else if (isPanning && event.touches.length === 1) {
        movePan(event.touches[0].clientX, event.touches[0].clientY);
        event.preventDefault();
      }
    }

    function onTouchEnd(event) {
      if (event.touches.length === 0) {
        isPanning = false;
        pinchStartDistance = 0;
        viewport.classList.remove('is-dragging');

        if (!moved && event.changedTouches.length === 1) {
          const now = Date.now();
          if (now - lastTap < 300) {
            if (scale > 1) {
              reset();
            } else {
              zoomTo(
                preferredDoubleTapScale(),
                event.changedTouches[0].clientX,
                event.changedTouches[0].clientY
              );
            }
            event.preventDefault();
          }
          lastTap = now;
        }

        if (scale <= 1) {
          reset();
        }
      }
    }

    function onResize() {
      if (scale <= 1) {
        baseWidth = 0;
        return;
      }
      const rect = viewport.getBoundingClientRect();
      measureBaseWidth();
      applyScale({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    function initWhenReady() {
      const start = () => {
        measureBaseWidth();
        if (content.tagName.toLowerCase() === 'img') {
          content.draggable = false;
        }
        content.style.webkitUserSelect = 'none';
        content.style.userSelect = 'none';
      };
      if (isSvg) {
        // Inline SVG is ready immediately; fonts may still settle.
        start();
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            baseWidth = 0;
            if (scale > 1) applyScale({
              x: viewport.getBoundingClientRect().left + viewport.clientWidth / 2,
              y: viewport.getBoundingClientRect().top + viewport.clientHeight / 2,
            });
            else measureBaseWidth();
          });
        }
        return;
      }
      if (content.complete && content.naturalWidth) {
        start();
      } else {
        content.addEventListener('load', start, { once: true });
      }
    }

    viewport.addEventListener('wheel', onWheel, { passive: false });
    if (window.PointerEvent) {
      // Capture so drag starts even when the pointer lands on SVG text/paths inside the mockup.
      viewport.addEventListener('pointerdown', onPointerDown, { capture: true });
    } else {
      viewport.addEventListener('mousedown', onMouseDown, { capture: true });
    }
    viewport.addEventListener('dblclick', onDblClick);
    if (captureModifierZoom) {
      window.addEventListener('keydown', onKeyDown);
    }
    viewport.addEventListener('touchstart', onTouchStart, { passive: false });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd, { passive: false });
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: false });
    window.addEventListener('resize', onResize);
    initWhenReady();

    return {
      reset,
      zoomBy,
      zoomToward(clientX, clientY, factor) {
        zoomTo(scale * factor, clientX, clientY);
      },
      destroy() {
        reset();
        endPan(null);
        unbindPanTracking();
        viewport.removeEventListener('wheel', onWheel);
        if (window.PointerEvent) {
          viewport.removeEventListener('pointerdown', onPointerDown, { capture: true });
        } else {
          viewport.removeEventListener('mousedown', onMouseDown, { capture: true });
        }
        viewport.removeEventListener('dblclick', onDblClick);
        if (captureModifierZoom) {
          window.removeEventListener('keydown', onKeyDown);
        }
        viewport.removeEventListener('touchstart', onTouchStart);
        viewport.removeEventListener('touchmove', onTouchMove);
        viewport.removeEventListener('touchend', onTouchEnd);
        viewport.removeEventListener('touchcancel', onTouchEnd);
        window.removeEventListener('resize', onResize);
      },
    };
  }

  function initInlineZoom() {
    if (!isTouchDevice()) return [];

    return Array.from(document.querySelectorAll('[data-diagram-zoom]'))
      .map((viewport) => DiagramZoom(viewport, { captureModifierZoom: false }))
      .filter(Boolean);
  }

  window.DiagramZoom = {
    isTouchDevice,
    create: DiagramZoom,
    initInline: initInlineZoom,
  };
})();
