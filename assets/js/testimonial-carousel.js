(function () {
  var root = document.querySelector('[data-testimonial-carousel]');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-slide]'));
  var prevBtn = root.querySelector('[data-carousel-prev]');
  var nextBtn = root.querySelector('[data-carousel-next]');
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-dot]'));
  var status = root.querySelector('[data-carousel-status]');
  var index = 0;
  var timer = null;
  var delay = 9000;

  function setActive(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      var active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    dots.forEach(function (dot, i) {
      var active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('tabindex', active ? '0' : '-1');
    });

    if (status) {
      status.textContent = 'Testimonial ' + (index + 1) + ' of ' + slides.length;
    }
  }

  function next() {
    setActive(index + 1);
  }

  function prev() {
    setActive(index - 1);
  }

  function startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAutoplay();
    timer = window.setInterval(next, delay);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAutoplay(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setActive(i);
      startAutoplay();
    });
  });

  root.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
      startAutoplay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
      startAutoplay();
    }
  });

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', function (event) {
    if (!root.contains(event.relatedTarget)) startAutoplay();
  });

  setActive(0);
  startAutoplay();
})();
