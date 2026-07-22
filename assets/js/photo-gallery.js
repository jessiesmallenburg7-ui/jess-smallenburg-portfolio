/**
 * Elegant masonry photo gallery + lightbox.
 * Expects window.PHOTO_GALLERY_LANDSCAPE (or data-gallery-var on #photo-masonry).
 */
(function () {
  const root = document.getElementById("photo-masonry");
  if (!root) return;

  const varName = root.getAttribute("data-gallery-var") || "PHOTO_GALLERY_LANDSCAPE";
  const photos = Array.isArray(window[varName]) ? window[varName].filter(Boolean) : [];
  const basePath =
    root.getAttribute("data-base-path") ||
    "../../assets/images/photography/landscape/";

  if (!photos.length) {
    root.innerHTML =
      '<div class="photo-gallery-empty"><p>Photos will appear here soon.</p></div>';
    return;
  }

  let index = 0;
  let lastFocus = null;

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGrid() {
    root.innerHTML = photos
      .map((photo, i) => {
        const src = basePath + photo.file;
        const caption = photo.caption ? `<figcaption class="photo-masonry-caption">${esc(photo.caption)}</figcaption>` : "";
        return `
          <figure class="photo-masonry-item">
            <button type="button" class="photo-masonry-trigger" data-index="${i}" aria-label="View ${esc(photo.alt || photo.caption || "photograph")} full size">
              <img
                src="${esc(src)}"
                alt="${esc(photo.alt || "")}"
                loading="${i < 4 ? "eager" : "lazy"}"
                decoding="async"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              >
            </button>
            ${caption}
          </figure>`;
      })
      .join("");

    root.querySelectorAll(".photo-masonry-trigger").forEach((btn) => {
      btn.addEventListener("click", () => openLightbox(Number(btn.dataset.index)));
    });
  }

  function ensureLightbox() {
    let lb = document.getElementById("photo-lightbox");
    if (lb) return lb;

    lb = document.createElement("div");
    lb.id = "photo-lightbox";
    lb.className = "photo-lightbox";
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    lb.innerHTML = `
      <div class="photo-lightbox-backdrop" data-photo-close></div>
      <div class="photo-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="photo-lightbox-caption">
        <button type="button" class="photo-lightbox-close" data-photo-close aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <button type="button" class="photo-lightbox-nav photo-lightbox-prev" data-photo-prev aria-label="Previous photo">
          <span aria-hidden="true">&#8249;</span>
        </button>
        <button type="button" class="photo-lightbox-nav photo-lightbox-next" data-photo-next aria-label="Next photo">
          <span aria-hidden="true">&#8250;</span>
        </button>
        <div class="photo-lightbox-stage">
          <img id="photo-lightbox-image" alt="">
        </div>
        <div class="photo-lightbox-meta">
          <p id="photo-lightbox-caption" class="photo-lightbox-caption"></p>
          <p id="photo-lightbox-count" class="photo-lightbox-count"></p>
        </div>
      </div>`;
    document.body.appendChild(lb);

    lb.querySelectorAll("[data-photo-close]").forEach((el) => {
      el.addEventListener("click", closeLightbox);
    });
    lb.querySelector("[data-photo-prev]").addEventListener("click", (e) => {
      e.stopPropagation();
      showPhoto((index - 1 + photos.length) % photos.length);
    });
    lb.querySelector("[data-photo-next]").addEventListener("click", (e) => {
      e.stopPropagation();
      showPhoto((index + 1) % photos.length);
    });

    bindSwipe(lb);

    return lb;
  }

  function showPhoto(i) {
    index = i;
    const photo = photos[index];
    const lb = ensureLightbox();
    const img = lb.querySelector("#photo-lightbox-image");
    const caption = lb.querySelector("#photo-lightbox-caption");
    const count = lb.querySelector("#photo-lightbox-count");

    img.src = basePath + photo.file;
    img.alt = photo.alt || photo.caption || "";
    caption.textContent = photo.caption || photo.alt || "";
    count.textContent = `${index + 1} / ${photos.length}`;
  }

  function openLightbox(i) {
    lastFocus = document.activeElement;
    const lb = ensureLightbox();
    showPhoto(i);
    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("is-photo-lightbox-open");
    lb.querySelector(".photo-lightbox-close").focus({ preventScroll: true });
  }

  function closeLightbox() {
    const lb = document.getElementById("photo-lightbox");
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.documentElement.classList.remove("is-photo-lightbox-open");
    const img = lb.querySelector("#photo-lightbox-image");
    if (img) {
      img.removeAttribute("src");
      img.alt = "";
    }
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  function bindSwipe(lb) {
    const stage = lb.querySelector(".photo-lightbox-stage");
    if (!stage || stage.dataset.swipeBound) return;
    stage.dataset.swipeBound = "1";
    let startX = 0;
    let startY = 0;
    stage.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        startX = t.clientX;
        startY = t.clientY;
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchend",
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) showPhoto((index + 1) % photos.length);
        else showPhoto((index - 1 + photos.length) % photos.length);
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("photo-lightbox");
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPhoto((index - 1 + photos.length) % photos.length);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      showPhoto((index + 1) % photos.length);
    }
  });

  renderGrid();
})();
