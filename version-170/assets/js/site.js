(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    hero.addEventListener('mouseleave', start);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var keyword = panel.querySelector('[data-filter-keyword]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var genre = panel.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keywordValue = normalize(keyword && keyword.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var genreValue = normalize(genre && genre.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matched = true;

        if (keywordValue && haystack.indexOf(keywordValue) === -1) {
          matched = false;
        }
        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          matched = false;
        }
        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          matched = false;
        }
        if (genreValue && normalize(card.getAttribute('data-genre')).indexOf(genreValue) === -1) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    [keyword, type, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-toggle]');
    var errorBox = shell.querySelector('[data-player-error]');
    var source = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var ready = false;

    function showError() {
      shell.classList.add('has-error');
      if (errorBox) {
        errorBox.style.display = 'block';
      }
    }

    function prepare() {
      if (!video || ready || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        showError();
      }

      ready = true;
    }

    function updateState() {
      if (!video) {
        return;
      }
      shell.classList.toggle('is-playing', !video.paused);
      shell.classList.toggle('is-paused', video.paused);
      if (button) {
        button.setAttribute('aria-label', video.paused ? '播放' : '暂停');
      }
    }

    function togglePlay(event) {
      if (event) {
        event.preventDefault();
      }
      if (!video) {
        return;
      }
      prepare();
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(showError);
        }
      } else {
        video.pause();
      }
      updateState();
    }

    if (button) {
      button.addEventListener('click', togglePlay);
    }
    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', updateState);
      video.addEventListener('pause', updateState);
      video.addEventListener('ended', updateState);
    }
  });
})();
