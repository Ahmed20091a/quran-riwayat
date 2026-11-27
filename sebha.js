/* السبحة: عدّاد أذكار محفوظ على الجهاز */
(function () {
  var D = [
    'سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله'
  ];
  var KEY = 'quran.sebha';
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function $(s) { return document.querySelector(s); }
  var st;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!st || typeof st !== 'object') st = {};
  st.i = st.i >= 0 && st.i < D.length ? st.i : 0;
  st.c = st.c && typeof st.c === 'object' ? st.c : {};
  st.t = st.t === 33 || st.t === 100 ? st.t : 0;
  st.v = st.v !== false;
  st.all = st.all || 0;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function buzz(ms) { if (st.v && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }
  var chips = $('#sbChips');
  D.forEach(function (d, i) {
    var b = document.createElement('button'); b.className = 'sb-chip'; b.textContent = d; b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { st.i = i; save(); paint(); });
    chips.appendChild(b);
  });
  function cnt() { return st.c[st.i] || 0; }
  function paint() {
    var n = cnt();
    Array.prototype.forEach.call(chips.children, function (b, i) {
      b.classList.toggle('on', i === st.i); b.setAttribute('aria-selected', i === st.i);
    });
    $('#sbPhrase').textContent = D[st.i];
    $('#sbCount').textContent = ar(n);
    $('#sbOf').textContent = st.t ? 'من ' + ar(st.t) : '';
    var done = st.t && n >= st.t;
    $('#sbTap').classList.toggle('done', !!done);
    $('#sbBar').style.width = st.t ? Math.min(100, n / st.t * 100) + '%' : '0%';
    $('#sbTarget').value = String(st.t);
    $('#sbVib').checked = st.v;
    $('#sbTotal').textContent = 'المجموع الكلي: ' + ar(st.all);
  }
  $('#sbTap').addEventListener('click', function () {
    var n = cnt() + 1;
    st.c[st.i] = n; st.all++;
    save(); paint();
    if (st.t && n === st.t) buzz([60, 60, 120]); else buzz(15);
  });
  $('#sbReset').addEventListener('click', function () {
    if (cnt() === 0) return;
    st.c[st.i] = 0; save(); paint();
  });
  $('#sbTarget').addEventListener('change', function (e) { st.t = +e.target.value || 0; save(); paint(); });
  $('#sbVib').addEventListener('change', function (e) { st.v = e.target.checked; save(); });
  paint();
})();
