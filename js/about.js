(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mascot = document.getElementById('mascotVideo');

  /* 1. Promo Video (YouTube API): Play on click, reset to poster + badge on pause, end, or mouseleave */
  var slot = document.getElementById('promoFrameSlot');
  var badge = document.getElementById('videoBadge');
  var poster = document.getElementById('videoPoster');
  var box = document.getElementById('videoBox');

  if (slot && badge && box) {
    var player = null, apiReady = null, pauseTimer = null, playing = false;

    var loadApi = function () {
      if (apiReady) return apiReady;
      apiReady = new Promise(function (resolve) {
        if (window.YT && window.YT.Player) return resolve();
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
      if (poster) poster.style.opacity = '1';
      badge.style.opacity = '1';
      badge.style.pointerEvents = 'auto';
    };

    var start = function () {
      badge.style.opacity = '0';
      badge.style.pointerEvents = 'none';
      if (player) return;

      var mount = document.createElement('div');
      mount.style.width = '100%';
      mount.style.height = '100%';
      slot.appendChild(mount);

      loadApi().then(function () {
        player = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          videoId: slot.dataset.yt || '4SBye4MU9kI',
          playerVars: {
            autoplay: 1,
            rel: 0,
            playsinline: 1,
            modestbranding: 1,
            origin: window.location.origin
          },
          events: {
            onReady: function (e) {
              e.target.playVideo();
              setTimeout(function () {
                if (poster) poster.style.opacity = '0';
              }, 300);
            },
            onStateChange: function (e) {
              clearTimeout(pauseTimer);
              if (e.data === 1) { /* Playing */
                playing = true;
                if (poster) poster.style.opacity = '0';
              } else if (e.data === 0) { /* Ended */
                reset();
              } else if (e.data === 2 && playing) { /* Paused */
                pauseTimer = setTimeout(function () {
                  if (player && player.getPlayerState && player.getPlayerState() === 2) reset();
                }, 250);
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

    /* Kapag umalis ang mouse sa video box (un-hover), babalik sa unplayed mode */
    box.addEventListener('mouseleave', function () {
      setTimeout(function () {
        if (document.fullscreenElement || document.webkitFullscreenElement) return;
        if (player) reset();
      }, 200);
    });
  }

  /* 2. Mascot seamless loop: dalawang video buffer na nagpapalitan para walang black flash */
  if (mascot) {
    var mBox = mascot.closest('.mascot');
    function hideMascot() {
      if (mBox) mBox.style.display = 'none';
      var st = document.querySelector('.about2__stage');
      if (st) st.classList.add('no-mascot');
    }
    mascot.addEventListener('error', hideMascot);
    if (mascot.error || mascot.networkState === 3) hideMascot();

    if (mascot) {
      var mBox = mascot.closest('.mascot');
      function hideMascot() {
        if (mBox) mBox.style.display = 'none';
        var st = document.querySelector('.about2__stage');
        if (st) st.classList.add('no-mascot');
      }
      mascot.addEventListener('error', hideMascot);
      if (mascot.error || mascot.networkState === 3) hideMascot();
  
      if (reduce) {
        mascot.removeAttribute('autoplay');
        mascot.pause();
      } else {
        // High-precision loop reset to avoid browser decoder flash
        function preciseLoop() {
          if (mascot.duration && mascot.currentTime >= mascot.duration - 0.12) {
            mascot.currentTime = 0;
          }
          requestAnimationFrame(preciseLoop);
        }
        requestAnimationFrame(preciseLoop);
  
        // Intersection Observer to pause when off-screen
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (en) {
            if (en[0].isIntersecting) {
              var p = mascot.play();
              if (p && p.catch) p.catch(function () {});
            } else {
              mascot.pause();
            }
          }, { threshold: 0.1 }).observe(mascot);
        }
      }
    }
  }
})();