(function () {
  'use strict';
  var sec = document.getElementById('salah');
  if (!sec) return;
  var H = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', timeZone: 'UTC' });
  var C = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' });
  function daysLeft() {
    var p = C.format(new Date()).split('-');
    var t = Date.UTC(+p[0], +p[1] - 1, +p[2]);
    for (var i = 0; i <= 400; i++) {
      var parts = H.formatToParts(new Date(t + i * 864e5 + 12 * 36e5));
      var d = 0, m = 0;
      parts.forEach(function (x) { if (x.type === 'day') d = +x.value; if (x.type === 'month') m = +x.value; });
      if (m === 9 && d === 1) return i;
    }
    return null;
  }
  var n = daysLeft();
  if (n === null) return;
  var card = document.createElement('div');
  card.className = 'rm-card';
  var tx = document.createElement('div'); tx.className = 'rm-t';
  var num = document.createElement('div'); num.className = 'rm-n';
  var lb = document.createElement('div'); lb.className = 'rm-l';
  var note = document.createElement('div'); note.className = 'rm-s'; note.textContent = 'تقريبي حسب رؤية الهلال';
  if (n === 0) { num.textContent = '🌙'; lb.textContent = 'اليوم أول أيام رمضان'; }
  else { num.textContent = String(n); lb.textContent = n === 1 ? 'يوم واحد على رمضان' : (n === 2 ? 'يومان على رمضان' : (n <= 10 ? n + ' أيام على رمضان' : n + ' يومًا على رمضان')); num.textContent = String(n); }
  tx.appendChild(lb); tx.appendChild(note);
  card.appendChild(num); card.appendChild(tx);
  var head = sec.querySelector('.sec-head');
  head.parentNode.insertBefore(card, head.nextSibling);
})();
