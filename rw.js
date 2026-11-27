/* قراءة الروايات الأخرى: كل سورة تُحمَّل عند الطلب وتُفحص ببصمتها قبل العرض */
(function () {
  'use strict';
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function $(s) { return document.querySelector(s); }
  var RW = null, HM = null, cur = null, cache = {};
  async function sha(t) {
    var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }
  function esc(t) { return t.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  async function load() {
    if (RW) return;
    var r = await Promise.all([fetch('data/rw/manifest.json').then(function (x) { return x.json(); }), fetch('data/manifest.json').then(function (x) { return x.json(); })]);
    RW = r[0].riwayat; HM = r[1];
  }
  function buildSel() {
    var s = $('#rwSurah');
    if (s.options.length) return;
    HM.surahs.forEach(function (x) { var o = document.createElement('option'); o.value = x.n; o.textContent = arNum(x.n) + '. ' + x.name; s.appendChild(o); });
  }
  async function show() {
    var body = $('#rwBody'), badge = $('#rwBadge');
    if (!cur) return;
    var n = +$('#rwSurah').value, ri = RW.filter(function (r) { return r.id === cur; })[0];
    badge.hidden = true;
    body.innerHTML = '<div class="reader-loading">جارٍ تحميل السورة…</div>';
    var key = cur + n, v = cache[key];
    try {
      if (!v) {
        var raw = await (await fetch('data/rw/' + cur + '/' + String(n).padStart(3, '0') + '.json')).text();
        if ((await sha(raw)) !== ri.sha256[n - 1]) throw new Error('integrity');
        v = cache[key] = JSON.parse(raw).v;
      }
    } catch (e) { body.innerHTML = '<div class="reader-loading">⚠ تعذر التحقق من سلامة النص، لم يُعرض حمايةً للنص.</div>'; return; }
    if (cur !== ri.id || n !== +$('#rwSurah').value) return;
    var sm = HM.surahs[n - 1];
    var html = '<div class="surah-title"><h3>سورة ' + sm.name + '</h3><div class="meta">' + ri.name + ' · ' + arNum(v.length) + ' آية</div>';
    if (n !== 9 && !(ri.id === 'shubah' && n === 1)) html += '<div class="bsm">' + esc(ri.bismillah) + '</div>';
    html += '</div><div class="ayahs">';
    v.forEach(function (t, i) { html += '<span class="ayah">' + esc(t) + ' <span class="an">﴿' + arNum(i + 1) + '﴾</span></span> '; });
    body.innerHTML = html + '</div>';
    badge.hidden = false;
  }
  async function init() {
    var box = $('#rwChips');
    if (!box) return;
    try { await load(); } catch (e) { return; }
    buildSel();
    RW.forEach(function (r) {
      var b = document.createElement('button');
      b.className = 'chip'; b.textContent = r.name; b.title = r.sub;
      b.addEventListener('click', function () {
        box.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        b.classList.add('active'); cur = r.id; show();
      });
      box.appendChild(b);
    });
    $('#rwSurah').addEventListener('change', show);
  }
  init();
})();
