/* روايات — service worker: offline shell + cached surahs and audio */
var SHELL = 'quran-shell-v3';
var TEXT = 'quran-text-v3';
var SHELL_FILES = [
  './', 'index.html', 'style.css', 'app.js',
  'fonts/amiri-arabic.woff2', 'fonts/cairo-arabic.woff2',
  'data/manifest.json', 'data/pages.json', 'manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(SHELL_FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  // surah text + audio: cache first, then network (and store for offline)
  if (url.pathname.indexOf('/data/surah/') !== -1 || url.hostname === 'cdn.mp3quran.net') {
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

  // app shell: cache first, refresh in background
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        var fresh = fetch(e.request).then(function (res) {
          if (res.ok) {
            caches.open(SHELL).then(function (c) { c.put(e.request, res.clone()); });
          }
          return res;
        }).catch(function () { return hit; });
        return hit || fresh;
      })
    );
  }
});
