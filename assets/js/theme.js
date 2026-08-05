(function () {
  var STORAGE_KEY = 'portfolio-theme';
  var root = document.documentElement;
  var ICON_PATTERN = /(tt-icon-[a-z0-9-]+|path-compass-care-network-icon|heart-with-pulse-line-icon-representing-health-and|growing-sprout-icon-representing-personal-and-prof|overlapping-circles-icon-representing-intersecting|decorative-heartbeat-pulse-line-divider|mind-icon-layered-with-a-lotus-flower-symbolizing-|glowing-lightbulb-icon-representing-ideas-and-insi|digital-medical-record-document-icon)(-light)?\.svg(\?.*)?$/i;

  function themedIconSrc(src) {
    if (!src || !ICON_PATTERN.test(src)) return src;
    return src.replace(/(-light)?\.svg(\?.*)?$/i, '-light.svg$2');
  }

  function syncThemeIcons() {
    document.querySelectorAll(
      'img[src*="tt-icon-"], img[src*="path-compass-care-network-icon"], img[src*="heart-with-pulse"], img[src*="growing-sprout"], img[src*="overlapping-circles"], img[src*="decorative-heartbeat"], img[src*="mind-icon-layered"], img[src*="glowing-lightbulb"], img[src*="digital-medical-record"]'
    ).forEach(function (img) {
      var current = img.getAttribute('src') || '';
      var next = themedIconSrc(current);
      if (next && next !== current) img.setAttribute('src', next);
    });
  }

  function applyLight() {
    root.setAttribute('data-theme', 'light');
    try {
      localStorage.removeItem('theme');
      localStorage.setItem(STORAGE_KEY, 'light');
    } catch (_) {
      /* ignore */
    }
    syncThemeIcons();
  }

  window.__setTheme = applyLight;
  applyLight();
})();
