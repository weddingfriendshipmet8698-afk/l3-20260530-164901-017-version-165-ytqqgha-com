(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            show(current + 1);
          }, 5200);
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var empty = scope.querySelector("[data-empty-result]");

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var typeValue = normalize(type ? type.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var queryMatch = !query || text.indexOf(query) !== -1;
          var yearMatch = !yearValue || cardYear === yearValue;
          var typeMatch = !typeValue || cardType === typeValue;
          var match = queryMatch && yearMatch && typeMatch;
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
