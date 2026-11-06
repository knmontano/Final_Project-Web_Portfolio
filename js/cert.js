/* Certificates: filter tabs + full viewer (zoom, download, thumbnails, arrows, swipe, Esc) */
(function () {
    'use strict';
    var cards = [].slice.call(document.querySelectorAll('.cert2'));
    if (!cards.length) return;
  
    /* ---------- filter tabs ---------- */
    var tabs = [].slice.call(document.querySelectorAll('.cfilter'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var f = t.dataset.f;
        tabs.forEach(function (x) {
          var on = x === t;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-selected', on);
        });
        cards.forEach(function (c) {
          var hide = f !== 'all' && c.dataset.cat !== f;
          c.classList.toggle('is-hidden', hide);
          if (!hide) c.classList.add('is-in');
        });
      });
    });
  
    /* ---------- viewer ---------- */
    function visible() { return cards.filter(function (c) { return !c.classList.contains('is-hidden'); }); }
    function srcOf(c) { return c.querySelector('.cert2__img img').getAttribute('src'); }
    function capOf(c) { var b = c.querySelector('.cert2__img'); return b.dataset.cap || c.querySelector('h4').textContent; }
  
    var view = document.createElement('div');
    view.className = 'cview';
    view.hidden = true;
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-label', 'Certificate viewer');
    view.innerHTML =
      '<div class="cview__bar">' +
        '<span class="cview__title"></span>' +
        '<button class="cview__btn cview__zoom" aria-label="Zoom">&#128269;&#xFE0E; <span>Zoom</span></button>' +
        '<a class="cview__btn cview__dl" download aria-label="Download">&#11015;&#xFE0E; <span>Download</span></a>' +
        '<button class="cview__btn cview__close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<button class="cview__nav cview__nav--prev" aria-label="Previous certificate">&#8249;</button>' +
      '<div class="cview__stage"><img class="cview__img" alt=""></div>' +
      '<button class="cview__nav cview__nav--next" aria-label="Next certificate">&#8250;</button>' +
      '<div class="cview__thumbs"></div>';
    document.body.appendChild(view);
  
    var stage = view.querySelector('.cview__stage');
    var img = view.querySelector('.cview__img');
    var title = view.querySelector('.cview__title');
    var dl = view.querySelector('.cview__dl');
    var thumbs = view.querySelector('.cview__thumbs');
    var list = [], cur = 0, lastFocus = null;
  
    function zoom(on) {
        var z = on === undefined ? !stage.classList.contains('is-zoom') : on;
        stage.classList.toggle('is-zoom', z);
        if (!z) { stage.scrollTop = 0; stage.scrollLeft = 0; }
      }
    function build() {
      list = visible();
      thumbs.innerHTML = '';
      list.forEach(function (c, i) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', capOf(c));
        b.innerHTML = '<img alt="" src="' + srcOf(c) + '">';
        b.addEventListener('click', function () { show(i); });
        thumbs.appendChild(b);
      });
    }
    function show(i) {
      cur = (i + list.length) % list.length;
      var c = list[cur];
      zoom(false);
      img.src = srcOf(c);
      img.alt = capOf(c);
      title.textContent = capOf(c) + '  (' + (cur + 1) + '/' + list.length + ')';
      dl.href = srcOf(c);
      dl.setAttribute('download', capOf(c).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') + '.jpg');
      [].forEach.call(thumbs.children, function (t, k) { t.classList.toggle('is-on', k === cur); });
      var on = thumbs.children[cur];
      if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
      view.querySelector('.cview__nav--prev').style.display = view.querySelector('.cview__nav--next').style.display = list.length > 1 ? '' : 'none';
    }
    function open(card) {
      lastFocus = document.activeElement;
      build();
      view.hidden = false;
      document.body.style.overflow = 'hidden';
      show(Math.max(0, list.indexOf(card)));
      view.querySelector('.cview__close').focus();
    }
    function close() {
      view.hidden = true;
      zoom(false);
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  
    cards.forEach(function (c) {
      c.querySelector('.cert2__img').addEventListener('click', function () { open(c); });
      var v = c.querySelector('.cert2__view');
      if (v) v.addEventListener('click', function () { open(c); });
    });
    view.querySelector('.cview__close').addEventListener('click', close);
    view.querySelector('.cview__zoom').addEventListener('click', function () { zoom(); });
    img.addEventListener('click', function () { zoom(); });
    view.querySelector('.cview__nav--prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    view.querySelector('.cview__nav--next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    stage.addEventListener('click', function (e) { if (e.target === stage && !stage.classList.contains('is-zoom')) close(); });
    document.addEventListener('keydown', function (e) {
      if (view.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'z' || e.key === 'Z' || e.key === '+') zoom();
    });
    var sx = 0;
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
        if (stage.classList.contains('is-zoom')) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      });
  })();