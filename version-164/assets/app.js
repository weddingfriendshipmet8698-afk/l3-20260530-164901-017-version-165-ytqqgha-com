(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupGlobalSearch() {
    var input = document.getElementById("globalSearchInput");
    var category = document.getElementById("globalCategoryFilter");
    var resultBox = document.getElementById("globalSearchResults");
    if (!input || !category || !resultBox || !Array.isArray(window.searchMovies)) {
      return;
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      var cat = category.value;
      if (!q && !cat) {
        resultBox.innerHTML = "";
        return;
      }
      var matches = window.searchMovies.filter(function (movie) {
        var hay = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine].join(" ").toLowerCase();
        var hitText = !q || hay.indexOf(q) !== -1;
        var hitCat = !cat || movie.category === cat;
        return hitText && hitCat;
      }).slice(0, 12);
      resultBox.innerHTML = matches.map(function (movie) {
        return '<a class="search-result" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
          '<small>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</small></span>' +
          '</a>';
      }).join("");
    }

    input.addEventListener("input", render);
    category.addEventListener("change", render);
  }

  function setupCardFiltering() {
    var filter = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-card-list]");
    if (!filter || !list) {
      return;
    }
    var search = filter.querySelector("[data-card-search]");
    var year = filter.querySelector("[data-card-year]");
    var type = filter.querySelector("[data-card-type]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function update() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      cards.forEach(function (card) {
        var hay = card.textContent.toLowerCase();
        var okText = !q || hay.indexOf(q) !== -1;
        var okYear = !y || card.getAttribute("data-year") === y;
        var cardType = card.getAttribute("data-type") || "";
        var okType = !t || cardType.indexOf(t) !== -1;
        card.classList.toggle("is-hidden", !(okText && okYear && okType));
      });
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupCardFiltering();
  });

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !sourceUrl) {
      return;
    }

    function bindSource() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = sourceUrl;
    }

    function start() {
      bindSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    bindSource();
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();
