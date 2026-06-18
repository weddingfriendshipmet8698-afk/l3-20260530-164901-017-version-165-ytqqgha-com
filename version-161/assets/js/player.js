(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupPlayer() {
    var video = document.querySelector('video[data-hls-src]');
    if (!video) {
      return;
    }

    var frame = video.closest('.player-frame');
    var button = frame ? frame.querySelector('[data-play-button]') : null;
    var source = video.getAttribute('data-hls-src');
    var hlsInstance = null;

    function attachSource() {
      if (!source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function playVideo() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (frame) {
        frame.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (frame && video.currentTime === 0) {
        frame.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      if (frame) {
        frame.classList.remove('is-playing');
      }
    });

    attachSource();

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(setupPlayer);
})();
