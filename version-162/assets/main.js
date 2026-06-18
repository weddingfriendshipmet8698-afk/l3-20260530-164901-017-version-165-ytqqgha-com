(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHero() {
    document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          stop();
          show(dotIndex);
          start();
        });
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scopeSelector = form.getAttribute("data-filter-form");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var input = form.querySelector("[name='q']");
      var typeSelect = form.querySelector("[name='type']");
      var yearSelect = form.querySelector("[name='year']");
      var empty = document.querySelector(form.getAttribute("data-empty") || "");
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(typeSelect && typeSelect.value);
        var yearValue = normalize(yearSelect && yearSelect.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-desc")
          ].join(" "));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var visible = matchQuery && matchType && matchYear;
          card.classList.toggle("is-hidden-card", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }
      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-overlay");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;
      function attach() {
        if (attached || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function start() {
        attach();
        button.classList.add("is-hidden");
        video.controls = true;
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  onReady(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
