(function () {
  function preparePlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    if (!video || !cover) {
      return;
    }
    var source = video.getAttribute('data-src');
    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      loadSource();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-player').forEach(preparePlayer);
  });
})();
