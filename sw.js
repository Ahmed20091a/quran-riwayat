/* روايات — service worker: offline shell + cached surahs and audio */
var SHELL = 'quran-shell-v59';
var TEXT = 'quran-text-v7';
var TAF = 'quran-tafsir-v1';
var SHELL_FILES = [
  './', 'index.html', 'style.css', 'app.js',
  'fonts/amiri-arabic.woff2', 'fonts/cairo-arabic.woff2',
  'data/manifest.json', 'data/rw/manifest.json', 'rw.js', 'sebha.js', 'hisn.js', 'salah.js', 'clock.js', 'dl.js', 'nav.js', 'radio.js','fonts/scheherazade-arabic.woff2','ramadan.js','qibla.js', 'data/radio.json', 'data/hisn.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'data/pages.json', 'data/tajweed.json', 'data/taj-ex.json', 'data/taj-poem.json', 'manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(SHELL_FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  var keep = [SHELL, TEXT, TAF];
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n.indexOf('quran-shell-') === 0 && keep.indexOf(n) === -1; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  // surah text + audio: cache first, then network (and store for offline)
  if (url.pathname.indexOf('/data/surah/') !== -1 || url.pathname.indexOf('/data/rw/') !== -1 || url.pathname.indexOf('/audio/taj/') !== -1 || url.hostname === 'cdn.mp3quran.net') {
    e.respondWith(
      caches.open(TEXT).then(function (c) {
        return c.match(e.request).then(function (hit) {
          if (hit) return hit;
          return fetch(e.request).then(function (res) {
            if (res.ok) c.put(e.request, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // search index: cache first
  if (url.pathname.indexOf('data/search.txt') !== -1) {
    e.respondWith(
      caches.open(TAF).then(function (c) {
        return c.match(e.request).then(function (hit) {
          if (hit) return hit;
          return fetch(e.request).then(function (res) {
            if (res.ok) c.put(e.request, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // tafsir texts: cache first (they never change)
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.indexOf('/tafsir/') !== -1) {
    e.respondWith(
      caches.open(TAF).then(function (c) {
        return c.match(e.request).then(function (hit) {
          if (hit) return hit;
          return fetch(e.request).then(function (res) {
            if (res.ok) c.put(e.request, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // app shell: network first (so changes show up on the same link), cache as the offline fallback
  if (url.origin === location.origin && e.request.method === 'GET') {
    e.respondWith(
      new Promise(function (resolve) {
        var done = false;
        var timer = setTimeout(function () {
          caches.match(e.request).then(function (hit) { if (hit && !done) { done = true; resolve(hit); } });
        }, 4000);
        fetch(e.request, { cache: 'no-cache' }).then(function (res) {
          clearTimeout(timer);
          if (res.ok) {
            var copy = res.clone();
            caches.open(SHELL).then(function (c) { c.put(e.request, copy); });
          }
          if (!done) { done = true; resolve(res); }
        }).catch(function () {
          clearTimeout(timer);
          caches.match(e.request).then(function (hit) {
            if (!done) { done = true; resolve(hit || Response.error()); }
          });
        });
      })
    );
  }
});
