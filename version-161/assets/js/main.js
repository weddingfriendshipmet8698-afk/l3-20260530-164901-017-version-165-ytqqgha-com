(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-error');
      }, { once: true });
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('.site-filter');
    var grid = document.querySelector('.filter-grid');
    if (!panel || !grid) {
      return;
    }

    var keyword = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var sort = panel.querySelector('[data-filter-sort]');
    var count = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.filter-card'));

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && keyword) {
      keyword.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matches(card) {
      var q = normalize(keyword ? keyword.value : '');
      var text = normalize(card.getAttribute('data-search') || card.getAttribute('data-title') || '');
      var regionValue = region ? region.value : 'all';
      var typeValue = type ? type.value : 'all';
      var yearValue = year ? year.value : 'all';

      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (regionValue !== 'all' && card.getAttribute('data-region') !== regionValue) {
        return false;
      }
      if (typeValue !== 'all' && card.getAttribute('data-type') !== typeValue) {
        return false;
      }
      if (yearValue !== 'all' && card.getAttribute('data-year-bucket') !== yearValue) {
        return false;
      }
      return true;
    }

    function sortCards(visibleCards) {
      var mode = sort ? sort.value : 'hot';
      visibleCards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        if (mode === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
      });
      visibleCards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function apply() {
      var visible = [];
      cards.forEach(function (card) {
        var isVisible = matches(card);
        card.classList.toggle('is-hidden-by-filter', !isVisible);
        if (isVisible) {
          visible.push(card);
        }
      });
      sortCards(visible);
      if (count) {
        count.textContent = '当前显示 ' + visible.length + ' 部，共 ' + cards.length + ' 部';
      }
    }

    [keyword, region, type, year, sort].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  ready(function () {
    setupNavigation();
    setupImageFallbacks();
    setupHero();
    setupFilters();
  });
})();
