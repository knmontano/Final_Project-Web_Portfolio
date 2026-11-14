(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function star5(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (var k = 0; k < 10; k++) {
      var rr = k % 2 ? r * .45 : r, an = rot - Math.PI / 2 + k * Math.PI / 5;
      ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr);
    }
    ctx.closePath();
  }
  function mk(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }

  /* 1. boot screen: markup lives in index.html so it covers the page from the first paint */
  var root = document.documentElement, boot = document.getElementById('boot');
  if (boot && root.classList.contains('is-booting')) {
    try { sessionStorage.setItem('mk-boot', '1'); } catch (e) {}
    var done = false;
    var out = function () {
      if (done) return; done = true;
      boot.classList.add('is-out'); root.classList.remove('is-booting');
      setTimeout(function () { boot.remove(); }, 700);
    };
    requestAnimationFrame(function () { requestAnimationFrame(function () { boot.querySelector('i').style.width = '100%'; }); });
    boot.addEventListener('click', out);
    document.addEventListener('keydown', out, { once: true });
    setTimeout(out, 2100);
  } else if (boot) { boot.remove(); }

  /* 2. constellation background */
  if (!reduce) {
    var cv = mk('canvas', 'cosmos-bg'); document.body.appendChild(cv);
    var W = innerWidth, H = innerHeight, c = cv.getContext('2d'), P = [], mx = -999, my = -999, cols = ['#f67c9e', '#fdab12', '#6dff2a', '#8d7bff'];
    function size() {
      W = innerWidth; H = innerHeight; var dr = Math.min(window.devicePixelRatio || 1, 2); cv.width = W * dr; cv.height = H * dr; c.setTransform(dr, 0, 0, dr, 0, 0); P = [];
      var n = Math.min(70, Math.max(26, Math.round(innerWidth * innerHeight / 18000)));
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, c: cols[i % 4], ph: Math.random() * 6.3, rot: Math.random() * 6.3, vr: (Math.random() - .5) * .02 });
    }
    size(); var lastW = innerWidth;
    addEventListener('resize', function () {
      if (innerWidth !== lastW) { lastW = innerWidth; size(); }  /* real resize / rotate: rebuild */
      else { /* phone URL bar showing/hiding: just refit, keep the stars */
        var keep = P; size(); P = keep; }
    });
    addEventListener('touchstart', function (e) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', function (e) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchend', function () { mx = -999; my = -999; }, { passive: true });
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    var dk = ['#5547ac', '#c2185b', '#2d5a16', '#b45f06'], lights = document.querySelectorAll('.section:not(.section--dark)');
    (function draw() {
      if (!document.hidden) {
        var L = [].map.call(lights, function (el) { return el.getBoundingClientRect(); });
        var onLight = function (y) { for (var k = 0; k < L.length; k++) if (L[k].top <= y && L[k].bottom >= y) return true; return false; };
        c.clearRect(0, 0, W, H);
        for (var i = 0; i < P.length; i++) {
          var a = P[i]; a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
          var la = onLight(a.y);
          c.globalAlpha = la ? .95 : .6; c.fillStyle = la ? dk[i % 4] : a.c;
          a.rot += a.vr; var tw = .7 + .3 * Math.sin(Date.now() * .003 + a.ph); star5(c, a.x, a.y, (la ? 6 : 4.8) * tw, a.rot); c.fill();
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
  /* 11. cursor stars: halo + orbiting stars, star trail, click burst, shooting stars */
  if (!reduce) (function () {
    var fx = mk('canvas', 'cosmos-fx'); document.body.appendChild(fx);
    var g = fx.getContext('2d'), S = [], R = [], SH = [];
    var pal = ['#f67c9e', '#fdab12', '#6dff2a', '#8d7bff', '#ffffff'];
    var mx = -999, my = -999, hx = -999, hy = -999, lx = -999, ly = -999, seen = false, hot = 0, hotT = 0, nextShoot = Date.now() + 3000;
    var W = innerWidth, H = innerHeight;
    function fit() { W = innerWidth; H = innerHeight; var dr = Math.min(window.devicePixelRatio || 1, 2); fx.width = W * dr; fx.height = H * dr; g.setTransform(dr, 0, 0, dr, 0, 0); }
    fit(); addEventListener('resize', fit);
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function sparkle(x, y, r, rot) {
      var k = r * .22;
      g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
      g.moveTo(0, -r); g.quadraticCurveTo(k, -k, r, 0); g.quadraticCurveTo(k, k, 0, r);
      g.quadraticCurveTo(-k, k, -r, 0); g.quadraticCurveTo(-k, -k, 0, -r); g.closePath(); g.restore();
    }
    function spawn(x, y, n, spd, grav) {
      for (var i = 0; i < n && S.length < (fine ? 220 : 120); i++) {
        var an = rnd(0, 6.283), v = rnd(spd * .4, spd);
        S.push({ x: x, y: y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - (grav ? 0 : .3), r: rnd(5, 11), rot: rnd(0, 6.3), vr: rnd(-.12, .12),
                 life: 0, max: rnd(38, 70), col: pal[Math.floor(rnd(0, pal.length))], kind: Math.random() < .55 ? 0 : 1, g: grav });
      }
    }
    function drawShape(kind, x, y, r, rot) { if (kind) star5(g, x, y, r, rot); else sparkle(x, y, r * 1.25, rot); }

    if (fine) {
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        if (!seen) { seen = true; hx = mx; hy = my; lx = mx; ly = my; }
        var d = Math.hypot(mx - lx, my - ly);
        if (d > 14) { spawn(mx, my, 1 + Math.min(3, Math.floor(d / 45)), 1.4, true); lx = mx; ly = my; }
      }, { passive: true });
      document.addEventListener('mouseleave', function () { seen = false; });
      document.addEventListener('mouseover', function (e) {
        hotT = e.target.closest && e.target.closest('a,button,[role=button],.skill-card,.work,input,textarea,select') ? 1 : 0;
      }, { passive: true });
    }
    /* click burst (mouse) / tap burst (touch: on 'click' so scrolling never triggers it) */
    function burst(x, y, n) {
      spawn(x, y, n, fine ? 7 : 6, true);
      R.push({ x: x, y: y, r: 6, a: 1, col: pal[Math.floor(rnd(0, 4))] });
    }
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      burst(e.clientX, e.clientY, 18);
    }, { passive: true });
    document.addEventListener('click', function (e) {
      if (!e.detail || e.pointerType === 'mouse') return;   /* skip keyboard clicks + mouse (handled above) */
      if (matchMedia('(pointer: coarse)').matches) burst(e.clientX, e.clientY, 14);
    }, { passive: true });

    /* finger: glow follows the touch, stars fall from it while dragging or scrolling */
    function tpos(e) { var t = e.touches[0]; mx = t.clientX; my = t.clientY; }
    document.addEventListener('touchstart', function (e) {
      tpos(e); seen = true; hx = mx; hy = my; lx = mx; ly = my;
      hotT = e.target.closest && e.target.closest('a,button,[role=button],.skill-card,.work,input,textarea,select') ? 1 : 0;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      tpos(e);
      var d = Math.hypot(mx - lx, my - ly);
      if (d > 22) { spawn(mx, my, 1 + Math.min(2, Math.floor(d / 70)), 1.2, true); lx = mx; ly = my; }
    }, { passive: true });
    function lift() { setTimeout(function () { seen = false; }, 220); }
    document.addEventListener('touchend', lift, { passive: true });
    document.addEventListener('touchcancel', lift, { passive: true });

    function loop() {
      if (!document.hidden) {
        var now = Date.now(), i;
        g.clearRect(0, 0, W, H);

        /* halo + core star + orbiting stars (desktop) */
        if (seen) {
          hx += (mx - hx) * .2; hy += (my - hy) * .2; hot += (hotT - hot) * .15;
          var rad = (fine ? 44 : 38) + hot * 26, gr = g.createRadialGradient(hx, hy, 0, hx, hy, rad);
          gr.addColorStop(0, 'rgba(253,171,18,' + (.28 + hot * .12) + ')'); gr.addColorStop(.5, 'rgba(246,124,158,.14)'); gr.addColorStop(1, 'rgba(246,124,158,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(hx, hy, rad, 0, 6.283); g.fill();
          g.lineWidth = 1; g.strokeStyle = 'rgba(17,17,17,.6)';
          g.fillStyle = '#fdab12'; sparkle(hx, hy, 9 + hot * 4, now * .002); g.fill(); g.stroke();
          for (i = 0; i < 3; i++) {
            var oa = now * .004 + i * 2.094, orad = 22 + hot * 14 + Math.sin(now * .006 + i) * 3;
            g.fillStyle = pal[i]; star5(g, hx + Math.cos(oa) * orad, hy + Math.sin(oa) * orad, 4.2, -oa * 2); g.fill(); g.stroke();
          }
        }

        /* click rings */
        for (i = R.length - 1; i >= 0; i--) {
          var q = R[i]; q.r += 3.2; q.a -= .035;
          if (q.a <= 0) { R.splice(i, 1); continue; }
          g.globalAlpha = q.a; g.lineWidth = 2.5; g.strokeStyle = q.col; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.283); g.stroke();
        }

        /* trail + burst stars */
        g.lineWidth = 1; g.strokeStyle = 'rgba(17,17,17,.55)';
        for (i = S.length - 1; i >= 0; i--) {
          var s = S[i]; s.life++;
          if (s.life > s.max) { S.splice(i, 1); continue; }
          s.x += s.vx; s.y += s.vy; s.vx *= .96; s.vy = s.vy * .96 + (s.g ? .09 : 0); s.rot += s.vr;
          var t = s.life / s.max;
          g.globalAlpha = 1 - t * t; g.fillStyle = s.col;
          drawShape(s.kind, s.x, s.y, s.r * (1 - t * .7), s.rot); g.fill(); g.stroke();
        }

        /* shooting stars */
        if (now > nextShoot) {
          SH.push({ x: rnd(W * .35, W * 1.05), y: rnd(-20, H * .35), vx: -rnd(9, 14), vy: rnd(3.5, 6), life: 0 });
          nextShoot = now + rnd(5000, 9000);
        }
        for (i = SH.length - 1; i >= 0; i--) {
          var h = SH[i]; h.life++; h.x += h.vx; h.y += h.vy;
          if (h.life > 90 || h.x < -80 || h.y > H + 80) { SH.splice(i, 1); continue; }
          var tl = g.createLinearGradient(h.x, h.y, h.x - h.vx * 9, h.y - h.vy * 9);
          tl.addColorStop(0, 'rgba(253,171,18,.9)'); tl.addColorStop(1, 'rgba(246,124,158,0)');
          g.globalAlpha = 1; g.strokeStyle = tl; g.lineWidth = 3; g.beginPath(); g.moveTo(h.x, h.y); g.lineTo(h.x - h.vx * 9, h.y - h.vy * 9); g.stroke();
          g.fillStyle = '#fff'; g.strokeStyle = 'rgba(17,17,17,.5)'; g.lineWidth = 1; star5(g, h.x, h.y, 8, h.life * .15); g.fill(); g.stroke();
        }
        g.globalAlpha = 1;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

})();