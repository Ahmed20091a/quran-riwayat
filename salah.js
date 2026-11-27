/* مواقيت الصلاة لمصر: حساب فلكي محلي بطريقة الهيئة المصرية العامة للمساحة (الفجر ١٩٫٥°، العشاء ١٧٫٥°، العصر مثل الجمهور)، يعمل بدون إنترنت. */
(function () {
  var CITIES = [
    ['cairo', 'القاهرة', 30.0444, 31.2357], ['zagazig', 'الزقازيق', 30.5877, 31.5020], ['giza', 'الجيزة', 30.0131, 31.2089],
    ['alex', 'الإسكندرية', 31.2001, 29.9187], ['mansoura', 'المنصورة', 31.0409, 31.3785], ['tanta', 'طنطا', 30.7865, 31.0004],
    ['portsaid', 'بورسعيد', 31.2653, 32.3019], ['suez', 'السويس', 29.9668, 32.5498], ['ismailia', 'الإسماعيلية', 30.5965, 32.2715],
    ['damietta', 'دمياط', 31.4165, 31.8133], ['benha', 'بنها', 30.4660, 31.1853], ['shibin', 'شبين الكوم', 30.5588, 31.0116],
    ['damanhur', 'دمنهور', 31.0341, 30.4682], ['kafrelsheikh', 'كفر الشيخ', 31.1107, 30.9388], ['faiyum', 'الفيوم', 29.3084, 30.8428],
    ['benisuef', 'بني سويف', 29.0661, 31.0994], ['minya', 'المنيا', 28.1099, 30.7503], ['asyut', 'أسيوط', 27.1809, 31.1837],
    ['sohag', 'سوهاج', 26.5569, 31.6948], ['qena', 'قنا', 26.1551, 32.7160], ['luxor', 'الأقصر', 25.6872, 32.6396], ['aswan', 'أسوان', 24.0889, 32.8998],
    ['hurghada', 'الغردقة', 27.2579, 33.8116], ['sharm', 'شرم الشيخ', 27.9158, 34.3300], ['arish', 'العريش', 31.1316, 33.7984], ['matruh', 'مرسى مطروح', 31.3543, 27.2373]
  ];
  var FAJR = 19.5, ISHA = 17.5, ASR = 1;   /* Egyptian General Authority of Survey */
  var R = Math.PI / 180;
  function sin(d) { return Math.sin(d * R); } function cos(d) { return Math.cos(d * R); } function tan(d) { return Math.tan(d * R); }
  function asin(x) { return Math.asin(x) / R; } function acos(x) { return Math.acos(x) / R; } function atan2(y, x) { return Math.atan2(y, x) / R; } function acot(x) { return Math.atan(1 / x) / R; }
  function fa(a) { a = a - 360 * Math.floor(a / 360); return a; } function fh(h) { return h - 24 * Math.floor(h / 24); }
  function julian(y, m, d) { if (m <= 2) { y -= 1; m += 12; } var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
  function sunPos(jd) {
    var D = jd - 2451545.0, g = fa(357.529 + 0.98560028 * D), q = fa(280.459 + 0.98564736 * D), L = fa(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    var e = 23.439 - 0.00000036 * D, RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return { decl: asin(sin(e) * sin(L)), eq: q / 15 - fh(RA) };
  }
  function mid(jd, t) { return fh(12 - sunPos(jd + t).eq); }
  function angleTime(jd, lat, ang, t, ccw) {
    var decl = sunPos(jd + t).decl, noon = mid(jd, t);
    var v = 1 / 15 * acos((-sin(ang) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat)));
    return noon + (ccw ? -v : v);
  }
  function asrTime(jd, lat, f, t) { var decl = sunPos(jd + t).decl; return angleTime(jd, lat, -acot(f + tan(Math.abs(lat - decl))), t, false); }
  /* returns UTC ms for each prayer on the civil date y-m-d (Cairo calendar day) */
  function compute(y, m, d, lat, lng) {
    var jd = julian(y, m, d) - lng / (15 * 24), t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, isha: 18 };
    for (var i = 0; i < 2; i++) {
      t = {
        fajr: angleTime(jd, lat, FAJR, t.fajr / 24, true), sunrise: angleTime(jd, lat, 0.833, t.sunrise / 24, true),
        dhuhr: mid(jd, t.dhuhr / 24), asr: asrTime(jd, lat, ASR, t.asr / 24),
        sunset: angleTime(jd, lat, 0.833, t.sunset / 24, false), isha: angleTime(jd, lat, ISHA, t.isha / 24, false)
      };
    }
    var base = Date.UTC(y, m - 1, d), o = {};
    Object.keys(t).forEach(function (k) { o[k] = base + (t[k] - lng / 15) * 3600000; });
    o.maghrib = o.sunset;
    return o;
  }
  window.PT = { compute: compute, CITIES: CITIES };
  if (typeof document === 'undefined' || !document.getElementById('slCity')) return;

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function $(s) { return document.querySelector(s); }
  var TZ = 'Africa/Cairo';
  var fmtT = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
  var fmtParts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  var fmtG = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var fmtH; try { fmtH = new Intl.DateTimeFormat('ar-EG-u-ca-islamic-umalqura-nu-latn', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { fmtH = null; }
  function T(ms) { return fmtT.format(new Date(ms + 30000)); }   /* shown to the nearest minute */
  function cairoYMD(ms) { var p = fmtParts.format(new Date(ms)).split('-'); return [+p[0], +p[1], +p[2]]; }
  var KEY = 'quran.salah';
  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!st || typeof st !== 'object') st = {};
  if (!CITIES.some(function (c) { return c[0] === st.city; })) st.city = 'cairo';
  st.auto = !!st.auto; st.muez = st.muez || 'a9';
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var NAMES = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
  var ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  var MUEZ = [
    ['a9', 'مشاري العفاسي (١)', 'https://cdn.aladhan.com/audio/adhans/a9.mp3'],
    ['a7', 'مشاري العفاسي (٢)', 'https://cdn.aladhan.com/audio/adhans/a7.mp3'],
    ['a4', 'مشاري العفاسي (دبي)', 'https://cdn.aladhan.com/audio/adhans/a4.mp3'],
    ['a1', 'أحمد النفيس', 'https://cdn.aladhan.com/audio/adhans/a1.mp3'],
    ['a11', 'منصور الزهراني', 'https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3'],
    ['a2', 'حافظ مصطفى أوزجان (تركيا)', 'https://cdn.aladhan.com/audio/adhans/a2.mp3']
  ];
  var city = $('#slCity'), muez = $('#slMuez');
  CITIES.forEach(function (c) { city.add(new Option(c[1], c[0])); });
  MUEZ.forEach(function (m) { muez.add(new Option(m[1], m[0])); });
  if (!MUEZ.some(function (m) { return m[0] === st.muez; })) st.muez = 'a9';
  city.value = st.city; muez.value = st.muez; $('#slAuto').checked = st.auto;
  var day = null, times = null, played = {};
  function cur() { return CITIES.filter(function (c) { return c[0] === st.city; })[0]; }
  function build(now) {
    var ymd = cairoYMD(now), key = ymd.join('-') + st.city;
    if (day === key) return;
    day = key; var c = cur();
    times = compute(ymd[0], ymd[1], ymd[2], c[2], c[3]);
    var next = compute.apply(null, (function () { var t = cairoYMD(Date.UTC(ymd[0], ymd[1] - 1, ymd[2]) + 36 * 3600000); return [t[0], t[1], t[2], c[2], c[3]]; })());
    times.nextFajr = next.fajr;
    var list = $('#slList'); list.innerHTML = '';
    ORDER.forEach(function (k) {
      var r = document.createElement('button'); r.type = 'button'; r.className = 'sl-p'; r.id = 'sl-' + k; r.style.setProperty('--tint', TINT[k]);
      var tm = T(times[k]), i = tm.lastIndexOf(' ');
      r.innerHTML = '<span class="sl-ic"></span><span class="sl-nm"></span><b></b><small></small>';
      r.querySelector('.sl-ic').innerHTML = mini(k); r.querySelector('.sl-nm').textContent = NAMES[k];
      r.querySelector('b').textContent = tm.slice(0, i); r.querySelector('small').textContent = tm.slice(i + 1);
      r.addEventListener('click', function () { selectView(k); });
      list.appendChild(r);
    });
    $('#slG').textContent = fmtG.format(new Date(now)) + ' م';
    $('#slH').textContent = fmtH ? fmtH.format(new Date(now)) + ' (تقريبي، قد يختلف يومًا)' : '';
    $('#slMethod').textContent = 'طريقة الحساب: الهيئة المصرية العامة للمساحة (الفجر ١٩٫٥° والعشاء ١٧٫٥°)، العصر بظل مثل الشيء. الأوقات محسوبة داخل الموقع بإحداثيات ' + cur()[1] + ' بتوقيت القاهرة. قد يختلف التقويم الرسمي بدقيقة أو دقيقتين.';
  }

  /* ---------- sky scene (decorative, approximate) ---------- */
  var SKY = {
    night: ['#050b1f', '#12214a'], fajr: ['#14214f', '#c9856b'], sunrise: ['#4a6aa8', '#f7b267'],
    dhuhr: ['#2f7fd1', '#9bd3f5'], asr: ['#3f86c8', '#ecd49b'], maghrib: ['#3a2a63', '#f2683a'], isha: ['#0b1230', '#26346b']
  };
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mixc(a, b, f) { a = hex(a); b = hex(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * f); }).join(',') + ')'; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function frames() {
    var M = 60000;
    return [[times.fajr - 40 * M, 'night'], [times.fajr, 'fajr'], [times.sunrise + 10 * M, 'sunrise'], [times.dhuhr, 'dhuhr'], [times.asr, 'asr'],
      [times.maghrib - 8 * M, 'maghrib'], [times.maghrib + 12 * M, 'maghrib'], [times.isha, 'isha'], [times.isha + 70 * M, 'night']];
  }
  function colors(t) {
    var F = frames(), i;
    if (t <= F[0][0]) return SKY.night; if (t >= F[F.length - 1][0]) return SKY.night;
    for (i = 0; i < F.length - 1; i++) if (t < F[i + 1][0]) break;
    var f = (t - F[i][0]) / (F[i + 1][0] - F[i][0]), A = SKY[F[i][1]], B = SKY[F[i + 1][1]];
    return [mixc(A[0], B[0], f) , mixc(A[1], B[1], f)];
  }
  function rgbOf(c) { return c.charAt(0) === '#' ? hex(c) : c.match(/\d+/g).map(Number); }
  function dark(c) { var r = rgbOf(c); return 'rgb(' + r.map(function (v) { return Math.round(v * 0.22); }).join(',') + ')'; }
  function state(t) {
    var D = 86400000, sr = times.sunrise, ss = times.sunset, o = { col: colors(t) };
    var f = (t - sr) / (ss - sr), h = Math.sin(Math.PI * f);
    o.sunOn = f > -0.07 && f < 1.07; o.sx = 30 + 300 * clamp(f, -0.07, 1.07); o.sy = 200 - h * 100; o.h = o.sunOn ? Math.max(h, 0) : 0;
    var nsr = sr + D, pss = ss - D, g;
    if (t >= ss) g = (t - ss) / (nsr - ss); else g = (t - pss) / (sr - pss);
    var day = t >= sr && t <= ss;
    o.moonOn = !day; o.mx = 30 + 300 * clamp(g, 0, 1); o.my = 200 - Math.sin(Math.PI * clamp(g, 0, 1)) * 92;
    var dusk = clamp((t - ss) / (70 * 60000), 0, 1), dawn = clamp((sr - t) / (70 * 60000), 0, 1);
    o.stars = day ? 0 : Math.max(dusk, dawn);
    if (t > ss + D / 2) o.stars = 1;
    return o;
  }
  var svg = document.getElementById('slSky'), starsG = document.getElementById('skStars');
  (function () {
    var x = 17, i, out = '';
    for (i = 0; i < 46; i++) { x = (x * 9301 + 49297) % 233280; var a = x / 233280; x = (x * 9301 + 49297) % 233280; var b = x / 233280;
      out += '<circle class="st s' + (i % 3) + '" cx="' + (a * 360).toFixed(1) + '" cy="' + (b * 120).toFixed(1) + '" r="' + (0.5 + (i % 4) * 0.35).toFixed(2) + '" fill="#fff"/>'; }
    starsG.innerHTML = out;
  })();
  function setA(id, o) { var e = document.getElementById(id); for (var k in o) e.setAttribute(k, o[k]); }
  function sunCol(h) { return mixc('#ff7a2e', '#fff3b0', clamp(h * 2.2, 0, 1)); }
  function drawSky(t) {
    var o = state(t);
    setA('skT', { 'stop-color': o.col[0] }); setA('skB', { 'stop-color': o.col[1] });
    starsG.setAttribute('opacity', o.stars.toFixed(2));
    document.getElementById('skClouds').setAttribute('opacity', (0.15 + 0.5 * (1 - o.stars)).toFixed(2));
    var vis = o.sunOn ? 1 : 0;
    setA('sunDisc', { cx: o.sx, cy: o.sy, r: (14 + 9 * (1 - o.h)).toFixed(1), fill: sunCol(o.h), opacity: vis });
    setA('sunGlow', { cx: o.sx, cy: o.sy, opacity: vis * (0.55 + 0.4 * (1 - o.h)) });
    setA('moonDisc', { cx: o.mx, cy: o.my, opacity: o.moonOn ? 1 : 0 });
    setA('moonCut', { cx: o.mx + 6, cy: o.my - 3 });
    var d = dark(o.col[1]); document.getElementById('skHill').setAttribute('fill', d); document.getElementById('skMosque').setAttribute('fill', d); document.getElementById('skLights').setAttribute('opacity', (Math.max(0, o.stars - 0.2) * 0.95).toFixed(2));
  }
  var ICON = {
    fajr: '<path d="M4 17h16M7 17a5 5 0 0 1 10 0"/><path d="M12 6v2M5.5 9.5L7 11M18.5 9.5L17 11"/><path d="M17 3.2a2.4 2.4 0 1 0 2.8 2.8 3 3 0 0 1-2.8-2.8z"/>',
    sunrise: '<path d="M3 18h18M7 18a5 5 0 0 1 10 0"/><path d="M12 4v5M9.5 6.5L12 4l2.5 2.5"/><path d="M4.5 12l1.4 1.4M19.5 12l-1.4 1.4"/>',
    dhuhr: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    asr: '<circle cx="9" cy="9" r="3"/><path d="M9 3v1.5M3 9h1.5M4.8 4.8l1 1M13.2 4.8l-1 1"/><path d="M8 19h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.3 1.6A2.7 2.7 0 0 0 8 19z"/>',
    maghrib: '<path d="M3 18h18M7 18a5 5 0 0 1 10 0"/><path d="M12 4v5M9.5 6.5L12 9l2.5-2.5"/><path d="M4.5 12l1.4 1.4M19.5 12l-1.4 1.4"/>',
    isha: '<path d="M19 14.5A8 8 0 1 1 9.5 5a6.5 6.5 0 0 0 9.5 9.5z"/><path d="M17 4v3M15.5 5.5h3"/>'
  };
  var TINT = { fajr: '#7b6bd6', sunrise: '#f39a4a', dhuhr: '#f2c84b', asr: '#e0a24a', maghrib: '#ee6a43', isha: '#6f86d8' };
  function mini(k) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>';
  }
  var vt = null, tgt = null, raf = 0, viewK = null;
  function frame() {
    raf = 0; if (tgt == null) return;
    var d = tgt - vt;
    if (Math.abs(d) < 20000) { vt = tgt; drawSky(vt); return; }
    vt += d * 0.07; drawSky(vt); raf = requestAnimationFrame(frame);
  }
  function setTarget(t) { tgt = t; if (vt == null) vt = t; if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
  function caption(k, t) {
    document.getElementById('slSkyCap').textContent = k ? 'السماء وقت ' + NAMES[k] + ' (رسم تقريبي)' : 'السماء الآن (رسم تقريبي)';
    document.getElementById('slLive').hidden = !k;
    ORDER.forEach(function (n) { var e = $('#sl-' + n); if (e) e.classList.toggle('sel', n === k); });
  }
  function selectView(k) {
    viewK = k; setTarget(times[k] + (k === 'isha' ? 25 * 60000 : 0)); caption(k);
    document.getElementById('slSkyBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  document.getElementById('slLive').addEventListener('click', function () { viewK = null; setTarget(Date.now()); caption(null); });
  var adhanEl = null;
  function url() { return MUEZ.filter(function (m) { return m[0] === st.muez; })[0][2]; }
  function play() { if (!adhanEl) adhanEl = new Audio(); adhanEl.src = url(); var p = adhanEl.play(); if (p && p.catch) p.catch(function () {}); }
  function stop() { if (adhanEl) { try { adhanEl.pause(); adhanEl.currentTime = 0; } catch (e) {} } }
  function tick() {
    var now = Date.now(); build(now);
    var nxt = null, nk = '';
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(function (k) { if (!nxt && times[k] > now) { nxt = times[k]; nk = k; } });
    if (!nxt) { nxt = times.nextFajr; nk = 'fajr'; }
    var s = Math.max(0, Math.floor((nxt - now) / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    function p2(n) { return n < 10 ? '0' + n : String(n); }
    $('#slNextName').textContent = NAMES[nk] + ' بعد';
    $('#slCount').textContent = p2(h) + ':' + p2(m) + ':' + p2(x);
    $('#slNextAt').textContent = 'الساعة ' + T(nxt);
    ORDER.forEach(function (k) { var e = $('#sl-' + k); if (e) e.classList.toggle('next', k === nk); });
    if (!viewK) { if (tgt == null || !raf) { vt = now; tgt = now; drawSky(now); } else tgt = now; caption(null); } else { caption(viewK); }
    if (st.auto) ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(function (k) {
      var id = day + k;
      if (!played[id] && now >= times[k] && now - times[k] < 60000) { played[id] = 1; play(); }
    });
  }
  var timer = null;
  function start() { if (timer) return; tick(); timer = setInterval(tick, 1000); }
  function halt() { clearInterval(timer); timer = null; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else start(); });
  city.addEventListener('change', function () { st.city = city.value; save(); day = null; tick(); });
  muez.addEventListener('change', function () { st.muez = muez.value; save(); });
  $('#slAuto').addEventListener('change', function (e) {
    st.auto = e.target.checked; save();
    if (st.auto) { /* unlock audio inside this tap, so it may start by itself later while the page is open */
      if (!adhanEl) adhanEl = new Audio();
      adhanEl.muted = true; adhanEl.src = url(); var p = adhanEl.play();
      var done = function () { try { adhanEl.pause(); adhanEl.currentTime = 0; } catch (x) {} adhanEl.muted = false; };
      if (p && p.then) p.then(done, function () { adhanEl.muted = false; }); else done();
    }
  });
  $('#slPlay').addEventListener('click', play);
  $('#slStop').addEventListener('click', stop);
  if (!document.hidden) start();
})();
