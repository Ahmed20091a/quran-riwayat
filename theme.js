/* site-wide theme switch (green / dark / light), pinned top-left on every screen */
(function () {
  'use strict';
  var KEY = 'quran.view', OK = ['green', 'black', 'light'];
  function get() { try { var v = JSON.parse(localStorage.getItem(KEY) || '{}'); return OK.indexOf(v.theme) !== -1 ? v.theme : 'green'; } catch (e) { return 'green'; } }
  function set(t) {
    var v = {}; try { v = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    v.theme = t; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    apply(t);
  }
  function apply(t) {
    document.documentElement.setAttribute('data-site', t);
    var rd = document.getElementById('reader'); if (rd) rd.setAttribute('data-th', t);
    document.querySelectorAll('.vo-row [data-th]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-th') === t); });
    document.querySelectorAll('#themeSw button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === t); b.setAttribute('aria-pressed', b.getAttribute('data-t') === t ? 'true' : 'false'); });
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t === 'light' ? '#efe3c2' : t === 'black' ? '#000000' : '#0b1210');
  }
  var sw = document.createElement('div');
  sw.id = 'themeSw'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'المظهر');
  [['green', 'أخضر'], ['black', 'ليلي'], ['light', 'فاتح']].forEach(function (x) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-t', x[0]); b.setAttribute('aria-label', x[1]); b.title = x[1];
    b.addEventListener('click', function () { set(x[0]); });
    sw.appendChild(b);
  });
  document.body.appendChild(sw);
  apply(get());
  /* the reader is built after load: re-apply once it exists */
  setTimeout(function () { apply(get()); }, 600);
})();
