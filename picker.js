/* themed bottom-sheet picker that replaces every native <select> popup (the select itself stays, so values and change events work as before) */
(function () {
  'use strict';
  var ov = null, cur = null;
  function norm(s) { return String(s).replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase(); }
  function close() { if (!ov) return; ov.remove(); ov = null; if (cur) { try { cur.focus({ preventScroll: true }); } catch (e) {} } cur = null; document.documentElement.classList.remove('pk-open'); }
  function open(sel) {
    if (ov || sel.disabled || sel.multiple) return;
    cur = sel;
    var opts = Array.prototype.slice.call(sel.options).filter(function (o) { return !o.hidden; });
    ov = document.createElement('div'); ov.className = 'pk-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var sh = document.createElement('div'); sh.className = 'pk-sheet'; ov.appendChild(sh);
    var grip = document.createElement('div'); grip.className = 'pk-grip'; sh.appendChild(grip);
    var hd = document.createElement('div'); hd.className = 'pk-head';
    var ti = document.createElement('span'); ti.className = 'pk-title'; ti.textContent = sel.getAttribute('aria-label') || sel.title || 'اختر';
    var x = document.createElement('button'); x.type = 'button'; x.className = 'pk-x'; x.setAttribute('aria-label', 'إغلاق'); x.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
    x.addEventListener('click', close); hd.appendChild(ti); hd.appendChild(x); sh.appendChild(hd);
    var q = null;
    if (opts.length > 8) { q = document.createElement('input'); q.type = 'search'; q.className = 'pk-q'; q.placeholder = 'ابحث…'; q.setAttribute('aria-label', 'بحث في القائمة'); sh.appendChild(q); }
    var list = document.createElement('div'); list.className = 'pk-list'; list.setAttribute('role', 'listbox'); sh.appendChild(list);
    var rows = [], on = null;
    opts.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pk-row'; b.setAttribute('role', 'option'); b.disabled = o.disabled;
      var t = document.createElement('span'); t.className = 'pk-t'; t.textContent = o.textContent; b.appendChild(t);
      var c = document.createElement('span'); c.className = 'pk-c'; c.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; b.appendChild(c);
      if (o.selected) { b.classList.add('on'); b.setAttribute('aria-selected', 'true'); on = b; }
      b.addEventListener('click', function () {
        if (sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
        close();
      });
      list.appendChild(b); rows.push([b, norm(o.textContent)]);
    });
    if (q) q.addEventListener('input', function () { var k = norm(q.value.trim()); rows.forEach(function (r) { r[0].hidden = k && r[1].indexOf(k) === -1; }); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    document.body.appendChild(ov); document.documentElement.classList.add('pk-open');
    requestAnimationFrame(function () { ov && ov.classList.add('in'); if (on) on.scrollIntoView({ block: 'center' }); });
  }
  function hit(e) {
    var els = document.querySelectorAll('select'), px = e.clientX, py = e.clientY;
    for (var i = 0; i < els.length; i++) {
      var s = els[i]; if (s.disabled || s.multiple || s.closest('.pk-ov')) continue;
      var r = s.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
        var t = document.elementFromPoint(px, py); if (!t) continue;
        if (t === s || t.contains(s) || (s.parentElement && s.parentElement.contains(t) && !t.closest('button,a,input,textarea,select'))) return s;
      }
    }
    return null;
  }
  function arm() { document.querySelectorAll('select').forEach(function (s) { if (!s.multiple) s.classList.add('pk-sel'); }); }
  arm(); new MutationObserver(arm).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', function (e) { var s = hit(e); if (s) { e.preventDefault(); e.stopPropagation(); open(s); } }, true);
  document.addEventListener('keydown', function (e) {
    var s = e.target; if (s && s.tagName === 'SELECT' && !s.multiple && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); open(s); }
  }, true);
})();
