(function () {
  function toggleNavigation() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function runHeroSlider() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    start();
  }

  function runMovieFilter() {
    var input = document.querySelector('.movie-filter');
    var list = document.querySelector('.movie-list');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter(value) {
      var keyword = String(value || '').trim().toLowerCase();
      input.value = value || '';
      cards.forEach(function (card) {
        var text = card.textContent + ' ' + Object.keys(card.dataset).map(function (key) {
          return card.dataset[key];
        }).join(' ');
        card.classList.toggle('is-hidden-card', keyword && text.toLowerCase().indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', function () {
      applyFilter(input.value);
    });

    document.querySelectorAll('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-filter-value'));
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      applyFilter(query);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleNavigation();
    runHeroSlider();
    runMovieFilter();
  });
})();
