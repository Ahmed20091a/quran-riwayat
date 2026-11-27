/* الأحاديث: صحيح البخاري وصحيح مسلم — نص المصدر كما هو، تحميل كل كتاب عند الطلب */
(function () {
  'use strict';
  var body = document.getElementById('hdBody'); if (!body) return;
  var st = document.getElementById('hdStatus'), tabs = document.getElementById('hdTabs');
  var IDX = null, coll = 'bukhari', cache = {}, view = { kind: 'books' }, PAGE = 20;
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function norm(s) {
    return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/\s+/g, ' ').trim();
  }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function say(t) { st.textContent = t || ''; }
  function loadIdx() {
    if (IDX) return Promise.resolve(IDX);
    return fetch('data/hadith/index.json').then(function (r) { return r.json(); }).then(function (j) { IDX = j; return j; });
  }
  function loadBook(c, b) {
    var k = c + '/' + b; if (cache[k]) return Promise.resolve(cache[k]);
    return fetch('data/hadith/' + c + '/' + b + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { cache[k] = j; return j; });
  }
  function card(c, b, row) {
    var d = el('div', 'hd-card');
    var m = el('div', 'hd-meta');
    m.appendChild(el('b', '', IDX[c].name + ' · حديث ' + arNum(row[0])));
    if (row[1]) m.appendChild(el('i', '', 'ترقيم الكتاب: ' + row[1]));
    var bk = IDX[c].books.filter(function (x) { return x.id === b; })[0];
    if (bk) m.appendChild(el('span', '', bk.en));
    d.appendChild(m); d.appendChild(el('div', 'hd-text', row[2]));
    return d;
  }
  function backBtn(label, fn) { var b = el('button', 'hd-back', '‹ ' + label); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function showBooks() {
    view = { kind: 'books' }; body.textContent = ''; say('');
    loadIdx().then(function () {
      var c = IDX[coll]; say(c.name + ': ' + arNum(c.total) + ' حديثًا في ' + arNum(c.books.length) + ' كتابًا');
      var list = el('div', 'hd-list');
      c.books.forEach(function (b) {
        var r = el('button', 'hd-row'); r.type = 'button';
        r.appendChild(el('span', 'hd-n', arNum(b.id)));
        r.appendChild(el('span', 'hd-t', b.en));
        r.appendChild(el('span', 'hd-c', arNum(b.count)));
        r.addEventListener('click', function () { showBook(b.id, 0); });
        list.appendChild(r);
      });
      body.appendChild(list);
    }).catch(function () { say('تعذّر تحميل الفهرس. تأكد من الإنترنت وحاول تاني.'); });
  }
  function showBook(b, off, focus) {
    view = { kind: 'book', b: b }; body.textContent = ''; say('جارٍ التحميل…');
    loadBook(coll, b).then(function (rows) {
      say('');
      var bk = IDX[coll].books.filter(function (x) { return x.id === b; })[0];
      body.appendChild(backBtn('كل الكتب', showBooks));
      body.appendChild(el('div', 'hd-h', bk.en + ' · ' + arNum(rows.length) + ' حديثًا'));
      var box = el('div', 'hd-cards'); body.appendChild(box);
      var from = off;
      if (focus != null) { var ix = rows.findIndex(function (r) { return r[0] === focus; }); if (ix > -1) from = Math.floor(ix / PAGE) * PAGE; }
      var shown = from, more = el('button', 'btn hd-more', 'المزيد'); more.type = 'button';
      function add() {
        rows.slice(shown, shown + PAGE).forEach(function (r) { var c = card(coll, b, r); if (r[0] === focus) c.classList.add('hit'); box.appendChild(c); });
        shown += PAGE; more.hidden = shown >= rows.length;
      }
      more.addEventListener('click', add); body.appendChild(more); add();
      if (focus != null) { var h = box.querySelector('.hit'); if (h) h.scrollIntoView({ block: 'center' }); }
    }).catch(function () { say('تعذّر تحميل الكتاب. تأكد من الإنترنت وحاول تاني.'); });
  }
  function gotoNum(n) {
    n = parseInt(String(n).replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); }), 10);
    if (!n) { say('اكتب رقم الحديث.'); return; }
    loadIdx().then(function () {
      var cands = IDX[coll].books.filter(function (x) { return n >= x.first && n <= x.last; });
      if (!cands.length) { say('الرقم ده مش موجود في ' + IDX[coll].name + '.'); return; }
      say('جارٍ البحث عن الحديث…');
      (function next(i) {
        if (i >= cands.length) { say('الحديث رقم ' + arNum(n) + ' مفيش له نص في المصدر.'); return; }
        loadBook(coll, cands[i].id).then(function (rows) {
          if (rows.some(function (r) { return r[0] === n; })) { showBook(cands[i].id, 0, n); } else next(i + 1);
        }).catch(function () { say('تعذّر التحميل. حاول تاني.'); });
      })(0);
    });
  }
  var searching = 0;
  function search(q) {
    var words = norm(q).split(' ').filter(Boolean);
    if (!words.length) { say('اكتب كلمة أو أكتر.'); return; }
    var token = ++searching;
    loadIdx().then(function () {
      var books = IDX[coll].books, done = 0, hits = [], i = 0, active = 0;
      body.textContent = ''; say('جارٍ البحث في ' + IDX[coll].name + '… (أول مرة بينزّل الكتب، حوالي ١–٢ ميجا)');
      function pump() {
        while (active < 4 && i < books.length) {
          (function (b) {
            active++;
            loadBook(coll, b.id).then(function (rows) {
              if (token !== searching) return;
              rows.forEach(function (r) {
                if (!r._n) Object.defineProperty(r, '_n', { value: norm(r[2]), enumerable: false });
                if (words.every(function (w) { return r._n.indexOf(w) !== -1; })) hits.push({ b: b.id, r: r });
              });
            }).catch(function () {}).then(function () { active--; done++; if (token === searching) { say('جارٍ البحث… ' + arNum(done) + '/' + arNum(books.length)); if (done === books.length) finish(); else pump(); } });
          })(books[i++]);
        }
      }
      function finish() {
        hits.sort(function (a, b) { return a.r[0] - b.r[0]; });
        body.textContent = '';
        say(hits.length ? 'عدد النتائج: ' + arNum(hits.length) : 'مفيش نتائج. جرّب كلمات أقل.');
        if (!hits.length) return;
        var box = el('div', 'hd-cards'), shown = 0, more = el('button', 'btn hd-more', 'المزيد'); more.type = 'button';
        function add() { hits.slice(shown, shown + PAGE).forEach(function (h) { box.appendChild(card(coll, h.b, h.r)); }); shown += PAGE; more.hidden = shown >= hits.length; }
        more.addEventListener('click', add); body.appendChild(box); body.appendChild(more); add();
      }
      pump();
    });
  }
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; coll = b.getAttribute('data-c');
    tabs.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); searching++; showBooks();
  });
  var sg = document.getElementById('hdSearchGo'), si = document.getElementById('hdSearch');
  sg.addEventListener('click', function () { search(si.value); });
  si.addEventListener('keydown', function (e) { if (e.key === 'Enter') search(si.value); });
  var ng = document.getElementById('hdNumGo'), ni = document.getElementById('hdNum');
  ng.addEventListener('click', function () { gotoNum(ni.value); });
  ni.addEventListener('keydown', function (e) { if (e.key === 'Enter') gotoNum(ni.value); });
  var started = false;
  function start() { if (!started && location.hash === '#hadith') { started = true; showBooks(); } }
  window.addEventListener('hashchange', start); start();
})();
