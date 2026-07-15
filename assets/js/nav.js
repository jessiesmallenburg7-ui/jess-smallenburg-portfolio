(function () {
  var headers = document.querySelectorAll('.site-header');
  var desktopQuery = window.matchMedia('(min-width: 768px)');

  headers.forEach(function (header) {
    var toggle = header.querySelector('.nav-toggle');
    var nav = header.querySelector('.site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      header.classList.toggle('is-nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('overflow-hidden', open && !desktopQuery.matches);

      if (desktopQuery.matches) {
        nav.classList.remove('hidden');
        document.body.classList.remove('overflow-hidden');
        return;
      }

      nav.classList.toggle('hidden', !open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-nav-open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!desktopQuery.matches) setOpen(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('is-nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    desktopQuery.addEventListener('change', function () {
      if (desktopQuery.matches) {
        setOpen(false);
      } else if (!header.classList.contains('is-nav-open')) {
        nav.classList.add('hidden');
      }
    });
  });
})();
