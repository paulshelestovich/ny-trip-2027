const CACHE = 'ny-trip-2027-v1';
const SHELL = ['/ny-trip-2027/', '/ny-trip-2027/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached => {
      const net = fetch(request).then(res => {
        if (res.ok && new URL(request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return res;
      });
      if (cached) { net.catch(() => {}); return cached; }
      return net.catch(() => new Response('', { status: 503 }));
    })
  );
});
