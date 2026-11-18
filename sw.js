/* Offline cache for GMA Assist. Bump CACHE when files change. */
const CACHE = 'gma-assist-v1.4.0';
const FILES = ['./', 'index.html', 'css/style.css', 'js/content.js', 'js/db.js', 'js/motion.js', 'js/app.js', 'js/training.js',
  'manifest.webmanifest', 'icons/logo-96.png', 'icons/logo-192.png', 'icons/logo-512.png', 'icons/favicon-64.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // Teaching-case videos: cache after first view (range requests are passed through).
  if (e.request.url.includes('/cases/')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c)); }
      return res;
    })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
