(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(q, r) { return (r || document).querySelector(q); }
  function $$(q, r) { return [].slice.call((r || document).querySelectorAll(q)); }
  var toast = $('.toast');
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  /* 1. skill percentages count up when each bar scrolls into view */
  var barIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var out = en.target.querySelector('.bar__top span:last-child');
      var target = parseInt(out.textContent, 10), t0 = null;
      barIO.unobserve(en.target);
      if (reduce) return;
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1300, 1);
        out.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + '%';
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.4 });
  $$('.bar').forEach(function (b) { b.querySelector('.bar__top span:last-child').textContent = '0%'; barIO.observe(b); });

  /* 2. skill chips: click a tool to highlight it, click again to clear */
  $$('.chips li').forEach(function (c) {
    c.tabIndex = 0; c.setAttribute('role', 'button');
    function pick() { c.classList.toggle('is-picked'); }
    c.addEventListener('click', pick);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });

  /* 3. decode effect on the hero eyebrow */
  var eb = $('.hero .eyebrow');
  if (eb && !reduce) {
    var finalText = eb.textContent, chars = '01<>/{}#*', f = 0;
    var iv = setInterval(function () {
      eb.textContent = finalText.split('').map(function (ch, i) {
        return ch === ' ' || i < f ? ch : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      f += 1.2;
      if (f >= finalText.length) { clearInterval(iv); eb.textContent = finalText; }
    }, 45);
  }

  /* 4. portfolio filter buttons show how many items they hold */
  $$('.filter').forEach(function (b) {
    var n = b.dataset.filter === 'all' ? $$('.work').length : $$('.work[data-cat="' + b.dataset.filter + '"]').length;
    b.innerHTML = b.textContent + ' <small>(' + n + ')</small>';
  });

  /* 5. stagger reveals inside grids so cards arrive one after another */
  if (!reduce) $$('.ads, .certs, .grid, .mood__grid').forEach(function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 90) + 'ms'; });
    g.addEventListener('mouseover', function (e) { var c = e.target.closest('.ad,.cert,.work'); if (c) c.style.transitionDelay = ''; });
  });

  /* 6. About Me video placeholder: friendly message on click */
  var slot = $('#videoSlot');
  if (slot && !slot.querySelector('video, iframe')) {
    slot.style.cursor = 'pointer';
    slot.addEventListener('click', function () { say('My About Me video is coming soon ✦'); });
  }

  /* 7. live local time in the contact list (Philippines) */
  var lt = $('#localTime');
  if (lt) {
    var fmt = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
    var tick = function () { lt.textContent = 'My local time: ' + fmt.format(new Date()); };
    tick(); setInterval(tick, 30000);
  }

  /* 8. contact form: validate each field as the visitor leaves it */
  $$('#contactForm [required]').forEach(function (f) {
    function bad() { return !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)); }
    f.addEventListener('blur', function () { f.classList.toggle('invalid', bad()); });
    f.addEventListener('input', function () { if (f.classList.contains('invalid') && !bad()) f.classList.remove('invalid'); });
  });

  /* 9. mobile menu closes on Escape or when tapping outside */
  var links = $('#navLinks'), tg = $('#navToggle');
  function closeMenu() { links.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#nav')) closeMenu(); });

  /* 10. press "t" to jump to the top, "c" to jump to contact */
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 't') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (k === 'c') $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
})();
