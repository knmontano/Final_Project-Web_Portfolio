/* Aurora: pointer spotlight on cards (sets --mx / --my that Aurora.css reads) */
(function () {
    'use strict';
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var SEL = '.cert2, .work, .form', cur = null, raf = 0, px = 0, py = 0;
    function apply() {
      raf = 0; if (!cur) return;
      var r = cur.getBoundingClientRect();
      cur.style.setProperty('--mx', (px - r.left) + 'px');
      cur.style.setProperty('--my', (py - r.top) + 'px');
    }
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest(SEL);
      if (!t) { cur = null; return; }
      cur = t; px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  })();
  
  /* click a palette colour to copy its code */
  (function () {
    'use strict';
    var chips = [].slice.call(document.querySelectorAll('.palette span'));
    chips.forEach(function (c) {
      var hex = (c.textContent.match(/#[0-9a-f]{6}/i) || [''])[0];
      if (!hex) return;
      c.tabIndex = 0; c.setAttribute('role', 'button'); c.setAttribute('aria-label', 'Copy ' + hex);
      function copy() {
        var t = document.querySelector('.toast');
        var done = function () { if (!t) return; t.textContent = 'Copied ' + hex + ' ✦'; t.classList.add('show'); clearTimeout(copy.t); copy.t = setTimeout(function () { t.classList.remove('show'); }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(hex).then(done, function () {}); else done();
      }
      c.addEventListener('click', copy);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); } });
    });
  })();