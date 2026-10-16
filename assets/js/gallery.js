// Carousel and lightbox for _includes/gallery.html. The include adds this script once per
// gallery, so guard against initialising twice.
(function () {
  if (window.galleryInitialised) return;
  window.galleryInitialised = true;

  var SCALE_STEP = 0.75;   // each step away from the selected image shrinks it by this factor
  var OVERLAP = 0.6;       // fraction of the summed half-widths kept between neighbouring centres
  var VISIBLE_STEPS = 3;   // images further away than this are hidden
  var MAX_CENTER_WIDTH = 0.85; // the selected image never takes more than this share of the stage

  function setup(gallery) {
    var stage = gallery.querySelector('.gallery__stage');
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item'));
    var label = gallery.querySelector('.gallery__label');
    var dialog = gallery.querySelector('.gallery__lightbox');
    var full = dialog.querySelector('.gallery__full');
    var caption = dialog.querySelector('.gallery__caption');
    var current = 0;

    function layout() {
      var widths = items.map(function (item) { return item.offsetWidth; });
      var fit = Math.min(1, (stage.clientWidth * MAX_CENTER_WIDTH) / (widths[current] || 1));

      var n = items.length;
      items.forEach(function (item, i) {
        // Offset from the selected image, wrapped so that neighbours appear on both sides.
        var offset = ((i - current) % n + n) % n;
        if (offset > n / 2) offset -= n;
        var steps = Math.abs(offset);
        var direction = Math.sign(offset);
        var x = 0;
        var previousHalf = widths[current] / 2;
        for (var k = 1; k <= steps; k++) {
          var half = (widths[((current + direction * k) % n + n) % n] * Math.pow(SCALE_STEP, k)) / 2;
          x += (previousHalf + half) * OVERLAP;
          previousHalf = half;
        }
        var scale = Math.pow(SCALE_STEP, steps) * fit;
        item.style.transform = 'translateX(-50%) translateX(' + (direction * x * fit) + 'px) scale(' + scale + ')';
        item.style.zIndex = String(VISIBLE_STEPS + 1 - steps);
        item.classList.toggle('is-current', steps === 0);
        item.classList.toggle('is-hidden', steps > VISIBLE_STEPS);
        item.tabIndex = steps === 0 ? 0 : -1;
        if (steps === 0) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
      });
    }

    function select(index) {
      current = (index + items.length) % items.length;
      var img = items[current].querySelector('img');
      label.textContent = img.alt + ' (' + (current + 1) + ' / ' + items.length + ')';
      full.src = img.currentSrc || img.src;
      full.alt = img.alt;
      caption.textContent = label.textContent;
      layout();
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        if (i === current) dialog.showModal();
        else select(i);
      });
      // Widths are only known once an image has loaded.
      var img = item.querySelector('img');
      if (!img.complete) img.addEventListener('load', layout);
    });

    gallery.querySelector('.gallery__nav--prev').addEventListener('click', function () { select(current - 1); });
    gallery.querySelector('.gallery__nav--next').addEventListener('click', function () { select(current + 1); });
    dialog.querySelector('.gallery__btn--prev').addEventListener('click', function () { select(current - 1); });
    dialog.querySelector('.gallery__btn--next').addEventListener('click', function () { select(current + 1); });
    dialog.querySelector('.gallery__btn--close').addEventListener('click', function () { dialog.close(); });

    // Clicks on the backdrop land on the dialog itself; clicks on the image or buttons don't.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog || event.target.classList.contains('gallery__figure')) dialog.close();
    });

    gallery.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { select(current - 1); event.preventDefault(); }
      if (event.key === 'ArrowRight') { select(current + 1); event.preventDefault(); }
    });

    [stage, dialog].forEach(function (surface) {
      var touchX = null;
      surface.addEventListener('touchstart', function (event) { touchX = event.touches[0].clientX; }, { passive: true });
      surface.addEventListener('touchend', function (event) {
        if (touchX === null) return;
        var dx = event.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) select(current + (dx < 0 ? 1 : -1));
        touchX = null;
      });
    });

    window.addEventListener('resize', layout);
    select(0);
    // Only animate once every image has loaded and been placed, so the relayouts triggered
    // by loading images don't play as transitions.
    window.addEventListener('load', function () {
      layout();
      requestAnimationFrame(function () { gallery.classList.add('is-ready'); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.gallery').forEach(setup);
  });
})();
