(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));

    lists.forEach(function (list) {
      var section = list.closest('section') || document;
      var input = section.querySelector('[data-filter-input]');
      var yearSelect = section.querySelector('[data-filter-year]');
      var items = Array.prototype.slice.call(list.querySelectorAll('.filter-item'));

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';

        items.forEach(function (item) {
          var haystack = (item.getAttribute('data-filter-text') || '').toLowerCase();
          var itemYear = item.getAttribute('data-year') || '';
          var matchesText = !text || haystack.indexOf(text) !== -1;
          var matchesYear = !year || itemYear === year;
          item.classList.toggle('is-hidden', !(matchesText && matchesYear));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
    });
  }

  function setupGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    var data = window.SiteMovieIndex || [];

    inputs.forEach(function (input) {
      var wrapper = input.parentElement;
      var results = wrapper ? wrapper.querySelector('[data-global-results]') : null;

      if (!results) {
        return;
      }

      function closeResults() {
        results.classList.remove('is-open');
        results.innerHTML = '';
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          closeResults();
          return;
        }

        var matches = data.filter(function (item) {
          var haystack = [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine].join(' ').toLowerCase();
          return haystack.indexOf(query) !== -1;
        }).slice(0, 10);

        if (!matches.length) {
          results.innerHTML = '<div class="global-empty">暂无匹配内容</div>';
          results.classList.add('is-open');
          return;
        }

        results.innerHTML = matches.map(function (item) {
          return '<a class="global-result-item" href="' + item.url + '">' +
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span></span>' +
            '</a>';
        }).join('');
        results.classList.add('is-open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (wrapper && !wrapper.contains(event.target)) {
          closeResults();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var layer = document.getElementById(options.layerId);
    var button = document.getElementById(options.buttonId);
    var attached = false;
    var hls = null;

    if (!video || !options.url) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.url;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.url);
        hls.attachMedia(video);
      } else {
        video.src = options.url;
      }
    }

    function play() {
      attach();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (layer) {
      layer.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupGlobalSearch();
  });
})();
