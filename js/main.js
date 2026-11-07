(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* year */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* mobile nav */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  function closeNav() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeNav(); });

  /* active link on scroll */
  var navAnchors = [].slice.call(links.querySelectorAll('a[href^="#"]'));
  var sections = navAnchors.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function setActive() {
    var y = window.scrollY + 120, cur = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    navAnchors.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* reveal + skill bars + counters */
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null;
    if (reduce) { el.textContent = target + suffix; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      en.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* typed text */
  var words = ['brand identities', 'responsive websites', 'promo ads', 'social media kits'];
  var typed = document.getElementById('typed');
  if (reduce) {
    typed.textContent = words[0];
  } else {
    var w = 0, c = 0, del = false;
    (function tick() {
      var word = words[w];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1500); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 40 : 85);
    })();
  }

  /* code rain */
  var cv = document.getElementById('codeRain');
  var ctx = cv.getContext('2d');
  var cols, drops, size = 16;
  function sizeCanvas() {
    cv.width = cv.offsetWidth;
    cv.height = cv.offsetHeight;
    cols = Math.ceil(cv.width / size);
    drops = [];
    for (var i = 0; i < cols; i++) drops.push(Math.random() * -50);
  }
  function rain() {
    ctx.fillStyle = 'rgba(8,20,10,0.12)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = size + 'px monospace';
    for (var i = 0; i < cols; i++) {
      var ch = Math.random() > .5 ? '1' : '0';
      ctx.fillStyle = Math.random() > .96 ? '#fdab12' : '#6dff2a';
      ctx.fillText(ch, i * size, drops[i] * size);
      if (drops[i] * size > cv.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  if (!reduce) {
    var last = 0, visible = true;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
    (function loop(t) {
      if (visible && t - last > 60) { rain(); last = t; }
      requestAnimationFrame(loop);
    })(0);
  }

  /* portfolio filter */
  var filters = document.querySelectorAll('.filter');
  var works = document.querySelectorAll('.work');
  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.toggle('is-active', x === b); });
      var f = b.dataset.filter;
      works.forEach(function (w) { w.classList.toggle('is-hidden', f !== 'all' && w.dataset.cat !== f); });
      /* show/hide the two big columns to match the filter */
      var gCol = document.querySelector('.graphics-col'), sCol = document.querySelector('.systems-col'),
          wrap = document.querySelector('.portfolio-main-container');
      if (gCol) gCol.hidden = f === 'software';
      if (sCol) sCol.hidden = f === 'design';
      if (wrap) wrap.classList.toggle('is-single', f !== 'all');
    });
  });

/* lightbox: design pieces = big image + caption; systems = image + details */
var lb = document.getElementById('lightbox');
var lbCard = document.getElementById('lbCard');
var lbMedia = lbCard.querySelector('.lightbox__media');
var lbImg = document.getElementById('lbImg');
var lbCap = document.getElementById('lbCap');
var lbCat = document.getElementById('lbCat');
var lbDesc = document.getElementById('lbDesc');
var lbStack = document.getElementById('lbStack');
var lbLink = document.getElementById('lbLink');

window.currentGalleryImages = [];
window.currentGalleryIndex = 0;

lbImg.addEventListener('error', function () {
  lbMedia.classList.add('is-broken');
  lbMedia.setAttribute('data-missing', 'Image not found: ' + (lbImg.getAttribute('src') || ''));
});
lbImg.addEventListener('load', function () { lbMedia.classList.remove('is-broken'); });

function clearGame() {
  var g = lbMedia.querySelector('.lb-game'), pb = lbMedia.querySelector('.lb-play'), ld = lbMedia.querySelector('.lb-loading');
  if (g) g.remove();
  if (ld) ld.remove();
  if (pb) pb.remove();
  lbCard.classList.remove('is-playing');
}

window.renderPortfolioLightbox = function (b) {
  clearGame();
  var work = b.closest('.work');
  var cat = work ? (work.dataset.cat || 'project') : 'project';
  var isDesign = cat === 'design';

  lbCard.classList.toggle('is-design', isDesign);
  lbCap.textContent = b.dataset.cap || '';

  if (lbCat) lbCat.textContent = isDesign ? 'Design' : (work && work.dataset.kind === 'game' ? 'Game' : 'Software');
  if (lbDesc) lbDesc.textContent = b.dataset.desc || '';
  if (lbStack) {
    lbStack.innerHTML = (b.dataset.stack || '').split(',')
      .map(function (s) { return s.trim(); }).filter(Boolean)
      .map(function (s) { return '<span>' + s + '</span>'; }).join('');
  }
  if (lbLink) {
    var url = (b.dataset.link || '').trim();
    lbLink.style.display = url ? 'inline-block' : 'none';
    if (url) lbLink.href = url;
  }

  /* playable games: show a Play button that loads the game inside the lightbox */
  var play = (b.dataset.play || '').trim();
  lbCard.classList.toggle('is-game', !!play);
  if (lbLink) lbLink.textContent = play ? 'Open full screen \u2197' : 'View on GitHub \u2197';
  if (play) {
    var pb = document.createElement('button');
    pb.type = 'button';
    pb.className = 'lb-play';
    pb.innerHTML = '<span>\u25B6</span> PRESS START';
    pb.addEventListener('click', function (e) {
      e.stopPropagation();
      var f = document.createElement('iframe');
      f.className = 'lb-game';
      f.src = play;
      f.title = (b.dataset.cap || 'Game') + ' (playable)';
      f.setAttribute('allow', 'fullscreen; autoplay; gamepad; accelerometer; gyroscope; clipboard-write');
      f.setAttribute('allowfullscreen', '');
      var ld = document.createElement('div');
      ld.className = 'lb-loading';
      ld.textContent = 'LOADING...';
      f.addEventListener('load', function () { ld.remove(); });
      lbMedia.appendChild(f);
      lbMedia.appendChild(ld);
      lbCard.classList.add('is-playing');
      f.focus();
    });
    lbMedia.appendChild(pb);
  }

  var raw = b.dataset.imgs || b.dataset.full || '';
  window.currentGalleryImages = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  window.currentGalleryIndex = 0;
  lbMedia.classList.remove('is-broken');
  lbImg.alt = b.dataset.cap || '';
  if (window.currentGalleryImages.length) lbImg.src = window.currentGalleryImages[0];
};

function closeLb() { clearGame(); lb.hidden = true; document.body.style.overflow = ''; }
works.forEach(function (w) {
  w.querySelector('button').addEventListener('click', function (e) {
    window.renderPortfolioLightbox(e.currentTarget);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  });
});
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.id === 'lbClose') closeLb();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* contact form -> opens the visitor's mail app (no backend needed) */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var mailLink = document.querySelector('.contact__list a[href^="mailto:"]');
  var TO = mailLink ? mailLink.getAttribute('href').replace('mailto:', '') : ''; // edit the email once, in index.html
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { status.style.color = '#ff9b9b'; status.textContent = 'Please fill in your name, a valid email and a message.'; return; }
    var d = new FormData(form);
    var subject = encodeURIComponent('Mikrokosmos inquiry: ' + d.get('topic'));
    var body = encodeURIComponent('Hi, I\'m ' + d.get('name') + ' (' + d.get('email') + ').\n\n' + d.get('message'));
    status.style.color = '';
    status.textContent = 'Opening your email app… thank you!';
    window.location.href = 'mailto:' + TO + '?subject=' + subject + '&body=' + body;
    form.reset();
  });
})();