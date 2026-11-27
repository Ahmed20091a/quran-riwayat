/* روايات — كل قسم شاشة مستقلة */
(function () {
  'use strict';
  var IDS = ['mushaf', 'tilawa', 'riwayat', 'tajweed', 'sebha', 'adhkar', 'duas', 'salah'];
  var NAMES = { mushaf: 'المصحف', tilawa: 'التلاوة', riwayat: 'الروايات', tajweed: 'التجويد', sebha: 'السبحة', adhkar: 'الأذكار', duas: 'الأدعية', salah: 'المواقيت' };
  var hero = document.querySelector('header.hero');
  var secs = {};
  IDS.forEach(function (i) { secs[i] = document.getElementById(i); });
  document.documentElement.classList.add('screens');

  /* بطاقات الأقسام في الشاشة الرئيسية */
  var tiles = document.createElement('div');
  tiles.className = 'home-tiles'; tiles.id = 'homeTiles';
  IDS.forEach(function (i) {
    var a = document.createElement('a'); a.href = '#' + i; a.textContent = NAMES[i]; tiles.appendChild(a);
  });
  if (hero) hero.insertAdjacentElement('afterend', tiles);

  function target() {
    var h = location.hash.replace(/^#/, '');
    if (!h) return 'home';
    if (h === 'reader' || /^p=/.test(h)) return 'mushaf';
    if (secs[h]) return h;
    return 'home';
  }
  var last = null;
  function show() {
    var t = target();
    if (t === last) return;
    last = t;
    if (hero) hero.classList.toggle('scr', t === 'home');
    tiles.classList.toggle('scr', t === 'home');
    IDS.forEach(function (i) { if (secs[i]) secs[i].classList.toggle('scr', i === t); });
    document.querySelectorAll('#navLinks a').forEach(function (a) {
      a.classList.toggle('cur', a.getAttribute('href') === '#' + t);
    });
    var nl = document.getElementById('navLinks');
    if (nl) nl.classList.remove('open');
    var nb = document.getElementById('navBtn');
    if (nb) nb.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = (t === 'home' ? 'قرآن كريم' : NAMES[t] + ' — قرآن كريم');
  }
  window.addEventListener('hashchange', show);
  var brand = document.querySelector('nav .brand');
  if (brand) { brand.style.cursor = 'pointer'; brand.addEventListener('click', function () { if (location.hash) location.hash = ''; show(); }); }
  show();
})();
