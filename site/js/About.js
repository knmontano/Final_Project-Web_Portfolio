(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mascot = document.getElementById('mascotVideo');

  /* About Me video: YouTube loads on click; pausing, ending or un-hovering
     returns it to the unplayed state (poster + play badge) */
  var slot = document.getElementById('promoFrameSlot');
  var badge = document.getElementById('videoBadge');
  var box = document.getElementById('videoBox');
  if (slot && badge && box) {
    var player = null, apiReady = null, pauseTimer = null, playing = false;

    var loadApi = function () {
      if (apiReady) return apiReady;
      apiReady = new Promise(function (resolve) {
        if (window.YT && YT.Player) return resolve();
        var prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () { if (prev) prev(); resolve(); };
        var s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      });
      return apiReady;
    };

    var reset = function () {
      clearTimeout(pauseTimer);
      playing = false;
      if (player && player.destroy) { try { player.destroy(); } catch (e) {} }
      player = null;
      slot.innerHTML = '';
      var label = badge.querySelector('small'); if (label) label.textContent = 'Click to play';
      badge.style.opacity = '1'; badge.style.pointerEvents = 'auto';
    };

    var start = function () {
      badge.style.opacity = '0'; badge.style.pointerEvents = 'none';
      if (player) return;
      var mount = document.createElement('div');
      slot.appendChild(mount);
      loadApi().then(function () {
        player = new YT.Player(mount, {
          videoId: slot.dataset.yt,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
          events: {
            onReady: function (e) { e.target.playVideo(); },
            onStateChange: function (e) {
              clearTimeout(pauseTimer);
              if (e.data === 1) playing = true;                       /* playing */
              else if (e.data === 0) reset();                         /* ended   */
              else if (e.data === 2 && playing) {                     /* paused (short delay ignores scrubbing) */
                pauseTimer = setTimeout(function () {
                  if (player && player.getPlayerState && player.getPlayerState() === 2) reset();
                }, 350);
              }
            }
          }
        });
      });
    };

    badge.addEventListener('click', start);
    badge.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); }
    });

    /* un-hover: reset, unless the video went fullscreen */
    box.addEventListener('mouseleave', function () {
      setTimeout(function () {
        if (document.fullscreenElement || document.webkitFullscreenElement) return;
        if (player) reset();
      }, 200);
    });
  }

  /* Mascot: only animate while on screen; respect reduced motion; hide if it can't load */
  if (mascot) {
    var box = mascot.closest('.mascot');
    mascot.addEventListener('error', function () { if (box) box.style.display = 'none'; });
    if (reduce) { mascot.removeAttribute('autoplay'); mascot.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { var p = mascot.play(); if (p && p.catch) p.catch(function () {}); }
        else mascot.pause();
      }, { threshold: 0.1 }).observe(mascot);
    }
  }
})();