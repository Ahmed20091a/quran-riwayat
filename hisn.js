/* الأذكار والأدعية من «حصن المسلم» (سعيد بن علي بن وهف القحطاني). النص كما هو في المصدر بدون تعديل. */
(function () {
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function $(s) { return document.querySelector(s); }
  function norm(s) { return s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').toLowerCase(); }
  var SRC = 'المصدر: حصن المسلم من أذكار الكتاب والسنة، تأليف سعيد بن علي بن وهف القحطاني. النص من بيانات موقع hisnmuslim.com ومطابق لنسخة ثانية مستقلة. الآيات داخل الأذكار بنص المصدر وليست من مصحف الموقع.';
  var DATA = null, loading = null;
  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (!loading) loading = fetch('data/hisn.json').then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); }).then(function (d) { DATA = d; return d; });
    loading.catch(function () { loading = null; });
    return loading;
  }
  function byTitle(t) { return DATA.filter(function (c) { return c.t === t; })[0]; }
  function card(item, counter) {
    var d = document.createElement('div'); d.className = 'hs-item';
    var x = document.createElement('div'); x.className = 'hs-text'; x.textContent = item[0]; d.appendChild(x);
    var n = item[1];
    if (counter && n > 1) {
      var b = document.createElement('button'); b.className = 'hs-count'; var left = n;
      b.textContent = 'التكرار: ' + ar(left) + ' من ' + ar(n);
      b.addEventListener('click', function () {
        if (left > 0) left--;
        b.textContent = left ? 'التكرار: ' + ar(left) + ' من ' + ar(n) : 'تم';
        b.classList.toggle('done', left === 0);
        if (navigator.vibrate) { try { navigator.vibrate(left ? 10 : [40, 40, 80]); } catch (e) {} }
      });
      d.appendChild(b);
    } else {
      var m = document.createElement('div'); m.className = 'hs-once'; m.textContent = n > 1 ? 'يُكرَّر ' + ar(n) + ' مرات' : 'مرة واحدة'; d.appendChild(m);
    }
    return d;
  }
  var sheet = null;
  function mkTile(c, i, counter, unit) {
        var t = document.createElement('button'); t.type = 'button'; t.className = 'hs-tile';
        t.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l4.6 8.4 8.9-3.1-1.6 9.3 9.1 2.4-7 6.2 4.8 8-9.4-.7-2.3 9.1L20 33l-7.1 5.6-2.3-9.1-9.4.7 4.8-8-7-6.2 9.1-2.4-1.6-9.3 8.9 3.1z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg><i></i><span></span><small></small>';
        t.querySelector('i').textContent = ar(i + 1);
        t.querySelector('span').textContent = c.t;
        t.querySelector('small').textContent = ar(c.a.length) + unit;
        t.addEventListener('click', function () { openSheet(c, counter); });
    return t;
  }
  var ADHKAR_SKIP = { 49: 1 };
  function adGrid() {
    var box = $('#adBody'); box.innerHTML = '';
    var grid = document.createElement('div'); grid.className = 'hs-grid';
    DATA.forEach(function (c, i) {
      if (!/ذكر|أذكار|التسبيح|التكبير|الصلاة على النبي/.test(c.t) || ADHKAR_SKIP[i]) return;
      grid.appendChild(mkTile(c, i, true, c.a.length === 1 ? ' ذكر' : c.a.length === 2 ? ' ذكران' : c.a.length > 10 ? ' ذكرًا' : ' أذكار'));
    });
    box.appendChild(grid);
    $('#adSrc').textContent = SRC;
  }
  function openSheet(c, counter) {
    if (!sheet) {
      sheet = document.createElement('div'); sheet.className = 'hs-sheet'; sheet.hidden = true;
      sheet.innerHTML = '<div class="hs-sh-bar"><button type="button" class="hs-back" aria-label="رجوع"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button><h3></h3></div><div class="hs-sh-body"></div>';
      document.body.appendChild(sheet);
      sheet.querySelector('.hs-back').addEventListener('click', closeSheet);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
    }
    sheet.querySelector('h3').textContent = c.t;
    var body = sheet.querySelector('.hs-sh-body'); body.innerHTML = '';
    c.a.forEach(function (it, i) {
      var d = card(it, !!counter); d.classList.add('big');
      var n = document.createElement('div'); n.className = 'hs-no'; n.textContent = ar(i + 1) + ' / ' + ar(c.a.length); d.insertBefore(n, d.firstChild);
      body.appendChild(d);
    });
    var src = document.createElement('div'); src.className = 'hs-src'; src.textContent = SRC; body.appendChild(src);
    sheet.hidden = false; body.scrollTop = 0; document.documentElement.classList.add('hs-lock');
  }
  function closeSheet() { if (sheet) { sheet.hidden = true; document.documentElement.classList.remove('hs-lock'); } }
  /* الأدعية */
  function duaList(q) {
    var box = $('#duaBody'); box.innerHTML = '';
    var nq = norm(q.trim());
    if (!nq) {
      var grid = document.createElement('div'); grid.className = 'hs-grid';
      DATA.forEach(function (c, i) {
        var t = mkTile(c, i, false, c.a.length > 10 ? ' دعاء' : c.a.length > 2 ? ' أدعية' : c.a.length === 2 ? ' دعاءان' : ' دعاء');
        grid.appendChild(t);
      });
      box.appendChild(grid);
      return;
    }
    var shown = 0, MAX = 40;
    DATA.forEach(function (c) {
      var hits = c.a.filter(function (it) { return norm(it[0]).indexOf(nq) !== -1; });
      var tHit = norm(c.t).indexOf(nq) !== -1;
      if (!hits.length && !tHit) return;
      if (shown >= MAX) return;
      var g = document.createElement('div'); g.className = 'hs-group';
      var h = document.createElement('h4'); h.textContent = c.t; g.appendChild(h);
      (tHit ? c.a : hits).forEach(function (it) { g.appendChild(card(it, false)); shown++; });
      box.appendChild(g);
    });
    if (!box.children.length) { var e = document.createElement('div'); e.className = 'sb-empty'; e.textContent = 'لا توجد نتائج.'; box.appendChild(e); }
  }
  function init() {
    load().then(function () {
      adGrid(); duaList(''); $('#duaSrc').textContent = SRC;
      var t = null; $('#duaSearch').addEventListener('input', function (e) { clearTimeout(t); var v = e.target.value; t = setTimeout(function () { duaList(v); }, 150); });
    }).catch(function () {
      $('#adBody').innerHTML = '<div class="sb-empty">تعذّر تحميل الأذكار. افتح الموقع مرة واحدة بالإنترنت.</div>';
      $('#duaBody').innerHTML = '<div class="sb-empty">تعذّر تحميل الأدعية. افتح الموقع مرة واحدة بالإنترنت.</div>';
    });
  }
  init();
})();
