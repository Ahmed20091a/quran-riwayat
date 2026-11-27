/* روايات — app logic (no libraries, no external requests except audio CDN) */
(function () {
  'use strict';

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function $(s) { return document.querySelector(s); }

  /* ---------- state ---------- */
  var MANIFEST = null;
  var currentSurah = 1;
  var currentReciter = null;
  var playing = false;

  var audio = $('#audio');

  /* screenshot mode: freeze animations, re-scroll to anchor after load */
  var SHOT = location.search.indexOf('shot') !== -1;
  if (SHOT) {
    document.documentElement.classList.add('shot');
    window.addEventListener('load', function () {
      setTimeout(function () {
        if (location.hash) {
          var t = document.querySelector(location.hash);
          if (t) t.scrollIntoView();
        }
      }, 1200);
    });
  }

  /* ---------- boot ---------- */
  fetch('data/manifest.json').then(function (r) { return r.json(); }).then(function (m) {
    MANIFEST = m;
    buildSurahSelect();
    buildChips();
    renderReciters(m.reciters[0] ? m.reciters[0].group : null);
    loadSurah(1);
  }).catch(function () {
    $('#readerBody').innerHTML = '<div class="reader-loading">تعذر تحميل بيانات المصحف. حدّث الصفحة.</div>';
  });

  /* ---------- reader ---------- */
  function buildSurahSelect() {
    var sel = $('#surahSelect'), psel = $('#pSurah');
    MANIFEST.surahs.forEach(function (s) {
      var label = arNum(s.n) + ' — سورة ' + s.name;
      sel.add(new Option(label, s.n));
      psel.add(new Option('سورة ' + s.name, s.n));
    });
    sel.addEventListener('change', function () { loadSurah(+sel.value); });
    psel.addEventListener('change', function () { loadSurah(+psel.value, true); if (currentReciter) playAudio(); });
    $('#surahSearch').addEventListener('input', function (e) {
      var q = e.target.value.trim();
      if (!q) { sel.selectedIndex = currentSurah - 1; return; }
      var hit = MANIFEST.surahs.find(function (s) { return s.name.indexOf(q) !== -1; });
      if (hit) loadSurah(hit.n);
    });
  }

  async function sha256hex(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function loadSurah(n, keepBadge) {
    currentSurah = n;
    $('#surahSelect').value = n;
    $('#pSurah').value = n;
    var badge = $('#verifyBadge');
    if (!keepBadge) badge.hidden = true;
    $('#readerBody').innerHTML = '<div class="reader-loading">جارٍ تحميل السورة…</div>';
    var path = 'data/surah/' + String(n).padStart(3, '0') + '.json';
    fetch(path).then(function (r) { return r.text(); }).then(async function (raw) {
      var meta = MANIFEST.surahs[n - 1];
      var ok = false;
      try { ok = (await sha256hex(raw)) === meta.sha256; } catch (e) { ok = false; }
      if (!ok) {
        $('#readerBody').innerHTML = '<div class="reader-loading">⚠ تعذر التحقق من سلامة نص السورة، لم يُعرض حمايةً للنص.</div>';
        return;
      }
      badge.hidden = false;
      var s = JSON.parse(raw);
      renderSurah(s);
      updatePlayerInfo();
    }).catch(function () {
      $('#readerBody').innerHTML = '<div class="reader-loading">تعذر تحميل السورة. لو نزلتها للقراءة بدون نت ستفتح تلقائيًا.</div>';
    });
  }

  function renderSurah(s) {
    var html = '<div class="surah-title"><h3>سورة ' + s.name + '</h3>' +
      '<div class="meta">' + s.type + ' · ' + arNum(s.ayahs.length) + ' آية</div>';
    if (s.n !== 1 && s.n !== 9) html += '<div class="bsm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>';
    html += '</div><div class="ayahs">';
    s.ayahs.forEach(function (t, i) {
      html += '<span class="ayah" data-i="' + i + '">' + t +
        ' <span class="an">﴿' + arNum(i + 1) + '﴾</span></span> ';
    });
    $('#readerBody').innerHTML = html + '</div>';
  }

  /* ---------- reciters & player ---------- */
  function buildChips() {
    var groups = [];
    MANIFEST.reciters.forEach(function (r) { if (groups.indexOf(r.group) === -1) groups.push(r.group); });
    var box = $('#riwayahChips');
    groups.forEach(function (g, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' active' : '');
      b.textContent = g;
      b.addEventListener('click', function () {
        box.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        renderReciters(g);
      });
      box.appendChild(b);
    });
  }

  function renderReciters(group) {
    var grid = $('#reciterGrid');
    grid.innerHTML = '';
    MANIFEST.reciters.filter(function (r) { return !group || r.group === group; })
      .forEach(function (r) {
        var card = document.createElement('div');
        card.className = 'reciter';
        card.innerHTML = '<div class="avatar">' + r.reciter.trim().charAt(0) + '</div>' +
          '<div><h4>' + r.reciter + '</h4><small>' + r.riwayah + '</small></div>';
        card.addEventListener('click', function () { selectReciter(r, card); });
        grid.appendChild(card);
      });
  }

  function selectReciter(r, card) {
    document.querySelectorAll('.reciter').forEach(function (c) { c.classList.remove('playing'); });
    if (card) card.classList.add('playing');
    currentReciter = r;
    $('#player').classList.add('on');
    updatePlayerInfo();
    playAudio();
  }

  function audioURL() {
    return currentReciter.server.replace(/\/$/, '') + '/' + String(currentSurah).padStart(3, '0') + '.mp3';
  }

  function updatePlayerInfo() {
    if (!currentReciter) return;
    var s = MANIFEST.surahs[currentSurah - 1];
    $('#pTitle').textContent = currentReciter.reciter + ' — سورة ' + s.name;
    $('#pSub').textContent = currentReciter.riwayah;
  }

  function playAudio() {
    if (!currentReciter) return;
    audio.src = audioURL();
    audio.play().then(function () { playing = true; $('#playPause').textContent = '⏸'; })
      .catch(function () { playing = false; $('#playPause').textContent = '▶'; });
  }

  $('#playPause').addEventListener('click', function () {
    if (!currentReciter) return;
    if (playing) { audio.pause(); playing = false; $('#playPause').textContent = '▶'; }
    else if (audio.src) { audio.play(); playing = true; $('#playPause').textContent = '⏸'; }
    else playAudio();
  });
  audio.addEventListener('ended', function () { step(1); });
  function step(d) {
    var n = currentSurah + d;
    if (n < 1 || n > 114) return;
    loadSurah(n, true);
    if (currentReciter) playAudio();
  }
  $('#nextBtn').addEventListener('click', function () { step(1); });
  $('#prevBtn').addEventListener('click', function () { step(-1); });
  $('#closePlayer').addEventListener('click', function () {
    audio.pause(); playing = false;
    $('#player').classList.remove('on');
  });

  /* ---------- offline download ---------- */
  $('#offlineBtn').addEventListener('click', async function (e) {
    var btn = e.target;
    btn.disabled = true;
    var c = await caches.open('quran-text-v1');
    for (var i = 1; i <= 114; i++) {
      btn.textContent = '⬇ ' + arNum(i) + ' / ١١٤';
      try { await c.add('data/surah/' + String(i).padStart(3, '0') + '.json'); } catch (err) { /* retry later */ }
    }
    btn.textContent = '✓ محفوظ للقراءة بدون نت';
  });

  /* ---------- hero particles ---------- */
  var cv = $('#stars'), ctx = cv.getContext('2d'), pts = [];
  function resize() {
    cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
    pts = [];
    var count = Math.min(60, Math.floor(cv.width / 18));
    for (var i = 0; i < count; i++) {
      pts.push({ x: Math.random() * cv.width, y: Math.random() * cv.height,
                 r: Math.random() * 1.8 + .4, s: Math.random() * .25 + .05,
                 o: Math.random() * .5 + .15 });
    }
  }
  window.addEventListener('resize', resize);
  resize();
  (function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    pts.forEach(function (p) {
      p.y -= p.s;
      if (p.y < -4) { p.y = cv.height + 4; p.x = Math.random() * cv.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = 'rgba(212,177,94,' + p.o + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- service worker (offline reading) ---------- */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
