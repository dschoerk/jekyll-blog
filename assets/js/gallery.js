// Lightbox for _includes/gallery.html. The include adds this script once per gallery,
// so guard against initialising twice.
(function () {
  if (window.galleryInitialised) return;
  window.galleryInitialised = true;

  function setup(gallery) {
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__thumb img'));
    var dialog = gallery.querySelector('.gallery__lightbox');
    var full = dialog.querySelector('.gallery__full');
    var caption = dialog.querySelector('.gallery__caption');
    var current = 0;

    function show(index) {
      current = (index + thumbs.length) % thumbs.length;
      full.src = thumbs[current].currentSrc || thumbs[current].src;
      full.alt = thumbs[current].alt;
      caption.textContent = thumbs[current].alt + ' (' + (current + 1) + ' / ' + thumbs.length + ')';
    }

    gallery.querySelectorAll('.gallery__thumb').forEach(function (button) {
      button.addEventListener('click', function () {
        show(Number(button.dataset.index));
        dialog.showModal();
      });
    });

    dialog.querySelector('.gallery__btn--prev').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('.gallery__btn--next').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('.gallery__btn--close').addEventListener('click', function () { dialog.close(); });

    // Clicks on the backdrop land on the dialog itself; clicks on the image or buttons don't.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog || event.target.classList.contains('gallery__figure')) dialog.close();
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });

    var touchX = null;
    dialog.addEventListener('touchstart', function (event) { touchX = event.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', function (event) {
      if (touchX === null) return;
      var dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    if (thumbs.length < 2) {
      dialog.querySelector('.gallery__btn--prev').hidden = true;
      dialog.querySelector('.gallery__btn--next').hidden = true;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.gallery').forEach(setup);
  });
})();
