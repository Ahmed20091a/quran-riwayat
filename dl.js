/* روايات — تنزيل الصوت للاستماع بدون إنترنت (يعمل داخل تطبيق الأندرويد فقط) */
(function () {
  'use strict';
  var A = window.QuranApp;
  if (!A) return;
  document.documentElement.classList.add('in-app');
  var $ = function (s) { return document.querySelector(s); };
  var state = { list: [], prog: {} };
  function slug(u) { return u.replace(/^https:\/\//, '').replace(/\.mp3$/, '').replace(/[^A-Za-z0-9]+/g, '_').slice(-80); }
  function idOf(url) { return slug(url); }
  function mb(b) { return b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(1) + ' MB'; }
  function refresh() { try { state.list = JSON.parse(A.list()); } catch (e) { state.list = []; } }
  function has(url) { try { return A.has(idOf(url)); } catch (e) { return false; } }

  var QD = window.QuranDL = {
    local: function (url) { return has(url) ? '/_audio/' + idOf(url) + '.mp3' : null; },
    onPlayer: function () { updBtn(); }
  };

  /* زر التنزيل في المشغل */
  var btn = document.createElement('button');
  btn.className = 'p-btn'; btn.id = 'dlBtn'; btn.type = 'button'; btn.setAttribute('aria-label', 'تنزيل');
  btn.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10M7.5 10.5L12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var close = $('#closePlayer');
  if (close) close.parentNode.insertBefore(btn, close);
  function updBtn() {
    var c = window.QuranCur; if (!c) return;
    var d = has(c.url), p = state.prog[idOf(c.url)];
    btn.classList.toggle('done', d);
    btn.title = d ? 'محمّلة' : (p != null ? p + '%' : 'تنزيل');
    btn.style.opacity = d ? '1' : '.85';
    btn.style.color = d ? '#6ee7a0' : '';
  }
  btn.addEventListener('click', function () {
    var c = window.QuranCur; if (!c) return;
    var id = idOf(c.url);
    if (has(c.url)) { toast('السورة محمّلة بالفعل على الجهاز'); return; }
    try { var L = JSON.parse(localStorage.getItem('dlLabels') || '{}'); L[id] = c.reciter + ' — ' + c.sname; localStorage.setItem('dlLabels', JSON.stringify(L)); } catch (e) {}
    toast('بدأ التنزيل: سورة ' + c.sname);
    A.download(c.url, id);
  });

  /* لوحة التنزيلات */
  var panel = document.createElement('div');
  panel.className = 'dl-panel'; panel.hidden = true;
  document.body.appendChild(panel);
  var open = document.createElement('button');
  open.type = 'button'; open.className = 'dl-open'; open.textContent = 'التنزيلات (بدون إنترنت)';
  var grid = $('#reciterGrid');
  if (grid) grid.parentNode.insertBefore(open, grid);
  open.addEventListener('click', function () { render(); panel.hidden = false; });

  function toast(t) {
    var e = document.createElement('div'); e.className = 'upd-toast'; e.style.zIndex = 300;
    e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2600);
  }
  function render() {
    refresh();
    panel.textContent = '';
    var box = document.createElement('div'); box.className = 'dl-box';
    var h = document.createElement('h3'); h.textContent = 'التنزيلات على الجهاز'; box.appendChild(h);
    var tot = 0; try { tot = Number(A.total()); } catch (e) {}
    var s = document.createElement('p'); s.className = 'dl-sum';
    s.textContent = state.list.length + ' ملف — المساحة المستخدمة: ' + mb(tot); box.appendChild(s);
    var c = window.QuranCur;
    if (c) {
      var all = document.createElement('button'); all.type = 'button'; all.className = 'dl-act';
      all.textContent = 'تنزيل كل سور ' + c.reciter + ' (قد يصل لمئات الميجا)';
      all.addEventListener('click', function () {
        if (!confirm('هتنزّل كل السور للقارئ ده. ممكن تاخد مئات الميجابايت. متأكد؟')) return;
        var q = [];
        for (var i = 1; i <= 114; i++) {
          if (c.missing.indexOf(i) !== -1) continue;
          var u = c.server.replace(/\/$/, '') + '/' + String(i).padStart(3, '0') + '.mp3';
          if (!has(u)) q.push(u);
        }
        runQueue(q); panel.hidden = true;
      });
      box.appendChild(all);
    }
    state.list.forEach(function (it) {
      var r = document.createElement('div'); r.className = 'dl-row';
      var LB = {}; try { LB = JSON.parse(localStorage.getItem('dlLabels') || '{}'); } catch (e) {}
      var n = document.createElement('span'); n.textContent = (LB[it.id] || it.id.slice(-30)) + ' · ' + mb(it.size);
      var pl = document.createElement('button'); pl.type = 'button'; pl.textContent = 'تشغيل';
      pl.addEventListener('click', function () { var a = $('#audio'); a.src = '/_audio/' + it.id + '.mp3'; a.play(); panel.hidden = true; });
      var rm = document.createElement('button'); rm.type = 'button'; rm.textContent = 'حذف';
      rm.addEventListener('click', function () { A.remove(it.id); render(); updBtn(); });
      r.appendChild(n); r.appendChild(pl); r.appendChild(rm); box.appendChild(r);
    });
    if (!state.list.length) { var e = document.createElement('p'); e.className = 'dl-sum'; e.textContent = 'لا توجد تنزيلات بعد. افتح أي قارئ ثم اضغط زر التنزيل في المشغل.'; box.appendChild(e); }
    var cl = document.createElement('button'); cl.type = 'button'; cl.className = 'dl-act'; cl.textContent = 'إغلاق';
    cl.addEventListener('click', function () { panel.hidden = true; }); box.appendChild(cl);
    panel.appendChild(box);
  }
  var queue = [], busy = false, cancelled = false;
  function runQueue(q) { queue = q; cancelled = false; toast('جاري تنزيل ' + q.length + ' سورة'); next(); }
  function next() {
    if (busy || cancelled || !queue.length) return;
    var u = queue.shift(); busy = true; A.download(u, idOf(u));
  }
  window.onQDl = function (id, pct, status) {
    state.prog[id] = pct;
    if (status === 'done' || status === 'error') {
      delete state.prog[id]; busy = false;
      if (status === 'error') toast('فشل التنزيل (تأكد من الإنترنت أو المساحة)');
      if (!panel.hidden) render();
      updBtn(); next();
    } else updBtn();
  };
})();
