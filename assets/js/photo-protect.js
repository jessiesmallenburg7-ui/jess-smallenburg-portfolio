/**
 * Deter download / “open image in new tab” on photography pages.
 * Enabled when <html data-photo-protect> is present.
 * This is a deterrent only — images can still be captured from the network or screenshots.
 */
(function () {
  if (!document.documentElement.hasAttribute("data-photo-protect")) return;

  function isProtected(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        ".photo-hub-card-media, .photo-masonry-trigger, .photo-lightbox-stage, .photo-lightbox-stage img, .photo-masonry-trigger img, .photo-hub-card-media img"
      )
    );
  }

  function block(e) {
    if (isProtected(e.target)) e.preventDefault();
  }

  document.addEventListener("contextmenu", block);
  document.addEventListener("dragstart", block);
  document.addEventListener("auxclick", function (e) {
    if (e.button === 1) block(e);
  });
})();
