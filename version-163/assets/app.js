(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-back-top]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  });

  function attachStream(video, src) {
    if (!video || !src || video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = '1';
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      video._hls = hls;
      return;
    }

    video.src = src;
    video.dataset.ready = '1';
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var src = video ? video.getAttribute('data-m3u8') : '';

    function start() {
      attachStream(video, src);
      player.classList.add('is-playing');
      if (cover) {
        cover.setAttribute('aria-hidden', 'true');
      }
      if (video) {
        video.play().catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  });

  var searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && window.SEARCH_INDEX) {
    var input = searchRoot.querySelector('[data-search-input]');
    var regionSelect = searchRoot.querySelector('[data-filter-region]');
    var yearSelect = searchRoot.querySelector('[data-filter-year]');
    var categoryButtons = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-filter-category]'));
    var resultGrid = searchRoot.querySelector('[data-search-results]');
    var emptyState = searchRoot.querySelector('[data-empty-state]');
    var searchButton = searchRoot.querySelector('.search-panel button');
    var activeCategory = 'all';
    var params = new URLSearchParams(window.location.search);

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderCard(item) {
      return [
        '<article class="movie-card">',
        '<a href="' + escapeHtml(item.href) + '" class="movie-card__link">',
        '<span class="movie-card__poster">',
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">',
        '<span class="movie-card__shade"></span>',
        '<span class="movie-card__play">▶</span>',
        '<span class="movie-card__region">' + escapeHtml(item.region) + '</span>',
        '</span>',
        '<span class="movie-card__body">',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.oneLine) + '</span>',
        '<em>' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</em>',
        '</span>',
        '</a>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var keyword = (input ? input.value : '').trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : 'all';
      var year = yearSelect ? yearSelect.value : 'all';
      var results = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category].join(' ').toLowerCase();
        var keywordPass = !keyword || text.indexOf(keyword) !== -1;
        var regionPass = region === 'all' || item.region === region;
        var yearPass = year === 'all' || item.year === year;
        var categoryPass = activeCategory === 'all' || item.categorySlug === activeCategory;
        return keywordPass && regionPass && yearPass && categoryPass;
      }).slice(0, 120);

      if (resultGrid) {
        resultGrid.innerHTML = results.map(renderCard).join('');
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', results.length === 0);
      }
    }

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    if (input) {
      input.addEventListener('input', runSearch);
    }

    if (searchButton) {
      searchButton.addEventListener('click', runSearch);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', runSearch);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', runSearch);
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-category') || 'all';
        categoryButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        runSearch();
      });
    });

    runSearch();
  }
})();
