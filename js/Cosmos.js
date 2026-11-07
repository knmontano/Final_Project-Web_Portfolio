(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function mk(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }

  /* 1. boot screen (first visit per session) */
  var seen = false; try { seen = sessionStorage.getItem('mk-boot'); sessionStorage.setItem('mk-boot', '1'); } catch (e) {}
  if (!seen && !reduce) {
    var boot = mk('div', 'boot', '<div>&gt; booting <b>mikrokosmos</b>...</div><div>&gt; loading designs ✓</div><div>&gt; loading systems ✓</div><div>&gt; <b>you never walk alone</b> ✦</div><div class="boot__bar"><i></i></div><small>click to skip</small>');
    document.body.appendChild(boot);
    requestAnimationFrame(function () { boot.querySelector('i').style.width = '100%'; });
    var out = function () { boot.classList.add('is-out'); setTimeout(function () { boot.remove(); }, 700); };
    boot.addEventListener('click', out); setTimeout(out, 2100);
  }

  /* 2. constellation background */
  if (!reduce) {
    var cv = mk('canvas', 'cosmos-bg'); document.body.appendChild(cv);
    var c = cv.getContext('2d'), P = [], mx = -999, my = -999, cols = ['#f67c9e', '#fdab12', '#6dff2a', '#8d7bff'];
    function size() {
      cv.width = innerWidth; cv.height = innerHeight; P = [];
      var n = Math.min(70, Math.round(innerWidth * innerHeight / 18000));
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, c: cols[i % 4] });
    }
    size(); addEventListener('resize', size);
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    var dk = ['#5547ac', '#c2185b', '#2d5a16', '#b45f06'], lights = document.querySelectorAll('.section:not(.section--dark)');
    (function draw() {
      if (!document.hidden) {
        var L = [].map.call(lights, function (el) { return el.getBoundingClientRect(); });
        var onLight = function (y) { for (var k = 0; k < L.length; k++) if (L[k].top <= y && L[k].bottom >= y) return true; return false; };
        c.clearRect(0, 0, cv.width, cv.height);
        for (var i = 0; i < P.length; i++) {
          var a = P[i]; a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > cv.width) a.vx *= -1; if (a.y < 0 || a.y > cv.height) a.vy *= -1;
          var la = onLight(a.y);
          c.globalAlpha = la ? .95 : .6; c.fillStyle = la ? dk[i % 4] : a.c;
          c.beginPath(); c.arc(a.x, a.y, la ? 2.8 : 2, 0, 6.3); c.fill();
          for (var j = i + 1; j < P.length; j++) {
            var b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 120) {
              var lm = onLight((a.y + b.y) / 2), f = 1 - d / 120;
              c.globalAlpha = lm ? .85 * f : .5 * f; c.strokeStyle = lm ? '#5547ac' : '#f67c9e';
              c.lineWidth = lm ? 1.3 : 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
            }
          }
          var dm = Math.hypot(a.x - mx, a.y - my);
          if (dm < 160) { c.globalAlpha = (1 - dm / 160) * .9; c.strokeStyle = onLight(a.y) ? '#c2185b' : '#fdab12'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(mx, my); c.stroke(); }
        }
        c.globalAlpha = 1;
      }
      requestAnimationFrame(draw);
    })();
  }

  /* 4. numbered section labels */
  ['about', 'services', 'skills', 'certifications', 'portfolio', 'contact'].forEach(function (id, i) {
    var eb = document.querySelector('#' + id + ' .eyebrow'); if (eb) eb.setAttribute('data-n', '0' + (i + 1));
  });

  /* 5. skills ticker under the hero */
  var hero = document.getElementById('home');
  if (hero) {
    var items = ['Brand Identity', 'UI / UX', 'Web Development', 'Python', 'Promo Ads', 'PHP + MySQL', 'Social Media Kits', 'Games', 'Figma', 'Dart', 'Canva', 'Git'];
    var html = items.concat(items).map(function (t) { return '<span>✦ ' + t + '</span>'; }).join('');
    var tk = mk('div', 'ticker', '<div class="ticker__track">' + html + '</div>');
    hero.parentNode.insertBefore(tk, hero.nextSibling);
  }


  /* 7. skill HUD: "unlocked" counters */
  var st = document.getElementById('skillStats');
  if (st) {
    var nums = st.querySelectorAll('b');
    if (nums.length === 2) st.innerHTML = '<span><b>' + nums[1].textContent + '</b> skills unlocked \u2726</span><span><b>' + nums[0].textContent + '</b> classes</span>';
  }

  /* 8. achievements: pixel toasts + explored counter as you scroll */
  var ach = [['home', 'Welcome, traveler'], ['about', 'Met Kezzia'], ['services', 'Checked the services'], ['skills', 'Inspected the toolbox'], ['certifications', 'Viewed the certificates'], ['portfolio', 'Browsed the portfolio'], ['contact', 'Reached the contact desk']];
  var got = {}, count = 0, queue = [], showing = false;
  var hud = mk('div', 'hud', ''), tz = mk('div', 'ach', '');
  document.body.appendChild(hud); document.body.appendChild(tz);
  function hudUp() { hud.innerHTML = '\u2726 EXPLORED <b>' + count + '/' + ach.length + '</b>'; }
  hudUp();
  function next() {
    if (showing || !queue.length) return;
    showing = true; tz.innerHTML = '<small>\uD83C\uDFC6 ACHIEVEMENT UNLOCKED</small>' + queue.shift(); tz.classList.add('show');
    setTimeout(function () { tz.classList.remove('show'); setTimeout(function () { showing = false; next(); }, 450); }, 2600);
  }
  var aio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.id; if (got[id]) return; got[id] = 1; count++; hudUp();
      var t = ach.filter(function (x) { return x[0] === id; })[0][1];
      queue.push(t); if (count === ach.length) queue.push('100% explored \u2726 You never walk alone'); next();
    });
  }, { threshold: 0.3 });
  ach.forEach(function (x) { var s = document.getElementById(x[0]); if (s) aio.observe(s); });

  /* 9. heading decode effect when a section title scrolls in */
  if (!reduce) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; hio.unobserve(e.target);
        var h = e.target, fin = h.textContent, n = 0, ch = '01<>/{}#*';
        var iv = setInterval(function () {
          h.textContent = fin.split('').map(function (x, i) { return x === ' ' || i < n ? x : ch[Math.floor(Math.random() * ch.length)]; }).join('');
          n += 1.2; if (n >= fin.length) { clearInterval(iv); h.textContent = fin; }
        }, 40);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.section h2').forEach(function (h) { if (!h.children.length) hio.observe(h); });
  }

  /* 10. magnetic buttons */
  if (fine && !reduce) document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left) / r.width - .5) * 10 + 'px ' + ((e.clientY - r.top) / r.height - .5) * 8 + 'px';
    });
    b.addEventListener('mouseleave', function () { b.style.translate = ''; });
  });
})();