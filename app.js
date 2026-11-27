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
  var HQ={"1:1":1,"2:26":2,"2:44":3,"2:60":4,"2:75":5,"2:92":6,"2:106":7,"2:124":8,"2:142":9,"2:158":10,"2:177":11,"2:189":12,"2:203":13,"2:219":14,"2:233":15,"2:243":16,"2:253":17,"2:263":18,"2:272":19,"2:283":20,"3:15":21,"3:33":22,"3:52":23,"3:75":24,"3:93":25,"3:113":26,"3:133":27,"3:153":28,"3:171":29,"3:186":30,"4:1":31,"4:12":32,"4:24":33,"4:36":34,"4:58":35,"4:74":36,"4:88":37,"4:100":38,"4:114":39,"4:135":40,"4:148":41,"4:163":42,"5:1":43,"5:12":44,"5:27":45,"5:41":46,"5:51":47,"5:67":48,"5:82":49,"5:97":50,"5:109":51,"6:13":52,"6:36":53,"6:59":54,"6:74":55,"6:95":56,"6:111":57,"6:127":58,"6:141":59,"6:151":60,"7:1":61,"7:31":62,"7:47":63,"7:65":64,"7:88":65,"7:117":66,"7:142":67,"7:156":68,"7:171":69,"7:189":70,"8:1":71,"8:22":72,"8:41":73,"8:61":74,"9:1":75,"9:19":76,"9:34":77,"9:46":78,"9:60":79,"9:75":80,"9:93":81,"9:111":82,"9:122":83,"10:11":84,"10:26":85,"10:53":86,"10:71":87,"10:90":88,"11:6":89,"11:24":90,"11:41":91,"11:61":92,"11:84":93,"11:108":94,"12:7":95,"12:30":96,"12:53":97,"12:77":98,"12:101":99,"13:5":100,"13:19":101,"13:35":102,"14:10":103,"14:28":104,"15:1":105,"15:50":106,"16:1":107,"16:30":108,"16:51":109,"16:75":110,"16:90":111,"16:111":112,"17:1":113,"17:23":114,"17:50":115,"17:70":116,"17:99":117,"18:17":118,"18:32":119,"18:51":120,"18:75":121,"18:99":122,"19:22":123,"19:59":124,"20:1":125,"20:55":126,"20:83":127,"20:111":128,"21:1":129,"21:29":130,"21:51":131,"21:83":132,"22:1":133,"22:19":134,"22:38":135,"22:60":136,"23:1":137,"23:36":138,"23:75":139,"24:1":140,"24:21":141,"24:35":142,"24:53":143,"25:1":144,"25:21":145,"25:53":146,"26:1":147,"26:52":148,"26:111":149,"26:181":150,"27:1":151,"27:27":152,"27:56":153,"27:82":154,"28:12":155,"28:29":156,"28:51":157,"28:76":158,"29:1":159,"29:26":160,"29:46":161,"30:1":162,"30:31":163,"30:54":164,"31:22":165,"32:11":166,"33:1":167,"33:18":168,"33:31":169,"33:51":170,"33:60":171,"34:10":172,"34:24":173,"34:46":174,"35:15":175,"35:41":176,"36:28":177,"36:60":178,"37:22":179,"37:83":180,"37:145":181,"38:21":182,"38:52":183,"39:8":184,"39:32":185,"39:53":186,"40:1":187,"40:21":188,"40:41":189,"40:66":190,"41:9":191,"41:25":192,"41:47":193,"42:13":194,"42:27":195,"42:51":196,"43:24":197,"43:57":198,"44:17":199,"45:12":200,"46:1":201,"46:21":202,"47:10":203,"47:33":204,"48:18":205,"49:1":206,"49:14":207,"50:27":208,"51:31":209,"52:24":210,"53:26":211,"54:9":212,"55:1":213,"56:1":214,"56:75":215,"57:16":216,"58:1":217,"58:14":218,"59:11":219,"60:7":220,"62:1":221,"63:4":222,"65:1":223,"66:1":224,"67:1":225,"68:1":226,"69:1":227,"70:19":228,"72:1":229,"73:20":230,"75:1":231,"76:19":232,"78:1":233,"80:1":234,"82:1":235,"84:1":236,"87:1":237,"90:1":238,"94:1":239,"100:9":240};
  function hzMark(s, a) { var q = HQ[s + ':' + a]; if (!q) return ''; var h = Math.ceil(q / 4), r = (q - 1) % 4; return '<span class="hz">' + (r === 0 ? 'الحزب ' + arNum(h) : ['', 'ربع الحزب', 'نصف الحزب', 'ثلاثة أرباع الحزب'][r]) + '</span>'; }
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
    $('#pgFabNext').addEventListener('click', function () { $('#pageNext').click(); });
    $('#pgFabPrev').addEventListener('click', function () { $('#pagePrev').click(); });
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

  var ORN = '<svg class="orn" viewBox="0 0 60 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M60 20H30"/><path d="M60 11H38M60 29H38"/><path d="M30 20c-3-8-9-11-14-9-4 2-4 7 0 8 3 1 5-1 4-3"/><path d="M30 20c-3 8-9 11-14 9-4-2-4-7 0-8 3-1 5 1 4 3"/><path d="M12 20l5-5 5 5-5 5z"/><path d="M2 14v12"/></g></svg>';
  var CAP = '<svg class="cap" viewBox="0 0 48 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><g><path d="M16 28C11.5 21 11.5 15 16 10.5C20.5 15 20.5 21 16 28Z"/><path d="M16 28C11.5 35 11.5 41 16 45.5C20.5 41 20.5 35 16 28Z"/></g><path d="M16 28L21.5 22.5M16 28L10.5 22.5M16 28L21.5 33.5M16 28L10.5 33.5" opacity=".6"/><circle cx="16" cy="28" r="2.4"/><path d="M26 28H46"/><path d="M30 28c3-6.5 8-7.5 11.5-4.5"/><path d="M30 28c3 6.5 8 7.5 11.5 4.5"/><circle cx="46" cy="28" r="1.4" fill="currentColor"/></g></svg>';
  function banner(n) { return '<div class="mp-shead"><span class="orn-l">' + ORN + '</span><span class="cap-r">' + CAP + '</span><span class="mp-sname">سورة ' + MANIFEST.surahs[n - 1].name + '</span><span class="cap-l">' + CAP + '</span><span class="orn-r">' + ORN + '</span></div>'; }
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
    if (viewState().flow === 'scroll') return renderScroll(p);
    currentPage = p;
    if (document.querySelector('#mushaf.scr')) history.replaceState(null, '', '#p=' + p);
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
        html += banner(sg.s);
        var sb = splitBsm(sg.s, d.ayahs[0])[0];
        if (sb) html += '<div class="mp-bsm" data-bs="' + sg.s + '">' + sb + '</div>';
      }
      for (var a = sg.fa; a <= sg.ta; a++) {
        if (sg.s === 1 && a === 1) {
          html += '<div class="mp-bsm"><span class="ayah" data-s="1" data-a="1">' + d.ayahs[0] + '</span></div>';
          continue;
        }
        html += hzMark(sg.s, a) + '<span class="ayah" data-s="' + sg.s + '" data-a="' + a + '">' + (a === 1 ? splitBsm(sg.s, d.ayahs[0])[1] : d.ayahs[a - 1]) +
          ' <span class="an"><i>' + arNum(a) + '</i></span></span> ';
      }
    });
    html += '</div></div><div class="mp-foot"><span class="pg-no">' + arNum(p) + '</span></div>';
    $('#readerBody').innerHTML = '<div class="mushaf-wrap"><div class="mushaf-page">' + html + '</div></div>';
    badge.hidden = false;
    sizePageBox();
    fitPageText();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPageText);
    setTimeout(fitPageText, 150);
    setTimeout(fitPageText, 700);
    watchPageSize();
  }


  /* ---------- continuous vertical scroll through mushaf pages ---------- */
  var scState = null;
  function applyScrollScale() { var w = document.getElementById('scWrap'); if (w) w.style.fontSize = (25 * viewState().scale).toFixed(1) + 'px'; }
  async function pageBlock(p) {
    var segs = pageSegments(p), loaded = {};
    for (var k = 0; k < segs.length; k++) {
      var sj = await loadSurahFile(segs[k].s);
      if (!sj) return null;
      loaded[segs[k].s] = sj;
    }
    var html = '';
    segs.forEach(function (sg) {
      var d = loaded[sg.s];
      if (sg.fa === 1) {
        html += banner(sg.s);
        var sb = splitBsm(sg.s, d.ayahs[0])[0];
        if (sb) html += '<div class="mp-bsm" data-bs="' + sg.s + '">' + sb + '</div>';
      }
      for (var a = sg.fa; a <= sg.ta; a++) {
        if (sg.s === 1 && a === 1) { html += '<div class="mp-bsm"><span class="ayah" data-s="1" data-a="1">' + d.ayahs[0] + '</span></div>'; continue; }
        html += hzMark(sg.s, a) + '<span class="ayah" data-s="' + sg.s + '" data-a="' + a + '">' + (a === 1 ? splitBsm(sg.s, d.ayahs[0])[1] : d.ayahs[a - 1]) +
          ' <span class="an"><i>' + arNum(a) + '</i></span></span> ';
      }
    });
    var el = document.createElement('div');
    el.className = 'sc-page'; el.setAttribute('data-p', p);
    el.innerHTML = ((p === 1 || PAGES[p - 2].j !== PAGES[p - 1].j) ? '<div class="sc-juz">الجزء ' + arNum(PAGES[p - 1].j) + '</div>' : '') + '<div class="sc-text">' + html + '</div><div class="sc-no"><b>' + arNum(p) + '</b></div>';
    return el;
  }
  async function renderScroll(p) {
    if (scState && scState.io) scState.io.disconnect();
    var token = {}; scState = token;
    $('#readerBody').innerHTML = '<div class="mushaf-wrap"><div class="mushaf-page sc-wrap" id="scWrap"><div class="reader-loading">جارٍ تحميل الصفحة…</div></div></div>';
    $('#verifyBadge').hidden = true;
    var wrap = document.getElementById('scWrap');
    applyScrollScale();
    var next = p, busy = false, end = false;
    var sentinel = document.createElement('div'); sentinel.className = 'sc-sentinel';
    async function more(n) {
      if (busy || end || scState !== token) return;
      busy = true;
      for (var i = 0; i < n && next <= PAGES.length; i++) {
        var el = await pageBlock(next);
        if (scState !== token) return;
        if (!el) { end = true; break; }
        if (sentinel.parentNode) wrap.insertBefore(el, sentinel); else wrap.appendChild(el);
        io.observe(el); next++;
      }
      if (next > PAGES.length) end = true;
      busy = false;
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var pp = +en.target.getAttribute('data-p');
        if (pp !== currentPage) setCurrentFromScroll(pp);
        if (pp >= next - 2) more(2);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    token.io = io;
    var ls = new IntersectionObserver(function (es) { if (es[0].isIntersecting) more(2); }, { rootMargin: '600px' });
    wrap.innerHTML = ''; wrap.appendChild(sentinel); ls.observe(sentinel);
    token.ls = ls;
    currentPage = p; $('#pageInput').value = p; $('#pagePrev').disabled = (p === 1); $('#pageNext').disabled = (p === PAGES.length);
    await more(3);
    $('#verifyBadge').hidden = false;
    var first = wrap.querySelector('.sc-page'); if (first) { var segs0 = pageSegments(p); var st = segs0[0].s; segs0.forEach(function (sg) { if (sg.fa === 1) st = sg.s; }); currentSurah = st; $('#surahSelect').value = st; $('#pSurah').value = st; rememberPage(st, segs0[0].fa, p); updatePlayerInfo(); }
    var cs = document.querySelector('#reader'); if (cs && cs.scrollIntoView && SHOT === false && !wrap.getAttribute('data-ok')) wrap.setAttribute('data-ok', '1');
  }
  function setCurrentFromScroll(pp) {
    currentPage = pp;
    $('#pageInput').value = pp; $('#pagePrev').disabled = (pp === 1); $('#pageNext').disabled = (pp === PAGES.length);
    var segs = pageSegments(pp), st = segs[0].s;
    segs.forEach(function (sg) { if (sg.fa === 1) st = sg.s; });
    currentSurah = st; $('#surahSelect').value = st; $('#pSurah').value = st;
    rememberPage(st, segs[0].fa, pp);
    if (document.querySelector('#mushaf.scr')) history.replaceState(null, '', '#p=' + pp);
  }

  /* the page may be rendered while its screen is hidden (zero height): refit as soon as it gets a real size */
  var pageRO = null, roRaf = 0, lastKey = '';
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { if (MODE === 'page') { lastKey = ''; fitPageText(); setTimeout(fitPageText, 120); } });
  function watchPageSize() {
    if (!window.ResizeObserver) return;
    var rb = document.getElementById('readerBody'), body = document.getElementById('mpBody');
    if (!rb || !body) return;
    if (pageRO) pageRO.disconnect();
    pageRO = new ResizeObserver(function () {
      cancelAnimationFrame(roRaf);
      roRaf = requestAnimationFrame(function () { var mb = document.getElementById('mpBody'); if (MODE === 'page' && mb && mb.clientHeight > 40) { var key = mb.clientHeight + ':' + (document.getElementById('mpInner') || {}).scrollHeight + ':' + mb.style.fontSize; if (key === lastKey) return; sizePageBox(); fitPageText(); lastKey = mb.clientHeight + ':' + (document.getElementById('mpInner') || {}).scrollHeight + ':' + mb.style.fontSize; } });
    });
    pageRO.observe(rb); pageRO.observe(body);
    var inn = document.getElementById('mpInner'); if (inn) pageRO.observe(inn);
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
    var sc = viewState().scale;
    if (sc !== 1) { body.style.fontSize = (best * sc).toFixed(2) + 'px'; body.classList.add('scaled'); } else body.classList.remove('scaled');
  }
  function viewState() {
    var v; try { v = JSON.parse(localStorage.getItem('quran.view') || 'null'); } catch (e) {}
    v = v && typeof v === 'object' ? v : {};
    return { scale: [1, 1.12, 1.25, 1.4].indexOf(v.scale) !== -1 ? v.scale : 1, theme: ['green', 'light'].indexOf(v.theme) !== -1 ? v.theme : 'green', flow: v.flow === 'page' ? 'page' : 'scroll', font: ['sch', 'amiri', 'noto'].indexOf(v.font) !== -1 ? v.font : 'sch' };
  }
  function viewSave(v) { try { localStorage.setItem('quran.view', JSON.stringify(v)); } catch (e) {} }
  function applyTheme() { var rb = document.getElementById('reader'); if (rb) { rb.setAttribute('data-th', viewState().theme); rb.setAttribute('data-font', viewState().font); } }
  function initViewOptions() {
    var btn = document.getElementById('voBtn'), pan = document.getElementById('voPanel');
    if (!btn || !pan) return;
    applyTheme();
    function sync() {
      var v = viewState();
      pan.querySelectorAll('[data-mode]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-mode') === MODE); });
      pan.querySelectorAll('[data-font]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-font') === v.font); });
      pan.querySelectorAll('[data-flow]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-flow') === v.flow); });
      pan.querySelectorAll('[data-th]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-th') === v.theme); });
      pan.querySelectorAll('[data-sc]').forEach(function (b) { b.classList.toggle('on', parseFloat(b.getAttribute('data-sc')) === v.scale); });
    }
    function openIdx() {
      var scr = document.getElementById('idxScreen'), lst = document.getElementById('idxList');
      if (!MANIFEST || !scr) return;
      if (!lst.childNodes.length) {
        MANIFEST.surahs.forEach(function (s, i) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'idx-row'; b.setAttribute('data-sj', i + 1);
          var n = document.createElement('span'); n.className = 'idx-n'; n.textContent = arNum(i + 1);
          var nm = document.createElement('span'); nm.className = 'idx-name'; nm.textContent = s.name;
          var meta = document.createElement('span'); meta.className = 'idx-meta'; meta.innerHTML = '<b>' + s.type + '</b><i>' + arNum(s.count) + ' آية</i>';
          b.appendChild(n); b.appendChild(nm); b.appendChild(meta); lst.appendChild(b);
        });
        lst.addEventListener('click', function (e) { var b = e.target.closest('.idx-row'); if (!b) return; document.getElementById('idxScreen').hidden = true; document.body.classList.remove('idx-open'); gotoSurah(+b.getAttribute('data-sj')); var r = document.getElementById('reader'); if (r && r.scrollIntoView) r.scrollIntoView(); });
      }
      var cur = lst.querySelector('.idx-row.on'); if (cur) cur.classList.remove('on');
      var c2 = lst.children[currentSurah - 1]; if (c2) c2.classList.add('on');
      scr.hidden = false; document.body.classList.add('idx-open');
      if (c2 && c2.scrollIntoView) c2.scrollIntoView({ block: 'center' });
    }
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#idxBack')) { document.getElementById('idxScreen').hidden = true; document.body.classList.remove('idx-open'); } });
    (function readBar() {
      var bar = document.querySelector('#reader > .reader-bar'), wrap = btn.parentNode;
      if (!bar || bar.querySelector('.rb-back')) return;
      var back = document.createElement('button'); back.type = 'button'; back.className = 'rb-back'; back.setAttribute('aria-label', 'رجوع');
      back.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
      var ind = document.createElement('div'); ind.className = 'rb-ind'; ind.id = 'rbInd';
      var pg = document.createElement('div'); pg.className = 'rb-pg'; pg.id = 'rbPg';
      bar.insertBefore(back, bar.firstChild); bar.insertBefore(pg, wrap); bar.insertBefore(ind, wrap);
      back.addEventListener('click', function () { pan.hidden = true; if (window.__quranBack) window.__quranBack(); else location.hash = ''; });
      var card = document.createElement('div'); card.className = 'vo-card vo-nav';
      var h = document.createElement('div'); h.className = 'vo-h'; h.textContent = 'التنقل';
      card.appendChild(h);
      var sel = document.getElementById('surahSelect'), pn = document.getElementById('pageNav');
      if (sel) card.appendChild(sel);
      if (pn) card.appendChild(pn);
      pan.insertBefore(card, pan.firstChild);
      function upd() { var i = document.getElementById('pageInput'), s = document.getElementById('surahSelect'); var nm = s && s.options[s.selectedIndex] ? s.options[s.selectedIndex].text.replace(/^[\u0660-\u0669\d]+\s*[—-]\s*/, '') : ''; ind.textContent = nm; pg.textContent = (i ? i.value : ''); }
      upd(); setInterval(upd, 600);
    })();
    var vib = document.getElementById('voIdxBtn');
    if (vib) vib.addEventListener('click', function () { pan.hidden = true; openIdx(); });
    var ix = null;
    function buildIdx() {
      if (!ix || ix.childNodes.length || !MANIFEST) return;
      MANIFEST.surahs.forEach(function (s) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-sj', s.n || (MANIFEST.surahs.indexOf(s) + 1)); b.textContent = arNum(s.n || (MANIFEST.surahs.indexOf(s) + 1)) + '  ' + s.name; ix.appendChild(b); });
    }
    var vs = document.getElementById('voSearch'), vf = document.getElementById('voOffline');
    if (vs) vs.addEventListener('click', function () { pan.hidden = true; var t = document.getElementById('rbTools'); if (t) t.click(); });
    if (vf) vf.addEventListener('click', function () { pan.hidden = true; var o = document.getElementById('offlineBtn'); if (o) o.click(); });
    btn.addEventListener('click', function (e) { e.stopPropagation(); buildIdx(); pan.hidden = !pan.hidden; btn.setAttribute('aria-expanded', String(!pan.hidden)); sync(); });
    document.addEventListener('click', function (e) { if (!pan.hidden && !pan.contains(e.target) && e.target !== btn) { pan.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    pan.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var v = viewState();
      if (b.hasAttribute('data-sj')) { pan.hidden = true; gotoSurah(+b.getAttribute('data-sj')); return; }
      if (b.hasAttribute('data-mode')) setMode(b.getAttribute('data-mode'));
      if (b.hasAttribute('data-th')) { v.theme = b.getAttribute('data-th'); viewSave(v); applyTheme(); }
      if (b.hasAttribute('data-font')) { v.font = b.getAttribute('data-font'); viewSave(v); applyTheme(); setTimeout(fitPageText, 80); setTimeout(fitPageText, 500); }
      if (b.hasAttribute('data-flow')) { v.flow = b.getAttribute('data-flow'); viewSave(v); if (MODE === 'page' && PAGES) renderPage(currentPage); }
      if (b.hasAttribute('data-sc')) { v.scale = parseFloat(b.getAttribute('data-sc')); viewSave(v); if (v.flow === 'scroll') applyScrollScale(); else fitPageText(); }
      sync();
    });
  }
  initViewOptions();

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
    if (document.querySelector('#mushaf.scr')) history.replaceState(null, '', '#mushaf');
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
        ' <span class="an"><i>' + arNum(i + 1) + '</i></span></span> ';
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
        var av = document.createElement('div'); av.className = 'avatar'; av.textContent = String(r.reciter).trim().charAt(0);
        var tb = document.createElement('div'), h4 = document.createElement('h4'), sm = document.createElement('small');
        h4.textContent = r.reciter; sm.textContent = r.riwayah; tb.appendChild(h4); tb.appendChild(sm);
        card.appendChild(av); card.appendChild(tb);
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
    window.QuranCur = { reciter: currentReciter.reciter, surah: currentSurah, sname: s.name, url: audioURL(), server: currentReciter.server, missing: currentReciter.missing || [] };
    if (window.QuranDL) QuranDL.onPlayer();
  }

  function playAudio() {
    if (!currentReciter) return;
    if (typeof ayStop === 'function') ayStop();
    if (currentReciter.missing && currentReciter.missing.indexOf(currentSurah) !== -1) {
      var nx = currentSurah; do { nx = nx >= 114 ? 1 : nx + 1; } while (currentReciter.missing.indexOf(nx) !== -1);
      gotoSurah(nx, true);
    }
    audio.src = (window.QuranDL && QuranDL.local(audioURL())) || audioURL();
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
  var OFF_CACHE = 'quran-text-v7', offRunning = false;
  async function offlineAll(btn) {
    if (offRunning || !window.caches) return;
    offRunning = true;
    try {
      var c = await caches.open(OFF_CACHE);
      var urls = ['data/pages.json', 'data/tajweed.json', 'data/search.txt'];
      for (var i = 1; i <= 114; i++) urls.push('data/surah/' + String(i).padStart(3, '0') + '.json');
      try {
        var rm = await (await fetch('data/rw/manifest.json')).json();
        rm.riwayat.forEach(function (r) { for (var i = 1; i <= 114; i++) urls.push('data/rw/' + r.id + '/' + String(i).padStart(3, '0') + '.json'); });
      } catch (err) {}
      var todo = [];
      for (var k = 0; k < urls.length; k++) { if (!(await c.match(urls[k]))) todo.push(urls[k]); }
      var done = 0, failed = 0, q = todo.slice();
      var tick = function () { if (btn) btn.textContent = '⬇ ' + arNum(done) + ' / ' + arNum(todo.length); };
      var worker = async function () {
        while (q.length) {
          var u = q.shift();
          try { var r = await fetch(u); if (r.ok) await c.put(u, r); else failed++; } catch (err) { failed++; }
          done++; tick();
        }
      };
      await Promise.all([worker(), worker()]);
      if (!failed) { try { localStorage.setItem('offlineAll', OFF_CACHE); } catch (err) {} }
      if (btn) btn.textContent = failed ? '⚠ لم يكتمل — أعد المحاولة' : '✓ محفوظ للقراءة بدون نت';
    } finally { offRunning = false; if (btn) btn.disabled = false; }
  }
  $('#offlineBtn').addEventListener('click', function (e) { e.target.disabled = true; offlineAll(e.target); });
  (function () {
    var btn = $('#offlineBtn'), ok = false;
    try { ok = localStorage.getItem('offlineAll') === OFF_CACHE; } catch (e) {}
    if (ok) { btn.textContent = '✓ محفوظ للقراءة بدون نت'; return; }
    /* automatic: after the first visit settles, quietly save all the text (about 3 MB compressed) in the background */
    if (navigator.onLine === false) return;
    setTimeout(function () { btn.disabled = true; offlineAll(btn); }, 6000);
  })();

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

  /* slugs listed here are hidden from the tafsir list (licensing not verified); decided with the owner */
  var TAF_HIDE = [];
  TAFSIRS = TAFSIRS.filter(function (t) { return TAF_HIDE.indexOf(t.slug) === -1; });
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
    if (!(AY.on && sheetState.o && sheetState.following)) { sheetState.o = { s: s, a: a }; }
    sheetState.following = false;
    document.getElementById('sheetRef').textContent = 'سورة ' + MANIFEST.surahs[s - 1].name + ' · آية ' + arNum(a);
    var ay = document.getElementById('sheetAyah');
    ay.textContent = '';
    document.getElementById('ayahSheet').hidden = false; document.body.classList.add('sheet-open'); nowPaint();
    loadSurahFile(s).then(function (sj) { if (sj) ay.textContent = a === 1 ? splitBsm(s, sj.ayahs[0])[1] : sj.ayahs[a - 1]; });
    sheetTab('play');
  }

  function closeSheet(keepAudio) {
    document.getElementById('ayahSheet').hidden = true; document.body.classList.remove('sheet-open');
    if (ayahAudioEl && keepAudio !== true && !AY.on) { try { ayahAudioEl.pause(); } catch (e) {} }
  }


  /* now-playing controls inside the ayah sheet: the sheet follows the ayah being recited */
  function nowBuild() {
    var n = document.getElementById('sheetNow'); if (n) return n;
    n = document.createElement('div'); n.id = 'sheetNow'; n.className = 'sheet-now'; n.hidden = true;
    n.innerHTML = '<button type="button" data-k="prev" aria-label="الآية السابقة">' + ico('prev') + '<span>السابقة</span></button><button type="button" data-k="play" class="np" aria-label="تشغيل / إيقاف"></button><button type="button" data-k="next" aria-label="الآية التالية">' + ico('next') + '<span>التالية</span></button>';
    var ay = document.getElementById('sheetAyah'); ay.parentNode.insertBefore(n, ay.nextSibling);
    n.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !AY.on) return; var k = b.getAttribute('data-k');
      if (k === 'play') { if (ayahAudioEl.paused) ayahAudioEl.play(); else ayahAudioEl.pause(); }
      else ayStep(k === 'next' ? 1 : -1, true);
    });
    return n;
  }
  function nowPaint() {
    var n = nowBuild(), sh = document.getElementById('ayahSheet');
    n.hidden = !(AY.on && sh && !sh.hidden);
    var p = n.querySelector('.np'); if (p) p.innerHTML = ayahAudioEl.paused ? ico('play') : ico('pause');
  }
  function backToOrigin() {
    var o = sheetState.o; if (!o) return;
    if (AY.on) ayStop();
    sheetState.following = false;
    openSheet(o.s, o.a);
    var el = document.querySelector('#readerBody .ayah[data-s="' + o.s + '"][data-a="' + o.a + '"]');
    if (el) { aimForce = true; aimAyah(el); aimForce = false; }
  }
  function sheetFollow() {
    var sh = document.getElementById('ayahSheet'); if (!sh || sh.hidden || !AY.on) return;
    sheetState.s = AY.s; sheetState.a = AY.a; sheetState.following = true;
    document.getElementById('sheetRef').textContent = 'سورة ' + MANIFEST.surahs[AY.s - 1].name + ' · ' + (AY.a === 0 ? 'البسملة' : 'آية ' + arNum(AY.a));
    var ay = document.getElementById('sheetAyah'), s = AY.s, a = AY.a;
    loadSurahFile(s).then(function (sj) { if (!sj || AY.s !== s || AY.a !== a) return; ay.textContent = a === 0 ? splitBsm(s, sj.ayahs[0])[0] : (a === 1 ? splitBsm(s, sj.ayahs[0])[1] : sj.ayahs[a - 1]); });
    nowPaint();
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
    var b1 = document.createElement('button');
    b1.innerHTML = ico('play') + '<span>هذه الآية فقط</span>';
    b1.addEventListener('click', function () { startAy(sel.value, sheetState.s, sheetState.a, 'ayah'); });
    var hint = document.createElement('div'); hint.className = 'hint';
    function paintChoice() {
      row2.innerHTML = '';
      var f = FULLMAP[sel.value];
      if (f) {
        var b2 = document.createElement('button'); b2.className = 'btn primary';
        b2.innerHTML = ico('play') + '<span>السورة كاملة</span>';
        b2.addEventListener('click', function () { startAy(sel.value, sheetState.s, sheetState.a, 'full'); });
        b1.className = 'btn';
        row2.appendChild(b2); row2.appendChild(b1);
        hint.textContent = '«السورة كاملة» بتشغّل ملف السورة كله من غير وصلات بين الآيات وتكمّل على السورة اللي بعدها. ' +
          (f.c ? 'الآية بتتعلّم وقت ما تتقرأ حسب توقيت الملف نفسه' + (f.w ? '، وكل كلمة كمان.' : '.') : 'الملف ده معندوش توقيت للآيات، فمفيش تعليم أثناء التشغيل.') +
          ' «هذه الآية فقط» بيشغّل الآية دي ويقف. بتتحمّل من الإنترنت وقت التشغيل بس.';
      } else {
        b1.className = 'btn primary';
        var b3 = document.createElement('button'); b3.className = 'btn';
        b3.innerHTML = ico('play') + '<span>آية بآية متتابعة (ممكن يظهر فاصل)</span>';
        b3.addEventListener('click', function () { startAy(sel.value, sheetState.s, sheetState.a, 'surah'); });
        row2.appendChild(b1); row2.appendChild(b3);
        hint.textContent = 'القارئ ده مفيش له ملف سورة كاملة بتوقيت مضمون، فمتاح آية واحدة، أو تشغيل آية بآية ممكن يظهر فيه فاصل بسيط بين الآيات.';
      }
    }
    sel.addEventListener('change', paintChoice);
    paintChoice();
    box.appendChild(row2);
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
      '<div class="ay-mode" id="ayMode" role="group"><button data-m="full">السورة</button><button data-m="ayah">آية</button></div>' +
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
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-m');
        if (m === 'full' && AY.mode !== 'full') {
          if (FULLMAP[AY.rec.id]) { fullStart(AY.rec, AY.s, AY.a || 1); return; }
          m = 'surah';
        }
        if (m === 'ayah' && AY.mode === 'full') { AY.mode = 'ayah'; AY.full = null; AY.fpre = null; ayAlt.removeAttribute('src'); if (!AY.a) AY.a = 1; ayLoad(); return; }
        AY.mode = m; ayPaintMode(); ayPreload();
      });
    });
    ayWire(ayahAudioEl); ayWire(ayAlt);
    var inf = ayBar.querySelector('.ay-info');
    /* tapping the audio card title reopens the ayah sheet on the ayah being recited; it then follows the audio. No scrolling. */
    inf.style.cursor = 'pointer'; inf.setAttribute('role', 'button');
    inf.addEventListener('click', function () {
      if (!AY.on) return;
      openSheet(AY.s, AY.a === 0 ? 1 : AY.a); sheetFollow();
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
      if (AY.mode === 'full') fullNext();
      else if (AY.mode === 'surah') ayStep(1, false);
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
    ayBar.querySelectorAll('#ayMode button').forEach(function (b) {
      var m = b.getAttribute('data-m'), chain = AY.rec && !FULLMAP[AY.rec.id];
      if (m === 'full') b.textContent = chain ? 'متتابع' : 'السورة';
      b.classList.toggle('on', m === 'full' ? (AY.mode === 'full' || (chain && AY.mode === 'surah')) : AY.mode === 'ayah');
    });
  }
  function ayPaintPlay() {
    if (!ayBar) return;
    document.getElementById('ayPlay').innerHTML = ayahAudioEl.paused ? ico('play') : ico('pause');
    ayBar.classList.toggle('is-playing', !ayahAudioEl.paused); nowPaint();
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
    if (AY.mode === 'full' && !(AY.full && AY.full.ts)) box.textContent = 'السورة كاملة';
    else box.textContent = AY.a === 0 ? 'البسملة' : 'آية ' + arNum(AY.a) + ' من ' + arNum(n);
  }
  /* auto-follow must not fight the reader: after a manual scroll it pauses for a while */
  var userScrollAt = 0, aimForce = false;
  ['touchmove', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function () { userScrollAt = Date.now(); }, { passive: true }); });
  window.addEventListener('keydown', function (e) { if (/^(Arrow|Page|Home|End| )/.test(e.key)) userScrollAt = Date.now(); });
  function aimAyah(el) {
    if (!aimForce && Date.now() - userScrollAt < 12000) return;
    try {
      var sh = document.querySelector('#ayahSheet .sheet-card'), open = sh && !document.getElementById('ayahSheet').hidden;
      if (!open) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      var r = el.getBoundingClientRect(), top = sh.getBoundingClientRect().top, mid = Math.max(90, top / 2);
      window.scrollBy({ top: (r.top + r.height / 2) - mid, behavior: 'smooth' });
    } catch (e) {}
  }
  function ayHighlight() {
    kUnwrap();
    document.querySelectorAll('.ayah.playing,[data-bs].playing').forEach(function (e) { e.classList.remove('playing'); });
    var sel0 = AY.a === 0 ? '#readerBody [data-bs="' + AY.s + '"]' : '#readerBody .ayah[data-s="' + AY.s + '"][data-a="' + AY.a + '"]';
    var el = document.querySelector(sel0);
    sheetFollow();
    if (el) { el.classList.add('playing'); aimAyah(el); return; }
    /* reader is showing something else: bring the ayah into view */
    if (MODE === 'page' && PAGES) renderPage(pageOfAyah(AY.s, AY.a));
    else loadSurah(AY.s, true);
    setTimeout(function () {
      var e2 = document.querySelector(sel0);
      if (e2) { e2.classList.add('playing'); aimAyah(e2); }
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
    if (AY.mode === 'full') fullSync();
    var fsegs = AY.mode === 'full' && AY.full && AY.full.segs && AY.full.segs[AY.a];
    var want = AY.a > 0 && AY.rec && (AY.mode === 'full' ? fsegs : AY.rec.q) ? AY.s + ':' + AY.a : '';
    if (K && K.key !== want) kUnwrap();
    if (!K && want && kBad !== want) {
      var segs = AY.mode === 'full' ? fsegs : qSegs(AY.rec.q, AY.s, AY.a);
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
          artist: r.name, album: 'قرآن كريم',
          artwork: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
        });
      } catch (e) {}
    }
  }
  function startAy(recId, s, a, mode) {
    buildAyBar();
    var r = AYAH_RECITERS.filter(function (x) { return x.id === recId; })[0] || AYAH_RECITERS.filter(function (x) { return x.id === AYAH_DEFAULT; })[0];
    lsSet('quran.ayahReciter', r.id);
    if (!ayUnlocked) ayUnlock();
    if (mode === 'full' && FULLMAP[r.id]) { AY.on = true; ayBar.hidden = false; document.body.classList.add('ay-on'); fullStart(r, s, a || 1); return; }
    if (mode === 'full') mode = 'surah';
    if (mode === 'surah' && a === 1 && hasBsm(s)) a = 0;
    AY.full = null; AY.fpre = null;
    AY.rec = r; AY.s = s; AY.a = a; AY.mode = mode; AY.on = true;
    ayBar.hidden = false;
    document.body.classList.add('ay-on');
    ayLoad();
  }
  function ayStep(d, force) {
    if (AY.mode === 'full') { fullStep(d); return; }
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
  /* ---------- whole-surah mode: the reciter's own full-surah file, no joins inside a surah ---------- */
  /* c = quran.com chapter recording id (gives the file URL and its own ayah timings), w = that file also has word timings,
     mq = full-surah file from mp3quran (no timings, so no highlight while playing) */
  var FULLMAP = {
    'ar.alafasy': { c: 7, w: 1 }, 'ar.husary': { c: 6, w: 1 }, 'ar.minshawi': { c: 9, w: 1 }, 'ar.shaatree': { c: 4, w: 1 },
    'ar.abdulbasitmurattal': { c: 2, w: 1 }, 'ar.abdurrahmaansudais': { c: 3, w: 1 }, 'ar.saoodshuraym': { c: 10, w: 1 },
    'ea:Husary_Muallim_128kbps': { c: 12, w: 1 }, 'ea:Abdul_Basit_Mujawwad_128kbps': { c: 1, w: 1 }, 'ea:Minshawy_Mujawwad_192kbps': { c: 8, w: 1 },
    'ea:Hani_Rifai_192kbps': { c: 5, w: 1 }, 'ea:khalefa_al_tunaiji_64kbps': { c: 161, w: 1 }, 'ea:Yasser_Ad-Dussary_128kbps': { c: 97, w: 1 },
    'ar.mahermuaiqly': { c: 159 }, 'ar.ahmedajamy': { c: 19 }, 'ea:mahmoud_ali_al_banna_32kbps': { c: 129 }, 'ea:Muhammad_Jibreel_128kbps': { c: 169 },
    'ea:Mohammad_al_Tablaway_128kbps': { c: 91 }, 'ea:Abdullah_Basfar_192kbps': { c: 163 }, 'ea:Salah_Al_Budair_128kbps': { c: 43 },
    'ea:Abdullah_Matroud_128kbps': { c: 124 }, 'ea:Ahmed_Neana_128kbps': { c: 126 }, 'ea:Salaah_AbdulRahman_Bukhatir_128kbps': { c: 18 },
    'ea:Muhsin_Al_Qasim_192kbps': { c: 11 }, 'ea:Abdullaah_3awwaad_Al-Juhaynee_128kbps': { c: 162 }, 'ea:Ali_Hajjaj_AlSuesy_128kbps': { c: 128 },
    'ea:Sahl_Yassin_128kbps': { c: 17 }, 'ea:Akram_AlAlaqimy_128kbps': { c: 127 }, 'ea:Ali_Jaber_64kbps': { c: 158 }, 'ea:Fares_Abbad_64kbps': { c: 14 },
    'ea:Ghamadi_40kbps': { c: 13 }, 'ea:Nasser_Alqatami_128kbps': { c: 104 },
    'ar.hudhaify': { c: 167 }, 'ar.muhammadayyoub': { c: 22 }, 'ea:Muhammad_AbdulKareem_128kbps': { c: 70 }, 'ea:Khaalid_Abdullaah_al-Qahtaanee_192kbps': { c: 166 },
    'ar.aymanswoaid': { mq: 'https://server15.mp3quran.net/a-rushdi/Almusshaf-Al-Mo-lim/' },
    'ea:Husary_128kbps_Mujawwad': { mq: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r2/' },
    'ea:Yaser_Salamah_128kbps': { mq: 'https://cdn.mp3quran.net/audio/yasser-salama/r1/' }
  };
  var FC = {};
  function fullInfo(rec, s) {
    var f = FULLMAP[rec.id], key = rec.id + ':' + s;
    if (FC[key]) return FC[key];
    var pad = String(s).padStart(3, '0');
    if (!f.c) return (FC[key] = Promise.resolve({ src: f.mq + pad + '.mp3', ts: null, segs: null }));
    var n = MANIFEST.surahs[s - 1].count;
    FC[key] = fetch('https://api.quran.com/api/v4/chapter_recitations/' + f.c + '/' + s + '?segments=true')
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (j) {
        var af = j.audio_file, ts = af.timestamps || [], out = { src: af.audio_url, ts: null, segs: null };
        var ok = ts.length === n && ts[0].timestamp_from < 20000;
        for (var i = 0; ok && i < n; i++) {
          if (ts[i].timestamp_from > ts[i].timestamp_to) ok = false;
          if (i && ts[i].timestamp_from < ts[i - 1].timestamp_from) ok = false;
        }
        if (ok) {
          out.ts = ts.map(function (x) { return [x.timestamp_from, x.timestamp_to]; });
          if (f.w) {
            out.segs = {};
            ts.forEach(function (x, i) {
              var g = (x.segments || []).filter(function (q) { return q.length >= 3; }).map(function (q, k) { return [k, q[0], q[1], q[2]]; });
              if (g.length) out.segs[i + 1] = g;
            });
          }
        }
        return out;
      });
    FC[key].catch(function () { delete FC[key]; });
    return FC[key];
  }
  function fullTitle() {
    var t = 'سورة ' + MANIFEST.surahs[AY.s - 1].name;
    if (AY.full && AY.full.ts) t += ' · آية ' + arNum(AY.a);
    document.getElementById('ayTitle').textContent = t;
    document.getElementById('ayRec').textContent = AY.rec.name;
  }
  function fullStart(rec, s, a) {
    buildAyBar();
    var tok = AY.tok = (AY.tok || 0) + 1;
    lsSet('quran.ayahReciter', rec.id);
    AY.rec = rec; AY.s = s; AY.a = a || 1; AY.mode = 'full'; AY.on = true; AY.full = null; AY.fpre = null; ayPre = null;
    ayBar.hidden = false; document.body.classList.add('ay-on');
    try { ayahAudioEl.pause(); } catch (e) {}
    if (audio && !audio.paused) { audio.pause(); playing = false; var pp = $('#playPause'); if (pp) pp.innerHTML = ico('play'); }
    $('#player').classList.remove('on');
    kUnwrap(); ayPaintMode();
    document.getElementById('ayTitle').textContent = 'سورة ' + MANIFEST.surahs[s - 1].name;
    document.getElementById('ayRec').textContent = 'جارٍ التحميل…';
    fullInfo(rec, s).then(function (info) {
      if (AY.tok !== tok || !AY.on) return;
      fullPlay(info, a || 1, false);
    }).catch(function () {
      if (AY.tok !== tok) return;
      document.getElementById('ayRec').textContent = 'تعذّر تحميل بيانات السورة. تأكد من النت وجرّب تاني.';
    });
  }
  function fullPlay(info, a, swapped) {
    AY.full = info; AY.a = a; AY.fcheck = false;
    var startMs = info.ts && a > 1 ? info.ts[a - 1][0] : 0;
    var el = ayahAudioEl;
    if (!swapped) {
      el.src = info.src;
    }
    var seek = function () {
      var d = el.duration;
      if (info.ts && isFinite(d) && d > 0 && info.ts[info.ts.length - 1][1] > d * 1000 + 3000) { info.ts = null; info.segs = null; }   /* timings don't fit this file: no highlight */
      if (startMs > 0 && info.ts) { try { el.currentTime = startMs / 1000; } catch (e) {} }
      fullTitle(); ayDots();
    };
    if (el.readyState >= 1) seek(); else el.addEventListener('loadedmetadata', function h() { el.removeEventListener('loadedmetadata', h); seek(); });
    fullTitle(); ayDots(); ayTick();
    var pr = el.play(); if (pr && pr.catch) pr.catch(function () { ayPaintPlay(); });
    ayHighlight(); kStart();
    if ('mediaSession' in navigator && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: 'سورة ' + MANIFEST.surahs[AY.s - 1].name, artist: AY.rec.name, album: 'قرآن كريم',
          artwork: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }] });
      } catch (e) {}
    }
  }
  function fullNextS() { return AY.s >= 114 ? 1 : AY.s + 1; }
  function fullSync() {
    var info = AY.full, el = ayahAudioEl;
    if (!info) return;
    var d = el.duration, ct = el.currentTime;
    if (info.ts) {
      var t = ct * 1000, k = 0, ts = info.ts;
      for (var i = 0; i < ts.length; i++) { if (ts[i][0] <= t) k = i; else break; }
      if (k + 1 !== AY.a) { AY.a = k + 1; fullTitle(); ayDots(); ayHighlight(); }
    }
    /* last 25 s: warm up the next surah's file so the hand-over has no gap */
    if (isFinite(d) && d > 0 && d - ct < 25 && !AY.fpre) {
      var ns = fullNextS(), rec = AY.rec, pre = AY.fpre = { s: ns, ready: false };
      fullInfo(rec, ns).then(function (inf) {
        if (AY.fpre !== pre || !AY.on) return;
        pre.info = inf; pre.ready = true;
        ayAlt.preload = 'auto'; ayAlt.src = inf.src; ayAlt.load();
      }).catch(function () {});
    }
  }
  function fullNext() {
    if (!AY.on) return;
    var ns = fullNextS(), pre = AY.fpre;
    if (pre && pre.ready && pre.s === ns) {
      var old = ayahAudioEl; ayahAudioEl = ayAlt; ayAlt = old;
      try { old.pause(); } catch (e) {}
      try { ayAlt.removeAttribute('src'); } catch (e) {}
      AY.fpre = null; AY.s = ns; AY.tok = (AY.tok || 0) + 1;
      kUnwrap();
      fullPlay(pre.info, 1, true);
    } else fullStart(AY.rec, ns, 1);
  }
  function fullStep(d) {
    var info = AY.full, el = ayahAudioEl;
    if (!info) return;
    if (info.ts) {
      var k = AY.a - 1, t = el.currentTime * 1000;
      if (d > 0) { if (k + 1 < info.ts.length) el.currentTime = info.ts[k + 1][0] / 1000; else fullNext(); }
      else if (t - info.ts[k][0] > 3000) el.currentTime = info.ts[k][0] / 1000;
      else if (k > 0) el.currentTime = info.ts[k - 1][0] / 1000;
      else if (AY.s > 1) fullStart(AY.rec, AY.s - 1, 1);
      else el.currentTime = 0;
      return;
    }
    if (d > 0) fullNext();
    else if (el.currentTime > 5) el.currentTime = 0;
    else if (AY.s > 1) fullStart(AY.rec, AY.s - 1, 1);
  }

  function ayStop() {
    AY.on = false; AY.full = null; AY.fpre = null; AY.tok = (AY.tok || 0) + 1;
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
    sel.value = lsGet('quran.tafsir', TAFSIRS[0].slug); if (!sel.value) sel.value = TAFSIRS[0].slug;
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
  (function () { var r = document.getElementById('sheetRef'); if (r) { r.style.cursor = 'pointer'; r.setAttribute('role', 'button'); r.addEventListener('click', backToOrigin); } })();
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


  var TAJ_VIEW = { cat: null, rule: -1 };
  var TAJ_EX = null, SURAH_C = {};
  var TAJ_WHY = {
    'الإظهار الحلقي': 'بعد النون الساكنة أو التنوين جاء حرف الحلق «{L}»، فالنون تُنطق واضحة بلا إدغام ولا إخفاء.',
    'الإدغام بغنة': 'بعد النون الساكنة أو التنوين جاء حرف «{L}» من حروف (ينمو)، فتُدغم النون فيه بغنة.',
    'الإدغام بغير غنة': 'بعد النون الساكنة أو التنوين جاء حرف «{L}»، فتُدغم النون فيه إدغامًا كاملًا بلا غنة.',
    'الإقلاب': 'بعد النون الساكنة أو التنوين جاءت الباء، فتُقلب النون ميمًا مخفاة بغنة.',
    'الإخفاء الحقيقي': 'بعد النون الساكنة أو التنوين جاء حرف «{L}» من حروف الإخفاء الخمسة عشر، فتُخفى النون بغنة.',
    'الإخفاء الشفوي': 'ميم ساكنة جاءت بعدها باء، فتُخفى الميم بغنة مع إطباق الشفتين.',
    'الإدغام الشفوي': 'ميم ساكنة جاءت بعدها ميم، فتُدغم فيها بغنة.',
    'الإظهار الشفوي': 'ميم ساكنة جاء بعدها حرف «{L}» (ليس باءً ولا ميمًا)، فتُظهر الميم واضحة.',
    'الغنة في المشددتين': 'حرف «{L}» مشدد، فتجب الغنة مقدار حركتين.',
    'اللام الشمسية': 'لام التعريف جاء بعدها حرف «{L}» وهو من الحروف الشمسية، فاللام لا تُنطق ويُشدد الحرف بعدها.',
    'همزة الوصل': 'همزة وصل تُنطق في بداية الكلام وتسقط عند الوصل بما قبلها.',
    'المد الطبيعي': 'حرف مد (ألف أو واو أو ياء) لم يأتِ بعده همز ولا سكون، فيُمد حركتين.',
    'المد المتصل': 'جاء حرف المد وبعده همزة في نفس الكلمة، فيُمد أربع أو خمس حركات.',
    'المد المنفصل': 'جاء حرف المد في آخر كلمة وبعده همزة في أول الكلمة التالية، فيُمد أربع أو خمس حركات.',
    'المد اللازم': 'جاء بعد حرف المد سكون أصلي لازم، فيُمد ست حركات.',
    'المد العارض للسكون': 'حرف المد قبل آخر حرف في نهاية الآية، فعند الوقف يُسكَّن الحرف الأخير ويجوز المد حركتين أو أربعًا أو ستًا.',
    'القلقلة الصغرى': 'حرف القلقلة «{L}» ساكن في وسط الكلمة، فيُنطق باضطراب خفيف.',
    'القلقلة الكبرى': 'حرف القلقلة «{L}» في آخر الآية، فعند الوقف تكون القلقلة أقوى.',
    'المتجانسان': 'حرفان اتفقا في المخرج واختلفا في الصفة والتقيا، فيُدغم الأول في الثاني.',
    'المتقاربان': 'حرفان تقاربا في المخرج أو الصفة والتقيا، فيُدغم الأول في الثاني.'
  };
  function loadSurah(n) {
    if (SURAH_C[n]) return Promise.resolve(SURAH_C[n]);
    return fetch('data/surah/' + String(n).padStart(3, '0') + '.json').then(function (r) { return r.json(); }).then(function (d) { SURAH_C[n] = d.ayahs; return d.ayahs; });
  }
  function tokenIdx(words) {
    var o = [];
    words.forEach(function (w, i) { if (/[\u0621-\u064a\u0671]/.test(w)) o.push(i); });
    return o;
  }
  function exNode(rule, L, e) {
    var s = e[0], a = e[1], ws = e[2], we = e[3];
    var words = SURAH_C[s][a - 1].split(' ');
    var ix = tokenIdx(words);
    var from = ix[ws], to = ix[we];
    var box = document.createElement('div'); box.className = 'ex ex-ay';
    var t = document.createElement('div'); t.className = 'ex-t';
    var pre = words.slice(0, from).join(' ');
    var mid = words.slice(from, to + 1).join(' ');
    var post = words.slice(to + 1).join(' ');
    if (pre) t.appendChild(document.createTextNode(pre + ' '));
    var h = document.createElement('span'); h.className = 'hl'; h.textContent = mid; t.appendChild(h);
    if (post) t.appendChild(document.createTextNode(' ' + post));
    var ref = document.createElement('div'); ref.className = 'ex-ref';
    ref.textContent = 'سورة ' + MANIFEST.surahs[s - 1].name + ' — الآية ' + arNum(a);
    box.appendChild(t); box.appendChild(ref);
    var why = TAJ_WHY[rule];
    if (why) { var w = document.createElement('div'); w.className = 'ex-w'; w.textContent = why.replace('{L}', L); box.appendChild(w); }
    return box;
  }
  function renderRule(cat, idx) {
    var r = cat.rules[idx];
    TAJ_VIEW = { cat: cat.id, rule: idx };
    document.getElementById('tajTitle').textContent = r.name;
    document.getElementById('tajChips').innerHTML = '';
    var body = document.getElementById('tajBody');
    body.innerHTML = '';
    var card = document.createElement('div'); card.className = 'rule full';
    var html = '';
    if (r.letters) html += '<div class="rule-letters">حروفه: <span>' + r.letters + '</span></div>';
    html += '<p>' + r.how + '</p>';
    card.innerHTML = html;
    if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
      var sp = document.createElement('button'); sp.type = 'button'; sp.className = 'dl-act'; sp.textContent = 'اسمع الشرح';
      sp.addEventListener('click', function () {
        try {
          if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
          var u = new SpeechSynthesisUtterance(r.name + '. ' + r.how); u.lang = 'ar'; u.rate = .9; speechSynthesis.speak(u);
        } catch (e) {}
      });
      card.appendChild(sp);
    }
    var spBtn = card.querySelector('.dl-act');
    fetch('audio/taj/map.json').then(function (x) { return x.json(); }).then(function (m) {
      var n = m[r.name]; if (!n) return;
      if (spBtn) spBtn.remove();
      var pb = document.createElement('button'); pb.type = 'button'; pb.className = 'dl-act'; pb.textContent = 'استمع للشرح بصوت المعلم';
      pb.addEventListener('click', function () {
        if (window.__tajAud && !window.__tajAud.paused) { window.__tajAud.pause(); pb.textContent = 'استمع للشرح بصوت المعلم'; return; }
        if (window.__tajAud) window.__tajAud.pause();
        var au = new Audio('audio/taj/' + n + '.mp3'); window.__tajAud = au;
        pb.textContent = 'إيقاف';
        au.addEventListener('ended', function () { pb.textContent = 'استمع للشرح بصوت المعلم'; });
        au.addEventListener('error', function () { pb.textContent = 'تعذّر التشغيل، تحقق من الاتصال'; });
        au.play().catch(function () {});
      });
      var anchor = card.querySelector('p'); if (anchor) anchor.after(pb); else card.appendChild(pb);
    }).catch(function () {});
    var qh = document.createElement('h5'); qh.className = 'ex-h'; qh.textContent = 'أمثلة توضيحية'; card.appendChild(qh);
    var l1 = document.createElement('div'); l1.className = 'ex-list';
    r.examples.forEach(function (ex) {
      l1.insertAdjacentHTML('beforeend', '<div class="ex"><div class="ex-t">' + tajHl(ex.t) + '</div><div class="ex-w">' + ex.why + '</div></div>');
    });
    card.appendChild(l1);
    var pbox = document.createElement('div'); card.appendChild(pbox);
    fetch('data/taj-poem.json').then(function (x) { return x.json(); }).then(function (d) {
      var vs = d.rules[r.name];
      if (!vs || !vs.length) return;
      var ph = document.createElement('h5'); ph.className = 'ex-h'; ph.textContent = 'من المتن: ' + d.src; pbox.appendChild(ph);
      vs.forEach(function (v) {
        var q = document.createElement('div'); q.className = 'poem-v';
        var l1 = document.createElement('div'); l1.textContent = v.a;
        var l2 = document.createElement('div'); l2.textContent = v.b;
        var no = document.createElement('small'); no.textContent = 'البيت ' + arNum(v.n);
        q.appendChild(l1); q.appendChild(l2); q.appendChild(no); pbox.appendChild(q);
      });
    }).catch(function () {});
    var mh = document.createElement('h5'); mh.className = 'ex-h'; mh.textContent = 'أمثلة من المصحف'; card.appendChild(mh);
    var mbox = document.createElement('div'); card.appendChild(mbox);
    body.appendChild(card);
    document.getElementById('tajPage').scrollTop = 0;
    var load = TAJ_EX ? Promise.resolve(TAJ_EX) : fetch('data/taj-ex.json').then(function (x) { return x.json(); }).then(function (d) { TAJ_EX = d; return d; });
    load.then(function (d) {
      var D = d[r.name];
      if (!D) { mbox.textContent = 'لا توجد أمثلة مرصودة آليًا لهذا الحكم بعد.'; return; }
      var keys = Object.keys(D.g);
      var info = document.createElement('p'); info.className = 'ex-sum';
      info.textContent = 'عدد المواضع المرصودة في المصحف: ' + arNum(D.tot) + ' (نعرض عينة متنوعة من سور كثيرة).';
      mbox.appendChild(info);
      var chips = document.createElement('div'); chips.className = 'taj-chips ex-chips';
      var list = document.createElement('div'); list.className = 'ex-list';
      var cur = null, shown = 8;
      function draw() {
        list.innerHTML = '';
        var arr = D.g[cur];
        var need = {};
        arr.forEach(function (e) { need[e[0]] = 1; });
        Promise.all(Object.keys(need).map(function (n) { return loadSurah(+n); })).then(function () {
          arr.slice(0, shown).forEach(function (e) { list.appendChild(exNode(r.name, cur, e)); });
          if (arr.length > shown) {
            var more = document.createElement('button'); more.type = 'button'; more.className = 'dl-act';
            more.textContent = 'أمثلة أكثر (' + arNum(arr.length - shown) + ')';
            more.addEventListener('click', function () { shown += 12; draw(); });
            list.appendChild(more);
          }
        });
      }
      function pick(k) {
        cur = k; shown = 8;
        Array.prototype.forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.k === k); });
        draw();
      }
      if (keys.length > 1 || keys[0] !== '') {
        keys.forEach(function (k) {
          var c = document.createElement('button'); c.type = 'button'; c.className = 'taj-chip'; c.dataset.k = k;
          c.textContent = 'حرف ' + k + ' (' + arNum(D.g[k].length) + ')';
          c.addEventListener('click', function () { pick(k); });
          chips.appendChild(c);
        });
        mbox.appendChild(chips);
      }
      mbox.appendChild(list);
      pick(keys[0]);
    }).catch(function () { mbox.textContent = 'تعذر تحميل الأمثلة.'; });
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
    TAJ_VIEW = { cat: cat.id, rule: -1 };
    cat.rules.forEach(function (r, idx) {
      var b = document.createElement('button');
      b.className = 'taj-cat taj-rule-btn';
      var nm = document.createElement('b'); nm.textContent = arNum(idx + 1) + ' — ' + r.name;
      var sm = document.createElement('small'); sm.textContent = r.letters ? 'حروفه: ' + r.letters : '';
      b.appendChild(nm); b.appendChild(sm);
      b.addEventListener('click', function () { renderRule(cat, idx); });
      body.appendChild(b);
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

  document.getElementById('tajBack').addEventListener('click', function () {
    if (TAJ_VIEW.rule >= 0) { try { speechSynthesis.cancel(); } catch (e) {} renderTaj(TAJ_VIEW.cat); } else closeTaj();
  });
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
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0 && navigator.userAgent.indexOf('QuranAPK') === -1) {
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

try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

/* copy protection (best effort): block copy/cut/context menu/drag outside the allowed areas */
(function () {
  var ALLOW = '#readerBody, .ayahs, .mushaf-page, #tajBody, #duaBody, .hs-sheet, .hs-text, #riwayat, .hs-wrap .hs-item';
  function ok(n) {
    if (!n) return false;
    var e = n.nodeType === 1 ? n : n.parentElement;
    return !!(e && e.closest && (e.closest(ALLOW) || e.closest('input,textarea')));
  }
  function selOk() {
    var ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return true;
    var s = window.getSelection && window.getSelection();
    if (!s || s.isCollapsed) return false;
    return ok(s.anchorNode) && ok(s.focusNode);
  }
  ['copy', 'cut'].forEach(function (t) { document.addEventListener(t, function (e) { if (!selOk()) { e.preventDefault(); } }, true); });
  document.addEventListener('contextmenu', function (e) { if (!ok(e.target)) e.preventDefault(); }, true);
  document.addEventListener('dragstart', function (e) { if (!ok(e.target)) e.preventDefault(); }, true);
  document.addEventListener('selectstart', function (e) { if (!ok(e.target)) e.preventDefault(); }, true);
})();
