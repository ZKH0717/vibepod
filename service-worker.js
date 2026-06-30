// 缓存应用外壳,离线可打开。导入的音频在 IndexedDB,不经此缓存。
const CACHE = 'ipod-shell-v2';
const SHELL = [
  './', './index.html', './manifest.json',
  './styles/ipod.css',
  './js/app.js', './js/store.js', './js/player.js', './js/wheel.js',
  './js/wheel-math.js', './js/screens.js', './js/ui.js', './js/colors.js',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon.svg',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
