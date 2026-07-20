(function () {
  var nav = document.querySelector('[data-case-nav]');
  if (!nav) return;

  var toggle = nav.querySelector('.case-nav-toggle');
  var currentLabel = nav.querySelector('[data-case-nav-current]');
  var links = Array.prototype.slice.call(nav.querySelectorAll('a.case-nav-link[href^="#"]'));
  if (!links.length) return;

  var sections = links
    .map(function (link) {
      return document.getElementById(link.getAttribute('href').slice(1));
    })
    .filter(Boolean);

  if (!sections.length) return;

  var sectionIds = {};
  sections.forEach(function (section) {
    sectionIds[section.id] = true;
  });

  var desktopQuery = window.matchMedia('(min-width: 1024px)');
  var activeId = null;
  var ticking = false;
  var pendingTargetId = null;
  var correctTimer = null;
  var correctUntil = 0;

  function linkLabel(link) {
    return link.getAttribute('data-nav-label') || link.textContent.replace(/\s+/g, ' ').trim();
  }

  function setCurrentLabel(link) {
    if (!currentLabel) return;
    var label = linkLabel(link);
    var match = label.match(/^(\d{2})\s+(.+)$/);
    if (match) {
      currentLabel.innerHTML =
        '<span class="case-nav-num">' + match[1] + '</span> ' + match[2];
    } else {
      currentLabel.textContent = label;
    }
  }

  function setOpen(open) {
    if (!toggle || desktopQuery.matches) {
      nav.classList.remove('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
      return;
    }

    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  var processSteps = Array.prototype.slice.call(
    document.querySelectorAll('a.process-step--link[href^="#"]')
  );

  function setActive(id) {
    if (!id || id === activeId) return;
    activeId = id;

    links.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + id;
      link.classList.toggle('case-nav-link-active', match);
      if (match) {
        link.setAttribute('aria-current', 'true');
        if (currentLabel) setCurrentLabel(link);
      } else {
        link.removeAttribute('aria-current');
      }
    });

    processSteps.forEach(function (step) {
      step.classList.toggle('is-current', step.getAttribute('href') === '#' + id);
    });
  }

  function stickyOffset() {
    var rect = nav.getBoundingClientRect();
    var top = 0;
    if (desktopQuery.matches) {
      top = parseFloat(window.getComputedStyle(nav).top) || 0;
    }
    // Prefer live sticky height when pinned; otherwise estimate from offsetHeight.
    var height = rect.height > 0 ? rect.height : nav.offsetHeight;
    return Math.ceil(height + top + 12);
  }

  function scrollToId(id, behavior) {
    var el = document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - stickyOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: behavior || 'auto' });
  }

  function stopCorrections() {
    pendingTargetId = null;
    if (correctTimer) {
      window.clearTimeout(correctTimer);
      correctTimer = null;
    }
  }

  function scheduleCorrections(id) {
    pendingTargetId = id;
    correctUntil = Date.now() + 2200;

    function correct() {
      if (pendingTargetId !== id) return;
      if (Date.now() > correctUntil) {
        stopCorrections();
        updateFromScroll();
        return;
      }

      var el = document.getElementById(id);
      if (!el) {
        stopCorrections();
        return;
      }

      var expected = stickyOffset();
      var drift = el.getBoundingClientRect().top - expected;
      if (Math.abs(drift) > 6) {
        scrollToId(id, 'auto');
      }

      correctTimer = window.setTimeout(correct, 100);
    }

    if (correctTimer) window.clearTimeout(correctTimer);
    correctTimer = window.setTimeout(correct, 80);
  }

  function goToSection(id, behavior) {
    if (!sectionIds[id]) return;
    setActive(id);
    setOpen(false);
    // Scroll only — do not write the hash into the URL, so refresh stays at the top.
    scrollToId(id, behavior || 'smooth');
    scheduleCorrections(id);
  }

  function clearSectionHashAndStayTop() {
    var id = location.hash ? location.hash.slice(1) : '';
    if (!id || !sectionIds[id]) return false;
    if (history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    window.scrollTo(0, 0);
    return true;
  }

  function updateFromScroll() {
    // While correcting a deliberate jump, keep the target highlighted.
    if (pendingTargetId) {
      setActive(pendingTargetId);
      return;
    }

    var marker = window.scrollY + Math.max(stickyOffset() + 8, Math.min(160, window.innerHeight * 0.28));
    var current = sections[0].id;

    for (var i = 0; i < sections.length; i++) {
      var top = sections[i].getBoundingClientRect().top + window.scrollY;
      if (top <= marker) current = sections[i].id;
    }

    setActive(current);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateFromScroll();
      ticking = false;
    });
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
  }

  // Intercept all in-page jumps to case sections (hero CTA, process steps, TOC).
  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    var id = href.slice(1);
    if (!sectionIds[id]) return;

    event.preventDefault();
    goToSection(id, 'smooth');
  });

  document.addEventListener('click', function (event) {
    if (!nav.classList.contains('is-open')) return;
    if (!nav.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      if (toggle) toggle.focus();
    }
  });

  desktopQuery.addEventListener('change', function () {
    setOpen(false);
  });

  // Lazy images above the target can expand after the first scroll — re-align.
  document.addEventListener(
    'load',
    function (event) {
      if (!pendingTargetId) return;
      if (!event.target || event.target.tagName !== 'IMG') return;
      scrollToId(pendingTargetId, 'auto');
    },
    true
  );

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (_) {
    /* ignore */
  }

  // Refresh / direct load should start at the top, even if a leftover #section is in the URL.
  clearSectionHashAndStayTop();
  updateFromScroll();
})();
