/* السبحة: عدّاد أذكار، أهداف، وأذكار مخصصة، محفوظة على الجهاز */
(function () {
  var PRESETS = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'اللهم صل وسلم على نبينا محمد'];
  var KEY = 'quran.sebha2';
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function $(s) { return document.querySelector(s); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var ICO = {
    check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  var st;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!st || typeof st !== 'object') st = {};
  st.sel = typeof st.sel === 'string' ? st.sel : PRESETS[0];
  st.c = st.c && typeof st.c === 'object' ? st.c : {};      /* counts by dhikr text */
  st.tg = st.tg && typeof st.tg === 'object' ? st.tg : {};  /* target by dhikr text */
  st.custom = Array.isArray(st.custom) ? st.custom : [];
  st.goals = Array.isArray(st.goals) ? st.goals : [];
  st.v = st.v !== false;
  st.daily = !!st.daily;
  st.all = st.all || 0;
  st.day = st.day || today();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function dayCheck() {
    if (st.day === today()) return;
    st.day = today();
    if (st.daily) { st.c = {}; st.goals.forEach(function (g) { g.n = 0; g.done = false; }); }
    save();
  }
  function all() { return PRESETS.concat(st.custom); }
  function buzz(ms) { if (st.v && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }
  var chips = $('#sbChips');
  function cnt() { return st.c[st.sel] || 0; }
  function tgt() { return st.tg[st.sel] || 0; }
  function paintChips() {
    chips.innerHTML = '';
    all().forEach(function (d) {
      var b = document.createElement('button'); b.className = 'sb-chip' + (d === st.sel ? ' on' : ''); b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', d === st.sel);
      var sp = document.createElement('span'); sp.textContent = d; b.appendChild(sp);
      b.addEventListener('click', function () { st.sel = d; save(); paint(); });
      if (st.custom.indexOf(d) !== -1) {
        var x = document.createElement('i'); x.className = 'sb-x'; x.innerHTML = ICO.del; x.setAttribute('aria-label', 'حذف');
        x.addEventListener('click', function (e) {
          e.stopPropagation();
          st.custom.splice(st.custom.indexOf(d), 1); delete st.c[d]; delete st.tg[d];
          if (st.sel === d) st.sel = PRESETS[0];
          save(); paint();
        });
        b.appendChild(x);
      }
      chips.appendChild(b);
    });
  }
  function paintGoals() {
    var box = $('#sbGoals'); box.innerHTML = '';
    if (!st.goals.length) { var e = document.createElement('div'); e.className = 'sb-empty'; e.textContent = 'لا توجد أهداف بعد. اكتب هدفك بالأسفل.'; box.appendChild(e); return; }
    st.goals.forEach(function (g, i) {
      var row = document.createElement('div'); row.className = 'sb-goal' + (g.done ? ' done' : '');
      var ck = document.createElement('button'); ck.className = 'sb-ck'; ck.innerHTML = g.done ? ICO.check : ''; ck.setAttribute('aria-label', g.done ? 'إلغاء الإنجاز' : 'تم');
      ck.addEventListener('click', function () { g.done = !g.done; save(); paintGoals(); });
      var tx = document.createElement('span'); tx.className = 'sb-gt'; tx.textContent = g.t;
      row.appendChild(ck); row.appendChild(tx);
      if (g.N) {
        var pr = document.createElement('span'); pr.className = 'sb-gp'; pr.textContent = ar(g.n || 0) + ' / ' + ar(g.N);
        var pl = document.createElement('button'); pl.className = 'sb-gb'; pl.innerHTML = ICO.plus; pl.setAttribute('aria-label', 'زيادة');
        pl.addEventListener('click', function () { g.n = (g.n || 0) + 1; if (g.n >= g.N) g.done = true; save(); paintGoals(); buzz(15); });
        row.appendChild(pr); row.appendChild(pl);
      }
      var dl = document.createElement('button'); dl.className = 'sb-gb sb-gd'; dl.innerHTML = ICO.del; dl.setAttribute('aria-label', 'حذف الهدف');
      dl.addEventListener('click', function () { st.goals.splice(i, 1); save(); paintGoals(); });
      row.appendChild(dl);
      box.appendChild(row);
    });
  }
  function paint() {
    var n = cnt(), t = tgt();
    paintChips();
    $('#sbPhrase').textContent = st.sel;
    $('#sbCount').textContent = ar(n);
    $('#sbOf').textContent = t ? 'من ' + ar(t) : '';
    $('#sbTap').classList.toggle('done', !!(t && n >= t));
    $('#sbBar').style.width = t ? Math.min(100, n / t * 100) + '%' : '0%';
    var sel = $('#sbTarget'), pre = ['0', '33', '100'];
    sel.value = pre.indexOf(String(t)) !== -1 ? String(t) : 'x';
    var ci = $('#sbCustomT'); ci.hidden = sel.value !== 'x'; if (!ci.hidden && document.activeElement !== ci) ci.value = t || '';
    $('#sbVib').checked = st.v; $('#sbDaily').checked = st.daily;
    $('#sbTotal').textContent = 'المجموع الكلي: ' + ar(st.all);
    paintGoals();
  }
  $('#sbTap').addEventListener('click', function () {
    dayCheck();
    var n = cnt() + 1, t = tgt();
    st.c[st.sel] = n; st.all++; save(); paint();
    if (t && n === t) buzz([60, 60, 120]); else buzz(15);
  });
  $('#sbReset').addEventListener('click', function () { if (cnt() === 0) return; st.c[st.sel] = 0; save(); paint(); });
  $('#sbTarget').addEventListener('change', function (e) {
    var v = e.target.value;
    if (v === 'x') { $('#sbCustomT').hidden = false; $('#sbCustomT').focus(); return; }
    st.tg[st.sel] = +v || 0; save(); paint();
  });
  $('#sbCustomT').addEventListener('input', function (e) { var v = parseInt(e.target.value, 10); st.tg[st.sel] = v > 0 ? Math.min(v, 100000) : 0; save(); var t = tgt(), n = cnt(); $('#sbOf').textContent = t ? 'من ' + ar(t) : ''; $('#sbBar').style.width = t ? Math.min(100, n / t * 100) + '%' : '0%'; });
  $('#sbVib').addEventListener('change', function (e) { st.v = e.target.checked; save(); });
  $('#sbDaily').addEventListener('change', function (e) { st.daily = e.target.checked; save(); });
  $('#sbAddD').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#sbNewD').value.trim().slice(0, 60);
    if (!v) return;
    if (all().indexOf(v) === -1) st.custom.push(v);
    st.sel = v; $('#sbNewD').value = ''; save(); paint();
  });
  $('#sbAddG').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('#sbGText').value.trim().slice(0, 80), N = parseInt($('#sbGNum').value, 10);
    if (!t) return;
    st.goals.push({ t: t, N: N > 0 ? Math.min(N, 1000000) : 0, n: 0, done: false });
    $('#sbGText').value = ''; $('#sbGNum').value = ''; save(); paintGoals();
  });
  dayCheck(); paint();
})();
