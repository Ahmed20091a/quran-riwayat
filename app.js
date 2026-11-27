/* روايات — app logic (no libraries, no external requests except audio CDN) */
(function () {
  'use strict';

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function toLatinDigits(s) { return s.replace(/[٠-٩]/g, function (d) { return String(AR.indexOf(d)); }); }
  function normAr(s) {
    return s.replace(/[ً-ْٰـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
  }
  function $(s) { return document.querySelector(s); }

  /* ---------- state ---------- */
  var MANIFEST = null;
  var PAGES = null;            /* verified page map: every surah starts on its own page */
  var MODE = 'page';           /* 'page' | 'surah' */
  var currentSurah = 1;
  var currentPage = 1;
  var currentReciter = null;
  var playing = false;
  var SURAH_CACHE = {};

  var audio = $('#audio');

  /* screenshot mode: freeze animations, re-scroll to anchor after load */
  var SHOT = location.search.indexOf('shot') !== -1;
  if (SHOT) {
    document.documentElement.classList.add('shot');
    window.addEventListener('load', function () {
      setTimeout(function () {
        var h = location.hash;
        var t = null;
        if (h && h.indexOf('#p=') === 0) t = document.querySelector('.reader-shell');
        else if (h) { try { t = document.querySelector(h); } catch (e) {} }
        if (t) t.scrollIntoView({ block: 'start' });
      }, 1200);
    });
  }

  /* ---------- integrity ---------- */
  async function sha256hex(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  async function loadSurahFile(n) {
    if (SURAH_CACHE[n]) return SURAH_CACHE[n];
    var path = 'data/surah/' + String(n).padStart(3, '0') + '.json';
    try {
      var raw = await (await fetch(path)).text();
      var ok = (await sha256hex(raw)) === MANIFEST.surahs[n - 1].sha256;
      if (!ok) return null;
      var s = JSON.parse(raw);
      SURAH_CACHE[n] = s;
      return s;
    } catch (e) { return null; }
  }

  /* ---------- boot ---------- */
  fetch('data/manifest.json').then(function (r) { return r.json(); }).then(async function (m) {
    MANIFEST = m;
    buildSurahSelect();
    buildChips();
    renderReciters(m.reciters[0] ? m.reciters[0].group : null);
    try {
      var raw = await (await fetch('data/pages.json')).text();
      var ok = (await sha256hex(raw)) === m.pagesSha256;
      if (!ok) throw new Error('pages integrity');
      PAGES = JSON.parse(raw);
      if (!Array.isArray(PAGES) || PAGES.length < 604) throw new Error('pages shape');
      var pt = document.getElementById('pjTotal');
      if (pt) pt.textContent = 'من ' + arNum(PAGES.length);
    } catch (e) {
      PAGES = null;
      MODE = 'surah';
      var pn = $('#pageNav'), mt = $('#modeToggle');
      if (pn) pn.style.display = 'none';
      if (mt) mt.style.display = 'none';
    }
    var hp = parseInt((location.hash.match(/^#p=(\d+)$/) || [])[1], 10);
    if (PAGES) renderPage((hp >= 1 && hp <= PAGES.length) ? hp : 1);
    else loadSurah(1);
  }).catch(function () {
    $('#readerBody').innerHTML = '<div class="reader-loading">تعذر تحميل بيانات المصحف. حدّث الصفحة.</div>';
  });

  /* ---------- controls ---------- */
  function buildSurahSelect() {
    var sel = $('#surahSelect'), psel = $('#pSurah');
    MANIFEST.surahs.forEach(function (s) {
      sel.add(new Option(arNum(s.n) + ' — سورة ' + s.name, s.n));
      psel.add(new Option('سورة ' + s.name, s.n));
    });
    sel.addEventListener('change', function () { gotoSurah(+sel.value); });
    psel.addEventListener('change', function () { gotoSurah(+psel.value, true); if (currentReciter) playAudio(); });
    $('#surahSearch').addEventListener('input', function (e) {
      var q = e.target.value.trim();
      if (!q) { sel.selectedIndex = currentSurah - 1; return; }
      var num = parseInt(toLatinDigits(q), 10);
      if (PAGES && String(num) === toLatinDigits(q) && num >= 1 && num <= PAGES.length) { renderPage(num); return; }
      var nq = normAr(q);
      var hit = MANIFEST.surahs.find(function (s) { return normAr(s.name).indexOf(nq) !== -1; });
      if (hit) gotoSurah(hit.n);
    });
    $('#modeToggle').addEventListener('click', function () { setMode(MODE === 'page' ? 'surah' : 'page'); });
    $('#pagePrev').addEventListener('click', function () { renderPage(currentPage - 1); });
    $('#pageNext').addEventListener('click', function () { renderPage(currentPage + 1); });
    function jump() {
      var v = parseInt(toLatinDigits($('#pageInput').value.trim()), 10);
      if (v >= 1 && v <= PAGES.length) renderPage(v);
    }
    $('#pageGo').addEventListener('click', jump);
    $('#pageInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') jump(); });
    document.addEventListener('keydown', function (e) {
      if (!PAGES || MODE !== 'page') return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (e.key === 'ArrowLeft') renderPage(currentPage + 1);
      else if (e.key === 'ArrowRight') renderPage(currentPage - 1);
    });
    var tx0 = 0, ty0 = 0;
    var rb = $('#readerBody');
    rb.addEventListener('touchstart', function (e) { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
    rb.addEventListener('touchend', function (e) {
      if (!PAGES || MODE !== 'page') return;
      var dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > 55 && Math.abs(dx) > 2 * Math.abs(dy)) renderPage(currentPage + (dx < 0 ? 1 : -1));
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (MODE === 'page' && PAGES) requestAnimationFrame(function () { sizePageBox(); fitPageText(); });
    });
  }

  function setMode(m) {
    if (m === 'page' && !PAGES) return;
    MODE = m;
    $('#pageNav').style.display = (m === 'page') ? 'flex' : 'none';
    $('#modeToggle').textContent = (m === 'page') ? 'عرض السورة كاملة' : 'عرض صفحات المصحف';
    if (m === 'page') renderPage(surahPage(currentSurah));
    else loadSurah(currentSurah);
  }

  function gotoSurah(n, keepBadge) {
    if (n < 1 || n > 114) return;
    if (MODE === 'page' && PAGES) renderPage(surahPage(n));
    else loadSurah(n, keepBadge);
  }

  /* ---------- mushaf page mode ---------- */
  function surahPage(n) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].s === n) return PAGES[i].p;
    return 1;
  }

  function pageSegments(p) {
    var st = PAGES[p - 1];
    var eS, eA;
    if (p === PAGES.length) { eS = 114; eA = MANIFEST.surahs[113].count; }
    else {
      var nx = PAGES[p];
      if (nx.a === 1) { eS = nx.s - 1; eA = MANIFEST.surahs[eS - 1].count; }
      else { eS = nx.s; eA = nx.a - 1; }
    }
    var segs = [];
    for (var s = st.s; s <= eS; s++) {
      var fa = (s === st.s) ? st.a : 1;
      var ta = (s === eS) ? eA : MANIFEST.surahs[s - 1].count;
      segs.push({ s: s, fa: fa, ta: ta });
    }
    return segs;
  }

  async function renderPage(p) {
    if (!PAGES) return;
    if (p < 1) p = 1;
    if (p > PAGES.length) p = PAGES.length;
    if (MODE !== 'page') return;
    currentPage = p;
    history.replaceState(null, '', '#p=' + p);
    $('#pageInput').value = p;
    $('#pagePrev').disabled = (p === 1);
    $('#pageNext').disabled = (p === PAGES.length);
    var badge = $('#verifyBadge');
    badge.hidden = true;

    var segs = pageSegments(p);
    var startSurah = segs[0].s;
    for (var i = 0; i < segs.length; i++) {
      if (segs[i].fa === 1) startSurah = segs[i].s;
    }
    currentSurah = startSurah;
    $('#surahSelect').value = startSurah;
    $('#pSurah').value = startSurah;
    updatePlayerInfo();

    $('#readerBody').innerHTML = '<div class="reader-loading">جارٍ تحميل الصفحة…</div>';

    var loaded = {};
    for (var k = 0; k < segs.length; k++) {
      var sj = await loadSurahFile(segs[k].s);
      if (!sj) {
        $('#readerBody').innerHTML = '<div class="reader-loading">⚠ تعذر التحقق من سلامة نص الصفحة، لم تُعرض حمايةً للنص.</div>';
        return;
      }
      loaded[segs[k].s] = sj;
    }

    var html = '<div class="mp-head"><span class="mp-surah">سورة ' + MANIFEST.surahs[startSurah - 1].name +
      '</span><span class="mp-juz">الجزء ' + arNum(PAGES[p - 1].j) + '</span></div><div class="mp-body" id="mpBody"><div class="mp-inner" id="mpInner">';
    segs.forEach(function (sg) {
      var d = loaded[sg.s];
      if (sg.fa === 1) {
        html += '<div class="mp-shead">سورة ' + MANIFEST.surahs[sg.s - 1].name + '</div>';
        if (sg.s !== 1 && sg.s !== 9 && d.ayahs[0].indexOf('بِسْمِ') !== 0) html += '<div class="mp-bsm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>';
      }
      for (var a = sg.fa; a <= sg.ta; a++) {
        html += '<span class="ayah" data-s="' + sg.s + '" data-a="' + a + '">' + d.ayahs[a - 1] +
          ' <span class="an">﴿' + arNum(a) + '﴾</span></span> ';
      }
    });
    html += '</div></div><div class="mp-foot">— ' + arNum(p) + ' —</div>';
    $('#readerBody').innerHTML = '<div class="mushaf-wrap"><div class="mushaf-page">' + html + '</div></div>';
    badge.hidden = false;
    sizePageBox();
    fitPageText();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPageText);
    setTimeout(fitPageText, 150);
    setTimeout(fitPageText, 700);
  }

  function sizePageBox() {
    var page = document.querySelector('.mushaf-page');
    if (!page) return;
    var navH = (document.querySelector('nav') || { offsetHeight: 60 }).offsetHeight;
    var barH = (document.querySelector('.reader-bar') || { offsetHeight: 64 }).offsetHeight;
    var nav2 = document.getElementById('pageNav');
    var nav2H = nav2 ? nav2.offsetHeight : 56;
    var hh = window.innerHeight - navH - barH - nav2H - 64;
    hh = Math.max(360, Math.min(hh, 940));
    page.style.height = hh + 'px';
    var shell = document.querySelector('.reader-shell');
    if (shell && Math.abs(shell.getBoundingClientRect().top - navH) > 12) {
      shell.scrollIntoView({ block: 'start' });
    }
  }

  function fitPageText() {
    var body = $('#mpBody');
    if (!body) return;
    var inner = document.getElementById('mpInner');
    if (!inner) return;
    var lo = 12, hi = 36, best = lo;
    for (var it = 0; it < 12; it++) {
      var mid = (lo + hi) / 2;
      body.style.fontSize = mid + 'px';
      if (inner.scrollHeight <= body.clientHeight + 1) { best = mid; lo = mid; } else { hi = mid; }
    }
    body.style.fontSize = best.toFixed(2) + 'px';
  }

  /* refit after the Quran font swaps in (metrics change height) */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (MODE === 'page') fitPageText();
    });
  }
  window.addEventListener('load', function () {
    if (MODE === 'page') setTimeout(fitPageText, 60);
  });

  /* ---------- surah (scroll) mode ---------- */
  function loadSurah(n, keepBadge) {
    currentSurah = n;
    history.replaceState(null, '', '#mushaf');
    $('#surahSelect').value = n;
    $('#pSurah').value = n;
    var badge = $('#verifyBadge');
    if (!keepBadge) badge.hidden = true;
    $('#readerBody').innerHTML = '<div class="reader-loading">جارٍ تحميل السورة…</div>';
    loadSurahFile(n).then(function (s) {
      if (!s) {
        $('#readerBody').innerHTML = '<div class="reader-loading">⚠ تعذر التحقق من سلامة نص السورة، لم يُعرض حمايةً للنص.</div>';
        return;
      }
      badge.hidden = false;
      renderSurah(s);
      updatePlayerInfo();
    });
  }

  function renderSurah(s) {
    var html = '<div class="surah-title"><h3>سورة ' + s.name + '</h3>' +
      '<div class="meta">' + s.type + ' · ' + arNum(s.ayahs.length) + ' آية</div>';
    if (s.n !== 1 && s.n !== 9 && s.ayahs[0].indexOf('بِسْمِ') !== 0) html += '<div class="bsm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>';
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
    gotoSurah(n, true);
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
    var c = await caches.open('quran-text-v2');
    try { await c.add('data/pages.json'); } catch (err) {}
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
