(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var ICON_PATTERN = /(tt-icon-[a-z0-9-]+|path-compass-care-network-icon|heart-with-pulse-line-icon-representing-health-and|growing-sprout-icon-representing-personal-and-prof|overlapping-circles-icon-representing-intersecting|decorative-heartbeat-pulse-line-divider|mind-icon-layered-with-a-lotus-flower-symbolizing-)(-light)?\.svg(\?.*)?$/i;

  function getPreferredTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (_) {
      /* ignore */
    }
    return 'dark';
  }

  function syncToggle(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      var next = theme === 'light' ? 'dark' : 'light';
      btn.setAttribute('aria-label', next === 'light' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.setAttribute('title', next === 'light' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function themedIconSrc(src, theme) {
    if (!src || !ICON_PATTERN.test(src)) return src;
    if (theme === 'light') {
      return src.replace(/(-light)?\.svg(\?.*)?$/i, '-light.svg$2');
    }
    return src.replace(/-light\.svg(\?.*)?$/i, '.svg$1');
  }

  function syncThemeIcons(theme) {
    document.querySelectorAll(
      'img[src*="tt-icon-"], img[src*="path-compass-care-network-icon"], img[src*="heart-with-pulse"], img[src*="growing-sprout"], img[src*="overlapping-circles"], img[src*="decorative-heartbeat"], img[src*="mind-icon-layered"]'
    ).forEach(function (img) {
      var current = img.getAttribute('src') || '';
      var next = themedIconSrc(current, theme);
      if (next && next !== current) img.setAttribute('src', next);
    });
  }

  function applyTheme(theme, persist) {
    var next = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {
        /* ignore */
      }
    }
    syncToggle(next);
    syncThemeIcons(next);
  }

  window.__setTheme = applyTheme;

  applyTheme(getPreferredTheme(), false);

  document.addEventListener('DOMContentLoaded', function () {
    var theme = root.getAttribute('data-theme') || 'dark';
    syncToggle(theme);
    syncThemeIcons(theme);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        applyTheme(current === 'light' ? 'dark' : 'light', true);
      });
    });
  });

})();
