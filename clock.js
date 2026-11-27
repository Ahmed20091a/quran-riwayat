/* ساعة القاهرة (تتحدث كل ثانية والصفحة ظاهرة فقط) + قائمة التنقل على الشاشات الصغيرة */
(function () {
  var f = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: 'Africa/Cairo', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  var els = [document.getElementById('hClock'), document.getElementById('slClock')].filter(Boolean), timer = null;
  var gf = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: 'Africa/Cairo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var df = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: 'Africa/Cairo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), hd = document.getElementById('hDate'), lastD = '';
  function tick() {
    var d = new Date(), p = f.formatToParts(d), o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    if (hd) { var ds = df.format(d); if (ds !== lastD) { lastD = ds; hd.textContent = ds; } }
    var per = (o.dayPeriod || '').replace(/\s/g, '');
    els.forEach(function (e) { e.innerHTML = '<span class="ck-t"></span><span class="ck-p"></span>'; e.firstChild.textContent = o.hour + ':' + o.minute + ':' + o.second; e.lastChild.textContent = per; });
  }
  function start() { if (timer) return; tick(); timer = setInterval(tick, 1000); }
  function stop() { clearInterval(timer); timer = null; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if (!document.hidden) start();
  var rb = document.getElementById('rbTools'), shell = document.getElementById('reader');
  if (rb && shell) rb.addEventListener('click', function () {
    var o = shell.classList.toggle('tools'); rb.setAttribute('aria-expanded', o);
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 30);
  });
  var btn = document.getElementById('navBtn'), links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', function () { var o = links.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }
})();
