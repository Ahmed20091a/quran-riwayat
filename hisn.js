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
  /* الأذكار */
  var TABS = ['أذكار الصباح والمساء', 'الأذكار بعد السلام من الصلاة', 'أذكار النوم', 'أذكار الاستيقاظ من النوم'];
  var adSel = 0;
  function adPaint() {
    var tabs = $('#adTabs'); tabs.innerHTML = '';
    TABS.forEach(function (t, i) {
      var b = document.createElement('button'); b.className = 'sb-chip' + (i === adSel ? ' on' : ''); b.setAttribute('role', 'tab');
      b.innerHTML = '<span></span>'; b.firstChild.textContent = t.replace(/^الأذكار |^أذكار /, '');
      b.addEventListener('click', function () { adSel = i; adPaint(); }); tabs.appendChild(b);
    });
    var box = $('#adBody'); box.innerHTML = '';
    var c = byTitle(TABS[adSel]);
    if (!c) return;
    var h = document.createElement('h3'); h.className = 'sb-h'; h.textContent = c.t; box.appendChild(h);
    c.a.forEach(function (it) { box.appendChild(card(it, true)); });
    $('#adSrc').textContent = SRC;
  }
  /* الأدعية */
  function duaList(q) {
    var box = $('#duaBody'); box.innerHTML = '';
    var nq = norm(q.trim());
    if (!nq) {
      DATA.forEach(function (c) {
        var d = document.createElement('details'); d.className = 'hs-cat';
        var s = document.createElement('summary'); s.textContent = c.t; d.appendChild(s);
        var filled = false;
        d.addEventListener('toggle', function () { if (d.open && !filled) { filled = true; c.a.forEach(function (it) { d.appendChild(card(it, false)); }); } });
        box.appendChild(d);
      });
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
      adPaint(); duaList(''); $('#duaSrc').textContent = SRC;
      var t = null; $('#duaSearch').addEventListener('input', function (e) { clearTimeout(t); var v = e.target.value; t = setTimeout(function () { duaList(v); }, 150); });
    }).catch(function () {
      $('#adBody').innerHTML = '<div class="sb-empty">تعذّر تحميل الأذكار. افتح الموقع مرة واحدة بالإنترنت.</div>';
      $('#duaBody').innerHTML = '<div class="sb-empty">تعذّر تحميل الأدعية. افتح الموقع مرة واحدة بالإنترنت.</div>';
    });
  }
  init();
})();
