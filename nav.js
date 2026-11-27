/* روايات — كل قسم شاشة مستقلة */
(function () {
  'use strict';
  /* always open on the home screen: drop a leftover reading hash from a previous visit */
  if (/^#p=\d+$/.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  var IDS = ['mushaf', 'tilawa', 'riwayat', 'tajweed', 'sebha', 'adhkar', 'duas', 'radio', 'qibla', 'salah', 'hadith'];
  var NAMES = { hadith: 'الأحاديث', mushaf: 'المصحف', tilawa: 'التلاوة', riwayat: 'الروايات', tajweed: 'أحكام التجويد', sebha: 'السبحة', adhkar: 'الأذكار', duas: 'الأدعية', radio: 'الإذاعة', qibla: 'القبلة', salah: 'المواقيت' };
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
    window.__prevScreen = last; last = t;
    document.documentElement.classList.toggle('in-mushaf', t === 'mushaf');
    if (hero) hero.classList.toggle('scr', t === 'home');
    tiles.classList.toggle('scr', t === 'home');
    IDS.forEach(function (i) { if (secs[i]) secs[i].classList.toggle('scr', i === t); });
    document.querySelectorAll('#navLinks a').forEach(function (a) {
      a.classList.toggle('cur', a.getAttribute('href') === '#' + t);
    });
    var nl = document.getElementById('navLinks');
    if (nl) nl.classList.remove('open');
    var nb = document.getElementById('navMenu');
    if (nb) nb.setAttribute('aria-expanded', 'false');
    var ntl = document.getElementById('navTitle'); if (ntl) ntl.textContent = t === 'home' ? '' : NAMES[t];
    var inner = t !== 'home' && t !== 'mushaf';
    document.documentElement.classList.toggle('in-inner', inner);
    var bb = document.getElementById('navBtn');
    if (bb) {
      var sv = bb.querySelector('svg');
      if (sv) sv.innerHTML = '<path d="M9 5l7 7-7 7"/>';
      bb.setAttribute('aria-label', 'رجوع');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = (t === 'home' ? 'قرآن كريم' : NAMES[t] + ' — قرآن كريم');
  }
  window.__quranBack = function () { var p = window.__prevScreen; location.hash = (p && p !== 'home' && p !== 'mushaf' && p !== null) ? p : ''; if (!location.hash) { history.replaceState(null, '', location.pathname + location.search); show(); } };
  window.addEventListener('hashchange', show);
  var brand = document.querySelector('nav .brand');
  if (brand) { brand.style.cursor = 'pointer'; brand.addEventListener('click', function () { if (location.hash) location.hash = ''; show(); }); }
  show();
  var nbtn = document.getElementById('navBtn');
  if (nbtn) nbtn.addEventListener('click', function (e) {
    if (document.documentElement.classList.contains('in-inner')) { e.stopImmediatePropagation(); e.preventDefault(); window.__quranBack(); }
  }, true);
})();
