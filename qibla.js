(function () {
  'use strict';
  var KAABA = [21.4225, 39.8262], KEY = 'quran.qibla';
  var CITIES = [['القاهرة',30.0444,31.2357],['الإسكندرية',31.2001,29.9187],['الجيزة',30.0131,31.2089],['الزقازيق',30.5877,31.5020],['المنصورة',31.0409,31.3785],['طنطا',30.7865,31.0004],['بورسعيد',31.2653,32.3019],['السويس',29.9668,32.5498],['الإسماعيلية',30.5965,32.2715],['الفيوم',29.3084,30.8428],['أسيوط',27.1809,31.1837],['الأقصر',25.6872,32.6396],['أسوان',24.0889,32.8998]];
  var $ = function (i) { return document.getElementById(i); };
  if (!$('qibla')) return;
  var rad = Math.PI / 180, bearing = null, heading = null, place = '';
  function calc(lat, lon) {
    var p1 = lat * rad, p2 = KAABA[0] * rad, dl = (KAABA[1] - lon) * rad;
    var y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (Math.atan2(y, x) / rad + 360) % 360;
  }
  var shown = 0, sinS = 0, cosS = 0, have = false, lastT = 0, tid = null;
  function render() {
    if (bearing === null) return;
    $('qbDeg').textContent = Math.round(bearing) + '° من الشمال';
    $('qbWhere').textContent = place;
    if (heading !== null) {
      /* unwrap so the ring turns the short way and never spins through 360 */
      var target = -heading, d = ((target - shown) % 360 + 540) % 360 - 180;
      shown += d;
      $('qbRing').style.transform = 'rotate(' + shown.toFixed(1) + 'deg)';
      var off = ((bearing - heading) % 360 + 540) % 360 - 180;
      var ok = Math.abs(off) <= (render.was ? 9 : 4); /* hysteresis: no flicker or repeated buzzing at the edge */
      $('qbDial').classList.toggle('aligned', ok);
      if (ok && !render.was && Date.now() - (render.vt || 0) > 3000) { render.vt = Date.now(); try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {} }
      render.was = ok;
      $('qbNote').textContent = ok ? 'أنت تواجه القبلة تقريبًا' : 'أدر هاتفك حتى تصير الكعبة أعلى الدائرة. إن بدت الإبرة غير مستقرة حرّك الهاتف على شكل ٨ لمعايرة الحساس، وابتعد عن المعادن والمغناطيس.';
    } else { $('qbRing').style.transform = 'rotate(0deg)'; }
    $('qbKaaba').style.transform = 'rotate(' + bearing + 'deg)';
    $('qbDial').classList.toggle('live', heading !== null);
  }
  function setLoc(lat, lon, name, save) {
    bearing = calc(lat, lon); place = name;
    if (save) { try { localStorage.setItem(KEY, JSON.stringify([lat, lon, name])); } catch (e) {} }
    render();
  }
  var sel = $('qbCity');
  CITIES.forEach(function (c, i) { var o = document.createElement('option'); o.value = i; o.textContent = c[0]; sel.appendChild(o); });
  sel.addEventListener('change', function () { var c = CITIES[+sel.value]; setLoc(c[1], c[2], c[0], true); });
  $('qbLoc').addEventListener('click', function () {
    if (!navigator.geolocation) { $('qbWhere').textContent = 'الموقع غير متاح، اختر مدينة'; return; }
    $('qbWhere').textContent = 'جارٍ تحديد الموقع…';
    navigator.geolocation.getCurrentPosition(function (p) { setLoc(p.coords.latitude, p.coords.longitude, 'موقعك الحالي', true); },
      function () { $('qbWhere').textContent = 'لم يُسمح بالموقع. اختر مدينة من القائمة.'; if (bearing === null) { var c = CITIES[0]; setLoc(c[1], c[2], c[0] + ' (افتراضي)', false); } },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  });
  /* tilt-compensated compass heading (W3C formula), so it also works when the phone is held upright */
  function tiltHeading(al, be, ga) {
    var a = al * rad, b = be * rad, g = ga * rad;
    var cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
    var vx = -cA * sG - sA * sB * cG, vy = -sA * sG + cA * sB * cG;
    if (Math.sqrt(vx * vx + vy * vy) < 0.35) return (360 - al) % 360; /* nearly flat: the back of the phone points at the floor, use alpha */
    var h = Math.atan2(vx, vy) / rad; return (h + 360) % 360;
  }
  function onOri(e) {
    var h = null;
    if (typeof e.webkitCompassHeading === 'number' && isFinite(e.webkitCompassHeading)) h = e.webkitCompassHeading;
    else if (e.absolute && typeof e.alpha === 'number' && typeof e.beta === 'number' && typeof e.gamma === 'number') h = tiltHeading(e.alpha, e.beta, e.gamma);
    else if (e.absolute && typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
    if (h === null) return;
    var ang = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (typeof window.orientation === 'number' ? window.orientation : 0);
    if (typeof e.webkitCompassHeading !== 'number') h = (h + ang) % 360; /* iOS heading is already screen-corrected */
    /* circular low-pass so the needle is steady but still follows */
    var r = h * rad;
    if (!have) { sinS = Math.sin(r); cosS = Math.cos(r); have = true; }
    else { var k = 0.18; sinS += k * (Math.sin(r) - sinS); cosS += k * (Math.cos(r) - cosS); }
    heading = (Math.atan2(sinS, cosS) / rad + 360) % 360;
    var now = Date.now(); if (now - lastT < 50) return; lastT = now;
    if (tid) { clearTimeout(tid); tid = null; }
    render();
  }
  var listening = false, useAbs = false;
  function stopCompass() {
    if (!listening) return; listening = false; have = false;
    window.removeEventListener('deviceorientationabsolute', onOri, true); window.removeEventListener('deviceorientation', onOri, true);
    if (tid) { clearTimeout(tid); tid = null; }
    $('qbDial').classList.remove('live', 'aligned');
  }
  /* the sensor only runs while the Qibla screen is open and visible */
  window.addEventListener('hashchange', function () { if (location.hash !== '#qibla') stopCompass(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopCompass(); });
  $('qbCmp').addEventListener('click', function () {
    var D = window.DeviceOrientationEvent;
    if (!D) { $('qbNote').textContent = 'جهازك لا يدعم حساس البوصلة. اتجه نحو الزاوية المكتوبة.'; return; }
    function go() {
      if (listening) return;
      listening = true;
      /* ONE sensor source only: mixing the absolute and relative streams makes the needle jump */
      useAbs = ('ondeviceorientationabsolute' in window);
      window.addEventListener(useAbs ? 'deviceorientationabsolute' : 'deviceorientation', onOri, true);
      $('qbNote').textContent = 'جارٍ قراءة الحساس…';
      tid = setTimeout(function () { if (!have) $('qbNote').textContent = 'لا توجد قراءة من الحساس. اتجه نحو الزاوية المكتوبة أعلاه، أو جرّب من المتصفح.'; }, 3000);
    }
    if (typeof D.requestPermission === 'function') { D.requestPermission().then(function (r) { if (r === 'granted') go(); }).catch(function () {}); } else go();
  });
  var saved = null; try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (saved && saved.length === 3 && isFinite(saved[0]) && isFinite(saved[1])) setLoc(saved[0], saved[1], String(saved[2]), false);
  else { var c = CITIES[0]; setLoc(c[1], c[2], c[0] + ' (افتراضي)', false); }
})();
