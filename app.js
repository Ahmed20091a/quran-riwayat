/* روايات — app logic (no libraries, no external requests except audio CDN) */
(function () {
  'use strict';

  var AR = '٠١٢٣٤٥٦٧٨٩';
  var IC = {
    play: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l10.7-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z"/></svg>', pause: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>', prev: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2.2v12H16zM6 18l8.8-6L6 6z"/></svg>', next: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.8 6H8v12H5.8zM18 18V6l-8.8 6z"/></svg>', back: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2.2L7.6 6 12 9.8V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>', fwd: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="transform:scaleX(-1)"><path d="M12 5V2.2L7.6 6 12 9.8V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>', close: '<svg class="ic ic-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>'
  };
  function ico(k) { return IC[k]; }
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

  /* The stored text of ayah 1 (surahs 2-114 except 9) opens with the bismillah.
     Display-only split: the stored/verified text is never changed. */
  function splitBsm(n, txt) {
    if (n === 1 || n === 9) return ['', txt];
    var m = /^(\S+\s+\S+\s+\S+\s+\S+)\s+([\s\S]*)$/.exec(txt);
    if (m && m[1].replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').indexOf('بسم') === 0) return [m[1], m[2]];
    return ['', txt];
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
    updateResumeChip();
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
    rememberPage(startSurah, segs[0].fa, p);
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
        var sb = splitBsm(sg.s, d.ayahs[0])[0];
        if (sb) html += '<div class="mp-bsm" data-bs="' + sg.s + '">' + sb + '</div>';
      }
      for (var a = sg.fa; a <= sg.ta; a++) {
        if (sg.s === 1 && a === 1) {
          html += '<div class="mp-bsm"><span class="ayah" data-s="1" data-a="1">' + d.ayahs[0] + '</span></div>';
          continue;
        }
        html += '<span class="ayah" data-s="' + sg.s + '" data-a="' + a + '">' + (a === 1 ? splitBsm(sg.s, d.ayahs[0])[1] : d.ayahs[a - 1]) +
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

  function fitOnce(body, inner) {
    var lo = 12, hi = 36, best = lo;
    for (var it = 0; it < 12; it++) {
      var mid = (lo + hi) / 2;
      body.style.fontSize = mid + 'px';
      if (inner.scrollHeight <= body.clientHeight - 6) { best = mid; lo = mid; } else { hi = mid; }
    }
    return best;
  }

  function fitPageText() {
    var body = $('#mpBody');
    if (!body) return;
    var inner = document.getElementById('mpInner');
    if (!inner) return;
    body.classList.remove('tight');
    var best = fitOnce(body, inner);
    /* very dense page: trade a little air between ayahs for a readable size */
    if (best < 15) {
      body.classList.add('tight');
      best = fitOnce(body, inner);
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
    var sb = splitBsm(s.n, s.ayahs[0])[0];
    if (sb) html += '<div class="bsm" data-bs="' + s.n + '">' + sb + '</div>';
    if (s.n === 1) html += '<div class="bsm"><span class="ayah" data-i="0" data-s="1" data-a="1">' + s.ayahs[0] + '</span></div>';
    html += '</div><div class="ayahs">';
    s.ayahs.forEach(function (t, i) {
      if (s.n === 1 && i === 0) return;
      html += '<span class="ayah" data-i="' + i + '" data-s="' + s.n + '" data-a="' + (i + 1) + '">' + (i === 0 ? splitBsm(s.n, t)[1] : t) +
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

  function arKey(s) {
    return s.replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
  }
  function arSort(a, b) { return arKey(a).localeCompare(arKey(b), 'ar'); }
  function renderReciters(group) {
    var grid = $('#reciterGrid');
    grid.innerHTML = '';
    MANIFEST.reciters.filter(function (r) { return !group || r.group === group; })
      .sort(function (x, y) { return arSort(x.reciter, y.reciter) || arSort(x.riwayah, y.riwayah); })
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
    if (typeof ayStop === 'function') ayStop();
    if (currentReciter.missing && currentReciter.missing.indexOf(currentSurah) !== -1) {
      var nx = currentSurah; do { nx = nx >= 114 ? 1 : nx + 1; } while (currentReciter.missing.indexOf(nx) !== -1);
      gotoSurah(nx, true);
    }
    audio.src = audioURL();
    audio.play().then(function () { playing = true; $('#playPause').innerHTML = ico('pause'); })
      .catch(function () { playing = false; $('#playPause').innerHTML = ico('play'); });
  }

  $('#playPause').addEventListener('click', function () {
    if (!currentReciter) return;
    if (playing) { audio.pause(); playing = false; $('#playPause').innerHTML = ico('play'); }
    else if (audio.src) { audio.play(); playing = true; $('#playPause').innerHTML = ico('pause'); }
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


  /* ---------- ayah sheet: tafsir · per-ayah recitation · bookmark ---------- */
  var AYAH_RECITERS = [
    { id: 'ar.alafasy', name: 'مشاري العفاسي', br: 128 },
    { id: 'ar.husary', name: 'محمود خليل الحصري (مرتل)', br: 128 },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي (مرتل)', br: 128 },
    { id: 'ar.mahermuaiqly', ea: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي' },
    { id: 'ar.shaatree', name: 'أبو بكر الشاطري', br: 128 },
    { id: 'ar.hudhaify', ea: 'Hudhaify_128kbps', name: 'علي الحذيفي' },
    { id: 'ar.ahmedajamy', ea: 'ahmed_ibn_ali_al_ajamy_128kbps', name: 'أحمد بن علي العجمي' },
    { id: 'ar.muhammadayyoub', ea: 'Muhammad_Ayyoub_128kbps', name: 'محمد أيوب' },
    { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتل)', br: 64 },
    { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس', br: 64 },
    { id: 'ar.saoodshuraym', name: 'سعود الشريم', br: 64 },
    { id: 'ar.aymanswoaid', ea: 'Ayman_Sowaid_64kbps', name: 'أيمن سويد (تعليمي)' },
    { id: 'ea:Husary_128kbps_Mujawwad', ea: 'Husary_128kbps_Mujawwad', name: 'محمود خليل الحصري (مجوّد)' },
    { id: 'ea:Husary_Muallim_128kbps', ea: 'Husary_Muallim_128kbps', name: 'محمود خليل الحصري (المعلّم، للتعليم)' },
    { id: 'ea:Minshawy_Mujawwad_192kbps', ea: 'Minshawy_Mujawwad_192kbps', name: 'محمد صديق المنشاوي (مجوّد)' },
    { id: 'ea:mahmoud_ali_al_banna_32kbps', ea: 'mahmoud_ali_al_banna_32kbps', name: 'محمود علي البنا' },
    { id: 'ea:Abdul_Basit_Mujawwad_128kbps', ea: 'Abdul_Basit_Mujawwad_128kbps', name: 'عبد الباسط عبد الصمد (مجوّد)' },
    { id: 'ea:Muhammad_Jibreel_128kbps', ea: 'Muhammad_Jibreel_128kbps', name: 'محمد جبريل' },
    { id: 'ea:Mohammad_al_Tablaway_128kbps', ea: 'Mohammad_al_Tablaway_128kbps', name: 'محمد الطبلاوي' },
    { id: 'ea:Abdullah_Basfar_192kbps', ea: 'Abdullah_Basfar_192kbps', name: 'عبد الله بصفر' },
    { id: 'ea:Salah_Al_Budair_128kbps', ea: 'Salah_Al_Budair_128kbps', name: 'صلاح البدير' },
    { id: 'ea:Abdullah_Matroud_128kbps', ea: 'Abdullah_Matroud_128kbps', name: 'عبد الله مطرود' },
    { id: 'ea:Ahmed_Neana_128kbps', ea: 'Ahmed_Neana_128kbps', name: 'أحمد نعينع (مرتل)' },
    { id: 'ea:Muhammad_AbdulKareem_128kbps', ea: 'Muhammad_AbdulKareem_128kbps', name: 'محمد عبد الكريم' },
    { id: 'ea:Salaah_AbdulRahman_Bukhatir_128kbps', ea: 'Salaah_AbdulRahman_Bukhatir_128kbps', name: 'صلاح بوخاطر' },
    { id: 'ea:Muhsin_Al_Qasim_192kbps', ea: 'Muhsin_Al_Qasim_192kbps', name: 'محسن القاسم' },
    { id: 'ea:Abdullaah_3awwaad_Al-Juhaynee_128kbps', ea: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', name: 'عبد الله عواد الجهني' },
    { id: 'ea:Khaalid_Abdullaah_al-Qahtaanee_192kbps', ea: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', name: 'خالد القحطاني' },
    { id: 'ea:Ali_Hajjaj_AlSuesy_128kbps', ea: 'Ali_Hajjaj_AlSuesy_128kbps', name: 'علي حجاج السويسي' },
    { id: 'ea:Sahl_Yassin_128kbps', ea: 'Sahl_Yassin_128kbps', name: 'سهل ياسين' },
    { id: 'ea:Akram_AlAlaqimy_128kbps', ea: 'Akram_AlAlaqimy_128kbps', name: 'أكرم العلاقمي' },
    { id: 'ea:Ali_Jaber_64kbps', ea: 'Ali_Jaber_64kbps', name: 'علي جابر' },
    { id: 'ea:Fares_Abbad_64kbps', ea: 'Fares_Abbad_64kbps', name: 'فارس عباد' },
    { id: 'ea:Yaser_Salamah_128kbps', ea: 'Yaser_Salamah_128kbps', name: 'ياسر سلامة' },
    { id: 'ea:khalefa_al_tunaiji_64kbps', ea: 'khalefa_al_tunaiji_64kbps', name: 'خليفة الطنيجي' },
    { id: 'ea:Hani_Rifai_192kbps', ea: 'Hani_Rifai_192kbps', name: 'هاني الرفاعي' },
    { id: 'ea:Ghamadi_40kbps', ea: 'Ghamadi_40kbps', name: 'سعد الغامدي' },
    { id: 'ea:Nasser_Alqatami_128kbps', ea: 'Nasser_Alqatami_128kbps', name: 'ناصر القطامي' },
    { id: 'ea:Yasser_Ad-Dussary_128kbps', ea: 'Yasser_Ad-Dussary_128kbps', name: 'ياسر الدوسري' }
  ];

  /* recitations that have verified word timings on quran.com (same audio files as the timings) */
  var KARAOKE_Q = {
    'ar.alafasy': [7, 'https://verses.quran.com/Alafasy/mp3/'],
    'ar.husary': [6, 'https://mirrors.quranicaudio.com/everyayah/Husary_64kbps/'],
    'ar.minshawi': [9, 'https://verses.quran.com/Minshawi/Murattal/mp3/'],
    'ar.shaatree': [4, 'https://verses.quran.com/Shatri/mp3/'],
    'ar.abdulbasitmurattal': [2, 'https://verses.quran.com/AbdulBaset/Murattal/mp3/'],
    'ar.abdurrahmaansudais': [3, 'https://verses.quran.com/Sudais/mp3/'],
    'ar.saoodshuraym': [10, 'https://verses.quran.com/Shuraym/mp3/'],
    'ea:Husary_Muallim_128kbps': [12, 'https://mirrors.quranicaudio.com/everyayah/Husary_Muallim_128kbps/'],
    'ea:Mohammad_al_Tablaway_128kbps': [11, 'https://mirrors.quranicaudio.com/everyayah/Mohammad_al_Tablaway_128kbps/'],
    'ea:Hani_Rifai_192kbps': [5, 'https://verses.quran.com/Rifai/mp3/'],
    'ea:Abdul_Basit_Mujawwad_128kbps': [1, 'https://verses.quran.com/AbdulBaset/Mujawwad/mp3/'],
    'ea:Minshawy_Mujawwad_192kbps': [8, 'https://verses.quran.com/Minshawi/Mujawwad/mp3/']
  };
  AYAH_RECITERS.forEach(function (r) { var k = KARAOKE_Q[r.id]; if (k) { r.q = k[0]; r.qb = k[1]; } });
  AYAH_RECITERS.sort(function (x, y) { return arSort(x.name, y.name); });
  var AYAH_DEFAULT = 'ar.alafasy';

  var TAFSIRS = [
    { slug: 'ar-tafsir-muyassar', name: 'التفسير الميسر' },
    { slug: 'ar-tafsir-al-mukhtasar', name: 'المختصر في التفسير' },
    { slug: 'ar-tafsir-al-jalalayn', name: 'تفسير الجلالين' },
    { slug: 'ar-tafsir-as-saadi', name: 'تفسير السعدي' },
    { slug: 'ar-tafsir-ibn-kathir', name: 'تفسير ابن كثير' },
    { slug: 'ar-tafsir-al-tabari', name: 'تفسير الطبري' },
    { slug: 'ar-tafseer-al-qurtubi', name: 'تفسير القرطبي' },
    { slug: 'ar-tafsir-al-baghawi', name: 'تفسير البغوي' },
    { slug: 'ar-tafsir-al-wasit', name: 'الوسيط لطنطاوي' },
    { slug: 'ar-tafseer-tahrir-al-tanwir', name: 'التحرير والتنوير' },
    { slug: 'al-kashshaf-al-zamakhshari', name: 'الكشاف للزمخشري' },
    { slug: 'fath-al-qadir-al-shawkani', name: 'فتح القدير للشوكاني' },
    { slug: 'al-bahr-al-muhit', name: 'البحر المحيط' },
    { slug: 'tafsir-al-baydawi', name: 'تفسير البيضاوي' },
    { slug: 'tafsir-al-razi', name: 'تفسير الرازي' },
    { slug: 'tafsir-al-nasafi', name: 'تفسير النسفي' },
    { slug: 'al-durr-al-manthur', name: 'الدر المنثور' },
    { slug: 'tafsir-al-alusi', name: 'روح المعاني للآلوسي' }
  ];

  var TAF_BASE = 'https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/';
  var sheetState = { s: 0, a: 0, tab: 'play', cache: {} };
  var ayahAudioEl = document.getElementById('ayahAudio');

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var AYAH_OFFSET = null;
  function ayahGlobal(s, a) {
    if (!AYAH_OFFSET) {
      AYAH_OFFSET = [];
      var t = 0;
      MANIFEST.surahs.forEach(function (x) { AYAH_OFFSET.push(t); t += x.count; });
    }
    return AYAH_OFFSET[s - 1] + a;
  }

  function lastMap() {
    try { return JSON.parse(localStorage.getItem('quran.last') || '{}'); } catch (e) { return {}; }
  }

  function lastFor(s) {
    var m = lastMap();
    return m[s] || null;
  }

  function rememberPage(s, a, p) {
    try {
      var m = lastMap();
      m[s] = { a: a, p: p };
      localStorage.setItem('quran.last', JSON.stringify(m));
    } catch (e) {}
  }

  function openSheet(s, a) {
    sheetState.s = s; sheetState.a = a;
    document.getElementById('sheetRef').textContent = 'سورة ' + MANIFEST.surahs[s - 1].name + ' · آية ' + arNum(a);
    var ay = document.getElementById('sheetAyah');
    ay.textContent = '';
    document.getElementById('ayahSheet').hidden = false;
    loadSurahFile(s).then(function (sj) { if (sj) ay.textContent = a === 1 ? splitBsm(s, sj.ayahs[0])[1] : sj.ayahs[a - 1]; });
    sheetTab('play');
  }

  function closeSheet(keepAudio) {
    document.getElementById('ayahSheet').hidden = true;
    if (ayahAudioEl && keepAudio !== true && !AY.on) { try { ayahAudioEl.pause(); } catch (e) {} }
  }

  function sheetTab(tab) {
    sheetState.tab = tab;
    document.querySelectorAll('.sheet-tab').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-tab') === tab);
    });
    var box = document.getElementById('sheetBody');
    box.innerHTML = '';
    box.scrollTop = 0;
    if (tab === 'play') renderPlay(box);
    else if (tab === 'taf') renderTaf(box);
    else renderStop(box);
  }

  function renderPlay(box) {
    var row = document.createElement('div'); row.className = 'sheet-row';
    var sel = document.createElement('select');
    AYAH_RECITERS.forEach(function (r) { sel.add(new Option(r.name, r.id)); });
    sel.value = lsGet('quran.ayahReciter', AYAH_DEFAULT);
    if (!sel.value) sel.value = AYAH_DEFAULT;
    row.appendChild(sel);
    box.appendChild(row);
    var row2 = document.createElement('div'); row2.className = 'sheet-row play-choice';
    var b2 = document.createElement('button'); b2.className = 'btn primary';
    b2.innerHTML = ico('play') + '<span>تشغيل متواصل من هذه الآية</span>';
    var b1 = document.createElement('button'); b1.className = 'btn';
    b1.innerHTML = ico('play') + '<span>هذه الآية فقط</span>';
    b1.addEventListener('click', function () { startAy(sel.value, sheetState.s, sheetState.a, 'ayah'); });
    b2.addEventListener('click', function () { startAy(sel.value, sheetState.s, sheetState.a, 'surah'); });
    row2.appendChild(b2); row2.appendChild(b1);
    box.appendChild(row2);
    var hint = document.createElement('div'); hint.className = 'hint';
    hint.textContent = '«تشغيل متواصل» بيكمّل لوحده آية بعد آية وسورة بعد سورة (مع البسملة) لحد ما توقفه. «هذه الآية فقط» بيشغّل الآية دي ويقف. بتتحمّل من الإنترنت وقت التشغيل بس، ومش بتتحفظ على الجهاز.';
    box.appendChild(hint);
  }

  /* ---------- ayah player bar ---------- */
  var AY = { s: 0, a: 0, rec: null, mode: 'ayah', on: false };
  var ayBar = null;
  function fmtT(t) { if (!isFinite(t) || t < 0) t = 0; var m = Math.floor(t / 60), x = Math.floor(t % 60); return arNum(m) + ':' + arNum(x < 10 ? '0' + x : x); }
  function buildAyBar() {
    if (ayBar) return;
    ayBar = document.createElement('div');
    ayBar.id = 'ayPlayer'; ayBar.className = 'ay-player'; ayBar.hidden = true;
    ayBar.innerHTML =
      '<div class="ay-top"><div class="ay-ring" id="ayRing"><button class="ay-play" id="ayPlay" aria-label="تشغيل / إيقاف">' + ico('play') + '</button></div>' +
      '<div class="ay-info"><b id="ayTitle">—</b><small id="ayRec">—</small></div>' +
      '<div class="ay-mode" id="ayMode" role="group"><button data-m="surah">متواصل</button><button data-m="ayah">آية</button></div>' +
      '<button class="ay-x" id="ayClose" aria-label="إغلاق">' + ico('close') + '</button></div>' +
      '<div class="ay-seek"><span id="ayCur">٠:٠٠</span><input id="aySlider" type="range" min="0" max="1000" value="0" dir="rtl" aria-label="التحكم في موضع التلاوة"><span id="ayDur">٠:٠٠</span></div>' +
      '<div class="ay-ctrl"><button class="ay-b" id="ayPrev" aria-label="الآية السابقة">' + ico('prev') + '<span>السابقة</span></button><button class="ay-b" id="ayBack" aria-label="رجوع ١٠ ثواني">' + ico('back') + '<span>١٠</span></button><div class="ay-dots" id="ayDots"></div><button class="ay-b" id="ayFwd" aria-label="تقدّم ١٠ ثواني"><span>١٠</span>' + ico('fwd') + '</button><button class="ay-b" id="ayNext" aria-label="الآية التالية"><span>التالية</span>' + ico('next') + '</button></div>';
    document.body.appendChild(ayBar);
    var sl = ayBar.querySelector('#aySlider');
    document.getElementById('ayPlay').addEventListener('click', function () {
      if (ayahAudioEl.paused) ayahAudioEl.play(); else ayahAudioEl.pause();
    });
    sl.addEventListener('input', function () {
      if (isFinite(ayahAudioEl.duration)) ayahAudioEl.currentTime = ayahAudioEl.duration * sl.value / 1000;
    });
    document.getElementById('ayBack').addEventListener('click', function () { ayahAudioEl.currentTime = Math.max(0, ayahAudioEl.currentTime - 10); });
    document.getElementById('ayFwd').addEventListener('click', function () { if (isFinite(ayahAudioEl.duration)) ayahAudioEl.currentTime = Math.min(ayahAudioEl.duration, ayahAudioEl.currentTime + 10); });
    document.getElementById('ayNext').addEventListener('click', function () { ayStep(1, true); });
    document.getElementById('ayPrev').addEventListener('click', function () { ayStep(-1, true); });
    document.getElementById('ayClose').addEventListener('click', ayStop);
    ayBar.querySelectorAll('#ayMode button').forEach(function (b) {
      b.addEventListener('click', function () { AY.mode = b.getAttribute('data-m'); ayPaintMode(); ayPreload(); });
    });
    ayWire(ayahAudioEl); ayWire(ayAlt);
    var inf = ayBar.querySelector('.ay-info');
    inf.style.cursor = 'pointer';
    inf.setAttribute('role', 'button');
    inf.addEventListener('click', function () {
      ayHighlight();
      var rd = document.getElementById('reader'); if (rd && !document.querySelector('#readerBody .ayah.playing')) { try { rd.scrollIntoView({ behavior: 'smooth' }); } catch (e) {} }
    });
    ayMediaSession();
  }
  /* two audio elements: the idle one preloads the next ayah, so the hand-over has no network gap */
  var ayAlt = new Audio();
  ayAlt.preload = 'auto';
  ayAlt.id = 'ayahAudio2'; ayAlt.hidden = true; document.body.appendChild(ayAlt);
  var ayPre = null, ayUnlocked = false;
  function ayWire(el) {
    function cur(fn) { return function (e) { if (e.target === ayahAudioEl) fn(e); }; }
    el.addEventListener('timeupdate', cur(function () { ayTick(); ayCheckTrim(); }));
    el.addEventListener('durationchange', cur(ayTick));
    el.addEventListener('play', cur(ayPaintPlay));
    el.addEventListener('pause', cur(ayPaintPlay));
    el.addEventListener('ended', cur(function () {
      if (!AY.on) return;
      if (AY.mode === 'surah') ayStep(1, false);
      else ayPaintPlay();
    }));
    el.addEventListener('error', cur(function () { if (AY.on) { var t = document.getElementById('ayRec'); t.textContent = 'تعذّر تحميل التلاوة. تأكد من النت وجرّب تاني.'; } }));
  }
  function ayMediaSession() {
    if (!('mediaSession' in navigator)) return;
    var ms = navigator.mediaSession;
    function h(n, f) { try { ms.setActionHandler(n, f); } catch (e) {} }
    h('play', function () { ayahAudioEl.play(); });
    h('pause', function () { ayahAudioEl.pause(); });
    h('nexttrack', function () { ayStep(1, true); });
    h('previoustrack', function () { ayStep(-1, true); });
    h('seekbackward', function () { ayahAudioEl.currentTime = Math.max(0, ayahAudioEl.currentTime - 10); });
    h('seekforward', function () { if (isFinite(ayahAudioEl.duration)) ayahAudioEl.currentTime = Math.min(ayahAudioEl.duration, ayahAudioEl.currentTime + 10); });
  }
  function ayNextPos(s, a) {
    var n = MANIFEST.surahs[s - 1].count;
    if (a < n) return [s, a + 1];
    s = s >= 114 ? 1 : s + 1;      /* continue into the next surah, wrap 114 -> 1 */
    return [s, hasBsm(s) ? 0 : 1];
  }
  /* Silence trimming: the next clip is downloaded once, decoded to find where the voice starts and
     ends, and played from a local copy. Recorded silence at the edges of each file is skipped
     (a short natural pause is kept). If the file can't be read this way, it just plays untrimmed. */
  var ayCtx = null;
  function ayEdges(buf) {
    var d = buf.getChannelData(0), sr = buf.sampleRate, fr = Math.max(1, Math.round(sr * 0.01));
    var n = Math.floor(d.length / fr), e = new Float32Array(n), peak = 0, i, k, s;
    for (i = 0; i < n; i++) { s = 0; for (k = 0; k < fr; k++) { var v = d[i * fr + k]; s += v * v; } e[i] = Math.sqrt(s / fr); if (e[i] > peak) peak = e[i]; }
    var thr = Math.max(peak * 0.03, 0.002), a = 0, b = n - 1;
    while (a < n && e[a] < thr) a++;
    while (b > a && e[b] < thr) b--;
    return { lead: a * 0.01, trail: (n - 1 - b) * 0.01, dur: d.length / sr };
  }
  function ayFetchClip(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('http'); return r.arrayBuffer(); }).then(function (ab) {
      var blob = new Blob([ab.slice(0)], { type: 'audio/mpeg' });
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return { blob: URL.createObjectURL(blob), lead: 0, trail: 0 };
      if (!ayCtx) ayCtx = new AC();
      return new Promise(function (res, rej) { ayCtx.decodeAudioData(ab, res, rej); }).then(function (buf) {
        var ed = ayEdges(buf);
        return { blob: URL.createObjectURL(blob), lead: Math.max(0, ed.lead - 0.08), trail: Math.max(0, ed.trail - 0.15) };
      });
    });
  }
  function ayPreload() {
    if (AY.mode !== 'surah' || !AY.on) { ayPre = null; return; }
    var np = ayNextPos(AY.s, AY.a);
    if (!np) { ayPre = null; return; }
    var url = ayUrl(AY.rec, np[0], np[1]);
    if (AY.rec.q && np[0] !== AY.s && np[0] > 0) qSegs(AY.rec.q, np[0], np[1]);
    var pre = { s: np[0], a: np[1], url: url, rec: AY.rec.id, ready: false };
    ayPre = pre;
    ayFetchClip(url).then(function (c) {
      if (ayPre !== pre) { try { URL.revokeObjectURL(c.blob); } catch (e) {} return; }
      pre.blob = c.blob; pre.lead = c.lead; pre.trail = c.trail; pre.ready = true;
      ayAlt.src = c.blob; ayAlt.load();
    }).catch(function () {
      if (ayPre !== pre) return;
      ayAlt.src = url; ayAlt.load();   /* untrimmed fallback */
    });
    if (!ayUnlocked) ayUnlock();
  }
  var ayWav = null;
  function ayUnlock() {
    /* play a 0.2s silent clip on the second element inside the user's tap, so mobile browsers let it start by itself later */
    ayUnlocked = true;
    if (!ayWav) {
      var n = 1600, b = new Uint8Array(44 + n), dv = new DataView(b.buffer);
      var w = function (o, s) { for (var i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
      w(0, 'RIFF'); dv.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
      dv.setUint16(22, 1, true); dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
      w(36, 'data'); dv.setUint32(40, n, true); for (var i = 0; i < n; i++) b[44 + i] = 128;
      ayWav = URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
    }
    var el = ayAlt, keep = el.src;
    el.muted = true; el.src = ayWav;
    var up = el.play();
    var done = function () { el.muted = false; try { if (el.src === ayWav) { el.pause(); el.currentTime = 0; } } catch (e) {} };
    if (up && up.then) up.then(done, function () { el.muted = false; ayUnlocked = false; }); else done();
  }
  function ayCheckTrim() {
    var c = AY.cur;
    if (!c || c.done || AY.mode !== 'surah' || !AY.on || c.trail < 0.05) return;
    var d = ayahAudioEl.duration;
    if (isFinite(d) && d > 0 && ayahAudioEl.currentTime >= d - c.trail) { c.done = true; ayStep(1, false); }
  }
  function ayPaintMode() {
    ayBar.querySelectorAll('#ayMode button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-m') === AY.mode); });
  }
  function ayPaintPlay() {
    if (!ayBar) return;
    document.getElementById('ayPlay').innerHTML = ayahAudioEl.paused ? ico('play') : ico('pause');
    ayBar.classList.toggle('is-playing', !ayahAudioEl.paused);
  }
  function ayTick() {
    if (!ayBar || !AY.on) return;
    var d = ayahAudioEl.duration, c = ayahAudioEl.currentTime, p = isFinite(d) && d > 0 ? c / d : 0;
    var sl = document.getElementById('aySlider');
    if (document.activeElement !== sl) sl.value = Math.round(p * 1000);
    sl.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    document.getElementById('ayRing').style.setProperty('--p', (p * 360).toFixed(1) + 'deg');
    document.getElementById('ayCur').textContent = fmtT(c);
    document.getElementById('ayDur').textContent = fmtT(d);
  }
  function ayDots() {
    var n = MANIFEST.surahs[AY.s - 1].count, box = document.getElementById('ayDots');
    box.textContent = AY.a === 0 ? 'البسملة' : 'آية ' + arNum(AY.a) + ' من ' + arNum(n);
  }
  function ayHighlight() {
    kUnwrap();
    document.querySelectorAll('.ayah.playing,[data-bs].playing').forEach(function (e) { e.classList.remove('playing'); });
    var sel0 = AY.a === 0 ? '#readerBody [data-bs="' + AY.s + '"]' : '#readerBody .ayah[data-s="' + AY.s + '"][data-a="' + AY.a + '"]';
    var el = document.querySelector(sel0);
    if (el) { el.classList.add('playing'); try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} return; }
    /* reader is showing something else: bring the ayah into view */
    if (MODE === 'page' && PAGES) renderPage(pageOfAyah(AY.s, AY.a));
    else loadSurah(AY.s, true);
    setTimeout(function () {
      var e2 = document.querySelector(sel0);
      if (e2) { e2.classList.add('playing'); try { e2.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
    }, 900);
  }

  /* ---------- word-by-word follow-along (only with verified quran.com word timings) ---------- */
  var QC = {}, K = null, kBad = '', kRun = false;
  function qSegs(q, s, a) {
    var key = q + ':' + s;
    if (!QC[key]) {
      QC[key] = { map: null };
      fetch('https://api.quran.com/api/v4/recitations/' + q + '/by_chapter/' + s + '?fields=segments&per_page=300')
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (j) {
          var map = {};
          (j.audio_files || []).forEach(function (x) {
            if (x.segments && x.segments.length) map[x.verse_key] = x.segments.map(function (g) { return g.map(Number); });
          });
          QC[key].map = map;
        })
        .catch(function () { QC[key].fail = true; });
    }
    var m = QC[key].map;
    return (m && m[s + ':' + a]) || null;
  }
  function kWords(txt) {
    var re = /\S+/g, m, out = [];
    while ((m = re.exec(txt))) {
      var letters = m[0].replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08D3-\u08FF]/g, '');
      if (!letters && out.length) out[out.length - 1].end = m.index + m[0].length;
      else out.push({ start: m.index, end: m.index + m[0].length });
    }
    return out;
  }
  function kUnwrap() {
    if (!K) return;
    try { if (K.wrap.parentNode) K.wrap.parentNode.replaceChild(K.node, K.wrap); } catch (e) {}
    K = null;
  }
  function kWrap(el, segs, key) {
    var node = null;
    for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) { node = c; break; }
    if (!node) { kBad = key; return; }
    var text = node.nodeValue, ws = kWords(text);
    var mx = 0; segs.forEach(function (g) { if (g[1] > mx) mx = g[1]; });
    var d = ayahAudioEl.duration;
    var lastEnd = segs[segs.length - 1][3];
    if (ws.length !== mx || (isFinite(d) && lastEnd > d * 1000 + 1500)) { kBad = key; return; }
    var wrap = document.createElement('span'); wrap.className = 'kw';
    var pos = 0, spans = [];
    ws.forEach(function (w) {
      if (w.start > pos) wrap.appendChild(document.createTextNode(text.slice(pos, w.start)));
      var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = text.slice(w.start, w.end);
      wrap.appendChild(sp); spans.push(sp); pos = w.end;
    });
    if (pos < text.length) wrap.appendChild(document.createTextNode(text.slice(pos)));
    el.replaceChild(wrap, node);
    K = { el: el, node: node, wrap: wrap, spans: spans, segs: segs, key: key, cur: -1 };
  }
  function kLoop() {
    if (!AY.on) { kUnwrap(); kRun = false; return; }
    ayCheckTrim();
    var want = (AY.a > 0 && AY.rec && AY.rec.q) ? AY.s + ':' + AY.a : '';
    if (K && K.key !== want) kUnwrap();
    if (!K && want && kBad !== want) {
      var segs = qSegs(AY.rec.q, AY.s, AY.a);
      var el = segs && document.querySelector('#readerBody .ayah[data-s="' + AY.s + '"][data-a="' + AY.a + '"]');
      if (el) kWrap(el, segs, want);
    }
    if (K) {
      var t = ayahAudioEl.currentTime * 1000, idx = -1;
      for (var i = 0; i < K.segs.length; i++) { if (K.segs[i][2] <= t) idx = i; else break; }
      var w = idx < 0 ? -1 : K.segs[idx][1] - 1;
      if (w !== K.cur) {
        if (K.cur >= 0 && K.spans[K.cur]) K.spans[K.cur].classList.remove('wh');
        if (w >= 0 && K.spans[w]) K.spans[w].classList.add('wh');
        K.cur = w;
      }
    }
    requestAnimationFrame(kLoop);
  }
  function kStart() { kBad = ''; if (!kRun) { kRun = true; requestAnimationFrame(kLoop); } }
  function ayUrl(r, s, a) {
    /* a === 0 is the standalone bismillah: every source keeps it as Fatiha ayah 1 */
    var ss = a === 0 ? 1 : s, aa = a === 0 ? 1 : a;
    if (r.qb) return r.qb + String(ss).padStart(3, '0') + String(aa).padStart(3, '0') + '.mp3';
    if (r.ea) return 'https://everyayah.com/data/' + r.ea + '/' + String(ss).padStart(3, '0') + String(aa).padStart(3, '0') + '.mp3';
    return 'https://cdn.islamic.network/quran/audio/' + r.br + '/' + r.id + '/' + ayahGlobal(ss, aa) + '.mp3';
  }
  function hasBsm(s) { return s !== 1 && s !== 9; }
  function ayLoad() {
    var r = AY.rec;
    var url = ayUrl(r, AY.s, AY.a);
    if (audio && !audio.paused) { audio.pause(); playing = false; var pp = $('#playPause'); if (pp) pp.innerHTML = ico('play'); }
    $('#player').classList.remove('on');
    AY.cur = null;
    if (ayPre && ayPre.url === url && ayPre.rec === r.id && ayPre.ready) {
      var old = ayahAudioEl; ayahAudioEl = ayAlt; ayAlt = old;
      try { old.pause(); } catch (e) {}
      try { var ob = old.currentSrc; ayAlt.removeAttribute('src'); if (ob && ob.indexOf('blob:') === 0) URL.revokeObjectURL(ob); } catch (e) {}
      AY.cur = { lead: ayPre.lead, trail: ayPre.trail, done: false };
      try { if (ayPre.lead > 0.05) ayahAudioEl.currentTime = ayPre.lead; } catch (e) {}
      ayPre = null;
    } else {
      ayPre = null;
      ayahAudioEl.src = url;
    }
    document.getElementById('ayTitle').textContent = 'سورة ' + MANIFEST.surahs[AY.s - 1].name + (AY.a === 0 ? ' · البسملة' : ' · آية ' + arNum(AY.a));
    document.getElementById('ayRec').textContent = r.name;
    ayDots(); ayPaintMode(); ayTick();
    var pr = ayahAudioEl.play();
    if (pr && pr.catch) pr.catch(function () { ayPaintPlay(); });
    ayHighlight();
    kStart();
    ayPreload();
    if ('mediaSession' in navigator && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'سورة ' + MANIFEST.surahs[AY.s - 1].name + (AY.a === 0 ? ' · البسملة' : ' · آية ' + arNum(AY.a)),
          artist: r.name, album: 'روايات',
          artwork: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
        });
      } catch (e) {}
    }
  }
  function startAy(recId, s, a, mode) {
    buildAyBar();
    var r = AYAH_RECITERS.filter(function (x) { return x.id === recId; })[0] || AYAH_RECITERS.filter(function (x) { return x.id === AYAH_DEFAULT; })[0];
    lsSet('quran.ayahReciter', r.id);
    if (mode === 'surah' && a === 1 && hasBsm(s)) a = 0;
    AY.rec = r; AY.s = s; AY.a = a; AY.mode = mode; AY.on = true;
    ayBar.hidden = false;
    document.body.classList.add('ay-on');
    closeSheet(true);
    ayLoad();
  }
  function ayStep(d, force) {
    var s = AY.s, a = AY.a;
    if (d > 0) {
      var np = ayNextPos(s, a); s = np[0]; a = np[1];
    } else {
      if (a > 1) a--;
      else if (a === 1 && hasBsm(s)) a = 0;
      else {
        if (s <= 1) return;
        s--; a = MANIFEST.surahs[s - 1].count;
      }
    }
    AY.s = s; AY.a = a;
    ayLoad();
  }
  function ayStop() {
    AY.on = false;
    kUnwrap();
    try { ayahAudioEl.pause(); } catch (e) {}
    ayahAudioEl.removeAttribute('src');
    try { ayAlt.pause(); } catch (e) {} ayAlt.removeAttribute('src'); ayPre = null;
    document.querySelectorAll('.ayah.playing,[data-bs].playing').forEach(function (e) { e.classList.remove('playing'); });
    if (ayBar) ayBar.hidden = true;
    document.body.classList.remove('ay-on');
  }

  function renderTaf(box) {
    var row = document.createElement('div'); row.className = 'sheet-row';
    var sel = document.createElement('select');
    TAFSIRS.forEach(function (t) { sel.add(new Option(t.name, t.slug)); });
    sel.value = lsGet('quran.tafsir', TAFSIRS[0].slug);
    if (!sel.value) sel.selectedIndex = 0;
    row.appendChild(sel);
    box.appendChild(row);
    var src = document.createElement('div'); src.className = 'taf-src'; box.appendChild(src);
    var out = document.createElement('div'); box.appendChild(out);

    function paint(text) {
      out.innerHTML = '';
      if (!text || !text.trim()) {
        var e = document.createElement('p'); e.className = 'hint';
        e.textContent = 'مفيش تفسير لهذه الآية في الكتاب ده.';
        out.appendChild(e);
        return;
      }
      text.split(/\n+/).forEach(function (par) {
        var t = par.trim();
        if (!t) return;
        var p = document.createElement('p');
        p.textContent = t;
        out.appendChild(p);
      });
    }

    function load() {
      lsSet('quran.tafsir', sel.value);
      src.textContent = '— ' + sel.options[sel.selectedIndex].text;
      out.innerHTML = '';
      var key = sel.value + ':' + sheetState.s + ':' + sheetState.a;
      if (sheetState.cache[key] !== undefined) { paint(sheetState.cache[key]); return; }
      var wait = document.createElement('p'); wait.className = 'hint';
      wait.textContent = 'جارٍ تحميل التفسير…';
      out.appendChild(wait);
      fetch(TAF_BASE + sel.value + '/' + sheetState.s + '/' + sheetState.a + '.json')
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (d) { var t = (d && d.text) ? d.text : ''; sheetState.cache[key] = t; paint(t); })
        .catch(function () {
          out.innerHTML = '';
          var e = document.createElement('p'); e.className = 'hint';
          e.textContent = 'تعذر تحميل التفسير. اتأكد من الاتصال وحاول تاني.';
          out.appendChild(e);
        });
    }

    sel.addEventListener('change', load);
    load();
  }

  function getBookmark() {
    try { return JSON.parse(localStorage.getItem('quran.bookmark') || 'null'); } catch (e) { return null; }
  }

  function setBookmark(b) {
    try {
      if (b) localStorage.setItem('quran.bookmark', JSON.stringify(b));
      else localStorage.removeItem('quran.bookmark');
    } catch (e) {}
    updateResumeChip();
  }

  function updateResumeChip() {
    var chip = document.getElementById('resumeChip');
    if (!chip || !MANIFEST) return;
    var b = getBookmark();
    if (!b) { chip.hidden = true; return; }
    chip.hidden = false;
    chip.textContent = 'متابعة من سورة ' + MANIFEST.surahs[b.s - 1].name + ' · آية ' + arNum(b.a);
  }

  function resumeReading() {
    var b = getBookmark();
    if (!b) return;
    if (PAGES) renderPage(b.p && b.p >= 1 ? b.p : surahPage(b.s));
    else { setMode('surah'); loadSurah(b.s); }
    setTimeout(function () {
      var el = document.querySelector('.ayah[data-s="' + b.s + '"][data-a="' + b.a + '"]');
      if (el) {
        el.classList.add('hl-flash');
        try { el.scrollIntoView({ block: 'center' }); } catch (e) {}
        setTimeout(function () { el.classList.remove('hl-flash'); }, 4000);
      }
    }, 900);
  }

  function renderStop(box) {
    var bm = getBookmark();
    var p1 = document.createElement('p');
    p1.textContent = bm
      ? ('موضعك المحفوظ حاليًا: سورة ' + MANIFEST.surahs[bm.s - 1].name + ' · آية ' + arNum(bm.a))
      : 'مفيش موضع محفوظ لحد دلوقتي.';
    box.appendChild(p1);
    var row = document.createElement('div'); row.className = 'sheet-row';
    var save = document.createElement('button');
    save.className = 'btn primary';
    save.textContent = 'احفظ موضعي هنا';
    save.addEventListener('click', function () {
      var bp = (MODE === 'page' ? currentPage : surahPage(sheetState.s));
      rememberPage(sheetState.s, sheetState.a, bp);
      setBookmark({ s: sheetState.s, a: sheetState.a, p: bp });
      p1.textContent = 'تم الحفظ: سورة ' + MANIFEST.surahs[sheetState.s - 1].name + ' · آية ' + arNum(sheetState.a) +
        '. هتلاقي زر «متابعة» فوق لوحة القراءة.';
    });
    row.appendChild(save);
    if (bm) {
      var clr = document.createElement('button');
      clr.className = 'btn';
      clr.textContent = 'امسح المحفوظ';
      clr.addEventListener('click', function () { setBookmark(null); p1.textContent = 'تم مسح الموضع المحفوظ.'; });
      row.appendChild(clr);
    }
    box.appendChild(row);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var bs = (t && t.closest) ? t.closest('[data-bs]') : null;
    if (bs && !(t.closest('.ayah'))) {
      var r0 = lsGet('quran.ayahReciter', AYAH_DEFAULT);
      startAy(r0, +bs.getAttribute('data-bs'), 0, 'surah');
      return;
    }
    var el = (t && t.closest) ? t.closest('.ayah') : null;
    if (!el) return;
    var s = +el.getAttribute('data-s'), a = +el.getAttribute('data-a');
    if (s && a) openSheet(s, a);
  });
  document.getElementById('sheetClose').addEventListener('click', closeSheet);
  document.getElementById('ayahSheet').addEventListener('click', function (e) {
    if (e.target && e.target.id === 'ayahSheet') closeSheet();
  });
  document.querySelectorAll('.sheet-tab').forEach(function (b) {
    b.addEventListener('click', function () { sheetTab(b.getAttribute('data-tab')); });
  });
  document.getElementById('resumeChip').addEventListener('click', resumeReading);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });


  /* ---------- ayah text search ---------- */
  var SEARCH_LINES = null;
  var SEARCH_LOADING = false;
  var SURAH_TXT = {};

  /* same skeleton normalisation used to build data/search.txt */
  function normSearch(s) {
    s = s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u06E5\u06E6\u08F0-\u08FF]/g, '');
    s = s.replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627');
    s = s.replace(/\u0649/g, '\u064A').replace(/\u0624/g, '\u0648').replace(/\u0626/g, '\u064A').replace(/\u0629/g, '\u0647');
    s = s.replace(/[\u0627\u0648\u064A]/g, '');
    s = s.replace(/[^\u0621-\u064A\s]/g, ' ');
    return s.replace(/\s+/g, ' ').trim();
  }

  function ayahOfIndex(i) {
    var left = i;
    for (var n = 1; n <= 114; n++) {
      var c = MANIFEST.surahs[n - 1].count;
      if (left < c) return { s: n, a: left + 1 };
      left -= c;
    }
    return { s: 114, a: 1 };
  }

  function pageOfAyah(s, a) {
    var best = 1;
    for (var i = 0; i < PAGES.length; i++) {
      var e = PAGES[i];
      if (e.s < s || (e.s === s && e.a <= a)) best = e.p;
      else break;
    }
    return best;
  }

  function setSearchMsg(txt) {
    var box = document.getElementById('ayahResults');
    box.hidden = false;
    box.innerHTML = '';
    var d = document.createElement('div');
    d.className = 'ayah-res-hit';
    d.textContent = txt;
    box.appendChild(d);
  }

  function surahText(n, cb) {
    if (SURAH_TXT[n]) return cb(SURAH_TXT[n]);
    fetch('data/surah/' + String(n).padStart(3, '0') + '.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { SURAH_TXT[n] = d.ayahs; cb(d.ayahs); })
      .catch(function () { cb(null); });
  }

  function showResults(hits, q) {
    var box = document.getElementById('ayahResults');
    box.hidden = false;
    box.innerHTML = '';
    hits.forEach(function (idx) {
      var ref = ayahOfIndex(idx);
      var b = document.createElement('button');
      b.className = 'ayah-res';
      b.innerHTML = '<b>سورة ' + MANIFEST.surahs[ref.s - 1].name + ' · آية ' + arNum(ref.a) + '</b><span></span>';
      var span = b.querySelector('span');
      b.addEventListener('click', function () {
        box.hidden = true;
        document.getElementById('ayahSearch').blur();
        if (PAGES) renderPage(pageOfAyah(ref.s, ref.a));
        else { setMode('surah'); loadSurah(ref.s); }
        setTimeout(function () {
          var el = document.querySelector('.ayah[data-s="' + ref.s + '"][data-a="' + ref.a + '"]');
          if (el) {
            el.classList.add('hl-flash');
            try { el.scrollIntoView({ block: 'center' }); } catch (e) {}
            setTimeout(function () { el.classList.remove('hl-flash'); }, 5000);
          }
        }, PAGES ? 900 : 1800);
      });
      box.appendChild(b);
      surahText(ref.s, function (arr) {
        if (!arr || !arr[ref.a - 1]) return;
        var t = arr[ref.a - 1];
        span.textContent = t.length > 90 ? t.slice(0, 90) + '…' : t;
      });
    });
  }

  function runAyahSearch() {
    var raw = (document.getElementById('ayahSearch').value || '').trim();
    if (normSearch(raw).length < 2) { setSearchMsg('اكتب كلمتين على الأقل من الآية.'); return; }
    if (!SEARCH_LINES) {
      if (SEARCH_LOADING) return;
      SEARCH_LOADING = true;
      setSearchMsg('جارٍ تحميل فهرس البحث أول مرة… (مرة واحدة بس)');
      fetch('data/search.txt').then(function (r) { return r.text(); }).then(function (t) {
        SEARCH_LINES = t.split('\n');
        SEARCH_LOADING = false;
        runAyahSearch();
      }).catch(function () {
        SEARCH_LOADING = false;
        setSearchMsg('تعذر تحميل الفهرس. اتأكد من الاتصال وحاول تاني.');
      });
      return;
    }
    var q = normSearch(raw);
    var words = q.split(' ').filter(function (w) { return w.length >= 2; });
    if (!words.length) words = q.split(' ');
    var exact = [], loose = [];
    for (var i = 0; i < SEARCH_LINES.length; i++) {
      var line = SEARCH_LINES[i];
      var ok = true;
      for (var w = 0; w < words.length; w++) { if (line.indexOf(words[w]) === -1) { ok = false; break; } }
      if (!ok) continue;
      if (line.indexOf(q) !== -1) { exact.push(i); if (exact.length >= 12) break; } else if (loose.length < 40) loose.push(i);
    }
    var hits = exact.concat(loose).slice(0, 12);
    if (!hits.length) { setSearchMsg('مفيش آية فيها الكلمات دي. جرّب كلمات تانية أو أقل.'); return; }
    showResults(hits, q);
  }

  document.getElementById('ayahSearchBtn').addEventListener('click', runAyahSearch);
  document.getElementById('ayahSearch').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); runAyahSearch(); }
  });
  document.addEventListener('click', function (e) {
    var box = document.getElementById('ayahResults');
    if (box.hidden) return;
    if (box.contains(e.target) || e.target.id === 'ayahSearch' || e.target.id === 'ayahSearchBtn') return;
    box.hidden = true;
  });

  /* ---------- tajweed: categories + detail page ---------- */
  var TAJ_CATS = [
    { id: 'noon', title: 'أحكام النون الساكنة والتنوين', sub: 'إظهار · إدغام · إقلاب · إخفاء', n: 5 },
    { id: 'meem', title: 'أحكام الميم الساكنة', sub: 'إخفاء شفوي · إدغام شفوي · إظهار', n: 3 },
    { id: 'madd', title: 'المدود', sub: 'طبيعي · متصل · منفصل · لازم · عارض · بدل · لين · صلة', n: 9 },
    { id: 'qalqala', title: 'القلقلة والغنة', sub: 'اضطراب الصوت · الغنة في المشددتين', n: 3 },
    { id: 'tafkhim', title: 'التفخيم والترقيق', sub: 'لام الجلالة · الراءات · الحروف المستعلية', n: 4 },
    { id: 'lamat', title: 'اللامات وهمزتا الوصل والقطع', sub: 'قمرية · شمسية · وصل · قطع', n: 4 },
    { id: 'mutamathil', title: 'المتماثلان والمتقاربان والمتجانسان', sub: 'إدغام الحروف المتقابلة', n: 3 },
    { id: 'waqf', title: 'الوقف والابتداء', sub: 'أنواع الوقف · علاماته · السكتات · الحروف المقطعة', n: 6 }
  ];
  var TAJ_DATA = null;
  var TAJ_LOADING = false;

  function tajHl(s) {
    return s.replace(/«([^»]*)»/g, '<span class="hl">$1</span>');
  }

  function tajCards() {
    var wrap = document.getElementById('tajCats');
    if (!wrap || wrap.childNodes.length) return;
    TAJ_CATS.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'taj-cat';
      b.innerHTML = '<b>' + c.title + '</b><small>' + c.n + ' أحكام</small><i>' + c.sub + '</i>';
      b.addEventListener('click', function () { openTaj(c.id); });
      wrap.appendChild(b);
    });
  }

  function loadTaj(cb) {
    if (TAJ_DATA) return cb(TAJ_DATA);
    if (TAJ_LOADING) return;
    TAJ_LOADING = true;
    fetch('data/tajweed.json').then(function (r) { return r.json(); }).then(function (d) {
      TAJ_DATA = d;
      TAJ_LOADING = false;
      cb(d);
    }).catch(function () {
      TAJ_LOADING = false;
      cb(null);
    });
  }

  function tajChips(activeId) {
    var wrap = document.getElementById('tajChips');
    wrap.innerHTML = '';
    TAJ_CATS.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'taj-chip' + (c.id === activeId ? ' on' : '');
      b.textContent = c.title;
      b.addEventListener('click', function () { renderTaj(c.id); });
      wrap.appendChild(b);
    });
  }

  function renderTaj(id) {
    if (!TAJ_DATA) return;
    var cat = null;
    for (var i = 0; i < TAJ_DATA.categories.length; i++) {
      if (TAJ_DATA.categories[i].id === id) cat = TAJ_DATA.categories[i];
    }
    if (!cat) cat = TAJ_DATA.categories[0];
    document.getElementById('tajTitle').textContent = cat.title;
    tajChips(cat.id);
    var body = document.getElementById('tajBody');
    body.innerHTML = '';
    cat.rules.forEach(function (r, idx) {
      var card = document.createElement('div');
      card.className = 'rule full';
      var html = '<h4>' + arNum(idx + 1) + ' — ' + r.name + '</h4>';
      if (r.letters) html += '<div class="rule-letters">حروفه: <span>' + r.letters + '</span></div>';
      html += '<p>' + r.how + '</p>';
      html += '<div class="ex-list">';
      r.examples.forEach(function (ex) {
        html += '<div class="ex"><div class="ex-t">' + tajHl(ex.t) + '</div>' +
                '<div class="ex-w">' + ex.why + '</div></div>';
      });
      html += '</div>';
      card.innerHTML = html;
      body.appendChild(card);
    });
    body.scrollTop = 0;
    var page = document.getElementById('tajPage');
    page.scrollTop = 0;
  }

  function openTaj(id) {
    var page = document.getElementById('tajPage');
    page.hidden = false;
    document.body.classList.add('taj-open');
    loadTaj(function (d) {
      if (!d) {
        page.hidden = true;
        document.body.classList.remove('taj-open');
        return;
      }
      renderTaj(id);
    });
  }

  function closeTaj() {
    document.getElementById('tajPage').hidden = true;
    document.body.classList.remove('taj-open');
  }

  document.getElementById('tajBack').addEventListener('click', closeTaj);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.getElementById('tajPage').hidden) closeTaj();
  });
  tajCards();

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
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
      function check() { try { reg.update(); } catch (e) {} }
      document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
      setInterval(check, 30 * 60 * 1000);
    }).catch(function () {});
    var reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController) { hadController = true; return; }
      if (reloaded) return;
      var t = document.createElement('div');
      t.className = 'upd-toast';
      t.innerHTML = '<span>تحديث جديد جاهز</span><button type="button">حدّث الآن</button>';
      t.querySelector('button').addEventListener('click', function () { reloaded = true; location.reload(); });
      document.body.appendChild(t);
    });
  }
})();
