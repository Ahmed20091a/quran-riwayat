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
  function render() {
    if (bearing === null) return;
    $('qbDeg').textContent = Math.round(bearing) + '° من الشمال';
    $('qbWhere').textContent = place;
    var rot = heading === null ? 0 : -heading;
    $('qbRing').style.transform = 'rotate(' + rot + 'deg)';
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
  function onOri(e) {
    var h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if (e.absolute && typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
    if (h === null) return;
    heading = h; render();
  }
  $('qbCmp').addEventListener('click', function () {
    var D = window.DeviceOrientationEvent;
    if (!D) { $('qbNote').textContent = 'جهازك لا يدعم حساس البوصلة. اتجه نحو الزاوية المكتوبة.'; return; }
    function go() { window.addEventListener('deviceorientationabsolute', onOri, true); window.addEventListener('deviceorientation', onOri, true); }
    if (typeof D.requestPermission === 'function') { D.requestPermission().then(function (r) { if (r === 'granted') go(); }).catch(function () {}); } else go();
  });
  var saved = null; try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (saved && saved.length === 3 && isFinite(saved[0]) && isFinite(saved[1])) setLoc(saved[0], saved[1], String(saved[2]), false);
  else { var c = CITIES[0]; setLoc(c[1], c[2], c[0] + ' (افتراضي)', false); }
})();
