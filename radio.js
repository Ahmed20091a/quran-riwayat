/* الإذاعة: بث مباشر لتلاوات القرآن من خوادم Mp3Quran (يحتاج إنترنت) */
(function () {
  var list = document.getElementById('rdList'); if (!list) return;
  var now = document.getElementById('rdNow'), nameEl = document.getElementById('rdName'), stateEl = document.getElementById('rdState');
  var search = document.getElementById('rdSearch');
  var ST = null, cur = null, au = null, loaded = false;
  function norm(s) { return String(s).replace(/[\u064B-\u0652\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); }
  function okUrl(u) { return /^https:\/\/(backup\.qurango\.net\/radio\/[A-Za-z0-9_-]+|stream\.radiojar\.com\/[A-Za-z0-9]+|service\.webvideocore\.net\/[A-Za-z0-9_-]+\/[A-Za-z0-9_]+\.m3u8)$/.test(u); }
  function stop() {
    if (au) { try { au.pause(); au.removeAttribute('src'); au.load(); } catch (e) {} au = null; }
    clearT(); cur = null; now.hidden = true; paint();
  }
  var tried = 0, timer = null, retried = {};
  function clearT() { if (timer) { clearTimeout(timer); timer = null; } }
  function nextOk(st) {
    var i = ST.indexOf(st), k;
    for (k = 1; k <= ST.length; k++) { var c = ST[(i + k) % ST.length]; if (c !== st && !c.bad) return c; }
    return null;
  }
  function fail(st, why) {
    clearT();
    if (cur !== st) return;
    /* the stream host answers 500 when connections come too fast (verified live: same URL works a few seconds later): retry the same station twice, with a pause */
    if ((retried[st.u] || 0) < 2) { var rn = retried[st.u] = (retried[st.u] || 0) + 1; stateEl.textContent = 'جارٍ إعادة المحاولة…'; timer = setTimeout(function () { if (cur === st) start(st, true); }, rn === 1 ? 2500 : 5000); return; }
    st.bad = true; tried++;
    var nx = tried < 6 ? nextOk(st) : null;
    if (!nx) { stateEl.textContent = 'تعذّر تشغيل الإذاعات حاليًا. تأكد من الإنترنت وجرّب بعد شوية.'; tried = 0; paint(); return; }
    stateEl.textContent = 'تعذّر تشغيل «' + st.n + '» (' + why + '). جارٍ تجربة «' + nx.n + '»…';
    var msg = stateEl.textContent;
    start(nx, false); stateEl.textContent = msg;
  }
  function start(st, keepMsg) {
    if (au) { try { au.pause(); au.removeAttribute('src'); au.load(); } catch (e) {} }
    clearT();
    cur = st; au = new Audio(); au.preload = 'none';
    var me = au;
    nameEl.textContent = st.n; if (!keepMsg) stateEl.textContent = 'جارٍ الاتصال…'; now.hidden = false;
    if (/\.m3u8$/.test(st.u) && !me.canPlayType('application/vnd.apple.mpegurl')) { setTimeout(function () { fail(st, 'المتصفح لا يدعم هذا البث'); }, 0); paint(); return; }
    me.addEventListener('playing', function () { if (au !== me) return; clearT(); tried = 0; stateEl.textContent = 'يعمل الآن'; });
    me.addEventListener('waiting', function () { if (au === me) stateEl.textContent = 'جارٍ التحميل…'; });
    me.addEventListener('error', function () { if (au === me) fail(st, 'خطأ في الاتصال'); });
    me.addEventListener('stalled', function () { if (au === me && me.paused) stateEl.textContent = 'جارٍ التحميل…'; });
    me.src = st.u;
    var pr = me.play(); if (pr && pr.catch) pr.catch(function (e) { if (au === me && !(e && e.name === 'AbortError')) fail(st, 'منع المتصفح التشغيل'); });
    timer = setTimeout(function () { if (au === me && me.paused) fail(st, 'لا يستجيب'); }, 12000);
    paint();
  }
  function play(st) {
    if (!okUrl(st.u)) return;
    tried = 0; retried = {}; ST.forEach(function (x) { x.bad = false; });
    start(st, false);
  }
  function paint() {
    var q = norm(search.value.trim());
    list.innerHTML = '';
    ST.forEach(function (st) {
      if (q && norm(st.n).indexOf(q) === -1) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rd-item' + (cur === st ? ' on' : '');
      var ic = document.createElement('span'); ic.className = 'rd-ic'; ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = cur === st ? '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
      var t = document.createElement('span'); t.className = 'rd-t'; t.textContent = st.n;
      b.appendChild(t); b.appendChild(ic);
      b.addEventListener('click', function () { if (cur === st) stop(); else play(st); });
      list.appendChild(b);
    });
    if (!list.children.length) { var e = document.createElement('div'); e.className = 'sb-empty'; e.textContent = 'لا توجد نتائج'; list.appendChild(e); }
  }
  function load() {
    if (loaded) return; loaded = true;
    fetch('data/radio.json').then(function (r) { return r.json(); }).then(function (d) {
      ST = d.filter(function (x) { return x && typeof x.n === 'string' && typeof x.u === 'string' && okUrl(x.u); }); paint();
    }).catch(function () { list.textContent = 'تعذّر تحميل قائمة الإذاعات. تأكد من الإنترنت.'; loaded = false; });
  }
  search.addEventListener('input', function () { if (ST) paint(); });
  document.getElementById('rdStop').addEventListener('click', stop);
  window.addEventListener('hashchange', function () { if (location.hash === '#radio') load(); });
  if (location.hash === '#radio') load();
  /* nav.js calls this when the screen is shown */
  window.onRadioShow = load;
})();
