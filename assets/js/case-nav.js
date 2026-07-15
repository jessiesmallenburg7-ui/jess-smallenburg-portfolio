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

  var desktopQuery = window.matchMedia('(min-width: 1024px)');
  var activeId = null;
  var ticking = false;

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

  function updateFromScroll() {
    var marker = window.scrollY + Math.min(160, window.innerHeight * 0.28);
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

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      setActive(link.getAttribute('href').slice(1));
      setOpen(false);
    });
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

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateFromScroll();
})();
