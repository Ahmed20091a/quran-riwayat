/* ساعة القاهرة (تتحدث كل ثانية والصفحة ظاهرة فقط) + قائمة التنقل على الشاشات الصغيرة */
(function () {
  var f = new Intl.DateTimeFormat('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  var els = [document.getElementById('hClock'), document.getElementById('slClock')].filter(Boolean), timer = null;
  function tick() { var s = f.format(new Date()); els.forEach(function (e) { e.textContent = s; }); }
  function start() { if (timer) return; tick(); timer = setInterval(tick, 1000); }
  function stop() { clearInterval(timer); timer = null; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if (!document.hidden) start();
  var btn = document.getElementById('navBtn'), links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', function () { var o = links.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }
})();
