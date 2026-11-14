(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; document.body.appendChild(e); return e; }

  /* 1. scroll progress bar + back-to-top + hide nav on scroll down */
  var bar = el('div', 'progress');
  var top = el('button', 'totop', '&#8593;');
  top.setAttribute('aria-label', 'Back to top');
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  var nav = document.getElementById('nav'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    top.classList.toggle('show', y > 600);
    var open = document.getElementById('navLinks').classList.contains('is-open');
    nav.classList.toggle('nav--hide', y > lastY && y > 300 && !open);
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* 3. 3D tilt on cards + hero icon parallax */
  if (fine && !reduce) {
    document.querySelectorAll('.ad, .cert, .work, .service-card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(700px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) translateY(-6px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
    var icon = document.querySelector('.hero__icon');
    if (icon) document.querySelector('.hero').addEventListener('mousemove', function (e) {
      var x = (e.clientX / innerWidth - .5) * 24, y = (e.clientY / innerHeight - .5) * 24;
      icon.style.translate = x + 'px ' + y + 'px';
    });
  }

  /* 4. lightbox prev / next (buttons, arrow keys, swipe) */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  var prev = document.createElement('button'), next = document.createElement('button');
  prev.className = 'lightbox__nav lightbox__nav--prev'; prev.innerHTML = '&#8249;'; prev.setAttribute('aria-label', 'Previous');
  next.className = 'lightbox__nav lightbox__nav--next'; next.innerHTML = '&#8250;'; next.setAttribute('aria-label', 'Next');
  lb.appendChild(prev); lb.appendChild(next);
  var cur = 0;
  function visibleBtns() { return [].slice.call(document.querySelectorAll('.work:not(.is-hidden) button')); }
  function show(i) {
    var list = visibleBtns(); if (!list.length) return;
    cur = (i + list.length) % list.length;
    if (window.renderPortfolioLightbox) {
      window.renderPortfolioLightbox(list[cur], '  (' + (cur + 1) + '/' + list.length + ')');
    } else {
      lbImg.src = list[cur].dataset.full;
      lbImg.alt = list[cur].dataset.cap;
      lbCap.textContent = list[cur].dataset.cap + '  (' + (cur + 1) + '/' + list.length + ')';
    }
  }
  document.querySelectorAll('.work button').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(function () { show(visibleBtns().indexOf(b)); }, 0); });
  });
  prev.addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  next.addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });

  /* 5. copy email on click + toast */
  var toast = el('div', 'toast');
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('show'); }, 2000); }
  var mail = document.querySelector('.contact__list a[href^="mailto:"]');
  if (mail && navigator.clipboard) {
    mail.title = 'Click to copy';
    mail.addEventListener('click', function (e) {
      e.preventDefault();
      navigator.clipboard.writeText(mail.textContent).then(function () { say('Email copied ✦'); }, function () { window.location.href = mail.href; });
    });
  }

  /* 6. message character counter + remember draft (per visitor) */
  var ta = document.querySelector('#contactForm textarea');
  if (ta) {
    ta.maxLength = 600;
    var cnt = document.createElement('small'); cnt.className = 'counter'; ta.parentNode.appendChild(cnt);
    try { var d = localStorage.getItem('mk-draft'); if (d) ta.value = d; } catch (e) {}
    var upd = function () { cnt.textContent = ta.value.length + ' / 600'; try { localStorage.setItem('mk-draft', ta.value); } catch (e) {} };
    ta.addEventListener('input', upd); upd();
    document.getElementById('contactForm').addEventListener('submit', function () { try { localStorage.removeItem('mk-draft'); } catch (e) {} });
  }

  /* 7. ad cards: "Get this" pre-selects the package in the form */
  var sel = document.querySelector('#contactForm select');
  document.querySelectorAll('.ad').forEach(function (ad) {
    var b = ad.querySelector('.ad__btn');
    b.addEventListener('click', function () {
      var t = ad.querySelector('h4').textContent.trim();
      [].forEach.call(sel.options, function (o) { if (o.text === t) sel.value = o.value || o.text; });
      say('Selected: ' + t);
    });
  });

  /* 8. confetti when the form is sent */
  document.getElementById('contactForm').addEventListener('submit', function () {
    if (reduce || document.querySelector('#contactForm .invalid')) return;
    for (var i = 0; i < 26; i++) {
      var c = document.createElement('i'); c.className = 'confetti';
      c.style.left = (40 + Math.random() * 20) + '%';
      c.style.background = ['#f67c9e', '#fdab12', '#6dff2a', '#5547ac'][i % 4];
      c.style.setProperty('--dx', (Math.random() * 600 - 300) + 'px');
      c.style.setProperty('--dy', (Math.random() * -400 - 100) + 'px');
      document.body.appendChild(c);
      setTimeout(function (x) { x.remove(); }.bind(null, c), 1400);
    }
  });

  /* 9. Konami-style easter egg: type "kosmos" to make the page sparkle */
  var buf = '';
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input,textarea,select')) return;
    buf = (buf + e.key.toLowerCase()).slice(-6);
    if (buf === 'kosmos') { document.body.classList.toggle('party'); say('✦ You never walk alone ✦'); }
  });

/* =================================================_ */
/* Extras JavaScript File                             */
/* =================================================_ */

// Other auxiliary features can live here...

/* About Me video: pause, reset time, and restore poster/badge on mouseleave or pause */
var videoContainer = document.getElementById('videoBox');
var promoVideo = document.getElementById('promoVideo');
var videoBadge = document.getElementById('videoBadge');

if (videoContainer && promoVideo && videoBadge) {
  // Kapag iniwan ng mouse (mouseleave)
  videoContainer.addEventListener('mouseleave', function() {
    if (!promoVideo.paused) {
      promoVideo.pause();
      promoVideo.currentTime = 0;
      promoVideo.load();
      videoBadge.style.opacity = '1';
      videoBadge.style.pointerEvents = 'auto';
    }
  });

  // Kapag pinindot ang pause button sa video controls
  promoVideo.addEventListener('pause', function() {
    // Hangga't hindi ito umabot sa dulo ng kusa, kapag pinindot ang pause ay babalik sa umpisa at poster
    if (!promoVideo.ended) {
      promoVideo.currentTime = 0;
      promoVideo.load();
      videoBadge.style.opacity = '1';
      videoBadge.style.pointerEvents = 'auto';
    }
  });
}
})();