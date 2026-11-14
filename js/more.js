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

  /* 12. never stay scrolled sideways: keeps the page centred */
  function noSide() { if (window.scrollX) window.scrollTo(0, window.scrollY); }
  window.addEventListener('scroll', noSide, { passive: true });
  window.addEventListener('load', noSide);


  /* 13. skills: badges, counts, filter tabs, tap-to-flip on touch */
  (function () {
    var layout = $('.skills-two-column-layout');
    if (!layout) return;
    var BADGE = { 'C': 'C', 'C++': 'C++', 'Java': 'JV', 'Python': 'PY', 'Dart': 'DT', 'PHP': 'PHP', 'JavaScript': 'JS', 'Assembly (ASM)': 'ASM',
      'Canva': 'CV', 'Figma': 'FG', 'UI / UX Prototyping': 'UX', 'Promo Ads': 'AD', 'Social Media Kits': 'SM',
      'Network Concepts': 'NET', 'TCP/IP & Routing': 'IP', 'LAN / WAN Setup': 'LAN', 'Databases & MySQL': 'SQL', 'System Integration': 'SYS',
      'HTML5 / CSS3': '</>', 'Git & GitHub': 'GIT', 'VS Code': 'VS', 'XAMPP': 'XP' };
    var touch = !window.matchMedia('(hover: hover)').matches, n = 0;
    $$('.skill-card').forEach(function (card, i) {
      var f = $('.card-front', card), name = f.textContent.trim();
      f.innerHTML = '<span class="sk-badge">' + (BADGE[name] || name.slice(0, 2).toUpperCase()).replace(/</g, '&lt;') + '</span><span class="sk-name"></span>';
      $('.sk-name', f).textContent = name;
      card.style.setProperty('--i', i % 8);
      card.tabIndex = 0;
      function flip() { card.classList.toggle('is-flipped'); }
      if (touch) card.addEventListener('click', flip);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      n++;
    });
    var groups = $$('.skill-group', layout);
    groups.forEach(function (g) {
      var t = $('.skill-category-title', g), c = $$('.skill-card', g).length;
      t.insertAdjacentHTML('beforeend', ' <small class="sk-count">' + c + '</small>');
      var b = $('.skill-filter[data-skill="' + g.dataset.group + '"]');
      if (b) b.insertAdjacentHTML('beforeend', ' <small>' + c + '</small>');
    });
    var all = $('.skill-filter[data-skill="all"]'); if (all) all.insertAdjacentHTML('beforeend', ' <small>' + n + '</small>');
    var st = $('#skillStats');
    if (st) st.innerHTML = '<span><b>' + groups.length + '</b> categories</span><span><b>' + n + '</b> skills &amp; tools</span>';
    $$('.skill-filter').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.skill;
        $$('.skill-filter').forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        groups.forEach(function (g) { g.classList.toggle('is-hidden', k !== 'all' && g.dataset.group !== k); });
        layout.classList.toggle('is-single', k !== 'all');
        $$('.skill-card.is-flipped').forEach(function (c) { c.classList.remove('is-flipped'); });
      });
    });
  })();

})();