const CACHE = 'gefaz360-v1';
const ASSETS = ['./', './index.html', './app.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^gefaz360-v\d+$/.test(k) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  const salvo = () => caches.open(CACHE).then(c => c.match(e.request));
  const guardar = r => {
    if (r && r.status === 200) {
      const copia = r.clone();
      e.waitUntil(caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {}));
    }
    return r;
  };
  // Rede primeiro (atualiza rápido); cache como fallback offline.
  e.respondWith(fetch(e.request).then(guardar).catch(() => salvo().then(c => c || (e.request.mode === 'navigate' ? caches.open(CACHE).then(cache => cache.match('./index.html')) : Response.error()))));
});
